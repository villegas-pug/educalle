<template>
    <div class="usuario-nna">
        <div v-if="pageTitle" class="q-pa-md q-pb-none">
            <div class="text-h6 text-weight-bold text-center">{{ pageTitle }}</div>
        </div>
        <ficha-workflow :page-config="pageConfig" />
    </div>
</template>

<script>
import FichaWorkflow from 'src/components/ficha/FichaWorkflow.vue';
import fichaPageLayout from 'src/mixins/ficha-page-layout.mixin';
import profile from 'src/modules/usuario-nna/usuario-nna.profile';

export default {
    name: 'UsuarioNna',
    components: {
        FichaWorkflow
    },
    mixins: [fichaPageLayout],
    data() {
        return {
            fichaProfile: profile
        };
    }
};
</script>
