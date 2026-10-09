# Ficha Context References

## Summary

Añadir `FECHAINGRESO` al catálogo de referencias de las preguntas dinámicas, conservando su comportamiento actual. La configuración del backend identifica la referencia mediante `modoControl: "redirected"` y `opciones: { "ref": "FECHAINGRESO" }`; no se fijan preguntas concretas.

## Contract

- Mantener la fecha persistida en `form.fechaIngreso`: cargarla desde la fila al consultar o editar y actualizarla desde el detalle únicamente si este incluye la propiedad. Un valor null del detalle limpia la fecha.
- Inicializar y limpiar la fecha al crear o restablecer el formulario para evitar valores heredados de otra ficha.
- Resolver `FECHAINGRESO` con la normalización ISO existente a `YYYY-MM-DD`; devolver vacío cuando no exista una fecha reconocida. No utilizar el borrador de fecha de conformidad ni sustituirla por la fecha actual.
- Sin `sync`, las referencias se asignan únicamente en modo Nuevo. Al consultar o editar se conserva la respuesta persistida de la pregunta y el bloqueo existente de `redirected`.
- `opciones` admite objeto o cadena JSON con `ref` y `sync`. Únicamente el booleano `sync: true` habilita volver a resolver cualquier referencia `redirected` al abrir Nuevo, Editar o Ver; no se fijan identificadores de preguntas. El valor vigente reemplaza la respuesta en memoria y una fuente vacía la limpia.
- Resolver después de cargar contexto y respuestas. Para `FECHAINGRESO` sincronizada en Editar o Ver, usar la propiedad del detalle recién consultado, incluso si es null. Si el detalle omite la propiedad, reutilizar la consulta existente de cabecera actual una sola vez por carga, compartida entre las preguntas que la necesiten.
- Una sincronización pendiente o fallida bloquea Guardar y Cerrar ficha, tanto en controles como en la persistencia. Informar el fallo y permitir recuperar la ficha cerrando y volviendo a abrir el modal.
- Abrir o consultar no escribe datos. El guardado manual permitido persiste la respuesta sincronizada mediante la serialización habitual; no modifica la fecha del proceso de conformidad. No detectar cambios externos mientras el modal esté abierto: se recuperan al reabrir.
- Etiqueta, visibilidad y obligatoriedad siguen configurándose en el catálogo. Los endpoints y payloads de escritura mantienen su contrato actual.

## Acceptance

- Una fecha ISO disponible devuelve `YYYY-MM-DD`; una fecha ausente devuelve vacío.
- Crear o restablecer después de consultar otra ficha limpia la fecha de contexto.
- Sin `sync`, consultar o editar no sobrescribe la respuesta persistida de la pregunta. Con `sync: true`, mostrar el valor vigente y persistirlo solo mediante un guardado manual permitido.
- Una fecha eliminada limpia la respuesta sincronizada. Varias preguntas comparten la consulta adicional; si esta falla, el guardado y el cierre de ficha quedan bloqueados hasta reabrir y recuperar los datos.
- Las referencias existentes, incluido `GETDATE`, conservan su comportamiento.
- La Fecha Ingreso normalmente aún no existe en Nuevo, por lo que esta referencia quedará vacía. Solo las preguntas configuradas con `sync: true` volverán a resolverla al consultar o editar.

## Validation

Realizar revisión estática y `git diff --check`; actualizar Graphify después del cambio. No ejecutar builds ni pruebas sin autorización explícita.
