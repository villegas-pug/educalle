<template>
  <div>
    <q-card>
      <q-form>
        <!-- Encabezado -->
        <q-card-section class="bg-red-5 text-white row items-center justify-between bg-header-dialog">
          <!-- lblTituloModal -->
          <div class="text-bold">Módulo de seguimiento a familias</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <!-- Pestañas -->
        <q-tabs
          v-model="tab"
          dense
          class="bg-grey-3 text-blue-8"
          active-color="light-blue-5"
          indicator-color="blue-8"
          align="justify"
        >
          <q-tab name="zona" label="Zona" icon="map" />
          <q-tab name="familia" label="Familia" icon="home" />
          <q-tab name="integrantes" label="Integrantes" icon="groups" />
          <q-tab name="evaluaciones" label="Evaluaciones" icon="bar_chart" />
          <q-tab name="plan" label="Plan de Acción" icon="task_alt" />
          <q-tab name="resumen" label="Registro" icon="summarize" />
        </q-tabs>

        <q-separator />

        <!-- Contenido -->
        <q-tab-panels v-model="tab" animated>

          <!-- 🗺️ ZONA -->
          <q-tab-panel name="zona" class="q-pa-md bg-grey-2">
            <q-card flat bordered class="q-pa-md">
              <div class="text-h6 text-blue-9 q-mb-md">Datos de la Zona</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Descripción:</div>
                  <div class="text-body1 text-bold">{{ zona.ZO_NOMBRE_SERVICIO }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Referencia:</div>
                  <div class="text-body1">{{ zona.ZO_REFERENCIA }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Ubicación (Ubigeo):</div>
                  <div class="text-body1">{{ zona.UBI_ID_UBIGEO }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Estado:</div>
                  <div class="text-body1">{{ zona.ZO_ESTADO }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Tipo Referencia Zona:</div>
                  <div class="text-body1">{{ zona.ZO_LIMITES }}</div>
                </div>
                  <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Croquis:</div>
                  <div class="text-body1">
                    <q-btn
                        flat dense icon="attach_file" color="primary"
                        @click="abrirMapa(  zona.ZO_CROQUIS  )"                       
                        title="Croquis"
                    />                    

                  </div>
                </div>
              </div>
            </q-card>
          </q-tab-panel>

          <!-- 👨‍👩‍👧‍👦 FAMILIA -->
          <q-tab-panel name="familia" class="q-pa-md bg-grey-2">
            <q-card flat bordered class="q-pa-md">
              <div class="text-h6 text-blue-9 q-mb-md">Datos de la Familia</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Código de Familia:</div>
                  <div class="text-body1 text-bold">{{ familia.PF_COD_FAMILIA }}</div>
                </div>
                  <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Estado:</div>
                  <div class="text-body1">{{ familia.PF_ESTADO_FAMILIA}}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Domicilio:</div>
                  <div class="text-body1">{{ familia.PF_DIRECCION }}</div>
                </div>
              
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Referencia:</div>
                  <div class="text-body1">{{ familia.PF_REFERENCIA}}</div>
                </div>
                <div class="col-12 col-md-12">
                  <div class="text-subtitle2 text-grey-8">Ubicación:</div>
                  <div class="text-body1">{{ familia.PF_UBICACION}}</div>
                </div>
                <div class=" col-12 col-md-12 text-h6 text-blue-9 q-mb-md">Datos de la Ficha</div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Aa. Hh./Asociación/CentroPoblado:</div>
                  <div class="text-body1">{{ familia.PF_CENTRO_POBLADO}}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Sub Zona:</div>
                  <div class="text-body1">{{ familia.PF_SUBZONA}}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Acompanante Familiar:</div>
                  <div class="text-body1">{{ familia.PF_ACOMPANANTE}}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Como se entero del servicio:</div>
                  <div class="text-body1">{{ familia.PF_COMOSEENTERO}}</div>
                </div>
                 
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Fecha Aplicación:</div>
                  <div class="text-body1">{{ familia.PF_FECHA_APLICACION}}</div>
                </div>                 
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Hora Aplicación:</div>
                  <div class="text-body1">{{ familia.PF_HORA_APLICACION}}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Fecha Compromiso:</div>
                  <div class="text-body1">{{ familia.PF_FECHA_COMPROMISO }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Adjunto Compromiso:</div>
                  <div class="text-body1">
                    <q-btn
                        flat dense icon="attach_file" color="primary"
                        @click="abrirAdjunto(  familia.PF_ADJUNTO_COMPROMISO   )"                       
                        title="Croquis"
                    />    
                 

                  </div>
                </div>


              </div>
            </q-card>
          </q-tab-panel>

          <!-- 🧍‍♀️ INTEGRANTES -->
          <q-tab-panel name="integrantes" class="q-pa-md bg-grey-2">
            <q-card flat bordered class="q-pa-md">
              <div class="text-h6 text-blue-9 q-mb-md">Integrantes de la Familia</div>

              <div class="q-mb-md" v-if="cuidadorPrincipal">
                <div class="text-subtitle1 text-primary text-bold">Cuidador Principal</div>
                <q-card bordered class="q-pa-sm q-mt-sm bg-light-blue-1">
                  <div class="text-body1 text-bold">{{ cuidadorPrincipal.nombre }}</div>
                  <div class="text-caption text-grey-8">DNI: {{ cuidadorPrincipal.dni }}</div>
                  <div class="text-caption text-grey-8">Edad: {{ cuidadorPrincipal.edad }}</div>
                  <div class="text-caption text-grey-8">Parentesco: {{ cuidadorPrincipal.parentesco }}</div>
                </q-card>
              </div>

              <div>
                <div class="text-subtitle1 text-primary text-bold q-mt-md">Listado de NNA</div>
                <q-list bordered class="bg-white rounded-borders">
                  <q-item v-for="(integrante, i) in otrosIntegrantes" :key="i" class="q-py-sm">
                    <q-item-section>
                      <div class="text-body1 text-bold">{{ integrante.nombreCuidador }}</div>
                      <div class="text-caption text-grey-7">
                        DNI: {{ integrante.numeroDocumento }} | Edad: {{ integrante.edad }} | Parentesco: {{ integrante.descParentesco }} 
                      </div>
                      <div class=" bg-red-2" v-if="integrante.tipoEgresoNna != null">
                         {{ integrante.tipoEgresoNna }}
                      </div>
                        <div class=" bg-green-2 q-mt-sm" v-if="integrante.estadoAprobadoNna == 'A' ">
                         EGRESO HA SIDO APROBADO
                      </div>
                    </q-item-section>
                    <q-item-section>
                        <div align="right">
                             <q-btn color="red" size="sm"  label="EGRESAR - NNA" v-if="integrante.tipoEgresoNna == null " @click="guardarEgresoNna(integrante)" />
                        </div>
                        
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-card>
          </q-tab-panel>

          <!-- 📊 EVALUACIONES -->
          <q-tab-panel name="evaluaciones" class="q-pa-md bg-grey-2">
            <div class="text-h6 text-blue-9 q-mb-md">Resultados de las Evaluaciones</div>

            <!-- Evaluación de Riesgo -->
            <q-card flat bordered class="q-pa-md q-mb-md">
              <div class="text-subtitle1 text-bold text-primary q-mb-sm">
                <q-icon name="warning" color="amber-6" size="md" class="q-mr-sm" />
                Evaluación de Riesgo
              </div>
              <q-separator />
              <div class="row q-col-gutter-md q-mt-sm">
                <div v-for="(item, i) in evaluacionRiesgo" :key="i" class="col-12 col-md-3">
                  <q-card bordered class="q-pa-sm text-center bg-light-blue-1">
                    <div class="text-subtitle2 text-grey-9">{{ item.oportunidad }}</div>
                    <div class="text-h6 text-bold" :class="asignarColorNivel(item.nivel)">{{ item.nivel }}</div>
                    <div class="text-caption text-grey-7">Puntaje: {{ item.sumatoria }}</div>
                  </q-card>
                </div>
              </div>
            </q-card>

            <!-- Evaluación de Competencias Parentales -->           
            <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-subtitle1 text-blue-8 q-mb-sm">
                      Evaluación de Competencias Parentales
                    </div>
                    <div class="text-caption text-grey-7 q-mb-md">
                      Seguimiento del desarrollo de competencias parentales en cada etapa.
                    </div>

                    <!-- === CARD RESUMEN GENERAL === -->
                  <div class="row justify-center q-mb-md">
              <div class="col-12 col-md-6 col-lg-4">
                <q-card bordered class="shadow-2 bg-blue-1">
                  <q-card-section class="text-left">
                    <div class="text-subtitle2 text-blue-10">
                      <q-icon name="assessment" class="q-mr-sm" /> 
                      Resumen General
                    </div>

                    <div class="q-mt-sm">
                      <div class="q-mb-xs">
                        <q-badge color="blue-3" text-color="blue-10" class="q-mb-xs "  >
                          Evaluación Inicial
                        </q-badge>
                        <div class="text-body2">
                          <b>Puntaje total:</b> {{ resumenCompetencias?.puntaje_inicial?? 'no hay datos' }} <br>
                          <b>Clasificación:</b> {{ resumenCompetencias?.clasificacion_inicial?? 'no hay datos' }}
                        </div>
                      </div>

                      <div class="q-mb-xs">
                        <q-badge color="amber-3" text-color="amber-10" class="q-mb-xs">
                          Evaluación Intermedia
                        </q-badge>
                        <div class="text-body2">
                          <b>Puntaje total:</b> {{ resumenCompetencias?.puntaje_intermedia?? 'no hay datos' }} <br>
                          <b>Clasificación:</b> {{ resumenCompetencias?.clasificacion_intermedia?? 'no hay datos' }}
                        </div>
                      </div>

                      <div>
                        <q-badge color="green-3" text-color="green-10" class="q-mb-xs">
                          Evaluación Final
                        </q-badge>
                        <div class="text-body2">
                          <b>Puntaje total:</b> {{ resumenCompetencias?.puntaje_final?? 'no hay datos' }} <br>
                          <b>Clasificación:</b> {{ resumenCompetencias?.clasificacion_final?? 'no hay datos' }}
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

        <!-- === CARDS INDIVIDUALES POR ÁREA === -->
        <div class="row q-col-gutter-md">
          <div
            v-for="(area, i) in evaluacionCompetencias"
            :key="i"
            class="col-12 col-md-6 col-lg-4"
          >
            <q-card bordered class="shadow-1">
              <q-card-section>
                <div class="text-subtitle2 text-primary">
                  {{ area.area }}
                </div>
                <div class="q-mt-sm">

                  <div class="q-mb-xs">
                    <q-badge color="blue-2" text-color="blue-10" class="q-mb-xs">
                      Evaluación Inicial
                    </q-badge>
                    <div class="text-body2">
                      Puntaje: {{ area.puntaje_inicial?? 'no hay datos' }} <br>
                      Clasificación: {{ area.clasificacion_inicial?? 'no hay datos' }}
                    </div>
                  </div>

                  <div class="q-mb-xs">
                    <q-badge color="amber-2" text-color="amber-10" class="q-mb-xs">
                      Evaluación Intermedia
                    </q-badge>
                    <div class="text-body2">
                      Puntaje: {{ area.puntaje_intermedia?? 'no hay datos' }} <br>
                      Clasificación: {{ area.clasificacion_intermedia?? 'no hay datos' }}
                    </div>
                  </div>

                  <div>
                    <q-badge color="green-2" text-color="green-10" class="q-mb-xs">
                      Evaluación Final
                    </q-badge>
                    <div class="text-body2">
                      Puntaje: {{ area.puntaje_final?? 'no hay datos' }} <br>
                      Clasificación: {{ area.clasificacion_final?? 'no hay datos' }}
                    </div>
                  </div>

                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

       
      </q-card-section>
    </q-card>

          </q-tab-panel>

          <!-- 📆 PLAN DE ACCIÓN -->
          <q-tab-panel name="plan" class="q-pa-md bg-grey-2">
            <div class="text-h6 text-blue-9 q-mb-md">Plan de Acción Familiar</div>

            <!-- Resumen general -->
            <q-card flat bordered class="q-pa-md q-mb-md bg-light-blue-1" v-show="false">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-subtitle1 text-grey-8">Avance General</div>
                  <div class="text-h5 text-bold text-teal-8">{{ porcentajeCumplimiento??0 }}%</div>
                </div>
                <q-linear-progress
                  :value="porcentajeCumplimiento / 100"
                  color="teal-6"
                  track-color="grey-4"
                  rounded
                  size="20px"
                  class="col-6"
                />
              </div>
            </q-card>

            <!-- Tabla comparativa -->
            <q-card flat bordered class="q-pa-md q-mb-md">
              <div class="text-subtitle1 text-primary q-mb-sm">
                Sesiones Registradas
              </div>

              <div style="max-height: 350px; overflow-y: auto; overflow-x: auto;" >

                
              <q-markup-table flat bordered style="min-width: 1400px; white-space: nowrap;" >
                <thead class="bg-blue-1 text-weight-bold">
                  <tr>
                    <th>#</th>
                    <th>Tipo Sesión</th>
                    <th>Dominio Temático</th>
                    <th>Sesión</th>
                    <th>Fecha Programada</th>
                    <th>Fecha Ejecutada</th>
                    <th>Estado</th>
                  </tr>
                </thead>
               <tbody>
            <!-- Si hay sesiones -->
            <template v-if="sesiones && sesiones.length > 0">
                <tr v-for="(s, i) in sesiones" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ obtenerNombre(s.objetivo.tipoSesion) }}</td>
                <td>{{ s.objetivo?.nombre }}</td>
                <td>{{ s.sesion?.nombre }}</td>
                <td>{{ convertirFechaISO(s.fechaRegistra) }}</td>
                <td>{{ formatearFechaHora1(sesionesEjecutadas[s.idDetPatfam]?.[0]?.fecHoraIni) || '-' }}</td>
                <td>
                    <q-chip
                    :color="sesionesEjecutadas[s.idDetPatfam]?.[0]?.fecHoraIni   ? 'teal-6' : 'red-5'"
                    text-color="white"
                    :icon="  sesionesEjecutadas[s.idDetPatfam]?.[0]?.fecHoraIni   ? 'check_circle' : 'highlight_off' "
                    :label=" sesionesEjecutadas[s.idDetPatfam]?.[0]?.fecHoraIni   ? 'Ejecutada' : 'No Ejecutada'"
                    />
                </td>
                </tr>
            </template>

          <!-- Si no hay sesiones -->
          <tr v-else>
            <td colspan="7" class="text-center text-grey">
              Recurso no encontrado
            </td>
          </tr>
        </tbody>

              </q-markup-table>
        </div>

      </q-card>

            <!-- Resumen de sesiones -->
            <q-card flat bordered class="q-pa-md bg-light-blue-1 text-center">
              <div class="text-subtitle1 text-blue-9 q-mb-sm">Resumen de Sesiones</div>
              <div class="row justify-around">
                <div class="col-4 text-teal-8">
                  <q-icon name="check_circle" color="teal-6" size="md" />
                  <div class="text-bold">{{ sesionesCompletadas }}</div>
                  <div class="text-caption text-grey-8">Completadas</div>
                </div>
                <div class="col-4 text-red-8">
                  <q-icon name="highlight_off" color="red-5" size="md" />
                  <div class="text-bold">{{ sesionesPendientes }}</div>
                  <div class="text-caption text-grey-8">No Completadas</div>
                </div>
              </div>
            </q-card>
          </q-tab-panel>

          <!-- 📄 RESUMEN -->
          <q-tab-panel name="resumen" class="q-pa-md bg-grey-2">
            <q-card flat bordered class="q-pa-md ">
              <div class="text-h6 text-center text-blue-9 q-mb-md">
                REGISTRO DEL EGRESO
              </div>
              <!-- v-html="mensajeEgreso" -->
              <div v-html="mensajeEgreso">

              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.tipoEgreso"
                    label="Tipo de Egreso"
                    :options="comboTipoEgresoFam"
                    option-value="value" option-label="label" 
                    emit-value map-options
                    dense
                    outlined
                    :readonly="datosFila.tipoOperacion =='APROB' "
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.fechaEgreso"
                    label="Fecha de Egreso"
                    type="date"
                    dense
                    outlined
                    :min="minFechaMesActual"
                    :max="maxFechaMesActual"
                    :readonly="datosFila.tipoOperacion =='APROB' "
                  />
                </div>
                <div align="left" v-if="this.datosFila.tipoEgreso != null" style="margin-top: 20px;margin-left: 15px;" class=" col-12 bg-red-1 text-red-10  ">
                    <div style="color: red;"> FAMILIA YA HA SIDO EGRESADA</div>      
                </div>
                <div align="left" v-if="this.datosFila.estadoAprobado == 'A' " style="margin-top: 20px;margin-left: 15px;" class=" col-12 bg-green-1 text-red-10  ">
                    <div style="color: black;"> EGRESO YA HA SIDO APROBADO</div>      
                </div>
              </div>

                <div class="flex flex-center column">
                        <!-- uploader -->
                        <Uploader
                            @cerrar=""
                            :data="datosFila"
                            tipoAnexo="ADJUNTO_EGRESO"
                            :numAnexo="12"
                        
                        />
                </div>
              
            </q-card>
            <q-card-actions align="center" class="q-pa-md ">
              <q-btn color="red" size="sm"  label="APROBAR" v-if="datosFila.tipoOperacion == 'APROB' "  @click="aprobarEgreso" />
              <q-btn color="red" size="sm"  label="GUARDAR"  @click="guardarEgreso" v-if="datosFila.tipoOperacion != 'APROB' " />
              <!-- v-if="datosFila.tipoOperacion != 'APROB' && datosFila.tipoEgreso == null " -->
              <q-btn  color="red" size="sm"  label="CANCELAR" v-close-popup />
            </q-card-actions>
          </q-tab-panel>

        </q-tab-panels>
      </q-form>
    </q-card>

       <q-dialog v-model="modalMapa" >          
        <MapaBusqueda      
            @cerrar="modalMapa = false"
            :descGeoJson="descGeoJson"
            :modoAbrir="modoAbrir"
            style="max-width: 800px; width: 100%;"
           
        />       
        
    </q-dialog>

    <q-dialog v-model="modalEgresarNna" >  
        <q-card style="width: 90%">
             <q-card-section class="bg-header-dialog">
                      <span style="float: right;">
                        <q-btn icon="close" v-close-popup flat round size="sm"></q-btn>
                      </span>
                <div class="text-body2 text-bold ">Egresar Nna </div>
            </q-card-section>
            <q-card-section>
            <q-card flat bordered class="q-pa-md ">
              <div class="text-h6 text-center text-blue-9 q-mb-md">
                REGISTRO DEL EGRESO
              </div>
                <div v-html="mensajeEgreso">

              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">                                        
                  <q-select
                    v-model="formNna.tipoEgreso"
                    label="Tipo de Egreso"
                    :options="comboTipoEgresoNna"
                    dense
                    outlined
                    :readonly="datosFila.tipoOperacion =='APROB' "
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formNna.fechaEgreso"
                    label="Fecha de Egreso"
                    type="date"
                    dense
                    outlined
                    :readonly="datosFila.tipoOperacion =='APROB' "
                  />
                </div>
                 <div align="left" v-show="showMensajeIntegrante" style="margin-top: 20px;margin-left: 15px;" class=" col-12 bg-red-1 text-red-10  ">
                    <div style="color: red;"> NNA YA HA SIDO EGRESADO </div>      
                </div>
                <div align="left" v-show="showMensajeAprobado" style="margin-top: 20px;margin-left: 15px;" class=" col-12 bg-green-1 text-red-10  ">
                    <div style="color: black;"> EGRESO YA HA SIDO APROBADO </div>      
                </div>
              </div>
              
            </q-card>
            </q-card-section>
               <q-card-actions align="center" class="q-pa-md ">
              <q-btn color="red" size="sm"  label="APROBAR" v-if="datosFila.tipoOperacion =='APROB' " @click="aprobarEgresoNna" />
              <q-btn color="red" size="sm"  label="GUARDAR" v-if="datosFila.tipoOperacion !='APROB' " @click="saveEgresoNna" />
              <q-btn  color="red" size="sm"  label="CANCELAR" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>

  </div>
</template>


<script>
import Uploader from './Acercandonos/Uploader.vue';
import MapaBusqueda from './MapaBusqueda.vue';
//import Uploader from '../Uploader.vue';

export default {
  name: "VisorEgreso",
  components:{
    MapaBusqueda,
    Uploader
  },
  props:{
      datosFila: {
            type: Object,
            default: () => ({})
        }
  },
  data() {
    return {
        hostAcercandonos:process.env.API_URL_ACERCANDONOS,
      tab: "plan",
      zona: {
        ZO_NOMBRE_SERVICIO: "Servicio Social San Juan",
        ZO_DESCRIPCION: "Zona de intervención urbana",
        ZO_COD_TIPO: "Urbana",
        UBI_ID_UBIGEO: "150122 - Lima / San Juan de Lurigancho",
        ZO_LIMITES:
          "Norte: Av. Las Flores, Sur: Río Rímac, Este: Av. Wiesse, Oeste: Av. Próceres",
        ZO_REFERENCIA: "CEDIF",
        ZO_ESTADO: ''
      },
      familia: {
        PF_COD_FAMILIA: "FAM-2025-004",
        PF_OBSERVACIONES:
          "Familia con participación activa en talleres de desarrollo social.",
        PF_ESTADO_PROCESO: "En seguimiento final",
        PF_DIRECCION:'',
        PF_REFERENCIA:'',
        PF_UBICACION:'',
        PF_CENTRO_POBLADO:'',
        PF_SUBZONA:'',
        PF_ACOMPANANTE:'',
        PF_COMOSEENTERO:null,
        PF_FECHA_APLICACION: null,
        PF_HORA_APLICACION: null,
        PF_FECHA_COMPROMISO:null,
        PF_ADJUNTO_COMPROMISO: null,
        PF_ESTADO_FAMILIA: null
      },
      cuidadorPrincipal: {
        nombre: "María López Díaz",
        dni: "46782345",
        edad: 42,
        parentesco: "Madre",
      },
      otrosIntegrantes: [],
      evaluacionRiesgo: [
        { etapa: "Evaluación Previa", resultado: "Moderado", puntaje: "65/100", color: "text-orange" },
        { etapa: "Evaluación Inicial", resultado: "Alto", puntaje: "40/100", color: "text-negative" },
        { etapa: "Evaluación Intermedia", resultado: "Medio", puntaje: "70/100", color: "text-warning" },
        { etapa: "Evaluación Final", resultado: "Bajo", puntaje: "90/100", color: "text-positive" },
      ],
      evaluacionCompetencias: [
        { etapa: "Evaluación Inicial", resultado: "Bajo", puntaje: "50/100", color: "text-negative" },
        { etapa: "Evaluación Intermedia", resultado: "Medio", puntaje: "70/100", color: "text-warning" },
        { etapa: "Evaluación Final", resultado: "Alto", puntaje: "90/100", color: "text-positive" },
      ],
      sesiones: [],
      sesionesEjecutadas: {},
      form: {
        tipoEgreso: null,
        fechaEgreso: null,
      },
       formNna: {
        tipoEgreso: null,
        fechaEgreso: null,
      },

        modoAbrir: null,
        descGeoJson : null,
        modalMapa: false,
        modalEgresarNna: false,
        idIntegrante: null,
        showMensajeIntegrante: false,
        showMensajeAprobado: false,
        lblTituloModal: null,


       evaluacionCompetencias: [
      {
        area: 'Vínculo afectivo',
        inicial: { puntaje: 12, clasificacion: 'En desarrollo' },
        intermedia: { puntaje: 15, clasificacion: 'Adecuado' },
        final: { puntaje: 17, clasificacion: 'Fortalecido' }
      },
      {
        area: 'Cuidado y protección',
        inicial: { puntaje: 10, clasificacion: 'Bajo' },
        intermedia: { puntaje: 14, clasificacion: 'En desarrollo' },
        final: { puntaje: 16, clasificacion: 'Adecuado' }
      },
      {
        area: 'Comunicación familiar',
        inicial: { puntaje: 13, clasificacion: 'En desarrollo' },
        intermedia: { puntaje: 15, clasificacion: 'Adecuado' },
        final: { puntaje: 17, clasificacion: 'Fortalecido' }
      }
    ],

    resumenCompetencias: {
      inicial: { puntajeTotal: 35, clasificacion: 'En desarrollo' },
      intermedia: { puntajeTotal: 44, clasificacion: 'Adecuado' },
      final: { puntajeTotal: 50, clasificacion: 'Fortalecido' }
    },
    comboTipoEgresoFam : [
          {
            value: 'CUMPLIMIENTO',
            label:'CUMPLIMIENTO',
            tipo: 2
          },
          {
            value: 'CUMPLIMIENTO ANTICIPADO',
            label: 'CUMPLIMIENTO ANTICIPADO',
            tipo: 3            
          },
          {
            value: 'DESERCIÓN',
            label: 'DESERCIÓN',
            tipo: 4
          },
          {
            value: 'CAMBIO DE DOMICILIO',
            label: 'CAMBIO DE DOMICILIO',
            tipo: 1
          },
          {
            value: 'TRABAJO',
            label: 'TRABAJO',
            tipo: 1
          },              
          {
            value: 'DESINTERÉS',
            label: 'DESINTERÉS',
            tipo : 4
          },             
          {
            value: 'SIN NNA A CARGO',
            label: 'SIN NNA A CARGO',
            tipo: 1
          },              
          {
            value: 'FALLECIMIENTO',
            label: 'FALLECIMIENTO',
            tipo: 1
          },             
          {
            value: 'DERIVACIÓN DEL CUIDADOR PRINCIPAL',
            label: 'DERIVACIÓN DEL CUIDADOR PRINCIPAL',
            tipo: 1
          }               
                    
    ],
    comboTipoEgresoNna : [
          {
            value: 'CUMPLIMIENTO',
            label: 'CUMPLIMIENTO',
            tipo: 2
          },
          {
            value: 'CAMBIO DE DOMICILIO',
            label: 'CAMBIO DE DOMICILIO',
            tipo: 1
          },
          {
            value: 'TRABAJO DEL CUIDADOR PRINCIPAL',
            label: 'TRABAJO DEL CUIDADOR PRINCIPAL',
            tipo: 1
          },
          {
            value: 'DESINTERÉS DEL CUIDADOR PRINCIPAL',
            label: 'DESINTERÉS DEL CUIDADOR PRINCIPAL',
            tipo: 4
          },
          {
            value: 'MAYORIA DE EDAD',
            label: 'MAYORIA DE EDAD',
            tipo: 1
          },
          {
            value: 'FALLECIMIENTO DEL CUIDADOR PRINCPAL',
            label: 'FALLECIMIENTO DEL CUIDADOR PRINCPAL',
            tipo: 1
          },
          {
            value: 'DERIVACIÓN',
            label: 'DERIVACIÓN',
            tipo: 1
          }             
    ],
             
    validacionesEgreso: {
      EvaRiesgoIntermedia: {
        puntaje: 0,
        nivel: null
      },
      EvaCompeIntermedia: {
        puntaje: 0,
        nivel: null
      },
      EvaRiesgoFinal: {
        puntaje: 0,
        nivel: null
      },
      EvaCompeFinal: {
        puntaje: 0,
        nivel: null
      },
      AnalisisNna :{
        edad : 0
      }
    },
    mensajeEgreso: null,
    estadoFamiliaCompetencias: null


    };
  },
  async created(){
 
    this.obtenerDatosFamiliaPotencial();
    this.obtenerIntegrantesFamilia();
    this.obtenerResultadosEvaluacionRiesgo();
    this.obtenerResultadosCompetenciasParentales();

    this.form.tipoEgreso = this.datosFila.tipoEgreso;
    this.form.fechaEgreso = this.datosFila.fechaEgreso;

    if(this.datosFila.tipoOperacion == 'APROB'){
        this.lblTituloModal= 'APROBAR EGRESO';
    }else{
        this.lblTituloModal ='REGISTRO DE EGRESO';
    }
    
    //console.log("datos fila: ", this.datosFila);
    //this.cargarSesiones(310);
  },
   async mounted() {
    await this.obtenerRespuestasPrevias();
    await this.cargarSesiones();  

    this.validacionesEgreso.sesionesCompletadas = this.sesionesCompletadas;
    this.validacionesEgreso.sesionesNoCompletadas = this.sesionesPendientes;
    
    
    this.analisisAutomaticoEgreso('FAM');
    
  },
  computed: {
    porcentajeCumplimiento() {
      const ejecutadas = this.sesiones.filter((s) => s.ejecutada).length;
      return Math.round((ejecutadas / this.sesiones.length) * 100);
    },
    sesionesCompletadas() {
        return this.sesiones.filter(
            (s) => this.sesionesEjecutadas[s.idDetPatfam]?.[0]?.fecHoraIni
        ).length;
    },
    sesionesPendientes() {
        return this.sesiones.filter(
            (s) => !this.sesionesEjecutadas[s.idDetPatfam]?.[0]?.fecHoraIni
        ).length;
    },
    minFechaMesActual () {
      const hoy = new Date()
      const yyyy = hoy.getFullYear()
      const mm = String(hoy.getMonth() + 1).padStart(2, '0')
      return `${yyyy}-${mm}-01`
    },
    maxFechaMesActual () {
      const hoy = new Date()
      const yyyy = hoy.getFullYear()
      const mm = String(hoy.getMonth() + 1).padStart(2, '0')
      const ultimoDia = new Date(yyyy, hoy.getMonth() + 1, 0).getDate()
      return `${yyyy}-${mm}-${ultimoDia}`
    }

  },
    methods: {
        mostrarMensaje: function (mensaje, color, icono) {
            this.$q.notify({message: mensaje, color: color, icon: icono, position: 'top-right'});
        },
           mostrarConfirmacion(titulo, mensaje, onOk) {
            this.$q.dialog({
                 title: `<div class="row items-center">
                        <q-icon name="help_outline" color="primary" size="md" class="q-mr-sm" />
                        <span>${titulo}</span>
                        </div>`,
                message: `<div style="font-size: 15px; line-height: 1.5; color: #555;">
                    ${mensaje}
                </div>`,
                html: true,
                persistent: true,
                 ok: {
                    label: 'Aprobar',
                    color: 'green',
                    unelevated: true,
                    icon: 'check_circle'
                },
                cancel: {
                    label: 'Cancelar',
                    color: 'red',
                    unelevated: true
                },               
                class: 'q-pa-md'
            })
                .onOk(onOk)
                .onCancel(() => {
                    // acción opcional al cancelar
                });
        },
        analisisAutomaticoEgreso(modoEgreso){

          var mensaje = '';
          var tipoEgreso = '';
          var estadoFamilia =  '';
          var tipoPermitidos = [];

          if(this.validacionesEgreso.sesionesCompletadas >= 18 && this.validacionesEgreso.sesionesCompletadas <= 24 ){            
            mensaje = "si tiene mas de 18 sesiones";

            const EvaRiesgoFinal = this.validacionesEgreso.EvaRiesgoFinal;
            const EvaCompeFinal = this.validacionesEgreso.EvaCompeFinal;

            if(EvaRiesgoFinal.puntaje != 0 &&  EvaCompeFinal.puntaje ){
              tipoEgreso = "EGRESO POR CUMPLIMIENTO";
              tipoPermitidos = [1, 2];

              if(EvaCompeFinal.nivel == 'EN PROCESO' || EvaCompeFinal.nivel == 'LOGRADO' ){
                estadoFamilia = "COMPETENCIAS FORTALECIDAS";
              }
            }else{
              tipoEgreso = "EGRESO POR DESISTIMIENTO O DESERCIÓN 5";
              tipoPermitidos = [1, 4];
            }

          }else{
            //proceso no tiene mas de 18 sesiones...

            if(this.validacionesEgreso.sesionesCompletadas >= 8 ){
              mensaje = "SI tiene mas de 8 sesiones";
              const EvaRiesgoInter = this.validacionesEgreso.EvaRiesgoIntermedia;
              const EvaCompeInter = this.validacionesEgreso.EvaCompeIntermedia;

              if(EvaRiesgoInter.puntaje != 0 &&  EvaCompeInter.puntaje ){
                mensaje = "SI tiene evaluaciones INTERMEDIAS";
                if(EvaCompeInter.nivel == 'EN PROCESO' || EvaCompeInter.nivel == 'LOGRADO' ){
                  tipoEgreso = "EGRESO POR CUMPLIMIENTO ANTICIPADO";
                  tipoPermitidos = [1, 3];

                  if(this.validacionesEgreso.sesionesCompletadas >= 13 ){
                    mensaje = "Aplicar evaluaciones finales";

                    if(EvaCompeInter.nivel == 'EN PROCESO' || EvaCompeInter.nivel == 'LOGRADO' ){
                      estadoFamilia = "COMPETENCIAS FORTALECIDAS";
                    }else{
                      tipoEgreso = "EGRESO POR DESISTIMIENTO O DESERCIÓN 4";
                      tipoPermitidos = [1, 4];
                    }


                  }else{
                    //DUPLICAR EVA. INTERMEDIA :: EVA. SALIDA

                    this.validacionesEgreso.EvaCompeFinal.puntaje = this.validacionesEgreso.EvaCompeIntermedia.puntaje;
                    this.validacionesEgreso.EvaCompeFinal.nivel = this.validacionesEgreso.EvaCompeIntermedia.nivel;

                    estadoFamilia = "COMPETENCIAS FORTALECIDAS";
                  }

                }else{
                  tipoEgreso = "EGRESO POR DESISTIMIENTO O DESERCIÓN 3";
                  tipoPermitidos = [1, 4];
                }

              }else{
                mensaje = "NO tiene evaluaciones INTERMEDIAS";
                tipoEgreso = "EGRESO POR DESISTIMIENTO O DESERCIÓN 2";
                tipoPermitidos = [1, 4];
              }

            }else{
              mensaje = "NO tiene mas de 8 sesiones";
              tipoEgreso = "EGRESO POR DESISTIMIENTO O DESERCIÓN";
              tipoPermitidos = [1, 4];
            }
           
            
          }

          if(modoEgreso == "FAM"){
            this.comboTipoEgresoFam = this.comboTipoEgresoFam.filter( i => tipoPermitidos.includes(i.tipo) );
          }else{
            if(modoEgreso == "NNA"){
              this.comboTipoEgresoNna = this.comboTipoEgresoNna.filter( i => tipoPermitidos.includes(i.tipo) );
            }

          }
          
          this.estadoFamiliaCompetencias = estadoFamilia;

          this.mensajeEgreso = mensaje + '<br>' + tipoEgreso + '<br>' + estadoFamilia;

        },
        aprobarEgresoNna(row){
           
              this.mostrarConfirmacion(
                'Confirmar',
                `¿Está seguro de Aprobar el egreso de esta NNA ? `,
                () => {
                    if (this.datosFila.idFamilia && typeof this.datosFila.idFamilia === 'number') {

                        this.$axios.post(`${this.hostAcercandonos}/registrarEgreso`, {
                            
                            idZona: this.datosFila.idZona,
                            idServicio: this.datosFila.idServicio,
                            idFamilia: this.datosFila.idFamilia,
                            tipoEgreso: '',
                            fechaEgreso: '',
                            idIntegrante: this.idIntegrante,
                            modo: 'APROBAR_EGRESO_NNA',
                            idUsuario: this.$q.localStorage.getItem('mda-idUsuario')

                        })
                            .then(() => {

                                this.$emit('cerrar');
                                this.$emit('refrescar');

                                this.mostrarMensaje('EGRESO APROBADO EXITOSAMENTE', 'green', 'check_circle');
                            })
                            .catch(err => {
                                this.mostrarMensaje('ERROR AL APROBAR EGRESO', 'red', 'warning');
                            });
                    }
                }
            );

        },
        async aprobarEgreso(){
              this.mostrarConfirmacion(
                'Confirmar',
                `¿Está seguro de Aprobar el egreso de esta familia?`,
                () => {
                    if (this.datosFila.idFamilia && typeof this.datosFila.idFamilia === 'number') {

                        this.$axios.post(`${this.hostAcercandonos}/registrarEgreso`, {
                            
                            idZona: this.datosFila.idZona,
                            idServicio: this.datosFila.idServicio,
                            idFamilia: this.datosFila.idFamilia,
                            tipoEgreso: '',
                            fechaEgreso: '',
                            modo: 'APROBAR_EGRESO',
                            idUsuario: this.$q.localStorage.getItem('mda-idUsuario')

                        })
                            .then(() => {

                                this.$emit('cerrar');
                                this.$emit('refrescar');

                                this.mostrarMensaje('EGRESO APROBADO EXITOSAMENTE', 'green', 'check_circle');
                            })
                            .catch(err => {
                                this.mostrarMensaje('ERROR AL APROBAR EGRESO', 'red', 'warning');
                            });
                    }
                }
            );
        },
        async guardarEgreso() {

            try {

             // console.log("imprimir tipo egreso: ", this.form.tipoEgreso);
              //return;

              const response = await this.$axios.post(
                `${this.hostAcercandonos}/registrarEgreso`,
                {
                    idZona: this.datosFila.idZona,
                    idServicio: this.datosFila.idServicio,
                    idFamilia: this.datosFila.idFamilia,
                    tipoEgreso: this.form.tipoEgreso,
                    fechaEgreso: this.form.fechaEgreso,
                    modo: this.datosFila.modo,
                    idUsuario: this.$q.localStorage.getItem('mda-idUsuario'),
                    estadoFamilia: this.estadoFamiliaCompetencias
                }
              )
                this.$emit('cerrar');
                this.$emit('refrescar');

                this.mostrarMensaje('EGRESO SE REGISTRÓ CORRECTAMENTE', 'green', 'info')

                // opcional: limpiar formulario o refrescar datos
                // this.form = {}
                // this.cargarEgresos()

            } catch (error) {
                const mensaje =
                error.response?.data?.message ||
                'ERROR AL GUARDAR EGRESO. INTENTE NUEVAMENTE.'

                this.mostrarMensaje(mensaje, 'red', 'warning')
            }


        },
        guardarEgresoNna(row){            
           
            if(this.otrosIntegrantes.length > 1 ){

              const cantDisponiblesEgresados = this.otrosIntegrantes.length - row.cantEgresados;
             

              if(cantDisponiblesEgresados > 1){

                
                this.idIntegrante = row.idIntegrante;
                this.formNna.tipoEgreso = row.tipoEgresoNna;
                this.formNna.fechaEgreso = row.fechaEgresoNna;
                if(row.tipoEgresoNna != null) this.showMensajeIntegrante = true;
                if(row.estadoAprobadoNna != null) this.showMensajeAprobado = true;
                //AnalisisNna
                const calcularEdadNna = this.calcularEdadNna(row.fechaNacimiento);
                this.validacionesEgreso.AnalisisNna.edad = calcularEdadNna;
                this.modalEgresarNna = true;
                this.analisisAutomaticoEgreso("NNA");

                  

              }else{
                this.mostrarMensaje("No se puede egresar al úlimo NNA ACTIVO. Debe egresar a toda la familia.", 'orange', 'warning');
              } 

            }else{              
              this.mostrarMensaje("No se puede egresar al úlimo NNA. Debe egresar a toda la familia.", 'orange', 'warning');
            }
            
        },
        async saveEgresoNna(){
            try {
                const response = await this.$axios.post(
                `${this.hostAcercandonos}/registrarEgreso`,
                    {
                        idZona: this.datosFila.idZona,
                        idServicio: this.datosFila.idServicio,
                        idFamilia: this.datosFila.idFamilia,
                        tipoEgreso: this.formNna.tipoEgreso,
                        fechaEgreso: this.formNna.fechaEgreso,
                        idIntegrante: this.idIntegrante,
                        idUsuario: this.$q.localStorage.getItem('mda-idUsuario'),
                        modo: 'EGRESO_INTEGRANTE'
                    }
                )
                this.$emit('cerrar');
                this.$emit('refrescar');

                this.mostrarMensaje('EGRESO SE REGISTRÓ CORRECTAMENTE', 'green', 'info')

                // opcional: limpiar formulario o refrescar datos
                // this.form = {}
                // this.cargarEgresos()

            } catch (error) {
                const mensaje =
                error.response?.data?.message ||
                'ERROR AL GUARDAR EGRESO. INTENTE NUEVAMENTE.'

                this.mostrarMensaje(mensaje, 'red', 'warning')
            }
        },
        calcularEdadNna(fechaNacimiento) {
          const hoy = new Date();
          const fn = new Date(fechaNacimiento);

          let edad = hoy.getFullYear() - fn.getFullYear();

          // Ajustar si aún no cumplió años este año
          const mes = hoy.getMonth() - fn.getMonth();
          if (mes < 0 || (mes === 0 && hoy.getDate() < fn.getDate())) {
            edad--;
          }

          return edad;
        },
        async  obtenerDatosFamiliaPotencial(){            
            try {
                const response = await this.$axios.post(`${this.hostAcercandonos}/findAllFamiliasPotencialesByParams`, {
                    anio: this.datosFila.anio,
                    mes: this.datosFila.mes,
                    idZona: this.datosFila.idZona,
                    idServicio: this.datosFila.idServicio,
                    idFamilia: this.datosFila.idFamilia,
                    modo: ''            
                    
                });
               
                const rs = response.data.data[0];
                   

                this.zona.ZO_NOMBRE_SERVICIO = rs.descZona;
                this.zona.UBI_ID_UBIGEO = rs.nomDepartamento + ' - ' + rs.nomProvincia + ' - ' + rs.nomDistrito ;
                this.zona.ZO_REFERENCIA = rs.descOrganizacion;
                this.zona.ZO_ESTADO = rs.estadoZona
                this.zona.ZO_LIMITES = rs.manzanas == null ? rs.limites : rs.manzanas ;
                this.zona.ZO_CROQUIS = rs.geoJson;
                this.familia.PF_DIRECCION = rs.direccion;
                this.familia.PF_REFERENCIA = rs.referencia;
                this.familia.PF_UBICACION = rs.nomDepartamentoDomicilio + ' - ' + rs.nomProvinciaDomicilio + ' - ' + rs.nomDistritoDomicilio ;
                this.familia.PF_CENTRO_POBLADO = rs.descCentroPoblado;  
                this.familia.PF_SUBZONA = rs.descSubZona,
                this.familia.PF_ACOMPANANTE = rs.nombreCompletoEquipo    
                this.familia.PF_COMOSEENTERO = rs.descComoSeEntero;    
    
                this.familia.PF_FECHA_APLICACION = this.convertirFechaISO(rs.fechaEmision);
                this.familia.PF_HORA_APLICACION = this.formatearFechaHora(rs.horaEmision);
                this.familia.PF_FECHA_COMPROMISO = this.convertirFechaISO(rs.fechaCompromiso);
                this.familia.PF_ADJUNTO_COMPROMISO = rs.adjuntoCompromiso,
                this.familia.PF_ESTADO_FAMILIA = rs. estadoApta;

                this.cuidadorPrincipal.nombre = rs.nombreCuidador;
                this.cuidadorPrincipal.dni = rs.numeroDocumento;
                this.cuidadorPrincipal.edad = rs.edad;
                this.cuidadorPrincipal.parentesco = rs.descParentesco;
                    
            } catch (error) {
                this.mostrarMensaje('ERROR AL CARGAR POTENCIALES FAMILIAS', 'red', 'warning');
                return null;
            }
                            
        },
        async  obtenerIntegrantesFamilia(){            
            try {
                const response = await this.$axios.post(`${this.hostAcercandonos}/findAllFamiliasPotencialesByParams`, {
                    anio: this.datosFila.anio,
                    mes: this.datosFila.mes,
                    idZona: this.datosFila.idZona,
                    idServicio: this.datosFila.idServicio,
                    idFamilia: this.datosFila.idFamilia,
                    modo: 'INTEGRANTES'            
                    
                });
                
                const rs = response.data.data.filter(item => item.esCuidador != 1); 

        //            otrosIntegrantes: [
        //     { nombre: "Juan Pérez López", dni: "70234561", edad: 15, parentesco: "Hijo" },
        //     { nombre: "Lucía Pérez López", dni: "71345267", edad: 10, parentesco: "Hija" },
        //   ],
                    

                this.otrosIntegrantes = rs;
                    
            } catch (error) {
                this.mostrarMensaje('ERROR AL CARGAR POTENCIALES FAMILIAS', 'red', 'warning');
                return null;
            }
                            
        },
        abrirMapa(mapa){
            if(mapa == null){
            return ;
            }
            this.modoAbrir = 'ABRIR2';
            this.descGeoJson = mapa;
            this.modalMapa = true;
        },
        convertirFechaISO(fecha) {
                if (!fecha) return null;
                // Suponiendo formato: DD-MM-YYYY
                const [dia, mes, anio] = fecha.split('-');
                return `${anio}-${mes}-${dia}`;
        },
         formatearFechaHora1(fechaISO) {
            if (!fechaISO) return '';
            const fecha = new Date(fechaISO);

            // Partes de la fecha
            const dia = fecha.getDate().toString().padStart(2, '0');
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
            const anio = fecha.getFullYear();

            // Hora y minutos
            const hora = fecha.getHours();
            const minutos = fecha.getMinutes().toString().padStart(2, '0');

              const newHora = this.formatearFechaHora(hora + ':'+minutos );
              

            return `${dia}-${mes}-${anio} ${newHora}`;

          
        },
        formatearFechaHora(horaStr) {
                if (!horaStr) return '';

                const [horas, minutos] = horaStr.split(':').map(Number);

                const periodo = horas >= 12 ? 'PM' : 'AM';
                const horas12 = horas % 12 || 12; // convierte 0 o 12 en 12

                return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
        },
        abrirAdjunto(nombreArchivo) {            
            if(nombreArchivo == null){
                this.mostrarMensaje('NO SE ENCONTRÓ ARCHIVO PARA MOSTRAR', 'red', 'warning');
                return ;
            }
            window.open(`${this.hostAcercandonos}/adjuntos/${nombreArchivo}`, '_blank');
        }, 
        async obtenerResultadosEvaluacionRiesgo() {

            const params = {
                idServicio: this.datosFila.idServicio,  
                idFamilia: this.datosFila.idFamilia, 
                
                modo: 'EVARIESGO_GENERAL'
            };

            // if (idFamilia !== null && idFamilia !== undefined && idFamilia !== '') {
            //     params.append('idFamilia', idFamilia);
            // }

            this.cargandoDepartamentos = true;
            try {
                const response = await this.$axios.post(
                `${this.hostAcercandonos}/findResultadosEvaluacionRiesgo`, params, this.requestConfig);
                
                this.evaluacionRiesgo =   response.data.data;

               

                const EvaRiesgoFinal = response.data.data.filter(i => i.oportunidad == 'Evaluación Final' );     
                const EvaRiesgoIntermedia = response.data.data.filter(i => i.oportunidad == 'Evaluación Intermedia' );           

                if(Array.isArray(EvaRiesgoFinal) && EvaRiesgoFinal.length > 0){
                  
                  this.validacionesEgreso.EvaRiesgoFinal.puntaje = EvaRiesgoFinal[0].sumatoria;
                  this.validacionesEgreso.EvaRiesgoFinal.nivel = EvaRiesgoFinal[0].nivel;
                }

                if(Array.isArray(EvaRiesgoIntermedia) && EvaRiesgoIntermedia.length > 0){
                  
                  this.validacionesEgreso.EvaRiesgoIntermedia.puntaje = EvaRiesgoIntermedia[0].sumatoria;
                  this.validacionesEgreso.EvaRiesgoIntermedia.nivel = EvaRiesgoIntermedia[0].nivel;
                }
              
                // this.obtenerCantidadFases(response.data.data);
                // if(response.data.data.oportunidad != null && this.opcionPrimera == this.params.codOpcion ){
                //     this.disabledBtnNuevo = true;
                    
                // }else{
                    
                //     this.disabledBtnNuevo = false;
                // }
                
            } catch (e) {
                this.mostrarMensaje(e.message, 'red', 'warning');
                return [];
            } finally {
                this.cargandoDepartamentos = false;
            }
        },
        async obtenerResultadosCompetenciasParentales() {

            const params = {
                idServicio: this.datosFila.idServicio,  
                idFamilia: this.datosFila.idFamilia, 
                
                modo: 'COMPARENT_GENERAL'
            };

            // if (idFamilia !== null && idFamilia !== undefined && idFamilia !== '') {
            //     params.append('idFamilia', idFamilia);
            // }

            this.cargandoDepartamentos = true;
            try {
                const response = await this.$axios.post(
                `${this.hostAcercandonos}/findResultadosEvaluacionRiesgo`, params, this.requestConfig);
                  
                 this.resumenCompetencias =   response.data.data[0];
                 this.evaluacionCompetencias = response.data.data.filter(item => item.area !== "Competencias Parentales (Total)");

                  const EvaCompetenciasArea = response.data.data.filter(i => i.area == "Competencias Parentales (Total)" );  
                  
                 
                if(Array.isArray(EvaCompetenciasArea) && EvaCompetenciasArea.length > 0){

                  const EvaCompetencias= EvaCompetenciasArea[0];

                  if(EvaCompetencias){
                    
                    this.validacionesEgreso.EvaCompeFinal.puntaje = EvaCompetencias?.puntaje_final?? 0;
                    this.validacionesEgreso.EvaCompeFinal.nivel = EvaCompetencias?.clasificacion_final?? null;

                    this.validacionesEgreso.EvaCompeIntermedia.puntaje = EvaCompetencias?.puntaje_intermedia?? 0;
                    this.validacionesEgreso.EvaCompeIntermedia.nivel = EvaCompetencias?.clasificacion_intermedia?? null;

                  }
                  
                  
                }


              
                // this.obtenerCantidadFases(response.data.data);
                // if(response.data.data.oportunidad != null && this.opcionPrimera == this.params.codOpcion ){
                //     this.disabledBtnNuevo = true;
                    
                // }else{
                    
                //     this.disabledBtnNuevo = false;
                // }
                
            } catch (e) {
                this.mostrarMensaje(e.message, 'red', 'warning');
                return [];
            } finally {
                this.cargandoDepartamentos = false;
            }
        },
         async obtenerRespuestasPrevias() {

            try{
                      const response = await this.$axios.get(`${this.hostAcercandonos}/findPatfamByIdFamilia?idFamilia=${this.datosFila.idFamilia}`)
                                     

                    // if(res.data === null){
                    //     this.sesiones = [];
                    //     return;
                    // };
                 
                    const data = response.data?.data || {};
                    const detPatfam = data.detPatfam || [];

                    

                     this.sesiones = detPatfam ;

                    // console.log("impimir detalle patfam: ", detPatfam);                    

                 


                }  catch(e) {

                    // console.log( {e});
                   
                    if(e.response?.data?.message == "¡Recurso no encontrado!"){
                        this.sesiones = [];
                    this.mostrarMensaje('No se encontró el Plan de Acción Familiar', 'orange', 'warning');
                    }else{
                        this.mostrarMensaje('ERROR AL CARGAR DATOS PATFAM', 'red', 'warning');
                    }                  
                    
                }
        },
          async cargarSesiones() {

            this.cargandoAliado = true
            try {
                // const res = await this.$axios.get(
                //     `${this.hostAcercandonos}/findDetPatfamById?idDetPatfam=${s.idDetPatfam}`
                // )
                // Luego, por cada sesión, cargar sus ejecuciones
                  
                    for (const s of this.sesiones) {
                        const detalle = await this.$axios.get(
                        `${this.hostAcercandonos}/findDetPatfamById?idDetPatfam=${s.idDetPatfam}`
                        )
                          
                        const sesiones = (detalle.data?.data?.ejecucionSesiones || []).filter(
                        sesion => sesion.eliminado === 0 && sesion.realizoSesion === 1
                        )                          
                 
                        // Guardar en un mapa para acceder rápido
                        this.$set(this.sesionesEjecutadas, s.idDetPatfam, sesiones)
                    }      

            } catch (error) {
                this.$q.notify({type: 'negative', message: 'Error al cargar sesiones'})
            } finally {
                this.cargandoAliado = false
            }
        },
        obtenerFechaEjecutada(idDetPatfam) {      

            const sesiones = this.sesionesEjecutadas[idDetPatfam];
           

            if (!sesiones || sesiones.length === 0) return '-';
            // Suponiendo que solo queremos mostrar la primera fecha ejecutada         
            return this.convertirFechaISO(sesiones[0].fecHoraIni)
            
        },

        obtenerNombre(idTipoSesion){
    
            switch (idTipoSesion) {
                case 6107:
                    return 'SESIONES GENERALES';
                case 6108:
                    return 'SESIONES COMPLEMENTARIAS';
                case 6109:
                    return 'SESIONES PATFAM';
                default:
                    return 'DESCONOCIDO';
            }     

        },
        asignarColorNivel(nivel){
            if(nivel === undefined) return;
            switch (nivel.toLowerCase()) {
                case 'riesgo alto':
                    return 'text-negative';
                case 'riesgo medio':
                    return 'text-warning';
                case 'riesgo bajo':
                    return 'text-positive';
                default:
                    return 'text-warning';
            }        

        }
   },
};
</script>
