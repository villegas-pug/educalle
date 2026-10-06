<template>
    <q-input
        outlined
        dense
        bottom-slots
        type="text"
        inputmode="numeric"
        mask="##/##/####"
        maxlength="10"
        placeholder="DD/MM/AAAA"
        :value="displayValue"
        :input-id="inputId"
        :readonly="readonly"
        :rules="displayRules"
        :error="!!dateError"
        :error-message="dateError"
        @input="updateDate"
        @blur="$emit('blur')"
    >
        <template v-slot:append>
            <q-btn flat round dense icon="event" color="primary" aria-label="Seleccionar fecha" :disable="readonly">
                <q-popup-proxy ref="calendar" transition-show="scale" transition-hide="scale">
                    <q-date
                        :value="calendarValue"
                        mask="YYYY-MM-DD"
                        navigation-max-year-month="9999/12"
                        :readonly="readonly"
                        @input="selectDate"
                    />
                </q-popup-proxy>
            </q-btn>
        </template>
    </q-input>
</template>

<script>
import { formatQuestionDateInput, parseQuestionDateInput, isValidIsoQuestionDate } from 'src/modules/nna/dynamic-engine/question-rules';

export default {
    name: 'FichaDateInput',
    props: {
        value: { type: String, default: '' },
        inputId: { type: String, default: null },
        readonly: { type: Boolean, default: false },
        rules: { type: Array, default: () => [] }
    },
    computed: {
        displayValue() {
            return formatQuestionDateInput(this.value);
        },
        calendarValue() {
            return isValidIsoQuestionDate(this.value) ? this.value : null;
        },
        displayRules() {
            return this.rules.map(rule => value => rule(parseQuestionDateInput(value)));
        },
        dateError() {
            return this.value && !isValidIsoQuestionDate(this.value) ? 'Debe ingresar una fecha válida (DD/MM/AAAA)' : '';
        }
    },
    methods: {
        updateDate(value) {
            if (!this.readonly) this.$emit('input', parseQuestionDateInput(value));
        },
        selectDate(value) {
            if (this.readonly) return;
            this.$emit('input', value || '');
            this.$refs.calendar.hide();
            this.$emit('blur');
        }
    }
};
</script>
