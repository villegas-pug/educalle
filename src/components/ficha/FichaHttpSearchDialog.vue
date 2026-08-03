<template>
    <q-dialog :value="value" persistent @input="$emit('input', $event)">
        <q-card class="ficha-http-dialog">
            <q-card-section class="bg-header-dialog ficha-http-dialog__header">
                <div class="ficha-http-dialog__title">
                    <q-icon name="manage_search" size="24px" color="primary" />
                    <div class="ficha-http-dialog__title-copy">
                        <div class="ficha-http-dialog__title-text text-weight-bold text-uppercase">
                            {{ title }}
                        </div>
                        <div class="ficha-http-dialog__subtitle">
                            Completa los datos disponibles para realizar la búsqueda.
                        </div>
                    </div>
                </div>
                <q-btn
                    icon="close"
                    flat
                    round
                    size="md"
                    color="grey-8"
                    aria-label="Cerrar búsqueda"
                    class="ficha-http-dialog__close"
                    v-close-popup
                />
            </q-card-section>

            <q-card-section class="ficha-http-dialog__body">
                <div class="row q-col-gutter-md">
                    <div
                        v-for="field in fields"
                        :key="field.paramKey"
                        class="col-12 ficha-http-dialog__field-wrap"
                    >
                        <q-input
                            outlined
                            dense
                            class="ficha-http-dialog__field"
                            :type="field.type"
                            :label="field.label"
                            :value="form[field.paramKey]"
                            @input="updateField(field.paramKey, $event)"
                        >
                            <template v-slot:prepend>
                                <q-icon :name="field.type === 'password' ? 'lock_outline' : 'search'" color="grey-6" />
                            </template>
                        </q-input>
                    </div>
                </div>
            </q-card-section>

            <q-card-actions align="right" class="ficha-http-dialog__actions">
                <q-btn
                    flat
                    no-caps
                    label="Cancelar"
                    color="grey-7"
                    class="ficha-http-dialog__cancel"
                    v-close-popup
                />
                <q-btn
                    unelevated
                    no-caps
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

<style>
.ficha-http-dialog {
    display: flex;
    flex-direction: column;
    width: 520px;
    max-width: calc(100vw - 32px);
    max-height: min(90vh, 680px);
    overflow: hidden;
    border: 1px solid #dbe5ef;
    border-radius: 16px;
    box-shadow: 0 18px 46px rgba(15, 23, 42, 0.24);
}

.ficha-http-dialog__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    min-height: 78px;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(24, 96, 150, 0.12);
}

.ficha-http-dialog__title {
    display: flex;
    align-items: flex-start;
    min-width: 0;
    gap: 12px;
    padding-top: 2px;
    color: #1f2d3d;
}

.ficha-http-dialog__title-copy {
    min-width: 0;
}

.ficha-http-dialog__title-text {
    overflow-wrap: anywhere;
    color: #1f2d3d;
    font-size: 1rem;
    line-height: 1.25;
}

.ficha-http-dialog__subtitle {
    margin-top: 4px;
    color: #60758a;
    font-size: 0.78rem;
    line-height: 1.35;
}

.ficha-http-dialog__close {
    flex: 0 0 auto;
}

.ficha-http-dialog__body {
    flex: 1 1 auto;
    min-height: 0;
    max-height: 60vh;
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto;
    background: #fff;
}

.ficha-http-dialog__field-wrap {
    min-width: 0;
}

.ficha-http-dialog__field {
    width: 100%;
}

.ficha-http-dialog__field .q-field__control {
    min-height: 48px;
    border-radius: 9px;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.ficha-http-dialog__field .q-field__label {
    color: #60758a;
    font-weight: 600;
}

.ficha-http-dialog__field.q-field--focused .q-field__control {
    background: #fbfdff;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12);
}

.ficha-http-dialog__field .q-field__native,
.ficha-http-dialog__field .q-field__input {
    min-width: 0;
}

.ficha-http-dialog__actions {
    flex: 0 0 auto;
    gap: 10px;
    padding: 14px 20px 18px;
    border-top: 1px solid #e8eef4;
    background: #fff;
}

.ficha-http-dialog__cancel,
.ficha-http-dialog__search {
    min-width: 112px;
    min-height: 44px;
    border-radius: 9px;
}

.ficha-http-dialog__search {
    box-shadow: 0 5px 12px rgba(25, 118, 210, 0.2);
}

@media (max-width: 599px) {
    .ficha-http-dialog {
        max-width: calc(100vw - 20px);
        max-height: calc(100vh - 24px);
        border-radius: 14px;
    }

    .ficha-http-dialog__header {
        min-height: 70px;
        padding: 16px;
    }

    .ficha-http-dialog__body {
        max-height: none;
        padding: 16px;
    }

    .ficha-http-dialog__actions {
        align-items: stretch;
        flex-direction: column;
        padding: 12px 16px 16px;
    }

    .ficha-http-dialog__cancel,
    .ficha-http-dialog__search {
        width: 100%;
        margin: 0;
    }
}
</style>
