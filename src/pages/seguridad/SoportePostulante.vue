<template>
    <q-page class="q-pa-md">
        <div class="row q-col-gutter-sm center">

            <q-card class="center" style="margin: 10px auto 0px; padding: 0px">
                <q-card-section>
                    <div class="col-12 text-center text-bold text-h6">SOPORTE POSTULACIÓN</div>
                    <div class="row col-12 q-col-gutter-xs" style="width: 700px; margin: 0px auto">

                        <div class="col-12 col-md-10">
                            <q-input label="N° de Documento de Identidad" v-model="filtro.nroDocumento" v-on:keyup.enter="cargarDatos" mask="#####################" maxlength="20" :autofocus="true" outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-sm-2 text-center">
                            <q-btn label="CONSULTAR" class="btn-buscar q-mr-xs" icon="search" @click="cargarDatos" :loading="cargando.btnConsultarDatos" :disable="!(filtro.nroDocumento!=='')" style="width: 100%"></q-btn>
                        </div>

                        <div class="col-12 col-md-12"><hr style="margin: 10px 30px"></div>

                        <div class="col-12 col-md-6">
                            <q-input label="N° de Documento de Identidad" v-model="obj.tdPostulacion.perNroDocumento" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-input label="RUC" v-model="obj.tdPostulacion.perRuc" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-12">
                            <q-input label="Nombres y apellidos" v-model="obj.tdPostulacion.nombresApellidos" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-12">
                            <q-input label="Correo" v-model="obj.tdPostulacion.perCorreo" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-input label="Nueva clave" v-model="obj.tdPostulacion.clave" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-input label="Fecha Ultima Clave" v-model="obj.tdPostulacion.fecUltimaClave" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-input label="Estado" v-model="obj.tdPostulacion.estado" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-input label="Fecha Finalizo Postulación" v-model="obj.tdPostulacion.fecFinPostulacion" readonly filled outlined dense denseOpts />
                        </div>

                        <div class="col-12 col-md-12"><hr style="margin: 10px 30px"></div>

                        <div class="col-12 col-md-12">
                            <q-input label="" v-model="datosTmp.correoNuevo" outlined dense denseOpts >
                                <template v-slot:label><span>Correo nuevo <span class="text-red text-bold"> (*)</span></span></template>
                            </q-input>
                        </div>

                        <div class="col-12 q-mt-xs q-mb-xs text-center">
                            <!--                    <q-btn label="Cancelar" class="btn-inabif"  v-close-popup></q-btn>-->
                            <q-btn label="Actualizar correo" class="btn-inabif q-mr-xs" @click="validar('POSTULACION', 'ACTUALIZAR','CORREO', obj.tdPostulacion)" :loading="cargando.btnActualizarDatos" ></q-btn>
                            <q-btn label="Anular registro de postulación" class="btn-inabif q-mr-xs" @click="validar('POSTULACION', 'ACTUALIZAR','ANULAR', obj.tdPostulacion)" :loading="cargando.btnActualizarDatos" ></q-btn>
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

    export default {
        name: "notificacion-orden",
        /*props: ['idPersonal'],*/
        components: {},
        data() {
            return {
                host: process.env.API_URL,

                filtro: { nroDocumento: '' },
                datosTmp: { nombreObj: '', accion: [], tipo: [], valor: '', idSistema: null, idUsuario: null, nomSistema: '', correo: '', flgConsulta: 0, correoNuevo: '' },
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

                    tdPostulacion: {
                        idPostulacion: null,
                        idPersona: null,
                        idUsuario: null,
                        idNumConvocatoria: null,

                        perNroDocumento: '',
                        perRuc: '',
                        perCorreo: '',
                        nombresApellidos: '',

                        fecFinPostulacion: '',
                        fecUltimaClave: '',

                        estado: '',
                        clave: '',

                        tipo: '',
                        valor: '',
                        idUsuarioReg: null,
                        cadena: '',
                    }
                },

                cargando: {
                    btnAceptarMensajeSistema: false,
                    btnConsultarDatos: false, btnActualizarDatos: false,
                    btnActualizarCorreo: false, btnAnularPostulacion: false
                },

                dialogo: { mensajeSistema: false },

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
                let comodin = 'SF';
                let valor = nroDocumento+';'+comodin;

                let form = new FormData()
                form.append('obj', JSON.stringify({ tipo: '*', valor: valor } ));

                this.$axios.post(`${process.env.API_URL}/SMySqlTdPostulacion?accion=LISTAR`, form, {headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    if ( response.data.length==0 ) {
                        this.limpiarDatos();
                    } else {
                        this.obj.tdPostulacion = response.data[0];
                        this.obj.tdPostulacion.perNroDocumento = nroDocumento;
                        this.datosTmp.correo = this.obj.tdPostulacion.perCorreo;
                        this.datosTmp.flgConsulta = 1;
                    }

                }).finally(() => {
                    this.cargando.btnConsultarDatos = false;
                });

                /*console.log("objFiltro: ",this.objFiltro);

                let valorUO = this.idUsuarioSession+';'+this.objFiltro.idUnidadOrganica;

                let form2 = new FormData()
                form2.append('unidadOrganica', JSON.stringify({
                    tipo: 'PADRE_HIJO',
                    valor: valorUO
                }));

                this.$axios
                    .post(`${process.env.API_URL}/SUnidadOrganica?accion=LISTAR2`, form2, {headers: {'Content-Type': 'multipart/form-data'}})
                    .then(response => {
                        console.log(response.data);
                        this.optionsDependenciaOtorgaConformidad = response.data;

                    }).finally(() => {
                        this.cargando = false;
                    });*/
            },

            limpiarDatos: function () {
                this.obj.tdPostulacion.idPostulacion = null;
                this.obj.tdPostulacion.idPersona = null;
                this.obj.tdPostulacion.idUsuario = null;
                this.obj.tdPostulacion.idNumConvocatoria = null;

                this.obj.tdPostulacion.perNroDocumento = '';
                this.obj.tdPostulacion.perRuc = '';
                this.obj.tdPostulacion.perCorreo = '';
                this.obj.tdPostulacion.nombresApellidos = '';

                this.obj.tdPostulacion.fecFinPostulacion = '';
                this.obj.tdPostulacion.fecUltimaClave = '';

                this.obj.tdPostulacion.estado = '';

                this.obj.tdPostulacion.tipo = '';
                this.obj.tdPostulacion.valor = '';
                this.obj.tdPostulacion.idUsuarioReg = null;

                this.datosTmp.flgConsulta = 0;
            },

            validar: function( nombreObj, accion, tipo, obj=null ){
                this.datosTmp.nombreObj = nombreObj;
                this.datosTmp.accion[0] = accion;
                this.datosTmp.tipo[0] = tipo;
                this.obj.tdPostulacion = obj==null ? this.obj.tdPostulacion : Vue.util.extend({}, obj);

                let flagObligatorio = 0, flagInconsistente = 0, flagAdvertencia = 0, flagSistema = 0;
                let msj = '', msjObligatorio = '', msjInconsistente = '', msjAdvertencia = '', msjSistema = '';

                msjObligatorio = "<span style='font-weight: bold'>Verificar los siguientes datos obligatorios (*):</span><br><ul style='padding-left: 20px; margin-top: 6px; margin-bottom: 0px;'>";
                if ( this.datosTmp.flgConsulta == 1 ){
                    if ( nombreObj == 'POSTULACION' && ( accion == 'ACTUALIZAR' ) && tipo == 'CORREO' ){
                        if ( this.datosTmp.correoNuevo == '' || this.datosTmp.correoNuevo == null ) { msjObligatorio += "<li>Correo.</li>"; flagObligatorio = 1; }
                    }
                } else {
                    if ( nombreObj == 'POSTULACION' && ( accion == 'ACTUALIZAR' ) && (tipo == 'CORREO') ){
                        if ( this.obj.tdPostulacion.idPostulacion == '' || this.obj.tdPostulacion.idPostulacion == null ) { msjObligatorio = "<span>Para <b>actualizar el correo</b> del postulante, primero debe realizar la consulta por número de documento de identidad.</span><ul>"; flagObligatorio = 1; }
                    }
                    if ( nombreObj == 'POSTULACION' && ( accion == 'ACTUALIZAR' ) && (tipo == 'ANULAR') ){
                        if ( this.obj.tdPostulacion.idPostulacion == '' || this.obj.tdPostulacion.idPostulacion == null ) { msjObligatorio = "<span>Para <b>anular</b> el registro de postulación primero debe realizar la consulta por número de documento de identidad.</span><ul>"; flagObligatorio = 1; }
                    }
                }
                msjObligatorio += '</ul>';

                msjInconsistente = "<span style='font-weight: bold'>Verificar los siguientes datos inconsistentes:</span><br><ul style='padding-left: 20px; margin-top: 6px; margin-bottom: 0px;'>";
                if ( this.datosTmp.flgConsulta == 1 ){
                    if ( nombreObj == 'POSTULACION' && ( accion == 'ACTUALIZAR' ) && tipo == 'CORREO' && this.validaEmail(this.obj.tdPostulacion.perCorreo) == false ) {
                        msjInconsistente += "<li>Ingrese un correo valido: "+(this.datosTmp.correoNuevo ? this.datosTmp.correoNuevo : '')+".</li>"; flagInconsistente = 1;
                    }
                    if ( nombreObj == 'POSTULACION' && ( accion == 'ACTUALIZAR' ) && tipo == 'CORREO' && this.datosTmp.correo == this.datosTmp.correoNuevo ) {
                        msjInconsistente += "<li>El correo debe ser distinto al establecido: "+(this.datosTmp.correo)+".</li>"; flagInconsistente = 1;
                    }
                }
                msjInconsistente += '</ul>';

                msjAdvertencia = "<div>";

                /*if ( nombreObj == 'ENTRADA_CAB' && accion == 'ELIMINAR' && tipo == 'LOGICO' ) {
                    msjAdvertencia += "<span>Está a punto de <b>eliminar</b> la donación N° "+this.obj.entradaCab.ecNumeracion+", una vez eliminada el registro no será posible recuperarlo.</span>"; flagAdvertencia = 1;
                }*/
                msjAdvertencia += '</div>';

                // ************************************************ //
                if ( flagObligatorio == 1 || flagInconsistente == 1 ) {
                    msj = (flagObligatorio == 1 ? msjObligatorio : '') + (flagInconsistente == 1 ? (flagObligatorio == 1 ? '<br>' : '') + msjInconsistente : '');
                    this.abrirDialogoMensajeSistema( 'MENSAJE', obj , msj, '' );
                } else if ( flagAdvertencia == 1 ) {
                    msj = msjAdvertencia;
                    this.abrirDialogoMensajeSistema(  'CONFIRMACION', obj , msj, '¿Desea continuar?' );
                } else {
                    this.obj.tdPostulacion.idUsuarioReg = this.obj.session.idUsuario;

                    if ( nombreObj == 'POSTULACION' && accion == 'ACTUALIZAR' ) {  this.actualizarPostulacion( tipo ); }
                }

            },

            abrirDialogoMensajeSistema: function( tipo, fila, msjDescripcion, msjPreguntaConfirmacion ){
                //console.log("abrirDialogoMensajeSistema >> tipo: ", tipo, " - fila: ", fila, " - msjDescripcion: ", msjDescripcion, " - msjPreguntaConfirmacion: ", msjPreguntaConfirmacion)
                this.dialogo.mensajeSistema = true;

                if ( this.datosTmp.nombreObj == 'POSTULACION' ) { this.obj.tdPostulacion = Vue.util.extend({}, fila); }

                this.msj.descripcion = msjDescripcion;
                this.msj.preguntaConfirmacion = msjPreguntaConfirmacion;
                this.msj.tipo = tipo;
            },

            confirmarMensajeSistema: function( tipo ) {
                //console.log("confirmarMensajeSistema => accion: ", this.obj.datosTmp.accion, " - tipo: ", this.obj.datosTmp.tipo, " - nombreObj: ", this.obj.datosTmp.nombreObj);
                this.cargando.btnAceptarMensajeSistema = true;

                if ( this.obj.datosTmp.nombreObj == 'POSTULACION' && this.obj.datosTmp.accion[1] == 'ACTUALIZAR' ) {  this.actualizarPostulacion( this.obj.datosTmp.tipo[1] ); }

            },

            actualizarPostulacion: function( tipo ) {
                if (tipo=='CORREO') { this.cargando.btnActualizarCorreo = true; } else { this.cargando.btnAnularPostulacion = true; }
                this.obj.tdPostulacion.tipo = tipo;
                this.obj.tdPostulacion.idUsuarioReg = this.obj.session.idUsuario;
                this.obj.tdPostulacion.cadena = this.datosTmp.correoNuevo+";"+this.obj.tdPostulacion.idPersona;

                let formData = new FormData();
                formData.append('obj', JSON.stringify(this.obj.tdPostulacion));

                this.$axios.post(`${process.env.API_URL}/SMySqlTdPostulacion?accion=ACTUALIZAR`, formData, {headers: {'Content-Type': 'multipart/form-data'}
                }).then(response => {
                    this.mostrarMensaje('SE ACTUALIZÓ CORRECTAMENTE', 'green', 'check_circle');
                    this.filtro.nroDocumento = this.obj.tdPostulacion.perNroDocumento;
                    this.cargarDatos();
                }).catch((e) => {
                    this.gestionarError(e);
                }).finally(() => {
                    if (tipo=='CORREO') { this.cargando.btnActualizarCorreo = false; } else { this.cargando.btnAnularPostulacion = false; }
                });

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
