<template>
    <q-dialog :value="value" persistent @input="$emit('input', $event)">
        <q-card style="width:800px; max-width:100vw">
            <q-card-section class="bg-header-dialog">
                <span style="float: right;">
                    <q-btn icon="close" v-close-popup flat round size="sm"></q-btn>
                </span>

                <div class="text-body2 text-bold">SELECCIONAR CENTRO</div>
            </q-card-section>

            <q-card-section>
                <q-table
                    :data="centros"
                    :columns="columns"
                    row-key="idUnidadOrganica"
                    table-header-class="bg-inabif text-bold"
                    dense
                    flat
                    bordered
                    :loading="loading"
                    :filter="filtroCentros"
                    :rows-per-page-options="[5, 10, 20, 50]"
                >
                    <template v-slot:top-right>
                        <q-input dense outlined debounce="300" v-model="filtroCentros" placeholder="Buscar centro..." clearable>
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </template>

                    <template v-slot:body-cell-accion="props">
                        <q-td :props="props">
                            <q-btn label="Seleccionar" class="btn-inabif" size="sm" @click="$emit('select', props.row)" />
                        </q-td>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'FichaCenterSelectorDialog',

    props: {
        value: {
            type: Boolean,
            default: false
        },
        centros: {
            type: Array,
            default: () => []
        },
        columns: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            filtroCentros: ''
        };
    }
};
</script>
