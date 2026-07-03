<template>
  <q-page class="q-pa-sm">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-center">
        <span class="text-h6 text-bold">DEVOLUCIÓN DE EQUIPOS</span>
      </div>
      <div class="col-12 row q-col-gutter-sm">
        <div class="col-12 col-sm-4">
          <q-select label="Contrato" v-model="filtros['contrato']" :options="contratos" emit-value map-options option-value="id" :option-label="o => o.numero + ' ('+o.empresaNombre+')'" dense outlined></q-select>
        </div>
        <div class="col-12 col-sm-4">
          <q-select label="Condición" v-model="filtros['estado']" :options="condiciones" emit-value map-options option-value="id" option-label="descripcion" dense outlined></q-select>
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
      <!--<div class="col-12 q-gutter-sm text-right">
        <q-btn label="EXCEL" @click="eventoBtnDescargarExcel" icon="download" color="green" class="btn-seccion-acciones" size="sm"></q-btn>

        <q-btn label="NUEVO EQUIPO" @click="eventoBtnNuevoEquipo" icon="add" color="green" size="sm"></q-btn>

      </div>-->
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
        <!--<template v-slot:body-cell-numero="scope">
          <q-td :props="scope">
            <q-badge rounded>
              <q-tooltip>{{scope.row.prioridadDesc}}</q-tooltip>
            </q-badge>
            &nbsp;
            <span>{{scope.row.codigo}}</span>
          </q-td>
        </template>-->
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
                  <!--<q-item @click="eventoOpcRegistroFinAsignacion(scope.row)" :clickable="[2,3,7].includes(scope.row.estado)" v-close-popup>
                    <q-item-section avatar>
                      <q-avatar icon="undo" :color="[2,3,7].includes(scope.row.estado) ? 'red' : 'grey'" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <span>Finalizar asignación de equipo</span>
                    </q-item-section>
                  </q-item>-->

                  <q-item @click="eventoOpcVerAsignaciones(scope.row)" :clickable="[2,3,7].includes(scope.row.estado)" clickable v-close-popup>
                    <q-item-section avatar>
                      <q-avatar icon="manage_search" color="red" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <span>Consultar asignaciones</span>
                    </q-item-section>
                  </q-item>

                  <!--<q-item @click="eventoOpcVerActaEntrega(scope.row)" clickable v-close-popup>
                    <q-item-section avatar>
                      <q-avatar :icon="'description'" color="red" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <span>Ver acta de entrega</span>
                    </q-item-section>
                  </q-item>-->
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

    <q-dialog v-model="dialogoNuevoEquipoVisible" @hide="eventoOcultarDialogoEquipo" persistent>
      <q-card style="width: 600px;">
        <q-card-section class="bg-header-dialog">
          <span style="float: right;">
            <q-btn icon="close" v-close-popup flat round size="sm"></q-btn>
          </span>

          <div v-if="equipo.id==null" class="text-body2 text-bold">Nuevo equipo</div>
          <div v-if="equipo.id!=null" class="text-body2 text-bold">Consultar equipo</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-xs">
            <div class="col-12">
              <span class="text-body2 text-bold">Datos del equipo</span>
            </div>
            <div class="col-12 col-sm-6">
              <q-input :label="'IMEI'+(equipo.id==null ? '' : ' (*)')" v-model="equipo.imei" mask="###############" dense outlined :filled="equipo.id!=null" :readonly="equipo.id!=null" class="borde-normal"></q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-select :label="'Contrato'+' (*)'" v-model="equipo.contrato" :options="contratos" emit-value map-options option-value="id" option-label="numero" dense outlined :filled="equipo.id!=null" :readonly="equipo.id!=null" :stack-label="equipo.id!=null" :hide-dropdown-icon="equipo.id!=null" class="borde-normal"></q-select>
            </div>
            <div class="col-12 col-sm-6">
              <q-select :label="'Marca / modelo'+' (*)'" v-model="equipo.modelo" :options="modelos" emit-value map-options option-value="id" option-label="descripcion" dense outlined :filled="equipo.id!=null" :readonly="equipo.id!=null"  :stack-label="equipo.id!=null" :hide-dropdown-icon="equipo.id!=null" class="borde-normal"></q-select>
            </div>
            <div class="col-12 col-sm-6">
              <q-input :label="'Número asignado'+' (*)'" v-model="equipo.numero" mask="#########" dense outlined :filled="equipo.id!=null" :readonly="equipo.id!=null" class="borde-normal"></q-input>
            </div>
            <div class="col-12 q-gutter-sm text-center">
              <q-btn v-if="equipo.id==null" label="GUARDAR" @click="eventoBtnGuardarEquipo" size="sm" v-close-popup></q-btn>

              <q-btn :label="equipo.id==null ? 'CANCELAR': 'CERRAR'" size="sm" v-close-popup></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoAsignacionesVisible" @hide="eventoOcultarDialogoAsignaciones" persistent full-width>
      <q-card style="width: 600px;">
        <q-card-section class="bg-header-dialog">
          <span style="float: right;">
            <q-btn icon="close" v-close-popup flat round size="sm"></q-btn>
          </span>

          <div class="text-body2 text-bold">Consultar asignaciones</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-xs">
            <div class="col-12">
              <span class="text-body2 text-bold">Datos del equipo</span>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-field label="Contrato" dense outlined readonly filled stack-label class="borde-normal">
                <template v-slot:control>
                  {{ equipoSeleccionado.numeroContrato }}
                </template>
              </q-field>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="IMEI" v-model="equipoSeleccionado.imei" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Marca / modelo" v-model="equipoSeleccionado.modeloDesc" readonly filled dense outlined class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Número" v-model="equipoSeleccionado.numero" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12">
              <q-input label="Dependencia" v-model="equipoSeleccionado.dependenciaNombre" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Asignado a" v-model="equipoSeleccionado.personalNombre" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Cargo" v-model="equipoSeleccionado.cargoDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Fecha de última asignación" v-model="equipoSeleccionado.ultimaAsignacion" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Estado" v-model="equipoSeleccionado.estadoDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div class="col-12">
              <span class="text-body2 text-bold">Asignaciones del equipo</span>
            </div>
            <div class="col-12">
              <q-table
                :data="asignaciones"
                :columns="columnasTablaAsignacion"
                table-header-class="bg-inabif"
                :rows-per-page-options="opcionesFilasPorPagina"
                :loading="cargandoAsignaciones"
                dense>
                <template v-slot:body-cell-opciones="scope">
                  <q-td :props="scope">
                    <q-btn-dropdown size="sm" dropdown-icon="settings" class="q-mr-xs acciones" no-icon-animation>
                      <q-list>
                        <!--<q-item v-if="scope.row.actaCargada==='0'" @click="eventoOpcVerActaEntrega(scope.row)" clickable v-close-popup>
                          <q-item-section avatar>
                            <q-avatar icon="description" color="red" text-color="white" />
                          </q-item-section>
                          <q-item-section>
                            <span>Generar acta</span>
                          </q-item-section>
                        </q-item>
                        <q-item v-if="equipoSeleccionado.estado===2 && scope.row.estado===1 && scope.row.actaCargada==='0'" @click="eventoOpcCargarActa(scope.row)" clickable v-close-popup>
                          <q-item-section avatar>
                            <q-avatar icon="upload" color="red" text-color="white" />
                          </q-item-section>
                          <q-item-section>
                            <span>Cargar acta</span>
                          </q-item-section>
                        </q-item>
                        <q-separator v-if="scope.row.actaCargada==='1'" inset/>
                        <q-item v-if="scope.row.actaCargada==='1'" @click="eventoBtnVerArchivo({id: scope.row.idActa})" clickable v-close-popup>
                          <q-item-section avatar>
                            <q-avatar icon="search" color="red" text-color="white" />
                          </q-item-section>
                          <q-item-section>
                            <span>Ver acta de entrega</span>
                          </q-item-section>
                        </q-item>-->
                      </q-list>
                    </q-btn-dropdown>
                  </q-td>
                </template>
              </q-table>
            </div>
            <div class="col-12 q-gutter-sm text-center">
              <q-btn label="CERRAR" size="sm" v-close-popup></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoNuevaAsignacionVisible" @hide="eventoOcultarDialogoNuevaAsignacion" persistent full-width>
      <q-card style="width: 600px;">
        <q-card-section class="bg-header-dialog">
          <span style="float: right;">
            <q-btn icon="close" :disable="cargandoGuardadoMovimiento" v-close-popup flat round size="sm"></q-btn>
          </span>

          <div class="text-body2 text-bold">Asignar equipo</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-xs">
            <div class="col-12">
              <span class="text-body2 text-bold">Datos del equipo</span>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="IMEI" v-model="equipoSeleccionado.imei" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Marca / modelo" v-model="equipoSeleccionado.modeloDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Número" v-model="equipoSeleccionado.numero" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12">
              <q-input label="Dependencia" v-model="equipoSeleccionado.dependenciaNombre" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Asignado a" v-model="equipoSeleccionado.personalNombre" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12">
              <q-input label="Cargo" v-model="equipoSeleccionado.cargoDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Fecha de última asignación" v-model="equipoSeleccionado.ultimaAsignacion" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Estado" v-model="equipoSeleccionado.estadoDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div class="col-12">
              <span class="text-body2 text-bold">Datos de asignación</span>
            </div>
            <div class="col-12 col-sm-6">
              <q-field label="Personal (*)" dense outlined filled readonly stack-label class="borde-normal">
                <template v-slot:control>
                  <span>{{movimiento.personalNombre}}</span>
                </template>
                <template v-slot:append>
                  <q-icon name="search" @click="eventoOpcAbrirBusquedaPersonal" class="text-blue cursor-pointer"></q-icon>
                </template>
              </q-field>
            </div>
            <div class="col-12 col-sm-6">
              <q-input label="Fecha (*)" v-model="movimiento.fecha" mask="##/##/####" readonly dense outlined class="borde-normal">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer text-blue">
                    <q-popup-proxy ref="qDateFechaAsignacion" transition-show="scale" transition-hide="scale">
                      <q-date v-model="movimiento.fecha" mask="DD/MM/YYYY" @input="$refs.qDateFechaAsignacion.hide()" :options="obtenerOpcionesAsignacion" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input label="Observaciones" type="textarea" v-model="movimiento.observaciones" dense outlined maxlength="150" class="borde-normal" input-style="resize: none; height: 60px;"></q-input>
            </div>

            <div class="col-12 q-gutter-sm text-center">
              <q-btn label="GUARDAR" @click="eventoBtnGuardarAsignacionEquipo" :loading="cargandoGuardadoMovimiento" size="sm"></q-btn>

              <q-btn label="CANCELAR" size="sm" :disable="cargandoGuardadoMovimiento" v-close-popup></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoFinalAsignacionVisible" @hide="eventoOcultarDialogoFinAsignacion" persistent>
      <q-card style="width: 600px;">
        <q-card-section class="bg-header-dialog">
          <span style="float: right;">
            <q-btn icon="close" :disable="cargandoGuardadoMovimiento" v-close-popup flat round size="sm"></q-btn>
          </span>

          <div class="text-body2 text-bold">Finalizar asignación de equipo</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-xs">
            <div class="col-12">
              <span class="text-body2 text-bold">Datos del equipo</span>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="IMEI" v-model="equipoSeleccionado.imei" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Marca / modelo" v-model="equipoSeleccionado.modeloDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Número" v-model="equipoSeleccionado.numero" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12">
              <q-input label="Dependencia" v-model="equipoSeleccionado.dependenciaNombre" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Asignado a" v-model="equipoSeleccionado.personalNombre" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Cargo" v-model="equipoSeleccionado.cargoDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Fecha de última asignación" v-model="equipoSeleccionado.ultimaAsignacion" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Estado" v-model="equipoSeleccionado.estadoDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div class="col-12">
              <span class="text-body2 text-bold">Datos de fin de asignación</span>
            </div>
            <div class="col-12 col-sm-6">
              <q-select label="Motivo (*)" v-model="movimiento.motivoFin" :options="motivosFin" @input="eventoSeleccionMotivo" emit-value map-options option-value="id" option-label="descripcion" dense outlined class="borde-normal"></q-select>
            </div>
            <div class="col-12 col-sm-6">
              <q-input label="Fecha (*)" v-model="movimiento.fechaFin" mask="##/##/####" readonly dense outlined class="borde-normal">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer text-blue">
                    <q-popup-proxy ref="qDateFecFinAsignacion" transition-show="scale" transition-hide="scale">
                      <q-date v-model="movimiento.fechaFin" mask="DD/MM/YYYY" @input="$refs.qDateFecFinAsignacion.hide()" :options="obtenerOpcionesFinAsignacion" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div v-if="movimiento.motivoFin===4428" class="col-12">
              <q-field label="Denuncia (archivo PDF)" dense outlined readonly stack-label class="borde-normal">
                <template v-slot:control>
                  <span v-if="archivoAdjunto!=null">{{archivoAdjunto.name}}</span>
                </template>
                <template v-slot:append>
                  <q-icon name="cancel" v-if="archivoAdjunto!=null" @click="archivoAdjunto=null" class="text-blue cursor-pointer">
                    <q-tooltip>REMOVER ARCHIVO</q-tooltip>
                  </q-icon>
                  <q-icon name="attach_file" @click="eventoOpcAdjuntarArchivo" class="text-blue cursor-pointer">
                    <q-tooltip>ADJUNTAR ARCHIVO</q-tooltip>
                  </q-icon>
                </template>
              </q-field>
              <q-file style="display: none;" ref="refArchivoAdjunto" v-model="archivoAdjunto" accept="application/pdf" @rejected="eventoErrorAdjuntarArchivo"></q-file>
            </div>
            <div class="col-12">
              <q-input label="Observaciones" type="textarea" v-model="movimiento.observaciones" dense outlined maxlength="150" class="borde-normal" input-style="resize: none; height: 60px;"></q-input>
            </div>
            <div class="col-12 q-gutter-sm text-center">
              <q-btn label="GUARDAR" @click="eventoBtnGuardarFinAsignacion" :loading="cargandoGuardadoMovimiento" size="sm"></q-btn>

              <q-btn label="CANCELAR" :disable="cargandoGuardadoMovimiento" size="sm" v-close-popup></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoCargarActaVisible" @hide="eventoOcultarDialogoCargaActa" persistent>
      <q-card style="width: 600px;">
        <q-card-section class="bg-header-dialog">
          <span style="float: right;">
            <q-btn icon="close" v-close-popup flat round size="sm"></q-btn>
          </span>

          <div class="text-body2 text-bold">Cargar acta</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-xs">
            <div class="col-12">
              <span class="text-body2 text-bold">Datos del equipo</span>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="IMEI" v-model="equipoSeleccionado.imei" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Marca / modelo" v-model="equipoSeleccionado.modeloDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Número" v-model="equipoSeleccionado.numero" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12">
              <q-input label="Dependencia" v-model="equipoSeleccionado.dependenciaNombre" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Asignado a" v-model="equipoSeleccionado.personalNombre" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Cargo" v-model="equipoSeleccionado.cargoDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Fecha de última asignación" v-model="equipoSeleccionado.ultimaAsignacion" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>
            <div v-if="equipoSeleccionado!=null" class="col-12 col-sm-6">
              <q-input label="Estado" v-model="equipoSeleccionado.estadoDesc" dense outlined readonly filled stack-label class="borde-normal"></q-input>
            </div>

            <div class="col-12">
              <q-field label="Acta de entrega" dense outlined readonly stack-label class="borde-normal">
                <template v-slot:control>
                  <span v-if="archivoAdjuntoActa!=null">{{archivoAdjuntoActa.name}}</span>
                </template>
                <template v-slot:append>
                  <q-icon name="cancel" v-if="archivoAdjuntoActa!=null" @click="archivoAdjuntoActa=null" class="text-blue cursor-pointer">
                    <q-tooltip>REMOVER ARCHIVO</q-tooltip>
                  </q-icon>
                  <q-icon name="attach_file" @click="eventoOpcAdjuntarActa" class="text-blue cursor-pointer">
                    <q-tooltip>ADJUNTAR ARCHIVO</q-tooltip>
                  </q-icon>
                </template>
              </q-field>
              <q-file style="display: none;" ref="refActa" v-model="archivoAdjuntoActa" accept="application/pdf" @rejected="eventoErrorAdjuntarArchivo"></q-file>
            </div>
            <div class="col-12 q-gutter-sm text-center">
              <q-btn label="GUARDAR" @click="eventoBtnGuardarActa" :loading="cargandoGuardadoActa" size="sm"></q-btn>

              <q-btn label="CANCELAR" :disable="cargandoGuardadoActa" size="sm" v-close-popup></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoBusquedaPersonalVisible" @hide="eventoOcultarDialogoBusquedaPersonal" persistent>
      <q-card style="width: 600px;">
        <q-card-section class="bg-header-dialog">
          <span style="float: right;">
            <q-btn icon="close" v-close-popup :disable="cargandoBusquedaSolicitante" flat round size="sm"></q-btn>
          </span>

          <div class="text-body2 text-bold">Buscar personal</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-10">
              <q-input label="Nombres y/o apellidos" v-model="textoBusquedaPersonal" :disable="cargandoBusquedaSolicitante" dense outlined maxlength="60"></q-input>
            </div>
            <div class="col-2">
              <q-btn icon="search" @click="eventoBtnBuscarPersonal" :loading="cargandoBusquedaSolicitante" size="sm"></q-btn>
            </div>
            <div class="col-12">
              <q-table
                :data="listaPersonal"
                :columns="columnasTablaPersonal"
                table-header-class="bg-inabif"
                :rows-per-page-options="opcionesFilasPorPagina"
                :loading="cargandoBusquedaSolicitante"
                dense>
                <template v-slot:body-cell-seleccion="scope">
                  <q-td :props="scope">
                    <q-btn label="SELECCIONAR" @click="eventoSeleccionPersonal(scope.row)" size="sm"></q-btn>
                  </q-td>
                </template>
              </q-table>
            </div>

            <div class="col-12 q-gutter-sm text-center">
              <q-btn label="CANCELAR" size="sm" :disable="cargandoBusquedaSolicitante" v-close-popup></q-btn>
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

export default {
  name: 'Devoluciones',
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
      condiciones: [
        {id: 0, descripcion: 'TODOS'},
        /*{id: 1, descripcion: 'SIN ASIGNAR'}, {id: 2, descripcion: 'ASIGNADO'},
        {id: 7, descripcion: 'ENTREGADO'},*/
        {id: 1, descripcion: 'ACTIVO'},
        {id: 3, descripcion: 'EN REPARACIÓN'}, {id: 4, descripcion: 'DE BAJA'}, {id: 5, descripcion: 'POR DEVOLVER'},
        {id: 6, descripcion: 'DEVUELTO'},
      ],
      equipo: Vue.util.extend({}, NUEVO_EQUIPO),
      equipoSeleccionado: null,
      tickets: [],
      columnasTablaEquipo: [
        {name: 'imei', label: 'IMEI', field: 'imei', align: 'left', style: 'width: 40px; white-space:normal;'},
        {name: 'modelo', label: 'MARCA / MODELO', field: 'modeloDesc', align: 'center', style: 'width: 90px; white-space:normal;'},
        {name: 'telefono', label: 'NÚMERO', field: 'numero', align: 'left', style: 'width: 140px; white-space:normal;'},
        {name: 'dependencia', label: 'DEPENDENCIA', field: 'dependenciaNombre', align: 'left', style: 'width: 200px; white-space:normal;'},
        {name: 'cargo', label: 'SERVICIO', field: 'cargoDesc', align: 'left', style: 'width: 180px; white-space:normal;'},
        {name: 'personalAsignado', label: 'ASIGNADO A', field: 'personalNombre', align: 'left', style: 'width: 190px; white-space:normal;'},
        //{name: 'ultimaAsignacion', label: 'FECHA DE ASIGNACIÓN', field: 'ultimaAsignacion', align: 'left'},
        {name: 'estado', label: 'ESTADO', field: 'estadoDesc', align: 'center', classes: r=>this.obtenerClaseEstado(r.estado)},
        {name: 'condicion', label: 'CONDICIÓN', field: 'condicionDesc', align: 'center', classes: r=>this.obtenerClaseCondicion(r.condicion)},
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
        //{name: 'tipo', label: 'TIPO', field: r=>r.type, align: 'left'},
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
      dialogoNuevoEquipoVisible: false,
      dialogoAsignacionesVisible: false,
      dialogoNuevaAsignacionVisible: false,
      dialogoFinalAsignacionVisible: false,
      dialogoCargarActaVisible: false,
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
      //let fecha = new Date();

      this.filtros.usuario = 0;
      this.filtros.personal=this.$q.localStorage.getItem('mda-idPersonal');
    },
    inicializarObjetos: function () {
      let fecha = new Date();
      this.movimiento.fechaFin = date.formatDate(fecha, 'DD/MM/YYYY');
    },
    cargarEquipos: function () {
      let datos = new FormData();
      datos.append('action', 'EQUIPOS_DEVOLUCION');
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
    eventoBtnNuevoEquipo: function () {
      this.dialogoNuevoEquipoVisible = true;
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
    obtenerClaseCondicion: function (condicion) {
      if (condicion===4544) { return 'text-green text-bold' }
      if (condicion===4545) { return 'text-red text-bold' }
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
