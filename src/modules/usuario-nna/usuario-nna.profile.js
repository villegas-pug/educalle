import { createNnaPageConfig } from 'src/modules/nna/nna-page-config';

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
            { name: 'fechaAbordajeFormateada', label: 'FECHA DE ABORDAJE', field: 'fechaAbordajeFormateada', align: 'center', sortable: true, style: 'width: 150px; min-width: 150px;' },
            { name: 'fechaIngresoFormateada', label: 'FECHA INGRESO', field: 'fechaIngresoFormateada', align: 'center', sortable: true, style: 'width: 130px; min-width: 130px;' },
            { name: 'estado', label: 'ESTADO', field: 'estado', align: 'center', sortable: true, style: 'width: 130px; min-width: 130px;' },
            { name: 'acciones', label: 'ACCIONES', field: 'acciones', align: 'center', style: 'width: 80px; min-width: 80px; max-width: 80px;' }
        ],
        conformidadSoloLecturaEnVer: true
    }
};
