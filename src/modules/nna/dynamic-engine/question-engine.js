/* Contract: all exports are pure. Inputs are catalog/API question objects and outputs preserve legacy JSON, pipe, dateInputs and branched formats. Vue reactivity, HTTP and DOM remain adapters. */
import * as normalizer from './question-normalizer';
import * as rules from './question-rules';
import * as serializer from './question-serializer';

export function buildQuestion(rawQuestion) {
    const question = {
        ...rawQuestion,
        obligatoria: Number(rawQuestion.obligatoria ?? 0), obligatoria2: Number(rawQuestion.obligatoria2 ?? 0),
        reqObligatoria1Cierre: Number(rawQuestion.reqObligatoria1Cierre ?? 0), reqObligatoria2Cierre: Number(rawQuestion.reqObligatoria2Cierre ?? 0),
        condicion: rules.parseCondition(rawQuestion.condicion), _editableRule: normalizer.normalizeEditableRule(rawQuestion.editable),
        _editableBifurcacionesRule: normalizer.normalizeEditableBranches(rawQuestion.editableBifurcaciones),
        _httpMethod: String(rawQuestion.httpMetodo || 'GET').toUpperCase(), _httpParamsParsed: normalizer.normalizeHttpParams(rawQuestion.httpParams),
        _redirectRef: rules.getRedirectRef(rawQuestion.opciones), _bloqSubmitSiInvalidoRule: normalizer.normalizeBlockSubmitInvalidRule(rawQuestion.bloqSubmitSiInvalido), _ramificaciones: [], _ramificacionesReadonlyHttp: false, _branchedSelects: [],
        _loadingHttp: false, _httpLoaded: false, _labelHttpField: normalizer.getHttpLabelField(rawQuestion.opciones), opciones: [],
        opciones2: normalizer.parseOptions(rawQuestion.opciones2), respuesta: null, respuesta2: null, otroTexto: null,
        _textMDraft: '', _numberMDraft: '', _timeRangeStartDraft: '', _timeRangeEndDraft: '', _timeRangeAttemptedAdd: false,
        _dateInputsYearDraft: '', _dateInputsMonthDraft: '', _dateInputsDayDraft: ''
    };
    if (rules.isBranchedInputSearch(question)) question._ramificaciones = normalizer.normalizeInputSearchBranches(rawQuestion.opciones);
    if (rules.isBranchedSelects(question)) {
        question._branchedDefs = normalizer.normalizeSelectBranches(rawQuestion.opciones);
        question._branchedSelects = question._branchedDefs.map(definition => ({ label: definition.label, valueField: definition.valueField, value: '', selectedOption: null, options: [], loading: false }));
    }
    if (!rules.isBranchedInputSearch(question) && !rules.isBranchedSelects(question) && !rules.isSimpleHttpSelect(question)) question.opciones = normalizer.parseOptions(rawQuestion.opciones);
    question.respuesta = serializer.normalizeAnswer(question, rawQuestion.respuesta);
    question.respuesta2 = serializer.initializeQuestion2Answer(question, rawQuestion.respuesta2);
    if (String(question.tipoControl || '').toLowerCase() === 'dateinputs') Object.assign(question, serializer.hydrateDateInputs(question));
    if (rules.isBranchedInputSearch(question)) Object.assign(question, serializer.hydrateBranchedInputSearch(question));
    return question;
}

export default { ...normalizer, ...rules, ...serializer, buildQuestion };
