# Límite de longitud en respuestas múltiples

## Summary

Aplicar el máximo efectivo de `rangoLongitud` a cada borrador de respuestas `textM` y `numberM`, incluidos los rangos dinámicos seleccionados por `condRangoLongitud`.

## Contract

- El borrador no supera el máximo mientras se escribe, se pega o se actualiza desde el control.
- `textM` cuenta caracteres y `numberM` cuenta dígitos, conforme al comportamiento actual de sus validadores.
- El límite mínimo continúa validándose al agregar la respuesta.
- Las respuestas históricas que excedan el máximo permanecen visibles con su error para que puedan corregirse.
- Los campos simples y la validación de caracteres conservan su comportamiento actual.

## Acceptance

- Al superar el máximo en el borrador `textM` o `numberM`, el valor mostrado queda limitado al máximo efectivo.
- La misma limitación se aplica con rangos fijos y condicionales.
- Un valor por debajo del mínimo conserva el mensaje de validación y no se agrega.
- Respuestas históricas fuera del rango siguen mostrando su error y pueden eliminarse.

## Validation

Revisión estática de escritura, pegado, rangos fijos y condicionales, y agregado de respuestas. Ejecutar `git diff --check`; no ejecutar builds ni pruebas sin autorización explícita. Actualizar Graphify tras el cambio.
