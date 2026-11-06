# Condiciones múltiples de editabilidad

## Summary

Ampliar `editable` de preguntas dinámicas para permitir operadores de igualdad y desigualdad, además de varias condiciones en una sola regla.

## Contract

- `editable` admite el objeto heredado o un arreglo de objetos, recibidos como JSON u objeto ya parseado.
- Cada objeto contiene `id`, `valor` y opcionalmente `operador`. Los operadores admitidos son `==` y `!=`; si se omite, se usa `==`.
- En un arreglo, todas las condiciones deben cumplirse para que la pregunta sea editable.
- La comparación conserva normalización de mayúsculas, acentos y espacios exteriores, así como respuestas múltiples y listas separadas por `|`. `!=` invierte la coincidencia.
- Una referencia existente vacía se compara como vacío. Una referencia inexistente o una regla inválida no satisface la condición; una regla inválida deja el destino bloqueado.
- `editable` ausente, nulo o vacío conserva la editabilidad normal. Bloquear no limpia la respuesta.
- Las reglas de solo lectura existentes mantienen prioridad. `editableBifurcaciones` conserva su contrato actual.

## Acceptance

- El objeto legado sin operador conserva la evaluación de igualdad.
- `==` permite editar al coincidir y bloquea cuando no coincide; `!=` aplica el resultado opuesto.
- Un arreglo permite editar solo si todas sus condiciones coinciden.
- Para una referencia existente vacía, `==` frente a un valor no vacío no coincide y `!=` sí coincide; una referencia ausente no coincide con ninguno.
- La comparación de respuestas múltiples detecta coincidencia por cualquiera de sus valores, y `!=` invierte ese resultado.
- Una regla inválida no permite editar; una regla vacía no altera la editabilidad habitual.
- Al cambiar las respuestas referenciadas, el bloqueo se actualiza sin borrar la respuesta del destino.
- Las reglas de `editableBifurcaciones` no cambian.

## Validation

Revisión estática, `git diff --check` y actualización de Graphify. No ejecutar builds ni pruebas sin autorización explícita.
