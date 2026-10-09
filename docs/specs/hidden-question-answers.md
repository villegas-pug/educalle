# Limpieza de respuestas ocultas

## Summary

En ALTA y ACTUALIZAR, limpiar las respuestas de preguntas que pierdan visibilidad y las que ya estén ocultas al terminar de cargar la ficha. VER conserva los datos sin limpiarlos.

## Contract

- Conservar la evaluación actual de `condicion`, incluidos listas, alternativas, comparación normalizada y rangos numéricos. El campo `pregunta2` depende también de la respuesta principal; no se utiliza `condicion2`.
- Al ocultar toda la pregunta, vaciar respuesta principal, secundaria, textos auxiliares, listas, borradores de períodos e intervalos y valores de ramificaciones. Restablecer selecciones y estados de búsqueda asociados.
- Si solo se oculta el secundario, vaciar su respuesta y auxiliares sin modificar la principal.
- Centralizar una limpieza idempotente después de la hidratación y referencias iniciales, al cambiar respuestas y antes de validar o guardar. Resolver dependencias encadenadas hasta estabilizarse, sin depender del orden del catálogo.
- Las funciones de visibilidad no mutan respuestas. Plegar una sección o bloquear un campo mediante `editable` no limpia datos.
- Los defaults no repueblan preguntas ocultas; cuando vuelven a mostrarse mantienen sus reglas actuales. Los resultados HTTP pendientes de una pregunta limpiada quedan invalidados. Si su búsqueda estaba abierta, cerrarla y vaciar parámetros.
- ALTA envía únicamente preguntas visibles. ACTUALIZAR incluye las ocultas con `respuesta: null` y `respuesta2: null`; una pregunta visible con secundario oculto envía `respuesta2: null`.
- Mantener los IDs reales, endpoints y estructura del payload. Guardar persiste la limpieza; cancelar no modifica el backend.

## Acceptance

- Cambiar un disparador oculta y limpia la respuesta dependiente. Reactivarla no recupera su respuesta anterior, aunque un default vigente puede completar el campo vacío.
- Al abrir ACTUALIZAR, una respuesta histórica oculta se limpia en memoria. VER conserva la respuesta.
- A → B → C se limpia incluso cuando el catálogo está en orden inverso.
- Listas, períodos, horarios, búsquedas y selectores ramificados no conservan valores ni borradores derivados.
- Ocultar solo el secundario conserva la principal y limpia sus auxiliares.
- Defaults y resultados HTTP tardíos no restauran respuestas ocultas, incluso si la pregunta vuelve a aparecer antes de terminar la solicitud.
- Guardar y reabrir conserva la eliminación; cancelar conserva los valores persistidos.

## Validation And Dependencies

Revisión estática, `git diff --check` y actualización de Graphify. No ejecutar builds ni pruebas sin autorización explícita.

El procedimiento SQL inspeccionado `USP_ACTUALIZAR_ANEXO_COMPLETO_V2` actualiza únicamente las preguntas incluidas en el JSON y admite respuestas nulas. Se asume el mismo contrato en el backend desplegado; no se modifica el backend.
