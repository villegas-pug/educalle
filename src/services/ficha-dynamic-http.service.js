export function executeDynamicHttp(http, { url, method = 'GET', params = null, body = null }) {
    if (!url) throw new Error('URL de servicio no definida');
    const fullUrl = `${process.env.API_URL}${url}`;
    if (String(method).toUpperCase() === 'POST') {
        return http.post(fullUrl, body || {});
    }
    return http.get(fullUrl, { params: params || {} });
}
