# Motor Dinamico NNA

`question-engine.js` es la unica fuente de verdad para las reglas de preguntas dinamicas de Registro NNA, Usuario NNA y futuras paginas NNA.

- Interpreta el catalogo/API y conserva JSON flexible heredado, respuestas separadas por pipe, labels, `dateInputs`, `age` y ramificaciones.
- Centraliza normalizacion, condiciones, visibilidad, editabilidad, hidratacion y serializacion.
- `age` usa `opciones: [{"id": idFechaReferencia}, {"id": idFechaNacimiento}]`; usa la fecha de registro si la primera no es valida y nunca activa reglas bloqueantes.
- Los selects HTTP dependientes aceptan `defaultValueBifurcaciones: [{"tipo":"ref","id":4276,"t":"Departamento domicilio"}]`. Una regla `ref` busca la respuesta visible de la pregunta origen por contenido en ambos sentidos y precarga la rama indicada.
- No accede a Vue, Quasar, HTTP ni al DOM. Cada pagina usa un adaptador Vue 2 solo para aplicar mutaciones reactivas y presentar la UI.
- Las paginas no deben reimplementar reglas por ruta. Un cambio de regla se realiza en este modulo y afecta a todos los consumidores.
