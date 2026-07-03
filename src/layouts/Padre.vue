<template>
    <q-page padding>
        <div class="row">
            <div class="col-4">
                <MainLayout
                    :opcionSeleccionada="opcionSeleccionada"
                    @cambiar-opcion="opcionSeleccionada = $event"
                />
            </div>

            <div class="col-8">
                <GestionCedif :opcionSeleccionada="opcionSeleccionada" />
            </div>
        </div>
    </q-page>
</template>

<script>
import MainLayout from './MainLayout.vue'
import GestionCedif from '../components/GestionCedif.vue'

export default {
    components: { MainLayout, GestionCedif },
    data() {
        return {
            opcionSeleccionada: null
        }
    }
}
</script>
