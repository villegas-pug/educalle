# Ficha Responsible Context

## Resumen

La tarjeta **EDUCADOR DE CALLE** conserva en ALTA el nombre del usuario autenticado. En Editar y Ver presenta al responsable asociado a la ficha guardada, sin usar el dato de presentación para alterar las referencias dinámicas.

## Contrato

- En ALTA, el nombre e ID del responsable provienen de `sgs-nombreCompleto` y `sgs-idPersonal`, mediante el almacenamiento de sesión existente.
- En Editar y Ver, priorizar el nombre `respSupervision` y el ID `idRespSupervision` del detalle de `obtenerRespuestas`. Si faltan o están vacíos, usar como respaldo `nombrePersonal` e `idPersonal` de la fila de `listarAnexosCabecera`.
- Ambos pares representan el mismo responsable persistido: el backend deriva los nombres de `SSI_ANEXOS_CABECERA.ID_RESP_SUPERVISION` mediante `TRPERSONAL` y `TGPERSONA`.
- Normalizar espacios y mostrar el nombre en mayúsculas. Si no existe nombre, mostrar `—`.
- Mantener nombre e ID para la tarjeta y la persistencia en estado separado de `form.respSupervision` y `form.idRespSupervision`, que conservan el contexto actual de referencias dinámicas.
- Al actualizar, enviar el ID persistido de detalle/fila; si ambos faltan, enviar `null` sin sustituirlo por el ID de sesión. En ALTA, enviar el ID de sesión como hasta ahora.
- Limpiar el estado de presentación al ocultar el diálogo y reinicializarlo al iniciar cada modo para evitar valores heredados.
- No cambiar endpoints ni el contrato backend.

## Aceptación

- ALTA muestra el usuario autenticado y usa su ID al crear.
- Editar y Ver muestran el responsable guardado aunque sea distinto del usuario autenticado.
- Si el detalle no trae responsable, se usa el de la fila; si ambos nombres faltan, se muestra `—`.
- Actualizar conserva el ID del responsable guardado y nunca lo sustituye por el de sesión.
- Las referencias dinámicas mantienen sus valores y lógica actuales.

## Validación

Realizar revisión estática y `git diff --check`; actualizar Graphify después del cambio. No ejecutar builds ni pruebas sin autorización explícita.
