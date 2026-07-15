<template>
    <div class="q-pa-md">
        <div class="col-12">
            <q-table
                class="tabla-anexos"
                :data="rows"
                :columns="columns"
                row-key="idAnexoCabecera"
                table-header-class="bg-inabif text-bold"
                :rows-per-page-options="[10, 20, 50]"
                :filter="filter"
                :loading="loading"
                dense
                flat
                bordered
            >
                <template v-slot:body-cell-estado="props">
                    <q-td :props="props">
                        <q-chip
                            class="chip-estado"
                            :class="`chip-estado--${String(props.row.estado)}`"
                            :color="estadosMap[props.row.estado]?.color || 'grey'"
                            :text-color="estadosMap[props.row.estado]?.textColor || 'white'"
                            :icon="estadosMap[props.row.estado]?.icon || 'help'"
                            size="sm"
                        >
                            {{ estadosMap[props.row.estado]?.label || 'DESCONOCIDO' }}
                        </q-chip>
                    </q-td>
                </template>

                <template v-slot:body-cell-nombreUnidad="props">
                    <q-td :props="props"><div class="ellipsis" :title="props.row.nombreUnidad">{{ props.row.nombreUnidad }}</div></q-td>
                </template>
                <template v-slot:body-cell-nombreServicio="props">
                    <q-td :props="props"><div class="ellipsis" :title="props.row.nombreServicio">{{ props.row.nombreServicio }}</div></q-td>
                </template>
                <template v-slot:body-cell-nombreCentro="props">
                    <q-td :props="props"><div class="ellipsis" :title="props.row.nombreCentro">{{ props.row.nombreCentro }}</div></q-td>
                </template>
                <template v-slot:body-cell-nombreAnexo="props">
                    <q-td :props="props"><div class="ellipsis" :title="props.row.nombreAnexo">{{ props.row.nombreAnexo }}</div></q-td>
                </template>

                <template v-slot:top-right>
                    <q-input dense outlined debounce="300" :value="filter" placeholder="Buscar..." @input="$emit('update:filter', $event)">
                        <template v-slot:append><q-icon name="search" /></template>
                    </q-input>
                </template>

                <template v-slot:body-cell-acciones="scope">
                    <q-td :props="scope">
                        <q-btn-dropdown v-if="mostrarMenuAcciones" dropdown-icon="settings" class="q-mr-xs acciones" dense>
                            <q-list class="menu-acciones-ficha">
                                <q-item v-if="mostrarAccion('editar')" :clickable="puedeEditar(scope.row)" v-close-popup @click="puedeEditar(scope.row) && $emit('editar', scope.row)" class="menu-accion-item menu-accion-item--editar" :class="{ 'text-grey-6': !puedeEditar(scope.row) }">
                                    <q-item-section avatar><q-avatar icon="edit" :color="puedeEditar(scope.row) ? 'warning' : 'grey'" text-color="white" /></q-item-section>
                                    <q-item-section class="menu-accion-label">Editar Ficha</q-item-section>
                                </q-item>
                                <q-item v-if="mostrarAccion('anular')" clickable v-close-popup @click="$emit('anular', scope.row)" class="menu-accion-item menu-accion-item--anular">
                                    <q-item-section avatar><q-avatar icon="delete" color="negative" text-color="white" /></q-item-section>
                                    <q-item-section class="menu-accion-label">Anular Ficha</q-item-section>
                                </q-item>
                                <q-item v-if="mostrarAccion('ver')" clickable v-close-popup @click="$emit('ver', scope.row)" class="menu-accion-item menu-accion-item--ver">
                                    <q-item-section avatar><q-avatar icon="visibility" color="primary" text-color="white" /></q-item-section>
                                    <q-item-section class="menu-accion-label">Ver Ficha</q-item-section>
                                </q-item>
                                <q-item v-if="mostrarAccion('conformidad')" clickable v-close-popup @click="$emit('conformidad', scope.row)" class="menu-accion-item menu-accion-item--audio">
                                    <q-item-section avatar><q-avatar icon="description" color="secondary" text-color="white" /></q-item-section>
                                    <q-item-section class="menu-accion-label">Agregar conformidad</q-item-section>
                                </q-item>
                                <q-item v-if="mostrarAccion('validar')" v-show="false" :clickable="puedeValidar(scope.row)" v-close-popup @click="puedeValidar(scope.row) && $emit('validar', scope.row)" class="menu-accion-item menu-accion-item--validar" :class="{ 'text-grey-6': !puedeValidar(scope.row) }">
                                    <q-item-section avatar><q-avatar icon="verified" :color="puedeValidar(scope.row) ? 'positive' : 'grey'" text-color="white" /></q-item-section>
                                    <q-item-section class="menu-accion-label">Validar Ficha</q-item-section>
                                </q-item>
                                <slot name="acciones-extra" :row="scope.row" />
                            </q-list>
                        </q-btn-dropdown>
                    </q-td>
                </template>
            </q-table>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FichaTable',
    props: {
        rows: { type: Array, default: () => [] },
        columns: { type: Array, default: () => [] },
        estadosMap: { type: Object, default: () => ({}) },
        filter: { type: String, default: '' },
        loading: { type: Boolean, default: false },
        acciones: { type: Object, default: () => ({}) },
        puedeEditar: { type: Function, required: true },
        puedeValidar: { type: Function, required: true }
    },
    computed: {
        mostrarMenuAcciones() {
            return ['editar', 'anular', 'ver', 'conformidad', 'validar']
                .some(accion => this.mostrarAccion(accion));
        }
    },
    methods: {
        mostrarAccion(accion) {
            return this.acciones[accion] !== false;
        }
    }
};
</script>
