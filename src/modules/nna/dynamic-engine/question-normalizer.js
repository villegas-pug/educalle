export function normalizeComparisonText(value) {
    return value === null || value === undefined
        ? ''
        : String(value).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function parseJsonFlexible(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value !== 'string') return value;

    const text = value.trim();
    if (!text) return null;
    if (text === '*') return '*';

    try {
        return JSON.parse(text);
    } catch (error) {
        const correctedText = text
            .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3')
            .replace(/'/g, '"');
        try {
            return JSON.parse(correctedText);
        } catch (secondError) {
            return null;
        }
    }
}

export function getCaseInsensitiveProperty(object, key) {
    if (!object || !key) return undefined;
    const normalizedKey = normalizeComparisonText(key);
    const foundKey = Object.keys(object).find(item => normalizeComparisonText(item) === normalizedKey);
    return foundKey ? object[foundKey] : undefined;
}

export function isHttpParamsWildcard(httpParams) {
    return httpParams === '*' || (typeof httpParams === 'string' && httpParams.trim() === '*');
}

export function parseOptions(options) {
    const parsed = parseJsonFlexible(options);
    if (Array.isArray(parsed)) {
        return parsed.map(item => {
            if (item === null || item === undefined) return null;
            if (typeof item !== 'object') {
                const value = String(item).trim();
                return value ? { label: value, value } : null;
            }
            const label = getCaseInsensitiveProperty(item, 'label')
                || getCaseInsensitiveProperty(item, 't')
                || getCaseInsensitiveProperty(item, 'text')
                || getCaseInsensitiveProperty(item, 'descripcion')
                || getCaseInsensitiveProperty(item, 'nombre');
            const value = getCaseInsensitiveProperty(item, 'value') ?? label;
            return label !== undefined && label !== null && String(label).trim()
                ? { label: String(label).trim(), value: value !== undefined && value !== null ? value : String(label).trim(), raw: item }
                : null;
        }).filter(Boolean);
    }
    if (typeof options !== 'string') return [];
    return options.split('|').map(option => option.trim()).filter(Boolean)
        .map(option => ({ label: option, value: option }));
}

export function normalizeHttpParams(httpParams) {
    if (isHttpParamsWildcard(httpParams)) return [];
    const parsed = parseJsonFlexible(httpParams);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => {
        if (!item || typeof item !== 'object') return { label: '', paramKey: '', valueKey: '', type: 'text', raw: {} };
        return {
            label: getCaseInsensitiveProperty(item, 't') || getCaseInsensitiveProperty(item, 'label') || '',
            paramKey: getCaseInsensitiveProperty(item, 'p') || getCaseInsensitiveProperty(item, 'param') || '',
            valueKey: getCaseInsensitiveProperty(item, 'v') || getCaseInsensitiveProperty(item, 'valueKey') || '',
            type: getCaseInsensitiveProperty(item, 'tipo') || getCaseInsensitiveProperty(item, 'type') || 'text',
            editable: getCaseInsensitiveProperty(item, 'editable'),
            raw: item
        };
    });
}

export function normalizeEditableRule(editable) {
    const parsed = parseJsonFlexible(editable);
    if (!parsed || typeof parsed !== 'object') return null;
    const id = Number(getCaseInsensitiveProperty(parsed, 'id'));
    const value = getCaseInsensitiveProperty(parsed, 'valor');
    return Number.isFinite(id) && value !== undefined && value !== null ? { id, valor: value } : null;
}

export function normalizeEditableBranches(editableBranches) {
    if (editableBranches === null || editableBranches === undefined || editableBranches === '') return { mode: 'readonly-all' };
    const parsed = parseJsonFlexible(editableBranches);
    if (parsed === '*') return { mode: 'editable-all' };
    if (!parsed || typeof parsed !== 'object') return { mode: 'readonly-all' };
    const id = Number(getCaseInsensitiveProperty(parsed, 'id'));
    const value = getCaseInsensitiveProperty(parsed, 'valor');
    return Number.isFinite(id) && value !== undefined && value !== null
        ? { mode: 'conditional', id, valor: value }
        : { mode: 'readonly-all' };
}

export function normalizeAgeSourceIds(options) {
    const parsed = parseJsonFlexible(options);
    if (!Array.isArray(parsed) || parsed.length < 2) return null;

    const referenceId = Number(getCaseInsensitiveProperty(parsed[0], 'id'));
    const birthId = Number(getCaseInsensitiveProperty(parsed[1], 'id'));
    return Number.isFinite(referenceId) && Number.isFinite(birthId)
        ? { referenceId, birthId }
        : null;
}

// Regla enviada por backend para impedir persistir cuando el valor no cumple.
export function normalizeBlockSubmitInvalidRule(rule) {
    if (rule === null || rule === undefined || rule === '' || rule === 0 || rule === '0' || rule === false || rule === 'false') return null;
    const parsed = parseJsonFlexible(rule);
    if (parsed === null) return null;
    if (typeof parsed !== 'object') return null;

    const type = normalizeComparisonText(getCaseInsensitiveProperty(parsed, 'tipo') || getCaseInsensitiveProperty(parsed, 'type'));
    if (!type) return null;
    return {
        type,
        comparator: String(getCaseInsensitiveProperty(parsed, 'comparador') || getCaseInsensitiveProperty(parsed, 'operador') || '<').trim(),
        value: getCaseInsensitiveProperty(parsed, 'valor') ?? getCaseInsensitiveProperty(parsed, 'value') ?? getCaseInsensitiveProperty(parsed, 'edad'),
        auxiliaryId: getCaseInsensitiveProperty(parsed, 'idAux'),
        message: String(getCaseInsensitiveProperty(parsed, 'mensaje') || '').trim()
    };
}

export function getHttpLabelField(options) {
    const parsed = parseJsonFlexible(options);
    return !parsed || Array.isArray(parsed) || typeof parsed !== 'object'
        ? 'nombre'
        : getCaseInsensitiveProperty(parsed, 'v') || 'nombre';
}

export function normalizeInputSearchBranches(options) {
    const parsed = parseJsonFlexible(options);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => {
        if (!item || typeof item !== 'object') return null;
        const label = getCaseInsensitiveProperty(item, 't') || getCaseInsensitiveProperty(item, 'label');
        const prop = getCaseInsensitiveProperty(item, 'p') || getCaseInsensitiveProperty(item, 'prop');
        return label && prop ? { label, prop, value: '', editable: getCaseInsensitiveProperty(item, 'editable') } : null;
    }).filter(Boolean);
}

export function normalizeSelectBranches(options) {
    const parsed = parseJsonFlexible(options);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => {
        if (!item || typeof item !== 'object') return null;
        const label = getCaseInsensitiveProperty(item, 't') || getCaseInsensitiveProperty(item, 'label');
        return label ? { label, valueField: getCaseInsensitiveProperty(item, 'v') || 'nombre' } : null;
    }).filter(Boolean);
}
