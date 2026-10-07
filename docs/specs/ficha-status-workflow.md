# Ficha Status Workflow

## Summary

El flujo aprobado es EN REGISTRO (1) → REGISTRADO (2) → CERRADO (3). Usuario NNA muestra estados 2 y 3 para conservar la visibilidad de históricos; no se migran datos automáticamente.

## Contract

- Crear y guardar respuestas conservan el estado 1. Cerrar ficha valida y guarda las respuestas antes de enviar estado 2.
- `guardarConformidadFicha(http, idAnexoCabecera, estado = 2)` reutiliza `PATCH /saveConformidadAnexoCabecera` con los parámetros existentes.
- Una ficha REGISTRADA completa su conformidad en orden: subir PDF a `/anexo-cabecera-audio`, guardar fecha en `/save-conformidad-nna`, enviar estado 3 a `/saveConformidadAnexoCabecera`.
- Solo se comunica éxito después de completar las operaciones y actualizar la tabla desde el backend. No se presupone una transacción entre llamadas.
- Estados 2 y 3 bloquean la edición de respuestas. Estado 3 bloquea también carga, cambio de fecha y eliminación de la conformidad. Consulta, descarga y generación del compromiso siguen disponibles en estados 2 y 3.
- Dar conformidad permanece oculto, utiliza estado 2 y no permite retroceder desde 3. Anulación conserva su comportamiento y estado 0.
- Colores Quasar: 1 `amber-2` / `amber-10`; 2 `light-blue-2` / `light-blue-10`; 3 `green-2` / `green-10`. Se comparten las etiquetas de estado para presentación y ordenamiento.

## Recovery

- Mantener un bloqueo independiente del indicador de carga de documentos durante toda la operación; no liberar controles mientras se consulta la recuperación.
- Antes de completar o reintentar, consultar la cabecera y los documentos persistidos. Si la consulta falla, no realizar escrituras; mostrar una acción para volver a consultar.
- Si el PDF ya existe, permitir Completar conformidad sin duplicar la carga. Conservar la fecha seleccionada ante errores y recuperar `fechaIngreso` al reabrir; si ya coincide con la fecha persistida, no repetir su guardado.
- Después de una respuesta incierta, volver a consultar para reconocer operaciones que llegaron a persistirse. Si la ficha aparece CERRADA, bloquear reintentos de escritura.
- Explicar la etapa pendiente (documento, fecha o cambio de estado), sin borrar documentos ni ejecutar compensaciones automáticas.
- Una ficha CERRADA sin documento por inconsistencias históricas permanece bloqueada; no inferir ni modificar su estado.

## Acceptance

- Estado 1 admite edición; estados 2 y 3 no, incluso cuando el backend devuelve cadenas.
- Validación o persistencia fallida bloquea la transición 1 → 2.
- Documento y fecha preceden al envío de estado 3; no se envía 3 si falta alguna etapa.
- Fallos de carga, fecha, estado o consulta conservan lo persistido y permiten recuperación sin duplicar el PDF ni retroceder estados.
- La fecha permanece visible ante fallos y se recupera al reabrir. Un documento existente en estado 2 permite completar el cierre.
- Estado 3 impide eliminar en la interfaz y en el método; estados 2 y 3 permiten generar, ver y descargar el compromiso.
- Usuario NNA conserva fichas históricas en estado 2 y muestra nuevas fichas en estado 3.

## Validation And Dependencies

Solo comprobaciones estáticas y `git diff --check`; no ejecutar builds ni pruebas sin autorización explícita. Actualizar Graphify después de los cambios materiales.

El backend debe admitir estado 3, devolverlo en el listado y hacer cumplir sus propias restricciones de transición y eliminación. Este repositorio contiene únicamente el frontend; no se afirma que esas restricciones estén implementadas en el servidor.
