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

                <div v-else class="inicio-indicators">
                    <div
                        v-for="(item, index) in indicators"
                        :key="item.label"
                        class="inicio-indicator"
                        :class="{ 'inicio-indicator--last': index === indicators.length - 1 }"
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
        fechaConsultaFormateada() {
            const fechaConsulta = this.indicadorCabecera && this.indicadorCabecera.fechaConsulta
            if (!fechaConsulta) {
                return ''
            }

            const fecha = new Date(fechaConsulta)
            if (Number.isNaN(fecha.getTime())) {
                return ''
            }

            return fecha.toLocaleString('es-PE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
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
    height: calc(100vh - 92px);
    min-height: 0;
    background-color: #ffffff;
    box-sizing: border-box;
    overflow: hidden;
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
    border-radius: 8px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    min-height: 118px;
    padding: 18px 28px;
    box-sizing: border-box;
}

.inicio-indicator {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 28px;
    border-right: 1px solid #d0d0d0;
}

.inicio-indicator--last {
    border-right: none;
}

.inicio-indicator-content {
    display: flex;
    align-items: center;
    gap: 20px;
}

.inicio-indicator-icon {
    width: 72px;
    height: 72px;
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

.inicio-indicator-label {
    color: #000000;
    font-size: 0.95rem;
    margin-top: 8px;
}

.inicio-indicator-hint {
    margin-top: 6px;
    color: #617187;
    font-size: 0.78rem;
}

@media (max-width: 1280px) {
    .inicio-content {
        padding-left: 32px;
        padding-right: 32px;
    }

    .inicio-indicators {
        padding-left: 16px;
        padding-right: 16px;
    }

    .inicio-indicator {
        padding-left: 18px;
        padding-right: 18px;
    }
}

@media (max-width: 1024px) {
    .inicio-page {
        height: auto;
        min-height: calc(100vh - 92px);
        overflow: visible;
    }

    .inicio-content {
        height: auto;
    }

    .inicio-indicators {
        flex-wrap: wrap;
        row-gap: 18px;
    }

    .inicio-indicator {
        flex-basis: 50%;
    }

    .inicio-indicator:nth-child(2) {
        border-right: none;
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
        flex-direction: column;
        gap: 12px;
        min-height: 0;
        padding: 18px 12px;
    }

    .inicio-indicator {
        border-right: none;
        border-bottom: 1px solid #e0e6ef;
        padding: 12px 4px;
    }

    .inicio-indicator--last {
        border-bottom: none;
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
