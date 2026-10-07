export const FICHA_ESTADOS = Object.freeze({
    ANULADO: 0,
    EN_REGISTRO: 1,
    REGISTRADO: 2,
    SUSCRITO: 3
});

export const FICHA_ESTADOS_MAP = Object.freeze({
    [FICHA_ESTADOS.ANULADO]: { label: 'ANULADO', color: 'negative', textColor: 'white', icon: 'cancel' },
    [FICHA_ESTADOS.EN_REGISTRO]: { label: 'EN REGISTRO', color: 'amber-2', textColor: 'amber-10', icon: 'edit' },
    [FICHA_ESTADOS.REGISTRADO]: { label: 'REGISTRADO', color: 'light-blue-2', textColor: 'light-blue-10', icon: 'fact_check' },
    [FICHA_ESTADOS.SUSCRITO]: { label: 'SUSCRITO', color: 'green-2', textColor: 'green-10', icon: 'verified' }
});

export function compararEstadosFicha(a, b) {
    return (FICHA_ESTADOS_MAP[a]?.label || '').localeCompare(FICHA_ESTADOS_MAP[b]?.label || '');
}
