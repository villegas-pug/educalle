const routes = [
    {
        path: '/',
        component: () => import('layouts/LoginLayout.vue'),
        children: [
            {path: '', component: () => import('pages/Index.vue')},
        ]
    },
    {
        path: '/app',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {path: '/inicio', component: () => import('pages/Principal.vue')},
            {path: '/ficha', component: () => import('pages/Ficha.vue')},
            {path: '/registro-nna', component: () => import('pages/Ficha.vue')},

            //REPORTES
            {path: '/asistencia-economica', component: () => import('pages/reportes/ReporteAsistenciaEconomica.vue')},
            {path: '/sigeir', component: () => import('pages/reportes/ReporteSigeir.vue')},

            //SEGURIDAD
            {path: '/personas', component: () => import('pages/seguridad/RegistroPersona.vue')},
            {path: '/permisos', component: () => import('pages/seguridad/AsignarPermisos.vue')},
            {path: '/actualizar-correo-mp', component: () => import('pages/seguridad/ActualizarCorreoMesaPartes.vue')},
            {path: '/soporte-postulante', component: () => import('pages/seguridad/SoportePostulante.vue')},


        ]
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '*',
        component: () => import('pages/Error404.vue')
    }
]

export default routes
