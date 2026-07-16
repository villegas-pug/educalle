<template>
    <q-dialog :value="value" persistent @input="$emit('input', $event)">
        <q-card class="ficha-http-dialog">
            <q-card-section class="bg-header-dialog ficha-http-dialog__header">
                <div class="ficha-http-dialog__title">
                    <q-icon name="manage_search" size="24px" color="primary" />
                    <div class="text-subtitle1 text-weight-bold text-uppercase">{{ title }}</div>
                </div>
                <q-btn
                    icon="close"
                    flat
                    round
                    dense
                    aria-label="Cerrar búsqueda"
                    class="ficha-http-dialog__close"
                    v-close-popup
                />
            </q-card-section>

            <q-card-section class="ficha-http-dialog__body q-pa-md">
                <div class="row q-col-gutter-md">
                    <div
                        v-for="field in fields"
                        :key="field.paramKey"
                        class="col-12"
                    >
                        <q-input
                            outlined
                            dense
                            class="ficha-http-dialog__field"
                            :type="field.type"
                            :label="field.label"
                            :value="form[field.paramKey]"
                            @input="updateField(field.paramKey, $event)"
                        />
                    </div>
                </div>
            </q-card-section>

            <q-card-actions align="right" class="ficha-http-dialog__actions q-gutter-sm">
                <q-btn flat label="Cancelar" color="grey-7" class="ficha-http-dialog__cancel" v-close-popup />
                <q-btn
                    unelevated
                    color="primary"
                    icon="search"
                    label="Buscar"
                    class="ficha-http-dialog__search"
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
