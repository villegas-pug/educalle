import { isBranchedInputSearch, isBranchedSelects } from './question-rules';
import { normalizeComparisonText } from './question-normalizer';

function normalizeNumberMItems(rawAnswer) {
    const values = Array.isArray(rawAnswer) ? rawAnswer : !rawAnswer ? [] : String(rawAnswer).split('|');
    const seen = new Set();
    return values.reduce((items, value) => {
        const item = String(value === null || value === undefined ? '' : value).trim();
        if (!/^\d+$/.test(item)) return items;
        if (seen.has(item)) return items;
        seen.add(item);
        items.push(item);
        return items;
    }, []);
}

export function normalizeBranchedDerivedValue(value) {
    if (value === null || value === undefined) return '';
    return String(value).toUpperCase();
}

export function normalizeAnswer(question, rawAnswer) {
    if (isBranchedInputSearch(question) || isBranchedSelects(question)) return rawAnswer || null;
    switch (question.tipoControl) {
        case 'label': return rawAnswer || '';
        case 'text': case 'date': case 'dateInputs': case 'number': case 'textarea': case 'inputSearch': return rawAnswer || '';
        case 'age': {
            const age = Number(rawAnswer);
            return Number.isFinite(age) ? age : null;
        }
        case 'textM': return Array.isArray(rawAnswer) ? rawAnswer : !rawAnswer ? [] : String(rawAnswer).split('|').map(item => item.trim()).filter(Boolean);
        case 'numberM': return normalizeNumberMItems(rawAnswer);
        case 'timeRangeM': return Array.isArray(rawAnswer) ? rawAnswer : !rawAnswer ? [] : String(rawAnswer).split('|').map(item => item.trim()).filter(Boolean);
        case 'radio': case 'select':
            if (rawAnswer === null || rawAnswer === undefined || rawAnswer === '') return null;
            return !Array.isArray(question.opciones) || question.opciones.length === 0 ? rawAnswer
                : question.opciones.find(option => normalizeComparisonText(option.value) === normalizeComparisonText(rawAnswer))?.value || rawAnswer;
        case 'selectM': return Array.isArray(rawAnswer) ? rawAnswer : !rawAnswer ? [] : String(rawAnswer).split('|').map(item => item.trim()).filter(Boolean);
        default: return rawAnswer || null;
    }
}

export function initializeQuestion2Answer(question, answer) {
    if (answer !== undefined && answer !== null) return answer;
    if (question.tipoControl2 === 'text') return '';
    return question.tipoControl2 === 'selectM' ? [] : null;
}

export function hydrateDateInputs(question) {
    const parts = String(question?.respuesta || '').trim().split('/').map(item => item.trim());
    return { _dateInputsDayDraft: parts[0] || '', _dateInputsMonthDraft: parts[1] || '', _dateInputsYearDraft: parts[2] || '' };
}

export function hydrateBranchedInputSearch(question) {
    const values = String(question?.respuesta || '').split('|').map(item => item.trim());
    const branches = (question._ramificaciones || []).map((branch, index) => ({
        ...branch,
        value: normalizeBranchedDerivedValue(values[index + 1] || '')
    }));
    return { _branchedTriggerValue: values[0] || '', _ramificaciones: branches, _ramificacionesReadonlyHttp: branches.some(branch => !!String(branch.value || '').trim()) };
}

export function serializeAnswer(question) {
    if (isBranchedInputSearch(question)) {
        const parts = [
            question._branchedTriggerValue || '',
            ...(question._ramificaciones || []).map(branch => normalizeBranchedDerivedValue(branch.value || ''))
        ];
        return parts.some(Boolean) ? parts.join('|') : null;
    }
    if (isBranchedSelects(question)) {
        const parts = (question._branchedSelects || []).map(branch => branch.value).filter(value => value !== null && value !== undefined && value !== '');
        return parts.length ? parts.join('|') : null;
    }
    const type = String(question?.tipoControl || '').toLowerCase();
    if (['textm', 'numberm', 'timerangem'].includes(type)) return Array.isArray(question.respuesta) && question.respuesta.length ? question.respuesta.join('|') : null;
    if (type === 'dateinputs') {
        const day = String(question._dateInputsDayDraft || '').trim();
        const month = String(question._dateInputsMonthDraft || '').trim();
        const year = String(question._dateInputsYearDraft || '').trim();
        return day && month && year ? `${day}/${month}/${year}` : null;
    }
    if (Array.isArray(question.respuesta)) return question.respuesta.includes('OTRO') || question.respuesta.includes('OTROS')
        ? question.respuesta.map(answer => answer === 'OTRO' || answer === 'OTROS' ? question.otroTexto || answer : answer).join('|')
        : question.respuesta.join('|');
    return question.respuesta === 'OTRO' || question.respuesta === 'OTROS' ? question.otroTexto || question.respuesta : question.respuesta ?? null;
}

export function serializeAnswer2(question) {
    return question.respuesta2 === 'OTRO' || question.respuesta2 === 'OTROS'
        ? question.otroTexto2 || question.respuesta2
        : question.respuesta2 ?? null;
}
