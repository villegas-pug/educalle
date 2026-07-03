<template>
    <div>

        <div class="q-pa-md">
            <div class="row q-col-gutter-md">

                <div class="col-12 col-md-4">
                    <q-select v-model="filtroAnio" :options="aniosDisponibles" label="AÑO AFILIACIÓN"
                        option-label="anio" option-value="id" emit-value map-options outlined dense />
                </div>

                <div class="col-12 col-md-4">
                    <q-input v-model="filtroDniUsuario" label="DNI USUARIO" outlined dense clearable />
                </div>

                <div class="col-12 col-md-4">
                    <q-input v-model="filtroNombreUsuario" label="NOMBRE USUARIO" outlined dense clearable />
                </div>

                <div class="col-12 col-md-4">
                    <q-input v-model="filtroDniAdmin" label="DNI ADMINISTRADOR" outlined dense clearable />
                </div>

                <div class="col-12 col-md-4">
                    <q-input v-model="filtroNombreAdmin" label="NOMBRE ADMINISTRADOR" outlined dense clearable />
                </div>

                <div class="col-12 col-md-4">
                    <q-select v-model="filtroCondicion" :options="opcionesCondicion" label="CONDICIÓN"
                        option-label="descripcion" option-value="id" emit-value map-options outlined dense clearable />
                </div>

            </div>
        </div>

        <div class="row">
            <div class="col-12 q-gutter-sm text-right q-mt-sm q-mb-md">
                <q-btn label="BUSCAR" icon="search" class="btn-inabif" size="sm" :loading="loadingTabla"
                    @click="cargarReporte" />
                <q-btn label="RESETEAR FILTROS" color="grey-5" text-color="white" icon-right="restart_alt"
                    class="btn-seccion-acciones" size="sm" @click="resetearFiltros" />
                <q-btn label="EXCEL" icon="download" color="green" class="btn-seccion-acciones" size="sm"
                    :loading="descargandoExcel" :disable="dataTabla.length === 0" @click="descargarExcel" />
            </div>
        </div>

        <div class="q-pa-md">
            <div class="col-12">
                <q-table class="tabla-anexos" :data="dataTabla" :columns="columnas" row-key="DNI_USUARIO"
                    table-header-class="bg-inabif text-bold" :rows-per-page-options="[10, 20, 50]"
                    :filter="filtroTabla" :loading="loadingTabla" dense flat bordered>
                    <template v-slot:top-right>
                        <q-input dense outlined debounce="300" v-model="filtroTabla" placeholder="Buscar...">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                    </template>
                </q-table>
            </div>
        </div>

    </div>
</template>

<style scoped>
.tabla-anexos .q-table {
    table-layout: fixed;
    width: 100%;
}

.tabla-anexos .q-table th,
.tabla-anexos .q-table td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.q-td .ellipsis {
    width: 100%;
    display: block;
}
</style>

<script>
export default {
    name: 'ReporteSigeir',
    data() {
        return {
            filtroAnio: String(new Date().getFullYear()),
            filtroDniUsuario: '',
            filtroNombreUsuario: '',
            filtroDniAdmin: '',
            filtroNombreAdmin: '',
            filtroCondicion: null,
            filtroTabla: '',
            dataTabla: [],
            loadingTabla: false,
            descargandoExcel: false,
            opcionesCondicion: [
                { id: 1, descripcion: 'NUEVO' },
                { id: 2, descripcion: 'CONTINUADOR' },
                { id: 3, descripcion: 'REINCORPORADO' }
            ],
            columnas: [
                { name: 'DNI_USUARIO',                   label: 'DNI USUARIO',                   field: 'DNI_USUARIO',                   align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'NOMBRE_COMPLETO_USUARIO',       label: 'NOMBRE COMPLETO USUARIO',       field: 'NOMBRE_COMPLETO_USUARIO',       align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'SEXO_USUARIO',                  label: 'SEXO USUARIO',                  field: 'SEXO_USUARIO',                  align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'FEC_NACIMIENTO_USUARIO',        label: 'FEC. NAC. USUARIO',             field: 'FEC_NACIMIENTO_USUARIO',        align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'UBIGEO_RESIDENCIA',             label: 'UBIGEO RESIDENCIA',             field: 'UBIGEO_RESIDENCIA',             align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'DIRECCION_RESIDENCIA',          label: 'DIRECCIÓN RESIDENCIA',          field: 'DIRECCION_RESIDENCIA',          align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'FECHA_AFILIACION',              label: 'FEC. AFILIACIÓN',               field: 'FECHA_AFILIACION',              align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'ESTADO',                        label: 'ESTADO',                        field: 'ESTADO',                        align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'CONDICION',                     label: 'CONDICIÓN',                     field: 'CONDICION',                     align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'NUMERO_PENSIONES',              label: 'NÚMERO PENSIONES',              field: 'NUMERO_PENSIONES',              align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'DNI_ADMINISTRADOR',             label: 'DNI ADMINISTRADOR',             field: 'DNI_ADMINISTRADOR',             align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'NOMBRE_COMPLETO_ADMINISTRADOR', label: 'NOMBRE COMPLETO ADMINISTRADOR', field: 'NOMBRE_COMPLETO_ADMINISTRADOR', align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'PARENTESCO_ADMINISTRADOR',      label: 'PARENTESCO ADMIN.',             field: 'PARENTESCO_ADMINISTRADOR',      align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'SEXO_ADMINISTRADOR',            label: 'SEXO ADMIN.',                   field: 'SEXO_ADMINISTRADOR',            align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'FEC_NACIMIENTO_ADMINISTRADOR',  label: 'FEC. NAC. ADMIN.',              field: 'FEC_NACIMIENTO_ADMINISTRADOR',  align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'PADRON_INICIO_AFILIACION',      label: 'PADRON INICIO AFIL.',           field: 'PADRON_INICIO_AFILIACION',      align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'PADRON_ULTIMO_AFILIACION',      label: 'PADRON ÚLTIMO AFIL.',           field: 'PADRON_ULTIMO_AFILIACION',      align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'ULTIMA_FECHA_VISITA',           label: 'ÚLT. FECHA VISITA',             field: 'ULTIMA_FECHA_VISITA',           align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'RESULTADO_ULTIMA_VISITA',       label: 'RESULTADO ÚLT. VISITA',         field: 'RESULTADO_ULTIMA_VISITA',       align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'NIVEL_ESTUDIO',                 label: 'NIVEL ESTUDIO',                 field: 'NIVEL_ESTUDIO',                 align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'CENTRO_ESTUDIO',                label: 'CENTRO ESTUDIO',                field: 'CENTRO_ESTUDIO',                align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'GRADO_ESTUDIO',                 label: 'GRADO ESTUDIO',                 field: 'GRADO_ESTUDIO',                 align: 'left',   sortable: true, classes: 'ellipsis-cell' }
            ]
        }
    },
    computed: {
        aniosDisponibles() {
            const currentYear = new Date().getFullYear();
            const anios = [];
            for (let y = currentYear; y >= 2015; y--) {
                anios.push({ id: String(y), anio: String(y) });
            }
            anios.push({ id: null, anio: 'TODOS' });
            return anios;
        }
    },
    methods: {
        resetearFiltros() {
            this.filtroAnio = String(new Date().getFullYear());
            this.filtroDniUsuario = '';
            this.filtroNombreUsuario = '';
            this.filtroDniAdmin = '';
            this.filtroNombreAdmin = '';
            this.filtroCondicion = null;
            this.filtroTabla = '';
            this.dataTabla = [];
        },
        async cargarReporte() {
            this.loadingTabla = true;
            try {
                const params = {
                    anioAfiliacion: this.filtroAnio || '',
                    dniUsuario: this.filtroDniUsuario || '',
                    nombreUsuario: this.filtroNombreUsuario || '',
                    dniAdministrador: this.filtroDniAdmin || '',
                    nombreAdministrador: this.filtroNombreAdmin || '',
                    condicion: this.filtroCondicion || ''
                };
                const { data } = await this.$axios.get(
                    `${process.env.API_URL}/reporte/sigeir`,
                    { params }
                );
                this.dataTabla = Array.isArray(data) ? data : [];
                if (this.dataTabla.length === 0) {
                    this.$q.notify({ type: 'negative', message: 'No se encontraron resultados' });
                }
            } catch (error) {
                this.dataTabla = [];
                this.$q.notify({ type: 'negative', message: 'Error al cargar el reporte' });
            } finally {
                this.loadingTabla = false;
            }
        },
        async descargarExcel() {
            this.descargandoExcel = true;
            try {
                const params = {
                    anioAfiliacion: this.filtroAnio || '',
                    dniUsuario: this.filtroDniUsuario || '',
                    nombreUsuario: this.filtroNombreUsuario || '',
                    dniAdministrador: this.filtroDniAdmin || '',
                    nombreAdministrador: this.filtroNombreAdmin || '',
                    condicion: this.filtroCondicion || ''
                };
                const { data, headers } = await this.$axios.get(
                    `${process.env.API_URL}/reporte/sigeir/excel`,
                    { params, responseType: 'blob' }
                );
                if (!data || data.size === 0) {
                    throw new Error('respuesta vacía');
                }
                const disposition = headers && (headers['content-disposition'] || headers['Content-Disposition']);
                let filename = 'rpt-sigeir.xlsx';
                if (disposition) {
                    const match = /filename="?([^"]+)"?/.exec(disposition);
                    if (match && match[1]) filename = match[1];
                }
                const blob = new Blob([data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                this.$q.notify({ type: 'negative', message: 'Error al descargar Excel' });
            } finally {
                this.descargandoExcel = false;
            }
        }
    },
    created() {
        this.cargarReporte();
    }
}
</script>
