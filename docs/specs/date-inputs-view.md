# Presentación de períodos en VER

## Resumen

Las preguntas `dateInputs` muestran en VER las unidades del período en mayúsculas, con el formato completo: `0 AÑOS, 8 MESES Y 0 DÍAS`.

## Reglas

- Interpretar la respuesta persistida en el orden `días/meses/años` y presentarla como años, meses y días.
- Incluir componentes con valor cero y usar singular o plural según cada cantidad.
- Mostrar `—` cuando no haya respuesta. Conservar el texto original si el valor está incompleto o malformado; no completar componentes ni inventar unidades.
- Aplicar el formato únicamente en VER, mediante un helper de presentación del editor, para todas las preguntas `dateInputs` sin fijar IDs.
- Mantener los campos de ALTA y ACTUALIZAR, la hidratación, las condiciones y la serialización existentes. El texto presentado no se persiste.

## Aceptación

- `0/8/0` muestra `0 AÑOS, 8 MESES Y 0 DÍAS`.
- `2/6/1` muestra `1 AÑO, 6 MESES Y 2 DÍAS`.
- `1/1/1` muestra `1 AÑO, 1 MES Y 1 DÍA`.
- `0/0/0` muestra `0 AÑOS, 0 MESES Y 0 DÍAS`.
- Una respuesta vacía muestra `—`; respuestas como `0/8` o `texto` conservan su texto original.
- Consultar una ficha no modifica el backend ni el valor de la respuesta.

## Validación

Realizar revisión estática y `git diff --check`; actualizar Graphify tras el cambio. No ejecutar builds ni pruebas sin autorización explícita.
