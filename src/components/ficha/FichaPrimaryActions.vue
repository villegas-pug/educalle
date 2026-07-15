<template>
    <div class="row">
        <div class="col-12 q-gutter-sm text-right q-mt-sm q-mb-md ficha-acciones-principales">
            <q-btn
                v-if="mostrarResetear"
                label="RESETEAR FILTROS"
                color="grey-5"
                text-color="white"
                icon-right="restart_alt"
                class="btn-seccion-acciones ficha-accion-principal"
                size="sm"
                @click="$emit('resetear')"
            />
            <q-btn
                v-if="mostrarNuevo"
                label="NUEVO"
                icon="add"
                class="btn-inabif ficha-accion-principal"
                size="sm"
                :disable="!puedeIntentarNuevo"
                @click="$emit('nuevo')"
            />
            <q-btn
                v-if="mostrarExcel"
                label="EXCEL"
                icon="download"
                color="green"
                class="btn-seccion-acciones ficha-accion-principal"
                size="sm"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: 'FichaPrimaryActions',
    props: {
        mostrarResetear: {
            type: Boolean,
            default: true
        },
        mostrarNuevo: {
            type: Boolean,
            default: true
        },
        mostrarExcel: {
            type: Boolean,
            default: true
        },
        puedeIntentarNuevo: {
            type: Boolean,
            default: false
        }
    }
};
</script>
