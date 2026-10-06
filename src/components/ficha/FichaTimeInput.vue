<template>
    <q-input
        outlined
        dense
        lazy-rules
        type="text"
        inputmode="numeric"
        mask="##:##"
        maxlength="5"
        placeholder="HH:mm"
        :aria-label="label"
        :value="value"
        :readonly="readonly"
        :rules="rules"
        :error="!!timeError"
        :error-message="timeError"
        @input="updateTime"
        @keyup.enter.prevent="$emit('enter')"
    >
        <template v-slot:append>
            <q-btn flat round dense icon="schedule" color="primary" :aria-label="label" :disable="readonly">
                <q-popup-proxy ref="clock" transition-show="scale" transition-hide="scale">
                    <q-time :value="clockValue" mask="HH:mm" format24h :readonly="readonly" @input="selectTime" />
                </q-popup-proxy>
            </q-btn>
        </template>
    </q-input>
</template>

<script>
import { isValidQuestionTime } from 'src/modules/nna/dynamic-engine/question-rules';

export default {
    name: 'FichaTimeInput',
    props: {
        value: { type: String, default: '' },
        label: { type: String, default: 'Seleccionar hora' },
        readonly: { type: Boolean, default: false },
        rules: { type: Array, default: () => [] }
    },
    computed: {
        clockValue() {
            return isValidQuestionTime(this.value) ? this.value : null;
        },
        timeError() {
            return this.value && !isValidQuestionTime(this.value) ? 'Debe ingresar una hora válida (HH:mm)' : '';
        }
    },
    methods: {
        updateTime(value) {
            if (!this.readonly) this.$emit('input', value || '');
        },
        selectTime(value) {
            if (this.readonly) return;
            this.$emit('input', value || '');
            this.$refs.clock.hide();
        }
    }
};
</script>
