export const SERVICIO_PADRE_EDUCALLE = 5;
const MENSAJE_EXITO = '¡Operación exitosa!';
const MENSAJE_SIN_RECURSOS = '¡Recurso no encontrado!';

function leerRespuesta(response) {
    const body = response?.data;
    if (!body || Number(body.code) !== 200) {
        const error = new Error(body?.message || 'No se pudo interpretar la respuesta del servicio');
        error.fields = body?.data;
        throw error;
    }
    return body;
}

function leerLista(response) {
    const body = leerRespuesta(response);
    if (body.data === null && body.message === MENSAJE_SIN_RECURSOS) return [];
    if (!Array.isArray(body.data)) throw new Error(body.message || 'El servicio no devolvió una lista válida');
    return body.data;
}

function confirmarEscritura(response) {
    const body = leerRespuesta(response);
    if (body.message !== MENSAJE_EXITO) throw new Error(body.message || 'No se pudo confirmar el guardado');
    return body;
}

function crearPayload(form) {
    return {
        espNombre: String(form.espNombre || '').trim(),
        espUbigeo: String(form.espUbigeo || ''),
        espNombreResponsable: String(form.espNombreResponsable || '').trim() || null
    };
}

function normalizarIdentificador(value) {
    return value === null || value === undefined ? '' : String(value).trim();
}

export function describirErrorEspacio(error) {
    const body = error?.response?.data;
    const fields = body?.data || error?.fields;
    return {
        message: body?.message || error?.message || 'No se pudo completar la operación',
        fields: fields && typeof fields === 'object' && !Array.isArray(fields) ? fields : {}
    };
}

export async function listarEspaciosIntervencion(http) {
    const response = await http.get(`${process.env.API_URL}/findAllEspIntervenciones`);
    return leerLista(response).filter(row => Number(row.idServicioPadre) === SERVICIO_PADRE_EDUCALLE);
}

export async function obtenerEspacioIntervencion(http, idEspInterv) {
    const response = await http.get(`${process.env.API_URL}/findEspIntervencionById`, { params: { idEspInterv } });
    const body = leerRespuesta(response);
    const row = body.data;
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
        throw new Error(body.message === MENSAJE_EXITO ? 'No se encontró el espacio de intervención' : body.message);
    }
    if (Number(row.idServicioPadre) !== SERVICIO_PADRE_EDUCALLE || String(row.idEspInterv) !== String(idEspInterv)) {
        throw new Error('El espacio no pertenece al servicio Educadores de Calle');
    }
    return row;
}

export async function crearEspacioIntervencion(http, form) {
    const response = await http.post(`${process.env.API_URL}/createEspIntervencion`, crearPayload(form), {
        headers: { 'Content-Type': 'application/json' }
    });
    const body = confirmarEscritura(response);
    if (!Number.isFinite(Number(body.data)) || Number(body.data) <= 0) {
        throw new Error('El servicio no confirmó el identificador del espacio creado');
    }
    return body.data;
}

export async function actualizarEspacioIntervencion(http, idEspInterv, form) {
    // Revalidar la pertenencia antes de guardar un espacio que pudo cambiar desde su apertura.
    await obtenerEspacioIntervencion(http, idEspInterv);
    const response = await http.put(`${process.env.API_URL}/updateEspIntervencion`, {
        ...crearPayload(form),
        idEspInterv
    }, { headers: { 'Content-Type': 'application/json' } });
    confirmarEscritura(response);
}

export function crearCatalogoEspaciosUbigeo(http) {
    const cache = new Map();
    const pendientes = [];
    let consultasActivas = 0;

    function ejecutarPendientes() {
        while (consultasActivas < 4 && pendientes.length) {
            const consulta = pendientes.shift();
            consultasActivas++;
            Promise.resolve().then(consulta.task).then(value => {
                consultasActivas--;
                consulta.resolve(value);
                ejecutarPendientes();
            }, error => {
                consultasActivas--;
                consulta.reject(error);
                ejecutarPendientes();
            });
        }
    }

    function consultar(key, path, params) {
        if (cache.has(key)) return cache.get(key);
        const promise = new Promise((resolve, reject) => {
            pendientes.push({
                resolve,
                reject,
                task: async () => leerLista(await http.get(`${process.env.API_URL}${path}`, { params }))
            });
            ejecutarPendientes();
        }).catch(error => {
            if (cache.get(key) === promise) cache.delete(key);
            throw error;
        });
        cache.set(key, promise);
        return promise;
    }

    const obtenerDepartamentos = () => consultar('departamentos', '/findAllDepartamentos');
    const obtenerProvincias = idUbigeo => consultar(`provincias:${idUbigeo}`, '/findAllProvinciasPorDepartamento', { idUbigeo });
    const obtenerDistritos = idUbigeo => consultar(`distritos:${idUbigeo}`, '/findAllDistritosPorProvincia', { idUbigeo });

    async function resolverUbigeo(registroOUbigeo) {
        const registro = registroOUbigeo && typeof registroOUbigeo === 'object' && !Array.isArray(registroOUbigeo)
            ? registroOUbigeo
            : { espUbigeo: registroOUbigeo };
        const ubigeo = String(registro.espUbigeo || '');
        const ids = {
            departamento: normalizarIdentificador(registro.idDepartamento),
            provincia: normalizarIdentificador(registro.idProvincia),
            distrito: normalizarIdentificador(registro.idDistrito)
        };
        const usaIdsBackend = !!(ids.departamento || ids.provincia || ids.distrito);
        const result = {
            departamento: null, provincia: null, distrito: null, error: '',
            departamentos: [], provincias: [], distritos: []
        };
        if (!usaIdsBackend && !/^\d{6}$/.test(ubigeo)) {
            result.error = 'El ubigeo guardado no es un código válido de seis dígitos';
            return result;
        }
        const departamentos = await obtenerDepartamentos();
        result.departamentos = departamentos;
        if (usaIdsBackend) {
            if (!ids.departamento) {
                result.error = 'El detalle no incluye el identificador del departamento';
                return result;
            }
            result.departamento = departamentos.find(item =>
                normalizarIdentificador(item.idDepartamento) === ids.departamento
            ) || null;
            if (!result.departamento) {
                result.error = 'El departamento guardado no se encuentra en el catálogo';
                return result;
            }
            const provincias = await obtenerProvincias(result.departamento.idUbigeo);
            result.provincias = provincias;
            if (!ids.provincia) {
                result.error = 'El detalle no incluye el identificador de la provincia';
                return result;
            }
            result.provincia = provincias.find(item =>
                normalizarIdentificador(item.idProvincia) === ids.provincia
            ) || null;
            if (!result.provincia) {
                result.error = 'La provincia guardada no se encuentra en el catálogo';
                return result;
            }
            const distritos = await obtenerDistritos(result.provincia.idUbigeo);
            result.distritos = distritos;
            if (!ids.distrito) {
                result.error = 'El detalle no incluye el identificador del distrito';
                return result;
            }
            result.distrito = distritos.find(item =>
                normalizarIdentificador(item.idDistrito) === ids.distrito
            ) || null;
            if (!result.distrito) result.error = 'El distrito guardado no se encuentra en el catálogo';
            return result;
        }

        result.departamento = departamentos.find(item =>
            normalizarIdentificador(item.idDepartamento) === ubigeo.slice(0, 2)
        ) || null;
        if (!result.departamento) {
            result.error = 'El departamento guardado no se encuentra en el catálogo';
            return result;
        }
        const provincias = await obtenerProvincias(result.departamento.idUbigeo);
        result.provincias = provincias;
        result.provincia = provincias.find(item =>
            normalizarIdentificador(item.idProvincia) === ubigeo.slice(2, 4)
        ) || null;
        if (!result.provincia) {
            result.error = 'La provincia guardada no se encuentra en el catálogo';
            return result;
        }
        const distritos = await obtenerDistritos(result.provincia.idUbigeo);
        result.distritos = distritos;
        result.distrito = distritos.find(item => normalizarIdentificador(item.idUbigeo) === ubigeo) || null;
        if (!result.distrito) result.error = 'El distrito guardado no se encuentra en el catálogo';
        return result;
    }

    return {
        obtenerDepartamentos,
        obtenerProvincias,
        obtenerDistritos,
        resolverUbigeo,
        reiniciar() { cache.clear(); }
    };
}
