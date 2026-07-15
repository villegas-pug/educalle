export function obtenerRespuestas(http, idAnexoCabecera, correlativo) {
    return http.get(`${process.env.API_URL}/obtenerRespuestas`, {
        params: {
            idAnexoCabecera,
            correlativo
        }
    });
}

export function listarAnexosCabecera(http) {
    return http.get(`${process.env.API_URL}/listarAnexosCabecera`);
}

export function anularFicha(http, idAnexoCabecera) {
    return http.patch(`${process.env.API_URL}/saveEstadoConformidadAnexoCabecera?idAnexoCabecera=${idAnexoCabecera}&estado=0`);
}

export function actualizarFicha(http, payload) {
    return http.put(`${process.env.API_URL}/updateAnexoCompleto`, payload);
}

export function crearFicha(http, payload) {
    return http.post(`${process.env.API_URL}/createAnexoCompleto`, payload);
}

export function guardarConformidadFicha(http, idAnexoCabecera) {
    return http.patch(`${process.env.API_URL}/saveConformidadAnexoCabecera?idAnexoCabecera=${idAnexoCabecera}&estado=2`);
}

export function descargarFichaPdf(http, idAnexoCabecera, correlativo) {
    return http.get(`${process.env.API_URL}/anexo/pdf`, {
        params: {
            idAnexoCabecera,
            correlativo
        },
        responseType: "blob"
    });
}

export function descargarCompromisoPdf(http, idAnexoCabecera, correlativo) {
    return http.get(`${process.env.API_URL}/anexo/compromiso-nna/pdf`, {
        params: {
            idAnexoCabecera,
            correlativo
        },
        responseType: "blob"
    });
}

export function listarAudios(http, idAnexoCabecera) {
    return http.get(`${process.env.API_URL}/anexo-cabecera-audio/listar`, {
        params: { idAnexoCabecera }
    });
}

export function subirAudio(http, formData) {
    return http.post(`${process.env.API_URL}/anexo-cabecera-audio`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
}

export function guardarConformidadNna(http, idAnexoCabecera, fechaInscripcion) {
    return http.patch(`${process.env.API_URL}/save-conformidad-nna`, null, {
        params: {
            idAnexoCabecera,
            fechaInscripcion
        }
    });
}

export function eliminarAudio(http, idAudio) {
    return http.delete(`${process.env.API_URL}/anexo-cabecera-audio`, {
        params: { idAudio }
    });
}

export function obtenerAudioBlob(http, idAnexoCabecera, idAudio) {
    return http.get(`${process.env.API_URL}/anexo-cabecera-audio`, {
        params: {
            idAnexoCabecera,
            idAudio
        },
        responseType: "blob"
    });
}

export function validarPersonal(http, idAnexoCabecera, idPersonal, password) {
    return http.patch(`${process.env.API_URL}/validatePersonalAnexoCabecera?idAnexoCabecera=${idAnexoCabecera}&idPersonal=${encodeURIComponent(idPersonal)}&password=${encodeURIComponent(password)}`);
}
