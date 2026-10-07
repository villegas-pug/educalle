<template>
    <q-page class="q-pa-md">
        <h1 class="text-h6 q-mt-none">Gestión de espacios de intervención</h1>
        <div class="row justify-end q-gutter-sm q-mb-md">
            <q-btn label="Nuevo espacio" icon="add" :disable="ocupado" @click="crear" />
            <q-btn label="Actualizar" icon="refresh" :loading="cargando" :disable="ocupado" @click="actualizar" />
        </div>
        <q-banner v-if="errorListado" class="bg-red-1 text-negative q-mb-md" dense>
            {{ errorListado }}. Puede reintentar con Actualizar.
        </q-banner>
        <q-table
            class="tabla-cabecera-fija" :data="filas" :columns="columnas"
            row-key="idEspInterv" :filter="busqueda" :pagination.sync="paginacion"
            :rows-per-page-options="[10, 20, 50, 0]" :loading="cargando"
            no-data-label="No hay espacios de intervención" no-results-label="No hay coincidencias"
        >
            <template v-slot:top-right>
                <q-input v-model="busqueda" dense outlined debounce="300" placeholder="Buscar..." aria-label="Buscar espacios de intervención">
                    <template v-slot:append><q-icon name="search" /></template>
                </q-input>
            </template>
            <template v-slot:body-cell-correlativo="props">
                <q-td :props="props">{{ correlativo(props.pageIndex) }}</q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                    <q-btn flat round dense icon="visibility" aria-label="Ver espacio" :disable="ocupado" @click="abrirDetalle(props.row.idEspInterv, 'ver')">
                        <q-tooltip>Ver</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="edit" aria-label="Editar espacio" :disable="ocupado" @click="abrirDetalle(props.row.idEspInterv, 'editar')">
                        <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                </q-td>
            </template>
        </q-table>
        <espacio-intervencion-form-dialog
            v-if="dialogoAbierto" v-model="dialogoAbierto" :registro="registro"
            :modo="modoFormulario" :catalogo="catalogo" @guardado="trasGuardar"
        />
    </q-page>
</template>

<script>
import EspacioIntervencionFormDialog from 'src/components/espacios-intervencion/EspacioIntervencionFormDialog.vue';
import { crearCatalogoEspaciosUbigeo, listarEspaciosIntervencion, obtenerEspacioIntervencion, describirErrorEspacio } from 'src/services/espacios-intervencion.service';

function formatearNombreGeografico(value) {
    return typeof value === 'string' && value.trim() ? value : '-';
}

export default {
    name: 'EspaciosIntervencion',
    components: { EspacioIntervencionFormDialog },
    data() {
        return {
            catalogo: crearCatalogoEspaciosUbigeo(this.$axios),
            filas: [], busqueda: '',
            paginacion: { sortBy: 'espNombre', descending: false, page: 1, rowsPerPage: 10 },
            columnas: [
                { name: 'correlativo', label: 'N°', field: () => '', align: 'center' },
                { name: 'espNombre', label: 'Nombre', field: 'espNombre', align: 'left', sortable: true },
                { name: 'departamento', label: 'Departamento', field: 'departamento', format: formatearNombreGeografico, align: 'left', sortable: true },
                { name: 'provincia', label: 'Provincia', field: 'provincia', format: formatearNombreGeografico, align: 'left', sortable: true },
                { name: 'distrito', label: 'Distrito', field: 'distrito', format: formatearNombreGeografico, align: 'left', sortable: true },
                { name: 'espNombreResponsable', label: 'Responsable', field: 'espNombreResponsable', format: value => value || '—', align: 'left', sortable: true },
                { name: 'acciones', label: 'Acciones', field: () => '', align: 'center' }
            ],
            cargando: false, consultando: false, dialogoAbierto: false,
            modoFormulario: 'nuevo', registro: null,
            errorListado: '',
            revisionCarga: 0, destruido: false
        };
    },
    computed: {
        ocupado() { return this.cargando || this.consultando || this.dialogoAbierto; }
    },
    mounted() { this.cargarListado(); },
    beforeDestroy() {
        this.destruido = true;
        this.revisionCarga++;
    },
    methods: {
        correlativo(indicePagina) {
            const inicio = this.paginacion.rowsPerPage ? (this.paginacion.page - 1) * this.paginacion.rowsPerPage : 0;
            return String(inicio + indicePagina + 1).padStart(5, '0');
        },
        revisionVigente(revision) { return !this.destruido && this.revisionCarga === revision; },
        async cargarListado() {
            const revision = ++this.revisionCarga;
            this.cargando = true;
            this.errorListado = '';
            try {
                const registros = await listarEspaciosIntervencion(this.$axios);
                if (!this.revisionVigente(revision)) return false;
                this.filas = registros;
                this.paginacion.page = 1;
                return true;
            } catch (error) {
                if (this.revisionVigente(revision)) this.errorListado = describirErrorEspacio(error).message;
                return false;
            } finally {
                if (this.revisionVigente(revision)) this.cargando = false;
            }
        },
        actualizar() {
            if (this.ocupado) return;
            this.catalogo.reiniciar();
            this.cargarListado();
        },
        crear() {
            if (this.ocupado) return;
            this.registro = null;
            this.modoFormulario = 'nuevo';
            this.dialogoAbierto = true;
        },
        async abrirDetalle(idEspInterv, modo) {
            if (this.ocupado) return;
            this.consultando = true;
            try {
                const registro = await obtenerEspacioIntervencion(this.$axios, idEspInterv);
                if (this.destruido) return;
                this.registro = registro;
                this.modoFormulario = modo;
                this.dialogoAbierto = true;
            } catch (error) {
                if (!this.destruido) this.$q.notify({ type: 'negative', message: describirErrorEspacio(error).message });
            } finally {
                if (!this.destruido) this.consultando = false;
            }
        },
        async trasGuardar() {
            this.dialogoAbierto = false;
            this.registro = null;
            this.$q.notify({ type: 'positive', message: 'Espacio de intervención guardado correctamente' });
            const actualizado = await this.cargarListado();
            if (!actualizado && !this.destruido) {
                this.$q.notify({ type: 'warning', message: 'El guardado se completó, pero no se pudo actualizar la tabla. Presione Actualizar; no vuelva a guardar.' });
            }
        }
    }
};
</script>
