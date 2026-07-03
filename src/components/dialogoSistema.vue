<template>
    <div>
        <q-dialog v-model="dialogo" persistent>
            <div class="q-gutter-y-md" style="max-width: 800px; width: 800px">
                <q-card>
                    <q-card-section class="q-pb-xs">
                        <div class="col-12 text-center text-bold text-h6 q-mb-xs">BÚSQUEDA DE USUARIOS</div>

                        <div class="col-12 row q-col-gutter-sm" v-if="parMostrarBarraBusqueda==1">

                            <div class="col-12 col-sm-10">
                                <q-input label="Nombre del sistema" v-model="objFiltro.sisNombre" v-on:keyup.enter="buscar" dense outlined/>
                            </div>

                            <div class="col-12 col-sm-2 text-center">
                                <q-btn label="Consultar" class="btn-buscar q-mr-xs" icon="refresh" @click="buscar" style="width: 100%" :loading="cargando"></q-btn>
                            </div>

                        </div>

                        <div class="row col-12 q-col-gutter-sm" v-if="parMostrarBuscarTabla==1">
                            <q-input borderless v-model="filter" placeholder="Buscar" :autofocus="true" style="width: 100%; border: 0px" outlined dense>
                                <template v-slot:append> <q-btn icon="search" class="q-mr-xs" style="padding: 0px; margin: 0px" :loading="cargando"  dense flat round></q-btn> </template>
                            </q-input>
                        </div>
                    </q-card-section>

                    <q-card-section>
                        <div class="row q-col-gutter-sm col-12">
                            <div class="col-12">
                                <q-table :data="lista" :columns="columnas" id="idCargo"
                                         :rows-per-page-options="opcionesFilasPorPagina" :pagination.sync="paginacion"
                                         @row-dblclick="filaSeleccionada('', scope.row, '', '1')"
                                         table-header-class="bg-inabif"
                                         class="tabla-cabecera-fija"
                                         :filter="filter"
                                         wrap-cells dense virtual-scroll>
                                    <template v-slot:body-cell-acciones="scope">
                                        <q-td :props="scope" auto-width style="width: 85px">
                                            <q-btn label="Seleccionar" class="btn-inabif" @click="filaSeleccionada('', scope.row, '', '1')"></q-btn>
                                        </q-td>
                                    </template>
                                </q-table>
                            </div>
                            <div class="col-12 text-center q-mt-md">
                                <q-btn label="Regresar" class="btn-inabif" v-close-popup></q-btn>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </q-dialog>

        <div class="cursor-pointer" style="cursor: pointer">
            <q-input label="" v-model="obj.nombre" @click="abrirDialogo" v-show="parTipoElemento=='INPUT'"  readonly :filled="!(parAccion!=='CONSULTAR')" outlined dense denseOpts >
                <template v-slot:label class="cursor-pointer">
                    <span>{{parTitulo}} <span class="text-red text-bold" v-if="!(parAccion=='CONSULTAR' || parAccion=='FILTRO')">(*)</span></span>
                </template>
                <template v-slot:append class="cursor-pointer" >
                    <q-icon name="search" @click="abrirDialogo" class="cursor-pointer" color="blue" v-if="!(parAccion=='CONSULTAR')" />
                    <q-icon name="cancel" class="cursor-pointer" v-show="obj.nombre!==''" @click="filaSeleccionada('', obj, '', '0')" color="blue" v-if="!(parAccion=='CONSULTAR')" />
                </template>
            </q-input>
        </div>


        <q-icon name="search" @click="abrirDialogo" class="cursor-pointer" color="blue" v-show="parTipoElemento=='ICONO'" />
        <!--<q-tooltip v-show="parTipoElemento=='ICONO'">Clic para consultar</q-tooltip>-->
    </div>
</template>

<script>
    import Vue from "vue";

    export default {
        name: "dialogoSistema",
        props: ["parTitulo", "parValorInputDefecto", "parFlgCargarConsulta",
                "parTipoElemento", "parTipoBusqueda", "parMostrarBarraBusqueda", "parMostrarBuscarTabla",
                "parAccion", "parTipo", "parValor"],
        data() {
            return {
                objFiltro: { nombre: '' },
                dialogo: false,
                dialogoFormulario: false,
                obj: { nombre: this.parValorInputDefecto },

                lista: [],
                filter: '',
                paginacion: {rowsPerPage: 50},
                opcionesFilasPorPagina: [5,10,20,50,100],
                columnas: [
                    { name: 'sisNombre', label: 'NOMBRE DEL SISTEMA', field: row => row.sisNombre, align: 'left' },
                    { name: 'acciones', label: 'ACCIONES', align: 'center' },
                ],

                cargando: false,
                tipoBusqueda: this.parTipo,
                idUsuarioSession: this.$q.localStorage.getItem('mda-idUsuario'),
            }
        },
        created() {
            let fechaActual = new Date();
            this.objFiltro.anhoEjec = ''+fechaActual.getFullYear();
        },
        methods: {
            abrirDialogo() {
                if ( this.parAccion !== 'CONSULTAR' ) {
                    this.dialogo = true;

                    if ( this.parFlgCargarConsulta == 1 ) {
                        this.buscar();
                    }
                }
            },
            buscar: function() {

                this.cargando = true;
                let valor='';

                if ( this.parTipoBusqueda=='PARAMETRO' ) {
                    valor = this.parValor;
                } else {
                    let idUsuario = this.idUsuarioSession;
                    let idSistema = 'SF';
                    let nomSistema = 'SF';
                    let estado = '1'; // ACTIVOS
                    let comodin = 'SF';

                    valor = idUsuario+';'+idSistema+';'+nomSistema+';'+estado+';'+comodin;
                }

              let form = new FormData();
              form.append('obj', JSON.stringify({ tipo: this.parTipo, valor: valor }));

              this.$axios.post(`${process.env.API_URL}/STsSistema?accion=LISTAR`, form, {headers: {'Content-Type': 'multipart/form-data'}
              }).then(response => {
                  this.lista = response.data;
              }).finally(() => {
                  this.cargando = false;
              });

            },

            filaSeleccionada: function(evt, row, index, tipoRespuesta){
              row.tipoRespuesta = tipoRespuesta;
              this.obj.nombre = tipoRespuesta=='1' ? row.sisNombre : '';

              let objClon = Vue.util.extend({}, row);
              this.$emit('datos', objClon);
              this.dialogo = false;

            },
        },
        computed: {}
    }
</script>

<style scoped>

</style>
