<template>
    <div class="q-pa-md">
        <div class="row q-col-gutter-md justify-start">
            <div class="col-12 col-sm-8 col-md-4 col-lg-3">
                <q-select
                    :value="anioSeleccionado"
                    :options="anios"
                    label="PERIODO"
                    option-label="anio"
                    option-value="id"
                    emit-value
                    map-options
                    outlined
                    dense
                    :loading="anioSeleccionado"
                    @input="$emit('update:anioSeleccionado', $event)"
                />
            </div>

            <div class="col-12 col-sm-8 col-md-5 col-lg-4">
                <q-input
                    :value="centroNombre"
                    label="ESPACIO DE INTERVENCIÓN"
                    outlined
                    dense
                    readonly
                    :disable="!puedeSeleccionarEspacioIntervencion"
                >
                    <template v-slot:append>
                        <q-btn
                            v-if="centroSeleccionado"
                            icon="close"
                            flat
                            round
                            dense
                            color="negative"
                            @click="$emit('limpiar-centro')"
                        />
                        <q-btn
                            icon="search"
                            flat
                            round
                            dense
                            color="primary"
                            :disable="!puedeSeleccionarEspacioIntervencion"
                            @click="$emit('seleccionar-centro')"
                        />
                    </template>
                </q-input>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FichaFilters',
    props: {
        anioSeleccionado: {
            default: null
        },
        anios: {
            type: Array,
            default: () => []
        },
        centroNombre: {
            type: String,
            default: ''
        },
        centroSeleccionado: {
            default: null
        },
        puedeSeleccionarEspacioIntervencion: {
            type: Boolean,
            default: false
        }
    }
};
</script>
