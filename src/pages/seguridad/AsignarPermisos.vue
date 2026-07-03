<template>
    <q-page class="q-pa-md">
        <div class="row q-col-gutter-sm">
            <div class="col-12 text-center text-bold text-h6">ASIGNACIÓN DE PERMISOS POR USUARIO</div>

            <div class="row col-12 q-col-gutter-xs">

                <div class="col-12 col-sm-6">
                    <dialogo-usuario parTitulo="Usuario" :parValorInputDefecto="filtro.idUsuario" parFlgCargarConsulta="0"
                                     parTipoElemento="INPUT" parTipoBusqueda="FILTRO" parMostrarBarraBusqueda="1" parMostrarBuscarTabla="0"
                                     :parAccion="'FILTRO'" :parTipo="'*'" parValor=""
                                     @datos="seleccionarUsuario" />
                </div>

                <div class="col-12 col-md-5">
                    <dialogo-sistema parTitulo="Sistema" :parValorInputDefecto="filtro.idSistema" parFlgCargarConsulta="1"
                                     parTipoElemento="INPUT" parTipoBusqueda="PARAMETRO" parMostrarBarraBusqueda="0" parMostrarBuscarTabla="1"
                                     :parAccion="'FILTRO'" :parTipo="'*'" :parValor="obj.session.idUsuario+';SF;SF;1;SF'"
                                     @datos="seleccionarSistema" />
                </div>

                <div class="col-12 col-sm-1">
                    <q-btn label="CONSULTAR" class="btn-buscar q-mr-xs" icon="refresh" @click="obtenerMenu" :loading="cargandoTDR" style="width: 100%"></q-btn>
                </div>
            </div>

            <div class="row col-12 q-col-gutter-xs">
                <div class="col-12 col-sm-12 text-right"></div>
            </div>

            <div class="row col-12 q-col-gutter-xs">
                <div class="col-12">

                    <q-list>
                        <span style="list-style: none;">
                            <div style="background: #3679B6; color: white; text-align: center; padding: 10px 5px 10px 0px" >
                                <span>SISTEMA / MÓDULO / PERFIL / OPCIONES</span>
                            </div>
                            <div style="background: rgb(159 159 159); padding: 10px 5px 10px 0px" v-if="!(menu.length==null)" >
                                <span style="background: #1976d2; border-radius: 50px; display: inline-block; color: white; width: 20px; text-align: center; margin-right: 30px; margin-left: 30px" >
                                    <span>S</span>
                                    <q-tooltip content-class="bg-blue" anchor="center left" self="center right" :offset="[10, 10]">Sistema</q-tooltip>
                                </span>
                                <span>{{datosTmp.nomSistema}}</span>
                                <div style="float: right; padding-right: 10px">
                                    <q-btn @click="abrirDialogoUsuarioCentro(datosTmp.idSistema, datosTmp.idUsuario)" icon="home_work" size="12px" color="white" dense flat round >
                                        <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">Unidad Funcional</q-tooltip>
                                    </q-btn>
                                </div>
                            </div>

                            <span v-for="(mi, i) in menu" style="list-style: none;">
                                <div style="background: rgb(187, 187, 187); padding: 10px 5px 10px 0px">
                                    <span style="background: red; border-radius: 50px; display: inline-block; color: white; width: 20px; text-align: center; margin-right: 30px; margin-left: 30px" >
                                        <span>M</span>
                                        <q-tooltip content-class="bg-red" anchor="center left" self="center right" :offset="[10, 10]">Módulo</q-tooltip>
                                    </span>
                                    <span style="margin-right: 15px"></span>
                                    <span>{{mi.descripcion}}</span>
                                </div>

                                <q-list v-for="(mi2, j) in mi.subitems" style="background: rgb(223 223 223)" >
                                    <q-expansion-item > <!--v-model="expanded"-->
                                        <template v-slot:header>
                                            <q-item-section style="display: inline-block;">
                                                <span style="background: green; border-radius: 50px; display: inline-block; color: white; width: 20px; text-align: center; margin-right: 30px; margin-left: 14px" >
                                                    <span>P</span>
                                                    <q-tooltip content-class="bg-green" anchor="center left" self="center right" :offset="[10, 10]">Perfil</q-tooltip>
                                                </span>
                                                <span style="padding-left: 20px">
                                                    <q-checkbox v-model="mi2.flgUsuarioActivoB" @input="habiliarPerfil(mi2.idUsuPerfil, mi.idUsuario, mi2.idPerfil, mi2.flgUsuarioActivo, mi2.flgUsuarioActivoB)"></q-checkbox>
                                                </span>
                                                <span>{{mi2.descripcion}}</span>

                                            </q-item-section>
                                        </template>

                                        <q-card>
                                          <q-card-section style="padding: 0px;">
                                              <span v-for="(smi, k) in mi2.subitems" style="list-style: none;">
                                                 <div style="background: rgb(242, 242, 242); padding: 10px 5px 10px 0px">
                                                    <span style="background: #1976d2; border-radius: 50px; display: inline-block; color: white; width: 20px; text-align: center; margin-right: 30px; margin-left: 30px" >
                                                        <span>O</span>
                                                        <q-tooltip content-class="bg-blue" anchor="center left" self="center right" :offset="[10, 10]">Opción</q-tooltip>
                                                    </span>
                                                    <span style="margin-right: 80px"></span>
                                                    <span>{{smi.descripcion}}</span>
                                                </div>

                                                <span v-for="(smi2, l) in smi.subitems" style="list-style: none;">
                                                    <div style="background: rgb(249 249 249); padding: 5px 5px 5px 0px">
                                                        <span style="background: green; border-radius: 50px; display: inline-block; color: white; width: 20px; text-align: center; margin-right: 30px; margin-left: 30px" ></span>
                                                        <span style="margin-right: 110px"></span>
                                                        <span>{{smi2.descripcion}}</span>
                                                    </div>

                                                    <span v-for="(smi3, m) in smi2.subitems" style="list-style: none;">
                                                        <div style="background: rgb(249 249 249); padding: 5px 5px 5px 0px">
                                                            <span style="background: green; border-radius: 50px; display: inline-block; color: white; width: 20px; text-align: center; margin-right: 30px; margin-left: 30px" ></span>
                                                            <span style="margin-right: 140px"></span>
                                                            <span>{{smi3.descripcion}}</span>
                                                        </div>
                                                    </span>
                                                </span>
                                              </span>
                                          </q-card-section>
                                        </q-card>

                                    </q-expansion-item>
                                </q-list>

                            </span>
                        </span>
                    </q-list>

                </div>
            </div>

        </div>

        <q-dialog v-model="dialogo.frmUsuarioCentro" persistent>
            <q-card style="width: 700px; max-width: 900px; overflow-x: hidden;">

                <q-card-section class="bg-header-dialog">
                    <div class="text-body1" style="position: relative; text-align: right">
                        <span style="position: absolute;left: 0;" >Unidad Funcional</span>

                        <span style="font-size: 12px">
                            <q-btn icon="close" class="q-mr-xs" style="padding: 0px; margin: 0px; font-size: 12px" color="black" v-close-popup dense flat round>
                                <q-tooltip>Cerrar</q-tooltip>
                            </q-btn>
                        </span>
                    </div>
                </q-card-section>

                <q-card-section class="row q-col-gutter-sm" dense>

                    <div class="col-12 col-md-12" >
                        <q-input label="" v-model="filtro.nomUsuario" readonly filled outlined dense>
                            <template v-slot:label><span>Usuario <span class="text-red text-bold" v-show="accion!=='CONSULTAR'"> </span></span></template>
                        </q-input>
                    </div>

                    <div class="col-12 col-md-12" >
                        <q-input label="" v-model="filtro.sisNombre" readonly filled outlined dense>
                            <template v-slot:label><span>Sistema <span class="text-red text-bold" v-show="accion!=='CONSULTAR'"> </span></span></template>
                        </q-input>
                    </div>

                    <div class="col-12 col-md-12" >
                        <table style="display: grid"><tr style="background: #3679B6; color: white; display: grid; text-align: center; padding: 8px 5px 8px 0px" ><td>Unidad Funcional</td></tr></table>
                        <table style="display: block; height: 500px; overflow-y: scroll;">
                            <tr v-for="(usuCar, i) in listaUsuCar" :style=" ( (usuCar.nivel=='0' || usuCar.nivel=='2') ? 'background: rgb(216, 213, 213)' : (usuCar.nivel=='3' ? 'background: rgb(242, 242, 242)': (usuCar.nivel=='4' ? ' background: rgb(249 249 249)': 'background: rgb(216, 213, 213)') )) " :disabled="usuCar.uorEstado==1 ? false : true" >
<!--                                <td><q-checkbox v-model="usuCar.flgActivo==0 ? true : false" ></q-checkbox> </td>-->   <!--@input="habiliarPerfil(mi2.idUsuPerfil, mi.idUsuario, mi2.idPerfil, mi2.flgUsuarioActivo, mi2.flgUsuarioActivoB)"-->
                                <td :style=" ( (usuCar.nivel=='0' || usuCar.nivel=='2') ? 'padding: 0px 5px 0px 0px' : (usuCar.nivel=='3' ? 'padding: 0px 5px 0px 40px': (usuCar.nivel=='4' ? 'padding: 0px 5px 0px 80px': 'padding: 0px 5px 0px 120px') )) " >
                                    <span>
                                        <q-checkbox v-model="usuCar.flgActivoB" :disable="usuCar.uorEstado==1 ? false : true" @input="habilitarUsuCar(filtro.idUsuario, filtro.idSistema, usuCar.idUnidadOrganica, usuCar.flgActivoB)" ></q-checkbox>
                                    </span>
                                    <span>{{usuCar.uorNombre}}<!-- - {{usuCar.nivel}}--></span>
                                    <div style="float: right; padding-right: 10px; padding-top: 5px;" v-if="filtro.idSistema=='23'">
                                        <q-btn @click="abrirDialogoUsuarioCargo(usuCar.idUnidadOrganica, usuCar.uorNombre, datosTmp.idUsuario)" icon="assignment_ind" size="12px" style="color: #3679b6;" :disabled=" (usuCar.nivel=='4') ? false : true" dense flat round >
                                            <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">Asignar Cargo</q-tooltip>
                                        </q-btn>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>

                </q-card-section>
            </q-card>

        </q-dialog>

        <q-dialog v-model="dialogo.frmUsuarioCargo" persistent>
            <q-card style="width: 700px; max-width: 900px; overflow-x: hidden;">

                <q-card-section class="bg-header-dialog">
                    <div class="text-body1" style="position: relative; text-align: right">
                        <span style="position: absolute;left: 0;" >Cargos</span>

                        <span style="font-size: 12px">
                            <q-btn icon="close" class="q-mr-xs" style="padding: 0px; margin: 0px; font-size: 12px" color="black" v-close-popup dense flat round>
                                <q-tooltip>Cerrar</q-tooltip>
                            </q-btn>
                        </span>
                    </div>
                </q-card-section>

                <q-card-section class="row q-col-gutter-sm" dense>

                    <div class="col-12 col-md-12" >
                        <q-input label="" v-model="filtro.nomUsuario" readonly filled outlined dense>
                            <template v-slot:label><span>Usuario <span class="text-red text-bold" v-show="accion!=='CONSULTAR'"> </span></span></template>
                        </q-input>
                    </div>

                    <div class="col-12 col-md-12" >
                        <q-input label="" v-model="obj.usuCar.unidadOrganica" readonly filled outlined dense>
                            <template v-slot:label><span>Unidad Organica <span class="text-red text-bold" v-show="accion!=='CONSULTAR'"> </span></span></template>
                        </q-input>
                    </div>

                    <div class="col-12 col-md-12" >
                        <table style="display: grid"><tr style="background: #3679B6; color: white; display: grid; text-align: center; padding: 8px 5px 8px 0px" ><td>Cargos</td></tr></table>
                        <table style="width: 100%">
                            <tr v-for="(cargoUsuario, i) in listaCargoUsuario" v-if="cargoUsuario.cargo!==null" style="background: rgb(242, 242, 242);">
                                <td>
                                    <span>
                                        <q-checkbox :label="cargoUsuario.sfpCargo + ' - ' + cargoUsuario.cargo" v-model="cargoUsuario.flgUsuarioCargoB" @input="habilitarCargoUsuario(filtro.idUsuario, obj.usuCar.idCentro, cargoUsuario.sfpCargo, cargoUsuario.flgUsuarioCargoB)" ></q-checkbox>
                                    </span>
                                    <span><!--{{cargoUsuario.cargo}}--></span>
                                </td>
                            </tr>
                        </table>
                    </div>

                </q-card-section>
            </q-card>

        </q-dialog>

    </q-page>
</template>

<style>
    .q-field__before {
        padding-right: 0px !important;
        border-right: 1px solid #d9d9d9;
        /*border-bottom: 2.5px dotted #8c8c8c;*/
    }
    .check-revisar { background: #f2f2f2; }

    .ck-read-only { background: #f2f2f2 !important; }

    .q-expansion-item--expanded .q-expansion-item__container {
        background-color: rgb(223 223 223);
        color: black;
    }

    /*textarea {
        height: 60px !important;
    }*/

</style>

<script>
import Vue from "vue";
    import {date} from "quasar";
    import dialogoUsuario from "components/dialogoUsuario.vue";
    import dialogoSistema from "components/dialogoSistema.vue";
import LoginLayout from "layouts/LoginLayout.vue";

    export default {
        name: "tdrServicioOficina",
        /*props: ['idPersonal'],*/
        components: { dialogoUsuario, dialogoSistema },
        data() {
            return {
                host: process.env.API_URL,

                leftDrawerOpen2: false,
                leftDrawerOpen: false,
                expanded: false,
                menu: {},
                filtro: { idUsuario: null, nomUsuario: '', idSistema: null, sisNombre: '' },
                datosTmp: { nombreObj: '', accion: [], tipo: [], valor: '', idSistema: null, idUsuario: null, nomSistema: '' },
                accion: '',

                obj: {
                    session: {
                        idUsuario: this.$q.localStorage.getItem('mda-idUsuario'),
                        idUnidadOrganica: this.$q.localStorage.getItem('mda-idUnidadOrganica'),
                        unidadOrganica: this.$q.localStorage.getItem('mda-unidadOrganica'),
                        idUnidadOrganicaDir: this.$q.localStorage.getItem('mda-idUnidadOrganicaDir'),
                        idUnidOrgPorDefecto: this.$q.localStorage.getItem('mda-idUnidOrgPorDefecto'),
                        unidOrgPorDefecto: this.$q.localStorage.getItem('mda-unidOrgPorDefecto'),
                    },
                    usuarioPerfil: {
                        idUsuPerfil: null,
                        upsPerfil: null,
                        upsUsuario: null,
                        upsEstado: null,

                        tipo: '',
                        idUsuarioReg: null,
                    },
                    usuCar: {
                        idUsuCar: null,
                        idUsuario: null,
                        idSistema: null,
                        idCentro: null,
                        idOpcion: null,
                        flgCentroPorDefecto: null,
                        estado: null,

                        unidadOrganica: '',

                        tipo: '',
                        idUsuarioReg: null,
                    },
                    cargoUsuario: {
                        sfpUnidad: null,
                        sfpCentro: null,
                        sfpCargo: null,
                        sfpUsuario: null,
                        sfpEstado: null,

                        tipo: '',
                        idUsuarioReg: null,
                    }
                },

                dialogo: { mensajeSistema: false, frmUsuarioCentro: false, frmUsuarioCargo: false },
                cargandoTDR: false,
                listaUsuCar: [],
                listaCargoUsuario: [],

            }
        },
        created() {
            this.init();
        },
        methods: {
            init: function(){
                //console.log("INIT  ",this.persona)
                let keys = Object.keys(this.$q.localStorage.getAll());
                let systemKeys = keys.filter(k => k.startsWith('mda-'));
            },

            obtenerMenu: function () {
            this.cargandoTDR = true;

            let idS = this.filtro.idSistema;
            let idU = this.filtro.idUsuario;

            this.datosTmp.nomSistema=this.filtro.sisNombre;
            this.datosTmp.idSistema=this.filtro.idSistema;
            this.datosTmp.idUsuario=this.filtro.idUsuario;

            if ( idS == null && idU == null ) {
                alert('Use los filtros para realizar la consulta.');
                this.cargandoTDR = false;
            } else {
                this.$axios.get(`${this.host}/SPermiso?action=itemsPermiso&u=${idU}&s=${idS}`)
                .then(response => {
                    this.menu = response.data;
                }).catch((e) => {
                    this.gestionarError(e);
                }).finally(() => {
                    this.cargandoTDR = false;
                });
            }
          },

            habiliarPerfil: function ( idUsuPerfil, idUsuario, idPerfil, flgUsuarioActivo, flgUsuarioActivoB ) {
                this.obj.usuarioPerfil.idUsuarioReg = this.obj.session.idUsuario;
                this.obj.usuarioPerfil.idUsuPerfil = 0;
                this.obj.usuarioPerfil.upsPerfil = idPerfil;
                this.obj.usuarioPerfil.upsUsuario = idUsuario;
                this.obj.usuarioPerfil.tipo = flgUsuarioActivoB==true ? 'HABILITAR_PERMISO' : 'DESHABILITAR_PERMISO';
                this.obj.usuarioPerfil.cadena = this.datosTmp.idSistema;

                let formData = new FormData();
                formData.append('obj', JSON.stringify(this.obj.usuarioPerfil))

                this.$axios.post(`${process.env.API_URL}/STsUsuarioPerfil?accion=ACTUALIZAR`, formData, {headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    this.mostrarMensaje(flgUsuarioActivoB==true ? 'PERMISO HABILITADO' : 'PERMISO DESHABILITADO', 'green', 'check_circle');
                }).catch((e) => {
                    this.gestionarError(e);
                }).finally(() => {

                });

            },

            habilitarUsuCar: function ( idUsuario, idSistema, idUnidadOrganica, flgActivoB ) {
                this.obj.usuCar.idUsuarioReg = this.obj.session.idUsuario;
                this.obj.usuCar.idUsuario = idUsuario;
                this.obj.usuCar.idSistema = idSistema;
                this.obj.usuCar.idOpcion = null;
                this.obj.usuCar.idCentro = idUnidadOrganica;
                this.obj.usuCar.flgCentroPorDefecto = 0;

                this.obj.usuCar.tipo = flgActivoB==true ? 'HABILITAR' : 'DESHABILITAR';

                let formData = new FormData();
                formData.append('obj', JSON.stringify(this.obj.usuCar))

                this.$axios.post(`${process.env.API_URL}/STsUsuCar?accion=ACTUALIZAR`, formData, {headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    this.mostrarMensaje(flgActivoB==true ? 'HABILITADO' : 'DESHABILITADO', 'green', 'check_circle');
                }).catch((e) => {
                    this.gestionarError(e);
                }).finally(() => {

                });

            },

            abrirDialogoUsuarioCentro: function ( idSistema, idUsuario ) {
                this.dialogo.frmUsuarioCentro = true;

                let idUsuarioReg = this.obj.session.idUsuario;
                let idUsuario2 = idUsuario;
                let idSistema2 = idSistema;

                let valor = idUsuarioReg+';'+idUsuario2+';'+idSistema2;

                let form = new FormData()
                form.append('obj', JSON.stringify({ tipo: 'CENTROS_POR_USUARIO_SISTEMA_2', valor: valor } ));

                this.$axios.post(`${process.env.API_URL}/STsUsuCar?accion=LISTAR`, form, {headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    //console.log(response.data);
                    this.listaUsuCar = response.data;
                }).catch((e) => {
                    this.gestionarError(e);
                }).finally(() => {

                });

            },

            abrirDialogoUsuarioCargo: function ( idUnidadOrganica, unidadOrganica, idUsuario ) {
                this.obj.usuCar.idCentro = idUnidadOrganica;
                this.obj.usuCar.unidadOrganica = unidadOrganica;
                this.dialogo.frmUsuarioCargo = true;

                let idUsuarioReg = this.obj.session.idUsuario;
                let idUsuario2 = idUsuario;
                let idUnidadOrganica2 = idUnidadOrganica;

                let valor = idUsuario2+';'+idUnidadOrganica2;

                let form = new FormData()
                form.append('obj', JSON.stringify({ tipo: 'CARGO_POR_USUARIO_CENTRO', valor: valor } ));

                this.$axios.post(`${process.env.API_URL}/SSgCargoUsuario?accion=LISTAR`, form, {headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    this.listaCargoUsuario = response.data;
                    /*console.log(this.listaUsuCar);*/
                }).catch((e) => {
                    this.gestionarError(e);
                }).finally(() => {

                });

            },

            habilitarCargoUsuario: function ( idUsuario, idUnidadOrganica, sfpCargo, flgUsuarioCargoB ) {
                this.obj.cargoUsuario.idUsuarioReg = this.obj.session.idUsuario;
                this.obj.cargoUsuario.sfpCentro = idUnidadOrganica;
                this.obj.cargoUsuario.sfpCargo = sfpCargo;
                this.obj.cargoUsuario.sfpUsuario = idUsuario;

                this.obj.cargoUsuario.tipo = flgUsuarioCargoB==true ? 'HABILITAR' : 'DESHABILITAR';

                let formData = new FormData();
                formData.append('obj', JSON.stringify(this.obj.cargoUsuario))

                this.$axios.post(`${process.env.API_URL}/SSgCargoUsuario?accion=ACTUALIZAR`, formData, {headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    this.mostrarMensaje(flgUsuarioCargoB==true ? 'HABILITADO' : 'DESHABILITADO', 'green', 'check_circle');
                }).catch((e) => {
                    this.gestionarError(e);
                }).finally(() => {

                });

            },

            seleccionarUsuario: function( data ){
                if( data.tipoRespuesta == '1' ) {
                    this.filtro.idUsuario = data.idUsuario;
                    this.filtro.nomUsuario = data.usuLdap + ' (' + data.apellidosNombres + ' - ' + data.unidadOrganica + ( data.flgDirector == '1' ? ' - Director/a' : '' ) + ')';

                    if (this.filtro.idSistema !== null) { this.obtenerMenu(); }
                } else {
                    this.filtro.idUsuario = null;
                }

                this.expanded = false;
            },

            seleccionarSistema: function( data ){
                if( data.tipoRespuesta == '1' ) {
                    this.filtro.idSistema = data.idSistema;
                    this.filtro.sisNombre = data.sisNombre;
                    if (this.filtro.idUsuario !== null) {  this.obtenerMenu(); }
                } else {
                    this.filtro.idSistema = null;
                }

                this.expanded = false;
            },

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

        computed: { }
    }
</script>

<style scoped>

</style>

