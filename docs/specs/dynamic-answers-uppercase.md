# Respuestas dinámicas en mayúsculas

## Resumen

Las respuestas textuales de la ficha dinámica se muestran y capturan en mayúsculas en ALTA, ACTUALIZAR y VER. ALTA y ACTUALIZAR envían las respuestas textuales en mayúsculas al guardar. VER solo presenta los datos y no persiste cambios.

## Reglas

- Normalizar texto libre principal y secundario al hidratar, capturar y serializar, incluidos `text`, `textarea`, `textM`, valores textuales resueltos por referencias, ramificaciones de texto editables y respuestas personalizadas de `OTRO`/`OTROS`.
- Mostrar etiquetas de `select`, `selectM`, `radio` y controles equivalentes en mayúsculas. Preservar los valores, IDs y códigos originales usados por los catálogos y enviados al backend.
- Conservar las consultas de búsqueda HTTP exactamente como las escribe el usuario y como se envían al endpoint; su texto no se normaliza como respuesta. Las respuestas obtenidas y las ramificaciones de texto editables sí usan mayúsculas.
- Mantener sin cambios los valores y el comportamiento de números, fechas y horas.
- Mantener la lógica existente de condiciones, referencias y valores por defecto. Las comparaciones de texto del motor son insensibles a mayúsculas, espacios exteriores y acentos; las condiciones numéricas comparan valores numéricos.
- Conservar endpoints, contratos y formatos de serialización existentes.

## Aceptación

- Texto ingresado en minúsculas se muestra en mayúsculas y se persiste así al guardar.
- Respuestas históricas textuales en minúsculas se muestran en mayúsculas al abrir ACTUALIZAR o VER; VER no escribe datos. ACTUALIZAR las persiste al guardar explícitamente.
- Las etiquetas de opciones se muestran en mayúsculas y sus valores de catálogo mantienen exactamente su contenido original.
- Las búsquedas HTTP preservan el texto original de consulta; números, fechas y horas permanecen inalterados.
- Condiciones y referencias siguen coincidiendo cuando respuesta y regla solo difieren en mayúsculas, acentos o espacios, y mantienen listas con `|` y comparaciones numéricas.

## Validación

Revisar estáticamente los flujos de ALTA, ACTUALIZAR y VER, el motor de condiciones y los payloads de escritura. Ejecutar `git diff --check`. No ejecutar builds ni pruebas sin autorización explícita. Actualizar Graphify después de cambios materiales.
