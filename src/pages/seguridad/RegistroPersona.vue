<template>
  <q-page class="q-pa-sm">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-center">
        <span class="text-h6 text-bold">GESTIÓN DE USUARIOS</span>
      </div>
      <!--<div class="col-12 row q-col-gutter-sm">
        <div class="col-12 col-sm-1">
          <q-select label="Año" v-model="anioBusqueda" :options="anios" dense outlined></q-select>
        </div>
        <div class="col-12 col-sm-2">
          <q-select label="Mes" v-model="mesBusqueda" :options="meses" emit-value map-options option-value="id" option-label="descripcion" dense outlined></q-select>
        </div>
        <div class="col-12 col-sm-2">
          <q-select label="Estado" v-model="estadoBusqueda" :options="opcionesEstadoEvaluacion" emit-value map-options option-value="id" option-label="descripcion" dense outlined></q-select>
        </div>
        <div class="col-12 col-sm-3">
          <q-select label="Criterio de búsqueda" v-model="criterioBusqueda" :options="opcionesCriterioBusqueda" @input="eventoSeleccionCriterioBusqueda" emit-value map-options option-value="id" option-label="descripcion" dense outlined></q-select>
        </div>
        <div class="col-12 col-sm-3">
          <q-input label="Texto a buscar" v-model="textoBusquedaTickets" :disable="criterioBusqueda===0" dense outlined></q-input>
        </div>
        <div class="col-12 col-sm-1">
          <q-btn label="CONSULTAR" icon="refresh" class="btn-buscar" @click="eventoBtnBuscar" :loading="cargandoTickets" size="sm"></q-btn>
        </div>
      </div>-->
      <div class="col-12 q-gutter-sm text-right">
        <!--<q-btn label="EXCEL" color="green" icon="download" @click="eventoBtnDescargarExcel" :disable="tickets.length===0" class="btn-seccion-acciones" size="sm"></q-btn>-->
        <q-btn label="NUEVO USUARIO" @click="eventoBtnNuevoUsuario" icon="add" color="green" size="sm"></q-btn>
      </div>
      <div class="col-12">
        <q-table
          :data="personas"
          :columns="columnasTablaPersona"
          table-header-class="bg-inabif text-bold"
          :rows-per-page-options="opcionesFilasPorPagina"
          :loading="cargandoPersonas"
          :filter="textoFiltroPersonas"
          dense>
          <template v-slot:top-right>
            <q-input borderless v-model="textoFiltroPersonas" placeholder="Buscar" outlined dense>
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:body-cell-opciones="scope">
            <q-td :props="scope">
              <div class="q-gutter-sm">
                <q-btn-dropdown size="sm" dropdown-icon="settings" class="q-mr-xs acciones" no-icon-animation>
                  <q-list>
                    <q-item clickable v-close-popup>
                      <q-item-section avatar>
                        <q-avatar icon="search" color="red" text-color="white" />
                      </q-item-section>
                      <q-item-section>
                        Consultar persona
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup>
                      <q-item-section avatar>
                        <q-avatar icon="edit" text-color="white" />
                      </q-item-section>
                      <q-item-section>
                        <span>Actualizar persona</span>
                      </q-item-section>
                    </q-item>
                    <!--<q-item>
                      <q-item-section avatar>
                        <q-avatar icon="delete" color="grey" text-color="white" />
                      </q-item-section>
                      <q-item-section>
                        Eliminar solicitud
                      </q-item-section>
                    </q-item>

                    <q-separator v-if="scope.row.estado===1 && $q.localStorage.getItem('mda-idPerfil')===1349" inset/>

                    <q-item v-if="[1,2].includes(scope.row.estado) && $q.localStorage.getItem('mda-idPerfil')===1349" @click="eventoOpcReasignarTicket(scope.row)" clickable v-close-popup>
                      <q-item-section avatar>
                        <q-avatar icon="reply" color="red" text-color="white" class="flip-horizontal" />
                      </q-item-section>
                      <q-item-section>
                        Reasignar ticket
                      </q-item-section>
                    </q-item>

                    <q-item v-if="[1,2].includes(scope.row.estado) && $q.localStorage.getItem('mda-idPerfil')===1349" @click="eventoOpcCerrarTicket(scope.row)" clickable v-close-popup>
                      <q-item-section avatar>
                        <q-avatar icon="cancel" color="red" text-color="white" class="flip-horizontal" />
                      </q-item-section>
                      <q-item-section>
                        Cerrar ticket
                      </q-item-section>
                    </q-item>-->
                  </q-list>
                </q-btn-dropdown>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
      <!--<form ref="formArchivo" :action="host+'/SArchivo'" method="post" target="_blank">
        <input name="action" type="hidden" value="ARCHIVO_POR_ID">
        <input ref="inputArchivoValores" name="valores" type="hidden" value="">
      </form>-->
    </div>

    <q-dialog v-model="dialogoPersonaVisible" @hide="eventoOcultarDialogoPersona" full-width persistent>
      <q-card style="width: 600px;">
        <q-card-section class="bg-header-dialog">
          <span style="float: right;">
            <q-btn icon="close" v-close-popup flat round size="sm"></q-btn>
          </span>

          <div class="text-body2 text-bold">Agregar usuario</div>
          <!--<div v-if="ticket.id!=null" class="text-body2 text-bold">Actualizar solicitud</div>-->
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <span class="text-body2 text-bold">DATOS PERSONALES</span>
            </div>

            <div class="col-12 col-sm-4">
              <q-select label="Tipo de documento (*)" v-model="persona.tipoDocumento" :options="[{value: 347, label: 'DOCUMENTO NACIONAL DE IDENTIDAD'}, {value: 350, label: 'CARNÉ DE EXTRANJERÍA'}]" emit-value map-options dense outlined></q-select>
            </div>
            <div class="col-12 col-sm-8">
              <q-input label="Número de documento (*)" v-model="persona.numeroDocumento" dense outlined :mask="persona.tipoDocumento===347 ? '########' : '#########'"></q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-input label="Primer apellido (*)" v-model="persona.primerApellido" dense outlined maxlength="30"></q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-input label="Segundo apellido" v-model="persona.segundoApellido" dense outlined maxlength="30"></q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-input label="Nombres (*)" v-model="persona.nombres" dense outlined maxlength="30"></q-input>
            </div>
            <div class="col-12 col-sm-4">
              <span>Sexo <span class="text-red text-bold">(*)</span></span>
              <q-radio v-model="persona.sexo" val="1" label="Hombre" />
              <q-radio v-model="persona.sexo" val="0" label="Mujer" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input label="Fecha de nacimiento (*)" v-model="persona.fechaNacimiento" mask="##/##/####" readonly dense outlined class="borde-normal">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer text-blue">
                    <q-popup-proxy ref="refFechaNacimiento" transition-show="scale" transition-hide="scale">
                      <q-date v-model="persona.fechaNacimiento" mask="DD/MM/YYYY" @input="$refs.refFechaNacimiento.hide()" :options="opcionesFechaNacimiento" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-select label="Estado civil (*)" v-model="persona.estadoCivil" :options="estadosCiviles" emit-value map-options option-value="id" option-label="descripcion" dense outlined></q-select>
            </div>
            <div class="col-12 col-sm-4">
              <q-input label="Teléfono" v-model="persona.telefono" dense outlined maxlength="30" class="borde-normal"></q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-input label="Correo electrónico (*)" v-model="persona.correo" dense outlined class="borde-normal"></q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-input label="Dirección (*)" v-model="persona.direccion" dense outlined maxlength="30" class="borde-normal"></q-input>
            </div>

            <div class="col-12">
              <span class="text-bold">DATOS DE USUARIO</span>
            </div>
            <div class="col-12 col-sm-6">
              <q-input label="Nombre de usuario (*)" v-model="persona.nombreUsuario" @input="eventoCambioNombreUsuario" @keydown.space.prevent debounce="1500" dense outlined stack-label maxlength="100" :loading="cargandoValidacionUsuario">
                <template v-slot:append>
                  <q-icon v-if="errorNombreUsuario===true" name="info" class="text-red">
                    <q-tooltip>NOMBRE DE USUARIO YA EXISTE</q-tooltip>
                  </q-icon>
                  <q-icon v-if="errorNombreUsuario===false" name="check_circle" class="text-green">
                    <q-tooltip>NOMBRE DE USUARIO DISPONIBLE</q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input label="Correo electrónico institucional (*)" v-model="persona.correoInstitucional" dense outlined stack-label filled readonly class="borde-normal"></q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input label="Unidad orgánica (*)" v-model="persona.unidadOrganicaNombre" dense outlined stack-label readonly class="borde-normal">
                <template v-slot:append>
                  <q-icon name="search" @click="eventoOpcAperturarBusquedaUnidadOrganica" class="text-blue cursor-pointer">
                    <q-tooltip>BUSCAR UNIDAD ORGÁNICA</q-tooltip>
                  </q-icon>
                  <q-icon v-if="persona.unidadOrganica!==null" name="cancel" @click="eventoOpcLimpiarUnidadOrganica" class="text-blue cursor-pointer"></q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-select label="Tipo (*)" v-model="persona.tipoUsuario" :options="tiposTrabajador" emit-value map-options option-value="id" option-label="descripcion" dense outlined></q-select>
            </div>

            <div class="col-12 q-gutter-sm text-center">
              <q-btn label="GUARDAR" @click="eventoBtnGuardarUsuario" size="sm"></q-btn>

              <q-btn label="CANCELAR" size="sm" v-close-popup></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoBusquedaUnidadOrganicaVisible" @hide="eventoOcultarDialogoBusquedaUnidad" persistent>
      <q-card style="max-width: 750px; width: 750px;">
        <q-card-section class="bg-header-dialog">
          <span style="float: right;">
            <q-btn icon="close" v-close-popup flat round size="sm"></q-btn>
          </span>

          <div class="text-body2 text-bold">Buscar dependencia</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input label="Dependencia" v-model="textoBusquedaDependencia" dense outlined maxlength="150"></q-input>
            </div>
            <div class="col-12">
              <q-table
                :data="listaDependencias"
                :columns="columnasTablaDependencias"
                table-header-class="bg-inabif"
                :rows-per-page-options="opcionesFilasPorPagina"
                :filter="textoBusquedaDependencia"
                dense>
                <template v-slot:body-cell-seleccion="scope">
                  <q-td :props="scope">
                    <q-btn label="SELECCIONAR" @click="eventoSeleccionDependencia(scope.row)" size="sm"></q-btn>
                  </q-td>
                </template>
              </q-table>
            </div>

            <div class="col-12 q-gutter-sm text-center">
              <q-btn label="CANCELAR" size="sm" v-close-popup></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoErroresVisible" persistent @hide="errores=[]">
      <q-card>
        <q-card-section class="bg-header-dialog">
          Mensaje
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <span>Se presentaron los siguientes errores:</span>
            </div>
            <div class="col-12">
              <ul>
                <li v-for="(error, i) in errores" :key="'e-'+i">{{error}}</li>
              </ul>
            </div>
            <div class="col-12 text-center">
              <q-btn label="CERRAR" size="sm" v-close-popup></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {date} from "quasar";

export default {
  name: 'RegistroPersona',
  data() {
    return {
      host: process.env.API_URL,
      requestConfig: {headers: {'Content-type': 'application/json'}},
      requestMultipartConfig: {headers: {'Content-Type': 'multipart/form-data'}},
      opcionesFilasPorPagina: [5, 10, 20, 50, 100],
      personas: [],
      textoFiltroPersonas: '',
      estadosCiviles: [],
      tiposTrabajador: [],
      persona: {
        tipoDocumento: null, numeroDocumento: '', primerApellido: '', segundoApellido: '', nombres: '',
        fechaNacimiento: null, sexo: null, estadoCivil: null, ubigeo: null, direccion: '',
        correo: '', telefono: '', nombreUsuario: '', correoInstitucional: '',
        unidadOrganica: null, unidadOrganicaNombre: null, tipoUsuario: null,
      },
      columnasTablaPersona: [
        {name: 'tipoDocumento', label: 'TIPO DE DOCUMENTO', field: 'tipoDocumento'},
        {name: 'numeroDocumento', label: 'N° DE DOCUMENTO', field: 'numeroDocumento'},
        {name: 'primerApellido', label: 'PRIMER APELLIDO', field: 'primerApellido'},
        {name: 'segundoApellido', label: 'SEGUNDO APELLIDO', field: 'segundoApellido'},
        {name: 'nombres', label: 'NOMBRES', field: 'nombres'},
        {name: 'fechaNacimiento', label: 'FECHA NACIMIENTO', field: 'fechaNacimiento'},
      ],
      listaDependencias: [],
      columnasTablaDependencias: [
        {name: 'nombre', label: 'DEPENDENCIA', field: 'nombre', align: 'left'},
        {name: 'opciones', label: 'OPCIONES', align: 'center'},
      ],
      errores: [],
      errorNombreUsuario: null,
      textoBusquedaDependencia: '',
      dialogoPersonaVisible: false,
      dialogoBusquedaUnidadOrganicaVisible: false,
      dialogoErroresVisible: false,
      cargandoPersonas: false,
      cargandoValidacionUsuario: false,
    }
  },
  created() {
    this.cargarEstadosCiviles();
    this.cargarTiposTrabajador();
  },
  methods: {
    eventoBtnNuevoUsuario: function () {
      this.dialogoPersonaVisible = true;
    },
    eventoOcultarDialogoPersona: function () {

    },

    eventoBtnGuardarUsuario: function () {
      this.guardarUsuario();
    },
    async guardarUsuario() {
      await this.validarDatosUsuario();

      if (this.errores.length > 0) {
        this.dialogoErroresVisible = true;
      } else {
        let datos = new FormData();
        datos.append('action', 'USUARIO_INTRANET');
        datos.append('objeto', JSON.stringify(this.persona));
        /*for (let f=0 ; f<this.archivosAdjuntos.length ; f++) {
          if (this.archivosAdjuntos[f].id == null) {
            datos.append('archivo', this.archivosAdjuntos[f].archivo);
          }
        }*/

        //this.cargandoGuardadoTicket = true;
        this.$axios
          .post(`${this.host}/SSeguridad`, datos, this.requestMultipartConfig)
          .then(response => {

            this.mostrarMensaje('SE GUARDÓ USUARIO', 'green', 'check_circle');
          })
          .catch((e) => {
            this.mostrarMensaje('ERROR AL GUARDAR USUARIO', 'red', 'warning');
          })
          .finally(() => {
            //this.cargandoGuardadoTicket = false;
          });
      }
    },
    async validarDatosUsuario() {
      if (this.persona.nombreUsuario==null || this.persona.nombreUsuario.trim()==='') {
        this.agregarError('DEBE INGRESAR EL NOMBRE DE USUARIO');
      } else {
        await this.validarNombreUsuarioA(this.persona.nombreUsuario);
      }

      if (this.persona.tipoDocumento==null) {
        this.agregarError('DEBE SELECCIONAR TIPO DE DOCUMENTO DEL USUARIO');
      }

    },
    async validarNombreUsuarioA(nombreUsuario) {
      if (nombreUsuario.length>3) {

        let datos = new FormData();
        datos.append('action', 'USUARIO_POR_LDAP');
        datos.append('valores', ''.concat(nombreUsuario.trim(), '|'));

        this.$axios
          .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
          .then(response => {
            let respuesta = response.data;
            if (respuesta==null) {
              this.mostrarMensaje('USUARIO VÁLIDO', 'green', 'check_circle');
            } else {
              this.errores.push('YA EXISTE USUARIO');
            }
          })
          .catch((e) => {
            this.errores.push('ERROR AL VALIDAR USUARIO');
          })
          .finally(() => {
          });
      } else {
        this.errores.push('NULEANDO ADVERTENCIA');
      }
    },
    agregarError: function (error) {
      this.errores.push(error);
    },
    async obtenerDatosUsuario() {
      let datos = new FormData();
      datos.append('action', 'PERSONAL_ATENCION');
      datos.append('valores', ''.concat(0, '|', 0, '|', 0));

      return this.$axios
        .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
        .then(response => {

        })
        /*.catch((e) => {
          console.log(e);
          this.mostrarMensaje('ERROR AL CARGAR PERSONAL', 'red', 'warning');
        })
        .finally(() => {
        })*/
        ;
    },
    eventoOpcAperturarBusquedaUnidadOrganica: function () {
      /*if (this.ticket.solicitanteNombre!=='' && this.ticket.solicitante==null) {
        this.textoBusquedaPersonal = this.ticket.solicitanteNombre;
        this.eventoBtnBuscarPersonal();
      }*/
      this.dialogoBusquedaUnidadOrganicaVisible = true;
    },
    eventoOcultarDialogoBusquedaUnidad: function () {

    },
    eventoSeleccionDependencia: function (dependenciaSeleccionada) {
    },
    eventoOpcLimpiarUnidadOrganica: function () {
      this.persona.unidadOrganica = null;
      this.persona.unidadOrganicaNombre = null;
    },
    eventoCambioNombreUsuario: function (nombreUsuario) {
      this.errorNombreUsuario = null;
      if (this.persona.nombreUsuario==null || this.persona.nombreUsuario==='') {
        this.persona.correoInstitucional = '';
      } else {
        let nombreUsuarioLimpio = nombreUsuario.replaceAll(' ', '');
        this.persona.correoInstitucional = nombreUsuarioLimpio+'@inabif.gob.pe';
        this.validarNombreUsuario(nombreUsuarioLimpio);
      }
    },
    validarNombreUsuario: function (nombreUsuario) {
      if (nombreUsuario.length>3) {
        let datos = new FormData();
        datos.append('action', 'USUARIO_POR_LDAP');
        datos.append('valores', ''.concat(nombreUsuario.trim(), '|'));

        this.cargandoValidacionUsuario = true;
        this.$axios
          .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
          .then(response => {
            let respuesta = response.data;
            if (respuesta==null) {
              this.errorNombreUsuario = false;
            } else {
              this.errorNombreUsuario = true;
            }
          })
          .catch((e) => {
            this.mostrarMensaje('ERROR AL VALIDAR NOMBRE DE USUARIO', 'red', 'warning');
          })
          .finally(() => {
            this.cargandoValidacionUsuario = false;
          });
      } else {
        this.mostrarMensaje('NULEANDO ADVERTENCIA', 'red', 'warning');
      }
    },
    cargarEstadosCiviles: function () {
      this.$axios
        .get(`${this.host}/SCatalogo?tipo=6&valor=4`)
        .then(response => {
          this.estadosCiviles = response.data;
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL CARGAR ESTADOS CIVILES', 'red', 'warning');
        });
    },
    cargarTiposTrabajador: function () {
      this.$axios
        .get(`${this.host}/SCatalogo?tipo=32&valor=1`)
        .then(response => {
          this.tiposTrabajador = response.data;
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL CARGAR TIPOS DE TRABAJADOR', 'red', 'warning');
        });
    },

    opcionesFechaNacimiento: function (fechaElegible) {
      return fechaElegible < this.obtenerFechaActualFormatoQuasar();
    },
    obtenerFechaActualFormatoQuasar: function () {
      let fechaActual = new Date();
      return date.formatDate(fechaActual, 'YYYY/MM/DD');
    },
    mostrarMensaje: function (mensaje, color, icono) {
      this.$q.notify({ message: mensaje, color: color, icon: icono , position: 'top-right'});
    }
  }
}
</script>
