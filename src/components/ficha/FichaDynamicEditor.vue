    <template>
    <div class="ficha-page">
            <component
                :is="filtersComponent"
                :anio-seleccionado="anioSeleccionado"
                :anios="anios"
                :centro-nombre="centroNombre"
                :centro-seleccionado="centroSeleccionado"
                :puede-seleccionar-espacio-intervencion="puedeSeleccionarEspacioIntervencion"
                @update:anioSeleccionado="anioSeleccionado = $event"
                @limpiar-centro="limpiarCentro"
                @seleccionar-centro="abrirDialogCentros"
            />

            <component
                :is="primaryActionsComponent"
                :mostrar-resetear="mostrarAccionPrincipal('resetear')"
                :mostrar-nuevo="mostrarAccionPrincipal('nuevo')"
                :mostrar-excel="mostrarAccionPrincipal('excel')"
                :puede-intentar-nuevo="puedeIntentarNuevo"
                @resetear="resetearFiltrosPrincipal"
                @nuevo="abrirDialog"
            />
            <component
                :is="tableComponent"
                :rows="dataTableFiltrada"
                :columns="columnasTablaConfiguradas"
                :estados-map="estadosMap"
                :filter="filtroTabla"
                :loading="loadingTabla"
                :acciones="accionesTablaConfiguradas"
                :puede-editar="puedeEditar"
                :puede-validar="puedeValidarFicha"
                @update:filter="filtroTabla = $event"
                @editar="editarRegistro"
                @anular="eliminarRegistro"
                @ver="verRegistro"
                @conformidad="abrirDialogAudios"
                @validar="abrirDialogValidarFicha"
            />
            <q-dialog v-model="dialog" persistent @hide="resetModo">
                <q-card class="ficha-dialog">
                    <div ref="fichaScrollWrapper" class="ficha-scroll-wrapper">

                        <!-- HEADER -->
                        <q-card-section class="bg-inabif ficha-header">
                        <div class="ficha-titulo">
                            {{ tituloAnexo }}
                        </div>
                        <q-chip
                            v-if="(modoEdicion || esVisualizacion) && codigoNNAFicha"
                            dense
                            square
                            icon="tag"
                            color="primary"
                            text-color="white"
                            :title="`Código NNA: ${codigoNNAFicha}`"
                            class="ficha-codigo-nna"
                        >
                            {{ codigoNNAFicha }}
                        </q-chip>
                        <q-btn class="ficha-cerrar" icon="close" flat dense round v-close-popup />
                    </q-card-section>

                    <!-- BODY -->
                        <q-card-section class="ficha-body">

                        <q-card flat>

                            <q-card-section>
                                <div class="contexto-ficha">
                                    <div class="row q-col-gutter-md">
                                        <div v-for="item in fichaContexto" :key="item.label" class="col-12 col-md-4">
                                            <div class="contexto-ficha__item">
                                                <div class="contexto-ficha__label">{{ item.label }}</div>
                                                <div
                                                    class="contexto-ficha__valor"
                                                    :class="{ 'contexto-ficha__valor--una-linea': item.label === 'EDUCADOR DE CALLE' }"
                                                >
                                                    {{ item.value || '—' }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="loading" class="text-center q-pa-lg">
                                    <q-spinner size="40px" color="primary" />
                                </div>

                                <div v-else>
                                    <q-expansion-item
                                        v-for="(seccion, index) in secciones"
                                        :key="index"
                                        ref="seccionesExpansion"
                                        group="ficha-secciones"
                                        :label="seccion.titulo"
                                        expand-separator
                                        header-class="bg-red-5 text-white q-mt-sm header-seccion seccion-expansion"
                                        expand-icon-class="text-white"
                                    >
                                        <div class="q-pa-md">
                                            <div class="row seccion-cabecera q-mb-sm text-weight-bold text-grey-7">
                                                <div class="col-12 col-sm-5">Pregunta</div>
                                                <div class="col-12 col-sm-7">Respuesta</div>
                                            </div>

                                            <q-separator class="q-mb-md" />

                                            <div
                                                v-for="pregunta in seccion.preguntas"
                                                :key="pregunta.idPregunta"
                                                v-if="esPreguntaVisibleSinEfectos(pregunta)"
                                                :id="getPreguntaContainerId(pregunta)"
                                                class="ficha-pregunta"
                                                :class="{
                                                    'ficha-pregunta--summary': esVistaSummaryRow(pregunta),
                                                    'ficha-pregunta--branched': esVistaBranched(pregunta)
                                                }"
                                            >
                                                <div v-if="pregunta.tipoControl === 'label'" class="col-12 pregunta-label">
                                                    <span class="text-body2 text-weight-bold text-uppercase">
                                                        {{ pregunta.pregunta }}
                                                    </span>
                                                </div>

                                                <template v-else-if="esPreguntaBranchedSelects(pregunta)">
                                                    <div class="ficha-branched-group ficha-branched-group--selects-horizontal">
                                                        <div
                                                            v-for="(rama, ramaIndex) in pregunta._branchedSelects"
                                                            :key="`${pregunta.idPregunta}-rama-select-${ramaIndex}`"
                                                            class="ficha-campo ficha-campo--branched ficha-campo--branched-select"
                                                        >
                                                            <div class="ficha-input ficha-input--branched-select" :class="{ 'modo-visualizacion': esVisualizacion }">
                                                                <q-select
                                                                    outlined
                                                                    dense
                                                                    stack-label
                                                                    emit-value
                                                                    map-options
                                                                    hide-bottom-space
                                                                    :value="getBranchedSelectDisplayValue(rama)"
                                                                    :options="getBranchedSelectDisplayOptions(rama)"
                                                                    :loading="rama.loading"
                                                                    :label="rama.label"
                                                                    :style="getBifurcacionControlStyle(pregunta)"
                                                                    :disable="esControlDeshabilitado(pregunta)"
                                                                    @input="val => onBranchedSelectChange(pregunta, ramaIndex, val)"
                                                                    :rules="pregunta.obligatoria ? [val => !!val || 'Debe seleccionar una opción'] : []"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </template>

                                                <template v-else>
                                                    <div class="ficha-campo" :class="{ 'ficha-campo--summary': esVistaSummaryRow(pregunta) }">
                                                        <div class="ficha-label" :class="{ 'ficha-label--summary': esVistaSummaryRow(pregunta) }">
                                                            <q-icon
                                                                v-if="esVistaSummaryRow(pregunta) && pregunta.iconoControl"
                                                                :name="pregunta.iconoControl"
                                                                class="ficha-summary-icon"
                                                            />
                                                            <span>{{ pregunta.pregunta }}</span>
                                                            <span v-if="pregunta.obligatoria === 1" class="ficha-obligatorio">*</span>
                                                        </div>

                                                        <div class="ficha-input" :class="{ 'modo-visualizacion': esVisualizacion }">
                                                            <template v-if="esPreguntaBranchedInputSearch(pregunta)">
                                                                <template v-if="esVisualizacion">
                                                                    <span class="ficha-valor">{{ obtenerValorDisparadorBranched(pregunta) || '—' }}</span>
                                                                </template>
                                                                <q-input
                                                                    v-else
                                                                    outlined
                                                                    dense
                                                                    :value="obtenerValorDisparadorBranched(pregunta)"
                                                                    :style="getPreguntaControlStyle(pregunta)"
                                                                    :readonly="esCampoSoloLectura(pregunta)"
                                                                    :rules="validarPregunta(pregunta)"
                                                                    @input="val => actualizarValorDisparadorBranched(pregunta, val)"
                                                                >
                                                                    <template v-slot:append>
                                                                        <q-btn
                                                                            flat
                                                                            round
                                                                            dense
                                                                            icon="search"
                                                                            color="primary"
                                                                            :disable="!puedeAbrirBusquedaHttp(pregunta)"
                                                                            @click="abrirModalHttpPregunta(pregunta)"
                                                                        />
                                                                    </template>
                                                                </q-input>
                                                            </template>

                                                            <template v-else-if="pregunta.tipoControl === 'select'">
                                                                <template v-if="esVisualizacion">
                                                                    <span class="ficha-valor">{{ pregunta.respuesta || '—' }}</span>
                                                                </template>
                                                                <q-select
                                                                    v-else
                                                                    outlined
                                                                    dense
                                                                    emit-value
                                                                    map-options
                                                                    :value="pregunta.respuesta"
                                                                    :options="pregunta.opciones"
                                                                    :loading="pregunta._loadingHttp"
                                                                    :style="getPreguntaControlStyle(pregunta)"
                                                                    :disable="esControlDeshabilitado(pregunta)"
                                                                    @input="val => actualizarRespuestaPregunta(pregunta, val)"
                                                                    :rules="pregunta.obligatoria ? [val => !!val || 'Debe seleccionar una opción'] : []"
                                                                >
                                                                    <template v-slot:selected-item="scope">
                                                                        <div class="row items-center no-wrap">
                                                                            <img v-if="getOptionImage(pregunta, scope.opt)" :src="getOptionImage(pregunta, scope.opt)" class="select-option-img q-mr-sm" />
                                                                            <span>{{ scope.opt.label }}</span>
                                                                        </div>
                                                                    </template>
                                                                    <template v-slot:option="scope">
                                                                        <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                                                                            <q-item-section avatar v-if="getOptionImage(pregunta, scope.opt)">
                                                                                <img :src="getOptionImage(pregunta, scope.opt)" class="select-option-img" />
                                                                            </q-item-section>
                                                                            <q-item-section>
                                                                                <q-item-label>{{ scope.opt.label }}</q-item-label>
                                                                            </q-item-section>
                                                                        </q-item>
                                                                    </template>
                                                                </q-select>
                                                            </template>

                                                            <template v-else-if="pregunta.tipoControl === 'selectM'">
                                                                <template v-if="esVisualizacion && pregunta.respuesta && pregunta.respuesta.length">
                                                                    <div class="ficha-tags">
                                                                        <span v-for="item in pregunta.respuesta" :key="item" class="ficha-tag">{{ item }}</span>
                                                                    </div>
                                                                </template>
                                                                <span v-else-if="esVisualizacion" class="ficha-valor">—</span>
                                                                <q-select
                                                                    v-else
                                                                    outlined
                                                                    dense
                                                                    multiple
                                                                    use-chips
                                                                    emit-value
                                                                    map-options
                                                                    :value="pregunta.respuesta"
                                                                    :options="pregunta.opciones"
                                                                    :style="getPreguntaControlStyle(pregunta)"
                                                                    :disable="esControlDeshabilitado(pregunta)"
                                                                    @input="val => actualizarRespuestaPregunta(pregunta, val)"
                                                                >
                                                                    <template v-slot:selected-item="scope">
                                                                        <q-chip removable @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex" class="q-ma-none">
                                                                            <img v-if="getOptionImage(pregunta, scope.opt)" :src="getOptionImage(pregunta, scope.opt)" class="select-option-img q-mr-xs" />
                                                                            {{ scope.opt.label }}
                                                                        </q-chip>
                                                                    </template>
                                                                    <template v-slot:option="scope">
                                                                        <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                                                                            <q-item-section avatar v-if="getOptionImage(pregunta, scope.opt)">
                                                                                <img :src="getOptionImage(pregunta, scope.opt)" class="select-option-img" />
                                                                            </q-item-section>
                                                                            <q-item-section>
                                                                                <q-item-label>{{ scope.opt.label }}</q-item-label>
                                                                            </q-item-section>
                                                                        </q-item>
                                                                    </template>
                                                                </q-select>
                                                            </template>

                                                            <template v-else-if="pregunta.tipoControl === 'radio'">
                                                                <template v-if="esVisualizacion">
                                                                    <span class="ficha-valor">{{ pregunta.respuesta || '—' }}</span>
                                                                </template>
                                                                <q-option-group
                                                                    v-else
                                                                    class="ficha-radio-group"
                                                                    :value="pregunta.respuesta"
                                                                    :options="pregunta.opciones"
                                                                    :style="getPreguntaControlStyle(pregunta)"
                                                                    type="radio"
                                                                    inline
                                                                    :disable="esControlDeshabilitado(pregunta)"
                                                                    @input="val => actualizarRespuestaPregunta(pregunta, val)"
                                                                    :rules="pregunta.obligatoria ? [val => !!val || 'Debe seleccionar una opción'] : []"
                                                                />
                                                            </template>

                                                            <template v-else-if="pregunta.tipoControl === 'textM'">
                                                                <template v-if="esVisualizacion">
                                                                    <div v-if="pregunta.respuesta && pregunta.respuesta.length" class="ficha-tags">
                                                                        <span v-for="item in pregunta.respuesta" :key="item" class="ficha-tag">{{ item }}</span>
                                                                    </div>
                                                                    <span v-else class="ficha-valor">—</span>
                                                                </template>
                                                                <div v-else class="ficha-textm" :style="getPreguntaControlStyle(pregunta)">
                                                                    <div class="ficha-textm__input-row">
                                                                        <q-input
                                                                            outlined
                                                                            dense
                                                                            class="ficha-textm__input"
                                                                            :value="pregunta._textMDraft"
                                                                            :style="getPreguntaControlStyle(pregunta)"
                                                                            :readonly="esCampoSoloLectura(pregunta)"
                                                                            :rules="validarPreguntaTextM(pregunta)"
                                                                            @input="val => actualizarDraftTextM(pregunta, val)"
                                                                            @keyup.enter.prevent="agregarItemTextM(pregunta)"
                                                                        />
                                                                        <q-btn
                                                                            dense
                                                                            round
                                                                            unelevated
                                                                            color="primary"
                                                                            icon="add"
                                                                            :disable="esCampoSoloLectura(pregunta)"
                                                                            @click="agregarItemTextM(pregunta)"
                                                                        />
                                                                    </div>
                                                                    <div v-if="pregunta.respuesta && pregunta.respuesta.length" class="ficha-tags q-mt-sm">
                                                                        <q-chip
                                                                            v-for="(item, itemIndex) in pregunta.respuesta"
                                                                            :key="`${pregunta.idPregunta}-textm-${itemIndex}-${item}`"
                                                                            :removable="!esCampoSoloLectura(pregunta)"
                                                                            color="blue-1"
                                                                            text-color="primary"
                                                                            @remove="eliminarItemTextM(pregunta, itemIndex)"
                                                                        >
                                                                            {{ item }}
                                                                        </q-chip>
                                                                    </div>
                                                                </div>
                                                            </template>

                                                            <template v-else-if="pregunta.tipoControl === 'numberM'">
                                                                <template v-if="esVisualizacion">
                                                                    <div v-if="pregunta.respuesta && pregunta.respuesta.length" class="ficha-tags">
                                                                        <span v-for="item in pregunta.respuesta" :key="item" class="ficha-tag">{{ item }}</span>
                                                                    </div>
                                                                    <span v-else class="ficha-valor">—</span>
                                                                </template>
                                                                <div v-else class="ficha-textm" :style="getPreguntaControlStyle(pregunta)">
                                                                    <div class="ficha-textm__input-row">
                                                                        <q-input
                                                                            outlined
                                                                            dense
                                                                            type="text"
                                                                            inputmode="numeric"
                                                                            class="ficha-textm__input"
                                                                            :value="pregunta._numberMDraft"
                                                                            :style="getPreguntaControlStyle(pregunta)"
                                                                            :readonly="esCampoSoloLectura(pregunta)"
                                                                            :rules="validarPreguntaNumberM(pregunta)"
                                                                            @input="val => actualizarDraftNumberM(pregunta, val)"
                                                                            @keyup.enter.prevent="agregarItemNumberM(pregunta)"
                                                                        />
                                                                        <q-btn
                                                                            dense
                                                                            round
                                                                            unelevated
                                                                            color="primary"
                                                                            icon="add"
                                                                            :disable="esCampoSoloLectura(pregunta)"
                                                                            @click="agregarItemNumberM(pregunta)"
                                                                        />
                                                                    </div>
                                                                    <div v-if="pregunta.respuesta && pregunta.respuesta.length" class="ficha-tags q-mt-sm">
                                                                        <q-chip
                                                                            v-for="(item, itemIndex) in pregunta.respuesta"
                                                                            :key="`${pregunta.idPregunta}-numberm-${itemIndex}-${item}`"
                                                                            :removable="!esCampoSoloLectura(pregunta)"
                                                                            color="blue-1"
                                                                            text-color="primary"
                                                                            @remove="eliminarItemNumberM(pregunta, itemIndex)"
                                                                        >
                                                                            {{ item }}
                                                                        </q-chip>
                                                                    </div>
                                                                </div>
                                                            </template>

                                                            <template v-else-if="pregunta.tipoControl === 'timeRangeM'">
                                                                <template v-if="esVisualizacion">
                                                                    <div v-if="pregunta.respuesta && pregunta.respuesta.length" class="ficha-tags">
                                                                        <span v-for="item in pregunta.respuesta" :key="item" class="ficha-tag">{{ item }}</span>
                                                                    </div>
                                                                    <span v-else class="ficha-valor">—</span>
                                                                </template>
                                                                <div v-else class="ficha-textm">
                                                                    <div class="ficha-textm__input-row">
                                                                        <q-input
                                                                            outlined
                                                                            dense
                                                                            lazy-rules
                                                                            class="ficha-textm__input"
                                                                            type="time"
                                                                            :value="pregunta._timeRangeStartDraft"
                                                                            :style="getPreguntaControlStyle(pregunta)"
                                                                            :readonly="esCampoSoloLectura(pregunta)"
                                                                            :rules="validarPreguntaTimeRangeM(pregunta)"
                                                                            @input="val => actualizarTimeRangeDraft(pregunta, 'start', val)"
                                                                            @keyup.enter.prevent="agregarItemTimeRangeM(pregunta)"
                                                                        />
                                                                        <q-input
                                                                            outlined
                                                                            dense
                                                                            lazy-rules
                                                                            class="ficha-textm__input"
                                                                            type="time"
                                                                            :value="pregunta._timeRangeEndDraft"
                                                                            :style="getPreguntaControlStyle(pregunta)"
                                                                            :readonly="esCampoSoloLectura(pregunta)"
                                                                            :rules="validarPreguntaTimeRangeM(pregunta)"
                                                                            @input="val => actualizarTimeRangeDraft(pregunta, 'end', val)"
                                                                            @keyup.enter.prevent="agregarItemTimeRangeM(pregunta)"
                                                                        />
                                                                        <q-btn
                                                                            dense
                                                                            round
                                                                            unelevated
                                                                            color="primary"
                                                                            icon="add"
                                                                            :disable="esCampoSoloLectura(pregunta)"
                                                                            @click="agregarItemTimeRangeM(pregunta)"
                                                                        />
                                                                    </div>
                                                                    <div v-if="pregunta.respuesta && pregunta.respuesta.length" class="ficha-tags q-mt-sm">
                                                                        <q-chip
                                                                            v-for="(item, itemIndex) in pregunta.respuesta"
                                                                            :key="`${pregunta.idPregunta}-timerangem-${itemIndex}-${item}`"
                                                                            :removable="!esCampoSoloLectura(pregunta)"
                                                                            color="blue-1"
                                                                            text-color="primary"
                                                                            @remove="eliminarItemTimeRangeM(pregunta, itemIndex)"
                                                                        >
                                                                            {{ item }}
                                                                        </q-chip>
                                                                    </div>
                                                                </div>
                                                            </template>

                                                            <template v-else-if="pregunta.tipoControl === 'dateInputs'">
                                                                <template v-if="esVisualizacion">
                                                                    <span class="ficha-valor">{{ obtenerValorTextoPregunta(pregunta) || '—' }}</span>
                                                                </template>
                                                                <div v-else class="ficha-date-inputs">
                                                                    <q-input
                                                                        outlined
                                                                        dense
                                                                        type="text"
                                                                        inputmode="numeric"
                                                                        maxlength="4"
                                                                        class="ficha-date-inputs__field"
                                                                        label="Año(s)"
                                                                        :value="pregunta._dateInputsYearDraft"
                                                                        :style="getPreguntaControlStyle(pregunta)"
                                                                        @keydown="manejarKeydownDateInputs"
                                                                        @paste="manejarPasteDateInputs"
                                                                        @drop.prevent
                                                                        @input="val => actualizarDateInputsPart(pregunta, 'year', val)"
                                                                    />
                                                                    <q-input
                                                                        outlined
                                                                        dense
                                                                        type="text"
                                                                        inputmode="numeric"
                                                                        maxlength="2"
                                                                        class="ficha-date-inputs__field"
                                                                        label="Mes(es)"
                                                                        :value="pregunta._dateInputsMonthDraft"
                                                                        :style="getPreguntaControlStyle(pregunta)"
                                                                        @keydown="manejarKeydownDateInputs"
                                                                        @paste="manejarPasteDateInputs"
                                                                        @drop.prevent
                                                                        @input="val => actualizarDateInputsPart(pregunta, 'month', val)"
                                                                    />
                                                                    <q-input
                                                                        outlined
                                                                        dense
                                                                        type="text"
                                                                        inputmode="numeric"
                                                                        maxlength="2"
                                                                        class="ficha-date-inputs__field"
                                                                        label="Día(as)"
                                                                        :value="pregunta._dateInputsDayDraft"
                                                                        :style="getPreguntaControlStyle(pregunta)"
                                                                        @keydown="manejarKeydownDateInputs"
                                                                        @paste="manejarPasteDateInputs"
                                                                        @drop.prevent
                                                                        @input="val => actualizarDateInputsPart(pregunta, 'day', val)"
                                                                    />
                                                                </div>
                                                            </template>

                                                            <template v-else-if="esPreguntaAge(pregunta)">
                                                                <template v-if="esVisualizacion">
                                                                    <span class="ficha-valor">{{ obtenerTextoEdadPregunta(pregunta) || '—' }}</span>
                                                                </template>
                                                                <q-input
                                                                    v-else
                                                                    outlined
                                                                    dense
                                                                    readonly
                                                                    :value="obtenerTextoEdadPregunta(pregunta)"
                                                                    :style="getPreguntaControlStyle(pregunta)"
                                                                    :error="!!obtenerMensajeErrorEdadPregunta(pregunta)"
                                                                    :error-message="obtenerMensajeErrorEdadPregunta(pregunta)"
                                                                />
                                                                <div v-if="esVisualizacion && obtenerMensajeErrorEdadPregunta(pregunta)" class="text-negative text-caption q-mt-xs">
                                                                    {{ obtenerMensajeErrorEdadPregunta(pregunta) }}
                                                                </div>
                                                            </template>

                                                            <template v-else>
                                                                <template v-if="esVisualizacion">
                                                                    <span class="ficha-valor">{{ esPreguntaFecha(pregunta) ? formatearFechaIso(pregunta.respuesta) || '—' : obtenerValorTextoPregunta(pregunta) || '—' }}</span>
                                                                </template>
                                                                <q-input
                                                                    v-else
                                                                    outlined
                                                                    dense
                                                                    bottom-slots
                                                                    :value="obtenerValorTextoPregunta(pregunta)"
                                                                    :type="obtenerTipoInputPregunta(pregunta)"
                                                                    :input-id="esPreguntaFecha(pregunta) ? getPreguntaInputId(pregunta) : null"
                                                                    :style="getPreguntaControlStyle(pregunta)"
                                                                    :maxlength="getPreguntaMaxLength(pregunta)"
                                                                    :min="usaTipoNumero(pregunta) ? 0 : null"
                                                                    :autogrow="usaAutogrowPregunta(pregunta)"
                                                                    :readonly="esCampoSoloLectura(pregunta)"
                                                                    :rules="validarPregunta(pregunta)"
                                                                    :error="tieneErrorLongitudPregunta(pregunta)"
                                                                    :error-message="getMensajeErrorLongitudPregunta(pregunta)"
                                                                    input-style="resize: none; overflow-wrap: anywhere; word-break: break-word;"
                                                                    @keydown="event => manejarKeydownRespuestaTextoPregunta(pregunta, event)"
                                                                    @paste="event => manejarPasteRespuestaTextoPregunta(pregunta, event)"
                                                                    @input="val => actualizarRespuestaTextoPregunta(pregunta, val)"
                                                                    @blur="onPreguntaDateBlur(pregunta)"
                                                                >
                                                                    <template v-if="debeMostrarContadorPregunta(pregunta) && !usaAutogrowPregunta(pregunta)" v-slot:append>
                                                                        <span class="ficha-input-counter">{{ getContadorTextoPregunta(pregunta) }}</span>
                                                                    </template>
                                                                </q-input>
                                                                <div v-if="debeMostrarContadorPregunta(pregunta) && usaAutogrowPregunta(pregunta)" class="ficha-input-meta-row">
                                                                    <span v-if="debeMostrarContadorPregunta(pregunta) && usaAutogrowPregunta(pregunta)" class="ficha-input-counter">{{ getContadorTextoPregunta(pregunta) }}</span>
                                                                </div>
                                                            </template>
                                                        </div>
                                                    </div>

                                                    <div v-if="esPreguntaBranchedInputSearch(pregunta)" class="ficha-branched-group">
                                                        <div
                                                            v-for="(rama, ramaIndex) in pregunta._ramificaciones"
                                                            :key="`${pregunta.idPregunta}-rama-${ramaIndex}`"
                                                            class="ficha-campo ficha-campo--branched"
                                                        >
                                                            <div class="ficha-label">
                                                                {{ rama.label }}
                                                            </div>
                                                            <div class="ficha-input" :class="{ 'modo-visualizacion': esVisualizacion }">
                                                                <template v-if="esVisualizacion">
                                                                    <span class="ficha-valor">{{ rama.value || '—' }}</span>
                                                                </template>
                                                                <q-input
                                                                    v-else
                                                                    outlined
                                                                    dense
                                                                    type="text"
                                                                    :value="rama.value"
                                                                    :style="getBifurcacionControlStyle(pregunta)"
                                                                    :readonly="!esRamificacionEditable(pregunta, rama)"
                                                                    @input="val => actualizarRamificacionTexto(pregunta, ramaIndex, val)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </template>

                                                <template v-if="esPregunta2VisibleSinEfectos(pregunta)">
                                                    <div class="ficha-campo ficha-pregunta2">
                                                        <div class="ficha-label">
                                                            {{ pregunta.pregunta2 }}
                                                            <span v-if="pregunta.obligatoria2 === 1" class="ficha-obligatorio">*</span>
                                                        </div>
                                                        <div class="ficha-input" :class="{ 'modo-visualizacion': esVisualizacion }">
                                                            <template v-if="esVisualizacion">
                                                                <span class="ficha-valor">{{ pregunta.respuesta2 || '—' }}</span>
                                                            </template>
                                                            <template v-else>
                                                                <q-input
                                                                    v-if="pregunta.tipoControl2 === 'text'"
                                                                    outlined
                                                                    dense
                                                                    :value="pregunta.respuesta2"
                                                                    :style="getPregunta2ControlStyle(pregunta)"
                                                                    @input="val => $set(pregunta, 'respuesta2', pregunta.tipoDato2 === 'NUMBER' ? normalizarNumeroNoNegativo(val) : val)"
                                                                    :type="pregunta.tipoDato2 === 'NUMBER' ? 'number' : 'textarea'"
                                                                    :min="pregunta.tipoDato2 === 'NUMBER' ? 0 : null"
                                                                    :autogrow="pregunta.tipoDato2 !== 'NUMBER'"
                                                                    input-style="resize: none; overflow-wrap: anywhere; word-break: break-word;"
                                                                    :rules="validarPregunta2(pregunta)"
                                                                />

                                                                <q-select
                                                                    v-if="pregunta.tipoControl2 === 'select'"
                                                                    outlined
                                                                    dense
                                                                    emit-value
                                                                    map-options
                                                                    :value="pregunta.respuesta2"
                                                                    :options="pregunta.opciones2"
                                                                    :style="getPregunta2ControlStyle(pregunta)"
                                                                    @input="val => $set(pregunta, 'respuesta2', val)"
                                                                />
                                                            </template>
                                                        </div>
                                                    </div>
                                                </template>
                                            </div>
                                        </div>
                                    </q-expansion-item>

                                    <div v-if="mostrarTotales" class="totales-container">
                                        <div class="totales-header">
                                            <div class="text-weight-bold">RESUMEN DE EVALUACIÓN</div>
                                        </div>
                                        <div class="totales-row conforme">
                                            <div class="text-bold">CONFORME</div>
                                            <div class="text-right">{{ totalesRespuestas.CONFORME }}</div>
                                        </div>
                                        <div class="totales-row no-conforme">
                                            <div class="text-bold">NO CONFORME</div>
                                            <div class="text-right">{{ totalesRespuestas.NO_CONFORME }}</div>
                                        </div>
                                        <div class="totales-row observacion">
                                            <div class="text-bold">OBSERVACIÓN</div>
                                            <div class="text-right">{{ totalesRespuestas.OBSERVACION }}</div>
                                        </div>
                                        <div class="totales-row no-aplica">
                                            <div class="text-bold">NO APLICA</div>
                                            <div class="text-right">{{ totalesRespuestas.NO_APLICA }}</div>
                                        </div>
                                    </div>
                                </div>
                            </q-card-section>

                            <q-card-section v-if="mostrarConformidadSoloLectura" class="q-pt-none">
                                <q-card flat bordered class="conformidad-solo-lectura">
                                    <q-card-section class="conformidad-solo-lectura__header">
                                        <q-icon name="verified_user" size="22px" class="conformidad-solo-lectura__icon" />
                                        <div>
                                            <div class="text-subtitle2 text-weight-bold">CONFORMIDAD</div>
                                            <div class="text-caption">Documento registrado · Solo lectura</div>
                                        </div>
                                    </q-card-section>

                                    <q-table
                                        class="conformidad-solo-lectura__table"
                                        :data="audiosList"
                                        :columns="columnasAudiosSoloLectura"
                                        row-key="idAudio"
                                        table-header-class="bg-inabif text-bold"
                                        dense
                                        flat
                                        :loading="loadingAudios"
                                        :rows-per-page-options="[10, 20, 50]"
                                    >
                                        <template v-slot:body-cell-nro="props">
                                            <q-td :props="props">{{ props.rowIndex + 1 }}</q-td>
                                        </template>
                                        <template v-slot:body-cell-nombreArchivo="props">
                                            <q-td :props="props">
                                                <div class="u-ellipsis" :title="props.row.nombreArchivo">{{ props.row.nombreArchivo }}</div>
                                                <q-tooltip>{{ props.row.nombreArchivo }}</q-tooltip>
                                            </q-td>
                                        </template>
                                        <template v-slot:body-cell-acciones="props">
                                            <q-td :props="props">
                                                <q-btn label="Ver PDF" icon="picture_as_pdf" color="info" outline size="sm" no-caps @click="verPdfConformidad(props.row)" />
                                            </q-td>
                                        </template>
                                        <template v-slot:no-data>
                                            <div class="full-width column flex-center q-pa-lg text-grey-7">
                                                <q-icon name="description" size="32px" class="q-mb-sm" />
                                                <div>No hay conformidad registrada</div>
                                            </div>
                                        </template>
                                    </q-table>
                                </q-card>
                            </q-card-section>

                        </q-card>
                        <!--  -->

                        <div v-if="!modoEdicion && form.audioUrl" class="q-pa-md">
                            <div class="col-6 text-body2 q-mt-sm text-weight-bold text-uppercase">Audio </div>
                            <audio controls style="width:100%">
                                <source :src="getAudioUrl(form.audioUrl)" type="audio/mpeg">

                            </audio>
                        </div>
                    </q-card-section>

                    <!-- FOOTER -->
                        <q-card-actions
                            ref="fichaFooter"
                            class="ficha-footer"
                            align="center"
                            :style="fichaFooterFloatingStyle"
                        >

                            <q-btn
                                class="ficha-footer-drag"
                                icon="open_with"
                                round
                                dense
                                flat
                                aria-label="Mover acciones"
                                title="Mover acciones"
                                @mousedown.prevent="iniciarArrastreFooterFicha"
                                @touchstart.prevent="iniciarArrastreFooterFicha"
                            />
                            <q-btn v-if="!esVisualizacion" label="Guardar" icon="save" type="submit" @click="guardarTodo" title="Guardar" class="ficha-btn-guardar" />
                            <q-btn
                                v-if="modoEdicion"
                                label="Cerrar ficha"
                                icon="fact_check"
                                @click="iniciarCierreFicha"
                                :loading="cerrandoFicha"
                                class="ficha-btn-cerrar"
                                title="Cerrar ficha"
                            />
                            <q-btn label="Cancelar" icon="close" v-close-popup class="ficha-btn-cancelar" style="min-width: 70px;" title="Cancelar" />
                        </q-card-actions>
                    </div>
                </q-card>
            </q-dialog>
            <q-dialog v-model="dialogErroresInline" persistent>
                <q-card class="cierre-dialog">
                    <q-card-section class="cierre-dialog__header bg-header-dialog">
                        <div class="cierre-dialog__title-block">
                            <div class="cierre-dialog__title text-body2 text-bold">VALIDACIONES PENDIENTES</div>
                            <div class="cierre-dialog__subtitle text-caption">
                                Corrige los campos inválidos antes de guardar la ficha.
                            </div>
                        </div>
                    </q-card-section>

                    <q-card-section class="cierre-dialog__body">
                        <q-list separator>
                            <q-item v-for="(error, index) in erroresInline" :key="`${error.seccionIndex}-${error.idPregunta}-${error.campo}-${index}`">
                                <q-item-section avatar>
                                    <q-icon name="warning" color="warning" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="text-weight-bold">{{ error.seccion }}</q-item-label>
                                    <q-item-label>{{ error.pregunta }}</q-item-label>
                                    <q-item-label caption>{{ error.mensaje }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-card-section>

                    <q-card-actions align="right" class="cierre-dialog__actions">
                        <q-btn label="Cerrar" flat @click="dialogErroresInline = false" />
                        <q-btn label="Corregir" icon="edit" class="btn-inabif cierre-dialog__btn" @click="corregirPrimerErrorInline" />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <q-dialog v-model="dialogPendientesGuardado" persistent @hide="limpiarPendientesGuardado">
                <q-card class="cierre-dialog">
                    <q-card-section class="cierre-dialog__header bg-header-dialog">
                        <div class="cierre-dialog__title-block">
                            <div class="cierre-dialog__title text-body2 text-bold">PREGUNTAS PENDIENTES</div>
                            <div class="cierre-dialog__subtitle text-caption">
                                Aún existen preguntas sin completar. Puede volver al formulario o guardar la información para continuar después.
                            </div>
                        </div>
                        <q-btn
                            icon="close"
                            class="cierre-dialog__close"
                            flat
                            round
                            dense
                            size="sm"
                            @click="dialogPendientesGuardado = false"
                        />
                    </q-card-section>

                    <q-card-section class="cierre-dialog__body">
                        <div
                            v-for="(grupo, index) in pendientesGuardadoAgrupados"
                            :key="`${grupo.seccion}-${index}`"
                            class="cierre-pendiente-seccion"
                        >
                            <div class="cierre-pendiente-seccion__titulo">{{ grupo.seccion }}</div>
                            <div
                                v-for="(item, itemIndex) in grupo.items"
                                :key="`${grupo.seccion}-${itemIndex}-${item.pregunta}`"
                                class="cierre-pendiente-item"
                                :class="{ 'cierre-pendiente-item--subpregunta': item.tipo === 'subpregunta' }"
                            >
                                <q-icon
                                    :name="item.tipo === 'subpregunta' ? 'subdirectory_arrow_right' : 'help_outline'"
                                    class="cierre-pendiente-item__icon"
                                />
                                <div class="cierre-pendiente-item__content">
                                    <div v-if="item.tipo === 'subpregunta'" class="cierre-pendiente-item__parent">
                                        Subpregunta de: {{ item.preguntaPadre }}
                                    </div>
                                    <div class="cierre-pendiente-item__label">{{ item.pregunta }}</div>
                                </div>
                            </div>
                        </div>
                    </q-card-section>

                    <q-card-actions align="right" class="cierre-dialog__actions cierre-dialog__actions--guardado">
                        <q-btn
                            label="Volver a completar"
                            icon="edit"
                            class="ficha-btn-cancelar cierre-dialog__btn"
                            @click="dialogPendientesGuardado = false"
                        />
                        <q-btn
                            label="Guardar de todos modos"
                            icon="save"
                            class="btn-inabif cierre-dialog__btn"
                            :loading="guardandoConPendientes"
                            :disable="guardandoConPendientes"
                            @click="confirmarGuardadoConPendientes"
                        />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <q-dialog v-model="dialogPendientesCierre" persistent>
                <q-card class="cierre-dialog">
                    <q-card-section class="cierre-dialog__header bg-header-dialog">
                        <div class="cierre-dialog__title-block">
                            <div class="cierre-dialog__title text-body2 text-bold">NO SE PUEDE CERRAR LA FICHA</div>
                            <div class="cierre-dialog__subtitle text-caption">
                                Completa las preguntas obligatorias para cierre antes de suscribir la ficha.
                            </div>
                        </div>
                        <q-btn icon="close" class="cierre-dialog__close" v-close-popup flat round dense size="sm"></q-btn>
                    </q-card-section>

                    <q-card-section class="cierre-dialog__body">
                        <div
                            v-for="(grupo, index) in pendientesCierreAgrupados"
                            :key="`${grupo.seccion}-${index}`"
                            class="cierre-pendiente-seccion"
                        >
                            <div class="cierre-pendiente-seccion__titulo">{{ grupo.seccion }}</div>
                            <div
                                v-for="(item, itemIndex) in grupo.items"
                                :key="`${grupo.seccion}-${itemIndex}-${item.pregunta}`"
                                class="cierre-pendiente-item"
                                :class="{ 'cierre-pendiente-item--subpregunta': item.tipo === 'subpregunta' }"
                            >
                                <q-icon
                                    :name="item.tipo === 'subpregunta' ? 'subdirectory_arrow_right' : 'help_outline'"
                                    class="cierre-pendiente-item__icon"
                                />
                                <div class="cierre-pendiente-item__content">
                                    <div v-if="item.tipo === 'subpregunta'" class="cierre-pendiente-item__parent">
                                        Subpregunta de: {{ item.preguntaPadre }}
                                    </div>
                                    <div class="cierre-pendiente-item__label">{{ item.pregunta }}</div>
                                </div>
                            </div>
                        </div>
                    </q-card-section>

                    <q-card-actions align="right" class="cierre-dialog__actions">
                        <q-btn label="Entendido" icon="check" class="btn-inabif cierre-dialog__btn" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <q-dialog v-model="dialogConfirmarCierreFicha" persistent>
                <q-card class="cierre-dialog cierre-dialog--confirmacion">
                    <q-card-section class="cierre-dialog__header bg-header-dialog">
                        <div class="cierre-dialog__title-block">
                            <div class="cierre-dialog__title text-body2 text-bold">CONFIRMAR CIERRE DE FICHA</div>
                            <div class="cierre-dialog__subtitle text-caption">
                                Se guardarán los cambios actuales y luego la ficha quedará suscrita.
                            </div>
                        </div>
                        <q-btn icon="close" class="cierre-dialog__close" v-close-popup flat round dense size="sm"></q-btn>
                    </q-card-section>

                    <q-card-section class="cierre-dialog__body cierre-dialog__body--confirmacion">
                        <div class="cierre-confirmacion-card">
                            <q-icon name="fact_check" class="cierre-confirmacion-card__icon" />
                            <div class="cierre-confirmacion-card__content">
                                <div class="cierre-confirmacion-card__title">Ficha lista para cierre</div>
                                <div class="cierre-confirmacion-card__text">
                                    {{ tituloAnexo }}
                                </div>
                                <div class="cierre-confirmacion-card__meta">
                                    Correlativo: {{ String(form.correlativo || 0).padStart(5, '0') }}
                                </div>
                            </div>
                        </div>
                    </q-card-section>

                    <q-card-actions align="right" class="cierre-dialog__actions">
                        <q-btn label="No, volver" icon="close" class="ficha-btn-cancelar cierre-dialog__btn" v-close-popup />
                        <q-btn
                            label="Si, cerrar ficha"
                            icon="done_all"
                            class="btn-inabif cierre-dialog__btn"
                            :loading="cerrandoFicha"
                            @click="confirmarCierreFicha"
                        />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <ficha-http-search-dialog
                :value="dialogHttpPregunta"
                :title="tituloModalHttpPregunta"
                :fields="camposModalHttpPregunta"
                :form="formHttpPregunta"
                :loading="loadingHttpPregunta"
                @input="dialogHttpPregunta = $event"
                @update:form="actualizarFormHttpPregunta"
                @search="ejecutarBusquedaPreguntaHttp"
            />
            <ficha-center-selector-dialog
                :value="dialogCentros"
                :centros="centros"
                :columns="columnasCentros"
                :loading="loadingCentros"
                @input="dialogCentros = $event"
                @select="seleccionarCentro"
            />

            <!-- DIALOGO SUPERVISADOS -->
            <q-dialog v-model="dialogSupervisados" persistent>
                <q-card style="width: 700px; max-width: 90vw">
                    <q-card-section class="bg-header-dialog">
                        <span style="float: right;">
                            <q-btn icon="close" v-close-popup flat round size="sm"></q-btn>
                        </span>
                        <div class="text-body2 text-bold">SELECCIONAR SUPERVISADOS</div>
                    </q-card-section>

                    <q-card-section>
                        <q-input dense outlined debounce="300" v-model="filtroSupervisados"
                            placeholder="Buscar por nombre..." clearable class="q-mb-md">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                        </q-input>

                        <q-table :data="trabajadoresCentro" :columns="columnasSupervisados"
                            row-key="idPersonal" table-header-class="bg-inabif text-bold" dense flat bordered
                            :filter="filtroSupervisados" selection="multiple"
                            :selected.sync="selectedSupervisados"
                            :rows-per-page-options="[10, 20, 50]">
                            <template v-slot:body-cell-nro="props">
                                <q-td :props="props">
                                    {{ props.rowIndex + 1 }}
                                </q-td>
                            </template>
                        </q-table>
                    </q-card-section>

                    <q-card-actions align="right" class="q-pa-md">
                        <q-btn label="Cancelar" v-close-popup flat />
                        <q-btn label="Confirmar" color="primary" @click="confirmarSupervisados" />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <!-- DIALOGO VALIDAR FICHA -->
            <q-dialog v-model="dialogValidarFicha" persistent @hide="resetValidacion">
                <q-card class="validar-dialog">
                    <q-card-section class="validar-dialog__header bg-header-dialog">
                        <div class="validar-dialog__title-block">
                            <div class="validar-dialog__title text-body2 text-bold">VALIDAR FICHA</div>
                            <div class="validar-dialog__subtitle text-caption" v-if="fichaAValidar">
                                {{ fichaAValidar.codigoAnexo2 }} - Correlativo: {{ fichaAValidar.correlativo }}
                            </div>
                        </div>
                        <q-btn icon="close" class="validar-dialog__close" v-close-popup flat round dense size="sm"></q-btn>
                    </q-card-section>

                    <q-card-section class="validar-dialog__body">
                        <div v-if="loadingCargarPersonal" class="validar-loading text-center q-pa-lg">
                            <q-spinner size="40px" color="primary" />
                            <div class="q-mt-sm text-grey">Cargando personal...</div>
                        </div>
                        <q-table 
                            v-else
                            :data="personalValidacion" 
                            :columns="columnasValidacion"
                            row-key="idPersonal" 
                            table-header-class="bg-inabif text-bold" 
                            dense flat bordered
                            class="tabla-validar-ficha validar-table"
                            :rows-per-page-options="[0]"
                            hide-bottom>
                            
                            <template v-slot:body-cell-nro="props">
                                <q-td :props="props">
                                    {{ props.rowIndex + 1 }}
                                </q-td>
                            </template>

                            <template v-slot:body-cell-validar="props">
                                <q-td :props="props">
                                    <div v-if="esFichaSuscrita(fichaAValidar)" class="row justify-center items-center">
                                        <q-icon name="verified" color="info" class="validar-status-icon">
                                            <q-tooltip>Ficha validada</q-tooltip>
                                        </q-icon>
                                    </div>
                                    <!-- Ya validado -->
                                    <div v-else-if="props.row.validado" class="row justify-center items-center">
                                        <q-icon name="verified_user" color="positive" class="validar-status-icon">
                                            <q-tooltip>Validado</q-tooltip>
                                        </q-icon>
                                    </div>
                                    <!-- Mostrar input -->
                                    <div v-else-if="!esFichaSuscrita(fichaAValidar) && mostrarInputValidar[props.row.idPersonal]" class="validar-input-row row q-gutter-xs items-center justify-center">
                                        <q-input 
                                            v-model="props.row.contrasena" 
                                            :type="mostrarContrasenaValidar[props.row.idPersonal] ? 'text' : 'password'"
                                            outlined dense 
                                            placeholder="Ingrese contraseña"
                                            class="input-validar"
                                            :disable="props.row.validando"
                                            @keyup.enter="validarPersonal(props.row)">
                                            <template v-slot:append>
                                                <q-btn
                                                    round dense flat
                                                    :icon="mostrarContrasenaValidar[props.row.idPersonal] ? 'visibility_off' : 'visibility'"
                                                    color="info"
                                                    class="btn-validar-inline"
                                                    :disable="props.row.validando"
                                                    @click="$set(mostrarContrasenaValidar, props.row.idPersonal, !mostrarContrasenaValidar[props.row.idPersonal])">
                                                    <q-tooltip>
                                                        {{ mostrarContrasenaValidar[props.row.idPersonal] ? 'Ocultar contraseña' : 'Mostrar contraseña' }}
                                                    </q-tooltip>
                                                </q-btn>
                                                <q-btn 
                                                    round dense flat
                                                    icon="check"
                                                    color="positive"
                                                    class="btn-validar-inline"
                                                    :loading="props.row.validando"
                                                    :disable="!props.row.contrasena"
                                                    @click="validarPersonal(props.row)" />
                                            </template>
                                        </q-input>
                                        <q-btn 
                                            round dense flat
                                            icon="close"
                                            color="grey"
                                            class="btn-validar-inline"
                                            size="sm"
                                            @click="ocultarInputValidar(props.row.idPersonal)" />
                                    </div>
                                    <!-- Botón para mostrar input -->
                                    <div v-else class="row justify-center items-center">
                                        <q-btn 
                                            round
                                            color="inabif"
                                            text-color="white"
                                            icon="verified_user"
                                            class="btn-validar-icon"
                                            size="sm"
                                            @click="$set(mostrarInputValidar, props.row.idPersonal, true)">
                                            <q-tooltip>Validar personal</q-tooltip>
                                        </q-btn>
                                    </div>
                                </q-td>
                            </template>

                            <template v-slot:no-data>
                                <div class="full-width row flex-center q-pa-md text-grey">
                                    No se encontró personal para validar
                                </div>
                            </template>
                        </q-table>
                    </q-card-section>

                    <q-card-actions align="right" class="validar-dialog__actions">
                        <q-btn label="Cerrar" icon="close" size="sm" class="ficha-btn-cancelar validar-btn" v-close-popup />
                        <q-btn 
                            label="Dar Conformidad" 
                            icon="fact_check"
                            size="sm"
                            class="btn-inabif validar-btn"
                            :loading="validandoConformidad"
                            :disable="!todosValidados || esFichaSuscrita(fichaAValidar)"
                            @click="darConformidad" />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <!-- DIALOGO GESTION DE COMPROMISO -->
            <q-dialog v-model="dialogAudios" persistent @hide="limpiarAudioDialog">
                <q-card class="audio-dialog">
                    <q-card-section class="audio-dialog__header bg-header-dialog">
                        <div class="audio-dialog__title-block">
                            <div class="audio-dialog__title text-body2 text-bold">GESTIÓN DE COMPROMISO</div>
                            <div class="audio-dialog__subtitle text-caption" v-if="audioRow">
                                {{ audioRow.codigoAnexo2 }} - Correlativo: {{ audioRow.correlativo }}
                            </div>
                        </div>
                        <q-btn
                            icon="close"
                            class="audio-dialog__close"
                            v-close-popup
                            flat
                            round
                            dense
                            size="sm"
                        />
                    </q-card-section>

                    <q-card-section class="audio-dialog__body">
                        <!-- Zona de carga de conformidad -->
                        <div class="audio-upload-row row q-col-gutter-sm items-center q-mb-md">
                            <div class="col-12 col-sm">
                                <q-file
                                    ref="audioFileInput"
                                    v-model="audioFile"
                                    label="Seleccionar conformidad firmada"
                                    class="audio-file-field"
                                    outlined
                                    dense
                                    clearable
                                    accept=".pdf,application/pdf"
                                    :disable="loadingAudios || tieneConformidadRegistrada"
                                >
                                    <template v-slot:prepend>
                                        <q-icon name="attach_file" class="audio-field-icon" />
                                    </template>
                                </q-file>
                            </div>
                            <div class="col-12 col-sm-auto">
                                <q-input
                                    v-model="fechaInscripcion"
                                    outlined
                                    dense
                                    type="date"
                                    label="Fecha de ingreso"
                                    class="audio-file-field"
                                    :disable="loadingAudios || tieneConformidadRegistrada"
                                />
                            </div>
                            <div class="col-12 col-sm-auto">
                                <q-btn
                                    label="Subir"
                                    icon="upload"
                                    class="audio-btn btn-inabif"
                                    size="sm"
                                    :loading="loadingAudios"
                                    :disable="!puedeSubirConformidad"
                                    @click="subirAudio"
                                />
                            </div>
                        </div>

                        <div v-if="tieneConformidadRegistrada" class="audio-replacing-banner text-caption q-mb-sm">
                            Ya existe una conformidad registrada. Elimine el documento actual para cargar otro.
                        </div>

                        <!-- Tabla de conformidades -->
                        <q-table
                            class="audio-table"
                            :data="audiosList"
                            :columns="columnasAudios"
                            row-key="idAudio"
                            table-header-class="bg-inabif text-bold"
                            dense flat bordered
                            :loading="loadingAudios"
                            :rows-per-page-options="[10, 20, 50]"
                        >
                            <template v-slot:body-cell-nro="props">
                                <q-td :props="props">
                                    {{ props.rowIndex + 1 }}
                                </q-td>
                            </template>

                            <template v-slot:body-cell-nombreArchivo="props">
                                <q-td :props="props">
                                    <div class="audio-file-name" :title="props.row.nombreArchivo">
                                        {{ props.row.nombreArchivo }}
                                    </div>
                                </q-td>
                            </template>

                            <template v-slot:body-cell-acciones="props">
                                        <q-td :props="props">
                                            <div class="audio-actions-row">
                                                <q-btn
                                                    icon="download"
                                                    color="primary"
                                                    class="audio-action-btn audio-action-btn--play"
                                                    flat
                                                    round
                                                    size="sm"
                                                    @click="descargarConformidad(props.row)"
                                                >
                                                    <q-tooltip>Descargar</q-tooltip>
                                                </q-btn>
                                                <q-btn
                                                    icon="picture_as_pdf"
                                                    color="info"
                                                    class="audio-action-btn audio-action-btn--edit"
                                                    flat
                                                    round
                                                    size="sm"
                                                    @click="verPdfConformidad(props.row)"
                                                >
                                                    <q-tooltip>Ver PDF</q-tooltip>
                                                </q-btn>
                                                <q-btn
                                                    icon="delete"
                                            color="negative"
                                            class="audio-action-btn audio-action-btn--delete"
                                            flat
                                            round
                                            size="sm"
                                            @click="eliminarAudio(props.row)"
                                        >
                                            <q-tooltip>Eliminar</q-tooltip>
                                        </q-btn>
                                    </div>
                                </q-td>
                            </template>

                            <template v-slot:no-data>
                                <div class="full-width row flex-center q-pa-md text-grey">
                                    No hay conformidad registrada
                                </div>
                            </template>
                        </q-table>
                    </q-card-section>

                    <q-card-actions align="right" class="audio-dialog__actions">
                        <q-btn
                            label="GENERAR COMPROMISO"
                            icon="picture_as_pdf"
                            size="sm"
                            color="primary"
                            class="audio-btn"
                            :loading="generandoCompromiso"
                            :disable="!esFichaSuscrita(audioRow) || loadingAudios || generandoCompromiso"
                            @click="generarCompromisoAudio"
                        />
                        <q-btn label="Cerrar" icon="close" size="sm" class="ficha-btn-cancelar audio-btn" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>

        </div>

    </template>

<style scoped>
.ficha-dialog {
    width: 95%;
    max-width: 900px;
    margin: 0 auto;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.ficha-scroll-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    max-height: 80vh;
    width: 100%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
}

.ficha-body {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.ficha-body > .q-card {
    min-width: 0;
}

.tabla-scroll-container {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.datos-generales-section {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: hidden;
}

.datos-generales-scroll {
    width: 100%;
    max-width: 100%;
    min-width: 0;
}

.tabla-scroll-container .q-markup-table {
    width: 100%;
    min-width: 500px;
}

.datos-generales-tabla {
    width: 100%;
    max-width: 100%;
    min-width: 0;
}

.u-wrap {
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
}

.u-ellipsis {
    display: block;
    max-width: 100%;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.conformidad-solo-lectura {
    border-color: #d6e1ec;
    background: #f8fbfe;
}

.conformidad-solo-lectura__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    color: #1f2d3d;
    border-bottom: 1px solid #d6e1ec;
}

.conformidad-solo-lectura__icon {
    color: #2d6a8d;
}

.conformidad-solo-lectura__table {
    background: #fff;
}

.conformidad-solo-lectura__table :deep(th),
.conformidad-solo-lectura__table :deep(td) {
    padding-top: 7px;
    padding-bottom: 7px;
}

.conformidad-solo-lectura__table :deep(tbody td:nth-child(2)) {
    max-width: 1px;
}

.ficha-header {
    display: flex;
    flex: 0 0 auto;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
}

.ficha-titulo {
    font-size: clamp(0.9rem, 2.5vw, 1.25rem);
    word-wrap: break-word;
    overflow-wrap: anywhere;
    line-height: 1.35;
    flex: 1;
    min-width: 0;
    font-weight: 600;
    color: #1a1a1a;
    padding-right: 8px;
}

.ficha-codigo-nna {
    align-self: center;
    flex: 0 1 auto;
    max-width: min(260px, 38vw);
    min-height: 28px;
    margin: 0;
    border: 1px solid rgba(25, 118, 210, 0.24);
    box-shadow: 0 2px 6px rgba(25, 118, 210, 0.22);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.02em;
}

.ficha-codigo-nna :deep(.q-chip__content) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ficha-codigo-nna :deep(.q-chip__icon) {
    font-size: 16px;
}

.ficha-cerrar {
    flex-shrink: 0;
    margin-top: 2px;
}

.ficha-input .q-field,
.ficha-input .q-field.q-field--outlined,
.ficha-input .q-field.q-field--filled {
    border: none !important;
    box-shadow: none !important;
}

.ficha-pregunta {
    padding: 8px 0;
    border-bottom: 1px solid #e8e8e8;
    transition: background-color 0.15s ease;
}

.ficha-pregunta:hover {
    background-color: #fafbfc;
}

.ficha-pregunta:last-child {
    border-bottom: none;
}

.contexto-ficha {
    margin-bottom: 16px;
    padding: 12px;
    border: 1px solid #d9e2ec;
    border-radius: 8px;
    background: #f8fbff;
}

.contexto-ficha__item {
    min-height: 64px;
    padding: 10px 12px;
    border-left: 4px solid #BF0411;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
}

.contexto-ficha__label {
    margin-bottom: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #5b7083;
    text-transform: uppercase;
}

.contexto-ficha__valor {
    color: #1f2d3d;
    font-size: 0.95rem;
    font-weight: 600;
    word-break: break-word;
}

.contexto-ficha__valor--una-linea {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ficha-campo {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
}

@media (min-width: 600px) {
    .ficha-campo {
        flex-direction: row;
        align-items: flex-start;
        gap: 8px;
    }
}

.ficha-label {
    flex: 0 0 auto;
    min-width: 150px;
    font-size: 0.95rem;
    font-weight: 500;
    color: #1a1a1a;
    line-height: 1.5;
    padding-top: 0;
}

@media (min-width: 600px) {
    .ficha-label {
        flex: 0 0 40%;
        max-width: 40%;
    }
}

.ficha-input {
    flex: 1;
    min-width: 0;
}

.ficha-campo--summary {
    gap: 0;
    border: 1px solid #d8e3ef;
    border-radius: 0;
    overflow: hidden;
    background: #fff;
}

.ficha-label--summary {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    padding: 12px 14px;
    background: #edf3fa;
    color: #22313f;
    font-weight: 700;
    border-right: 1px solid #d8e3ef;
    text-align: left;
    line-height: 1.35;
}

.ficha-summary-icon {
    color: #BF0411;
    font-size: 22px;
}

.ficha-pregunta--summary {
    padding: 0;
    border-bottom: 0;
}

.ficha-pregunta--summary .ficha-campo--summary {
    align-items: stretch;
    min-height: 52px;
}

.ficha-pregunta--summary .ficha-label--summary {
    flex: 0 0 45%;
    max-width: 45%;
    min-height: 100%;
    padding: 8px 14px;
}

.ficha-pregunta--summary .ficha-input {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 55%;
    max-width: 55%;
    padding: 6px 14px;
    background: #fff;
}

.ficha-pregunta--summary .ficha-input .q-field,
.ficha-pregunta--summary .ficha-input .ficha-valor {
    width: 100%;
    max-width: 320px;
}

.ficha-pregunta--summary .ficha-input .q-field {
    display: flex;
    align-items: center;
}

.ficha-pregunta--summary :deep(.q-field__control) {
    min-height: 38px;
    height: 38px;
    align-items: center;
}

.ficha-pregunta--summary :deep(.q-field__native),
.ficha-pregunta--summary :deep(.q-field__input) {
    padding-top: 0;
    padding-bottom: 0;
    align-items: center;
}

.ficha-pregunta--summary :deep(.q-field__marginal) {
    height: 38px;
    align-items: center;
}

.ficha-pregunta--summary .ficha-valor {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    text-align: center;
}

.ficha-pregunta--summary + .ficha-pregunta--summary .ficha-campo--summary {
    border-top: 0;
}

.ficha-input--branched-select {
    display: flex;
    align-items: center;
    min-width: 0;
    flex: 1;
}

.ficha-page {
    min-width: 0;
}

.ficha-acciones-principales {
    position: relative;
    z-index: 1;
}

.ficha-accion-principal {
    min-width: 0;
}

.ficha-branched-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
}

.ficha-branched-group--selects-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 10px;
}

.ficha-textm {
    width: 100%;
}

.ficha-textm__input-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.ficha-textm__input {
    flex: 1;
}

.ficha-date-inputs {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    gap: 8px;
}

.ficha-date-inputs__field {
    flex: 1 1 0;
    min-width: 0;
}

.ficha-input-counter-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;
}

.ficha-input-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 4px;
}

.ficha-input-counter {
    font-size: 0.75rem;
    line-height: 1;
    color: #6b7280;
    white-space: nowrap;
}

.ficha-input-error-text {
    font-size: 0.75rem;
    line-height: 1.2;
    color: #c10015;
}

.ficha-campo--branched {
    padding-left: 16px;
    border-left: 3px solid #e8eef5;
}

.ficha-campo--branched-select {
    flex: 1 1 220px;
    min-width: 220px;
    max-width: 320px;
    padding-left: 0;
    border-left: 0;
}

.ficha-branched-select-visualizacion {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    width: 100%;
    flex-wrap: wrap;
}

.ficha-branched-select-visualizacion__label {
    font-weight: 600;
    color: #22313f;
}

.ficha-branched-select-visualizacion__valor {
    flex: 1 1 auto;
    min-width: 0;
}

.ficha-input .q-field__control {
    border-radius: 6px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ficha-input :deep(textarea.q-field__native) {
    overflow-wrap: anywhere;
    word-break: break-word;
}

.ficha-input .q-field__control:hover {
    border-color: #bf0411;
}

.ficha-input .q-field--focused .q-field__control {
    border-color: #bf0411;
    box-shadow: 0 0 0 3px rgba(191, 4, 17, 0.12);
}

.ficha-input.modo-visualizacion .q-field__control {
    background-color: #f9f9f9;
    border-color: #e0e0e0;
}

.ficha-input.modo-visualizacion .q-field__control::before {
    border-color: #e0e0e0;
}

.ficha-input.modo-visualizacion .q-field__control::after {
    display: none;
}

.ficha-valor {
    display: block;
    padding: 10px 12px;
    background-color: #f5f5f5;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    color: #333;
    font-size: 0.95rem;
    line-height: 1.5;
    min-height: 40px;
}

.ficha-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.ficha-tag {
    display: inline-block;
    padding: 6px 12px;
    background-color: #e8f4fd;
    color: #0277bd;
    border-radius: 16px;
    font-size: 0.85rem;
    font-weight: 500;
}

.ficha-pregunta2 {
    margin-top: 8px;
    padding-left: 16px;
    border-left: 3px solid #BF0411;
}

.pregunta-label {
    background-color: #e8f4fd;
    padding: 16px;
    margin: 16px 0 12px 0;
    border-radius: 6px;
    border-left: 4px solid #0288d1;
}

.pregunta-label .text-body2 {
    color: #01579b;
    font-weight: 600;
    font-size: 1rem;
}

.seccion-cabecera {
    background-color: #f5f7fa;
    border-radius: 6px;
    padding: 14px 16px;
    margin-bottom: 20px;
    border-left: 4px solid #BF0411;
}

.seccion-cabecera .col-12 {
    font-weight: 600;
    color: #2d3748;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.datos-generales-tabla tbody tr:nth-child(odd) {
    background-color: #fafbfc;
}

.datos-generales-tabla tbody tr:hover {
    background-color: #f0f4f8;
}

.datos-generales-tabla td:first-child {
    background-color: #DEE8F5;
    font-weight: 600;
    color: #1a1a1a;
    min-width: 200px;
}

.datos-generales-tabla .q-icon {
    color: #374151;
    font-size: 18px;
    margin-right: 8px;
}

.datos-generales-tabla td:last-child {
    padding-left: 16px;
}

.datos-generales-tabla .q-field,
.datos-generales-tabla .q-input,
.datos-generales-tabla .q-select {
    width: 100%;
}

.seccion-expansion {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.seccion-expansion .q-expansion-item__content {
    border-left: 4px solid #BF0411;
}

.header-seccion {
    background: linear-gradient(135deg, #BF0411 0%, #d63031 100%);
}

.header-seccion:hover {
    background: linear-gradient(135deg, #a3030f 0%, #c0392b 100%);
}

.q-expansion-item__content {
    padding: 20px;
}

.totales-container {
    background-color: #fafbfc;
    border-radius: 8px;
    padding: 20px;
    margin-top: 24px;
    border: 1px solid #e0e0e0;
}

.totales-header {
    background: linear-gradient(135deg, #DEE8F5 0%, #c8d6e5 100%);
    padding: 14px 20px;
    border-radius: 6px 6px 0 0;
    margin: -20px -20px 20px -20px;
    border-bottom: 2px solid #BF0411;
}

.totales-header .text-weight-bold {
    color: #1a1a1a;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.totales-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 6px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.totales-row:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.totales-row.conforme {
    background-color: #d4edda;
    border-left: 4px solid #28a745;
}

.totales-row.no-conforme {
    background-color: #f8d7da;
    border-left: 4px solid #dc3545;
}

.totales-row.observacion {
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
}

.totales-row.no-aplica {
    background-color: #e9ecef;
    border-left: 4px solid #6c757d;
}

.totales-row .text-right {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1a1a1a;
}

.q-field--disabled {
    opacity: 0.7;
}

.q-field--disabled .q-field__control {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.q-radio__inner--truthy {
    color: #BF0411;
}

.q-option-group .q-radio {
    margin-right: 16px;
}

.q-option-group .q-radio:hover .q-radio__inner {
    color: #d63031;
}

.ficha-radio-group {
    display: flex;
    justify-content: center;
    column-gap: 20px;
    row-gap: 8px;
}

@media (max-width: 599px) {
    .ficha-label {
        font-size: 0.9rem;
        padding-top: 0;
        margin-bottom: 4px;
    }
    
    .ficha-pregunta {
        padding: 8px 0;
    }
    
    .ficha-valor {
        font-size: 0.9rem;
        padding: 8px 10px;
    }
    
    .ficha-input .q-field {
        min-height: 48px;
    }
    
    .ficha-input .q-field__control {
        min-height: 40px;
    }

    .ficha-radio-group {
        justify-content: center;
        column-gap: 16px;
    }
    
    .ficha-dialog {
        width: 100%;
        max-width: 100%;
        height: 100vh;
        max-height: 100vh;
        margin: 0;
        border-radius: 0;
    }

    .ficha-scroll-wrapper {
        height: 100%;
        max-height: 100%;
        position: relative;
    }

    .ficha-header {
        padding: 10px 14px;
    }

    .ficha-body {
        padding: 10px 12px calc(92px + env(safe-area-inset-bottom, 0px));
    }

    .ficha-footer {
        position: absolute;
        left: auto;
        right: 12px;
        bottom: 0;
        z-index: 10;
        display: flex;
        width: max-content;
        max-width: calc(100% - 24px);
        min-width: 0;
        padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
        border: 0 !important;
        border-top: 0 !important;
        background: transparent !important;
        background-color: transparent !important;
        box-shadow: none;
        border-radius: 0;
        column-gap: 8px;
        row-gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
        pointer-events: auto;
    }

    .ficha-footer .q-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 56px;
        width: 56px;
        min-width: 56px !important;
        max-width: 56px;
        height: 56px;
        min-height: 56px;
        border-radius: 50%;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.24);
        pointer-events: auto;
    }

    .ficha-footer .q-btn :deep(.q-btn__wrapper) {
        width: 100%;
        height: 100%;
        min-height: 56px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .ficha-footer .q-btn :deep(.q-btn__content) {
        width: 100%;
        height: 100%;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0;
    }

    .ficha-footer .q-btn :deep(.q-icon) {
        margin: 0;
        font-size: 24px;
        line-height: 1;
    }

    .ficha-footer .q-btn :deep(.q-btn__content span:not(.q-icon)) {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    .ficha-footer .ficha-footer-drag {
        display: inline-flex;
        color: #455a64;
        background-color: #ffffff;
        cursor: grab;
        touch-action: none;
    }

    .ficha-footer .ficha-footer-drag:active {
        cursor: grabbing;
    }

    @supports (height: 100dvh) {
        .ficha-dialog {
            height: 100dvh;
            max-height: 100dvh;
        }
    }

    .tabla-scroll-container .q-markup-table {
        min-width: 0;
    }

    .datos-generales-scroll {
        overflow-x: hidden;
        margin: 0;
        padding: 0;
    }

    .datos-generales-scroll :deep(.q-markup-table),
    .datos-generales-scroll :deep(.q-markup-table table),
    .datos-generales-scroll :deep(.q-markup-table__wrapper) {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        table-layout: auto !important;
        overflow-x: visible !important;
    }

    .tabla-scroll-container,
    .datos-generales-tabla,
    .datos-generales-tabla tbody,
    .datos-generales-tabla tr,
    .datos-generales-tabla td {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }

    .datos-generales-tabla tbody tr {
        display: block;
        border-bottom: 1px solid #e6ecf2;
        padding: 8px 0;
    }

    .datos-generales-tabla tbody {
        display: block;
        width: 100%;
    }

    .datos-generales-tabla tbody td {
        display: block;
        width: 100%;
        padding: 8px 10px !important;
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
        text-align: left;
    }

    .datos-generales-tabla td:first-child {
        min-width: 0 !important;
        width: 100% !important;
        font-weight: 700;
        color: #34495e;
        padding-bottom: 4px !important;
    }

    .datos-generales-tabla td:last-child {
        padding-left: 10px !important;
        padding-top: 2px !important;
    }

    .datos-generales-tabla :deep(.q-field),
    .datos-generales-tabla :deep(.q-input),
    .datos-generales-tabla :deep(.q-select) {
        display: block;
        width: 100%;
        max-width: 100%;
        min-width: 0;
    }

    .datos-generales-tabla :deep(.q-field__control),
    .datos-generales-tabla :deep(.q-input .q-field__control),
    .datos-generales-tabla :deep(.q-select .q-field__control) {
        min-height: 40px !important;
        height: auto !important;
    }

    .datos-generales-tabla :deep(tr),
    .datos-generales-tabla :deep(td) {
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
    }

    .datos-generales-tabla :deep(.q-field__native),
    .datos-generales-tabla :deep(.q-field__input),
    .datos-generales-tabla :deep(.q-chip) {
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
    }

    .datos-generales-tabla :deep(.q-chip) {
        max-width: 100%;
    }

    .datos-generales-tabla :deep(.q-field__native),
    .datos-generales-tabla :deep(.q-field__input),
    .datos-generales-tabla :deep(.q-field__marginal),
    .datos-generales-tabla :deep(.q-field__append),
    .datos-generales-tabla :deep(.q-field__prepend),
    .datos-generales-tabla :deep(.q-chip__content) {
        min-width: 0;
        max-width: 100%;
    }

    .datos-generales-tabla :deep(.q-chip) {
        height: auto;
        min-height: 24px;
    }

    .datos-generales-tabla :deep(.q-chip__content) {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .dg-supervisados-row {
        flex-direction: column;
        align-items: stretch;
        row-gap: 8px;
    }

    .dg-supervisados-row > .col,
    .dg-supervisados-row > .col-auto {
        width: 100%;
        max-width: 100%;
        flex: 0 0 100%;
    }
    
    .seccion-expansion .q-expansion-item__content {
        padding: 12px;
    }
    
    .totales-row {
        padding: 10px 12px;
    }
    
    .totales-row .text-right {
        font-size: 1rem;
    }
}

.q-markup-table {
    font-size: 0.95rem;
}

.q-markup-table td {
    padding: 12px 16px;
    vertical-align: top;
}

.q-input, .q-select {
    min-height: 42px;
}

.q-input .q-field__control, .q-select .q-field__control {
    min-height: 40px;
}

@media (min-width: 600px) {
    .q-input .q-field__control, .q-select .q-field__control {
        height: 40px;
    }
}

.q-input input, .q-select .q-field__input {
    padding: 8px 0;
}

/* Datos Generales - quitar bordes dobles */
.datos-generales-tabla .q-field,
.datos-generales-tabla .q-field.q-field--outlined,
.datos-generales-tabla .q-field.q-field--filled {
    border: none !important;
    box-shadow: none !important;
}

.datos-generales-tabla .q-field__control {
    border: none !important;
    box-shadow: none !important;
}

/* Focus visible para accesibilidad */
.ficha-input .q-field--focused .q-field__control {
    outline: 2px solid #BF0411;
    outline-offset: 2px;
}

.ficha-input .q-radio--focused .q-radio__inner {
    outline: 2px solid #BF0411;
    outline-offset: 2px;
}

/* Hover en radios */
.q-radio:hover .q-radio__inner:not(.q-radio__inner--truthy) {
    color: #d63031;
}

.q-radio__inner--truthy {
    color: #BF0411 !important;
}

/* Separación entre secciones */
.seccion-expansion {
    margin-bottom: 24px;
}

/* Barra para botón PDF */
.ficha-pdf-bar {
    background-color: #f0f4f8;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-end;
}

/* Dialogo Gestion de Audios */
.audio-dialog {
    width: 820px;
    max-width: 90vw;
    max-height: 86vh;
    overflow: hidden;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
}

.audio-dialog__header {
    min-height: 48px;
    height: auto;
    padding: 10px 14px 8px 16px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    column-gap: 12px;
}

.audio-dialog__title-block {
    min-width: 0;
    flex: 1 1 auto;
}

.audio-dialog__title,
:deep(.audio-delete-dialog .q-dialog__title) {
    color: #000;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.25;
}

.audio-dialog__subtitle {
    margin-top: 2px;
    color: #263238;
    line-height: 1.25;
    white-space: normal;
    overflow-wrap: anywhere;
}

.audio-dialog__close {
    flex: 0 0 auto;
    color: #1f2d3d;
}

.audio-dialog__body {
    min-width: 0;
    max-width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 14px 16px;
    flex: 1 1 auto;
}

.audio-dialog__actions {
    padding: 10px 16px 14px;
    border-top: 1px solid #e5edf6;
}

.audio-upload-row {
    min-width: 0;
}

.audio-file-field,
.audio-upload-row .col-12,
.audio-upload-row .col-sm,
.audio-upload-row .col-sm-auto {
    min-width: 0;
}

.audio-field-icon {
    color: #455a64;
    font-size: 20px;
}

.audio-btn {
    min-width: 112px;
    height: 34px;
}

.audio-btn--cancel {
    color: #546e7a;
}

.audio-btn--close {
    color: #263238;
}

.audio-replacing-banner {
    padding: 8px 10px;
    border: 1px solid #d7e3f1;
    border-left: 4px solid #1976d2;
    border-radius: 4px;
    background: #f4f8fd;
    color: #263238;
    overflow-wrap: anywhere;
}

.audio-table {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: hidden;
}

.audio-table :deep(.q-table__middle),
.audio-table :deep(.q-table__container),
.audio-table :deep(table) {
    width: 100%;
    max-width: 100%;
}

.audio-table :deep(th),
.audio-table :deep(td) {
    vertical-align: middle;
}

.audio-table :deep(th:nth-child(1)),
.audio-table :deep(td:nth-child(1)) {
    width: 58px;
    min-width: 58px;
    max-width: 58px;
    text-align: center;
}

.audio-table :deep(th:nth-child(2)),
.audio-table :deep(td:nth-child(2)) {
    min-width: 0;
}

.audio-table :deep(th:nth-child(3)),
.audio-table :deep(td:nth-child(3)) {
    width: 138px;
    min-width: 138px;
    max-width: 138px;
    text-align: center;
}

.audio-file-name {
    display: block;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.audio-actions-row {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 6px;
    min-width: 0;
}

.audio-action-btn {
    width: 30px;
    height: 30px;
    min-width: 30px;
    min-height: 30px;
}

.audio-action-btn :deep(.q-btn__wrapper),
.audio-action-btn :deep(.q-btn__content) {
    width: 30px;
    height: 30px;
    min-height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.audio-action-btn :deep(.q-icon) {
    font-size: 20px;
}

.audio-action-btn--edit {
    color: #f2a900 !important;
}

.audio-player-inline {
    width: 100%;
    max-width: 100%;
    height: 40px;
    border-radius: 6px;
    margin-top: 8px;
    display: block;
}

:deep(.audio-delete-dialog) {
    width: 420px;
    max-width: 92vw;
    border-radius: 6px;
    overflow: hidden;
}

:deep(.audio-delete-dialog .q-dialog__title) {
    background-color: #dee8f5;
    height: 40px;
    padding: 10px 16px 0;
}

:deep(.audio-delete-dialog .q-card__section--main) {
    padding: 16px;
    color: #1f2d3d;
    line-height: 1.45;
    overflow-wrap: anywhere;
}

:deep(.audio-delete-dialog .q-card__actions) {
    padding: 10px 16px 14px;
    column-gap: 8px;
}

:deep(.audio-delete-dialog .q-card__actions .q-btn) {
    min-width: 112px;
    height: 36px;
    font-size: 11px;
    font-weight: 700;
}

@media (max-width: 599px) {
    .audio-dialog {
        width: calc(100vw - 28px);
        max-width: calc(100vw - 28px);
        max-height: 82vh;
        margin: 14px;
    }

    .audio-dialog__header {
        padding: 10px 12px 8px;
        align-items: flex-start;
    }

    .audio-dialog__body {
        padding: 12px;
    }

    .audio-dialog__actions {
        padding: 10px 12px 12px;
    }

    .audio-upload-row {
        row-gap: 8px;
    }

    .audio-upload-row .col-12,
    .audio-upload-row .col-sm,
    .audio-upload-row .col-sm-auto {
        flex: 0 0 100%;
        width: 100%;
        max-width: 100%;
    }

    .audio-file-field,
    .audio-file-field :deep(.q-field__control),
    .audio-file-field :deep(.q-field__native),
    .audio-file-field :deep(.q-field__input) {
        width: 100%;
        max-width: 100%;
        min-width: 0;
    }

    .audio-btn,
    .audio-btn--close {
        width: 100%;
        min-width: 0;
    }

    .audio-table {
        font-size: 11px;
    }

    .audio-table :deep(table) {
        table-layout: fixed;
    }

    .audio-table :deep(th),
    .audio-table :deep(td) {
        padding-left: 6px;
        padding-right: 6px;
    }

    .audio-table :deep(th:nth-child(1)),
    .audio-table :deep(td:nth-child(1)) {
        width: 44px;
        min-width: 44px;
        max-width: 44px;
    }

    .audio-table :deep(th:nth-child(3)),
    .audio-table :deep(td:nth-child(3)) {
        width: 112px;
        min-width: 112px;
        max-width: 112px;
    }

    .audio-actions-row {
        column-gap: 4px;
    }

    .audio-action-btn,
    .audio-action-btn :deep(.q-btn__wrapper),
    .audio-action-btn :deep(.q-btn__content) {
        width: 28px;
        height: 28px;
        min-width: 28px;
        min-height: 28px;
    }

    .audio-action-btn :deep(.q-icon) {
        font-size: 19px;
    }

    .audio-player-inline {
        height: 38px;
    }

    :deep(.audio-delete-dialog) {
        width: calc(100vw - 32px);
        max-width: calc(100vw - 32px);
    }

    :deep(.audio-delete-dialog .q-card__actions) {
        justify-content: stretch;
    }

    :deep(.audio-delete-dialog .q-card__actions .q-btn) {
        flex: 1 1 0;
        min-width: 0;
    }
}

/* Audio player estilizado */
audio {
    width: 100%;
    border-radius: 6px;
    margin-top: 8px;
    height: 40px;
}

/* Footer del diálogo */
.ficha-footer {
    flex: 0 0 auto;
    border-top: 1px solid #e0e0e0;
    padding: 16px 24px;
    background-color: #ffffff;
}

.ficha-btn-guardar {
    min-width: 120px;
}

.ficha-btn-cerrar {
    min-width: 140px;
}

.ficha-btn-cancelar {
    min-width: 100px;
}

.ficha-footer-drag {
    display: none;
}

.ficha-obligatorio {
    color: #BF0411;
    margin-left: 4px;
    font-weight: 700;
}

/* Scrollbar estilizado - vertical (body) */
.ficha-body::-webkit-scrollbar {
    width: 8px;
}

.ficha-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.ficha-body::-webkit-scrollbar-thumb {
    background: #c0c0c0;
    border-radius: 4px;
}

.ficha-body::-webkit-scrollbar-thumb:hover {
    background: #a0a0a0;
}

/* Scrollbar estilizado - horizontal (wrapper) */
.ficha-scroll-wrapper::-webkit-scrollbar {
    height: 8px;
}

.ficha-scroll-wrapper::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.ficha-scroll-wrapper::-webkit-scrollbar-thumb {
    background: #c0c0c0;
    border-radius: 4px;
}

.ficha-scroll-wrapper::-webkit-scrollbar-thumb:hover {
    background: #a0a0a0;
}

.select-option-img {
    width: 26px;
    height: 26px;
    object-fit: contain;
    margin-right: 8px;
    vertical-align: middle;
}

/* Layout fijo solo para tabla de anexos */
.tabla-anexos .q-table {
    table-layout: fixed;
    width: 100%;
}

.tabla-anexos .q-table th,
.tabla-anexos .q-table td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Truncado con ellipsis para celdas de texto */
.ellipsis-cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Ellipsis dentro de slots personalizados */
.q-td .ellipsis {
    width: 100%;
    display: block;
}

.menu-acciones-ficha {
    min-width: 220px;
    max-width: 280px;
    width: 100%;
    min-width: 0;
    border: 1px solid #e6edf5;
    border-radius: 10px;
    box-shadow: 0 8px 18px rgba(15, 35, 60, 0.18);
    overflow: hidden;
    background: #fff;
}

.menu-accion-item {
    min-height: 48px;
    padding: 6px 10px;
    align-items: center;
    transition: background-color 0.18s ease;
}

.menu-accion-item:hover {
    background: #f4f8ff;
}

.menu-accion-item .q-avatar {
    width: 32px;
    height: 32px;
    font-size: 16px;
}

.menu-accion-label {
    min-width: 0;
    font-weight: 600;
    letter-spacing: 0.2px;
    color: #1f2d3d;
}

.menu-accion-item--anular:hover {
    background: #fff2f2;
}

.menu-accion-item--anular .menu-accion-label {
    color: #b71c1c;
}

.chip-estado {
    font-weight: 700;
    letter-spacing: 0.2px;
    padding: 2px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
}

.chip-estado .q-chip__icon {
    font-size: 16px;
}

.chip-estado--1 {
    background: linear-gradient(135deg, #1faa59 0%, #2ecc71 100%);
}

.chip-estado--2 {
    background: linear-gradient(135deg, #1565c0 0%, #1e88e5 100%);
}

.chip-estado--0 {
    background: linear-gradient(135deg, #c62828 0%, #ef5350 100%);
}

/* ================================
   ESTILOS TABLA VALIDAR FICHA
   ================================ */

.validar-dialog {
    width: 760px;
    max-width: 90vw;
    max-height: 86vh;
    overflow: hidden;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
}

.validar-dialog__header {
    min-height: 48px;
    height: auto;
    padding: 10px 14px 8px 16px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    column-gap: 12px;
}

.validar-dialog__title-block {
    min-width: 0;
    flex: 1 1 auto;
}

.validar-dialog__title {
    color: #000;
    line-height: 1.25;
}

.validar-dialog__subtitle {
    margin-top: 2px;
    color: #263238;
    line-height: 1.25;
    white-space: normal;
    overflow-wrap: anywhere;
}

.validar-dialog__close {
    flex: 0 0 auto;
    color: #1f2d3d;
}

.validar-dialog__body {
    min-width: 0;
    max-width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 14px 16px;
    flex: 1 1 auto;
}

.validar-dialog__actions {
    padding: 10px 16px 14px;
    border-top: 1px solid #e5edf6;
}

.validar-btn {
    min-width: 132px;
}

.validar-btn--close {
    color: #263238;
}

.cierre-dialog {
    width: 760px;
    max-width: 92vw;
    max-height: 86vh;
    overflow: hidden;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
}

.cierre-dialog__header {
    min-height: 48px;
    padding: 12px 16px 10px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    column-gap: 12px;
}

.cierre-dialog__title-block {
    min-width: 0;
    flex: 1 1 auto;
}

.cierre-dialog__title {
    color: #000;
    line-height: 1.25;
}

.cierre-dialog__subtitle {
    margin-top: 4px;
    color: #334155;
    line-height: 1.35;
    white-space: normal;
    overflow-wrap: anywhere;
}

.cierre-dialog__close {
    flex: 0 0 auto;
    color: #1f2d3d;
}

.cierre-dialog__body {
    min-width: 0;
    max-width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 16px;
    flex: 1 1 auto;
    background: #f8fafc;
}

.cierre-dialog__body--confirmacion {
    display: flex;
    align-items: center;
}

.cierre-dialog__actions {
    padding: 12px 16px 16px;
    border-top: 1px solid #e5edf6;
    background: #fff;
}

.cierre-dialog__btn {
    min-width: 138px;
}

.cierre-pendiente-seccion {
    padding: 14px;
    border: 1px solid #dbe7f3;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
}

.cierre-pendiente-seccion + .cierre-pendiente-seccion {
    margin-top: 12px;
}

.cierre-pendiente-seccion__titulo {
    margin-bottom: 10px;
    font-size: 0.88rem;
    font-weight: 700;
    color: #bf0411;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.cierre-pendiente-item {
    display: flex;
    align-items: flex-start;
    column-gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    background: #f8fafc;
}

.cierre-pendiente-item + .cierre-pendiente-item {
    margin-top: 8px;
}

.cierre-pendiente-item--subpregunta {
    margin-left: 20px;
    background: #f1f5f9;
    border-left: 3px solid #5c6bc0;
}

.cierre-pendiente-item__icon {
    margin-top: 2px;
    color: #bf0411;
}

.cierre-pendiente-item__content {
    min-width: 0;
    flex: 1 1 auto;
}

.cierre-pendiente-item__parent {
    margin-bottom: 3px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #51606f;
}

.cierre-pendiente-item__label {
    color: #1f2937;
    line-height: 1.45;
    overflow-wrap: anywhere;
}

.cierre-confirmacion-card {
    display: flex;
    align-items: center;
    column-gap: 14px;
    width: 100%;
    padding: 18px;
    border-radius: 12px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
    border: 1px solid #d8e6f3;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.cierre-confirmacion-card__icon {
    font-size: 38px;
    color: #1f8b4c;
}

.cierre-confirmacion-card__content {
    min-width: 0;
    flex: 1 1 auto;
}

.cierre-confirmacion-card__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1f2d3d;
}

.cierre-confirmacion-card__text,
.cierre-confirmacion-card__meta {
    margin-top: 4px;
    color: #475569;
    line-height: 1.4;
    overflow-wrap: anywhere;
}

.validar-table {
    width: 100%;
    max-width: 100%;
    min-width: 0;
}

.tabla-validar-ficha :deep(.q-table__container),
.tabla-validar-ficha :deep(.q-table__middle),
.tabla-validar-ficha :deep(table) {
    width: 100%;
    max-width: 100%;
}

.tabla-validar-ficha :deep(table) {
    table-layout: fixed;
}

.tabla-validar-ficha :deep(th) {
    background: linear-gradient(135deg, #BF0411 0%, #d63031 100%);
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-size: 0.8rem;
    padding: 11px 12px;
}

.tabla-validar-ficha :deep(td) {
    padding: 10px 12px;
    vertical-align: middle;
}

.tabla-validar-ficha :deep(tbody tr:nth-child(even)) {
    background-color: #fafbfc;
}

.tabla-validar-ficha :deep(tbody tr:hover) {
    background-color: #f0f4f8;
}

.tabla-validar-ficha :deep(th:nth-child(1)),
.tabla-validar-ficha :deep(td:nth-child(1)) {
    width: 52px;
    min-width: 52px;
    max-width: 52px;
    text-align: center;
}

.tabla-validar-ficha :deep(th:nth-child(2)),
.tabla-validar-ficha :deep(td:nth-child(2)) {
    min-width: 0;
}

.tabla-validar-ficha :deep(th:nth-child(3)),
.tabla-validar-ficha :deep(td:nth-child(3)) {
    width: 280px;
    min-width: 280px;
    max-width: 280px;
    text-align: center;
}

.validar-status-icon {
    font-size: 28px;
}

.validar-input-row {
    min-width: 0;
    flex-wrap: nowrap;
}

.input-validar {
    min-width: 0;
    width: 100%;
    max-width: 230px;
}

.input-validar :deep(.q-field__control) {
    border-radius: 20px;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
    padding-right: 4px;
}

.input-validar :deep(.q-field__control:hover) {
    border-color: #BF0411;
}

.input-validar.q-field--focused :deep(.q-field__control) {
    border-color: #BF0411;
    box-shadow: 0 0 0 3px rgba(191, 4, 17, 0.12);
}

.input-validar :deep(input) {
    font-size: 0.9rem;
}

.btn-validar-icon,
.btn-validar-inline {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    border-radius: 50%;
    padding: 0;
}

@media (max-width: 1023px) {
    .ficha-page {
        padding-bottom: 164px;
    }

    .ficha-acciones-principales {
        position: fixed;
        right: 12px;
        bottom: calc(88px + env(safe-area-inset-bottom, 0px));
        z-index: 20;
        display: inline-flex;
        width: max-content;
        max-width: calc(100vw - 24px);
        padding: 0;
        margin: 0;
        border: 0;
        background: transparent;
        column-gap: 8px;
        row-gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
        pointer-events: none;
    }

    .ficha-acciones-principales .ficha-accion-principal {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 56px;
        width: 56px;
        min-width: 56px !important;
        max-width: 56px;
        height: 56px;
        min-height: 56px;
        border-radius: 50%;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.24);
        pointer-events: auto;
    }

    .ficha-acciones-principales .ficha-accion-principal :deep(.q-btn__wrapper) {
        width: 100%;
        height: 100%;
        min-height: 56px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .ficha-acciones-principales .ficha-accion-principal :deep(.q-btn__content) {
        width: 100%;
        height: 100%;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0;
    }

    .ficha-acciones-principales .ficha-accion-principal :deep(.q-icon) {
        margin: 0;
        font-size: 24px;
        line-height: 1;
    }

    .ficha-acciones-principales .ficha-accion-principal :deep(.q-btn__content span:not(.q-icon)) {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    .ficha-branched-group--selects-horizontal {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: stretch;
        gap: 4px;
        margin-top: 6px;
    }

    .ficha-campo--branched-select {
        flex: 1 1 100%;
        max-width: 100%;
        align-items: stretch;
        min-width: 0;
        gap: 2px;
    }

    .ficha-input--branched-select {
        width: 100%;
        flex: 0 0 auto;
    }

    .ficha-input--branched-select :deep(.q-field),
    .ficha-input--branched-select :deep(.q-field__control),
    .ficha-input--branched-select :deep(.q-field__native),
    .ficha-input--branched-select :deep(.q-field__input) {
        width: 100%;
        max-width: 100%;
        min-width: 0;
    }

    .seccion-cabecera {
        display: none;
    }

    .ficha-pregunta--summary .ficha-campo--summary {
        flex-direction: column;
        min-height: 0;
    }

    .ficha-pregunta--summary .ficha-label--summary {
        flex: 0 0 auto;
        max-width: 100%;
        width: 100%;
        border-right: 0;
        border-bottom: 1px solid #d8e3ef;
        padding: 8px 12px;
    }

    .ficha-pregunta--summary .ficha-input {
        flex: 0 0 auto;
        max-width: 100%;
        width: 100%;
        justify-content: center;
        padding: 8px 12px;
    }

    .ficha-pregunta--summary .ficha-input .q-field,
    .ficha-pregunta--summary .ficha-input .ficha-valor {
        max-width: 100%;
    }

    .ficha-textm__input-row {
        flex-wrap: wrap;
    }

    .ficha-textm__input {
        min-width: 0;
        flex: 1 1 180px;
    }

    .ficha-textm__input-row .q-btn {
        flex: 0 0 44px;
        width: 44px;
        min-width: 44px;
        height: 44px;
    }

    .ficha-footer {
        position: absolute;
        left: auto;
        right: 12px;
        bottom: 0;
        z-index: 10;
        display: flex;
        width: max-content;
        max-width: calc(100% - 24px);
        min-width: 0;
        padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
        border: 0 !important;
        border-top: 0 !important;
        border-radius: 0;
        background: transparent !important;
        background-color: transparent !important;
        box-shadow: none;
        column-gap: 8px;
        row-gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
        pointer-events: auto;
    }
}

@media (min-width: 600px) and (max-width: 1023px) {
    .ficha-body {
        padding-bottom: calc(92px + env(safe-area-inset-bottom, 0px));
    }

    .ficha-footer .q-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 56px;
        width: 56px;
        min-width: 56px !important;
        max-width: 56px;
        height: 56px;
        min-height: 56px;
        border-radius: 50%;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.24);
        pointer-events: auto;
    }

    .ficha-footer .q-btn :deep(.q-btn__wrapper) {
        width: 100%;
        height: 100%;
        min-height: 56px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .ficha-footer .q-btn :deep(.q-btn__content) {
        width: 100%;
        height: 100%;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0;
    }

    .ficha-footer .q-btn :deep(.q-icon) {
        margin: 0;
        font-size: 24px;
        line-height: 1;
    }

    .ficha-footer .q-btn :deep(.q-btn__content span:not(.q-icon)) {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    .ficha-footer .ficha-footer-drag {
        display: inline-flex;
        color: #455a64;
        background-color: #ffffff;
        cursor: grab;
        touch-action: none;
    }

    .ficha-footer .ficha-footer-drag:active {
        cursor: grabbing;
    }
}

@media (max-width: 599px) {
    .validar-dialog {
        width: calc(100vw - 28px);
        max-width: calc(100vw - 28px);
        max-height: 82vh;
        margin: 14px;
    }

    .validar-dialog__header {
        padding: 10px 12px 8px;
    }

    .validar-dialog__body {
        padding: 12px;
    }

    .validar-dialog__actions {
        padding: 10px 12px 12px;
        display: flex;
        justify-content: flex-end;
        column-gap: 8px;
    }

    .validar-btn {
        min-width: 0;
    }

    .cierre-dialog {
        width: calc(100vw - 20px);
        max-width: calc(100vw - 20px);
        max-height: 82vh;
        margin: 10px;
    }

    .cierre-dialog__header {
        padding: 10px 12px 8px;
    }

    .cierre-dialog__body {
        padding: 12px;
    }

    .cierre-dialog__actions {
        padding: 10px 12px 12px;
        display: flex;
        justify-content: flex-end;
        column-gap: 8px;
    }

    .cierre-dialog__actions--guardado {
        flex-wrap: wrap;
        row-gap: 8px;
    }

    .cierre-pendiente-item--subpregunta {
        margin-left: 8px;
    }

    .cierre-confirmacion-card {
        align-items: flex-start;
    }

    .tabla-validar-ficha {
        font-size: 11px;
    }

    .tabla-validar-ficha :deep(th),
    .tabla-validar-ficha :deep(td) {
        padding-left: 6px;
        padding-right: 6px;
    }

    .tabla-validar-ficha :deep(th:nth-child(1)),
    .tabla-validar-ficha :deep(td:nth-child(1)) {
        width: 42px;
        min-width: 42px;
        max-width: 42px;
    }

    .tabla-validar-ficha :deep(th:nth-child(3)),
    .tabla-validar-ficha :deep(td:nth-child(3)) {
        width: 136px;
        min-width: 136px;
        max-width: 136px;
    }

    .validar-status-icon {
        font-size: 24px;
    }

    .validar-input-row {
        column-gap: 4px;
    }

    .input-validar {
        max-width: 100%;
    }

    .btn-validar-icon,
    .btn-validar-inline {
        width: 28px;
        height: 28px;
        min-width: 28px;
        min-height: 28px;
    }

    .menu-acciones-ficha {
        min-width: 196px;
        max-width: 92vw;
    }

    .menu-accion-item {
        min-height: 44px;
        padding: 6px 8px;
    }

    .menu-accion-item .q-avatar {
        width: 30px;
        height: 30px;
        font-size: 15px;
    }
}
</style>

<script>


import axios from "axios";
import { IMAGE_MAP } from "src/constants/image-map.constant";
import { normalizeTextSpacing } from "src/utils/normalize-text-spacing.util";
import questionEngine from "src/modules/nna/dynamic-engine/question-engine";
import {
    obtenerAnexos,
    obtenerCatalogoPreguntas,
    obtenerResponsablesCentro,
    obtenerResponsablesSupervision,
    obtenerServicios,
    obtenerUnidades,
    listarAnexos,
    listarCentros
} from "src/services/ficha-catalog.service";
import {
    actualizarFicha,
    anularFicha,
    crearFicha,
    descargarCompromisoPdf,
    descargarFichaPdf,
    eliminarAudio,
    guardarConformidadFicha,
    guardarConformidadNna,
    listarAnexosCabecera,
    listarAudios,
    obtenerAudioBlob,
    obtenerRespuestas,
    subirAudio,
    validarPersonal
} from "src/services/ficha-record.service";
import { executeDynamicHttp } from "src/services/ficha-dynamic-http.service";
import FichaFilters from "src/components/ficha/FichaFilters.vue";
import FichaPrimaryActions from "src/components/ficha/FichaPrimaryActions.vue";
import FichaTable from "src/components/ficha/FichaTable.vue";
import FichaCenterSelectorDialog from "src/components/ficha/FichaCenterSelectorDialog.vue";
import FichaHttpSearchDialog from "src/components/ficha/FichaHttpSearchDialog.vue";

export default {

    name: 'FichaDynamicEditor',

    components: {
        FichaFilters,
        FichaPrimaryActions,
        FichaTable,
        FichaCenterSelectorDialog,
        FichaHttpSearchDialog
    },

    props: {
        pageConfig: {
            type: Object,
            default: () => ({})
        }
    },

    data() {
        return {

            dialog: false,
            dialogHttpPregunta: false,
            loading: false,
            preguntaHttpActiva: null,
            formHttpPregunta: {},
            loadingHttpPregunta: false,
            preguntasRaw: [],
            seccionAbierta: null,
            fichaFooterPosicion: { x: null, y: null },
            fichaFooterArrastre: {
                activo: false,
                offsetX: 0,
                offsetY: 0
            },
            loadingUnidades: false,
            loadingServicios: false,
            loadingAnexos: false,
            loadingResultados: false,
            //  modoVisualizacion: false,
            modo: null, // 'nuevo' | 'editar' | 'ver'
            codigoNNAFicha: '',
            responsables: [],
            responsableSeleccionado: null,
            trabajadoresCentro: [],
            periodoSeleccionado: null,
            periodos: [
                { id: '1', nombrePeriodo: 'I' },
                { id: '2', nombrePeriodo: 'II' },
                { id: '3', nombrePeriodo: 'III' },
            ],
            anioSeleccionado: null,
            anios: [
                ...Array.from(
                    { length: Math.max(new Date().getFullYear() - 2026 + 1, 0) },
                    (_, indice) => {
                        const anio = String(2026 + indice);
                        return { id: anio, anio };
                    }
                ),
                { id: 'TODOS', anio: 'TODOS' }
            ],
            modoSupervision: null,
            modalidades: [
                { id: 'PRESENCIAL', modo: 'PRESENCIAL' },
                { id: 'NO PRESENCIAL', modo: 'NO PRESENCIAL' },
            ],
            acreVigente: null,
            fechaAcreditacion: null,
            acreditaciones: [
                { id: '1', acreditacion: 'SI' },
                { id: '0', acreditacion: 'NO' },
            ],
            tipoFicha: null,
            tipos: [
                { id: 'PROGRAMADA', nombreTipo: 'PROGRAMADA' },
                { id: 'INOPINADA', nombreTipo: 'INOPINADA' }
            ],
            estadosMap: {
                1: { label: 'EN REGISTRO', color: 'positive', textColor: 'white', icon: 'check_circle' },
                2: { label: 'SUSCRITO', color: 'info', textColor: 'white', icon: 'verified' },
                0: { label: 'ANULADO',    color: 'negative', textColor: 'white', icon: 'cancel' }
            },
            esSumable: true,
            form: {

                idUnidad: null,
                nombreUnidad: '',

                idServicio: null,
                nombreServicio: '',

                idAnexo: null,
                nombreAnexo: '',
                codigoAnexo2: '',
                fechaRegistro: null,
                codigoServicio: '',
                direccion: '',
                telefono: '',
                responsable: '',
                capacidad: null,

                idCentro: null,
                nombreCentro: '',
                departamento: '',
                provincia: '',
                distrito: '',
                respSupervision: '',
                respDirector: '',
                tipoCentro: '',
                idRespSupervision: null,
                idDirector: null,
                idsSupervisados: [],
                reqDirector: 0,
                reqSupervisados: 1,
                reqObligatoriedad: 1

            },
            // MODELOS
            unidadSeleccionada: null,
            servicioSeleccionado: null,
            centroSeleccionado: null,
            anexoSeleccionado: null,

            // LISTAS COMPLETAS
            unidades: [],

            servicios: [],

            centros: [],

            anexos: [],
            resultados: [],
            secciones: [],
            sincronizandoValoresDefaultBifurcaciones: false,
            sincronizacionDefaultBifurcacionesPendiente: false,
            sincronizandoValoresDefault: false,
            sincronizacionDefaultPendiente: false,

            loadingTabla: false,
            filtroTabla: "",

            dataTableAnexos: [],
            anexosRaw: [],

            columnasTableAnexos: [
                {
                    name: "correlativoFormateado",
                    label: "N°",
                    field: "correlativoFormateado",
                    align: "center",
                    sortable: true,
                    sort: (a, b, rowA, rowB) => Number(rowA.correlativo || 0) - Number(rowB.correlativo || 0),
                    style: "width: 80px; min-width: 80px; max-width: 80px;",
                    classes: "ellipsis-cell"
                },
                {
                    name: "nombreCompleto",
                    label: "APELLIDOS Y NOMBRES",
                    field: "nombreCompleto",
                    align: "left",
                    sortable: true,
                    style: "width: 280px; min-width: 280px;",
                    classes: "ellipsis-cell"
                },
                {
                    name: "edad",
                    label: "EDAD",
                    field: "edad",
                    align: "center",
                    sortable: true,
                    sort: (a, b) => Number(a || 0) - Number(b || 0),
                    style: "width: 90px; min-width: 90px; max-width: 90px;",
                    classes: "ellipsis-cell"
                },
                {
                    name: "genero",
                    label: "SEXO",
                    field: "genero",
                    align: "center",
                    sortable: true,
                    style: "width: 120px; min-width: 120px; max-width: 120px;",
                    classes: "ellipsis-cell"
                },
                {
                    name: "nombreCentro",
                    label: "ZONA INTERVENCIÓN",
                    field: "nombreCentro",
                    align: "left",
                    sortable: true,
                    style: "width: 180px; min-width: 180px;",
                    classes: "ellipsis-cell"
                },
                {
                    name: "fechaIngresoFormateada",
                    label: "FECHA INGRESO",
                    field: "fechaIngresoFormateada",
                    align: "center",
                    sortable: true,
                    sort: (a, b, rowA, rowB) => String(rowA.fechaIngreso || '').localeCompare(String(rowB.fechaIngreso || '')),
                    style: "width: 130px; min-width: 130px; max-width: 130px;",
                    classes: "ellipsis-cell"
                },
                {
                    name: "fechaAbordajeFormateada",
                    label: "FECHA DE ABORDAJE",
                    field: "fechaAbordajeFormateada",
                    align: "center",
                    sortable: true,
                    sort: (a, b, rowA, rowB) => String(rowA.fechaAbordaje || '').localeCompare(String(rowB.fechaAbordaje || '')),
                    style: "width: 150px; min-width: 150px; max-width: 150px;",
                    classes: "ellipsis-cell"
                },
                {
                    name: "estado",
                    label: "ESTADO",
                    field: "estado",
                    align: "center",
                    sortable: true,
                    sort: (a, b) => {
                        const map = { 1: 'EN REGISTRO', 2: 'SUSCRITO', 0: 'ANULADO' };
                        return (map[a] || '').localeCompare(map[b] || '');
                    },
                    style: "width: 130px; min-width: 130px; max-width: 130px;"
                },
                {
                    name: "acciones",
                    label: "ACCIONES",
                    field: "acciones",
                    align: "center",
                    style: "width: 80px; min-width: 80px; max-width: 80px;"
                }
            ],
            dialogCentros: false,
            loadingCentros: false,
            centroNombre: "",

            dialogSupervisados: false,
            selectedSupervisados: [],
            filtroSupervisados: "",

            columnasSupervisados: [
                {
                    name: "nro",
                    label: "N°",
                    field: "nro",
                    align: "center",
                    sortable: false,
                    style: "width: 50px;"
                },
                {
                    name: "nombre",
                    label: "NOMBRE",
                    field: "nombre",
                    align: "left",
                    sortable: true
                }
            ],

            columnasCentros: [
                {
                    name: "nombreUnidad",
                    label: "ESPACIO INTERVENCIÓN",
                    field: "nombreUnidad",
                    align: "left",
                    sortable: true
                },
                {
                    name: "departamento",
                    label: "DEPARTAMENTO",
                    field: "departamento",
                    align: "left",
                    sortable: true
                },
                {
                    name: "provincia",
                    label: "PROVINCIA",
                    field: "provincia",
                    align: "left",
                    sortable: true
                },
                {
                    name: "distrito",
                    label: "DISTRITO",
                    field: "distrito",
                    align: "left",
                    sortable: true
                },
                {
                    name: "accion",
                    label: "ACCIÓN",
                    field: "accion",
                    align: "center"
                }
            ],
            dialogValidarFicha: false,
            fichaAValidar: null,
            personalValidacion: [],
            dialogErroresInline: false,
            erroresInline: [],
            dialogPendientesGuardado: false,
            guardandoConPendientes: false,
            pendientesGuardado: [],
            dialogPendientesCierre: false,
            dialogConfirmarCierreFicha: false,
            cerrandoFicha: false,
            pendientesCierre: [],
            columnasValidacion: [
                {
                    name: "nro",
                    label: "N°",
                    field: "nro",
                    align: "center",
                    sortable: false,
                    style: "width: 50px;"
                },
                {
                    name: "nombre",
                    label: "PERSONAL (NOMBRES)",
                    field: "nombre",
                    align: "left",
                    sortable: true
                },
                {
                    name: "validar",
                    label: "VALIDAR",
                    field: "validar",
                    align: "center",
                    style: "width: 280px;"
                }
            ],
            validandoConformidad: false,
            loadingCargarPersonal: false,
            validacionReseteadaEnEdicion: false,
            mostrarInputValidar: {},
            mostrarContrasenaValidar: {},

            dialogAudios: false,
            audioRow: null,
            audiosList: [],
            loadingAudios: false,
            generandoCompromiso: false,
            audioFile: null,
            fechaInscripcion: null,
            fichaPeriodo: null,
            fichaTipo: null,
            alertaReglasTimer: null,
            alertaReglasActiva: false,
            alertaReglasDialog: null,
            alertasReglasCanceladas: false,
            indiceAlertaReglas: 0,
            columnasAudios: [
                { name: "nro", label: "N°", field: "nro", align: "center", sortable: false, style: "width: 50px;" },
                { name: "nombreArchivo", label: "NOMBRE DE ARCHIVO", field: "nombreArchivo", align: "left", sortable: true },
                { name: "acciones", label: "ACCIONES", field: "acciones", align: "center", style: "width: 200px;" }
            ]

        }
    },
    methods: {

        agruparPendientesPorSeccion(pendientes = []) {
            return pendientes.reduce((grupos, item) => {
                let grupo = grupos.find(entry => entry.seccion === item.seccion);
                if (!grupo) {
                    grupo = {
                        seccion: item.seccion,
                        items: []
                    };
                    grupos.push(grupo);
                }

                grupo.items.push(item);
                return grupos;
            }, []);
        },

        mostrarAccionPrincipal(accion) {
            return this.accionesPrincipalesConfiguradas[accion] !== false;
        },

        mostrarAccionTabla(accion) {
            return this.accionesTablaConfiguradas[accion] !== false;
        },

        resetFooterFichaFlotante() {
            this.fichaFooterPosicion = { x: null, y: null };
            this.fichaFooterArrastre = {
                activo: false,
                offsetX: 0,
                offsetY: 0
            };
            this.removerEventosArrastreFooterFicha();
        },
        obtenerPuntoArrastreFooterFicha(event) {
            const touch = event.touches && event.touches[0]
                ? event.touches[0]
                : event.changedTouches && event.changedTouches[0]
                    ? event.changedTouches[0]
                    : event;
            return {
                x: touch.clientX,
                y: touch.clientY
            };
        },
        limitarPosicionFooterFicha(x, y) {
            const wrapper = this.$refs.fichaScrollWrapper;
            const footer = this.$refs.fichaFooter && this.$refs.fichaFooter.$el
                ? this.$refs.fichaFooter.$el
                : this.$refs.fichaFooter;
            if (!wrapper || !footer) return { x, y };

            const margen = 12;
            const maxX = Math.max(margen, wrapper.clientWidth - footer.offsetWidth - margen);
            const maxY = Math.max(margen, wrapper.clientHeight - footer.offsetHeight - margen);

            return {
                x: Math.min(Math.max(x, margen), maxX),
                y: Math.min(Math.max(y, margen), maxY)
            };
        },
        iniciarArrastreFooterFicha(event) {
            if (!this.$q.screen.lt.md) return;

            const wrapper = this.$refs.fichaScrollWrapper;
            const footer = this.$refs.fichaFooter && this.$refs.fichaFooter.$el
                ? this.$refs.fichaFooter.$el
                : this.$refs.fichaFooter;
            if (!wrapper || !footer) return;

            const punto = this.obtenerPuntoArrastreFooterFicha(event);
            const wrapperRect = wrapper.getBoundingClientRect();
            const footerRect = footer.getBoundingClientRect();
            const xActual = footerRect.left - wrapperRect.left;
            const yActual = footerRect.top - wrapperRect.top;

            this.fichaFooterPosicion = this.limitarPosicionFooterFicha(xActual, yActual);
            this.fichaFooterArrastre = {
                activo: true,
                offsetX: punto.x - footerRect.left,
                offsetY: punto.y - footerRect.top
            };

            document.addEventListener("mousemove", this.moverFooterFichaFlotante);
            document.addEventListener("mouseup", this.finalizarArrastreFooterFicha);
            document.addEventListener("touchmove", this.moverFooterFichaFlotante, { passive: false });
            document.addEventListener("touchend", this.finalizarArrastreFooterFicha);
            document.addEventListener("touchcancel", this.finalizarArrastreFooterFicha);
        },
        moverFooterFichaFlotante(event) {
            if (!this.fichaFooterArrastre.activo) return;
            if (event.cancelable) event.preventDefault();

            const wrapper = this.$refs.fichaScrollWrapper;
            if (!wrapper) return;

            const punto = this.obtenerPuntoArrastreFooterFicha(event);
            const wrapperRect = wrapper.getBoundingClientRect();
            const x = punto.x - wrapperRect.left - this.fichaFooterArrastre.offsetX;
            const y = punto.y - wrapperRect.top - this.fichaFooterArrastre.offsetY;

            this.fichaFooterPosicion = this.limitarPosicionFooterFicha(x, y);
        },
        finalizarArrastreFooterFicha() {
            this.fichaFooterArrastre.activo = false;
            this.removerEventosArrastreFooterFicha();
        },
        removerEventosArrastreFooterFicha() {
            document.removeEventListener("mousemove", this.moverFooterFichaFlotante);
            document.removeEventListener("mouseup", this.finalizarArrastreFooterFicha);
            document.removeEventListener("touchmove", this.moverFooterFichaFlotante);
            document.removeEventListener("touchend", this.finalizarArrastreFooterFicha);
            document.removeEventListener("touchcancel", this.finalizarArrastreFooterFicha);
        },
        puedeEditar(row) {
            return row && row.estado !== 2;
        },
        puedeMostrarSupervisados(reqSupervisados) {
            return Number(reqSupervisados) === 1;
        },
        puedeMostrarDirector(reqDirector) {
            return Number(reqDirector) === 1;
        },
        puedeValidarFicha(row) {
            return Number(row?.reqValidacion) === 1;
        },
        normalizarIdResponsable(value) {
            if (value === null || value === undefined) return null;
            const texto = String(value).trim();
            if (!texto || texto === "0") return null;
            const numero = Number(texto);
            if (!Number.isFinite(numero) || numero <= 0) return null;
            return numero;
        },
        getResponsableSupervisionDisplay() {
            const id = this.normalizarIdResponsable(this.form.idRespSupervision);
            if (id === null) return "";
            const responsable = this.responsables.find(
                r => this.normalizarIdResponsable(r.idPersonal) === id
            );
            return responsable ? responsable.nombre : "";
        },
        resolverDirectorCentro(centro) {
            if (!centro) {
                return { respDirector: "", idDirector: null };
            }

            return {
                respDirector: String(centro.respDirector || "").trim(),
                idDirector: this.normalizarIdResponsable(centro.idPersonal)
            };
        },
        esFichaSuscrita(row) {
            return !!row && Number(row.estado) === 2;
        },
        formatearFechaHoraValidacion(fecha = new Date()) {
            const pad = n => String(n).padStart(2, "0");
            const dia = pad(fecha.getDate());
            const mes = pad(fecha.getMonth() + 1);
            const anio = fecha.getFullYear();
            const hora = pad(fecha.getHours());
            const minuto = pad(fecha.getMinutes());
            const segundo = pad(fecha.getSeconds());
            return `${dia}/${mes}/${anio}T${hora}:${minuto}:${segundo}`;
        },
        formatearFechaTabla(valor) {
            if (!valor) return '-';
            const texto = String(valor).trim();
            const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (!match) return '-';
            return `${match[3]}-${match[2]}-${match[1]}`;
        },
        formatearFechaIso(valor) {
            if (!valor) return '';
            const texto = String(valor).trim();
            const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
            return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
        },
        normalizarNombreValidacion(nombre) {
            if (nombre === null || nombre === undefined) return "";
            return String(nombre)
                .replace(/[|,]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        },
        normalizarCargoValidacion(cargo) {
            if (cargo === null || cargo === undefined) return "";
            return String(cargo)
                .replace(/[|,]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        },
        construirIdPersonalValidacion(item) {
            const id = String(item?.idPersonal ?? "").trim();
            const nombre = this.normalizarNombreValidacion(item?.nombre);
            const cargo = this.normalizarCargoValidacion(item?.cargo);
            const fechaHora = this.formatearFechaHoraValidacion();
            return `${id},${nombre},${cargo},${fechaHora}`;
        },
        extraerIdPersonalValida(valor) {
            const texto = String(valor ?? "").trim();
            if (!texto) return "";
            const limpio = texto.replace(/^["']|["']$/g, "").trim();
            const posComa = limpio.indexOf(",");
            if (posComa === -1) return limpio;
            const id = limpio.slice(0, posComa).trim();
            return id || limpio;
        },
        normalizarListaIds(valor) {
            if (valor === null || valor === undefined) return [];
            let valores = [];

            if (Array.isArray(valor)) {
                valores = valor;
            } else {
                let texto = String(valor).trim();
                if (!texto) return [];

                texto = texto
                    .replace(/^\[|\]$/g, "")
                    .replace(/["']/g, "");

                const esRegistroExtendidoUnico = /^\d+\s*,/.test(texto) &&
                    /\d{2}\/\d{2}\/\d{4}[T ]\d{2}:\d{2}:\d{2}$/.test(texto);

                if (texto.includes("|")) {
                    valores = texto.split("|");
                } else if (texto.includes(";")) {
                    valores = texto.split(";");
                } else if (esRegistroExtendidoUnico) {
                    valores = [texto];
                } else {
                    valores = texto.split(",");
                }
            }

            return Array.from(
                new Set(
                    valores
                        .map(v => this.extraerIdPersonalValida(v))
                        .filter(Boolean)
                )
            );
        },
        async obtenerIdsPersonalValidaPersistidos(idAnexoCabecera, correlativo) {
            const res = await obtenerRespuestas(this.$axios, idAnexoCabecera, correlativo);

            const detalleData = res.data?.data || res.data || null;
            const idsPersonalValida = this.normalizarListaIds(
                detalleData?.idsPersonalValida
            );

            return { detalleData, idsPersonalValida };
        },

        getOptionImage(pregunta, optOrIndex) {
            if (!pregunta || !pregunta.idPregunta || !pregunta.opciones) return null;
            let indexItem;
            if (typeof optOrIndex === 'number') {
                indexItem = optOrIndex;
            } else if (optOrIndex && optOrIndex.value !== undefined) {
                indexItem = pregunta.opciones.findIndex(o => o.value === optOrIndex.value) + 1;
            } else {
                return null;
            }
            if (indexItem <= 0) return null;
            const key = `${pregunta.idPregunta}-${indexItem}`;
            return IMAGE_MAP[key] || null;
        },

        async editarRegistro(row) {
            if (!this.puedeEditar(row)) return;
            this.modo = "editar";
            this.codigoNNAFicha = row.codigoNNA ? String(row.codigoNNA).toUpperCase() : '';
            try {
                this.validacionReseteadaEnEdicion = false;
                this.sincronizarAcreditacionDesdeFuente(row);
                // Llenamos el form con los datos de la fila seleccionada
                this.form.idAnexoCabecera = row.idAnexoCabecera;
                this.form.idAnexo = row.idAnexo;
                this.form.idUnidad = row.idUnidad;
                this.form.idCentro = row.idCentro;
                this.form.correlativo = row.correlativo;

                this.form.nombreAnexo = row.nombreAnexo;
                this.form.codigoAnexo2 = row.codigoAnexo2;
                this.form.nombreUnidad = row.nombreUnidad;
                this.form.nombreCentro = row.nombreCentro;
                await this.precargarTrabajadoresCentro();
                this.form.idRespSupervision = this.normalizarIdResponsable(row.idRespSupervision);
                this.form.reqSupervisados = Number(row?.reqSupervisados ?? 0);
                this.form.reqDirector = Number(row?.reqDirector ?? 0);
                if (this.puedeMostrarDirector(this.form.reqDirector)) {
                    this.form.respDirector = row.respDirector;
                    this.form.idDirector = this.normalizarIdResponsable(row.idDirector ?? row.idPersonal);
                } else {
                    this.form.respDirector = '';
                    this.form.idDirector = null;
                }
                if (this.puedeMostrarSupervisados(this.form.reqSupervisados)) {
                    this.form.idsSupervisados = this.parseIdSupervisado(row.idSupervisado);
                    this.sincronizarOpcionesSupervisados(row.idSupervisado, row.nombreSupervisado);
                } else {
                    this.form.idsSupervisados = [];
                }

                this.form.tipoCentro = row.tipoCentro;
                this.form.reqObligatoriedad = Number(row?.reqObligatoriedad ?? 1);

                this.fichaPeriodo = row.periodo;
                this.seccionAbierta = null;
                this.resetFooterFichaFlotante();
                this.dialog = true;
                this.sincronizarResponsableSesion();
                await this.cargarRespuestas();

            } catch (error) {
                this.$q.notify({ type: "negative", message: "Error al cargar registro para editar" });
            }
        },

        async verRegistro(row) {
            this.modo = "ver";
            this.codigoNNAFicha = row.codigoNNA ? String(row.codigoNNA).toUpperCase() : '';
            try {
                this.sincronizarAcreditacionDesdeFuente(row);

                this.form.idAnexoCabecera = row.idAnexoCabecera;
                this.form.idAnexo = row.idAnexo;
                this.form.idUnidad = row.idUnidad;
                this.form.idCentro = row.idCentro;
                this.form.correlativo = row.correlativo;

                this.form.nombreAnexo = row.nombreAnexo;
                this.form.codigoAnexo2 = row.codigoAnexo2;
                this.form.nombreUnidad = row.nombreUnidad;
                this.form.nombreCentro = row.nombreCentro;
                await this.precargarTrabajadoresCentro();
                this.form.idRespSupervision = this.normalizarIdResponsable(row.idRespSupervision);
                this.form.reqSupervisados = Number(row?.reqSupervisados ?? 0);
                this.form.reqDirector = Number(row?.reqDirector ?? 0);
                if (this.puedeMostrarDirector(this.form.reqDirector)) {
                    this.form.respDirector = row.respDirector;
                    this.form.idDirector = this.normalizarIdResponsable(row.idDirector ?? row.idPersonal);
                } else {
                    this.form.respDirector = '';
                    this.form.idDirector = null;
                }
                if (this.puedeMostrarSupervisados(this.form.reqSupervisados)) {
                    this.form.idsSupervisados = this.parseIdSupervisado(row.idSupervisado);
                    this.sincronizarOpcionesSupervisados(row.idSupervisado, row.nombreSupervisado);
                } else {
                    this.form.idsSupervisados = [];
                }
                this.form.tipoCentro = row.tipoCentro;

                this.fichaPeriodo = row.periodo;
                this.seccionAbierta = null;

                this.resetFooterFichaFlotante();
                this.dialog = true;

                await this.cargarRespuestas();
                if (this.conformidadSoloLecturaEnVer) {
                    this.audioRow = row;
                    await this.cargarAudios();
                }

            } catch (error) {
                this.$q.notify({ type: "negative", message: "Error al visualizar registro" });
            }
        },

        eliminarRegistro(row) {
            if (!row || !row.idAnexoCabecera) return;

            this.$q.dialog({
                title: "ANULAR FICHA",
                message: `¿Anular la ficha <strong>${row.nombreAnexo || ''}</strong>?`,
                html: true,
                cancel: true,
                persistent: true,
                class: "audio-delete-dialog dialog-mensaje",
                focus: "cancel",
                ok: {
                    label: "Anular",
                    icon: "delete",
                    color: "negative",
                    unelevated: true
                },
                cancel: {
                    label: "Cancelar",
                    icon: "close",
                    color: "grey-5",
                    textColor: "dark",
                    unelevated: true
                }
            }).onOk(async () => {
                try {
                    await anularFicha(this.$axios, row.idAnexoCabecera);

                    this.$q.notify({
                        type: "positive",
                        message: "Ficha anulada correctamente"
                    });

                    await this.cargarTablaAnexos();
                } catch (error) {
                    this.$q.notify({
                        type: "negative",
                        message: "Error al anular la ficha"
                    });
                }
            });
        },

        leerLocalStorageSesion(key) {
            const valorQuasar = this.$q.localStorage.getItem(key);
            if (valorQuasar !== null && valorQuasar !== undefined) return valorQuasar;
            const raw = window.localStorage.getItem(key);
            if (!raw) return null;
            return String(raw).replace(/^__q_\w+\|/, '');
        },
        obtenerNombreCompletoSesion() {
            return normalizeTextSpacing(String(this.leerLocalStorageSesion('sgs-nombreCompleto') || '').trim());
        },
        obtenerIdPersonalSesion() {
            return this.normalizarIdResponsable(this.leerLocalStorageSesion('sgs-idPersonal'));
        },
        obtenerIdUsuarioSesion() {
            const valor = this.leerLocalStorageSesion('sgs-idUsuario');
            const numero = Number(valor);
            return Number.isFinite(numero) ? numero : null;
        },
        sincronizarResponsableSesion() {
            const idPersonal = this.obtenerIdPersonalSesion();
            const nombreCompleto = this.obtenerNombreCompletoSesion();
            if (idPersonal !== null) {
                this.form.idRespSupervision = idPersonal;
            }
            if (nombreCompleto) {
                this.form.respSupervision = nombreCompleto;
            }
        },
        normalizarTextoComparacion(value) {
            return questionEngine.normalizeComparisonText(value);
        },
        getRefValue(refName) {
            const ref = this.normalizarTextoComparacion(refName);
            const centroNombre = this.form.nombreCentro || this.centroSeleccionado?.nombreUnidad || '';
            const centroId = this.form.idCentro || this.centroSeleccionado?.idUnidadOrganica || null;
            const periodo = this.fichaPeriodo || this.anioSeleccionado || '';
            const responsableNombre = this.form.respSupervision || this.obtenerNombreCompletoSesion() || '';
            const responsableId = this.normalizarIdResponsable(this.form.idRespSupervision) || this.obtenerIdPersonalSesion();
            const centroUbigeo = [this.form.departamento, this.form.provincia, this.form.distrito]
                .filter(Boolean)
                .join(' / ');
            const hoy = new Date();
            const getDate = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

            const refs = {
                PERIODO: periodo,
                CENTRONOMBRE: centroNombre,
                IDCENTRO: centroId,
                CENTRODEP: this.form.departamento || '',
                CENTRODEPARTAMENTO: this.form.departamento || '',
                CENTROPROV: this.form.provincia || '',
                CENTROPROVINCIA: this.form.provincia || '',
                CENTRODIST: this.form.distrito || '',
                CENTRODISTRITO: this.form.distrito || '',
                CENTROUBIGEO: centroUbigeo,
                UNIDADNOMBRE: this.form.nombreUnidad || '',
                SERVNOMBRE: this.form.nombreServicio || '',
                SERVICIONOMBRE: this.form.nombreServicio || '',
                RESPID: responsableId,
                RESPNOMBRE: responsableNombre,
                GETDATE: getDate
            };

            return refs[ref] !== undefined ? refs[ref] : '';
        },
        parseJsonFlexible(value) {
            return questionEngine.parseJsonFlexible(value);
        },
        resolverPropiedadCaseInsensitive(obj, key) {
            return questionEngine.getCaseInsensitiveProperty(obj, key);
        },
        esHttpParamsWildcard(httpParams) {
            return questionEngine.isHttpParamsWildcard(httpParams);
        },
        parseOpciones(opciones) {
            return questionEngine.parseOptions(opciones);
        },
        normalizarHttpParams(httpParams) {
            return questionEngine.normalizeHttpParams(httpParams);
        },
        normalizarReglaEditable(editable) {
            return questionEngine.normalizeEditableRule(editable);
        },
        normalizarEditableBifurcaciones(editableBifurcaciones) {
            return questionEngine.normalizeEditableBranches(editableBifurcaciones);
        },
        obtenerValorLabelHttp(opciones) {
            return questionEngine.getHttpLabelField(opciones);
        },
        normalizarRamificacionesInputSearch(opciones) {
            return questionEngine.normalizeInputSearchBranches(opciones);
        },
        normalizarRamificacionesSelect(opciones) {
            return questionEngine.normalizeSelectBranches(opciones);
        },
        esVistaSummaryRow(pregunta) {
            return questionEngine.isSummaryRowView(pregunta);
        },
        esVistaBranched(pregunta) {
            return questionEngine.isBranchedView(pregunta);
        },
        normalizarAnchoControl(valor) {
            if (valor === null || valor === undefined) return null;

            const texto = String(valor).trim();
            if (!texto || texto.toUpperCase() === 'NULL') return null;

            if (/^\d+(\.\d+)?$/.test(texto)) {
                return `${texto}px`;
            }

            return texto;
        },
        buildControlWidthStyle(valor, { forSummary = false } = {}) {
            if (this.$q && this.$q.screen && this.$q.screen.lt && this.$q.screen.lt.md) {
                return {
                    width: '100%',
                    maxWidth: '100%'
                };
            }

            const ancho = this.normalizarAnchoControl(valor);
            if (!ancho) return null;

            return {
                width: ancho,
                maxWidth: forSummary ? ancho : ancho
            };
        },
        getBranchedSelectDisplayOptions(rama) {
            const options = Array.isArray(rama && rama.options) ? [...rama.options] : [];
            const value = rama ? rama.value : null;

            if (value === null || value === undefined || value === '') {
                return options;
            }

            const existe = options.some(item => item && item.value === value);
            if (existe) return options;

            options.push({
                label: value,
                value
            });

            return options;
        },
        getBranchedSelectDisplayValue(rama) {
            return !rama || rama.value === null || rama.value === undefined || rama.value === ''
                ? null
                : rama.value;
        },
        getPreguntaControlStyle(pregunta) {
            return this.buildControlWidthStyle(pregunta?.lng, {
                forSummary: this.esVistaSummaryRow(pregunta)
            });
        },
        getBifurcacionControlStyle(pregunta) {
            return this.buildControlWidthStyle(pregunta?.lngBifurcacion);
        },
        getPregunta2ControlStyle(pregunta) {
            return this.buildControlWidthStyle(pregunta?.lng, {
                forSummary: this.esVistaSummaryRow(pregunta)
            });
        },
        esPreguntaBranchedInputSearch(pregunta) {
            return questionEngine.isBranchedInputSearch(pregunta);
        },
        esPreguntaBranchedSelects(pregunta) {
            return questionEngine.isBranchedSelects(pregunta);
        },
        esPreguntaSelectHttpSimple(pregunta) {
            return questionEngine.isSimpleHttpSelect(pregunta);
        },
        esPreguntaRedirected(pregunta) {
            return questionEngine.isRedirected(pregunta);
        },
        esPreguntaAge(pregunta) {
            return questionEngine.isAgeQuestion(pregunta);
        },
        esPreguntaTextualPrincipal(pregunta) {
            const tipo = String(pregunta?.tipoControl || '').toLowerCase();
            return !this.esVistaBranched(pregunta) && (tipo === 'text' || tipo === 'textarea');
        },
        esPreguntaConRangoLongitudPrincipal(pregunta) {
            const tipo = String(pregunta?.tipoControl || '').toLowerCase();
            return !this.esVistaBranched(pregunta) && (tipo === 'text' || tipo === 'textarea' || tipo === 'number');
        },
        getRangoLongitudPregunta(pregunta) {
            if (!this.esPreguntaConRangoLongitudPrincipal(pregunta) || pregunta?.rangoLongitud === null || pregunta?.rangoLongitud === undefined) {
                return null;
            }

            const parseado = this.parseJsonFlexible(pregunta.rangoLongitud);
            if (!parseado || typeof parseado !== 'object') return null;

            const minRaw = this.resolverPropiedadCaseInsensitive(parseado, 'min');
            const maxRaw = this.resolverPropiedadCaseInsensitive(parseado, 'max');
            const min = Number(minRaw);
            const max = Number(maxRaw);

            return {
                min: Number.isFinite(min) && min >= 0 ? min : null,
                max: Number.isFinite(max) && max >= 0 ? max : null
            };
        },
        usaReqAlfNum(pregunta) {
            return this.esPreguntaTextualPrincipal(pregunta) && Number(pregunta?.reqAlfNum) === 1;
        },
        debeMostrarContadorPregunta(pregunta) {
            return this.esPreguntaTextualPrincipal(pregunta) && Number(pregunta?.reqContador) === 1;
        },
        getLongitudTextoPregunta(pregunta) {
            const valor = this.obtenerValorTextoPregunta(pregunta);
            return valor === null || valor === undefined ? 0 : String(valor).length;
        },
        getContadorTextoPregunta(pregunta) {
            const rango = this.getRangoLongitudPregunta(pregunta);
            const max = rango && rango.max !== null ? rango.max : 0;
            return `${this.getLongitudTextoPregunta(pregunta)}/${max}`;
        },
        getPreguntaMaxLength(pregunta) {
            const rango = this.getRangoLongitudPregunta(pregunta);
            return rango && rango.max !== null ? rango.max : null;
        },
        tieneErrorLongitudPregunta(pregunta) {
            return !!this.getMensajeErrorLongitudPregunta(pregunta);
        },
        getMensajeErrorLongitudPregunta(pregunta) {
            if (!this.esPreguntaConRangoLongitudPrincipal(pregunta)) return '';

            const rango = this.getRangoLongitudPregunta(pregunta);
            if (!rango) return '';

            const longitud = this.getLongitudTextoPregunta(pregunta);
            if (longitud === 0) return '';
            if (rango.min !== null && longitud < rango.min) return `Min. ${rango.min} car.`;
            if (rango.max !== null && longitud > rango.max) return `Max. ${rango.max} car.`;
            return '';
        },
        sanitizarValorTextoPregunta(pregunta, value) {
            let valorTexto = value === null || value === undefined ? '' : String(value);

            if (this.usaTipoNumero(pregunta)) {
                valorTexto = valorTexto.replace(/\D/g, '');
            } else if (this.usaReqAlfNum(pregunta)) {
                valorTexto = valorTexto.replace(/[^0-9A-Za-zÁÉÍÓÚáéíóúÑñÜü]/g, '');
            }

            const rango = this.getRangoLongitudPregunta(pregunta);
            if (rango && rango.max !== null) {
                valorTexto = valorTexto.slice(0, rango.max);
            }

            return valorTexto;
        },
        manejarKeydownRespuestaTextoPregunta(pregunta, event) {
            if (!this.esPreguntaConRangoLongitudPrincipal(pregunta) || this.esCampoSoloLectura(pregunta)) return;

            if (event.ctrlKey || event.metaKey || event.altKey) return;

            const teclasPermitidas = [
                'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
            ];
            if (teclasPermitidas.includes(event.key)) return;

            const valorActual = this.obtenerValorTextoPregunta(pregunta);
            const longitudActual = valorActual === null || valorActual === undefined ? 0 : String(valorActual).length;
            const rango = this.getRangoLongitudPregunta(pregunta);

            if (this.usaTipoNumero(pregunta)) {
                if (!/^\d$/.test(event.key)) {
                    event.preventDefault();
                    return;
                }
            } else if (this.usaReqAlfNum(pregunta) && !/^[0-9A-Za-zÁÉÍÓÚáéíóúÑñÜü]$/.test(event.key)) {
                event.preventDefault();
                return;
            }

            const tieneSeleccion = event.target
                && typeof event.target.selectionStart === 'number'
                && typeof event.target.selectionEnd === 'number'
                && event.target.selectionStart !== event.target.selectionEnd;

            if (rango && rango.max !== null && longitudActual >= rango.max && !tieneSeleccion) {
                event.preventDefault();
            }
        },
        manejarPasteRespuestaTextoPregunta(pregunta, event) {
            if (!this.esPreguntaConRangoLongitudPrincipal(pregunta) || this.esCampoSoloLectura(pregunta)) return;

            const clipboard = event.clipboardData || window.clipboardData;
            if (!clipboard) return;

            event.preventDefault();

            const pegado = clipboard.getData('text') || '';
            const actual = this.obtenerValorTextoPregunta(pregunta);
            const valor = `${actual === null || actual === undefined ? '' : String(actual)}${pegado}`;
            this.actualizarRespuestaTextoPregunta(pregunta, valor);
        },
        inicializarRespuesta2Pregunta(pregunta, respuesta2) {
            if (respuesta2 !== undefined && respuesta2 !== null) return respuesta2;
            switch (pregunta.tipoControl2) {
                case 'text':
                    return '';
                case 'selectM':
                    return [];
                default:
                    return null;
            }
        },
        normalizarRespuestaPregunta(pregunta, respuestaRaw) {
            return questionEngine.normalizeAnswer(pregunta, respuestaRaw);
        },
        construirPreguntaDinamica(preguntaRaw) {
            return questionEngine.buildQuestion(preguntaRaw);
        },
        agruparPreguntasEnSecciones(lista = []) {
            const ordenadas = [...lista].sort((a, b) => (a.numGrupo - b.numGrupo) || (a.numPregunta - b.numPregunta));
            const secciones = [];
            let seccionActual = null;

            ordenadas.forEach(pregunta => {
                if (pregunta.tipoControl === 'cabecera') {
                    if (seccionActual && seccionActual.preguntas.length > 0) {
                        secciones.push(seccionActual);
                    }
                    seccionActual = {
                        titulo: pregunta.pregunta,
                        preguntas: []
                    };
                    return;
                }

                if (!seccionActual) {
                    seccionActual = {
                        titulo: 'GENERAL',
                        preguntas: []
                    };
                }

                seccionActual.preguntas.push(this.construirPreguntaDinamica(pregunta));
            });

            if (seccionActual && seccionActual.preguntas.length > 0) {
                secciones.push(seccionActual);
            }

            return secciones;
        },
        async prepararSeccionesDinamicas(secciones = []) {
            for (const seccion of secciones) {
                for (const pregunta of seccion.preguntas) {
                    await this.prepararPreguntaDinamica(pregunta);
                }
            }
        },
        async prepararPreguntaDinamica(pregunta) {
            if (this.esPreguntaRedirected(pregunta) && this.modo === 'nuevo') {
                pregunta.respuesta = this.getRefValue(pregunta._redirectRef);
            }

            if (this.esPreguntaSelectHttpSimple(pregunta)) {
                await this.cargarOpcionesSelectHttp(pregunta);
            }

            if (this.esPreguntaBranchedSelects(pregunta)) {
                await this.inicializarBranchedSelects(pregunta);
            }
        },
        async cargarRespuestas() {
            if (!this.form.idAnexoCabecera) return;

            this.loading = true;

            try {
                const [catalogoBase, res] = await Promise.all([
                    this.obtenerCatalogoPreguntasBase({
                        anexo: this.form.idAnexo,
                        idServicio: this.form.idServicio
                    }),
                    obtenerRespuestas(this.$axios, this.form.idAnexoCabecera, this.form.correlativo)
                ]);

                const data = res.data?.data;
                if (!data) return;

                this.form.nombreCentro = data.centro || data.nombreCentro || this.form.nombreCentro;
                this.form.correlativo = data.correlativo;
                this.form.nombreAnexo = data.nombreAnexo;
                this.form.nombreUnidad = data.nombreUnidad;
                this.form.fechaAplicacion = data.fechaAplicacion;
                this.form.departamento = data.departamento || this.form.departamento;
                this.form.provincia = data.provincia || this.form.provincia;
                this.form.distrito = data.distrito || this.form.distrito;
                this.form.nombreServicio = data.nombreServicio;
                this.form.fechaRegistro = data.fechaRegistro || this.form.fechaRegistro;
                this.form.audioUrl = data.audioUrl;
                this.form.reqDirector = Number(data.reqDirector ?? this.form.reqDirector ?? 0);
                this.form.reqObligatoriedad = Number(data.reqObligatoriedad ?? 1);
                this.form.idDirector = this.normalizarIdResponsable(data.idDirector ?? this.form.idDirector);
                this.form.idsSupervisados = this.parseIdSupervisado(data.idSupervisado);
                this.form.tipoCentro = data.tipoCentro || this.form.tipoCentro;
                this.acreVigente = String(this.normalizarAcreditacionVigenteEntero(data.acreditacionVigente ?? this.acreVigente));
                this.fechaAcreditacion = this.normalizarFechaAcreditacionISO(data.fechaAcreditacion ?? this.fechaAcreditacion);

                const preguntasCompletas = this.mezclarCatalogoConRespuestasPersistidas(catalogoBase, data.respuestas || []);
                this.preguntasRaw = preguntasCompletas;
                const secciones = this.agruparPreguntasEnSecciones(preguntasCompletas);
                await this.prepararSeccionesDinamicas(secciones);
                this.secciones = secciones;
                this.sincronizarResponsableSesion();
            } catch (error) {
                this.$q.notify({ type: 'negative', message: 'Error al cargar las respuestas' });
            } finally {
                this.loading = false;
            }
        },
        async cargarTablaAnexos() {

            this.loadingTabla = true

            try {

                const res = await listarAnexosCabecera(this.$axios)

                // si tu backend devuelve { data: [...] }
                this.anexosRaw = res.data.data || res.data

            } catch (error) {

                this.$q.notify({
                    type: 'negative',
                    message: 'Error al cargar la tabla'
                })

            } finally {

                this.loadingTabla = false

            }

        },



        formatAnexoLabel(opt) {
            return opt ? `${opt.codigoAnexo2} - ${opt.nombreAnexo}` : '';
        },
        limpiarCentro() {

            this.centroSeleccionado = null
            this.centroNombre = ""

            // si tienes form
            if (this.form) {
                this.form.idCentro = null
                this.form.nombreCentro = null
            }

        },
        async resetearFiltrosPrincipal() {
            this.filtroTabla = "";
            this.anioSeleccionado = null;
            this.autoseleccionarTipoOculto();

            this.limpiarCentro();

            if (!this.unidadSeleccionada && !this.autoseleccionarUnidadOculta()) return;
            if (this.unidadSeleccionada && !this.servicioSeleccionado) await this.cargarServicios();
            if (this.servicioSeleccionado && !this.anexoSeleccionado) await this.cargarAnexos();
            if (this.servicioSeleccionado && this.centros.length === 0) await this.cargarCentros();
        },
        /* ========================================
           ABRIR DIALOG
        ======================================== */
        abrirDialog() {
            this.modo = "nuevo";
            this.seccionAbierta = null;

            this.fichaPeriodo = this.anioSeleccionado;
            this.fichaTipo = this.tipoFicha;
            this.acreVigente = '0';
            this.fechaAcreditacion = null;
            if (
                this.anioSeleccionado === null ||
                this.anioSeleccionado === undefined ||
                this.anioSeleccionado === '' ||
                this.anioSeleccionado === 'TODOS'
            ) {
                this.$q.notify({
                    type: 'warning',
                    message: 'Debe seleccionar un PERIODO válido (distinto de TODOS)'
                })
                return
            }

            if (!this.unidadSeleccionada) {
                this.$q.notify({
                    type: 'warning',
                    message: 'No se pudo resolver la UNIDAD'
                })
                return
            }

            if (!this.servicioSeleccionado) {
                this.$q.notify({
                    type: 'warning',
                    message: 'No se pudo resolver el SERVICIO'
                })
                return
            }

            if (!this.centroSeleccionado) {
                this.$q.notify({
                    type: 'warning',
                    message: 'Debe seleccionar: ESPACIO DE INTERVENCIÓN'
                })
                return
            }

            if (!this.anexoSeleccionado) {
                this.$q.notify({
                    type: 'warning',
                    message: 'No se pudo resolver el INSTRUMENTO'
                })
                return
            }
            // buscar objetos seleccionados
            const unidad = this.unidades.find(
                u => u.idUnidad === this.unidadSeleccionada
            )

            const servicio = this.servicios.find(
                s => s.idServicio === this.servicioSeleccionado
            )

            const anexo = this.anexos.find(
                a => a.idAnexo === this.anexoSeleccionado
            )

            // llenar form
            this.form.idUnidad = unidad?.idUnidad ?? this.unidadSeleccionada
            this.form.nombreUnidad = unidad?.nombreUnidad || ''

            this.form.idServicio = servicio?.idServicio ?? this.servicioSeleccionado
            this.form.nombreServicio = servicio?.nombreServicio || ''

            this.form.idAnexo = anexo?.idAnexo ?? this.anexoSeleccionado
            this.form.nombreAnexo = anexo?.nombreAnexo || ''
            this.form.codigoAnexo2 = anexo?.codigoAnexo2 || ''
            this.form.fechaRegistro = new Date().toISOString().substring(0, 10)
            this.form.idRespSupervision = null
            this.form.respDirector = ""
            this.form.idDirector = null
            this.form.idsSupervisados = []
            this.form.reqDirector = Number(anexo?.reqDirector ?? 0)
            this.form.reqSupervisados = Number(anexo?.reqSupervisados ?? 0)

            if (this.puedeMostrarDirector(this.form.reqDirector)) {
                const directorCentro = this.resolverDirectorCentro(this.centroSeleccionado)
                this.form.respDirector = directorCentro.respDirector
                this.form.idDirector = directorCentro.idDirector
            }

            // Precargar todo el personal del centro
            this.precargarTrabajadoresCentro()
            this.sincronizarResponsableSesion()

            this.resetFooterFichaFlotante()
            this.dialog = true

            this.cargarPreguntas()
        },
        async cargarCentros() {
            if (!this.servicioSeleccionado) {
                this.centros = [];
                return;
            }

                const res = await listarCentros(this.$axios, this.servicioSeleccionado)

            this.centros = res.data
        },
        async abrirDialogCentros() {

            if (!this.puedeSeleccionarEspacioIntervencion) {
                this.$q.notify({
                    type: "warning",
                    message: "No se pudo resolver la unidad y el servicio"
                })
                return
            }

            this.dialogCentros = true

            this.loadingCentros = true

            try {

                const res = await listarCentros(axios, this.servicioSeleccionado)

                this.centros = res.data

            }
            catch (error) {


            }
            finally {
                this.loadingCentros = false
            }

        },
        seleccionarCentro(centro) {

            this.centroSeleccionado = centro
            this.centroNombre = centro.nombreUnidad
            this.form.idCentro = centro.idUnidadOrganica
            this.form.nombreCentro = centro.nombreUnidad
            this.form.tipoCentro = centro.tipoCentro
            this.form.departamento = centro.departamento
            this.form.provincia = centro.provincia
            this.form.distrito = centro.distrito
            if (this.puedeMostrarDirector(this.form.reqDirector)) {
                const directorCentro = this.resolverDirectorCentro(centro);
                this.form.respDirector = directorCentro.respDirector;
                this.form.idDirector = directorCentro.idDirector;
            } else {
                this.form.respDirector = "";
                this.form.idDirector = null;
            }
            this.dialogCentros = false
        },

        /* ========================================
           RESET
        ======================================== */
        resetFormulario() {

            this.form = {
                nombreServicio: "",
                codigoServicio: "",
                direccion: "",
                telefono: "",
                responsable: "",
                capacidad: null,
                audioUrl: '',
                idsSupervisados: [],
                reqDirector: 0,
                reqSupervisados: 1
            };

            this.preguntasAgrupadas = [];

        },
        async cargarPreguntasPorFiltros() {
            if (!this.unidadSeleccionada || !this.servicioSeleccionado || !this.anexoSeleccionado) {
                this.$q.notify({
                    type: "warning",
                    message: "Selecciona Unidad, Servicio y Anexo"
                });
                return;
            }

            this.loading = true;

            try {
                const res = await listarAnexos(this.$axios, this.unidadSeleccionada, this.servicioSeleccionado, this.anexoSeleccionado);

                const data = res.data.data || [];

                // aquí podrías asignarlas a un array propio, por ejemplo:
                this.preguntasFiltradas = data;

            } catch (error) {
                this.$q.notify({
                    type: "negative",
                    message: "Error al cargar preguntas por Unidad, Servicio y Anexo"
                });
            } finally {
                this.loading = false;
            }
        },
        async obtenerCatalogoPreguntasBase({ anexo = null, idServicio = null } = {}) {
            const anexoParam = anexo ?? this.form.idAnexo ?? this.anexoSeleccionado;
            const servicioParam = idServicio ?? this.form.idServicio ?? this.servicioSeleccionado;

            if (!anexoParam || !servicioParam) {
                return [];
            }

            const res = await obtenerCatalogoPreguntas(this.$axios, anexoParam, servicioParam);

            return res.data?.data || [];
        },
        mezclarCatalogoConRespuestasPersistidas(catalogo = [], respuestas = []) {
            const respuestasMap = new Map(
                (Array.isArray(respuestas) ? respuestas : [])
                    .filter(item => item && item.idPregunta !== undefined && item.idPregunta !== null)
                    .map(item => [Number(item.idPregunta), item])
            );

            return (Array.isArray(catalogo) ? catalogo : []).map(preguntaCatalogo => {
                const respuestaPersistida = respuestasMap.get(Number(preguntaCatalogo.idPregunta));
                if (!respuestaPersistida) {
                    return { ...preguntaCatalogo };
                }

                return {
                    ...preguntaCatalogo,
                    respuesta: respuestaPersistida.respuesta,
                    respuesta2: respuestaPersistida.respuesta2,
                    observacion: respuestaPersistida.observacion,
                    puntaje: respuestaPersistida.puntaje
                };
            });
        },

        async cargarPreguntas() {
            this.loading = true;

            try {
                const data = await this.obtenerCatalogoPreguntasBase({
                    anexo: this.anexoSeleccionado,
                    idServicio: this.servicioSeleccionado
                });
                this.preguntasRaw = data;
                const secciones = this.agruparPreguntasEnSecciones(data);
                await this.prepararSeccionesDinamicas(secciones);
                this.secciones = secciones;
            } catch (error) {
                this.$q.notify({
                    type: 'negative',
                    message: 'Error al cargar preguntas'
                });
            } finally {
                this.loading = false;
            }
        },

        /* ========================================
           GUARDAR TODO
        ======================================== */

        serializarRespuestaPregunta(pregunta) {
            if (this.esPreguntaAge(pregunta)) return this.obtenerEdadPregunta(pregunta);
            return questionEngine.serializeAnswer(pregunta);
        },
        obtenerMensajeReglaInline(reglas, valor) {
            for (const regla of reglas || []) {
                const resultado = regla(valor);
                if (resultado !== true) return typeof resultado === 'string' ? resultado : 'El valor ingresado no es válido';
            }
            return null;
        },
        agregarErrorInline(errores, seccion, seccionIndex, pregunta, campo, mensaje, etiqueta = null) {
            if (!mensaje) return;
            errores.push({
                seccion: seccion.titulo || 'GENERAL',
                seccionIndex,
                idPregunta: pregunta.idPregunta,
                pregunta: etiqueta || pregunta.pregunta,
                campo,
                mensaje
            });
        },
        obtenerErroresInlineFicha() {
            const errores = [];

            this.secciones.forEach((seccion, seccionIndex) => {
                seccion.preguntas.forEach(pregunta => {
                    if (!this.esPreguntaVisibleSinEfectos(pregunta)) return;

                    const tipo = String(pregunta.tipoControl || '').toLowerCase();
                    if (this.esPreguntaBranchedSelects(pregunta)) {
                        (pregunta._branchedSelects || []).forEach((rama, ramaIndex) => {
                            if (pregunta.obligatoria === 1 && !rama.value) {
                                this.agregarErrorInline(errores, seccion, seccionIndex, pregunta, `rama-${ramaIndex}`, 'Debe seleccionar una opción', rama.label || pregunta.pregunta);
                            }
                        });
                    } else if (this.esPreguntaBranchedInputSearch(pregunta)) {
                        this.agregarErrorInline(
                            errores,
                            seccion,
                            seccionIndex,
                            pregunta,
                            'principal',
                            this.obtenerMensajeReglaInline(this.validarPregunta(pregunta), this.obtenerValorDisparadorBranched(pregunta))
                        );
                    } else if (tipo === 'textm') {
                        this.agregarErrorInline(errores, seccion, seccionIndex, pregunta, 'principal', this.obtenerMensajeReglaInline(this.validarPreguntaTextM(pregunta), pregunta._textMDraft));
                    } else if (tipo === 'numberm') {
                        this.agregarErrorInline(errores, seccion, seccionIndex, pregunta, 'principal', this.obtenerMensajeReglaInline(this.validarPreguntaNumberM(pregunta), pregunta._numberMDraft));
                    } else if (tipo === 'timerangem') {
                        this.agregarErrorInline(errores, seccion, seccionIndex, pregunta, 'principal', this.obtenerMensajeReglaInline(this.validarPreguntaTimeRangeM(pregunta), pregunta._timeRangeStartDraft));
                    } else if (!['label', 'selectm', 'dateinputs'].includes(tipo)) {
                        this.agregarErrorInline(errores, seccion, seccionIndex, pregunta, 'principal', this.obtenerMensajeReglaInline(this.validarPregunta(pregunta), pregunta.respuesta));
                    }

                    this.agregarErrorInline(errores, seccion, seccionIndex, pregunta, 'longitud', this.getMensajeErrorLongitudPregunta(pregunta));

                    if (this.esPregunta2VisibleSinEfectos(pregunta) && String(pregunta.tipoControl2 || '').toLowerCase() === 'text') {
                        this.agregarErrorInline(
                            errores,
                            seccion,
                            seccionIndex,
                            pregunta,
                            'secundaria',
                            this.obtenerMensajeReglaInline(this.validarPregunta2(pregunta), pregunta.respuesta2),
                            pregunta.pregunta2 || pregunta.pregunta
                        );
                    }
                });
            });

            return errores;
        },
        getPreguntaContainerId(pregunta) {
            return `ficha-pregunta-${pregunta.idPregunta}`;
        },
        corregirPrimerErrorInline() {
            const primerError = this.erroresInline[0];
            this.dialogErroresInline = false;
            if (!primerError) return;

            const referencias = this.$refs.seccionesExpansion;
            const seccion = Array.isArray(referencias) ? referencias[primerError.seccionIndex] : referencias;
            if (seccion && typeof seccion.show === 'function') seccion.show();

            this.$nextTick(() => {
                const container = document.getElementById(`ficha-pregunta-${primerError.idPregunta}`);
                if (!container) return;
                container.scrollIntoView({ block: 'center', behavior: 'smooth' });
                const control = container.querySelector('input:not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled]), [role="radio"]:not([aria-disabled="true"])');
                if (control) control.focus();
            });
        },
        validarPreguntasObligatoriasGenerales({ notificar = true } = {}) {
            for (const seccion of this.secciones) {
                for (const pregunta of seccion.preguntas) {
                    if (!this.mostrarPregunta(pregunta)) continue;

                    if (pregunta.obligatoria === 1 && !this.estaPreguntaRespondida(pregunta)) {
                        if (notificar) {
                            this.$q.notify({
                                type: 'warning',
                                message: `Debe responder: ${pregunta.pregunta}`
                            });
                        }
                        return false;
                    }

                    if (this.mostrarPregunta2(pregunta) && pregunta.obligatoria2 === 1 && !pregunta.respuesta2) {
                        if (notificar) {
                            this.$q.notify({
                                type: 'warning',
                                message: `Debe responder: ${pregunta.pregunta2}`
                            });
                        }
                        return false;
                    }
                }
            }

            return true;
        },
        async persistirFicha() {
            const reglaInvalida = this.obtenerReglasBloqueantesInvalidas()[0];
            if (reglaInvalida) {
                this.alertasReglasCanceladas = false;
                this.mostrarAlertaReglaBloqueante();
                return false;
            }

            const erroresInline = this.obtenerErroresInlineFicha();
            const obligatoriasValidas = this.validarPreguntasObligatoriasGenerales({ notificar: erroresInline.length === 0 });
            if (erroresInline.length > 0) {
                this.erroresInline = erroresInline;
                this.dialogErroresInline = true;
                return false;
            }
            if (!obligatoriasValidas) {
                return false;
            }

            this.limpiarRespuestasOcultas();
            this.sincronizarResponsableSesion();

            const respuestas = this.secciones.flatMap(seccion =>
                seccion.preguntas
                    .filter(p => this.mostrarPregunta(p))
                    .map(p => ({
                        idPregunta: p.idPregunta,
                        respuesta: this.serializarRespuestaPregunta(p),
                        respuesta2: questionEngine.serializeAnswer2(p),
                        observacion: null,
                        puntaje: null
                    }))
            );

            const payload = {
                idAnexo: this.form.idAnexo,
                idCentro: this.form.idCentro,
                centro: this.form.nombreCentro || '',
                correlativo: this.form.correlativo,
                periodo: this.fichaPeriodo,
                acreditacionVigente: this.normalizarAcreditacionVigenteEntero(this.acreVigente),
                fechaAcreditacion: this.normalizarFechaAcreditacionISO(this.fechaAcreditacion),
                fechaAplicacion: new Date().toISOString().split('T')[0],
                fechaRegistro: this.form.fechaRegistro,
                idDirector: this.form.idDirector || null,
                idRespSupervision: this.normalizarIdResponsable(this.form.idRespSupervision),
                idSupervisado: this.buildIdSupervisadoPayload ? this.buildIdSupervisadoPayload() : '',
                respuestas,
                totales: {
                    conforme: this.totalesRespuestas.CONFORME,
                    noConforme: this.totalesRespuestas.NO_CONFORME,
                    observacion: this.totalesRespuestas.OBSERVACION,
                    noAplica: this.totalesRespuestas.NO_APLICA
                }
            };

            this.validacionReseteadaEnEdicion = false;

            if (this.modo === 'editar') {
                payload.idCabecera = this.form.idAnexoCabecera;
                payload.usuModifica = this.obtenerIdUsuarioSesion();

                await actualizarFicha(this.$axios, payload);

                // if (Number(this.form.reqObligatoriedad) !== 0) {
                //     try {
                //         await this.$axios.delete(
                //             `${process.env.API_URL}/resetValidacionAnexoCabecera?idAnexoCabecera=${this.form.idAnexoCabecera}`
                //         );
                //         this.validacionReseteadaEnEdicion = true;
                //     } catch (resetError) {
                //     }
                // }
            } else {
                payload.usuRegistra = this.obtenerIdUsuarioSesion();
                await crearFicha(this.$axios, payload);
            }

            return true;
        },
        obtenerReglasBloqueantesInvalidas() {
            return this.secciones.flatMap(seccion => seccion.preguntas)
                .filter(pregunta => this.esPreguntaVisibleSinEfectos(pregunta))
                .map(pregunta => questionEngine.evaluateBlockSubmitInvalidRule(pregunta, {
                    findQuestion: id => this.buscarPregunta(id),
                    referenceDate: this.form.fechaRegistro
                }))
                .filter(Boolean);
        },
        cancelarAlertasReglasBloqueantes() {
            if (this.alertaReglasTimer) {
                clearTimeout(this.alertaReglasTimer);
                this.alertaReglasTimer = null;
            }
            if (this.alertaReglasDialog) {
                this.alertaReglasDialog.hide();
                this.alertaReglasDialog = null;
            }
            this.alertasReglasCanceladas = true;
            this.alertaReglasActiva = false;
            this.indiceAlertaReglas = 0;
        },
        cancelarAlertasReglasSiCorregidas() {
            if (this.obtenerReglasBloqueantesInvalidas().length === 0) {
                this.cancelarAlertasReglasBloqueantes();
            }
        },
        programarSiguienteAlertaRegla() {
            if (this.alertasReglasCanceladas || this.alertaReglasTimer || this.alertaReglasActiva || !this.dialog) return;
            if (this.obtenerReglasBloqueantesInvalidas().length === 0) {
                this.cancelarAlertasReglasBloqueantes();
                return;
            }
            this.alertaReglasTimer = setTimeout(() => {
                this.alertaReglasTimer = null;
                this.mostrarAlertaReglaBloqueante();
            }, 5000);
        },
        mostrarAlertaReglaBloqueante() {
            const reglasInvalidas = this.obtenerReglasBloqueantesInvalidas();
            if (!reglasInvalidas.length || this.alertaReglasActiva || !this.dialog) {
                this.cancelarAlertasReglasSiCorregidas();
                return;
            }
            const regla = reglasInvalidas[this.indiceAlertaReglas % reglasInvalidas.length];
            this.indiceAlertaReglas = (this.indiceAlertaReglas + 1) % reglasInvalidas.length;
            this.alertasReglasCanceladas = false;
            this.alertaReglasActiva = true;
            let debeEnfocarPregunta = false;
            this.alertaReglasDialog = this.$q.dialog({
                title: 'VALIDACIÓN DE FICHA',
                message: regla.message,
                ok: { label: 'Corregir', color: 'primary' },
                class: 'ficha-regla-bloqueante-dialog',
                persistent: false
            }).onOk(() => {
                debeEnfocarPregunta = true;
            }).onDismiss(() => {
                this.alertaReglasDialog = null;
                this.alertaReglasActiva = false;
                if (debeEnfocarPregunta) this.enfocarPreguntaReglaBloqueante(regla.question);
                this.programarSiguienteAlertaRegla();
            });
        },
        esPreguntaFecha(pregunta) {
            return String(pregunta?.tipoControl || '').toLowerCase() === 'date';
        },
        getPreguntaInputId(pregunta) {
            return `ficha-pregunta-${pregunta.idPregunta}-input`;
        },
        enfocarPreguntaReglaBloqueante(pregunta) {
            this.$nextTick(() => {
                const input = document.getElementById(this.getPreguntaInputId(pregunta));
                if (!input) return;
                input.scrollIntoView({ block: 'center' });
                input.focus();
            });
        },
        onPreguntaDateBlur(pregunta) {
            if (String(pregunta?.tipoControl || '').toLowerCase() !== 'date') return;
            this.alertasReglasCanceladas = false;
            const reglaInvalida = questionEngine.evaluateBlockSubmitInvalidRule(pregunta, {
                findQuestion: id => this.buscarPregunta(id),
                referenceDate: this.form.fechaRegistro
            });
            if (reglaInvalida) this.mostrarAlertaReglaBloqueante();
            else this.cancelarAlertasReglasSiCorregidas();
        },
        estaPreguntaRespondida(pregunta) {
            if (this.esPreguntaAge(pregunta)) {
                return Number.isFinite(this.obtenerEdadPregunta(pregunta));
            }

            if (this.esPreguntaBranchedInputSearch(pregunta)) {
                return !!this.obtenerValorDisparadorBranched(pregunta)
                    && pregunta._ramificaciones.every(rama => !!rama.value);
            }

            if (this.esPreguntaBranchedSelects(pregunta)) {
                return pregunta._branchedSelects.length > 0
                    && pregunta._branchedSelects.every(rama => !!rama.value);
            }

            if (Array.isArray(pregunta.respuesta)) {
                return pregunta.respuesta.length > 0;
            }

            return !!pregunta.respuesta;
        },
        async guardarTodo() {
            if (!this.mostrarAvisoPendientesGuardado) {
                await this.ejecutarGuardadoActual();
                return;
            }

            const pendientes = this.obtenerPendientesGuardadoFicha();
            this.pendientesGuardado = pendientes;

            if (pendientes.length > 0) {
                this.dialogPendientesGuardado = true;
                return;
            }

            await this.ejecutarGuardadoActual();
        },
        async confirmarGuardadoConPendientes() {
            if (this.guardandoConPendientes) return;

            this.guardandoConPendientes = true;
            this.dialogPendientesGuardado = false;

            try {
                await this.ejecutarGuardadoActual();
            } finally {
                this.guardandoConPendientes = false;
            }
        },
        limpiarPendientesGuardado() {
            this.pendientesGuardado = [];
        },
        async ejecutarGuardadoActual() {
            try {
                const guardadoExitoso = await this.persistirFicha();
                if (!guardadoExitoso) {
                    return;
                }

                this.$q.notify({
                    type: 'positive',
                    message: this.modo === 'editar'
                        ? 'Actualizado correctamente'
                        : 'Registrado correctamente'
                });

                this.validacionReseteadaEnEdicion = false;
                this.dialog = false;
                this.cargarTablaAnexos();
            } catch (error) {
                this.$q.notify({
                    type: 'negative',
                    message: 'Error al guardar'
                });
            }
        },
        obtenerPendientesGuardadoFicha() {
            const pendientes = [];

            for (const seccion of this.secciones) {
                for (const pregunta of seccion.preguntas) {
                    if (!this.esPreguntaVisibleSinEfectos(pregunta)) continue;

                    const tipoControl = String(pregunta.tipoControl || '').toLowerCase();
                    const esPreguntaContestable = !['cabecera', 'label'].includes(tipoControl)
                        && !this.esCampoSoloLectura(pregunta);

                    if (esPreguntaContestable && !this.estaPreguntaRespondidaParaCierre(pregunta)) {
                        pendientes.push({
                            seccion: seccion.titulo || 'GENERAL',
                            pregunta: pregunta.pregunta,
                            tipo: 'principal'
                        });
                    }

                    const tipoControl2 = String(pregunta.tipoControl2 || '').toLowerCase();
                    const esSubpreguntaContestable = pregunta.pregunta2
                        && ['text', 'select'].includes(tipoControl2);

                    if (
                        esSubpreguntaContestable
                        && this.esPregunta2VisibleSinEfectos(pregunta)
                        && this.esValorVacioCierre(pregunta.respuesta2)
                    ) {
                        pendientes.push({
                            seccion: seccion.titulo || 'GENERAL',
                            pregunta: pregunta.pregunta2,
                            preguntaPadre: pregunta.pregunta,
                            tipo: 'subpregunta'
                        });
                    }
                }
            }

            return pendientes;
        },
        esValorVacioCierre(valor) {
            if (Array.isArray(valor)) {
                return valor.length === 0;
            }

            if (valor === null || valor === undefined) {
                return true;
            }

            if (typeof valor === 'string') {
                return valor.trim() === '';
            }

            return false;
        },
        estaPreguntaRespondidaParaCierre(pregunta) {
            if (this.esPreguntaAge(pregunta)) {
                return Number.isFinite(this.obtenerEdadPregunta(pregunta));
            }

            if (this.esPreguntaBranchedInputSearch(pregunta)) {
                return !this.esValorVacioCierre(this.obtenerValorDisparadorBranched(pregunta))
                    && (pregunta._ramificaciones || []).every(rama => !this.esValorVacioCierre(rama.value));
            }

            if (this.esPreguntaBranchedSelects(pregunta)) {
                return (pregunta._branchedSelects || []).length > 0
                    && pregunta._branchedSelects.every(rama => !this.esValorVacioCierre(rama.value));
            }

            return !this.esValorVacioCierre(pregunta.respuesta);
        },
        obtenerPendientesCierreFicha() {
            const pendientes = [];

            for (const seccion of this.secciones) {
                for (const pregunta of seccion.preguntas) {
                    if (!this.mostrarPregunta(pregunta)) continue;

                    if (Number(pregunta.reqObligatoria1Cierre || 0) === 1 && !this.estaPreguntaRespondidaParaCierre(pregunta)) {
                        pendientes.push({
                            seccion: seccion.titulo || 'GENERAL',
                            pregunta: pregunta.pregunta,
                            tipo: 'principal'
                        });
                    }

                    if (
                        Number(pregunta.reqObligatoria2Cierre || 0) === 1
                        && this.mostrarPregunta2(pregunta)
                        && this.esValorVacioCierre(pregunta.respuesta2)
                    ) {
                        pendientes.push({
                            seccion: seccion.titulo || 'GENERAL',
                            pregunta: pregunta.pregunta2,
                            preguntaPadre: pregunta.pregunta,
                            tipo: 'subpregunta'
                        });
                    }
                }
            }

            return pendientes;
        },
        iniciarCierreFicha() {
            if (!this.modoEdicion) return;

            const pendientes = this.obtenerPendientesCierreFicha();
            this.pendientesCierre = pendientes;

            if (pendientes.length > 0) {
                this.dialogPendientesCierre = true;
                return;
            }

            this.dialogConfirmarCierreFicha = true;
        },
        async confirmarCierreFicha() {
            this.dialogConfirmarCierreFicha = false;
            this.cerrandoFicha = true;
            let guardadoExitoso = false;

            try {
                guardadoExitoso = await this.persistirFicha();
                if (!guardadoExitoso) {
                    return;
                }

                await guardarConformidadFicha(this.$axios, this.form.idAnexoCabecera);

                this.$q.notify({
                    type: 'positive',
                    message: 'Ficha cerrada correctamente'
                });

                this.dialogPendientesCierre = false;
                this.pendientesCierre = [];
                this.validacionReseteadaEnEdicion = false;
                this.dialog = false;
                await this.cargarTablaAnexos();
            } catch (error) {
                this.$q.notify({
                    type: 'negative',
                    message: guardadoExitoso
                        ? 'Se guardaron los cambios, pero no se pudo cerrar la ficha'
                        : 'Error al guardar la ficha antes del cierre'
                });
            } finally {
                this.cerrandoFicha = false;
            }
        },
        hidratarBranchedInputSearchDesdeRespuesta(pregunta) {
            Object.assign(pregunta, questionEngine.hydrateBranchedInputSearch(pregunta));
        },
        hidratarDateInputsDesdeRespuesta(pregunta) {
            Object.assign(pregunta, questionEngine.hydrateDateInputs(pregunta));
        },
        obtenerValorDisparadorBranched(pregunta) {
            return pregunta?._branchedTriggerValue || '';
        },
        actualizarRamificacionTexto(pregunta, index, value) {
            if (!pregunta._ramificaciones[index]) return;
            this.$set(
                pregunta._ramificaciones[index],
                'value',
                questionEngine.normalizeBranchedDerivedValue(value)
            );
            pregunta.respuesta = this.serializarRespuestaPregunta(pregunta);
        },
        actualizarValorDisparadorBranched(pregunta, value) {
            pregunta._ramificacionesReadonlyHttp = false;
            pregunta._branchedTriggerValue = value;
            pregunta.respuesta = this.serializarRespuestaPregunta(pregunta);
        },
        cumpleReglaEditable(regla) {
            return questionEngine.matchesEditableRule(regla, id => this.buscarPregunta(id));
        },
        esCampoSoloLectura(pregunta) {
            return questionEngine.isReadOnly(pregunta, { isView: this.esVisualizacion, findQuestion: id => this.buscarPregunta(id) });
        },
        esControlDeshabilitado(pregunta) {
            return this.esVisualizacion || this.esCampoSoloLectura(pregunta);
        },
        esRamificacionEditable(pregunta, rama) {
            return questionEngine.isBranchEditable(pregunta, rama, { isView: this.esVisualizacion, findQuestion: id => this.buscarPregunta(id) });
        },
        obtenerTipoInputPregunta(pregunta) {
            if (String(pregunta?.tipoControl || '').toLowerCase() === 'date') return 'date';
            if (this.usaTipoNumero(pregunta)) return 'number';
            if (String(pregunta?.tipoControl || '').toLowerCase() === 'textarea') return 'textarea';
            return 'text';
        },
        usaTipoNumero(pregunta) {
            return String(pregunta?.tipoControl || '').toLowerCase() === 'number' || pregunta?.tipoDato1 === 'NUMBER';
        },
        usaAutogrowPregunta(pregunta) {
            return String(pregunta?.tipoControl || '').toLowerCase() === 'textarea';
        },
        obtenerValorTextoPregunta(pregunta) {
            if (this.esPreguntaAge(pregunta)) return this.obtenerTextoEdadPregunta(pregunta);
            return pregunta?.respuesta === null || pregunta?.respuesta === undefined ? '' : pregunta.respuesta;
        },
        obtenerEdadPregunta(pregunta) {
            return this.evaluarEdadPregunta(pregunta).age;
        },
        evaluarEdadPregunta(pregunta) {
            return questionEngine.evaluateAgeQuestion(pregunta, {
                findQuestion: id => this.buscarPregunta(id),
                referenceDate: this.form.fechaRegistro
            });
        },
        obtenerTextoEdadPregunta(pregunta) {
            const edad = this.obtenerEdadPregunta(pregunta);
            return Number.isFinite(edad) ? `${edad} años` : '';
        },
        obtenerMensajeErrorEdadPregunta(pregunta) {
            return this.evaluarEdadPregunta(pregunta).reason === 'birth-after-reference'
                ? 'Fecha de nacimiento futura.'
                : '';
        },
        obtenerTextoVisiblePregunta(pregunta) {
            if (!pregunta || pregunta.respuesta === null || pregunta.respuesta === undefined) return '';

            const valores = Array.isArray(pregunta.respuesta)
                ? pregunta.respuesta
                : String(pregunta.respuesta).split('|');
            const opciones = Array.isArray(pregunta.opciones) ? pregunta.opciones : [];

            return valores.map(valor => {
                const opcion = opciones.find(item => this.normalizarTextoComparacion(item.value) === this.normalizarTextoComparacion(valor));
                return opcion?.label ?? valor;
            }).map(valor => String(valor).trim()).filter(Boolean).join('|');
        },
        coincidenValoresDefaultBifurcaciones(origen, opcion) {
            const valorOrigen = this.normalizarTextoComparacion(origen);
            const valorOpcion = this.normalizarTextoComparacion(opcion);
            return !!valorOrigen && !!valorOpcion
                && (valorOrigen.includes(valorOpcion) || valorOpcion.includes(valorOrigen));
        },
        async aplicarValoresDefaultBifurcaciones() {
            for (const seccion of this.secciones) {
                for (const pregunta of seccion.preguntas) {
                    if (!this.esPreguntaBranchedSelects(pregunta) || !Array.isArray(pregunta._defaultBranchRules)) continue;

                    for (const regla of pregunta._defaultBranchRules) {
                        const index = pregunta._branchedSelects.findIndex(rama =>
                            this.normalizarTextoComparacion(rama.label) === this.normalizarTextoComparacion(regla.branchLabel)
                        );
                        if (index < 0) continue;

                        const preguntaOrigen = this.buscarPregunta(regla.id);
                        const valorOrigen = this.obtenerTextoVisiblePregunta(preguntaOrigen);
                        const rama = pregunta._branchedSelects[index];
                        const opcion = valorOrigen
                            ? rama.options.find(item => this.coincidenValoresDefaultBifurcaciones(valorOrigen, item.label))
                            : null;

                        await this.onBranchedSelectChange(pregunta, index, opcion?.value ?? '');
                    }
                }
            }
        },
        async sincronizarValoresDefaultBifurcaciones() {
            if (this.sincronizandoValoresDefaultBifurcaciones) {
                this.sincronizacionDefaultBifurcacionesPendiente = true;
                return;
            }

            this.sincronizandoValoresDefaultBifurcaciones = true;
            try {
                do {
                    this.sincronizacionDefaultBifurcacionesPendiente = false;
                    await this.aplicarValoresDefaultBifurcaciones();
                } while (this.sincronizacionDefaultBifurcacionesPendiente);
            } finally {
                this.sincronizandoValoresDefaultBifurcaciones = false;
            }
        },
        firmaValoresDefaultBifurcaciones() {
            return this.secciones.reduce((firmas, seccion) => {
                seccion.preguntas.forEach(pregunta => {
                    if (!this.esPreguntaBranchedSelects(pregunta)) return;
                    (pregunta._defaultBranchRules || []).forEach(regla => {
                        const origen = this.buscarPregunta(regla.id);
                        firmas.push(`${pregunta.idPregunta}:${regla.id}:${regla.branchLabel}:${this.obtenerTextoVisiblePregunta(origen)}`);
                    });
                });
                return firmas;
            }, []).join('||');
        },
        aplicarValoresDefault() {
            if (this.modo !== 'nuevo') return;

            for (const seccion of this.secciones) {
                for (const pregunta of seccion.preguntas) {
                    if (!this.esPreguntaVisibleSinEfectos(pregunta)
                        || !questionEngine.isDefaultValueEligible(pregunta)
                        || !Array.isArray(pregunta._defaultValueRules)
                        || !pregunta._defaultValueRules.length
                        || !this.esValorVacioCierre(pregunta.respuesta)) continue;

                    const defaultValue = questionEngine.resolveDefaultValue(pregunta, id => this.buscarPregunta(id));
                    if (defaultValue === null || defaultValue === undefined) continue;

                    this.$set(pregunta, 'respuesta', this.normalizarRespuestaPregunta(pregunta, defaultValue));
                    if (String(pregunta.tipoControl || '').toLowerCase() === 'dateinputs') {
                        const drafts = questionEngine.hydrateDateInputs(pregunta);
                        Object.keys(drafts).forEach(key => this.$set(pregunta, key, drafts[key]));
                    }
                }
            }
        },
        sincronizarValoresDefault() {
            if (this.sincronizandoValoresDefault) {
                this.sincronizacionDefaultPendiente = true;
                return;
            }

            this.sincronizandoValoresDefault = true;
            try {
                do {
                    this.sincronizacionDefaultPendiente = false;
                    this.aplicarValoresDefault();
                } while (this.sincronizacionDefaultPendiente);
            } finally {
                this.sincronizandoValoresDefault = false;
            }
        },
        firmaValoresDefault() {
            return this.secciones.reduce((firmas, seccion) => {
                seccion.preguntas.forEach(pregunta => {
                    if (!questionEngine.isDefaultValueEligible(pregunta) || !Array.isArray(pregunta._defaultValueRules)) return;
                    pregunta._defaultValueRules.forEach(regla => {
                        const origen = this.buscarPregunta(regla.id);
                        firmas.push([
                            pregunta.idPregunta,
                            regla.id,
                            regla.value,
                            regla.defaultValue,
                            this.esPreguntaVisibleSinEfectos(pregunta),
                            this.obtenerTextoVisiblePregunta(origen),
                            this.esValorVacioCierre(pregunta.respuesta)
                        ].join(':'));
                    });
                });
                return firmas;
            }, []).join('||');
        },
        actualizarRespuestaPregunta(pregunta, value) {
            this.$set(pregunta, 'respuesta', value);
        },
        actualizarRespuestaTextoPregunta(pregunta, value) {
            const valorTexto = this.sanitizarValorTextoPregunta(pregunta, value);
            const valorNormalizado = valorTexto === '' ? (this.usaTipoNumero(pregunta) ? null : '') : valorTexto;
            this.$set(pregunta, 'respuesta', valorNormalizado);
            this.cancelarAlertasReglasSiCorregidas();
        },
        actualizarDateInputsPart(pregunta, part, value) {
            const valorEntrante = String(value === null || value === undefined ? '' : value);
            let clave = '_dateInputsDayDraft';
            let limite = 2;

            if (part === 'year') {
                clave = '_dateInputsYearDraft';
                limite = 4;
            } else if (part === 'month') {
                clave = '_dateInputsMonthDraft';
            }

            if (!/^\d*$/.test(valorEntrante) || valorEntrante.length > limite) return;

            this.$set(pregunta, clave, valorEntrante);
            pregunta.respuesta = this.serializarRespuestaPregunta(pregunta);
        },
        manejarKeydownDateInputs(event) {
            if (event.ctrlKey || event.metaKey) return;

            const teclasPermitidas = [
                'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
            ];
            if (teclasPermitidas.includes(event.key) || /^\d$/.test(event.key)) return;

            event.preventDefault();
        },
        manejarPasteDateInputs(event) {
            const clipboard = event.clipboardData || window.clipboardData;
            if (!clipboard) return;

            const pegado = clipboard.getData('text') || '';
            if (!/^\d*$/.test(pegado)) event.preventDefault();
        },
        actualizarDraftTextM(pregunta, value) {
            this.$set(pregunta, '_textMDraft', value);
        },
        agregarItemTextM(pregunta) {
            if (this.esCampoSoloLectura(pregunta)) return;
            const valor = String(pregunta._textMDraft || '').trim();
            if (!valor) return;
            const items = Array.isArray(pregunta.respuesta) ? [...pregunta.respuesta] : [];
            const clave = this.normalizarTextoComparacion(valor);
            if (items.some(item => this.normalizarTextoComparacion(item) === clave)) {
                this.$q.notify({ type: 'warning', message: 'El valor ya fue agregado' });
                return;
            }
            items.push(valor);
            this.$set(pregunta, 'respuesta', items);
            this.$set(pregunta, '_textMDraft', '');
        },
        eliminarItemTextM(pregunta, index) {
            if (this.esCampoSoloLectura(pregunta)) return;
            const items = Array.isArray(pregunta.respuesta) ? [...pregunta.respuesta] : [];
            items.splice(index, 1);
            this.$set(pregunta, 'respuesta', items);
        },
        actualizarDraftNumberM(pregunta, value) {
            this.$set(pregunta, '_numberMDraft', value);
        },
        agregarItemNumberM(pregunta) {
            if (this.esCampoSoloLectura(pregunta)) return;
            const valor = String(pregunta._numberMDraft === null || pregunta._numberMDraft === undefined ? '' : pregunta._numberMDraft).trim();
            if (!/^\d+$/.test(valor)) {
                this.$q.notify({ type: 'warning', message: 'Ingrese un número entero no negativo' });
                return;
            }
            const items = Array.isArray(pregunta.respuesta) ? [...pregunta.respuesta] : [];
            if (items.some(item => String(item) === valor)) {
                this.$q.notify({ type: 'warning', message: 'El valor ya fue agregado' });
                return;
            }
            items.push(valor);
            this.$set(pregunta, 'respuesta', items);
            this.$set(pregunta, '_numberMDraft', '');
        },
        eliminarItemNumberM(pregunta, index) {
            if (this.esCampoSoloLectura(pregunta)) return;
            const items = Array.isArray(pregunta.respuesta) ? [...pregunta.respuesta] : [];
            items.splice(index, 1);
            this.$set(pregunta, 'respuesta', items);
        },
        actualizarTimeRangeDraft(pregunta, tipo, value) {
            this.$set(pregunta, '_timeRangeAttemptedAdd', false);
            if (tipo === 'start') {
                this.$set(pregunta, '_timeRangeStartDraft', value);
                return;
            }
            this.$set(pregunta, '_timeRangeEndDraft', value);
        },
        agregarItemTimeRangeM(pregunta) {
            if (this.esCampoSoloLectura(pregunta)) return;

            this.$set(pregunta, '_timeRangeAttemptedAdd', true);

            const inicio = String(pregunta._timeRangeStartDraft || '').trim();
            const fin = String(pregunta._timeRangeEndDraft || '').trim();
            if (!inicio && !fin) return;

            if (!inicio || !fin) {
                this.$q.notify({
                    type: 'warning',
                    message: 'Debe completar el rango de horas'
                });
                return;
            }

            const items = Array.isArray(pregunta.respuesta) ? [...pregunta.respuesta] : [];
            items.push(`${inicio} - ${fin}`);
            this.$set(pregunta, 'respuesta', items);
            this.$set(pregunta, '_timeRangeStartDraft', '');
            this.$set(pregunta, '_timeRangeEndDraft', '');
            this.$set(pregunta, '_timeRangeAttemptedAdd', false);
        },
        eliminarItemTimeRangeM(pregunta, index) {
            if (this.esCampoSoloLectura(pregunta)) return;
            const items = Array.isArray(pregunta.respuesta) ? [...pregunta.respuesta] : [];
            items.splice(index, 1);
            this.$set(pregunta, 'respuesta', items);
        },
        puedeAbrirBusquedaHttp(pregunta) {
            return !this.esVisualizacion && !this.esCampoSoloLectura(pregunta);
        },
        actualizarFormHttpPregunta(formActualizado) {
            Object.keys(formActualizado).forEach(paramKey => {
                this.$set(this.formHttpPregunta, paramKey, formActualizado[paramKey]);
            });
        },
        abrirModalHttpPregunta(pregunta) {
            if (!this.puedeAbrirBusquedaHttp(pregunta)) return;

            this.preguntaHttpActiva = pregunta;
            this.formHttpPregunta = {};

            (pregunta._httpParamsParsed || []).forEach((campo, index) => {
                if (!campo.paramKey) return;
                const valorInicial = index === 0 ? this.obtenerValorDisparadorBranched(pregunta) : '';
                this.$set(this.formHttpPregunta, campo.paramKey, valorInicial);
            });

            this.dialogHttpPregunta = true;
        },
        async ejecutarBusquedaPreguntaHttp() {
            if (!this.preguntaHttpActiva) return;

            this.loadingHttpPregunta = true;
            try {
                if (!this.preguntaHttpActiva.urlServicio) {
                    throw new Error('URL de servicio no definida');
                }
                const params = { ...this.formHttpPregunta };
                const response = await this.executeDynamicHttp({
                    url: this.preguntaHttpActiva.urlServicio,
                    method: this.preguntaHttpActiva._httpMethod,
                    params,
                    body: params
                });

                const data = this.extraerDataHttp(response);
                const item = Array.isArray(data) ? (data[0] || {}) : (data || {});
                const primerCampo = (this.preguntaHttpActiva._httpParamsParsed || []).find(campo => campo.paramKey);

                this.preguntaHttpActiva._branchedTriggerValue = primerCampo
                    ? (this.formHttpPregunta[primerCampo.paramKey] || '')
                    : '';

                this.preguntaHttpActiva._ramificaciones = (this.preguntaHttpActiva._ramificaciones || []).map(rama => ({
                    ...rama,
                    value: questionEngine.normalizeBranchedDerivedValue(
                        this.resolverPropiedadCaseInsensitive(item, rama.prop) || ''
                    )
                }));

                this.preguntaHttpActiva._ramificacionesReadonlyHttp = (this.preguntaHttpActiva._ramificaciones || [])
                    .some(rama => !!String(rama?.value || '').trim());

                this.preguntaHttpActiva.respuesta = this.serializarRespuestaPregunta(this.preguntaHttpActiva);
                this.dialogHttpPregunta = false;
            } catch (error) {
                this.$q.notify({
                    type: 'negative',
                    message: 'No se pudo obtener la información de la búsqueda dinámica'
                });
            } finally {
                this.loadingHttpPregunta = false;
            }
        },
        async executeDynamicHttp({ url, method = 'GET', params = null, body = null }) {
            return executeDynamicHttp(this.$axios, { url, method, params, body });
        },
        extraerDataHttp(response) {
            return response?.data?.data ?? response?.data ?? [];
        },
        mapearOpcionesHttp(data, labelField = 'nombre') {
            const lista = Array.isArray(data) ? data : [];
            return lista
                .map(item => {
                    const label = this.resolverPropiedadCaseInsensitive(item, labelField);
                    if (label === undefined || label === null || label === '') return null;
                    return {
                        label: String(label),
                        value: String(label),
                        raw: item
                    };
                })
                .filter(Boolean);
        },
        async cargarOpcionesSelectHttp(pregunta) {
            if (!this.esPreguntaSelectHttpSimple(pregunta) || pregunta._httpLoaded) return;

            pregunta._loadingHttp = true;
            try {
                const response = await this.executeDynamicHttp({
                    url: pregunta.urlServicio,
                    method: pregunta._httpMethod,
                    params: null,
                    body: null
                });
                pregunta.opciones = this.mapearOpcionesHttp(this.extraerDataHttp(response), pregunta._labelHttpField);
                pregunta._httpLoaded = true;
            } catch (error) {
                this.$q.notify({
                    type: 'negative',
                    message: `No se pudieron cargar las opciones de ${pregunta.pregunta}`
                });
            } finally {
                pregunta._loadingHttp = false;
            }
        },
        async inicializarBranchedSelects(pregunta) {
            if (!Array.isArray(pregunta._branchedSelects) || pregunta._branchedSelects.length === 0) return;
            await this.cargarOpcionesBranchedSelect(pregunta, 0);

            if (pregunta.respuesta) {
                await this.hidratarBranchedSelectsDesdeRespuesta(pregunta);
            } else {
                pregunta.respuesta = this.serializarRespuestaPregunta(pregunta);
            }
        },
        construirParamsBranchedSelect(pregunta, index) {
            if (index === 0) return {};
            const definicion = pregunta._httpParamsParsed[index] || {};
            if (!definicion.paramKey) return {};

            const ramaPadre = pregunta._branchedSelects[index - 1];
            const valorPadre = this.resolverPropiedadCaseInsensitive(ramaPadre?.selectedOption?.raw || {}, definicion.valueKey);
            if (valorPadre === undefined || valorPadre === null || valorPadre === '') return null;

            return { [definicion.paramKey]: valorPadre };
        },
        async cargarOpcionesBranchedSelect(pregunta, index) {
            const rama = pregunta._branchedSelects[index];
            if (!rama) return;

            const params = this.esHttpParamsWildcard(pregunta.httpParams)
                ? {}
                : this.construirParamsBranchedSelect(pregunta, index);
            if (params === null) return;

            rama.loading = true;
            try {
                const response = await this.executeDynamicHttp({
                    url: pregunta.urlServicio,
                    method: pregunta._httpMethod,
                    params,
                    body: params
                });
                this.$set(rama, 'options', this.mapearOpcionesHttp(this.extraerDataHttp(response), rama.valueField));
            } catch (error) {
                this.$set(rama, 'options', []);
                this.$q.notify({
                    type: 'negative',
                    message: `No se pudieron cargar las opciones de ${rama.label}`
                });
            } finally {
                rama.loading = false;
            }
        },
        async hidratarBranchedSelectsDesdeRespuesta(pregunta) {
            const labels = String(pregunta.respuesta || '')
                .split('|')
                .map(item => item.trim())
                .filter(Boolean);

            for (let index = 0; index < pregunta._branchedSelects.length; index++) {
                const rama = pregunta._branchedSelects[index];
                const label = labels[index] || '';
                if (!label) break;

                const option = rama.options.find(item => this.normalizarTextoComparacion(item.value) === this.normalizarTextoComparacion(label));
                if (!option) {
                    rama.value = label;
                    break;
                }

                rama.value = option.value;
                rama.selectedOption = option;

                if (index < pregunta._branchedSelects.length - 1) {
                    await this.cargarOpcionesBranchedSelect(pregunta, index + 1);
                }
            }
        },
        limpiarBranchedSelectChildren(pregunta, index) {
            for (let idx = index + 1; idx < pregunta._branchedSelects.length; idx++) {
                const rama = pregunta._branchedSelects[idx];
                rama.value = '';
                rama.selectedOption = null;
                rama.options = [];
            }
        },
        async onBranchedSelectChange(pregunta, index, value) {
            const rama = pregunta._branchedSelects[index];
            if (!rama) return;

            rama.value = value;
            rama.selectedOption = rama.options.find(item => item.value === value) || null;
            this.limpiarBranchedSelectChildren(pregunta, index);

            if (rama.selectedOption && index < pregunta._branchedSelects.length - 1) {
                await this.cargarOpcionesBranchedSelect(pregunta, index + 1);
            }

            pregunta.respuesta = this.serializarRespuestaPregunta(pregunta);
        },

        obtenerOpcionesValidas(lista, valueKey) {
            return (Array.isArray(lista) ? lista : []).filter(item => {
                const value = item?.[valueKey];
                return value !== null && value !== undefined && value !== '';
            });
        },

        obtenerOpcionUnicaValida(lista, valueKey) {
            const opciones = this.obtenerOpcionesValidas(lista, valueKey);
            return opciones.length === 1 ? opciones[0] : null;
        },

        autoseleccionarTipoOculto() {
            if (this.tipoFicha) return;
            const tipo = this.obtenerOpcionUnicaValida(this.tipos, 'id');
            if (tipo) {
                this.tipoFicha = tipo.id;
            }
        },

        autoseleccionarUnidadOculta() {
            if (this.unidadSeleccionada) return false;
            const unidad = this.obtenerOpcionUnicaValida(this.unidades, 'idUnidad');
            if (!unidad) return false;

            this.unidadSeleccionada = unidad.idUnidad;
            return true;
        },

        autoseleccionarServicioOculto() {
            if (this.servicioSeleccionado) return false;
            const servicio = this.obtenerOpcionUnicaValida(this.servicios, 'idServicio');
            if (!servicio) return false;

            this.servicioSeleccionado = servicio.idServicio;
            return true;
        },

        autoseleccionarAnexoOculto() {
            if (this.anexoSeleccionado) return false;
            const anexo = this.obtenerOpcionUnicaValida(this.anexos, 'idAnexo');
            if (!anexo) return false;

            this.anexoSeleccionado = anexo.idAnexo;
            return true;
        },

        onUnidadChange() {
            this.servicioSeleccionado = null
            this.centroSeleccionado = null
            this.anexoSeleccionado = null
        },

        onServicioChange() {
            this.centroSeleccionado = null
            this.anexoSeleccionado = null
        },

        onCentroChange() {
            // si necesitas lógica adicional
        },
        // Cargar todas las unidades
        async cargarUnidades() {
            this.loadingUnidades = true;
            try {
                const res = await obtenerUnidades(axios);
                //const res = await axios.get('http://10.101.0.8:4004/api/ms-sigesu/anexo/unidadesSugesu');
                this.unidades = res.data.data || [];
                this.autoseleccionarTipoOculto();
                this.autoseleccionarUnidadOculta();
            } catch (error) {
                this.$q.notify({ type: 'negative', message: 'Error al cargar unidades' });
            } finally {
                this.loadingUnidades = false;
            }
        },

        // Cargar servicios según unidad seleccionada
        async cargarServicios() {
            if (!this.unidadSeleccionada) return;
            this.loadingServicios = true;
            try {
                const res = await obtenerServicios(axios, this.unidadSeleccionada);
                this.servicios = res.data.data || [];
                this.autoseleccionarServicioOculto();
            } catch (error) {
                this.$q.notify({ type: 'negative', message: 'Error al cargar servicios' });
            } finally {
                this.loadingServicios = false;
            }
        },

        // Cargar anexos según unidad + servicio seleccionados
        async cargarAnexos() {
            if (!this.unidadSeleccionada || !this.servicioSeleccionado) return;
            this.loadingAnexos = true;
            try {
                const res = await obtenerAnexos(axios, this.unidadSeleccionada, this.servicioSeleccionado);
                this.anexos = res.data.data || [];
                this.autoseleccionarAnexoOculto();
            } catch (error) {
                this.$q.notify({ type: 'negative', message: 'Error al cargar anexos' });
            } finally {
                this.loadingAnexos = false;
            }
        },
        async cargarResultados() {
            if (!this.unidadSeleccionada || !this.servicioSeleccionado || !this.anexoSeleccionado) return;
            this.loadingResultados = true;
            try {
                const res = await listarAnexos(axios, this.unidadSeleccionada, this.servicioSeleccionado, this.anexoSeleccionado);
                this.resultados = res.data.data || [];
            } catch (error) {
                this.$q.notify({ type: 'negative', message: 'Error al cargar resultados' });
            } finally {
                this.loadingResultados = false;
            }
        },

        resetModo() {
            this.resetFooterFichaFlotante();
            this.cancelarAlertasReglasBloqueantes();
            this.resetCierreFicha();
            this.dialogErroresInline = false;
            this.erroresInline = [];
            this.dialogPendientesGuardado = false;
            this.guardandoConPendientes = false;
            this.pendientesGuardado = [];
            this.modo = null;
            this.codigoNNAFicha = '';
            this.seccionAbierta = null;
            this.modoSupervision = null;
            this.acreVigente = null;
            this.fechaAcreditacion = null;
            this.dialogHttpPregunta = false;
            this.preguntaHttpActiva = null;
            this.formHttpPregunta = {};
        },
        normalizarModalidad(valor) {
            if (valor === null || valor === undefined) return null;
            const texto = String(valor).trim().toUpperCase();
            if (!texto) return null;
            if (texto === 'PRESENCIAL') return 'PRESENCIAL';
            if (texto === 'NO PRESENCIAL' || texto === 'NOPRESENCIAL' || texto === 'VIRTUAL') return 'NO PRESENCIAL';
            return null;
        },
        normalizarAcreditacionVigenteEntero(valor) {
            const texto = valor === null || valor === undefined ? '' : String(valor).trim().toUpperCase();
            return (texto === '1' || texto === 'SI' || texto === 'S') ? 1 : 0;
        },
        normalizarFechaAcreditacionISO(valor) {
            if (!valor) return null;
            const texto = String(valor).trim();
            const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (iso) return texto;
            const latam = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
            if (latam) {
                const [, dd, mm, yyyy] = latam;
                return `${yyyy}-${mm}-${dd}`;
            }
            return null;
        },
        sincronizarModalidadDesdeFuente(fuente = {}) {
            const modalidadFuente = fuente.modalidad ?? fuente.modoSupervision ?? fuente.modo_supervision ?? null;
            this.modoSupervision = this.normalizarModalidad(modalidadFuente);
        },
        sincronizarAcreditacionDesdeFuente(fuente = {}) {
            const acreFuente = fuente.acreditacionVigente ?? fuente.acreVigente ?? fuente.acreditacion ?? null;
            const acreInt = this.normalizarAcreditacionVigenteEntero(acreFuente);
            this.acreVigente = String(acreInt);
            const fechaFuente = fuente.fechaAcreditacion ?? fuente.fecAcreditacion ?? fuente.fecha_acreditacion ?? null;
            this.fechaAcreditacion = acreInt === 1 ? this.normalizarFechaAcreditacionISO(fechaFuente) : null;
        },

        async descargarPDF() {
            try {

                const response = await descargarFichaPdf(this.$axios, this.form.idAnexoCabecera, this.form.correlativo);

                const blob = new Blob([response.data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = `Anexo_${this.form.idAnexoCabecera}.pdf`;
                link.click();

                window.open(url, "_blank");
                //  window.URL.revokeObjectURL(url);

            } catch (error) {
            }
        },
        getAudioUrl(file) {
            return `${process.env.API_URL}/uploads/audios/${file}`;
        },

        abrirDialogAudios(row) {
            this.audioRow = row;
            this.dialogAudios = true;
            this.cargarAudios();
        },

        async generarCompromisoAudio() {
            if (!this.audioRow || !this.audioRow.idAnexoCabecera || !this.audioRow.correlativo) {
                this.$q.notify({ type: "warning", message: "No se encontró la ficha para generar el compromiso" });
                return;
            }

            this.generandoCompromiso = true;
            try {
                const { data, headers } = await descargarCompromisoPdf(this.$axios, this.audioRow.idAnexoCabecera, this.audioRow.correlativo);

                const disposition = headers && (headers["content-disposition"] || headers["Content-Disposition"]);
                let filename = `compromiso_${this.audioRow.idAnexoCabecera}.pdf`;
                if (disposition) {
                    const match = /filename="?([^\"]+)"?/.exec(disposition);
                    if (match && match[1]) filename = match[1];
                }

                const blob = new Blob([data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                this.$q.notify({ type: "negative", message: "Error al generar el compromiso" });
            } finally {
                this.generandoCompromiso = false;
            }
        },

        async cargarAudios() {
            if (!this.audioRow) return;
            this.loadingAudios = true;
            try {
                const res = await listarAudios(this.$axios, this.audioRow.idAnexoCabecera);
                const data = res.data?.data || [];
                this.audiosList = data.map(item => ({
                    idAudio: item.ACA_ID_AUDIO,
                    nombreArchivo: item.ACA_NOMBRE_ARCHIVO,
                    estado: item.ACA_ESTADO
                }));
            } catch (error) {
                this.$q.notify({ type: "negative", message: "Error al cargar la conformidad" });
            } finally {
                this.loadingAudios = false;
            }
        },

        esArchivoPdf(file) {
            if (!file) return false;
            const nombre = String(file.name || "").toLowerCase();
            const mime = String(file.type || "").toLowerCase();
            return nombre.endsWith(".pdf") || mime === "application/pdf";
        },

        async subirAudio() {
            if (!this.audioFile) {
                this.$q.notify({ type: "warning", message: "Seleccione un archivo PDF" });
                return;
            }

            if (!this.fechaInscripcion) {
                this.$q.notify({ type: "warning", message: "Ingrese la fecha de inscripción" });
                return;
            }

            if (this.tieneConformidadRegistrada) {
                this.$q.notify({ type: "warning", message: "Solo se permite una conformidad registrada" });
                return;
            }

            if (!this.esArchivoPdf(this.audioFile)) {
                this.$q.notify({ type: "negative", message: "Solo se permiten archivos PDF" });
                return;
            }

            this.loadingAudios = true;
            try {
                const formData = new FormData();
                formData.append("audio", this.audioFile);
                formData.append("idAnexoCabecera", this.audioRow.idAnexoCabecera);

                await subirAudio(this.$axios, formData);

                await guardarConformidadNna(this.$axios, this.audioRow.idAnexoCabecera, this.fechaInscripcion);

                this.$q.notify({ type: "positive", message: "Conformidad registrada correctamente" });

                this.audioFile = null;
                this.fechaInscripcion = null;
                await this.cargarAudios();
                await this.cargarTablaAnexos();
            } catch (error) {
                await this.cargarAudios();
                this.$q.notify({ type: "negative", message: "Error al guardar la conformidad" });
            } finally {
                this.loadingAudios = false;
            }
        },

        async eliminarAudio(row) {
            this.$q.dialog({
                title: "ELIMINAR CONFORMIDAD",
                message: `¿Eliminar la conformidad <strong>${row.nombreArchivo}</strong>?`,
                html: true,
                persistent: true,
                class: "audio-delete-dialog dialog-mensaje",
                focus: "cancel",
                ok: {
                    label: "Eliminar",
                    icon: "delete",
                    color: "negative",
                    unelevated: true
                },
                cancel: {
                    label: "Cancelar",
                    icon: "close",
                    color: "grey-5",
                    textColor: "dark",
                    unelevated: true
                }
            }).onOk(async () => {
                this.loadingAudios = true;
                try {
                    await eliminarAudio(this.$axios, row.idAudio);

                    this.$q.notify({ type: "positive", message: "Conformidad eliminada correctamente" });
                    await this.cargarAudios();
                } catch (error) {
                    this.$q.notify({ type: "negative", message: "Error al eliminar la conformidad" });
                } finally {
                    this.loadingAudios = false;
                }
            });
        },

        async obtenerBlobConformidad(row) {
            const res = await obtenerAudioBlob(this.$axios, this.audioRow.idAnexoCabecera, row.idAudio);

            return res.data;
        },

        async descargarConformidad(row) {
            try {
                const data = await this.obtenerBlobConformidad(row);
                const blob = new Blob([data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = row.nombreArchivo || `conformidad_${row.idAudio}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                this.$q.notify({ type: "negative", message: "Error al descargar la conformidad" });
            }
        },

        async verPdfConformidad(row) {
            try {
                const data = await this.obtenerBlobConformidad(row);
                const blob = new Blob([data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                window.open(url, "_blank");
                window.setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                }, 1000);
            } catch (error) {
                this.$q.notify({ type: "negative", message: "Error al visualizar el PDF" });
            }
        },

        limpiarAudioDialog() {
            this.audioRow = null;
            this.audiosList = [];
            this.audioFile = null;
            this.fechaInscripcion = null;
        },

        async cargarResponsables() {
            try {

                const res = await obtenerResponsablesSupervision(this.$axios)

                const responsables = Array.isArray(res.data) ? res.data : []
                this.responsables = responsables
                    .map(r => ({
                        ...r,
                        idPersonal: this.normalizarIdResponsable(r.idPersonal)
                    }))
                    .filter(r => r.idPersonal !== null)

            } catch (error) {

                this.$q.notify({
                    type: "negative",
                    message: "Error al cargar responsables"
                })

            }
        },
        async buscarTrabajadorCentro(val, update) {

            if (val.length < 2) {
                update(() => {
                    this.trabajadoresCentro = []
                })
                return
            }

            try {
                const idUnidadOrganica = this.obtenerIdUnidadOrganicaCentro()
                if (!idUnidadOrganica) {
                    update(() => {
                        this.trabajadoresCentro = []
                    })
                    return
                }

                const res = await obtenerResponsablesCentro(this.$axios, idUnidadOrganica)

                update(() => {
                    this.trabajadoresCentro = res.data.map(t => ({
                        ...t,
                        idPersonal: String(t.idPersonal)
                    }))
                })

            } catch (error) {
            }

        },
        buildIdSupervisadoPayload() {
            const ids = Array.isArray(this.form.idsSupervisados)
                ? this.form.idsSupervisados.map(id => String(id).trim()).filter(Boolean)
                : [];
            if (!ids.length) return '';

            return ids.map(id => {
                const trabajador = this.trabajadoresCentro.find(
                    t => String(t.idPersonal) === id
                );
                const nombre = (trabajador && trabajador.nombre !== undefined && trabajador.nombre !== null)
                    ? String(trabajador.nombre).replace(/[|,]/g, ' ').trim()
                    : '';
                return `${id},${nombre}`;
            }).join('|');
        },
        parseIdSupervisado(idSupervisado) {
            if (!idSupervisado) return [];
            if (Array.isArray(idSupervisado)) return idSupervisado.map(String);
            if (typeof idSupervisado === 'number') return [String(idSupervisado)];
            if (typeof idSupervisado !== 'string') return [];

            const valor = idSupervisado.trim();
            if (!valor) return [];

            const tieneFormatoNuevo = valor.includes('|') || this.esFormatoIdNombreSimple(valor);

            if (tieneFormatoNuevo) {
                return valor
                    .split('|')
                    .map(segmento => {
                        const item = segmento.trim();
                        if (!item) return '';
                        const posComa = item.indexOf(',');
                        return (posComa === -1 ? item : item.slice(0, posComa)).trim();
                    })
                    .filter(Boolean);
            }

            return valor
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
        },
        esFormatoIdNombreSimple(valor) {
            const partes = valor.split(',');
            if (partes.length !== 2) return false;
            const id = (partes[0] || '').trim();
            const nombre = (partes[1] || '').trim();
            return /^\d+$/.test(id) && !!nombre;
        },
        parseIdSupervisadoConNombre(idSupervisado) {
            if (typeof idSupervisado !== 'string') return [];
            const valor = idSupervisado.trim();
            if (!valor) return [];

            if (!(valor.includes('|') || this.esFormatoIdNombreSimple(valor))) {
                return [];
            }

            return valor
                .split('|')
                .map(segmento => {
                    const item = segmento.trim();
                    if (!item) return null;
                    const posComa = item.indexOf(',');
                    if (posComa === -1) {
                        const soloId = item.trim();
                        if (!soloId) return null;
                        return { idPersonal: soloId, nombre: '' };
                    }

                    const idPersonal = item.slice(0, posComa).trim();
                    const nombre = item.slice(posComa + 1).trim();
                    if (!idPersonal) return null;
                    return { idPersonal, nombre };
                })
                .filter(Boolean);
        },
        sincronizarOpcionesSupervisados(idSupervisado, nombreSupervisado) {
            const detalle = this.parseIdSupervisadoConNombre(idSupervisado);

            if (detalle.length) {
                detalle.forEach(item => {
                    const index = this.trabajadoresCentro.findIndex(
                        t => String(t.idPersonal) === String(item.idPersonal)
                    );

                    if (index === -1) {
                        this.trabajadoresCentro.push({
                            idPersonal: String(item.idPersonal),
                            nombre: item.nombre || `ID: ${item.idPersonal}`
                        });
                    } else if (item.nombre) {
                        this.trabajadoresCentro[index].nombre = item.nombre;
                    }
                });
                return;
            }

            if (idSupervisado && nombreSupervisado) {
                const ids = this.parseIdSupervisado(idSupervisado);
                ids.forEach(id => {
                    const existe = this.trabajadoresCentro.find(x => x.idPersonal === id);
                    if (!existe) {
                        this.trabajadoresCentro.push({
                            idPersonal: String(id),
                            nombre: nombreSupervisado
                        });
                    }
                });
            }
        },
        async precargarTrabajadoresCentro() {
            const idUnidadOrganica = this.obtenerIdUnidadOrganicaCentro()
            if (!idUnidadOrganica) return
            try {
                const res = await obtenerResponsablesCentro(this.$axios, idUnidadOrganica)
                this.trabajadoresCentro = res.data.map(t => ({
                    ...t,
                    idPersonal: String(t.idPersonal)
                }))
            } catch (error) {
            }
        },
        abrirDialogSupervisados() {
            this.selectedSupervisados = []
            this.filtroSupervisados = ''
            // Pre-seleccionar los ya elegidos
            this.selectedSupervisados = this.trabajadoresCentro.filter(
                t => this.form.idsSupervisados.includes(t.idPersonal)
            )
            this.dialogSupervisados = true
        },
        confirmarSupervisados() {
            const nuevosIds = this.selectedSupervisados.map(s => s.idPersonal)
            // Fusionar sin duplicados
            this.form.idsSupervisados = [...new Set([
                ...this.form.idsSupervisados,
                ...nuevosIds
            ])]
            this.dialogSupervisados = false
        },
        normalizarNumeroNoNegativo(value) {
            if (value === '' || value === null || value === undefined) return null;
            const n = Number(value);
            if (!Number.isFinite(n)) return value;
            return n < 0 ? 0 : value;
        },
        validarPregunta(pregunta) {

            const reglas = []

            if (pregunta.obligatoria === 1) {
                reglas.push(v => !!v || 'Este campo es obligatorio')
            }

            return [...reglas, ...this.validarContenidoPregunta(pregunta)]
        },
        validarContenidoPregunta(pregunta) {
            const reglas = []

            if (this.usaTipoNumero(pregunta)) {
                reglas.push(v => !v || !isNaN(v) || 'Debe ingresar un número')
                reglas.push(v => v === null || v === '' || Number(v) >= 0 || 'No se permiten valores negativos')
            }

            if (this.esPreguntaFecha(pregunta)) {
                reglas.push(v => !v || questionEngine.isValidIsoQuestionDate(v) || 'Debe ingresar una fecha válida')
            }

            return reglas
        },
        validarPreguntaTextM(pregunta) {
            const reglas = []

            if (pregunta.obligatoria === 1) {
                reglas.push(() => {
                    const items = Array.isArray(pregunta?.respuesta) ? pregunta.respuesta : []
                    return items.length > 0 || 'Este campo es obligatorio'
                })
            }

            return reglas
        },
        validarPreguntaNumberM(pregunta) {
            const reglas = []
            if (pregunta.obligatoria === 1) {
                reglas.push(() => {
                    const items = Array.isArray(pregunta?.respuesta) ? pregunta.respuesta : []
                    return items.length > 0 || 'Este campo es obligatorio'
                })
            }
            return reglas
        },
        validarPreguntaTimeRangeM(pregunta) {
            const reglas = []

            reglas.push(() => {
                const inicio = String(pregunta?._timeRangeStartDraft || '').trim()
                const fin = String(pregunta?._timeRangeEndDraft || '').trim()
                if (!inicio && !fin) {
                    const items = Array.isArray(pregunta?.respuesta) ? pregunta.respuesta : []
                    if (pregunta.obligatoria === 1) {
                        return items.length > 0 || 'Este campo es obligatorio'
                    }
                    return true
                }

                if (!pregunta?._timeRangeAttemptedAdd) return true

                return !!inicio && !!fin || 'Debe completar el rango de horas'
            })

            return reglas
        },
        validarPregunta2(pregunta) {

            const reglas = []

            if (pregunta.obligatoria2 === 1 && this.mostrarPregunta2(pregunta)) {
                reglas.push(v => !!v || 'Este campo es obligatorio')
            }

            return [...reglas, ...this.validarContenidoPregunta2(pregunta)]
        },
        validarContenidoPregunta2(pregunta) {
            const reglas = []

            if (pregunta.tipoDato2 === 'NUMBER') {
                reglas.push(v => !v || !isNaN(v) || 'Debe ingresar un número')
                reglas.push(v => v === null || v === '' || Number(v) >= 0 || 'No se permiten valores negativos')
            }

            return reglas
        },
        limpiarRespuestasOcultas() {
            if (this.modo !== 'nuevo') return

            this.secciones.forEach(sec => {
                sec.preguntas.forEach(p => {
                    if (!this.mostrarPregunta(p)) {
                        switch (p.tipoControl) {
                            case 'text':    p.respuesta = ''; break
                            case 'dateInputs': p.respuesta = ''; p._dateInputsYearDraft = ''; p._dateInputsMonthDraft = ''; p._dateInputsDayDraft = ''; break
                            case 'textM':   p.respuesta = []; p._textMDraft = ''; break
                            case 'numberM': p.respuesta = []; p._numberMDraft = ''; break
                            case 'timeRangeM': p.respuesta = []; p._timeRangeStartDraft = ''; p._timeRangeEndDraft = ''; p._timeRangeAttemptedAdd = false; break
                            case 'selectM': p.respuesta = []; break
                            case 'label':   p.respuesta = 2; break
                            default:        p.respuesta = null; break
                        }
                        if (this.esPreguntaBranchedInputSearch(p)) {
                            p._ramificacionesReadonlyHttp = false
                            p._branchedTriggerValue = ''
                            p._ramificaciones = (p._ramificaciones || []).map(rama => ({
                                ...rama,
                                value: ''
                            }))
                        }
                        if (this.esPreguntaBranchedSelects(p)) {
                            p._branchedSelects = (p._branchedSelects || []).map(rama => ({
                                ...rama,
                                value: '',
                                selectedOption: null,
                                options: []
                            }))
                        }
                    }
                    if (!this.mostrarPregunta2(p)) {
                        p.respuesta2 = null
                    }
                })
            })
        },

        mostrarPregunta2(pregunta) {
            const visible = this.esPregunta2VisibleSinEfectos(pregunta)
            if (!visible && pregunta.pregunta2 && this.modo === 'nuevo') this.$set(pregunta, 'respuesta2', null)
            return visible
        },
        esPregunta2VisibleSinEfectos(pregunta) {
            return questionEngine.isQuestion2Visible(pregunta, id => this.buscarPregunta(id))
        },
        mostrarPregunta(pregunta) {
            const visible = this.esPreguntaVisibleSinEfectos(pregunta)
            if (!visible && this.modo === 'nuevo') {
                switch (pregunta.tipoControl) {
                    case 'text':    this.$set(pregunta, 'respuesta', ''); break
                    case 'dateInputs': this.$set(pregunta, 'respuesta', ''); this.$set(pregunta, '_dateInputsYearDraft', ''); this.$set(pregunta, '_dateInputsMonthDraft', ''); this.$set(pregunta, '_dateInputsDayDraft', ''); break
                    case 'textM': this.$set(pregunta, 'respuesta', []); this.$set(pregunta, '_textMDraft', ''); break
                    case 'numberM': this.$set(pregunta, 'respuesta', []); this.$set(pregunta, '_numberMDraft', ''); break
                    case 'selectM': this.$set(pregunta, 'respuesta', []); break
                    case 'label':   this.$set(pregunta, 'respuesta', 2); break
                    default:        this.$set(pregunta, 'respuesta', null); break
                }
            }
            return visible
        },
        esPreguntaVisibleSinEfectos(pregunta) {
            return questionEngine.isQuestionVisible(pregunta, id => this.buscarPregunta(id))
        },
        buscarPregunta(id) {
            for (const seccion of this.secciones) {
                const p = seccion.preguntas.find(x => x.idPregunta === id)
                if (p) return p
            }
            return null
        },
        normalizarCondicion(valorBase, condValor) {
            return questionEngine.matchesCondition(valorBase, condValor);
        },
        parseCondicion(condicion) {
            return questionEngine.parseCondition(condicion);
        },

        async abrirDialogValidarFicha(row) {
            if (!this.puedeValidarFicha(row)) {
                this.$q.notify({
                    type: "warning",
                    message: "Esta ficha no requiere validación"
                });
                return;
            }
            this.fichaAValidar = row;
            this.personalValidacion = [];
            this.mostrarInputValidar = {};
            this.mostrarContrasenaValidar = {};
            this.loadingCargarPersonal = true;

            let idRespSupervision = row.idRespSupervision;
            let respSupervision = row.respSupervision;
            let idDirector = row.idDirector;
            let respDirector = row.respDirector;
            let idSupervisado = row.idSupervisado;
            let idsPersonalValida = [];
            let detalleData = null;

            try {
                const validacionPersistida = await this.obtenerIdsPersonalValidaPersistidos(
                    row.idAnexoCabecera,
                    row.correlativo
                );
                detalleData = validacionPersistida.detalleData;
                idsPersonalValida = validacionPersistida.idsPersonalValida;
            } catch (error) {
                this.$q.notify({ type: "negative", message: "Error al obtener datos de validación de la ficha" });
            }

            // Si la tabla principal no trae los IDs de personal, los obtenemos del detalle
            if (!idRespSupervision || !respSupervision || !idDirector || !respDirector || !idSupervisado) {
                if (detalleData) {
                    if (!idRespSupervision) idRespSupervision = detalleData.idRespSupervision;
                    if (!respSupervision) respSupervision = detalleData.respSupervision;
                    if (!idDirector) idDirector = detalleData.idDirector;
                    if (!respDirector) respDirector = detalleData.respDirector;
                    if (!idSupervisado) idSupervisado = detalleData.idSupervisado;
                }
            }

            let trabajadores = [];
            try {
                const idUnidadOrganica = await this.obtenerIdUnidadOrganicaCentroDesdeFila(row);
                if (!idUnidadOrganica) {
                    this.$q.notify({ type: "warning", message: "No se pudo obtener el centro para cargar personal" });
                } else {
                const res = await obtenerResponsablesCentro(this.$axios, idUnidadOrganica);
                const data = res.data?.data || res.data || [];
                trabajadores = Array.isArray(data) ? data.map(t => ({
                    ...t,
                    idPersonal: String(t.idPersonal)
                })) : [];
                }
            } catch (error) {
                this.$q.notify({ type: "negative", message: "Error al cargar el personal del centro" });
            }

            const personal = [];

            // Responsable de supervisión
            if (idRespSupervision) {
                const idStr = String(idRespSupervision);
                const yaValidado = idsPersonalValida.includes(idStr);
                const encontrado = trabajadores.find(t => t.idPersonal === idStr);
                personal.push({
                    idPersonal: idStr,
                    nombre: respSupervision || (encontrado ? encontrado.nombre : `ID: ${idStr}`),
                    cargo: 'RESPONSABLE SUPERVISIÓN',
                    contrasena: '',
                    validado: yaValidado,
                    validando: false
                });
            }

            // Director
            if (idDirector) {
                const idStr = String(idDirector);
                const yaValidado = idsPersonalValida.includes(idStr);
                const encontrado = trabajadores.find(t => t.idPersonal === idStr);
                personal.push({
                    idPersonal: idStr,
                    nombre: respDirector || (encontrado ? encontrado.nombre : `ID: ${idStr}`),
                    cargo: 'DIRECTOR',
                    contrasena: '',
                    validado: yaValidado,
                    validando: false
                });
            }

            // Supervisados
            const idsSupervisados = this.parseIdSupervisado(idSupervisado);
            idsSupervisados.forEach(id => {
                const yaValidado = idsPersonalValida.includes(id);
                const encontrado = trabajadores.find(t => t.idPersonal === id);
                personal.push({
                    idPersonal: id,
                    nombre: encontrado ? encontrado.nombre : `ID: ${id}`,
                    cargo: 'SUPERVISADO',
                    contrasena: '',
                    validado: yaValidado,
                    validando: false
                });
            });

            this.personalValidacion = personal;
            this.loadingCargarPersonal = false;

            if (personal.length === 0) {
                this.$q.notify({ type: "warning", message: "No se encontró personal para validar en esta ficha" });
            }

            this.dialogValidarFicha = true;
        },

        async validarPersonal(item) {
            if (this.esFichaSuscrita(this.fichaAValidar)) return;
            if (!item.contrasena) {
                this.$q.notify({ type: "warning", message: "Ingrese la contraseña" });
                return;
            }

            item.validando = true;

            try {
                const idPersonalParam = this.construirIdPersonalValidacion(item);
                await validarPersonal(this.$axios, this.fichaAValidar.idAnexoCabecera, idPersonalParam, item.contrasena);

                item.validado = true;
                item.contrasena = '';
                this.ocultarInputValidar(item.idPersonal);

                try {
                    const validacionPersistida = await this.obtenerIdsPersonalValidaPersistidos(
                        this.fichaAValidar.idAnexoCabecera,
                        this.fichaAValidar.correlativo
                    );
                    const idsValidados = validacionPersistida.idsPersonalValida;

                    this.personalValidacion = this.personalValidacion.map(persona => ({
                        ...persona,
                        validado: idsValidados.includes(String(persona.idPersonal))
                    }));
                } catch (syncError) {
                }

                this.$q.notify({ type: "positive", message: `${item.nombre} validado correctamente` });

            } catch (error) {
                this.$q.notify({ type: "negative", message: `Error al validar a ${item.nombre}` });
            } finally {
                item.validando = false;
            }
        },

        async darConformidad() {
            if (this.esFichaSuscrita(this.fichaAValidar)) return;
            if (!this.todosValidados) {
                this.$q.notify({ type: "warning", message: "Faltan personal por validar" });
                return;
            }

            this.validandoConformidad = true;

            try {
                await guardarConformidadFicha(this.$axios, this.fichaAValidar.idAnexoCabecera);

                this.$q.notify({ type: "positive", message: "Ficha validada con conformidad" });
                this.dialogValidarFicha = false;
                this.cargarTablaAnexos();

            } catch (error) {
                this.$q.notify({ type: "negative", message: "Error al dar conformidad a la ficha" });
            } finally {
                this.validandoConformidad = false;
            }
        },

        resetValidacion() {
            this.fichaAValidar = null;
            this.personalValidacion = [];
            this.validandoConformidad = false;
            this.mostrarInputValidar = {};
            this.mostrarContrasenaValidar = {};
        },
        resetCierreFicha() {
            this.dialogPendientesCierre = false;
            this.dialogConfirmarCierreFicha = false;
            this.cerrandoFicha = false;
            this.pendientesCierre = [];
        },

        ocultarInputValidar(idPersonal) {
            this.$set(this.mostrarInputValidar, idPersonal, false);
            this.$set(this.mostrarContrasenaValidar, idPersonal, false);
        },

        obtenerIdUnidadOrganicaCentro() {
            return this.form.idCentro || this.centroSeleccionado?.idUnidadOrganica || null;
        },

        async obtenerIdUnidadOrganicaCentroDesdeFila(row) {
            if (row?.idCentro) return row.idCentro;
            if (this.form.idCentro) return this.form.idCentro;
            if (this.centroSeleccionado?.idUnidadOrganica) return this.centroSeleccionado.idUnidadOrganica;
            if (!row?.idServicio) return null;

            try {
                const res = await listarCentros(this.$axios, row.idServicio);

                const centros = res.data || [];
                if (!Array.isArray(centros) || centros.length === 0) return null;

                const centro = centros.find(c =>
                    c.idUnidadOrganica === row.idCentro ||
                    c.nombreUnidad === row.nombreCentro
                );

                return centro?.idUnidadOrganica || null;
            } catch (error) {
                return null;
            }
        }

    },


    async created() {

        await this.cargarUnidades();
        this.cargarTablaAnexos();
        this.cargarResponsables()
    },
    beforeDestroy() {
        this.removerEventosArrastreFooterFicha();
        this.cancelarAlertasReglasBloqueantes();
    },
    watch: {
        async unidadSeleccionada() {
            this.servicioSeleccionado = null;
            this.anexoSeleccionado = null;
            this.servicios = [];
            this.anexos = [];
            this.centroSeleccionado = null
            this.centroNombre = ""

            if (this.unidadSeleccionada) await this.cargarServicios();
        },
        async servicioSeleccionado() {
            this.anexoSeleccionado = null;
            this.anexos = [];
            this.centroSeleccionado = null
            this.centroNombre = ""
            this.centros = [];

            if (this.servicioSeleccionado) {
                await this.cargarCentros();
                await this.cargarAnexos();
            }
        },
        acreVigente(val) {
            if (val !== '1') {
                this.fechaAcreditacion = null
            }
        },
        firmaValoresDefaultBifurcacionesActual() {
            this.sincronizarValoresDefaultBifurcaciones();
        },
        firmaValoresDefaultActual() {
            this.sincronizarValoresDefault();
        }

    },
    computed: {

        firmaValoresDefaultBifurcacionesActual() {
            return this.firmaValoresDefaultBifurcaciones();
        },
        firmaValoresDefaultActual() {
            return this.firmaValoresDefault();
        },

        accionesPrincipalesConfiguradas() {
            return this.pageConfig.accionesPrincipales || {};
        },

        accionesTablaConfiguradas() {
            return this.pageConfig.accionesTabla || {};
        },

        mostrarAvisoPendientesGuardado() {
            return this.pageConfig.mostrarAvisoPendientesGuardado === true;
        },

        columnasTablaConfiguradas() {
            return this.pageConfig.tableColumns || this.columnasTableAnexos;
        },

        conformidadSoloLecturaEnVer() {
            return this.pageConfig.conformidadSoloLecturaEnVer === true;
        },

        mostrarConformidadSoloLectura() {
            return this.esVisualizacion && this.conformidadSoloLecturaEnVer;
        },

        columnasAudiosSoloLectura() {
            return [
                { name: 'nro', label: 'N°', field: 'nro', align: 'center', sortable: false, style: 'width: 50px;' },
                { name: 'nombreArchivo', label: 'NOMBRE DE ARCHIVO', field: 'nombreArchivo', align: 'left', sortable: true },
                { name: 'acciones', label: 'ACCIONES', field: 'acciones', align: 'center', style: 'width: 100px;' }
            ];
        },

        filtersComponent() {
            return this.pageConfig.components?.filters || 'FichaFilters';
        },

        primaryActionsComponent() {
            return this.pageConfig.components?.primaryActions || 'FichaPrimaryActions';
        },

        tableComponent() {
            return this.pageConfig.components?.table || 'FichaTable';
        },

        puedeSeleccionarEspacioIntervencion() {
            return !!this.unidadSeleccionada && !!this.servicioSeleccionado;
        },

        tieneConformidadRegistrada() {
            return Array.isArray(this.audiosList) && this.audiosList.length > 0;
        },

        puedeSubirConformidad() {
            return !!this.audioFile
                && !!this.fechaInscripcion
                && !this.loadingAudios
                && !this.tieneConformidadRegistrada;
        },

        fichaFooterFloatingStyle() {
            if (
                !this.$q.screen.lt.md ||
                this.fichaFooterPosicion.x === null ||
                this.fichaFooterPosicion.y === null
            ) {
                return {};
            }

            return {
                left: `${this.fichaFooterPosicion.x}px`,
                top: `${this.fichaFooterPosicion.y}px`,
                right: "auto",
                bottom: "auto"
            };
        },
        fichaContexto() {
            const responsable = this.form.respSupervision || this.obtenerNombreCompletoSesion() || '';
            const responsableNormalizado = String(responsable)
                .replace(/\s+/g, ' ')
                .trim()
                .toUpperCase();

            return [
                { label: 'PERIODO', value: this.fichaPeriodo || this.anioSeleccionado || '' },
                { label: 'EDUCADOR DE CALLE', value: responsableNormalizado },
                { label: 'FECHA REGISTRO', value: this.formatearFechaIso(this.form.fechaRegistro) }
            ];
        },
        tituloModalHttpPregunta() {
            return this.preguntaHttpActiva?.pregunta || 'Búsqueda dinámica';
        },
        camposModalHttpPregunta() {
            return (this.preguntaHttpActiva?._httpParamsParsed || [])
                .filter(campo => !!campo.paramKey)
                .map(campo => ({
                    label: campo.label || campo.paramKey,
                    paramKey: campo.paramKey,
                    type: campo.type || 'text'
                }));
        },
        codigosConAcreditacion() {
            return [
                "FO_CAR01", "FS_CAR02"
            ]
        },
        mostrarAcreditacion() {
            return this.codigosConAcreditacion.includes(this.form.codigoAnexo2)
        },
        mostrarFechaAcreditacion() {

            // 🔹 primero validar que el anexo aplique
            if (!this.mostrarAcreditacion) return false

            // 🔹 luego validar respuesta SI
            const valor = this.acreVigente?.toString().toUpperCase()

            return valor === "1" || valor === "SI"
        },
        puedeCrearNuevo() {
            return !!this.anioSeleccionado &&
                this.anioSeleccionado !== 'TODOS' &&
                !!this.tipoFicha &&
                !!this.unidadSeleccionada &&
                !!this.servicioSeleccionado &&
                !!this.centroSeleccionado &&
                !!this.anexoSeleccionado
        },
        puedeIntentarNuevo() {
            return !!this.unidadSeleccionada &&
                !!this.servicioSeleccionado &&
                !!this.centroSeleccionado &&
                !!this.anexoSeleccionado
        },
        periodoYTipoValidos() {
            const periodoValido = this.anioSeleccionado !== null &&
                this.anioSeleccionado !== undefined &&
                this.anioSeleccionado !== '' &&
                this.anioSeleccionado !== 'TODOS'
            const tipoValido = this.tipoFicha !== null && this.tipoFicha !== undefined && this.tipoFicha !== ''
            return periodoValido && tipoValido
        },
        tituloAnexo() {

            const anexo = this.anexos.find(
                a => a.idAnexo === this.form.idAnexo
            )

            if (!anexo) {
                return this.form.codigoAnexo2
                    ? `${this.form.codigoAnexo2} - ${this.form.nombreAnexo}`
                    : 'INSTRUMENTO DE SUPERVISIÓN'
            }

            return `${anexo.codigoAnexo2} - ${anexo.nombreAnexo}`

        },
        esVisualizacion() {
            return this.modo === "ver";
        },
        modoEdicion() {
            return this.modo === "editar";
        },
        dataTableFiltrada() {
            const estadosVisibles = Array.isArray(this.pageConfig.visibleEstados)
                ? this.pageConfig.visibleEstados.map(estado => Number(estado))
                : null;
            const base = this.anexosRaw.filter(row => {
                const estado = Number(row.estado);
                if (estado === 0) return false;
                return !estadosVisibles || estadosVisibles.includes(estado);
            });
            // Si no hay ningun filtro activo, devolver todos los registros
            if (!this.anioSeleccionado && !this.tipoFicha && !this.unidadSeleccionada &&
                !this.servicioSeleccionado && !this.centroSeleccionado && !this.anexoSeleccionado) {
                return base
                    .slice()
                    .sort((a, b) => Number(b.correlativo || 0) - Number(a.correlativo || 0))
                    .map(row => ({
                        ...row,
                        correlativoFormateado: String(row.correlativo || 0).padStart(5, '0'),
                        codigoNNA: row.codigoNNA ? String(row.codigoNNA).toUpperCase() : '-',
                        nombreCompleto: row.nombreCompleto || '-',
                        edad: Number(row.edad || 0),
                        genero: row.genero || '-',
                        nombreCentro: row.nombreCentro || '-',
                        nombrePersonal: row.nombrePersonal || '-',
                        fechaIngresoFormateada: this.formatearFechaTabla(row.fechaIngreso),
                        fechaAbordajeFormateada: this.formatearFechaTabla(row.fechaAbordaje)
                    }));
            }

            // Obtener nombres de los objetos seleccionados para comparacion exacta
            const unidad = this.unidades.find(u => u.idUnidad === this.unidadSeleccionada);
            const servicio = this.servicios.find(s => s.idServicio === this.servicioSeleccionado);
            const centro = this.centroSeleccionado;

            return base.filter(row => {
                if (this.anioSeleccionado && this.anioSeleccionado !== 'TODOS' && row.periodo !== this.anioSeleccionado) return false;
                if (this.tipoFicha && row.tipo !== this.tipoFicha) return false;
                if (this.unidadSeleccionada && row.nombreUnidad !== (unidad?.nombreUnidad || '')) return false;
                if (this.servicioSeleccionado && row.nombreServicio !== (servicio?.nombreServicio || '')) return false;
                if (this.centroSeleccionado && row.nombreCentro !== (centro?.nombreUnidad || '')) return false;
                if (this.anexoSeleccionado && row.idAnexo !== this.anexoSeleccionado) return false;
                return true;
            })
                .sort((a, b) => Number(b.correlativo || 0) - Number(a.correlativo || 0))
                .map(row => ({
                    ...row,
                    correlativoFormateado: String(row.correlativo || 0).padStart(5, '0'),
                    codigoNNA: row.codigoNNA ? String(row.codigoNNA).toUpperCase() : '-',
                    nombreCompleto: row.nombreCompleto || '-',
                    edad: Number(row.edad || 0),
                    genero: row.genero || '-',
                    nombreCentro: row.nombreCentro || '-',
                    nombrePersonal: row.nombrePersonal || '-',
                    fechaIngresoFormateada: this.formatearFechaTabla(row.fechaIngreso),
                    fechaAbordajeFormateada: this.formatearFechaTabla(row.fechaAbordaje)
                }));
        },

        codigosConTotales() {
            return [
                "FS_CAR01",
                "FS_CAR02",
                "FS_CED01",
                "FS_CED02",
                "FS_SEC01",
                "FS_SEC02",
                "FS_ACE01",
                "FS_ACE02",
                "FS_FAM01",
                "FS_FAM02",
                "FS_AEA01",
                "FS_AEA02",
                "FS_AEA03",
                "FS_INA01"
            ]
        },

        mostrarTotales() {
            return this.codigosConTotales.includes(this.form.codigoAnexo2)
        },
        totalesRespuestas() {

            const totales = {
                CONFORME: 0,
                NO_CONFORME: 0,
                OBSERVACION: 0,
                NO_APLICA: 0
            }

            this.secciones.forEach(sec => {
                sec.preguntas.forEach(p => {

                    if (!p.respuesta) return

                    const valor = p.respuesta
                        .toString()
                        .toUpperCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .trim()

                    if (valor === 'CONFORME') totales.CONFORME++
                    else if (valor === 'NO CONFORME') totales.NO_CONFORME++
                    else if (valor === 'OBSERVACION') totales.OBSERVACION++
                    else if (valor === 'NO APLICA') totales.NO_APLICA++

                })
            })


            return totales
        },

        todosValidados() {
            return this.personalValidacion.length > 0 
                && this.personalValidacion.every(p => p.validado === true);
        },
        pendientesGuardadoAgrupados() {
            return this.agruparPendientesPorSeccion(this.pendientesGuardado);
        },
        pendientesCierreAgrupados() {
            return this.agruparPendientesPorSeccion(this.pendientesCierre);
        }

    }

}
</script>
