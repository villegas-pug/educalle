<template>
    <q-page class="q-pa-md">
        <div class="row q-col-gutter-sm center">


            <q-card class="center" style="margin: 10px auto 0px; padding: 0px">
                <q-card-section>
                    <div class="col-12 text-center text-bold text-h6">ACTUALIZAR CORREO DE MESA DE PARTES DIGITAL</div>

                    <div class="row col-12 q-col-gutter-xs" style="width: 700px; margin: 0px auto">

                        <div class="col-12 col-md-10">
                            <q-input label="N° de Documento de Identidad" v-model="filtro.nroDocumento" v-on:keyup.enter="cargarDatos" mask="#####################" maxlength="20" :autofocus="true" autofocus outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-sm-2 text-center">
                            <q-btn label="CONSULTAR" class="btn-buscar q-mr-xs" icon="search" @click="cargarDatos" :loading="cargando.btnConsultarDatos" :disable="!(filtro.nroDocumento!=='')" style="width: 100%"></q-btn>
                        </div>

                        <div class="col-12 col-md-12"><hr style="margin: 10px 30px"></div>

                        <div class="col-12 col-md-12">  <!-- {{obj.mpUsuario}} -->
                            <q-input label="N° de Documento de Identidad" v-model="obj.mpUsuario.nroDocumento" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-12">
                            <q-input label="Nombres y apellidos" v-model="obj.mpUsuario.nombresApellidos" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-input label="Correo" v-model="obj.mpUsuario.usuNombre" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-input label="Telefóno" v-model="obj.mpUsuario.perTelefono" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-12"><hr style="margin: 10px 30px"></div>
<!--                        <div style="border: 1px solid grey;width: 90%;padding: 0px;margin: 15px auto;"></div>-->

                        <div class="col-12 col-md-12">
                            <q-input label="" type="textarea" v-model="datosTmp.motivo" outlined dense>
                                <template v-slot:label><span>Motivo <span class="text-red text-bold"> (*)</span></span></template>
                            </q-input>
                        </div>

                        <div class="col-12 col-md-10">
                            <q-input label="" v-model="datosTmp.correoNuevo" outlined dense denseOpts >
                                <template v-slot:label><span>Correo nuevo <span class="text-red text-bold"> (*)</span></span></template>
                            </q-input>
                        </div>

                        <div class="col-12 col-sm-2 text-center">
                            <q-btn label="Actualizar" class="btn-buscar q-mr-xs" icon="refresh" @click="validar('MP_USUARIO', 'ACTUALIZAR', '*', obj.mpUsuario )" :loading="cargando.btnActualizarDatos" style="width: 100%"></q-btn>
                        </div>

                    </div>

                </q-card-section>
            </q-card>

        </div>

        <q-dialog v-model="dialogo.mensajeSistema" persistent>
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
                            <span v-show="msj.tipo=='CONFIRMACION'">
                                <br>
                                <div style="font-weight: bold; text-align: center" v-html="msj.preguntaConfirmacion"></div>
                            </span>
                        </div>

                        <div class="col-12 col-md-12 text-center">
                            <q-btn label="Aceptar" @click="confirmarMensajeSistema(msj.tipo)" v-show="msj.tipo=='CONFIRMACION'" class="btn-inabif q-mr-xs" :loading="cargando.btnAceptarMensajeSistema"></q-btn>
                            <q-btn label="Cancelar" v-show="msj.tipo=='CONFIRMACION'" class="btn-inabif" v-close-popup></q-btn>
                            <q-btn label="Cerrar" class="btn-inabif" v-show="msj.tipo=='MENSAJE'" v-close-popup></q-btn>
                        </div>

                    </q-card-section>
                </q-card>
            </div>

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

    /*textarea {
        height: 60px !important;
    }*/

    /*input[type="text"] {
        text-transform: uppercase;
    }*/
    .upper-case {
        text-transform: uppercase;
    }
    textarea {
        height: 45px !important;
    }
</style>

<script>
    import {date} from "quasar";
    import {ref} from 'vue'
    import Vue from "vue";
    import LoginLayout from "layouts/LoginLayout.vue";

    export default {
        name: "notificacion-orden",
        /*props: ['idPersonal'],*/
        components: {},
        data() {
            return {
                host: process.env.API_URL,

                filtro: { nroDocumento: '' },
                datosTmp: { nombreObj: '', accion: [], tipo: [], valor: '', idSistema: null, idUsuario: null, nomSistema: '', motivo: '', correoNuevo: '', flgConsulta: '' },
                dialogo: { mensajeSistema: false },
                msj: { descripcion:'', preguntaConfirmacion:'', tipo:'', datoAdicional:'' },

                obj: {
                    session: {
                        idUsuario: this.$q.localStorage.getItem('mda-idUsuario'),
                        idUnidadOrganica: this.$q.localStorage.getItem('mda-idUnidadOrganica'),
                        unidadOrganica: this.$q.localStorage.getItem('mda-unidadOrganica'),
                        idUnidadOrganicaDir: this.$q.localStorage.getItem('mda-idUnidadOrganicaDir'),
                        idUnidOrgPorDefecto: this.$q.localStorage.getItem('mda-idUnidOrgPorDefecto'),
                        unidOrgPorDefecto: this.$q.localStorage.getItem('mda-unidOrgPorDefecto'),
                    },

                    mpUsuario: {
                        idUsuario: null,
                        usuNombre: '',
                        usuPersona: null,

                        perTelefono: '',
                        nombresApellidos: '',
                        nroDocumento: '',

                        motivo: '',
                        correoNuevo: '',

                        tipo: '',
                        valor: '',
                        cadena: '',
                        idUsuarioReg: null,
                    }
                },

                cargando: {
                    btnAceptarMensajeSistema: false,
                    btnConsultarDatos: false, btnActualizarDatos: false,
                },



            }
        },
        created() {
            //console.log('DISCAPACIDADES RECIBIDAS: ', this.discapacidades);
            this.init();

            let date = new Date();
        },
        methods: {
            init: function(){
                //console.log("INIT  ",this.persona)
                let keys = Object.keys(this.$q.localStorage.getAll());
                let systemKeys = keys.filter(k => k.startsWith('mda-'));

                if (systemKeys.length==0) {
                    window.location.href = 'https://srvapp01.inabif.gob.pe:8443/seguridad/SPrincipal';
                } else {

                }
            },

            cargarDatos: function () {
                this.cargando.btnConsultarDatos = true;

                let nroDocumento = this.filtro.nroDocumento=='' ? 'SF' : this.filtro.nroDocumento;
                let valor = nroDocumento;

                let form = new FormData()
                form.append('obj', JSON.stringify({ tipo: 'CONSULTA_CORREO', valor: valor } ));

                this.$axios.post(`${process.env.API_URL}/SMpUsuario?accion=LISTAR`, form, {headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    this.obj.mpUsuario = response.data[0];
                    this.datosTmp.motivo = '';
                    this.datosTmp.correoNuevo = '';
                    this.datosTmp.flgConsulta = 1;
                    this.obj.mpUsuario.nroDocumento = this.filtro.nroDocumento;
                }).finally(() => {
                    this.cargando.btnConsultarDatos = false;
                });

            },

            validar: function( nombreObj, accion, tipo, obj=null ){
                this.datosTmp.nombreObj = nombreObj;
                this.obj.mpUsuario = obj==null ? this.obj.mpUsuario : Vue.util.extend({}, obj);
                this.datosTmp.accion[0] = accion;
                this.datosTmp.tipo[0] = tipo;

                let flagObligatorio = 0, flagInconsistente = 0, flagAdvertencia = 0, flagSistema = 0;
                let msj = '', msjObligatorio = '', msjInconsistente = '', msjAdvertencia = '', msjSistema = '';

                msjObligatorio = "<span style='font-weight: bold'>Verificar los siguientes datos obligatorios (*):</span><br><ul style='padding-left: 20px; margin-top: 6px; margin-bottom: 0px;'>";
                if ( this.datosTmp.flgConsulta == 0 && nombreObj == 'MP_USUARIO' && ( accion == 'ACTUALIZAR'  ) ){
                    if ( this.obj.mpUsuario.nombresApellidos == '' || this.obj.mpUsuario.nombresApellidos == null ) { msjObligatorio = "<span>Para <b>actualizar</b> el correo del ciudadano, primero debe realizar la consulta por número de documento de identidad.</span><ul>"; flagObligatorio = 1; }
                }
                if ( this.datosTmp.flgConsulta == 1 && nombreObj == 'MP_USUARIO' && ( accion == 'ACTUALIZAR'  ) ){
                    // if ( this.obj.mpUsuario.nombresApellidos == '' || this.obj.mpUsuario.nombresApellidos == null ) { msjObligatorio += "<li>Consulta DNI.</li>"; flagObligatorio = 1; }
                    if ( this.datosTmp.motivo == '' || this.datosTmp.motivo == null ) { msjObligatorio += "<li>Motivo.</li>"; flagObligatorio = 1; }
                    if ( this.datosTmp.correoNuevo == '' || this.datosTmp.correoNuevo == null ) { msjObligatorio += "<li>Correo actual.</li>"; flagObligatorio = 1; }
                }
                msjObligatorio += '</ul>';

                msjInconsistente = "<span style='font-weight: bold'>Verificar los siguientes datos inconsistentes:</span><br><ul style='padding-left: 20px; margin-top: 6px; margin-bottom: 0px;'>";
                if ( this.datosTmp.flgConsulta == 1 && this.datosTmp.correoNuevo.length > 0 && this.validaEmail(this.datosTmp.correoNuevo) == false  ) {
                    msjInconsistente += "<li>Ingrese un correo ("+(this.datosTmp.correoNuevo ? this.datosTmp.correoNuevo : '')+") valido.</li>"; flagInconsistente = 1;
                }
                if ( this.datosTmp.flgConsulta == 1 && (this.obj.mpUsuario.usuNombre).trim() == (this.datosTmp.correoNuevo).trim() ) {
                    msjInconsistente += "<li>Ingrese un correo ("+(this.datosTmp.correoNuevo ? this.datosTmp.correoNuevo : '')+") distinto al actual ("+this.obj.mpUsuario.usuNombre+").</li>"; flagInconsistente = 1;
                }
                msjInconsistente += '</ul>';

                msjAdvertencia = "<div>";
                /*if ( nombreObj == 'MP_USUARIO' && accion == 'ELIMINAR' && tipo == 'LOGICO' ) {
                    msjAdvertencia += "<span>Está a punto de <b>eliminar</b> la donación N° "+this.obj.entradaCab.ecNumeracion+", una vez eliminada el registro no será posible recuperarlo.</span>"; flagAdvertencia = 1;
                }*/
                msjAdvertencia += '</div>';

                // ************************************************ //
                if ( flagObligatorio == 1 || flagInconsistente == 1 ) {
                    msj = (flagObligatorio == 1 ? msjObligatorio : '') + (flagInconsistente == 1 ? (flagObligatorio == 1 ? '<br>' : '') + msjInconsistente : '');
                    this.abrirDialogoMensajeSistema( 'MENSAJE', obj , msj, '' );
                } else if ( flagAdvertencia == 1 ) {
                    msj = msjAdvertencia;
                    this.abrirDialogoMensajeSistema( 'CONFIRMACION', obj , msj, '¿Desea continuar?' );
                } else {
                    this.obj.mpUsuario.idUsuarioReg = this.obj.session.idUsuario;
                    if ( nombreObj == 'MP_USUARIO' && accion == 'ACTUALIZAR' && tipo == '*' ) {  this.actualizarCorreo(); }
                }

            },

            confirmarMensajeSistema: function( tipo ) {
                //console.log("confirmarMensajeSistema => accion: ", this.obj.datosTmp.accion, " - tipo: ", this.obj.datosTmp.tipo, " - nombreObj: ", this.obj.datosTmp.nombreObj);
                this.cargando.btnAceptarMensajeSistema = true;

                //if ( this.datosTmp.nombreObj == 'MP_USUARIO' && this.datosTmp.accion[0] == 'ACTUALIZAR' && this.datosTmp.tipo[0] == '*' ) {  this.actualizarActa( this.obj.datosTmp.tipo[1] ); }
            },

            actualizarCorreo: function (){
                this.obj.mpUsuario.tipo = 'ACTUALIZAR_CORREO';
                this.cargando.btnActualizarDatos = true;
                this.obj.mpUsuario.cadena = this.obj.session.idUsuario + ';' + this.obj.mpUsuario.idUsuario + ';' + this.obj.mpUsuario.usuPersona + ';' + this.obj.mpUsuario.usuNombre + ';' + this.datosTmp.correoNuevo + ';' + this.datosTmp.motivo;

                let formData = new FormData();
                formData.append('obj', JSON.stringify(this.obj.mpUsuario));

                this.$axios.post(`${process.env.API_URL}/SMpUsuario?accion=ACTUALIZAR`, formData, {headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    //console.log(response);
                    if (response.data[0].sw == '1') {
                        this.mostrarMensaje('SE REGISTRO CORRECTAMENTE', 'green', 'check_circle');
                        this.cargarDatos();
                        //this.obj.datosTmp.accion[0] = 'EDITAR';
                    }
                }).catch((e) => {
                    this.gestionarError(e);
                }).finally(() => {
                    this.cargando.btnActualizarDatos = false;
                });
            },
            abrirDialogoMensajeSistema: function( tipo, fila, msjDescripcion, msjPreguntaConfirmacion ){
                //console.log("abrirDialogoMensajeSistema >> tipo: ", tipo, " - fila: ", fila, " - msjDescripcion: ", msjDescripcion, " - msjPreguntaConfirmacion: ", msjPreguntaConfirmacion)
                this.dialogo.mensajeSistema = true;

                if ( this.datosTmp.nombreObj == 'MP_USUARIO' ) { this.obj.mpUsuario = Vue.util.extend({}, fila); }

                this.msj.descripcion = msjDescripcion;
                this.msj.preguntaConfirmacion = msjPreguntaConfirmacion;
                this.msj.tipo = tipo;
            },
            validaEmail: function ( correo ) {
                var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                return regex.test(correo);
            },
            mostrarMensaje: function (mensaje, color, icono) {
                this.$q.notify({ message: mensaje, color: color, icon: icono , position: 'top-right'});
            },

        },

        computed: {}
    }
</script>

<style scoped>

</style>
