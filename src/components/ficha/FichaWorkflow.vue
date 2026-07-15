<template>
    <ficha-dynamic-editor :page-config="pageConfig" />
</template>

<script>
import FichaDynamicEditor from 'src/components/ficha/FichaDynamicEditor.vue';

export default {
    name: 'FichaWorkflow',
    components: {
        FichaDynamicEditor
    },
    props: {
        pageConfig: {
            type: Object,
            required: true
        }
    }
};
</script>
