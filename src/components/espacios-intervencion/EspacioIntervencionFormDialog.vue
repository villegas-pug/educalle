<template>
    <q-dialog :value="value" persistent @input="actualizarVisibilidad">
        <q-card class="espacio-form-dialog">
            <q-card-section class="bg-header-dialog row items-center no-wrap">
                <div class="text-subtitle1 text-weight-bold">{{ titulo }}</div>
                <q-space />
                <q-badge v-if="modo === 'editar' && numeroRegistro" color="primary" class="q-mr-sm">N° {{ numeroRegistro }}</q-badge>
                <q-btn flat round dense icon="close" aria-label="Cerrar formulario" :disable="guardando" @click="cerrar" />
            </q-card-section>

            <q-form @submit.prevent="guardar">
                <q-card-section>
                    <q-banner v-if="errorGeneral" class="bg-red-1 text-negative q-mb-md" dense>
                        {{ errorGeneral }}
                    </q-banner>
                    <q-banner v-if="errorCatalogo" class="bg-amber-1 text-amber-10 q-mb-md" dense>
                        {{ errorCatalogo }}
                        <template v-slot:action>
                            <q-btn flat label="Reintentar" :disable="ocupado" @click="reintentarCatalogos" />
                        </template>
                    </q-banner>
                    <q-banner v-if="errorSedes" class="bg-amber-1 text-amber-10 q-mb-md" dense>
                        {{ errorSedes }}
                        <template v-slot:action>
                            <q-btn flat label="Reintentar sedes" :disable="ocupado" @click="cargarSedes" />
                        </template>
                    </q-banner>
                    <div v-if="ubicacionOriginal && !distrito && !hidratando" class="text-caption q-mb-md">
                        Ubigeo guardado: {{ ubicacionOriginal }}. {{ soloLectura ? 'La ubicación no está disponible en el catálogo.' : 'Seleccione una ubicación válida antes de guardar.' }}
                    </div>

                    <div class="row q-col-gutter-md">
                        <div class="col-12">
                            <q-select
                                :value="sedeSeleccionada || form.sede || null" :options="sedes"
                                option-label="catDescripcion" option-value="idCatalogo"
                                :display-value="form.sede || ''" label="Sede *"
                                outlined dense bottom-slots hide-bottom-space :clearable="!soloLectura"
                                :readonly="soloLectura" :disable="guardando || cargandoSedes"
                                :loading="cargandoSedes" :error="!!errores.sede" :error-message="errores.sede"
                                @input="cambiarSede"
                            />
                            <div v-if="!soloLectura && form.sede && !sedeSeleccionada && !cargandoSedes" class="text-caption q-mt-xs">
                                La sede guardada no está disponible. Seleccione una sede válida antes de guardar.
                            </div>
                        </div>
                        <div class="col-12">
                            <q-input
                                v-model="form.espNombre"
                                label="Nombre del espacio de intervención *"
                                outlined dense maxlength="150" bottom-slots hide-bottom-space
                                :readonly="soloLectura" :disable="guardando"
                                :error="!!errores.espNombre" :error-message="errores.espNombre"
                                @input="limpiarError('espNombre')"
                            />
                        </div>
                        <div class="col-12 col-sm-4">
                            <q-select
                                :value="departamento" :options="departamentos"
                                option-label="nombre" option-value="idUbigeo"
                                label="Departamento *" outlined dense clearable bottom-slots hide-bottom-space
                                :readonly="soloLectura" :disable="guardando || hidratando"
                                :loading="hidratando"
                                :error="!!errores.espUbigeo" :error-message="errores.espUbigeo"
                                @input="cambiarDepartamento"
                            />
                        </div>
                        <div class="col-12 col-sm-4">
                            <q-select
                                :value="provincia" :options="provincias"
                                option-label="nombre" option-value="idUbigeo"
                                label="Provincia *" outlined dense clearable bottom-slots hide-bottom-space
                                :readonly="soloLectura" :disable="guardando || hidratando || !departamento || cargandoProvincias"
                                :loading="cargandoProvincias"
                                @input="cambiarProvincia"
                            />
                        </div>
                        <div class="col-12 col-sm-4">
                            <q-select
                                :value="distrito" :options="distritos"
                                option-label="nombre" option-value="idUbigeo"
                                label="Distrito *" outlined dense clearable bottom-slots hide-bottom-space
                                :readonly="soloLectura" :disable="guardando || hidratando || !provincia || cargandoDistritos"
                                :loading="cargandoDistritos"
                                @input="cambiarDistrito"
                            />
                        </div>
                        <div class="col-12">
                            <q-input
                                v-model="form.espNombreResponsable"
                                label="Responsable" outlined dense maxlength="200" bottom-slots hide-bottom-space
                                :readonly="soloLectura" :disable="guardando"
                                :error="!!errores.espNombreResponsable" :error-message="errores.espNombreResponsable"
                                @input="limpiarError('espNombreResponsable')"
                            >
                                <template v-if="!soloLectura" v-slot:append>
                                    <q-btn flat round dense icon="search" aria-label="Buscar personal" :disable="ocupado" @click="abrirBuscadorPersonal" />
                                </template>
                            </q-input>
                        </div>
                    </div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn v-if="!soloLectura" type="submit" label="Guardar" icon="save" :loading="guardando" :disable="ocupado" />
                    <q-btn :label="soloLectura ? 'Cerrar' : 'Cancelar'" flat :disable="guardando" @click="cerrar" />
                </q-card-actions>
            </q-form>
            <personal-search-dialog
                v-if="buscadorPersonalAbierto && !soloLectura && value"
                @close="buscadorPersonalAbierto = false"
                @select="seleccionarResponsable"
            />
        </q-card>
    </q-dialog>
</template>

<script>
import { crearEspacioIntervencion, actualizarEspacioIntervencion, describirErrorEspacio, obtenerSedesEspacio } from 'src/services/espacios-intervencion.service';
import PersonalSearchDialog from './PersonalSearchDialog.vue';

export default {
    name: 'EspacioIntervencionFormDialog',
    components: { PersonalSearchDialog },
    props: {
        value: { type: Boolean, default: false },
        registro: { type: Object, default: null },
        modo: { type: String, default: 'nuevo' },
        numeroRegistro: { type: String, default: '' },
        catalogo: { type: Object, required: true }
    },
    data() {
        return {
            form: {
                sede: this.registro?.sede || '',
                espNombre: this.registro?.espNombre || '',
                espNombreResponsable: this.registro?.espNombreResponsable || ''
            },
            ubicacionOriginal: String(this.registro?.espUbigeo || ''),
            departamentos: [], provincias: [], distritos: [],
            sedes: [], cargandoSedes: true, errorSedes: '', revisionSedes: 0,
            departamento: null, provincia: null, distrito: null,
            errores: {}, errorGeneral: '', errorCatalogo: '',
            hidratando: true, cargandoProvincias: false, cargandoDistritos: false,
            guardando: false,
            buscadorPersonalAbierto: false,
            revisionUbicacion: 0,
            destruido: false
        };
    },
    computed: {
        soloLectura() { return this.modo === 'ver'; },
        titulo() {
            return this.soloLectura ? 'Consultar espacio de intervención'
                : this.modo === 'editar' ? 'Editar espacio de intervención' : 'Nuevo espacio de intervención';
        },
        ocupado() {
            return this.guardando || this.hidratando || this.cargandoProvincias || this.cargandoDistritos || this.cargandoSedes;
        },
        sedeSeleccionada() {
            return this.sedes.find(item => item.catDescripcion === this.form.sede) || null;
        }
    },
    mounted() {
        this.cargarUbicacionInicial();
        this.cargarSedes();
    },
    beforeDestroy() {
        this.destruido = true;
        this.revisionUbicacion++;
        this.revisionSedes++;
    },
    methods: {
        async cargarSedes() {
            if (this.guardando || this.destruido) return;
            const revision = ++this.revisionSedes;
            this.cargandoSedes = true;
            this.errorSedes = '';
            this.sedes = [];
            try {
                const sedes = await obtenerSedesEspacio(this.$axios);
                if (this.destruido || revision !== this.revisionSedes) return;
                this.sedes = sedes;
                if (!sedes.length) this.errorSedes = 'No hay sedes disponibles';
                if (!this.soloLectura) {
                    const texto = String(this.form.sede || '').trim().toUpperCase();
                    const seleccion = sedes.find(item => item.catDescripcion.trim().toUpperCase() === texto);
                    if (seleccion) this.form.sede = seleccion.catDescripcion;
                }
            } catch (error) {
                if (!this.destruido && revision === this.revisionSedes) this.errorSedes = describirErrorEspacio(error).message;
            } finally {
                if (!this.destruido && revision === this.revisionSedes) this.cargandoSedes = false;
            }
        },
        cambiarSede(value) {
            if (this.soloLectura || this.guardando || this.cargandoSedes) return;
            const seleccion = this.sedes.find(item => item.idCatalogo === value?.idCatalogo);
            this.form.sede = seleccion?.catDescripcion || '';
            this.limpiarError('sede');
        },
        abrirBuscadorPersonal() {
            if (this.soloLectura || this.ocupado) return;
            this.buscadorPersonalAbierto = true;
        },
        seleccionarResponsable(nombre) {
            if (this.soloLectura || this.ocupado) return;
            this.form.espNombreResponsable = nombre;
            this.limpiarError('espNombreResponsable');
            this.buscadorPersonalAbierto = false;
        },
        revisionVigente(revision) {
            return !this.destruido && revision === this.revisionUbicacion;
        },
        limpiarError(campo) {
            this.$delete(this.errores, campo);
            this.errorGeneral = '';
        },
        async cargarUbicacionInicial() {
            const revision = ++this.revisionUbicacion;
            this.hidratando = true;
            this.errorCatalogo = '';
            try {
                const departamentos = await this.catalogo.obtenerDepartamentos();
                if (!this.revisionVigente(revision)) return;
                this.departamentos = departamentos;
                if (!departamentos.length) this.errorCatalogo = 'No hay departamentos disponibles';
                if (!this.registro) return;
                const ubicacion = await this.catalogo.resolverUbigeo(this.registro);
                if (!this.revisionVigente(revision)) return;
                this.departamento = ubicacion.departamento;
                this.provincia = ubicacion.provincia;
                this.distrito = ubicacion.distrito;
                this.provincias = ubicacion.provincias;
                this.distritos = ubicacion.distritos;
                this.errorCatalogo = ubicacion.error;
            } catch (error) {
                if (this.revisionVigente(revision)) this.errorCatalogo = describirErrorEspacio(error).message;
            } finally {
                if (this.revisionVigente(revision)) this.hidratando = false;
            }
        },
        async cambiarDepartamento(value) {
            if (this.soloLectura || this.guardando || this.hidratando) return;
            const revision = ++this.revisionUbicacion;
            this.departamento = value;
            this.provincia = null;
            this.distrito = null;
            this.provincias = [];
            this.distritos = [];
            this.cargandoDistritos = false;
            this.errorCatalogo = '';
            this.limpiarError('espUbigeo');
            this.cargandoProvincias = !!value;
            if (!value) return;
            try {
                const opciones = await this.catalogo.obtenerProvincias(value.idUbigeo);
                if (!this.revisionVigente(revision)) return;
                this.provincias = opciones;
                if (!opciones.length) this.errorCatalogo = 'No hay provincias disponibles para el departamento seleccionado';
            } catch (error) {
                if (this.revisionVigente(revision)) this.errorCatalogo = describirErrorEspacio(error).message;
            } finally {
                if (this.revisionVigente(revision)) this.cargandoProvincias = false;
            }
        },
        async cambiarProvincia(value) {
            if (this.soloLectura || this.guardando || this.hidratando || this.cargandoProvincias) return;
            const revision = ++this.revisionUbicacion;
            this.provincia = value;
            this.distrito = null;
            this.distritos = [];
            this.errorCatalogo = '';
            this.limpiarError('espUbigeo');
            this.cargandoDistritos = !!value;
            if (!value) return;
            try {
                const opciones = await this.catalogo.obtenerDistritos(value.idUbigeo);
                if (!this.revisionVigente(revision)) return;
                this.distritos = opciones;
                if (!opciones.length) this.errorCatalogo = 'No hay distritos disponibles para la provincia seleccionada';
            } catch (error) {
                if (this.revisionVigente(revision)) this.errorCatalogo = describirErrorEspacio(error).message;
            } finally {
                if (this.revisionVigente(revision)) this.cargandoDistritos = false;
            }
        },
        cambiarDistrito(value) {
            if (this.soloLectura || this.ocupado) return;
            this.distrito = value;
            this.limpiarError('espUbigeo');
        },
        reintentarCatalogos() {
            if (this.ocupado) return;
            if (!this.soloLectura && this.provincia) this.cambiarProvincia(this.provincia);
            else if (!this.soloLectura && this.departamento) this.cambiarDepartamento(this.departamento);
            else this.cargarUbicacionInicial();
        },
        validar() {
            const errores = {};
            if (this.cargandoSedes || this.errorSedes || !this.sedeSeleccionada) errores.sede = 'Seleccione una sede válida';
            const nombre = String(this.form.espNombre || '').trim();
            const responsable = String(this.form.espNombreResponsable || '').trim();
            if (!nombre) errores.espNombre = 'Ingrese el nombre del espacio de intervención';
            else if (nombre.length > 150) errores.espNombre = 'El nombre admite hasta 150 caracteres';
            if (responsable.length > 200) errores.espNombreResponsable = 'El responsable admite hasta 200 caracteres';
            const ubigeo = this.distrito?.idUbigeo || '';
            if (!this.departamento || !this.provincia || !/^\d{6}$/.test(ubigeo)
                || !this.distritos.some(item => item.idUbigeo === ubigeo)
                || this.departamento.idDepartamento !== ubigeo.slice(0, 2)
                || this.provincia.idProvincia !== ubigeo.slice(2, 4)) {
                errores.espUbigeo = 'Seleccione departamento, provincia y distrito válidos';
            }
            this.errores = errores;
            return !Object.keys(errores).length;
        },
        async guardar() {
            if (this.soloLectura || this.ocupado || this.buscadorPersonalAbierto || !this.validar()) return;
            this.guardando = true;
            this.errorGeneral = '';
            const payload = {
                sede: this.sedeSeleccionada.catDescripcion,
                espNombre: this.form.espNombre,
                espNombreResponsable: this.form.espNombreResponsable,
                espUbigeo: this.distrito.idUbigeo
            };
            try {
                if (this.modo === 'editar') await actualizarEspacioIntervencion(this.$axios, this.registro.idEspInterv, payload);
                else await crearEspacioIntervencion(this.$axios, payload);
                if (!this.destruido) this.$emit('guardado');
            } catch (error) {
                if (this.destruido) return;
                const detalle = describirErrorEspacio(error);
                this.errores = detalle.fields;
                this.errorGeneral = detalle.message;
            } finally {
                if (!this.destruido) this.guardando = false;
            }
        },
        actualizarVisibilidad(value) { if (!value) this.cerrar(); },
        cerrar() {
            if (this.guardando) return;
            this.buscadorPersonalAbierto = false;
            this.$emit('input', false);
        }
    }
};
</script>

<style scoped>
.espacio-form-dialog {
    width: 760px;
    max-width: 95vw;
}

.espacio-form-dialog >>> .q-field {
    border: 0;
}
</style>
