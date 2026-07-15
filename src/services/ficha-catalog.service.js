export function obtenerUnidades(http) {
    return http.get(`${process.env.API_URL}/anexo/unidadesSugesu`);
}

export function obtenerServicios(http, idUnidadOrganica) {
    return http.get(`${process.env.API_URL}/anexo/unidades-serviciosSugesu`, {
        params: { idUnidadOrganica }
    });
}

export function obtenerAnexos(http, idUnidadOrganica, idServicio) {
    return http.get(`${process.env.API_URL}/anexo/anexos-por-servicioSugesu`, {
        params: {
            idUnidadOrganica,
            idServicio
        }
    });
}

export function listarAnexos(http, idUnidadOrganica, idServicio, anexo) {
    return http.get(`${process.env.API_URL}/anexo/listar`, {
        params: {
            idUnidadOrganica,
            idServicio,
            anexo
        }
    });
}

export function listarCentros(http, idServicio) {
    return http.get(process.env.API_URL + "/centros/listar", {
        params: { idServicio }
    });
}

export function obtenerCatalogoPreguntas(http, anexo, idServicio) {
    return http.get(`${process.env.API_URL}/findAllAnexoPregustasByParams2`, {
        params: {
            anexo,
            idServicio
        }
    });
}

export function obtenerResponsablesSupervision(http) {
    return http.get(process.env.API_URL + "/responsables-supervision", {
        params: {
            abreviatura: "UNIDAD DE FORTALECIMIENTO DE SERVICIOS Y COORDINACIÓN TERRITORIAL"
        }
    });
}

export function obtenerResponsablesCentro(http, idUnidadOrganica) {
    return http.get(process.env.API_URL + "/responsables-centro", {
        params: { idUnidadOrganica }
    });
}
