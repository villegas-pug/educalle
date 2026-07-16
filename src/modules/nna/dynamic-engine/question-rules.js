import { isHttpParamsWildcard, normalizeComparisonText, parseJsonFlexible, getCaseInsensitiveProperty } from './question-normalizer';

export function isBranchedView(question) { return String(question?.vistaControl || '').toLowerCase() === 'branched'; }
export function isSummaryRowView(question) { return String(question?.vistaControl || '').toLowerCase() === 'summaryrow'; }
export function isBranchedInputSearch(question) {
    return isBranchedView(question) && String(question?.tipoControl || '').toLowerCase() === 'text'
        && String(question?.modoControl || '').toLowerCase() === 'http' && Number(question?.reqDisparador) === 1
        && !isHttpParamsWildcard(question?.httpParams) && Array.isArray(question?._httpParamsParsed)
        && question._httpParamsParsed.length > 0;
}
export function isBranchedSelects(question) {
    return isBranchedView(question) && String(question?.tipoControl || '').toLowerCase() === 'select'
        && String(question?.modoControl || '').toLowerCase() === 'http' && Number(question?.reqDisparador) === 0;
}
export function isSimpleHttpSelect(question) {
    return String(question?.tipoControl || '').toLowerCase() === 'select' && String(question?.modoControl || '').toLowerCase() === 'http'
        && isHttpParamsWildcard(question?.httpParams) && String(question?._httpMethod || question?.httpMetodo || 'GET').toUpperCase() === 'GET';
}
export function isRedirected(question) { return String(question?.modoControl || '').toLowerCase() === 'redirected'; }

export function parseCondition(condition) {
    if (!condition) return null;
    try { return JSON.parse(condition); } catch (error) {
        try {
            const parts = condition.split(';');
            if (parts.length === 2) return { id: parseInt(parts[0].trim()), valor: Number(parts[1].replace(/[^\d]/g, '').trim()) };
        } catch (fallbackError) { /* Keep the legacy invalid-condition fallback. */ }
        return null;
    }
}

export function matchesCondition(baseValue, conditionValue) {
    const expand = value => Array.isArray(value) ? value : typeof value === 'string' && value.includes('|') ? value.split('|').map(item => item.trim()).filter(Boolean) : [value];
    const baseValues = expand(baseValue).map(normalizeComparisonText).filter(Boolean);
    const conditionValues = expand(conditionValue).map(normalizeComparisonText).filter(Boolean);
    return baseValues.length > 0 && conditionValues.length > 0 && baseValues.some(value => conditionValues.includes(value));
}

export function isQuestionVisible(question, findQuestion) {
    if (!question?.condicion || !question.condicion.id) return true;
    const baseQuestion = findQuestion(question.condicion.id);
    const baseValue = baseQuestion?.respuesta;
    if (baseValue === null || baseValue === undefined || baseValue === '') return false;
    return !isNaN(question.condicion.valor)
        ? Number(baseValue) >= Number(question.condicion.valor)
        : matchesCondition(baseValue, question.condicion.valor);
}

export function isQuestion2Visible(question, findQuestion) {
    if (!question?.pregunta2 || !question.respuesta) return false;
    const condition = question.condicion;
    if (!condition) return true;
    if (!condition.id) return normalizeComparisonText(question.respuesta) === normalizeComparisonText(condition.valor);
    const baseQuestion = findQuestion(condition.id);
    if (!baseQuestion?.respuesta) return false;
    return !isNaN(condition.valor)
        ? Number(baseQuestion.respuesta) >= Number(condition.valor)
        : normalizeComparisonText(baseQuestion.respuesta) === normalizeComparisonText(condition.valor);
}

export function matchesEditableRule(rule, findQuestion) {
    if (!rule || !rule.id) return true;
    const baseQuestion = findQuestion(rule.id);
    return !!baseQuestion && matchesCondition(baseQuestion.respuesta, rule.valor);
}

export function isReadOnly(question, { isView, findQuestion }) {
    if (isView || ['readonly', 'redirected'].includes(String(question?.modoControl || '').toLowerCase())) return true;
    return question?._editableRule ? !matchesEditableRule(question._editableRule, findQuestion) : false;
}

export function isBranchEditable(question, branch, { isView, findQuestion }) {
    if (isView || question?._ramificacionesReadonlyHttp) return false;
    const rule = question?._editableBifurcacionesRule;
    if (rule) {
        if (rule.mode === 'readonly-all') return false;
        if (rule.mode === 'editable-all') return true;
        return matchesEditableRule(rule, findQuestion);
    }
    if (question?._editableRule) return matchesEditableRule(question._editableRule, findQuestion);
    return branch?.editable !== undefined && branch?.editable !== null && ['true', '1'].includes(String(branch.editable).toLowerCase());
}

export function getRedirectRef(options) {
    const parsed = parseJsonFlexible(options);
    return getCaseInsensitiveProperty(parsed, 'ref') || getCaseInsensitiveProperty(parsed, 'REF') || null;
}

function parseIsoDate(value) {
    const match = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime())
        || date.getFullYear() !== Number(match[1])
        || date.getMonth() !== Number(match[2]) - 1
        || date.getDate() !== Number(match[3])
        ? null
        : date;
}

export function calculateCompleteAge(birthDate, referenceDate) {
    const birth = parseIsoDate(birthDate);
    const reference = parseIsoDate(referenceDate);
    if (!birth || !reference || birth > reference) return null;
    let age = reference.getFullYear() - birth.getFullYear();
    if (reference.getMonth() < birth.getMonth() || (reference.getMonth() === birth.getMonth() && reference.getDate() < birth.getDate())) age -= 1;
    return age;
}

export function matchesComparator(actual, comparator, expected) {
    switch (String(comparator || '<').trim()) {
        case '<': return actual < expected;
        case '<=': return actual <= expected;
        case '>': return actual > expected;
        case '>=': return actual >= expected;
        case '=': case '==': case '===': return actual === expected;
        case '!=': case '<>': return actual !== expected;
        default: return false;
    }
}

export function evaluateBlockSubmitInvalidRule(question, { findQuestion, referenceDate }) {
    const rule = question?._bloqSubmitSiInvalidoRule;
    if (!rule) return null;
    if (rule.type !== 'MENOR') return null;

    const expected = Number(rule.value);
    const auxiliaryId = rule.auxiliaryId;
    const auxiliaryQuestion = findQuestion && auxiliaryId !== null && auxiliaryId !== undefined
        ? findQuestion(auxiliaryId)
        : null;
    const dateReference = auxiliaryQuestion?.respuesta || referenceDate;
    const age = calculateCompleteAge(question.respuesta, dateReference);
    if (age === null || !Number.isFinite(expected) || matchesComparator(age, rule.comparator, expected)) return null;
    return {
        question,
        message: rule.message || `${question.pregunta}: la edad calculada (${age}) debe cumplir ${rule.comparator} ${expected}.`
    };
}
