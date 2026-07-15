# Motor Dinamico NNA

`question-engine.js` es la unica fuente de verdad para las reglas de preguntas dinamicas de Registro NNA, Usuario NNA y futuras paginas NNA.

- Interpreta el catalogo/API y conserva JSON flexible heredado, respuestas separadas por pipe, labels, `dateInputs` y ramificaciones.
- Centraliza normalizacion, condiciones, visibilidad, editabilidad, hidratacion y serializacion.
- No accede a Vue, Quasar, HTTP ni al DOM. Cada pagina usa un adaptador Vue 2 solo para aplicar mutaciones reactivas y presentar la UI.
- Las paginas no deben reimplementar reglas por ruta. Un cambio de regla se realiza en este modulo y afecta a todos los consumidores.
