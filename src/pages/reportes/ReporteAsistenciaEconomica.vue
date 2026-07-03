<template>
    <div>

        <div class="q-pa-md">
            <div class="row q-col-gutter-md">

                <div class="col-12 col-md-4">
                    <q-select v-model="filtroAnio" :options="aniosDisponibles" label="AÑO INGRESO"
                        option-label="anio" option-value="id" emit-value map-options outlined dense />
                </div>

                <div class="col-12 col-md-4">
                    <q-input v-model="filtroDni" label="DNI USUARIO" outlined dense clearable />
                </div>

                <div class="col-12 col-md-4">
                    <q-input v-model="filtroNombre" label="NOMBRE USUARIO" outlined dense clearable />
                </div>

                <div class="col-12 col-md-4">
                    <q-input v-model="filtroCentro" label="NOMBRE CENTRO" outlined dense clearable />
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
    name: 'ReporteAsistenciaEconomica',
    data() {
        return {
            filtroAnio: String(new Date().getFullYear()),
            filtroDni: '',
            filtroNombre: '',
            filtroCentro: '',
            filtroTabla: '',
            dataTabla: [],
            loadingTabla: false,
            descargandoExcel: false,
            columnas: [
                { name: 'DNI_USUARIO',                label: 'DNI USUARIO',                field: 'DNI_USUARIO',                align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'NOMBRE_COMPLETO_USUARIO',    label: 'NOMBRE COMPLETO USUARIO',    field: 'NOMBRE_COMPLETO_USUARIO',    align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'SEXO_USUARIO',               label: 'SEXO',                       field: 'SEXO_USUARIO',               align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'FEC_NACIMIENTO_USUARIO',     label: 'FEC. NACIMIENTO',            field: 'FEC_NACIMIENTO_USUARIO',     align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'UBIGEO_RESIDENCIA',          label: 'UBIGEO RESIDENCIA',          field: 'UBIGEO_RESIDENCIA',          align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'DIRECCION_RESIDENCIA',       label: 'DIRECCIÓN RESIDENCIA',       field: 'DIRECCION_RESIDENCIA',       align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'FEC_INGRESO_SERVICIO',       label: 'FEC. INGRESO SERVICIO',      field: 'FEC_INGRESO_SERVICIO',       align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'NOMBRE_SERVICIO',            label: 'NOMBRE SERVICIO',            field: 'NOMBRE_SERVICIO',            align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'TIPO_CENTRO',                label: 'TIPO CENTRO',                field: 'TIPO_CENTRO',                align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'ESTADO_SERVICIO',            label: 'ESTADO SERVICIO',            field: 'ESTADO_SERVICIO',            align: 'center', sortable: true, classes: 'ellipsis-cell' },
                { name: 'PERFIL_INGRESO',             label: 'PERFIL INGRESO',             field: 'PERFIL_INGRESO',             align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'TIPO_EDUCACION',             label: 'TIPO EDUCACIÓN',             field: 'TIPO_EDUCACION',             align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'IIEE_MATRICULADO',           label: 'IIEE MATRICULADO',           field: 'IIEE_MATRICULADO',           align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'NIVEL_ESTUDIO_ACTUAL',       label: 'NIVEL ESTUDIO ACTUAL',       field: 'NIVEL_ESTUDIO_ACTUAL',       align: 'left',   sortable: true, classes: 'ellipsis-cell' },
                { name: 'GRADO_ESTUDIO_ACTUAL',       label: 'GRADO ESTUDIO ACTUAL',       field: 'GRADO_ESTUDIO_ACTUAL',       align: 'left',   sortable: true, classes: 'ellipsis-cell' }
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
            this.filtroDni = '';
            this.filtroNombre = '';
            this.filtroCentro = '';
            this.filtroTabla = '';
            this.dataTabla = [];
        },
        async cargarReporte() {
            this.loadingTabla = true;
            try {
                const params = {
                    anioIngreso: this.filtroAnio || '',
                    dniUsuario: this.filtroDni || '',
                    nombreUsuario: this.filtroNombre || '',
                    nombreCentro: this.filtroCentro || ''
                };
                const { data } = await this.$axios.get(
                    `${process.env.API_URL}/reporte/asistencia-economica`,
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
                    anioIngreso: this.filtroAnio || '',
                    dniUsuario: this.filtroDni || '',
                    nombreUsuario: this.filtroNombre || '',
                    nombreCentro: this.filtroCentro || ''
                };
                const { data, headers } = await this.$axios.get(
                    `${process.env.API_URL}/reporte/asistencia-economica/excel`,
                    { params, responseType: 'blob' }
                );
                if (!data || data.size === 0) {
                    throw new Error('respuesta vacía');
                }
                const disposition = headers && (headers['content-disposition'] || headers['Content-Disposition']);
                let filename = 'rpt-asistencia-economica.xlsx';
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
