import { createNnaPageConfig } from 'src/modules/nna/nna-page-config';
import { compararEstadosFicha } from 'src/modules/nna/ficha-status';

export default {
    pageTitle: 'USUARIO DE NNA',
    pageConfig: {
        ...createNnaPageConfig(),
        accionesPrincipales: {
            ...createNnaPageConfig().accionesPrincipales,
            nuevo: false
        },
        accionesTabla: {
            editar: false,
            anular: false,
            ver: true,
            conformidad: false,
            validar: false
        },
        tableColumns: [
            { name: 'correlativoFormateado', label: 'N°', field: 'correlativoFormateado', align: 'center', sortable: true, style: 'width: 80px; min-width: 80px; max-width: 80px;' },
            { name: 'nombrePersonal', label: 'EDUCADOR DE CALLE', field: 'nombrePersonal', align: 'left', sortable: true, style: 'width: 280px; min-width: 280px;' },
            {
                name: 'codigoNNA',
                label: 'CÓDIGO',
                field: 'codigoNNA',
                align: 'center',
                sortable: true,
                sort: (a, b) => String(a || '').localeCompare(String(b || '')),
                style: 'width: 160px; min-width: 160px; max-width: 160px;',
                classes: 'ellipsis-cell'
            },
            {
                name: 'nombreCompleto',
                label: 'APELLIDOS Y NOMBRES',
                field: 'nombreCompleto',
                align: 'left',
                sortable: true,
                style: 'width: 280px; min-width: 280px;',
                classes: 'ellipsis-cell'
            },
            {
                name: 'edad',
                label: 'EDAD',
                field: 'edad',
                align: 'center',
                sortable: true,
                sort: (a, b) => Number(a || 0) - Number(b || 0),
                style: 'width: 90px; min-width: 90px; max-width: 90px;',
                classes: 'ellipsis-cell'
            },
            {
                name: 'genero',
                label: 'SEXO',
                field: 'genero',
                align: 'center',
                sortable: true,
                style: 'width: 120px; min-width: 120px; max-width: 120px;',
                classes: 'ellipsis-cell'
            },
            {
                name: 'sede',
                label: 'SEDE',
                field: 'sede',
                align: 'left',
                sortable: true,
                format: value => value || '—',
                style: 'width: 180px; min-width: 180px;',
                classes: 'ellipsis-cell'
            },
            {
                name: 'nombreCentro',
                label: 'ZONA INTERVENCIÓN',
                field: 'nombreCentro',
                align: 'left',
                sortable: true,
                style: 'width: 180px; min-width: 180px;',
                classes: 'ellipsis-cell'
            },
            {
                name: 'fechaAbordajeFormateada',
                label: 'FECHA ABORDAJE',
                field: 'fechaAbordajeFormateada',
                align: 'center',
                sortable: true,
                sort: (a, b, rowA, rowB) => String(rowA.fechaAbordaje || '').localeCompare(String(rowB.fechaAbordaje || '')),
                style: 'width: 150px; min-width: 150px; max-width: 150px;',
                classes: 'ellipsis-cell'
            },
            {
                name: 'fechaIngresoFormateada',
                label: 'FECHA INGRESO',
                field: 'fechaIngresoFormateada',
                align: 'center',
                sortable: true,
                sort: (a, b, rowA, rowB) => String(rowA.fechaIngreso || '').localeCompare(String(rowB.fechaIngreso || '')),
                style: 'width: 150px; min-width: 150px; max-width: 150px;',
                classes: 'ellipsis-cell'
            },
            {
                name: 'estado',
                label: 'ESTADO',
                field: 'estado',
                align: 'center',
                sortable: true,
                sort: compararEstadosFicha,
                style: 'width: 130px; min-width: 130px; max-width: 130px;'
            },
            {
                name: 'acciones',
                label: 'ACCIONES',
                field: 'acciones',
                align: 'center',
                style: 'width: 80px; min-width: 80px; max-width: 80px;'
            }
        ],
        visibleEstados: [2, 3],
        conformidadSoloLecturaEnVer: true
    }
};
