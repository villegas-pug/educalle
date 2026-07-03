<template>
  <q-page class="q-pa-sm">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-center">
        <span class="text-h6 text-bold">CARGA DE EQUIPOS</span>
      </div>
      <div class="col-12 row q-col-gutter-sm">
        <div class="col-12 col-sm-4">
          <q-select label="Contrato" v-model="filtros['contrato']" :options="contratos" emit-value map-options option-value="id" :option-label="o => o.numero + ' ('+o.empresaNombre+')'" dense outlined></q-select>
        </div>
        <div class="col-12 col-sm-4">
          <q-select label="Estado del equipo" v-model="filtros['estado']" :options="estados" emit-value map-options option-value="id" option-label="descripcion" dense outlined></q-select>
        </div>
        <div class="col-12 col-sm-4">
          <q-select label="Marca / modelo" v-model="filtros['modelo']" :options="modelos" emit-value map-options option-value="id" option-label="descripcion" dense outlined></q-select>
        </div>
        <div class="col-12 col-sm-5">
          <q-select label="Criterio de búsqueda" v-model="filtros['criterio']" :options="opcionesCriterioBusqueda" @input="eventoSeleccionCriterioBusqueda" emit-value map-options option-value="id" option-label="descripcion" dense outlined></q-select>
        </div>
        <div class="col-12 col-sm-5">
          <q-input label="Texto a buscar" v-model="filtros['criterioTexto']" :disable="filtros['criterio']===0" dense outlined></q-input>
        </div>
        <div class="col-12 col-sm-2 text-center">
          <q-btn label="CONSULTAR" @click="eventoBtnBuscar" icon="refresh" :loading="cargandoEquipos" size="sm"></q-btn>
        </div>
      </div>
      <div class="col-12 q-gutter-sm text-right">
        <q-btn label="NUEVA ENTREGA" @click="eventoBtnNuevaEntrega" icon="add" color="green" size="sm"></q-btn>

      </div>
      <div class="col-12">
        <q-table
        :data="tickets"
        :columns="columnasTablaEquipo"
        table-header-class="bg-inabif text-bold"
        :rows-per-page-options="opcionesFilasPorPagina"
        :filter="textoFiltroTabla"
        :loading="cargandoEquipos"
        dense>
        <template v-slot:top-right>
          <q-input borderless v-model="textoFiltroTabla" placeholder="Buscar" outlined dense>
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
                  <q-item @click="eventoOpcConsultarEquipo(scope.row)" clickable v-close-popup>
                    <q-item-section avatar>
                      <q-avatar :icon="'search'" color="red" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <span>Consultar equipo</span>
                    </q-item-section>
                  </q-item>
                  <q-separator inset />
                  <q-item @click="eventoOpcNuevaAsignacion(scope.row)" :clickable="scope.row.estado===1" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar icon="mobile_friendly" :color="scope.row.estado===1 ? 'red' : 'grey'" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <span>Asignar equipo móvil</span>
                    </q-item-section>
                  </q-item>
                  <q-item @click="eventoOpcRegistroFinAsignacion(scope.row)" :clickable="[2,3,7].includes(scope.row.estado)" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar icon="undo" :color="[2,3,7].includes(scope.row.estado) ? 'red' : 'grey'" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <span>Finalizar asignación de equipo</span>
                    </q-item-section>
                  </q-item>
                  <q-item @click="eventoOpcVerAsignaciones(scope.row)" :clickable="[2,3,7].includes(scope.row.estado)" clickable v-close-popup>
                    <q-item-section avatar>
                      <q-avatar icon="manage_search" color="red" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <span>Consultar asignaciones</span>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </q-td>
        </template>
        </q-table>
      </div>

      <form ref="formArchivo" :action="host+'/SArchivo'" method="post" target="_blank">
        <input name="action" type="hidden" value="ARCHIVO_POR_ID">
        <input ref="inputArchivoValores" name="valores" type="hidden" value="">
      </form>
      <form ref="formDescargaExcelEquipos" :action="host+'/SReporte'" method="post" target="_blank">
        <input name="action" type="hidden" value="REPORTE_EQUIPOS">
        <input name="valores" type="hidden" :value="''.concat('', '|', '', '|', '', '|', 0, '|', 0, '|', 0)">
      </form>
      <form ref="formDescargaActaEntrega" :action="host+'/SReporte'" method="post" target="_blank">
        <input name="action" type="hidden" value="ACTA_ENTREGA">
        <input ref="inputActaValores" name="valores" type="hidden" value="">
      </form>
    </div>

    <q-dialog v-model="dialogoEntregaVisible" @hide="eventoOcultarDialogoEntrega" persistent>
      <q-card>
        <q-card-section class="bg-header-dialog">
          <div class="text-body2 text-bold">ENTREGA DE EQUIPOS</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-select label="Contrato" v-model="filtros['contrato']" :options="contratos" emit-value map-options option-value="id" :option-label="o => o.numero + ' ('+o.empresaNombre+')'" dense outlined></q-select>
            </div>
            <div class="col-12">
              <q-input label="Número de informe (*)" v-model="entrega.id" maxlength="150" dense outlined></q-input>
            </div>
            <div class="col-12">
              <q-input label="Expediente (*)" v-model="entrega.id" maxlength="17" dense outlined></q-input>
            </div>
            <div class="col-12">
              <q-field label="Archivo (*)" dense outlined readonly stack-label class="borde-normal">
                <template v-slot:append>
                  <q-icon name="attach_file" @click="$refs.refArchivoEquipos.pickFiles()" class="text-blue cursor-pointer"></q-icon>
                </template>
                <template v-slot:control>
                  <span v-if="archivo!=null" class="text-green text-bold">ARCHIVO CARGADO</span>
                </template>
              </q-field>
              <q-file ref="refArchivoEquipos" style="display: none;" v-model="archivo" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></q-file>

            </div>

            <div class="col-12 text-center q-gutter-sm">
              <q-btn label="GUARDAR" size="sm"></q-btn>

              <q-btn label="CANCELAR" size="sm" v-close-popup></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import Vue from 'vue';
import { date } from 'quasar';
const NUEVO_EQUIPO = {
  id: null, imei: '', contrato: null, modelo: null, numero: '',
  dependencia: null, dependenciaNombre: '',
  accesorio1: '1', accesorio2: '1', accesorio3: '1',
  usuario: null,
};
const NUEVO_MOVIMIENTO = {
  id: null, equipo: null, personal: null, personalNombre: null, tipoUso: 0, fecha: null, fechaFin: null,
  motivoFin: null, observaciones: '',
};
const NUEVO_TICKET = {
  id: null, codigo: null, solicitante: null, solicitanteNombre: '', fuente: null, fuenteDesc: '',
  prioridad: null, prioridadDesc: '', categoria: null, categoriaDesc: '',
  subcategoria: null, subcategoriaDesc: '',
  tipo: null, tipoDesc: '', fecha: null,
  estado: 1, estadoDesc: 'NUEVO', registrador: 0, registradorNombre: 'USUARIO', descripcion: '',
  usuario: null, telefono: '',
  //TEMP
  asignados: '', asignaciones: [],
};
const NUEVA_ATENCION = {
  id: null, ticket: null, personal: null, personalNombre: '',
  descripcion: '', fechaHora: null, accion: null, accionDesc: '',
  personalDerivado: null, personalDerivadoNombre: '',
  estado: null, estadoDesc: '',
  usuario: null,
};

const NUEVA_ENTREGA = {
  id: null,
  estado: null, estadoDesc: '', usuario: null,
};

export default {
  name: 'CargaEquipos',
  data() {
    return {
      host: process.env.API_URL,
      requestConfig: { headers: {'Content-type': 'application/json'} },
      requestMultipartConfig: { headers: { 'Content-Type': 'multipart/form-data'} },
      opcionesFilasPorPagina: [5,10,20,50,100],
      filtros: {
        contrato: null,
        estado: 0,
        modelo: 0,
        criterio: 0,
        criterioTexto: '',
        usuario: null,
        personal: null,
      },
      criterioBusqueda: 0,
      opcionesCriterioBusqueda: [
        {id: 0, descripcion: 'TODOS'},
        {id: 1, descripcion: 'CENTRO'},
        {id: 2, descripcion: 'NÚMERO'},
        {id: 3, descripcion: 'DOCUMENTO DE IDENTIDAD'},
        {id: 4, descripcion: 'IMEI'},
      ],
      personalSeleccionado: null,
      listaPersonalParaAsignarBase: [],
      listaPersonalParaAsignar: [],
      listaPersonalAsignado: [],
      columnasTablaPersonalAsignado: [
        {name: 'personal', label: 'PERSONAL', field: 'personalNombre', align: 'left'},
        //{name: 'opciones', label: ' ', align: 'center'},
      ],
      atenciones: [],
      ticket: Vue.util.extend({}, NUEVO_TICKET),
      movimiento: Vue.util.extend({}, NUEVO_MOVIMIENTO),
      idMovimientoSeleccionado: null,
      contratos: [],
      modelos: [],
      periodos: [{id: 1, descripcion: 'MARZO-ABRIL 2023'}, {id: 2, descripcion: 'JULIO-AGOSTO'}],
      estados: [
        {id: 0, descripcion: 'TODOS'}, {id: 1, descripcion: 'SIN ASIGNAR'}, {id: 2, descripcion: 'ASIGNADO'},
        {id: 7, descripcion: 'ENTREGADO'},

        {id: 3, descripcion: 'EN REPARACIÓN'}, {id: 4, descripcion: 'DE BAJA'}, {id: 5, descripcion: 'POR DEVOLVER'},
        {id: 6, descripcion: 'DEVUELTO'},
      ],
      equipo: Vue.util.extend({}, NUEVO_EQUIPO),
      entrega: Vue.util.extend({}, NUEVA_ENTREGA),
      equipoSeleccionado: null,
      tickets: [],
      columnasTablaEquipo: [
        {name: 'imei', label: 'IMEI', field: 'imei', align: 'left', style: 'width: 40px; white-space:normal;'},
        {name: 'modelo', label: 'MARCA / MODELO', field: 'modeloDesc', align: 'center', style: 'width: 90px; white-space:normal;'},
        {name: 'telefono', label: 'NÚMERO', field: 'numero', align: 'left', style: 'width: 140px; white-space:normal;'},
        {name: 'dependencia', label: 'DEPENDENCIA', field: 'dependenciaNombre', align: 'left', style: 'width: 200px; white-space:normal;'},
        {name: 'cargo', label: 'SERVICIO', field: 'cargoDesc', align: 'left', style: 'width: 180px; white-space:normal;'},
        {name: 'personalAsignado', label: 'ASIGNADO A', field: 'personalNombre', align: 'left', style: 'width: 190px; white-space:normal;'},
        {name: 'ultimaAsignacion', label: 'FECHA DE ASIGNACIÓN', field: 'ultimaAsignacion', align: 'left'},
        {name: 'estado', label: 'ESTADO', field: 'estadoDesc', align: 'left', classes: r=>this.obtenerClaseEstado(r.estado)},
        {name: 'opciones', label: 'OPCIONES', align: 'center', style: 'width: 80px; white-space:normal;'},
      ],
      archivoAdjunto: null,
      archivoAdjuntoActa: null,
      motivosFin: [],
      textoFiltroTabla: '',
      derivacion: { personal: null },
      atencion: Vue.util.extend({}, NUEVA_ATENCION),
      textoBusquedaPersonal: '',
      listaPersonal: [],
      columnasTablaPersonal: [
        {name: 'personal', label: 'PERSONAL', field: 'personalNombre', align: 'left'},
        {name: 'unidadOrganica', label: 'UNIDAD / SUB UNIDAD', field: 'unidadOrganica', align: 'left'},
        {name: 'seleccion', label: ' ', align: 'center'},
      ],
      archivosAdjuntos: [],
      columnasTablaArchivosAdjuntos: [
        {name: 'nombre', label: 'NOMBRE', field: 'nombre', align: 'left'},
        {name: 'opciones', label: 'OPCIONES', align: 'center'},
      ],
      archivosAtencion: [],
      asignaciones: [],
      columnasTablaAsignacion: [
        {name: 'personalAsignado', label: 'ASIGNADO A', field: r=> r.personal==null ? 'NO ASIGNADO' : r.personalNombre, align: 'left'},
        {name: 'fechaAsignacion', label: 'FECHA DE ASIGNACIÓN', field: 'fecha', align: 'center'},
        {name: 'fechaEntrega', label: 'FECHA DE ENTREGA', field: 'fechaEntrega', align: 'center'},
        {name: 'fechaFin', label: 'FECHA DE FIN DE ASIGNACIÓN', field: 'fechaFin', align: 'center'},
        {name: 'motivoFin', label: 'MOTIVO DE FIN DE ASIGNACIÓN', field: 'motivoFinDesc', align: 'left'},
        {name: 'observacion', label: 'OBSERVACIÓN', field: 'observaciones', align: 'left'},
        {name: 'estado', label: 'ESTADO DE ASIGNACIÓN', field: 'estadoDesc', align: 'center'},
        {name: 'opciones', label: 'OPCIONES', align: 'center'},
      ],
      archivoAdjuntoAtencion: null,
      archivo: null,
      dialogoNuevoEquipoVisible: false,
      dialogoAsignacionesVisible: false,
      dialogoNuevaAsignacionVisible: false,
      dialogoFinalAsignacionVisible: false,
      dialogoCargarActaVisible: false,
      dialogoEntregaVisible: false,
      dialogoBusquedaPersonalVisible: false,
      cargandoBusquedaSolicitante: false,
      cargandoGuardadoMovimiento: false,
      cargandoGuardadoActa: false,
      cargandoArchivosAdjuntos: false,
      cargandoAsignaciones: false,
      cargandoEquipos: false,
      cargandoContratos: false,
    }
  },
  created() {
    this.inicializarFiltros();
    this.inicializarObjetos();
    this.cargarMotivos();
    this.cargarContratos();
    //this.cargarEquipos();
    this.ticket.usuario = this.$q.localStorage.getItem('mda-idUsuario');
  },
  methods:  {
    inicializarFiltros: function () {
      this.filtros.usuario = 0;
      this.filtros.personal=this.$q.localStorage.getItem('mda-idPersonal');
    },
    inicializarObjetos: function () {
      let fecha = new Date();
      this.movimiento.fechaFin = date.formatDate(fecha, 'DD/MM/YYYY');
    },
    cargarEquipos: function () {
      let datos = new FormData();
      datos.append('action', 'EQUIPOS_MOVILES');
      datos.append('valores', this.valoresFiltro);

      this.cargandoEquipos = true;
      this.$axios
        .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
        .then(response => {
          this.tickets = response.data;
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL CARGAR TICKETS', 'red', 'warning');
        })
        .finally(() => {
          this.cargandoEquipos = false;
        });
    },
    cargarMotivos: function () {
      let datos = new FormData();
      datos.append('action', 'MOTIVOS');
      datos.append('valores', '');

      this.$axios
        .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
        .then(response => {
          this.motivosFin = response.data;
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL CARGAR MOTIVOS', 'red', 'warning');
        })
        .finally(() => {
        });
    },
    cargarContratos: function () {
      let datos = new FormData();
      datos.append('action', 'CONTRATOS_MOVILES');
      datos.append('valores', this.valoresFiltro);

      this.cargandoContratos = true;
      this.$axios
        .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
        .then(response => {
          this.contratos = response.data;
          if (this.contratos.length>0) {
            this.filtros['contrato'] = this.contratos[0].id;
            this.cargarModelos();
          }
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL CARGAR CONTRATOS MÓVILES', 'red', 'warning');
        })
        .finally(() => {
          this.cargandoContratos = false;
        });
    },
    cargarModelos: function () {
      this.modelos = [];
      let datos = new FormData();
      datos.append('action', 'MODELOS_POR_CONTRATO');
      datos.append('valores', ''.concat(this.filtros['contrato'], '|', ));

      //this.cargandoContratos = true;
      this.$axios
        .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
        .then(response => {
          this.modelos.unshift({id: 0, descripcion: 'TODOS'});
          let modelos = response.data;
          for (let i=0 ; i<modelos.length ; i++) {
            this.modelos.push(modelos[i]);
          }
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL CARGAR CONTRATOS MODELOS', 'red', 'warning');
        })
        .finally(() => {
          //this.cargandoContratos = false;
        });
    },
    eventoBtnBuscar: function () {
      this.cargarEquipos();
    },
    eventoBtnBuscarPersonal: function () {
      if (this.textoBusquedaPersonal==null || this.textoBusquedaPersonal.trim()==='') {
        this.mostrarMensaje('DEBE INGRESAR NOMBRES Y/O APELLIDOS DEL SOLICITANTE', 'red', 'warning');
      } else {
        let datos = new FormData();
        datos.append('action', 'BUSQUEDA_PERSONAL_ASIGNACION_EQUIPO');
        datos.append('valores', ''.concat(this.textoBusquedaPersonal.trim(), '|', 0, '|', 0));

        this.cargandoBusquedaSolicitante = true;
        this.$axios
          .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
          .then(response => {
            this.listaPersonal = response.data;
            this.mostrarMensaje('BÚSQUEDA FINALIZADA', 'green', 'info');
          })
          .catch((e) => {
            this.mostrarMensaje('ERROR AL BUSCAR PERSONAL', 'red', 'warning');
          })
          .finally(() => {
            this.cargandoBusquedaSolicitante = false;
          });
      }
    },
    eventoSeleccionPersonal: function (personal) {
      this.movimiento.personalNombre = personal.personalNombre;
      this.movimiento.personal = personal.id;
      this.dialogoBusquedaPersonalVisible = false;
    },
    eventoOpcAbrirBusquedaPersonal: function () {
      this.dialogoBusquedaPersonalVisible = true;
    },
    eventoOpcLimpiarPersonalSolicitante: function () {
      this.ticket.solicitante = null;
      this.ticket.solicitanteNombre = '';
    },
    eventoOpcConsultarEquipo: function (equipo) {
      this.equipo = Vue.util.extend({}, equipo);
      this.equipo.contrato = 1;
      this.dialogoNuevoEquipoVisible = true;
    },
    eventoOpcVerActaEntrega: function (asignacion) {
      this.$refs.inputActaValores.value = asignacion.idEquipo+'|'+asignacion.id;
      this.$refs.formDescargaActaEntrega.submit();
    },
    eventoOpcCargarActa: function (movimiento) {
      this.idMovimientoSeleccionado = movimiento.id;

      this.dialogoCargarActaVisible = true;
    },
    eventoOpcNuevaAsignacion: function (equipo) {
      this.equipoSeleccionado = Vue.util.extend({}, equipo);
      this.movimiento.equipo = equipo.id;
      this.dialogoNuevaAsignacionVisible=true;
    },
    eventoOpcRegistroFinAsignacion: function (equipo) {
      this.equipoSeleccionado = Vue.util.extend({}, equipo);
      this.obtenerAsignacionVigente(equipo);
      //this.movimiento.equipo = equipo.id;
      this.dialogoFinalAsignacionVisible=true;
    },
    eventoOpcVerAsignaciones: function (equipo) {
      this.equipoSeleccionado = Vue.util.extend({}, equipo);
      this.cargarAsignacionesEquipo(equipo);
      this.dialogoAsignacionesVisible=true;
    },
    obtenerAsignacionVigente: function (equipo) {
      let datos = new FormData();
      datos.append('action', 'ASIGNACION_VIGENTE');
      datos.append('valores', ''.concat(equipo.id, '|'));

      this.$axios
        .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
        .then(response => {
          let respuesta = response.data;
          if (respuesta!=null) {
            this.movimiento = respuesta;
            let fecha = new Date();
            this.movimiento.fechaFin = date.formatDate(fecha, 'DD/MM/YYYY');
          }
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL OBTENER ASIGNACIÓN VIGENTE', 'red', 'warning');
        })
        .finally(() => {
        });
    },
    cargarAsignacionesEquipo: function (equipo) {
      let datos = new FormData();
      datos.append('action', 'ASIGNACIONES_POR_EQUIPO');
      datos.append('valores', ''.concat(equipo.id, '|'));

      this.cargandoAsignaciones = true;
      this.$axios
        .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
        .then(response => {
          this.asignaciones = response.data;
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL CARGAR ASIGNACIONES DE EQUIPO', 'red', 'warning');
        })
        .finally(() => {
          this.cargandoAsignaciones = false;
        });
    },
    cargarAtencionesTicket: function (idTicket) {
      let datos = new FormData();
      datos.append('action', 'TICKET_ATENCIONES');
      datos.append('valores', ''.concat(idTicket, '|'));

      this.$axios
        .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
        .then(response => {
          this.atenciones = response.data;
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL CARGAR ATENCIONES', 'red', 'warning');
        })
        .finally(() => {
        });
    },
    eventoBtnNuevaEntrega: function () {
      this.dialogoEntregaVisible = true;
    },
    eventoOcultarDialogoEntrega: function () {

    },
    eventoBtnDescargarExcel: function () {
      this.$refs.formDescargaExcelEquipos.submit();
    },
    eventoSeleccionCriterioBusqueda: function (criterioSeleccionado) {
      if (criterioSeleccionado===0) {
        this.filtros['criterioTexto'] = '';
      }
    },
    eventoSeleccionAccionAtencion: function (accionSeleccionada) {
      if ([2,3,4, null].includes(accionSeleccionada)) {
        this.atencion.personalDerivado=null;
      }
    },
    filtrarPersonalParaAsignarPorNombre (val, update) {
      if (val === '') {
        update(() => {
          this.listaPersonalParaAsignar = this.listaPersonalParaAsignarBase
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.listaPersonalParaAsignar = this.listaPersonalParaAsignarBase.filter(v => v.personalNombre.toLowerCase().indexOf(needle) > -1)
      })
    },
    eventoProxySeleccionArchivoAdjuntoAtencion: function () {
      this.$refs.inputFileArchivoAdjuntoAtencion.pickFiles();
    },
    eventoSeleccionArchivoAdjuntoAtencion: function (nuevoArchivo) {
      if (nuevoArchivo!=null) {
        if ( this.archivosAtencion.length<3 ) {
          /*let nuevoPesoTotal = this.pesoTotalAnexos+nuevoDocumentoAnexo.size;
          if (nuevoPesoTotal <= this.pesoMaximoAnexos) {*/
          let nombreArchivo = nuevoArchivo.name;
          this.archivosAtencion.push({id: null, nombre: nombreArchivo, archivo: nuevoArchivo});
          /*} else {
            this.mostrarMensaje('NO SE PUEDE AGREGAR EL ARCHIVO PUES EXCEDE EL TAMAÑO TOTAL MÁXIMO PERMITIDO PARA LOS ARCHIVOS (10 MB)', 'red', 'cancel');
          }*/
        } else {
          this.mostrarMensaje('SOLO PUEDE ADJUNTAR 3 ARCHIVOS', 'red', 'warning');
        }
        this.archivoAdjuntoAtencion = null;
      }
    },
    eventoBtnVerArchivo: function (registroArchivo) {
      this.$refs.inputArchivoValores.value = registroArchivo.id+'|';
      this.$refs.formArchivo.submit();
    },
    removerArchivoAtencion: function (indice) {
      this.archivosAtencion.splice(indice, 1);
    },
    cargarListaArchivosTicket: function (idTicket) {
      let datos = new FormData();
      datos.append('action', 'TICKET_ARCHIVOS');
      datos.append('valores', ''.concat(idTicket, '|'));

      this.cargandoArchivosAdjuntos = true;
      this.$axios
        .post(`${this.host}/SConsulta`, datos, this.requestMultipartConfig)
        .then(response => {
          this.archivosAdjuntos = response.data;
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL CARGAR LISTA DE ARCHIVOS ADJUNTOS', 'red', 'warning');
        })
        .finally(() => {
          this.cargandoArchivosAdjuntos = false;
        });
    },
    eventoBtnGuardarAsignacionEquipo: function () {
      if (this.movimiento.personal==null || this.movimiento.fecha==null || this.movimiento.fecha==='') {
        this.mostrarMensaje('DEBE COMPLETAR TODOS LOS CAMPOS OBLIGATORIOS PARA GUARDAR', 'red', 'warning')
      } else {
        this.guardarAsignacion();
      }
    },
    eventoBtnGuardarFinAsignacion: function () {
      if (this.movimiento.motivoFin==null || this.movimiento.fechaFin==null || this.movimiento.fechaFin==='') {
        this.mostrarMensaje('DEBE COMPLETAR TODOS LOS CAMPOS OBLIGATORIOS PARA GUARDAR', 'red', 'warning')
      } else {
        this.guardarMovimiento();
      }
    },
    eventoBtnGuardarActa: function () {
      if (this.archivoAdjuntoActa==null) {
        this.mostrarMensaje('DEBE CARGAR EL ACTA DE ENTREGA', 'red', 'warning')
      } else {
        this.guardarActa();
      }
    },
    guardarMovimiento: function () {
      let datos = new FormData();
      datos.append('action', 'MOVIMIENTO');
      datos.append('objeto', JSON.stringify(this.movimiento));

      this.cargandoGuardadoMovimiento = true;
      this.$axios
        .post(`${this.host}/SMesaAyuda`, datos, this.requestMultipartConfig)
        .then(response => {
          let respuesta = response.data;
          this.cargarEquipos();
          this.dialogoFinalAsignacionVisible = false;
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL GUARDAR', 'red', 'warning');
        })
        .finally(() => {
          this.cargandoGuardadoMovimiento = false;
        });
    },
    guardarActa: function () {
      let datos = new FormData();
      datos.append('action', 'ACTA');
      datos.append('objeto', JSON.stringify({id: this.idMovimientoSeleccionado, usuario: this.$q.localStorage.getItem('mda-idUsuario')}));
      datos.append('archivo', this.archivoAdjuntoActa);

      this.cargandoGuardadoActa = true;
      this.$axios
          .post(`${this.host}/STicket`, datos, this.requestMultipartConfig)
          .then(response => {
            let respuesta = response.data;
            this.cargarAsignacionesEquipo(this.equipoSeleccionado);
            this.cargarEquipos();

            this.equipoSeleccionado.estado=7;
            this.equipoSeleccionado.estadoDesc='ENTREGADO';

            this.dialogoCargarActaVisible = false;
          })
          .catch((e) => {
            this.mostrarMensaje('ERROR AL GUARDAR ACTA', 'red', 'warning');
          })
          .finally(() => {
            this.cargandoGuardadoActa = false;
          });
    },
    guardarAsignacion: function () {
      let datos = new FormData();
      datos.append('action', 'MOVIMIENTO');
      datos.append('objeto', JSON.stringify(this.movimiento));

      this.cargandoGuardadoMovimiento = true;
      this.$axios
        .post(`${this.host}/SMesaAyuda`, datos, this.requestMultipartConfig)
        .then(response => {
          let respuesta = response.data;
          this.cargarEquipos();
          this.dialogoNuevaAsignacionVisible = false;
        })
        .catch((e) => {
          this.mostrarMensaje('ERROR AL GUARDAR', 'red', 'warning');
        })
        .finally(() => {
          this.cargandoGuardadoMovimiento = false;
        });
    },
    eventoBtnGuardarEquipo: function () {
      if (this.equipo.imei==='' || this.equipo.contrato==null || this.equipo.modelo===null || this.equipo.numero==='') {
        this.mostrarMensaje('DEBE COMPLETAR TODOS LOS CAMPOS OBLIGATORIOS', 'red', 'warning');
      } else {
        if (this.equipo.imei.length<15) {
          this.mostrarMensaje('EL IMEI DEBE CONTENER 15 DÍGITOS', 'red', 'warning');
        } else if (this.equipo.numero.length<9) {
          this.mostrarMensaje('EL NÚMERO DE TELÉFONO DEBE CONTENER 9 DÍGITOS', 'red', 'warning');
        } else {
        }
      }
    },
    eventoOpcAdjuntarArchivo: function () {
      this.$refs.refArchivoAdjunto.pickFiles();
    },
    eventoOpcAdjuntarActa: function () {
      this.$refs.refActa.pickFiles();
    },
    eventoErrorAdjuntarArchivo: function (rechazados) {
      if (rechazados.length>0) {
        let tipoError = rechazados[0].failedPropValidation;
        if (tipoError==='accept') {
          this.mostrarMensaje('DEBE SELECCIONAR UN ARCHIVO DE TIPO VÁLIDO', 'red', 'warning');
        }
      }
    },
    eventoOcultarDialogoEquipo: function () {
      this.equipo = Vue.util.extend({}, NUEVO_EQUIPO);
    },
    eventoOcultarDialogoAsignaciones: function () {
      this.equipoSeleccionado = null;
      this.asignaciones = [];
    },
    eventoOcultarDialogoNuevaAsignacion: function () {
      this.equipoSeleccionado = null;
      this.movimiento = Vue.util.extend({}, NUEVO_MOVIMIENTO);
    },
    eventoOcultarDialogoFinAsignacion: function () {
      this.equipoSeleccionado = null;
      let fecha = new Date();
      this.movimiento.equipo = null;
      this.movimiento.motivoFin = null;
      this.movimiento.fechaFin = date.formatDate(fecha, 'DD/MM/YYYY');
      this.movimiento.observaciones = '';
    },
    eventoOcultarDialogoCargaActa: function () {
      this.idMovimientoSeleccionado = null;
      this.archivoAdjuntoActa=null;
    },

    eventoOcultarDialogoBusquedaPersonal: function () {
      this.listaPersonal = [];
      this.textoBusquedaPersonal=[];
    },
    eventoSeleccionMotivo: function (motivoSeleccionado) {
      if (motivoSeleccionado===4427) {
        this.archivoAdjunto=null;
      }
    },
    obtenerClaseEstado: function (estado) {
      if (estado===1) { return 'text-green text-bold' }
      if (estado===2) { return 'text-blue text-bold' }
      if (estado===3) { return 'text-red text-bold' }
    },
    obtenerOpcionesFinAsignacion: function (fecha) {
      if (this.equipoSeleccionado==null) {
        return fecha <= this.obtenerFechaActualFormatoQuasar();
      }
      return this.obtenerFechaFormatoQuasar(this.equipoSeleccionado.ultimaAsignacion)<=fecha && fecha <= this.obtenerFechaActualFormatoQuasar();
    },
    obtenerOpcionesAsignacion: function (fecha) {
      if (this.equipoSeleccionado==null) {
        return fecha <= this.obtenerFechaActualFormatoQuasar();
      }
      return this.obtenerFechaFormatoQuasar(this.equipoSeleccionado.ultimaAsignacion)<=fecha && fecha <= this.obtenerFechaActualFormatoQuasar();
    },
    obtenerFechaFormatoQuasar: function (fechaFormatoDMA) {
      let fecha = date.extractDate(fechaFormatoDMA, 'DD/MM/YYYY');
      return date.formatDate(fecha, 'YYYY/MM/DD');
    },
    obtenerFechaActualFormatoQuasar: function () {
      return date.formatDate(new Date(), 'YYYY/MM/DD');
    },
    mostrarMensaje: function (mensaje, color, icono) {
      this.$q.notify({ message: mensaje, color: color, icon: icono , position: 'top-right'});
    },
  },
  computed: {
    valoresFiltro: function () {
      let entradas = Object.entries(this.filtros);
      return entradas.map(e => e[1]).join('|');
    }
  }
}
</script>
