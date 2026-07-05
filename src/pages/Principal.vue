<template>
    <q-page class="inicio-page">
        <div class="inicio-content">
            <div class="inicio-title">
                <h1 class="inicio-title-text">
                    SISTEMA DEL SERVICIO DE EDUCADORES DE CALLE
                    <span class="inicio-title-text--accent">(SISEC)</span>
                </h1>
                <div class="inicio-title-bar"></div>
            </div>

            <div class="inicio-hero">
                <img class="inicio-hero-img" :src="banner" alt="Banner de inicio" />
            </div>

            <div class="inicio-indicators-wrapper">
                <div v-if="loadingIndicadores" class="inicio-loading">
                    <q-spinner color="primary" size="36px" />
                </div>

                <div v-else>
                    <div v-if="!hasIndicadoresData" class="inicio-indicators-status">
                        No se encontraron indicadores actualizados. Se muestran valores en cero.
                    </div>

                    <div class="inicio-indicators">
                        <div
                            v-for="item in indicators"
                            :key="item.label"
                            class="inicio-indicator"
                        >
                            <div class="inicio-indicator-content">
                                <div class="inicio-indicator-icon" :class="`inicio-indicator-icon--${item.color}`">
                                    <q-icon :name="item.icon" />
                                </div>
                                <div class="inicio-indicator-text">
                                    <div class="inicio-indicator-value">{{ item.value }}</div>
                                    <div class="inicio-indicator-label">{{ item.label }}</div>
                                    <div v-if="item.hint" class="inicio-indicator-hint">{{ item.hint }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script>
export default {
    name: 'Principal',
    data() {
        return {
            banner: 'imgs/home/banner.png',
            loadingIndicadores: false,
            indicadorCabecera: null,
            indicators: [
                { value: '0', label: 'Educadores activos', icon: 'groups', color: 'blue', hint: '' },
                { value: '0', label: 'Intervenciones hoy', icon: 'today', color: 'green', hint: '' },
                { value: '0', label: 'Registros este mes', icon: 'assignment', color: 'purple', hint: '' },
                { value: '0%', label: 'Meta mensual', icon: 'trending_up', color: 'red', hint: '0 de 0 registros' }
            ]
        }
    },
    computed: {
        hasIndicadoresData() {
            return !!this.indicadorCabecera
        }
    },
    created() {
        this.cargarIndicadores()
    },
    methods: {
        async cargarIndicadores() {
            this.loadingIndicadores = true

            try {
                const { data } = await this.$axios.get(
                    `${process.env.API_URL}/reporte/indicadores-anexos-cabecera`
                )

                const filas = Array.isArray(data)
                    ? data
                    : Array.isArray(data && data.data)
                        ? data.data
                        : []

                const indicador = filas[0] || null
                this.indicadorCabecera = indicador
                this.indicators = this.mapearIndicadores(indicador)

                if (!indicador) {
                    this.$q.notify({
                        type: 'warning',
                        message: 'No se encontraron indicadores para mostrar en Inicio'
                    })
                }
            } catch (error) {
                this.indicadorCabecera = null
                this.indicators = this.mapearIndicadores(null)
                this.$q.notify({
                    type: 'negative',
                    message: 'Error al cargar los indicadores de Inicio'
                })
            } finally {
                this.loadingIndicadores = false
            }
        },
        mapearIndicadores(indicador) {
            const educadoresActivos = this.toNumber(indicador && indicador.educadoresActivos)
            const intervencionesHoy = this.toNumber(indicador && indicador.intervencionesHoy)
            const registrosEsteMes = this.toNumber(indicador && indicador.registrosEsteMes)
            const metaMensualValor = this.toNumber(indicador && indicador.metaMensualValor)
            const metaMensualPorcentaje = this.toNumber(indicador && indicador.metaMensualPorcentaje)

            return [
                {
                    value: this.formatInteger(educadoresActivos),
                    label: 'Educadores activos',
                    icon: 'groups',
                    color: 'blue',
                    hint: ''
                },
                {
                    value: this.formatInteger(intervencionesHoy),
                    label: 'Intervenciones hoy',
                    icon: 'today',
                    color: 'green',
                    hint: ''
                },
                {
                    value: this.formatInteger(registrosEsteMes),
                    label: 'Registros este mes',
                    icon: 'assignment',
                    color: 'purple',
                    hint: ''
                },
                {
                    value: `${this.formatPercent(metaMensualPorcentaje)}%`,
                    label: 'Meta mensual',
                    icon: 'trending_up',
                    color: 'red',
                    hint: `${this.formatInteger(registrosEsteMes)} de ${this.formatInteger(metaMensualValor)} registros`
                }
            ]
        },
        toNumber(value) {
            const numberValue = Number(value)
            return Number.isFinite(numberValue) ? numberValue : 0
        },
        formatInteger(value) {
            return new Intl.NumberFormat('es-PE', {
                maximumFractionDigits: 0
            }).format(this.toNumber(value))
        },
        formatPercent(value) {
            return new Intl.NumberFormat('es-PE', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1
            }).format(this.toNumber(value) * 100)
        }
    }
}
</script>

<style scoped>
.inicio-page {
    min-height: calc(100vh - 92px);
    background-color: #ffffff;
    box-sizing: border-box;
    overflow: visible;
    padding: 10px 14px 8px;
}

.inicio-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #d9e0e8;
    border-radius: 2px;
    box-sizing: border-box;
    padding: 24px 34px 18px;
}

.inicio-title {
    width: 100%;
    text-align: center;
    margin-bottom: 24px;
}

.inicio-title-text {
    margin: 0;
    color: #143d8c;
    font-size: 2.05rem;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.inicio-title-text--accent {
    color: #d8282f;
    display: inline;
}

.inicio-title-bar {
    width: 184px;
    height: 10px;
    margin: 18px auto 0;
    border-radius: 999px;
    background-color: #1d4fa0;
}

.inicio-hero {
    width: 100%;
    background-color: #dbe8f8;
    border-radius: 30px;
    overflow: hidden;
    margin-bottom: 16px;
    box-shadow: 0 14px 32px rgba(20, 58, 120, 0.08);
    line-height: 0;
}

.inicio-hero-img {
    width: 100%;
    height: auto;
    display: block;
}

.inicio-indicators-wrapper {
    width: 100%;
    min-height: 118px;
}

.inicio-indicators-status {
    margin-bottom: 12px;
    padding: 10px 14px;
    border: 1px solid #f5d9a6;
    border-radius: 10px;
    background-color: #fff8e8;
    color: #8a5a00;
    font-size: 0.84rem;
    line-height: 1.4;
}

.inicio-loading {
    min-height: 118px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #c8c8c8;
    border-radius: 8px;
}

.inicio-indicators {
    width: 100%;
    background-color: #ffffff;
    border: 1px solid #c8c8c8;
    border-radius: 16px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    min-height: 118px;
    padding: 20px;
    box-sizing: border-box;
}

.inicio-indicator {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 18px 16px;
    border: 1px solid #e4ebf3;
    border-radius: 18px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.inicio-indicator-content {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
    width: 100%;
}

.inicio-indicator-icon {
    width: 72px;
    height: 72px;
    min-width: 72px;
    min-height: 72px;
    flex-shrink: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
}

.inicio-indicator-icon--blue {
    background-color: #dce8fb;
    color: #2f65d9;
}

.inicio-indicator-icon--red {
    background-color: #ffe0e2;
    color: #ed1c24;
}

.inicio-indicator-icon--green {
    background-color: #ddf3e2;
    color: #3ca36f;
}

.inicio-indicator-icon--purple {
    background-color: #eadff8;
    color: #8756d9;
}

.inicio-indicator-value {
    color: #000000;
    font-size: 1.9rem;
    font-weight: bold;
    line-height: 1.1;
}

.inicio-indicator-text {
    min-width: 0;
}

.inicio-indicator-label {
    color: #000000;
    font-size: 0.95rem;
    margin-top: 8px;
    line-height: 1.45;
}

.inicio-indicator-hint {
    margin-top: 6px;
    color: #617187;
    font-size: 0.78rem;
    line-height: 1.4;
}

@media (max-width: 1280px) {
    .inicio-content {
        padding-left: 32px;
        padding-right: 32px;
    }

    .inicio-indicators {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        padding: 16px;
    }

    .inicio-indicator {
        padding: 16px 14px;
    }
}

@media (max-width: 1024px) {
    .inicio-page {
        height: auto;
    }

    .inicio-content {
        height: auto;
    }

    .inicio-title-text {
        font-size: 1.7rem;
    }

    .inicio-indicator-content {
        gap: 14px;
    }

    .inicio-indicator-icon {
        width: 64px;
        height: 64px;
        min-width: 64px;
        min-height: 64px;
        font-size: 30px;
    }

    .inicio-indicator-value {
        font-size: 1.65rem;
    }
}

@media (max-width: 768px) {
    .inicio-content {
        padding: 18px 18px 24px;
    }

    .inicio-title-text {
        font-size: 1.35rem;
    }

    .inicio-title-bar {
        width: 116px;
        height: 6px;
        margin-top: 16px;
    }

    .inicio-hero {
        border-radius: 22px;
    }

    .inicio-indicators {
        grid-template-columns: 1fr;
        gap: 12px;
        min-height: 0;
        padding: 18px 12px;
    }

    .inicio-indicator {
        padding: 14px 12px;
    }

    .inicio-indicator-value {
        font-size: 1.6rem;
    }

    .inicio-indicator-icon {
        width: 64px;
        height: 64px;
        font-size: 30px;
    }
}
</style>
