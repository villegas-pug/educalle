<template>
    <q-dialog :value="true" persistent @input="actualizarVisibilidad">
        <q-card class="personal-search-dialog">
            <q-card-section class="bg-header-dialog row items-center no-wrap">
                <div class="text-subtitle1 text-weight-bold">Buscar personal</div>
                <q-space />
                <q-btn flat round dense icon="close" aria-label="Cerrar buscador" @click="cerrar" />
            </q-card-section>
            <q-card-section>
                <q-form @submit.prevent="buscar">
                    <div class="row q-col-gutter-md items-start">
                        <div class="col-12 col-sm-4">
                            <q-select
                                :value="tipoBusqueda" :options="tiposBusqueda" emit-value map-options
                                label="Buscar por" outlined dense @input="cambiarTipo"
                            />
                        </div>
                        <div class="col-12 col-sm-8">
                            <q-input
                                :value="dynamicValue" :label="tipoBusqueda === 1 ? 'Nro. documento' : 'Nombres'"
                                outlined dense bottom-slots hide-bottom-space
                                :error="!!errorCriterio" :error-message="errorCriterio"
                                @input="cambiarValor"
                            />
                        </div>
                        <div class="col-12 row justify-end">
                            <q-btn type="submit" label="Buscar" icon="search" :loading="cargando" :disable="cargando || cerrado" />
                        </div>
                    </div>
                </q-form>
                <q-banner v-if="errorBusqueda" class="bg-red-1 text-negative q-mt-md" dense>
                    {{ errorBusqueda }}
                    <template v-slot:action>
                        <q-btn flat label="Reintentar" :disable="cargando || cerrado" @click="buscar" />
                    </template>
                </q-banner>
                <q-table
                    v-if="busquedaRealizada || cargando"
                    class="q-mt-md tabla-cabecera-fija" :data="resultados" :columns="columnas"
                    row-key="idPersonal" :loading="cargando" :rows-per-page-options="[5, 10, 20]"
                    table-header-class="bg-inabif text-bold" dense flat bordered
                    no-data-label="No se encontró personal"
                >
                    <template v-slot:body-cell-accion="props">
                        <q-td :props="props">
                            <q-btn
                                label="Seleccionar" size="sm" class="btn-inabif"
                                :disable="cargando || cerrado || !tieneNombre(props.row)"
                                @click="seleccionar(props.row)"
                            />
                        </q-td>
                    </template>
                </q-table>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="Cancelar" @click="cerrar" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import { buscarPersonalEspacio, describirErrorEspacio } from 'src/services/espacios-intervencion.service';

export default {
    name: 'PersonalSearchDialog',
    data() {
        return {
            tipoBusqueda: 1,
            dynamicValue: '',
            tiposBusqueda: [{ label: 'Nro. documento', value: 1 }, { label: 'Nombres', value: 2 }],
            columnas: [
                { name: 'numeroDoc', label: 'NRO. DOCUMENTO', field: 'numeroDoc', align: 'left' },
                { name: 'nombres', label: 'NOMBRES', field: 'nombres', align: 'left' },
                { name: 'accion', label: 'SELECCIONAR', field: 'idPersonal', align: 'center' }
            ],
            resultados: [],
            errorCriterio: '',
            errorBusqueda: '',
            cargando: false,
            busquedaRealizada: false,
            revisionBusqueda: 0,
            cerrado: false
        };
    },
    beforeDestroy() {
        this.cerrado = true;
        this.revisionBusqueda++;
    },
    methods: {
        actualizarVisibilidad(value) {
            if (!value) this.cerrar();
        },
        invalidarBusqueda() {
            this.revisionBusqueda++;
            this.resultados = [];
            this.errorCriterio = '';
            this.errorBusqueda = '';
            this.cargando = false;
            this.busquedaRealizada = false;
        },
        cambiarTipo(value) {
            this.tipoBusqueda = value;
            this.invalidarBusqueda();
        },
        cambiarValor(value) {
            this.dynamicValue = value;
            this.invalidarBusqueda();
        },
        revisionVigente(revision) {
            return !this.cerrado && revision === this.revisionBusqueda;
        },
        async buscar() {
            if (this.cargando || this.cerrado) return;
            this.invalidarBusqueda();
            const valor = String(this.dynamicValue || '').trim();
            if (!valor) {
                this.errorCriterio = 'Ingrese un texto para buscar';
                return;
            }
            const revision = this.revisionBusqueda;
            this.cargando = true;
            try {
                const resultados = await buscarPersonalEspacio(this.$axios, this.tipoBusqueda, valor);
                if (!this.revisionVigente(revision)) return;
                this.resultados = resultados;
                this.busquedaRealizada = true;
            } catch (error) {
                if (this.revisionVigente(revision)) this.errorBusqueda = describirErrorEspacio(error).message;
            } finally {
                if (this.revisionVigente(revision)) this.cargando = false;
            }
        },
        tieneNombre(personal) {
            return typeof personal?.nombres === 'string' && !!personal.nombres.trim();
        },
        seleccionar(personal) {
            if (this.cargando || this.cerrado || !this.tieneNombre(personal)) return;
            this.cerrado = true;
            this.revisionBusqueda++;
            this.$emit('select', personal.nombres);
        },
        cerrar() {
            this.cerrado = true;
            this.revisionBusqueda++;
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
.personal-search-dialog {
    width: 800px;
    max-width: 95vw;
}
</style>
