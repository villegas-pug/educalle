# Ficha Status Workflow

## Summary

El flujo aprobado es EN REGISTRO (1) → REGISTRADO (2) → SUSCRITO (3). Usuario NNA muestra estados 2 y 3 para conservar la visibilidad de históricos; no se migran datos automáticamente.

## Contract

- Crear y guardar respuestas conservan el estado 1. Cerrar ficha valida y guarda las respuestas antes de enviar estado 2.
- `guardarConformidadFicha(http, idAnexoCabecera, estado = 2)` reutiliza `PATCH /saveConformidadAnexoCabecera` con los parámetros existentes.
- Una ficha REGISTRADA completa su conformidad en orden: subir el documento PDF, JPG/JPEG o PNG a `/anexo-cabecera-audio`, guardar fecha en `/save-conformidad-nna`, enviar estado 3 a `/saveConformidadAnexoCabecera`.
- Solo se comunica éxito después de completar las operaciones y actualizar la tabla desde el backend. No se presupone una transacción entre llamadas.
- Estados 2 y 3 bloquean la edición de respuestas. Estado 3 bloquea también carga, cambio de fecha y eliminación de la conformidad. Consulta, descarga y generación del compromiso siguen disponibles en estados 2 y 3.
- Dar conformidad permanece oculto, utiliza estado 2 y no permite retroceder desde 3. Anulación conserva su comportamiento y estado 0.
- Colores Quasar: 1 `amber-2` / `amber-10`; 2 `light-blue-2` / `light-blue-10`; 3 `green-2` / `green-10`. Se comparten las etiquetas de estado para presentación y ordenamiento.
- El estado 3 se denomina SUSCRITO en tablas y SUSCRITA al referirse a una ficha. Sus identificadores son `FICHA_ESTADOS.SUSCRITO` y `esFichaSuscrita`; este cambio de denominación conserva valor numérico, icono, permisos, recuperación y endpoints.
- La acción `conformidad` no se renderiza para estado 1 (numérico o cadena). En estado 2 muestra Gestionar conformidad y en estado 3 Ver conformidad, siempre que la configuración habilite la acción. Las demás acciones conservan su comportamiento.

## Document Formats

- El selector muestra `Seleccionar conformidad firmada (PDF, JPG/JPEG o PNG)` cuando está vacío y admite las extensiones `.pdf`, `.jpg`, `.jpeg` y `.png` sin distinguir mayúsculas.
- Centralizar la validación por extensión y MIME. Un MIME específico debe corresponder a la extensión: `application/pdf`, `image/jpeg` o `image/png`. Si está vacío o es `application/octet-stream`, usar la extensión.
- Reutilizar la validación en el filtro del selector, la habilitación de Subir y antes de subir. Informar `Solo se permiten archivos PDF, JPG/JPEG o PNG` ante un rechazo, conservando un archivo válido previamente seleccionado.
- Conservar el payload multipart con `audio` e `idAnexoCabecera`, sin agregar límites de tamaño.
- Las dos tablas usan Ver documento. La vista previa asigna el MIME de la extensión y la descarga conserva el nombre original; no forzar PDF. Un archivo histórico de formato desconocido puede descargarse como contenido binario, sin inventar una extensión ni habilitar una vista previa incompatible.
- La restricción de frontend no comprueba los bytes reales ni impide solicitudes de otros clientes; esas comprobaciones requieren validación backend.

## Recovery

- Mantener un bloqueo independiente del indicador de carga de documentos durante toda la operación; no liberar controles mientras se consulta la recuperación.
- Antes de completar o reintentar, consultar la cabecera y los documentos persistidos. Si la consulta falla, no realizar escrituras; mostrar una acción para volver a consultar.
- Si el documento ya existe, permitir Completar conformidad sin duplicar la carga. Conservar la fecha seleccionada ante errores y recuperar `fechaIngreso` al reabrir; si ya coincide con la fecha persistida, no repetir su guardado.
- Después de una respuesta incierta, volver a consultar para reconocer operaciones que llegaron a persistirse. Si la ficha aparece SUSCRITA, bloquear reintentos de escritura.
- Explicar la etapa pendiente (documento, fecha o cambio de estado), sin borrar documentos ni ejecutar compensaciones automáticas.
- Una ficha SUSCRITA sin documento por inconsistencias históricas permanece bloqueada; no inferir ni modificar su estado.

## Acceptance

- El estado 3 aparece como SUSCRITO / SUSCRITA en etiquetas y mensajes, mantiene el verde y no conserva referencias a los identificadores anteriores.
- Estado 1 admite edición; estados 2 y 3 no, incluso cuando el backend devuelve cadenas.
- Estado 1 o "1" oculta Gestionar conformidad. Estados 2 y 3 conservan su acción; `conformidad: false` la oculta en todos los estados.
- Validación o persistencia fallida bloquea la transición 1 → 2.
- Documento y fecha preceden al envío de estado 3; no se envía 3 si falta alguna etapa.
- Fallos de carga, fecha, estado o consulta conservan lo persistido y permiten recuperación sin duplicar el documento ni retroceder estados.
- La fecha permanece visible ante fallos y se recupera al reabrir. Un documento existente en estado 2 permite completar el cierre.
- Estado 3 impide eliminar en la interfaz y en el método; estados 2 y 3 permiten generar, ver y descargar el compromiso.
- Usuario NNA conserva fichas históricas en estado 2 y muestra nuevas fichas en estado 3.
- PDF, JPG, JPEG y PNG se aceptan con extensiones en mayúsculas o minúsculas; otros formatos o MIME incompatibles se rechazan sin subirlos.
- El selector informa los tipos permitidos y muestra el nombre al seleccionar un archivo. PDF e imágenes pueden consultarse y descargarse desde ambas tablas.

## Validation And Dependencies

Solo comprobaciones estáticas y `git diff --check`; no ejecutar builds ni pruebas sin autorización explícita. Actualizar Graphify después de los cambios materiales.

El backend debe admitir estado 3, devolverlo en el listado y hacer cumplir sus propias restricciones de transición y eliminación. Este repositorio contiene únicamente el frontend; no se afirma que esas restricciones estén implementadas en el servidor.
