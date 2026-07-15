<template>
    <q-dialog :value="value" persistent @input="$emit('input', $event)">
        <q-card class="ficha-http-dialog">
            <q-card-section class="bg-header-dialog ficha-http-dialog__header">
                <div class="text-body2 text-bold">{{ title }}</div>
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section class="ficha-http-dialog__body">
                <div class="row q-col-gutter-md">
                    <div
                        v-for="field in fields"
                        :key="field.paramKey"
                        class="col-12"
                    >
                        <q-input
                            outlined
                            dense
                            :type="field.type"
                            :label="field.label"
                            :value="form[field.paramKey]"
                            @input="updateField(field.paramKey, $event)"
                        />
                    </div>
                </div>
            </q-card-section>

            <q-card-actions align="right" class="ficha-http-dialog__actions">
                <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
                <q-btn
                    unelevated
                    color="primary"
                    icon="search"
                    label="Buscar"
                    :loading="loading"
                    @click="$emit('search')"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'FichaHttpSearchDialog',

    props: {
        value: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
        fields: {
            type: Array,
            default: () => []
        },
        form: {
            type: Object,
            default: () => ({})
        },
        loading: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        updateField(paramKey, value) {
            this.$emit('update:form', {
                ...this.form,
                [paramKey]: value
            });
        }
    }
};
</script>
