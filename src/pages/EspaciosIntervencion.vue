<template>
    <q-page class="q-pa-md">
        <h1 class="text-h6 text-weight-bold text-center q-mt-none">GESTIÓN DE ESPACIOS DE INTERVENCIÓN</h1>
        <div class="row justify-end q-gutter-sm q-mb-md">
            <q-btn label="Nuevo espacio" icon="add" size="sm" class="btn-inabif espacios-accion-principal" :disable="ocupado" @click="crear" />
            <q-btn label="Actualizar" icon="refresh" size="sm" class="btn-seccion-acciones espacios-accion-principal" color="grey-5" text-color="white" :loading="cargando" :disable="ocupado" @click="actualizar" />
        </div>
        <q-banner v-if="errorListado" class="bg-red-1 text-negative q-mb-md" dense>
            {{ errorListado }}. Puede reintentar con Actualizar.
        </q-banner>
        <q-table
            class="tabla-cabecera-fija espacios-tabla" :data="filas" :columns="columnas"
            row-key="idEspInterv" :filter="busqueda" :pagination.sync="paginacion"
            :rows-per-page-options="[10, 20, 50, 0]" :loading="cargando"
            table-header-class="bg-inabif text-bold" dense flat bordered
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
                    <q-btn-dropdown dropdown-icon="settings" dense :disable="ocupado" :aria-label="'Acciones de ' + props.row.espNombre">
                        <q-list class="espacios-menu-acciones">
                            <q-item clickable v-close-popup :disable="ocupado" class="espacios-menu-accion" @click="abrirDetalle(props.row.idEspInterv, 'editar', correlativo(props.pageIndex))">
                                <q-item-section avatar><q-avatar icon="edit" size="32px" font-size="16px" color="warning" text-color="white" /></q-item-section>
                                <q-item-section class="espacios-menu-label">Editar espacio</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup :disable="ocupado" class="espacios-menu-accion" @click="abrirDetalle(props.row.idEspInterv, 'ver')">
                                <q-item-section avatar><q-avatar icon="visibility" size="32px" font-size="16px" color="primary" text-color="white" /></q-item-section>
                                <q-item-section class="espacios-menu-label">Ver espacio</q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </q-td>
            </template>
        </q-table>
        <espacio-intervencion-form-dialog
            v-if="dialogoAbierto" :value="dialogoAbierto" :registro="registro"
            :modo="modoFormulario" :catalogo="catalogo" :numero-registro="numeroRegistro"
            @input="actualizarDialogo" @guardado="trasGuardar"
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
            paginacion: { sortBy: 'espNombre', descending: false, page: 1, rowsPerPage: 20 },
            columnas: [
                { name: 'correlativo', label: 'N°', field: () => '', align: 'center' },
                { name: 'espNombre', label: 'NOMBRE', field: 'espNombre', align: 'left', sortable: true },
                { name: 'departamento', label: 'DEPARTAMENTO', field: 'departamento', format: formatearNombreGeografico, align: 'left', sortable: true },
                { name: 'provincia', label: 'PROVINCIA', field: 'provincia', format: formatearNombreGeografico, align: 'left', sortable: true },
                { name: 'distrito', label: 'DISTRITO', field: 'distrito', format: formatearNombreGeografico, align: 'left', sortable: true },
                { name: 'espNombreResponsable', label: 'RESPONSABLE', field: 'espNombreResponsable', format: value => value || '—', align: 'left', sortable: true },
                { name: 'acciones', label: 'ACCIONES', field: () => '', align: 'center', style: 'width: 80px; min-width: 80px; max-width: 80px;' }
            ],
            cargando: false, consultando: false, dialogoAbierto: false,
            modoFormulario: 'nuevo', registro: null, numeroRegistro: '',
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
            this.numeroRegistro = '';
            this.modoFormulario = 'nuevo';
            this.dialogoAbierto = true;
        },
        actualizarDialogo(value) {
            this.dialogoAbierto = value;
            if (!value) this.numeroRegistro = '';
        },
        async abrirDetalle(idEspInterv, modo, numeroRegistro = '') {
            if (this.ocupado) return;
            this.consultando = true;
            this.numeroRegistro = '';
            try {
                const registro = await obtenerEspacioIntervencion(this.$axios, idEspInterv);
                if (this.destruido) return;
                this.registro = registro;
                this.modoFormulario = modo;
                this.numeroRegistro = modo === 'editar' ? numeroRegistro : '';
                this.dialogoAbierto = true;
            } catch (error) {
                if (!this.destruido) this.$q.notify({ type: 'negative', message: describirErrorEspacio(error).message });
            } finally {
                if (!this.destruido) this.consultando = false;
            }
        },
        async trasGuardar() {
            this.actualizarDialogo(false);
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

<style scoped>
.espacios-tabla {
    height: calc(100vh - 230px);
    min-height: 320px;
    max-height: none;
}

.espacios-accion-principal {
    min-width: 0;
}

.espacios-menu-acciones {
    min-width: 220px;
    max-width: 280px;
    border: 1px solid #e6edf5;
    border-radius: 10px;
    box-shadow: 0 8px 18px rgba(15, 35, 60, 0.18);
    overflow: hidden;
    background: #fff;
}

.espacios-menu-accion {
    min-height: 48px;
    padding: 6px 10px;
    align-items: center;
    transition: background-color 0.18s ease;
}

.espacios-menu-accion:hover {
    background: #f4f8ff;
}

.espacios-menu-accion >>> .q-avatar {
    width: 32px;
    height: 32px;
}

.espacios-menu-label {
    min-width: 0;
    font-weight: 600;
    letter-spacing: 0.2px;
    color: #1f2d3d;
}

@media (max-width: 599px) {
    .espacios-menu-acciones {
        min-width: 196px;
        max-width: 92vw;
    }

    .espacios-menu-accion {
        min-height: 44px;
        padding: 6px 8px;
    }
}
</style>
