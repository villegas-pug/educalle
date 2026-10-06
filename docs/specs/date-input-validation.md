# Validación de preguntas date

## Objetivo

Las preguntas principales `tipoControl === date` del editor compartido usarán una entrada con máscara `DD/MM/AAAA` y calendario Quasar. El usuario eligió esta alternativa para impedir dígitos adicionales durante la escritura.

## Contrato

- Día y mes admiten dos dígitos; año admite cuatro. La máscara también aplica al pegado.
- Las fechas completas se convierten a `AAAA-MM-DD`; se conserva la API y la serialización existentes.
- Una entrada parcial permanece visible y se mantiene como valor provisional inválido en el modelo. Nunca se guarda: las reglas existentes deben bloquear fechas incompletas o imposibles, incluso en preguntas opcionales.
- El campo vacío conserva la obligatoriedad del catálogo. El calendario y la entrada manual respetan el modo de solo lectura.
- Se reutiliza la validación de calendario y se conservan las reglas de edad y cierre. `dateInputs` no cambia.

## Escenarios de aceptación

- Escritura y pegado no exceden `DD/MM/AAAA`; no se aceptan letras en los segmentos.
- Una fecha válida ingresada o seleccionada se guarda en ISO y se muestra en formato local al editar.
- Fechas parciales, `31/02/2026`, mes 13 y un 29 de febrero de un año no bisiesto bloquean el guardado.
- Un 29 de febrero de un año bisiesto es válido; una fecha opcional vacía sigue permitida.
- Las reglas de edad y el enfoque de errores conservan su funcionamiento.

## Verificación

Solo revisión estática y `git diff --check`. Builds, pruebas y ejecución de la aplicación requieren autorización explícita.

## Extensión: timeRangeM

- Inicio y fin usan máscara `HH:mm` y selector de hora en formato de 24 horas, con dos dígitos por segmento.
- Solo son válidas las horas entre `00:00` y `23:59`. Los borradores incompletos o inválidos no se agregan y bloquean el guardado; se pueden corregir sin perder otros intervalos.
- Se validan también los intervalos ya agregados. Los inválidos se señalan y deben quitarse antes de guardar.
- Se conserva el formato `HH:mm - HH:mm`, la lista serializada con `|`, la obligatoriedad y el comportamiento existente respecto al orden y los duplicados.
- Escenarios: `00:00` y `23:59` válidos; `24:00`, `12:60`, entradas parciales y dígitos adicionales rechazados; lista opcional vacía válida.
