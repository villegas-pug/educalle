<template>
    <q-page class="q-pa-md">
        <div class="row q-col-gutter-sm">
            <div class="col-12 text-center text-bold text-h6">REGISTRO DE TERCEROS</div>

            <div class="row col-12 q-col-gutter-xs">

                <div class="col-12 col-sm-1">
                    <q-input v-model="filtro.anho" label="N° de documento" v-on:keyup.enter="cargarTercero" mask="###############" :autofocus="true" outlined dense></q-input>
                </div>
                <div class="col-12 col-sm-2">
                    <q-input v-model="filtro.apellidosNombres" label="Apellidos y Nombres" v-on:keyup.enter="cargarTercero" outlined dense></q-input>
                </div>
                <div class="col-12 col-sm-3">
                    <dialogo-unidad-organica parTitulo="Unidad funcional" :parValorInputDefecto="filtro.idUnidadOrganica" parFlgCargarConsulta="1"
                                              parTipoElemento="INPUT" parMostrarBarraBusqueda="0" parMostrarBuscarTabla="1" parAccion="FILTRO"
                                              parTipo="*" parValor="SF"
                                              @datos="seleccionarUnidadOrganicaFiltro" />
                </div>
                <div class="col-12 col-sm-2">
                    <q-input v-model="filtro.usuLdap" label="Usuario" v-on:keyup.enter="cargarTercero" outlined dense></q-input>
                </div>
                <div class="col-12 col-sm-1">
                    <q-input v-model="filtro.nroOrden" label="N° de Orden" v-on:keyup.enter="cargarTercero" outlined dense></q-input>
                </div>
                <div class="col-12 col-sm-2">
                    <q-select label="Estado" v-model="filtro.estado"
                              :options="[{id: 'SF', nombre: 'TODOS'}, {id: 1, nombre: 'ACTIVO'}, {id: 0, nombre: 'INACTIVO'}]" option-value="id" option-label="nombre"
                              outlined dense map-options emit-value />
                </div>

                <div class="col-12 col-sm-1 text-center">
                    <q-btn label="Consultar" class="btn-buscar" icon="refresh" @click="cargarTercero" style="width: 100%" :loading="cargando.btncargarTercero"></q-btn>
                </div>
            </div>

            <div class="row col-12 q-col-gutter-xs">
                <div class="col-12 col-sm-12 text-right">
                    <q-btn label="NUEVO TERCERO" class="btn-acciones btn-verde"  icon="add" @click="abrirDialogoCargo('NUEVO', '*', '')" ></q-btn>
                </div>
            </div>

            <div class="row col-12 q-col-gutter-xs">
                <div class="col-12">
                    <q-table :data="tabla.usuLocador.lista" :columns="tabla.usuLocador.columnas" row-key="id"
                             :pagination.sync="tabla.usuLocador.paginacion" :rows-per-page-options="opcionesFilasPorPagina" table-header-class="bg-inabif"
                             class="tabla-cabecera-fija"
                             :filter="filtroTabla"
                             wrap-cells dense>
                        <template v-slot:top-right >
                            <q-input borderless v-model="filtroTabla" placeholder="Buscar" outlined dense>
                                <template v-slot:append>
                                    <q-icon name="search" />
                                </template>
                            </q-input>
                        </template>
                        <template v-slot:body-cell-prhEstado="scope">
                            <q-td :props="scope" auto-width style="width: 15px">
                                <q-btn dense flat round icon="lens" size="8.5px" color="green" v-show="(scope.row.prhEstado===1) ? true : false">
                                    <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">Activo</q-tooltip>
                                </q-btn>
                                <q-btn dense flat round icon="lens" size="8.5px" color="red" v-show="(scope.row.prhEstado===0) ? true : false">
                                    <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">Cesado</q-tooltip>
                                </q-btn>
                            </q-td>
                        </template>
                        <template v-slot:body-cell-acciones="scope">
                            <q-td :props="scope" auto-width style="width: 85px">
                                <q-btn-dropdown class="q-mr-xs btn-seccion-detalle-acciones"  label="" dropdown-icon="settings">
                                    <q-list>
                                        <q-item clickable v-close-popup @click="abrirDialogoCargo('CONSULTAR', '', scope.row)" >
                                            <q-item-section avatar><q-avatar icon="description" color="red" text-color="white" /></q-item-section>
                                            <q-item-section><q-item-label>Consultar cargo</q-item-label></q-item-section>
                                        </q-item>

                                        <q-item clickable v-close-popup @click="validar('PRE-EDITAR', '', scope.row)"> <!--v-if="scope.row.cantContratosCargo==0"-->
                                            <q-item-section avatar><q-avatar  icon="edit" color="red" text-color="white" /></q-item-section>
                                            <q-item-section><q-item-label>Actualizar cargo</q-item-label></q-item-section>
                                        </q-item>
<!--                                        <q-item v-else clickable>
                                            <q-item-section avatar><q-avatar  icon="edit" color="grey" text-color="white" /></q-item-section>
                                            <q-item-section><q-item-label>Actualizar cargo</q-item-label></q-item-section>
                                        </q-item>-->

<!--                                        <q-item @click="abrirDialogoMensajeSistema('ELIMINAR', scope.row, 'Está a punto de <b>eliminar</b> el registro seleccionado, una vez eliminado el registro no será posible recuperarlo', '¿Desea eliminar el registro?')" v-if="scope.row.cantContratosCargo==0" clickable v-close-popup >-->
                                        <q-item clickable v-close-popup @click="validar('PRE-ELIMINAR', '', scope.row)"> <!--v-if="scope.row.cantContratosCargo==0"-->
                                            <q-item-section avatar><q-avatar  icon="delete" color="red" text-color="white" /></q-item-section>
                                            <q-item-section><q-item-label>Eliminar cargo</q-item-label></q-item-section>
                                        </q-item>
<!--                                        <q-item v-else clickable >
                                            <q-item-section avatar><q-avatar  icon="delete" color="grey" text-color="white" /></q-item-section>
                                            <q-item-section><q-item-label>Eliminar cargo</q-item-label></q-item-section>
                                        </q-item>-->

                                    </q-list>
                                </q-btn-dropdown>

                            </q-td>
                        </template>
                    </q-table>
                </div>
            </div>

        </div>

        <q-dialog v-model="dialogo.frmTercero" persistent>
            <div class="q-gutter-y-md" style="max-width: 800px">

                <q-card>
                    <q-card-section class="bg-header-dialog">
                        <div class="text-body1" style="position: relative; text-align: right">
                            <span style="position: absolute;left: 0;" v-if="accion=='NUEVO'">Registrar tercero</span>
                            <span style="position: absolute;left: 0;" v-else-if="accion=='CONSULTAR'">Consultar tercero</span>
                            <span style="position: absolute;left: 0;" v-else-if="accion=='EDITAR'">Actualizar tercero</span>
                            <span style="position: absolute;left: 0;" v-else-if="accion=='ELIMINAR'">Eliminar tercero</span>

                            <span style="font-size: 12px">
                            <q-btn icon="close" class="q-mr-xs" style="padding: 0px; margin: 0px; font-size: 12px" color="black" v-close-popup dense flat round>
                                <q-tooltip>Cerrar</q-tooltip>
                            </q-btn>
                        </span>
                        </div>
                    </q-card-section>

                    <q-card-section class="row q-col-gutter-sm" dense>


                        <fieldset class="col-12  col-md-12 q-col-gutter-sm" v-if="accion!=='CONSULTAR'" >
                            <legend>BUSCAR: </legend>
                            <div class="row q-col-gutter-sm" dense>
                                <div class="col-12 col-md-5">
                                    {{datosTmp.objDocumento}}
                                    <q-select label="" v-model="datosTmp.objDocumento"
                                              :options="options.catalogo.listaTipoDocumento" option-label="catAbreviatura"
                                              @input="seleccionarTipoDocumentoIdentidad"
                                              map-options outlined dense denseOpts >
                                        <template v-slot:label><span>Tipo de documento de identidad <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')"></span></span></template>
                                    </q-select>
                                </div>
                                <div :class="'col-12 col-md-5'">
                                    {{datosTmp.objDocumento.idCatalogo}}
<!--                                    :mask="obj.tercero.documentoAbrev=='DNI' ? '########' : ( obj.tercero.documentoAbrev=='CE' ? '####################' : ( obj.tercero.documentoAbrev=='PASAPORTE' ? '############' : '########' ) )" :readonly="accion=='CONSULTAR' || obj.tercero.documentoAbrev==null" :filled="accion=='CONSULTAR' || obj.tercero.documentoAbrev==null" -->
                                    <q-input label="" v-model="datosTmp.perNroDocumentoFiltro"
                                             outlined dense>
                                        <template v-slot:label><span>Nro. de documento de identidad <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')"></span></span></template>
<!--                                        <template v-slot:append class="cursor-pointer" >
                                            <q-btn icon="search" class="q-mr-xs" style="padding: 0px; margin: 0px"  color="blue"
                                                   @click="validarReniec"
                                                   :loading="cargando.icoConsultaPide"
                                                   :readonly="accion=='CONSULTAR'"
                                                   dense flat round>
                                                &lt;!&ndash;<q-tooltip>Clic para realizar consulta PIDE (DNI)</q-tooltip>&ndash;&gt;
                                            </q-btn>
                                        </template>-->
                                    </q-input>
                                </div>
                                <div class="col-12 col-md-2">
                                    <q-btn label="BUSCAR" icon="search" class="btn-buscar" @click="validarPersona" style="width: 100%" >
                                        <q-tooltip>BUSCAR</q-tooltip>
                                    </q-btn>
                                </div>
                            </div>
                        </fieldset>

                        <div class="col-12 col-md-6">
                            <q-select label="" v-model="obj.tercero.perDocumento"
                                      :options="options.catalogo.listaTipoDocumento" option-value="catAbreviatura" option-label="catAbreviatura"
                                      @input="seleccionarTipoDocumentoIdentidad"
                                      emit-value map-options readonly filled outlined dense denseOpts >
                                <template v-slot:label><span>Tipo de documento de identidad <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-select>
                        </div>

                        <div :class="'col-12 col-md-6'">
                            <q-input label="" v-model="obj.tercero.perNroDocumento"
                                     :mask="obj.tercero.documentoAbrev=='DNI' ? '########' : ( obj.tercero.documentoAbrev=='CE' ? '####################' : ( obj.tercero.documentoAbrev=='PASAPORTE' ? '############' : '########' ) )" :readonly="accion=='CONSULTAR' || obj.tercero.documentoAbrev==null" :filled="accion=='CONSULTAR' || obj.tercero.documentoAbrev==null"
                                     readonly filled outlined dense>
                                <template v-slot:label><span>Nro. de documento de identidad <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-input>
                        </div>

                        <div :class="'col-12 col-md-4'">
                            <q-input label="" v-model="obj.tercero.perNombre" outlined dense>
                                <template v-slot:label><span>Nombres <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-input>
                        </div>

                        <div :class="'col-12 col-md-4'">
                            <q-input label="" v-model="obj.tercero.perApePaterno" outlined dense>
                                <template v-slot:label><span>Primer Apellido <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-input>
                        </div>

                        <div :class="'col-12 col-md-4'">
                            <q-input label="" v-model="obj.tercero.perApeMaterno" outlined dense>
                                <template v-slot:label><span>Segundo Apellido <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-input>
                        </div>

                        <div :class="'col-12 col-md-4'">
                            <q-input label="" v-model="obj.tercero.perFecNacimiento" mask="##/##/####" readonly filled outlined dense>
                                <template v-slot:label><span>Fecha de Nacimiento <span class="text-red text-bold" v-show="accion!=='CONSULTAR'">(*)</span></span></template>
                                <template v-slot:append>
                                    <q-icon name="event" class="cursor-pointer" v-if="!(accion=='CONSULTAR')" color="blue">
                                        <q-popup-proxy ref="perFecNacimiento" transition-show="scale" transition-hide="scale">
                                            <q-date v-model="obj.tercero.perFecNacimiento" @input="() => $refs.perFecNacimiento.hide()" mask="DD/MM/YYYY" :options="filtrarPerFecNacimiento" :default-year-month="datosTmp.anioMesFecNac"></q-date>
                                        </q-popup-proxy>
                                    </q-icon>
                                    <q-icon name="event" class="cursor-pointer" v-else ></q-icon>
                                </template>
                            </q-input>
                        </div>

                        <div :class="'col-12 col-md-4'"> {{obj.tercero.perSexo}}
                            <q-select label="" v-model="obj.tercero.perSexo"
                                      :options="[{'id':'0', 'nombre':'MUJER'}, {'id':'1', 'nombre':'HOMBRE'}]" option-value="id" option-label="nombre"
                                      emit-value map-options outlined dense denseOpts >
                                <template v-slot:label><span>Sexo <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-select>
                        </div>

                        <div :class="'col-12 col-md-4'">
                            <q-select label="" v-model="obj.tercero.perEstadoCivil"
                                      :options="options.catalogo.listaEstadoCivil" option-value="idCatalogo" option-label="catDescripcion"
                                      emit-value map-options outlined dense denseOpts >
                                <template v-slot:label><span>Estado Civil <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-select>
                        </div>

                        <div :class="'col-12 col-md-6'">
                            <q-input label="" v-model="obj.tercero.perCorreo" outlined dense>
                                <template v-slot:label><span>Correo Personal <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-input>
                        </div>

                        <div :class="'col-12 col-md-6'">
                            <q-input label="" v-model="obj.tercero.perTelefono" outlined dense>
                                <template v-slot:label><span>Teléfono Personal <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-input>
                        </div>

                        <div class="col-12  col-md-4">
                            <!--                                                                objPersonaNatural.codDepartamento: -{{objPersonaNatural.codDepartamento}}- -->
                            <q-select label="" v-model="obj.tercero.codDepartamento"
                                      :options="options.departamento" option-value="id" option-label="descripcion"
                                      @input="seleccionarDepartamento" @filter="cargarListaDepartamentosBusqueda"
                                      :readonly="accion=='CONSULTAR'" :filled="accion=='CONSULTAR'"
                                      use-input emit-value map-options outlined dense denseOpts  >
                                <template v-slot:label><span>Departamento <span class="text-red text-bold" v-show="accion!=='CONSULTAR'">(*)</span></span></template>
                            </q-select>
                        </div>
                        <div class="col-12  col-md-4">
                            <!--                                                                objPersonaNatural.codProvincia: -{{objPersonaNatural.codProvincia}}- -->
                            <q-select label="" v-model="obj.tercero.codProvincia"
                                      :options="options.provincia" option-value="id" option-label="descripcion"
                                      @input="seleccionarProvincia" @filter="cargarListaProvinciasBusqueda"
                                      :readonly="accion=='CONSULTAR'" :filled="accion=='CONSULTAR'"
                                      use-input emit-value map-options outlined dense denseOpts  >
                                <template v-slot:label><span>Provincia <span class="text-red text-bold" v-show="accion!=='CONSULTAR'">(*)</span></span></template>
                            </q-select>

                        </div>
                        <div class="col-12  col-md-4">
                            <!--                                                                objPersonaNatural.codDistrito: -{{objPersonaNatural.codDistrito}}- -->
                            <q-select label="" v-model="obj.tercero.codDistrito"
                                      :options="options.distrito" option-value="id" option-label="descripcion"
                                      @input="seleccionarDistrito" @filter="cargarListaDistritosBusqueda"
                                      :readonly="accion=='CONSULTAR'" :filled="accion=='CONSULTAR'"
                                      use-input emit-value map-options outlined dense denseOpts  >
                                <template v-slot:label><span>Distrito <span class="text-red text-bold" v-show="accion!=='CONSULTAR'">(*)</span></span></template>
                            </q-select>
                        </div>

                        <div class="col-12  col-md-12">
                            <q-input label="" v-model="obj.tercero.perDireccion" :readonly="accion=='CONSULTAR'" :filled="accion=='CONSULTAR'" outlined dense>
                                <template v-slot:label><span>Dirección <span class="text-red text-bold" v-show="accion!=='CONSULTAR'"> (*)</span></span></template>
                            </q-input>
                        </div>

                        <div :class="'col-12 col-md-6'">
                            <dialogo-unidad-organica parTitulo="Unidad funcional actual" :parValorInputDefecto="obj.tercero.prhUnidadOrganica" parFlgCargarConsulta="1"
                                                     parTipoElemento="INPUT" parMostrarBarraBusqueda="0" parMostrarBuscarTabla="1" parAccion="FILTRO"
                                                     parTipo="*" parValor="SF"
                                                     @datos="seleccionarUnidadOrganica" />
                        </div>

                        <div :class="'col-12 col-md-6'">
                            <q-input label="" v-model="obj.tercero.usuLdap" outlined dense>
                                <template v-slot:label><span>Usuario LDAP <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-input>
                        </div>

                        <div class="col-12 col-md-12" >
                            <dialogo-siga-ordenes parTipoElemento="INPUT" parAccion="CONSULTAR" parTipo="NOMBRE" @datos="seleccionarOrden"></dialogo-siga-ordenes>
                        </div>


<!--                        <div class="col-12 col-md-6">
                            <q-select label="" v-model="obj.tercero.perDocumento"
                                      :options="options.tipoDocumentoIdentidad" option-value="catAbreviatura" option-label="catAbreviatura"
                                      @input="seleccionarTipoDocumentoIdentidad"
                                      emit-value map-options outlined dense denseOpts >
                                <template v-slot:label><span>Tipo de documento de identidad <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                            </q-select>
                        </div>
                        <div :class="'col-12 col-md-6'">
                            <q-input label="" v-model="obj.tercero.perNroDocumento"
                                     :mask="obj.tercero.documentoAbrev=='DNI' ? '########' : ( obj.tercero.documentoAbrev=='CE' ? '####################' : ( obj.tercero.documentoAbrev=='PASAPORTE' ? '############' : '########' ) )" :readonly="accion=='CONSULTAR' || obj.tercero.documentoAbrev==null" :filled="accion=='CONSULTAR' || obj.tercero.documentoAbrev==null" outlined dense>
                                <template v-slot:label><span>Nro. de documento de identidad <span class="text-red text-bold" v-show="!(accion=='CONSULTAR')">(*)</span></span></template>
                                <template v-slot:append class="cursor-pointer" >
                                    <q-btn icon="search" class="q-mr-xs" style="padding: 0px; margin: 0px"  color="blue"

                                           @click="validarReniec"
                                           :loading="cargando.icoConsultaPide"
                                           :readonly="accion=='CONSULTAR'"
                                           dense flat round>
                                        <q-tooltip>Clic para realizar consulta PIDE (DNI)</q-tooltip>
                                    </q-btn>
                                </template>
                            </q-input>
                        </div>-->

<!--                        v-if="obj.tercero.perDocumento==3943 && obj.tercero.perDocumento!==3570 && accion!='CONSULTAR'"-->



<!--                        <div class="col-12 col-md-2" >
                            <q-btn label="" icon="search" class="btn-buscar" @click="validarReniec" style="width: 100%" >
                                <q-tooltip>CONSULTA PIDE</q-tooltip>
                            </q-btn>
                        </div>-->

                        <div :class="'col-12 col-md-12'">
                            <hr>
                        </div>

                        <div class="col-12 col-md-12" v-show="accion!=='CONSULTAR'">
                            <span><span class="text-red">(*)</span> Dato obligatorio</span><br>
                        </div>

                        <div class="col-12  col-md-12 text-center">
                            <q-btn label="Guardar" @click="validar('NUEVO', '*')" v-if="this.accion=='NUEVO'" class="btn-inabif q-mr-xs"></q-btn> <!-- :disable="btnGuardarFestivoDeshabilitado"-->
                            <q-btn label="Actualizar" @click="validar('EDITAR', '*')" v-if="this.accion=='EDITAR'" class="btn-inabif q-mr-xs" ></q-btn>
                            <q-btn label="Eliminar" @click="validar('ELIMINAR', 'LOGICO')" v-if="this.accion=='ELIMINAR'" class="btn-inabif q-mr-xs" ></q-btn>
                            <q-btn label="Cerrar" class="btn-inabif"  v-if="this.accion=='CONSULTAR'" v-close-popup></q-btn>
                            <q-btn label="Cancelar" class="btn-inabif"  v-else v-close-popup></q-btn>
                        </div>

                    </q-card-section>
                </q-card>
            </div>

        </q-dialog>

        <q-dialog v-model="dialogoMensajeSistema" persistent>
            <div class="q-gutter-y-md" style="width: 1200px">

                <q-card>
                    <q-card-section class="bg-header-dialog">
                        <div class="text-body1" style="position: relative; text-align: right">
                            <span style="position: absolute;left: 0;" >Mensaje del sistema</span>

                            <span style="font-size: 12px">
                            <q-btn icon="close" class="q-mr-xs" style="padding: 0px; margin: 0px; font-size: 12px" color="black" v-close-popup dense flat round>
                                <q-tooltip>Cerrar</q-tooltip>
                            </q-btn>
                        </span>
                        </div>
                    </q-card-section>
                    <q-card-section class="row q-col-gutter-sm" dense>

                        <div class="col-12 col-md-12">
                            <span style="text-align: justify" v-html="msj.descripcion"></span>
                            <span v-show="msj.tipo=='CONFIRMACION' || msj.tipo=='ELIMINAR'">
                                <br>
                                <div style="font-weight: bold; text-align: center" v-html="msj.preguntaConfirmacion"></div>
                            </span>
                        </div>

                        <div class="col-12 col-md-12 text-center">
<!--                            <q-btn label="Aceptar" @click="confirmarMensajeSistema(msj.tipo)" class="btn-inabif q-mr-xs" v-show="msj.tipo=='CONFIRMACION' || msj.tipo=='ELIMINAR'" :loading="cargando.btnAceptarMensajeSistema"></q-btn>
                            <q-btn label="Cancelar" class="btn-inabif" v-show="msj.tipo=='CONFIRMACION' || msj.tipo=='ELIMINAR'" v-close-popup></q-btn>-->


                            <span v-if="msj.tipo=='MENSAJE'"><q-btn label="Cerrar" class="btn-inabif"  v-close-popup></q-btn></span>
                            <span v-else>
                                <q-btn label="Aceptar" @click="confirmarMensajeSistema(msj.tipo)" class="btn-inabif q-mr-xs" :loading="cargando.btnAceptarMensajeSistema"></q-btn>
                                <q-btn label="Cancelar" class="btn-inabif" v-close-popup></q-btn>
                            </span>

                        </div>

                    </q-card-section>
                </q-card>
            </div>

        </q-dialog>

    </q-page>

</template>

<style>
    textarea {
        height: 60px !important;
    }
</style>

<script>
    import Vue from "vue";
    import {date} from "quasar";
    import LoginLayout from "layouts/LoginLayout";


    //import XLSX from "xlsx";

    export default {
        name: 'RegistroTercero',
        data() {
            return {
                host: process.env.API_URL,
                idUsuarioSession: this.$q.localStorage.getItem('mda-idUsuario'),

                //=======================================//

                filtro: { anho: '', nroDocumento: '', apellidosNombres: '', idUnidadOrganica: 'TODOS', usuLdap: '', nroOrden: '', estado: 1 },
                msj: { descripcion:'', preguntaConfirmacion:'', tipo:'', datoAdicional:'' },
                correo: { correoCc: '', asunto: '', cuerpo: '' },
                datosTmp: {
                    nombreObj: '', accion: [], tipo: [], valor: '',
                    anioMesFecNac: '',
                    objDocumento: '', perNroDocumentoFiltro: '',
                    tab: 'inscripcion-curricular', tabActual: ''
                },

                obj: {
                    session: {
                        idUsuario: this.$q.localStorage.getItem('mda-idUsuario'),
                        idUnidadOrganica: this.$q.localStorage.getItem('mda-idUnidadOrganica'),
                        unidadOrganica: this.$q.localStorage.getItem('mda-unidadOrganica'),
                        idUnidadOrganicaDir: this.$q.localStorage.getItem('mda-idUnidadOrganicaDir'),
                        idUnidOrgPorDefecto: this.$q.localStorage.getItem('mda-idUnidOrgPorDefecto'),
                        unidOrgPorDefecto: this.$q.localStorage.getItem('mda-unidOrgPorDefecto'),
                    },

                    tercero: {
                        idPersona: null,
                        perDocumento: null,
                        perNroDocumento: '',
                        perNombre: '',
                        perApePaterno: '',
                        perApeMaterno: '',
                        perEstadoCivil: null,
                        perFecNacimiento: '',
                        perDirUbigeo: '',
                        perDireccion: '',
                        perSexo: null,
                        perTelefono: '',
                        perCorreo: '',
                        perDireccionReniec: '',
                        perRuc: '',

                        idPersonal: null,
                        prhCorreoInstitucional: '',
                        prhUnidadOrganica: null,
                        prhEstado: null,

                        idUsuario: null,
                        usuLdap: '',
                        usuEstado: null,

                        documentoAbrev: '',
                        estadoCivil: '',
                        departamentoDireccion: '',
                        provinciaDireccion: '',
                        distritoDireccion: '',
                        sexo: '',
                        unidadOrganica: '',

                        codDepartamento: '',
                        codProvincia: '',
                        codDistrito: '',

                        idUsuarioReg: null
                    }
                },

                dialogo: {
                    mensajeSistema: false,
                    frmTercero: false
                },
                cargando: {
                    btnAceptarMensajeSistema: false,
                    btnConsultarTercero: false, btnGuardarTercero: false,
                    icoConsultaPide: false
                },
                options: {
                    catalogo: [],
                    listaEstadoCivil: [], listaTipoDocumento: [],
                    tipoDocumentoIdentidad: [],
                    departamento: [], provincia: [], distrito: [],
                    departamentoBusqueda: [], provinciaBusqueda: [], distritoBusqueda: [],
                    estadoCivil: []
                },

                tabla: {
                    opcionesFilasPorPagina: [5,10,20,50,100,200,500],
                    usuLocador: {
                        filasSeleccionadas: [], lista: [], filtro: [], cargando: [], paginacion: { rowsPerPage  : 100 },
                        columnas: [
                            { name: 'prhEstado', label: '', field: row => row.prhEstado, align: 'center' },
                            { name: 'perNroDocumento', label: 'N° DE DOCUMENTO', field: row => row.perNroDocumento, align: 'center' },
                            { name: 'apellidosNombres', label: 'APELLIDOS Y NOMBRES', field: row => row.perApePaterno + ' ' + row.perApeMaterno + ' ' + row.perNombre, align: 'left' },
                            { name: 'unidadOrganica', label: 'UNIDAD FUNCIONAL', field: row => row.unidadOrganica, align: 'left', },
                            { name: 'usuLdap', label: 'USUARIO', field: row => row.usuLdap, align: 'left' },
                            { name: 'ecNumDocumento', label: 'N° DE ORDEN', field: row => row.ecNumDocumento, align: 'left' },
                            { name: 'acciones', label: 'ACCIONES', align: 'center' }
                        ],
                        flgRenderizarComponente: false
                    },
                },





                optionsAnio: [],
                objFiltro: { carAnhoCreacion: 'SF', carCodSisper: '', carNombre: '' },

                lista: [], filasSeleccionadas: [], paginacion: {rowsPerPage: 100}, opcionesFilasPorPagina: [5,10,20,50,100], filtroTabla: '',
                columnas: [
                    { name: 'carAnhoCreacion', label: 'AÑO', field: row=>row.carAnhoCreacion, headerClasses: 'tabla-cabecera', align: 'center' },
                    { name: 'carNombre', label: 'CARGO', field: row=>row.carNombre, headerClasses: 'tabla-cabecera', align: 'left' },
                    { name: 'carAbreviatura', label: 'ABREVIATURA', field: row=>row.carAbreviatura, headerClasses: 'tabla-cabecera', align: 'right' },
                    { name: 'carCodSisper', label: 'CÓDIGO SISPER', field: row=>row.carCodSisper, headerClasses: 'tabla-cabecera', align: 'center' },
                    { name: 'cantContratosCargo', label: 'N° DE CONTRATOS VINCULADOS', field: row=>row.cantContratosCargo, headerClasses: 'tabla-cabecera', align: 'center' },
                    { name: 'acciones', label: 'ACCIONES', align: 'center' }
                ],

                //=======================================//

                dialogoCargo: false,
                dialogoMensajeSistema: false,

                objCargo: {
                    idCargo: null,
                    carAnhoCreacion: '',
                    carCodSisper: '',
                    carNombre: '',
                    carAbreviatura: '',
                    carCodIntegrix: '',

                    tipo: '',
                    idUsuarioReg: this.idUsuarioSession
                },

                //=======================================//

                accion: '',
                tipo: '',




            }
        },
        created() {
            this.init();
        },
        methods: {
            init: function(){
                let keys = Object.keys(this.$q.localStorage.getAll());
                let systemKeys = keys.filter(k => k.startsWith('mda-'));

                if (systemKeys.length==0) {
                    window.location.href = 'https://srvapp01.inabif.gob.pe:8443/seguridad/SPrincipal';
                } else {

                    let fechaActual = new Date();
                    let anio = fechaActual.getFullYear();
                    let anioMayorEdad = anio-18;
                    this.datosTmp.anioMesFecNac = anioMayorEdad+'/01';

                    /*this.cargarPermisos();*/
                    //this.cargarAnioCargo();

                    this.cargarListaDepartamentos();
                    this.cargarListaCatalogo();
                }


            },
            cargarListaDepartamentos: function () {
                this.$axios.get("https://srvapp01.inabif.gob.pe:8443/SRH/SUbigeo?action=departamentos")
                    .then(response=>{
                        this.options.departamento = response.data;
                        this.options.departamentoBusqueda = response.data;
                    });
            },
            cargarListaDepartamentosBusqueda: function(val, update, abort){
                if (val === '') { update(() => { this.options.departamento = this.options.departamentoBusqueda; }); return; }
                update(() => {
                    const needle = val.toLowerCase();
                    this.options.departamento = this.options.departamentoBusqueda.filter( c => c.descripcion.toLowerCase().includes(needle) );
                })
            },
            seleccionarDepartamento: function(val){
                this.obj.tercero.codProvincia = null;
                this.obj.tercero.codDistrito = null;
                this.options.distrito = [];
                this.cargarListaProvincias(val);
            },

            cargarListaProvincias: function ( idDepartamento ) {
                this.$axios
                    .get("https://srvapp01.inabif.gob.pe:8443/SRH/SUbigeo?action=provincias&idDepartamento="+idDepartamento)
                    .then(response=>{
                        this.options.provincia = response.data;
                        this.options.provinciaBusqueda = response.data;
                    });
            },
            cargarListaProvinciasBusqueda: function(val, update, abort){
                if (val === '') { update(() => { this.options.provincia = this.options.provinciaBusqueda; }); return; }
                update(() => {
                    const needle = val.toLowerCase();
                    this.options.provincia = this.options.provinciaBusqueda.filter( c => c.descripcion.toLowerCase().includes(needle) );
                })
            },
            seleccionarProvincia: function(val){
                this.obj.tercero.codDistrito = null;
                this.cargarListaDistritos(val)
            },

            cargarListaDistritos: function ( idProvincia ) {
                this.$axios
                    .get("https://srvapp01.inabif.gob.pe:8443/SRH/SUbigeo?action=distritos&idDepartamento="+this.obj.tercero.codDepartamento+"&idProvincia="+idProvincia)
                    .then(response=>{
                        this.options.distrito = response.data;
                        this.options.distritoBusqueda = response.data;
                    });
            },
            cargarListaDistritosBusqueda: function(val, update, abort){
                if (val === '') { update(() => { this.options.distrito = this.options.distritoBusqueda; }); return; }
                update(() => {
                    const needle = val.toLowerCase();
                    this.options.distrito = this.options.distritoBusqueda.filter( c => c.descripcion.toLowerCase().includes(needle) );
                })
            },
            seleccionarDistrito: function(val){
                this.obj.tercero.perDirUbigeo = this.obj.tercero.codDistrito;
                this.obj.tercero.pnDepartamento = (this.options.departamento.filter( c => c.id == this.obj.tercero.codDepartamento)[0].descripcion );
                this.obj.tercero.pnProvincia = (this.options.provincia.filter( c => c.id == this.obj.tercero.codProvincia)[0].descripcion );
                this.obj.tercero.pnDistrito = (this.options.distrito.filter( c => c.id == this.obj.tercero.codDistrito)[0].descripcion );
            },

            cargarListaCatalogo: function(){
                let form = new FormData()
                form.append('obj', JSON.stringify({ tipo: 'REGISTRO-TERCERO', valor: this.idUsuarioSession } ));

                //this.$axios.post("https://srvapp01.inabif.gob.pe:8443/SRH/STgCatalogo?accion=GRUPO", form, {headers: {'Content-Type': 'multipart/form-data'}
                this.$axios.post("http://localhost:8084/SRH/STgCatalogo?accion=GRUPO", form, {headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    this.options.catalogo = response.data;

                    //this.options.ficha.filtro.estadoConserv = this.options.catalogo.estadoConserv.slice();
                    //this.options.ficha.filtro.estadoConserv.splice(0,0,{idCatalogo:"SF",catDescripcion:"TODOS"});
                }).finally(() => {  });
            },

            validarPersona: function(){
                if ( this.datosTmp.perNroDocumentoFiltro.length==8 ){
                    // this.cargando.btncargarTercero = true;

                    let idUsuarioReg = this.obj.session.idUsuario;
                    let nroDocumento = this.datosTmp.perNroDocumentoFiltro;
                    let apellidosNombres = 'SF';
                    let idUnidadOrganica = 'SF';
                    let usuLdap = 'SF';
                    let nroOrden = 'SF';
                    let estado = 'SF';
                    let tipoTrabajador = 'SF';
                    let comodin = 'SF';

                    let valor = idUsuarioReg+';'+nroDocumento+';'+apellidosNombres+';'+idUnidadOrganica+';'+usuLdap+';'+nroOrden+';'+estado+';'+tipoTrabajador+';'+comodin;
                    let form = new FormData();
                    form.append('obj', JSON.stringify({ tipo: '*', valor: valor }));

                    //this.$axios.post("https://srvapp01.inabif.gob.pe:8443/SLOG/STgCargo?accion=LISTAR", form, {headers: {'Content-Type': 'multipart/form-data'}
                    this.$axios.post("http://localhost:8084/SLOG/SUsuLocador?accion=LISTAR", form, {headers: {'Content-Type': 'multipart/form-data'}
                    }).then(response => {
                        //let objLocador = response.data[0];

                        if ( response.data.length == 0 ) {
                            this.obj.tercero.perDocumento = objLocador.perDocumento;
                            this.obj.tercero.perNroDocumento = this.datosTmp.perNroDocumentoFiltro;
                        } else {
                            let objLocador = response.data[0];

                            if ( this.obj.tercero.prhEstado == 1 ) {
                                let msj = 'EL ENCONTRÓ EL/LA PERSONAL ACTIVO: ';
                                this.abrirDialogoMensajeSistema( 'MENSAJE', null , msj, '' );
                            } else {
                                // 60736859
                                this.obj.tercero.perDocumento = parseInt(objLocador.perDocumento);
                                this.obj.tercero.perNroDocumento = objLocador.perNroDocumento;
                                this.obj.tercero.perNombre = objLocador.perNombre;
                                this.obj.tercero.perApePaterno = objLocador.perApePaterno;
                                this.obj.tercero.perApeMaterno = objLocador.perApeMaterno;
                                this.obj.tercero.perFecNacimiento = objLocador.perFecNacimiento;
                                this.obj.tercero.perSexo = parseInt(objLocador.perSexo);
                                this.obj.tercero.perEstadoCivil = parseInt(objLocador.perEstadoCivil);
                                this.obj.tercero.perCorreo = objLocador.perCorreo;
                                this.obj.tercero.perTelefono = objLocador.perTelefono;

                                this.obj.tercero.codDepartamento = objLocador.perDirUbigeo.substring(0,2);
                                this.obj.tercero.codProvincia = objLocador.perDirUbigeo.substring(2,4);

                                this.obj.tercero.perDireccion = objLocador.perDireccion;

                            }


                        }

                        //console.log(objLocador);
                        //console.log(objLocador.length);

                    }).catch(() => {
                        this.gestionarError(e);
                    }).finally(() => {

                    });
                }
            },

            cargarPermisos: function(){
                let idUsuario = this.idUsuarioSession;
                let idOpcion = 1122;
                let valor = idUsuario+';'+idOpcion;

                let form = new FormData()
                form.append('usuarioPermiso', JSON.stringify({
                    tipo: 'PERMISO_POR_USUARIO',
                    valor: valor
                }));

                this.$axios
                    .post(`${process.env.API_URL}/SUsuarioPermiso?accion=LISTAR`, form, {headers: {'Content-Type': 'multipart/form-data'}})
                    .then(response => {
                        if( response.data.length !== 0 ){
                            this.objPermiso = response.data[0];
                        }

                    }).finally(() => {
                        //this.cargando = false;
                });
            },

            // FUNCIONES CARGO
            cargarTercero: function() {
                    /*if ( this.objFiltro.carCodSisper.length>0 || this.objFiltro.carNombre.length>2 ){*/
                    // this.cargando.btncargarTercero = true;

                    let idUsuarioReg = this.obj.session.idUsuario;
                    let nroDocumento = this.filtro.nroDocumento=='' ? 'SF' : this.filtro.nroDocumento;
                    let apellidosNombres = this.filtro.apellidosNombres=='' ? 'SF' : this.filtro.apellidosNombres;
                    let idUnidadOrganica = this.filtro.idUnidadOrganica=='' || this.filtro.idUnidadOrganica=='TODOS' ? 'SF' : this.filtro.idUnidadOrganica;
                    let usuLdap = this.filtro.usuLdap=='' ? 'SF' : this.filtro.usuLdap;
                    let nroOrden = this.filtro.nroOrden=='' ? 'SF' : this.filtro.nroOrden;
                    let estado = this.filtro.estado=='' ? 'SF' : this.filtro.estado;
                    let tipoTrabajador = 99;
                    let comodin = 'SF';

                    let valor = idUsuarioReg+';'+nroDocumento+';'+apellidosNombres+';'+idUnidadOrganica+';'+usuLdap+';'+nroOrden+';'+estado+';'+tipoTrabajador+';'+comodin;
                    let form = new FormData();
                    form.append('obj', JSON.stringify({ tipo: '*', valor: valor }));

                    //this.$axios.post("https://srvapp01.inabif.gob.pe:8443/SLOG/STgCargo?accion=LISTAR", form, {headers: {'Content-Type': 'multipart/form-data'}
                    this.$axios.post("http://localhost:8084/SLOG/SUsuLocador?accion=LISTAR", form, {headers: {'Content-Type': 'multipart/form-data'}
                        }).then(response => {
                            //console.log(response);
                            this.tabla.usuLocador.lista = response.data;
                        }).catch(() => {
                            this.gestionarError(e);
                        }).finally(() => {
                            this.cargando.btncargarTercero = false;
                        });
                /*}*/



            },
            abrirDialogoCargo: function ( accion, tipo, fila ) {
                if( accion == 'NUEVO' ) {
                    this.limpiarCargo();
                }

                if( accion == 'CONSULTAR' ) {
                    this.objCargo = Vue.util.extend({}, fila);
                    this.objCargo.idUsuarioReg = this.idUsuarioSession;
                }

                this.dialogo.frmTercero = true;
                this.accion = accion;

            },
            validar: function( accion, tipo, obj=null ){
                this.objCargo = obj==null ? this.objCargo : Vue.util.extend({}, obj);
                this.accion = accion;
                this.tipo = tipo;

                let flagObligatorio = 0, flagInconsistente = 0, flagAdvertencia = 0, flagSistema = 0;
                let msj = '', msjObligatorio = '', msjInconsistente = '', msjAdvertencia = '', msjSistema = '';

                msjObligatorio += "<span style='font-weight: bold'>Verificar los siguientes datos obligatorios (*):</span><br><ul style='padding-left: 20px; margin-top: 6px; margin-bottom: 0px;'>";
                if ( accion == 'NUEVO' || accion == 'EDITAR' ){
                    /*if ( this.objCargo.carAnhoCreacion == '' || this.objCargo.carAnhoCreacion == null ) { msjObligatorio += "<li>Año.</li>"; flagObligatorio = 1; }*/
                    if ( this.objCargo.carNombre == '' || this.objCargo.carNombre == null ) { msjObligatorio += "<li>Cargo.</li>"; flagObligatorio = 1; }
                    if ( this.objCargo.carAbreviatura == '' || this.objCargo.carAbreviatura == null ) { msjObligatorio += "<li>Abreviatura.</li>"; flagObligatorio = 1; }
                }
                if ( (accion == 'PRE-EDITAR' || accion == 'PRE-ELIMINAR') && this.objCargo.cantContratosCargo > 0 ) {
                    msjObligatorio = "<span style='font-weight: bold'></span><ul style='padding-left: 20px; margin-top: 6px; margin-bottom: 0px;'>";
                    msjObligatorio += "<li>No se puede "+(accion=='PRE-EDITAR' ? 'actualizar' : ( accion=='PRE-ELIMINAR' ? 'eliminar' : '' ))+" el cargo, existe "+this.objCargo.cantContratosCargo+" contratos vinculados.</li>"; flagObligatorio = 1;
                }
                msjObligatorio += '</ul>';

                msjInconsistente = "<span style='font-weight: bold'>Verificar los siguientes datos inconsistentes:</span><br><ul style='padding-left: 20px; margin-top: 6px; margin-bottom: 0px;'>";

                if ( accion == 'NUEVO' || accion == 'EDITAR' ){
                    let fechaActual = new Date(); let anioActual = fechaActual.getFullYear();
                    if ( (this.objCargo.carAnhoCreacion).length > 0 && (this.objCargo.carAnhoCreacion).length < 4 ) { msjInconsistente += "<li>Ingrese un año valido.</li>"; flagInconsistente = 1; }
                    if ( (this.objCargo.carAnhoCreacion).length == 4 && parseInt(this.objCargo.carAnhoCreacion) > parseInt(anioActual) ) { msjInconsistente += "<li>Ingrese un año valido igual o menor al año actual.</li>"; flagInconsistente = 1; }
                }
                msjInconsistente += '</ul>';

                msjAdvertencia = "<span style='font-weight: bold'> </span><ul style='padding-left: 20px; margin-top: 6px; margin-bottom: 0px;'>";
                /*if( flagAdvertencia == 1 ) { this.msjAdvertencia += "<br><div style='font-weight: bold; text-align: center'>¿Desea continuar con el registro?</div>"; }*/
                msjAdvertencia += '</ul>';

                // ************************************************ //
                if ( flagObligatorio == 1 || flagInconsistente == 1 ) {
                    msj = (flagObligatorio == 1 ? msjObligatorio : '') + (flagInconsistente == 1 ? (flagObligatorio == 1 ? '<br>' : '') + msjInconsistente : '');
                    //this.$q.dialog({title: 'Aviso del sistema', message: msj, class: 'dialog-mensaje', html: true, ok : { label: 'Cerrar', color: 'btn-inabif' },  persistent: true, style: "width:600px" });
                    this.abrirDialogoMensajeSistema( 'MENSAJE', this.objCargo, msj, '' );
                } else if ( flagAdvertencia == 1 ) {
                    msj = this.msjAdvertencia;
                    this.abrirDialogoMensajeSistema( 'CONFIRMACION', this.objCargo, msj, '¿Desea continuar con el registro?' );
                } else {
                    this.objCargo.idUsuarioReg = this.idUsuarioSession;


                    if (this.accion == 'NUEVO') { this.guardarCargo(tipo); }
                    if (this.accion == 'EDITAR') { this.actualizarCargo(tipo); }
                    if (this.accion == 'ELIMINAR') { this.eliminarCargo(tipo); }

                    if (this.accion == 'CONSULTAR') { this.accion = 'CONSULTAR'; this.abrirDialogoCargo( 'CONSULTAR', '', this.objCargo); }
                    if (this.accion == 'PRE-EDITAR') { this.accion = 'EDITAR'; this.abrirDialogoCargo( 'EDITAR', '', this.objCargo); }
                    if (this.accion == 'PRE-ELIMINAR') { this.accion = 'ELIMINAR'; this.abrirDialogoCargo( 'ELIMINAR', '', this.objCargo); }
                }
            },
            abrirDialogoMensajeSistema: function( tipo, fila, msjDescripcion, msjPreguntaConfirmacion ){
                this.dialogoMensajeSistema = true;

                this.objCargo = Vue.util.extend({}, fila);

                this.msj.descripcion = msjDescripcion;
                this.msj.preguntaConfirmacion = msjPreguntaConfirmacion;
                this.msj.tipo = tipo;
            },
            confirmarMensajeSistema: function( tipo ) {
                this.cargandoBtnAceptarMensajeSistema = true;
                if (this.accion == 'NUEVO') { this.guardarCargo(tipo); }
                if (this.accion == 'EDITAR') { this.actualizarCargo(tipo); }
                if (this.accion == 'ELIMINAR') { this.eliminarCargo('LOGICO'); }
            },
            guardarCargo: function( tipo ){
                this.objCargo.tipo = tipo;

                let formData = new FormData();
                formData.append('obj', JSON.stringify(this.objCargo));

                this.$axios.post(`${process.env.API_URL}/STgCargo?accion=GUARDAR`, formData, {headers: {'Content-Type': 'multipart/form-data'}
                    }).then(response => {
                        // console.log(response);

                        if( response.data[0].sw == '0' ){
                            this.abrirDialogoMensajeSistema( 'MENSAJE', this.objCargo, response.data[0].msj );
                        } else if( response.data[0].sw == '1' ){
                            this.mostrarMensaje('SE REGISTRÓ CORRECTAMENTE', 'green', 'check_circle');
                            this.dialogoCargo = false;
                            this.dialogoMensajeSistema = false;

                            this.objFiltro.carCodSisper = '';
                            this.objFiltro.carNombre = this.objCargo.carNombre;
                        }
                    }).catch((e) => {
                        this.gestionarError(e);
                        this.dialogoCargo = false;
                        this.dialogoMensajeSistema = false;
                    }).finally(() => {
                        this.cargarTercero();
                    });

            },
            actualizarCargo: function( tipo ) {
                //console.log("actualizarCargo => tipo: ",tipo);
                this.objCargo.tipo = tipo;

                let formData = new FormData();
                formData.append('obj', JSON.stringify(this.objCargo));

                this.$axios
                    .post(`${process.env.API_URL}/STgCargo?accion=ACTUALIZAR`, formData, {headers: {'Content-Type': 'multipart/form-data'}})
                    .then(response => {
                        //console.log(response);
                        this.mostrarMensaje('SE ACTUALIZÓ CORRECTAMENTE', 'green', 'check_circle');
                    }).catch((e) => {
                        this.gestionarError(e);
                    }).finally(() => {
                        this.dialogoCargo = false;
                        this.dialogoMensajeSistema = false;
                        this.cargarTercero();
                    });

            },
            eliminarCargo: function ( tipo ) {
                this.objCargo.tipo = tipo;

                let form = new FormData();
                form.append('obj', JSON.stringify(this.objCargo));

                this.$axios.post(`${process.env.API_URL}/STgCargo?accion=ELIMINAR`, form, {headers: {'Content-Type': 'multipart/form-data'}
                    }).then(response => {
                        //console.log(response);
                        this.mostrarMensaje('SE ELIMINÓ CORRECTAMENTE', 'green', 'check_circle');
                    }).catch(() => {
                        this.gestionarError(e);
                    }).finally(() => {
                        this.dialogoCargo = false;
                        this.dialogoMensajeSistema = false;
                        this.cargarTercero();
                    });
            },
            limpiarCargo: function() {
                this.objCargo.idCargo = null;
                this.objCargo.carAnhoCreacion = '';
                this.objCargo.carNombre = null;
                this.objCargo.carAbreviatura = '';
                this.objCargo.carCodSisper = '';
                this.objCargo.carCodIntegrix = '';

                this.objCargo.tipo = '';
                this.objCargo.idUsuarioReg = this.idUsuarioSession;
            },
            sisperCargosSeleccionada: function( data ){
                if( data.tipoRespuesta == '1' ) {
                    this.objCargo.carCodSisper = data.cargoEstructural;
                    this.objCargo.carNombre = data.nomCargoEstruc;
                    this.objCargo.carAbreviatura = data.abrevCargoEstruct;
                } else {
                    this.objCargo.carCodSisper = '';
                    this.objCargo.carNombre = '';
                    this.objCargo.carAbreviatura = '';
                }
            },


            validarReniec: function ( data ){
            },

            seleccionarUnidadOrganicaFiltro: function( data ){
                /*if( data.tipoRespuesta == '1' ) {
                    this.objCargo.carCodSisper = data.cargoEstructural;
                    this.objCargo.carNombre = data.nomCargoEstruc;
                    this.objCargo.carAbreviatura = data.abrevCargoEstruct;
                } else {
                    this.objCargo.carCodSisper = '';
                    this.objCargo.carNombre = '';
                    this.objCargo.carAbreviatura = '';
                }*/
            },
            seleccionarUnidadOrganica: function( data ){
                /*if( data.tipoRespuesta == '1' ) {
                    this.objCargo.carCodSisper = data.cargoEstructural;
                    this.objCargo.carNombre = data.nomCargoEstruc;
                    this.objCargo.carAbreviatura = data.abrevCargoEstruct;
                } else {
                    this.objCargo.carCodSisper = '';
                    this.objCargo.carNombre = '';
                    this.objCargo.carAbreviatura = '';
                }*/
            },
            seleccionarTipoDocumentoIdentidad: function( data ){
            },

            seleccionarOrden: function( data ){
            },

            filtrarPerFecNacimiento: function ( fecha ) {
                let fechaActual = new Date();
                let dia = (fechaActual.getDate() + 0).toString().padStart(2, '0');
                let mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
                let anio = fechaActual.getFullYear();
                let anioMayorEdad = anio-18;

                let fechaInicio = ('01/01/1930').split('/').reverse().join('/');
                let fechaTermino = date.formatDate(fechaActual, anioMayorEdad+'/'+mes+'/'+dia);

                return fecha >= fechaInicio && fecha <= fechaTermino;
            },

            // FUNCIONES COMUNES
            gestionarError: function (error) {
                let status = error.response.status;
                if (status==401) {
                    this.$q.localStorage.clear();
                    this.dialogoSesionExpiradaVisible = true;
                } else {
                    this.mostrarMensaje('OCURRIÓ UN ERROR AL REALIZAR LA OPERACIÓN', 'red', 'warning');
                }
            },
            mostrarMensaje: function (mensaje, color, icono) {
                this.$q.notify({ message: mensaje, color: color, icon: icono , position: 'top-right'});
            },

        },
        computed: {},
        watch: {}
    }
</script>

