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
export function isAgeQuestion(question) { return String(question?.tipoControl || '').toLowerCase() === 'age'; }

export function isDefaultValueEligible(question) {
    const type = String(question?.tipoControl || '').toLowerCase();
    return !isBranchedInputSearch(question) && !isBranchedSelects(question)
        && !isAgeQuestion(question) && !isRedirected(question) && type !== 'label';
}

export function parseCondition(condition) {
    if (!condition) return null;
    if (Array.isArray(condition) || typeof condition === 'object') return condition;
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

export function getQuestionVisibleAnswer(question) {
    if (!question || question.respuesta === null || question.respuesta === undefined) return '';
    const values = Array.isArray(question.respuesta)
        ? question.respuesta
        : String(question.respuesta).split('|');
    const options = Array.isArray(question.opciones) ? question.opciones : [];

    return values.map(value => {
        const option = options.find(item => normalizeComparisonText(item.value) === normalizeComparisonText(value));
        return option?.label ?? value;
    }).map(value => String(value).trim()).filter(Boolean).join('|');
}

export function getMatchingDefaultValueRule(question, findQuestion) {
    if (!isDefaultValueEligible(question) || !Array.isArray(question?._defaultValueRules) || typeof findQuestion !== 'function') return null;

    for (const rule of question._defaultValueRules) {
        const referenceValue = getQuestionVisibleAnswer(findQuestion(rule.id));
        const expectedValue = normalizeComparisonText(rule.value);
        if (referenceValue && expectedValue && normalizeComparisonText(referenceValue).includes(expectedValue)) {
            return rule;
        }
    }
    return null;
}

export function hasActiveDefaultValue(question, findQuestion) {
    return !!getMatchingDefaultValueRule(question, findQuestion);
}

export function resolveDefaultValue(question, findQuestion) {
    return getMatchingDefaultValueRule(question, findQuestion)?.defaultValue ?? null;
}

function isEmptyValue(value) {
    return value === null || value === undefined || value === '';
}

function isRangeConditionVisible(condition, findQuestion) {
    if (!condition.id) return false;
    const baseValue = findQuestion(condition.id)?.respuesta;
    if (isEmptyValue(baseValue) || Array.isArray(baseValue)) return false;

    const answer = Number(baseValue);
    const min = Number(condition.min);
    const max = Number(condition.max);
    return Number.isFinite(answer) && Number.isFinite(min) && Number.isFinite(max)
        && answer >= min && answer <= max;
}

function isLegacyConditionVisible(condition, findQuestion) {
    // El formato legado sin tipo conserva la regla id/valor existente.
    if (!condition.id) return true;
    const baseQuestion = findQuestion(condition.id);
    const baseValue = baseQuestion?.respuesta;
    if (isEmptyValue(baseValue)) return false;
    return !isNaN(condition.valor)
        ? Number(baseValue) >= Number(condition.valor)
        : matchesCondition(baseValue, condition.valor);
}

export function evaluateQuestionConditions(condition, findQuestion) {
    const conditions = Array.isArray(condition) ? condition : [condition];
    return conditions.filter(Boolean).every(item => String(item.tipo || '').toUpperCase() === 'RANGO'
        ? isRangeConditionVisible(item, findQuestion)
        : isLegacyConditionVisible(item, findQuestion));
}

export function isQuestionVisible(question, findQuestion) {
    return evaluateQuestionConditions(question?.condicion, findQuestion);
}

export function isQuestion2Visible(question, findQuestion) {
    if (!question?.pregunta2 || !question.respuesta) return false;
    return evaluateQuestionConditions(question.condicion, findQuestion);
}

export function matchesEditableRule(rule, findQuestion) {
    if (!rule || !rule.id) return true;
    const baseQuestion = findQuestion(rule.id);
    return !!baseQuestion && matchesCondition(baseQuestion.respuesta, rule.valor);
}

export function isReadOnly(question, { isView, findQuestion }) {
    if (isView || isAgeQuestion(question) || ['readonly', 'redirected'].includes(String(question?.modoControl || '').toLowerCase())) return true;
    if (hasActiveDefaultValue(question, findQuestion)) return true;
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

export function parseQuestionDate(value) {
    const text = String(value || '').trim();
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/)
        || text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const isIso = match[1].length === 4;
    const year = Number(isIso ? match[1] : match[3]);
    const month = Number(match[2]);
    const day = Number(isIso ? match[3] : match[1]);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime())
        || date.getFullYear() !== year
        || date.getMonth() !== month - 1
        || date.getDate() !== day
        ? null
        : date;
}

export function calculateCompleteAge(birthDate, referenceDate) {
    const birth = parseQuestionDate(birthDate);
    const reference = parseQuestionDate(referenceDate);
    if (!birth || !reference || birth > reference) return null;
    let age = reference.getFullYear() - birth.getFullYear();
    if (reference.getMonth() < birth.getMonth() || (reference.getMonth() === birth.getMonth() && reference.getDate() < birth.getDate())) age -= 1;
    return age;
}

export function calculateAgeQuestionAnswer(question, { findQuestion, referenceDate }) {
    return evaluateAgeQuestion(question, { findQuestion, referenceDate }).age;
}

export function evaluateAgeQuestion(question, { findQuestion, referenceDate }) {
    if (!isAgeQuestion(question)) return { age: null, reason: null };

    const sourceIds = question?._ageSourceIds;
    if (!sourceIds || !findQuestion) return { age: null, reason: null };

    const configuredReference = findQuestion(sourceIds.referenceId)?.respuesta;
    const birthDate = findQuestion(sourceIds.birthId)?.respuesta;
    const dateReference = parseQuestionDate(configuredReference) ? configuredReference : referenceDate;
    const birth = parseQuestionDate(birthDate);
    const reference = parseQuestionDate(dateReference);
    if (!birth || !reference) return { age: null, reason: null };
    if (birth > reference) return { age: null, reason: 'birth-after-reference' };

    return { age: calculateCompleteAge(birthDate, dateReference), reason: null };
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
    if (isAgeQuestion(question)) return null;
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
