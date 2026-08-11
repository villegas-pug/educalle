# Motor Dinamico NNA

`question-engine.js` es la unica fuente de verdad para las reglas de preguntas dinamicas de Registro NNA, Usuario NNA y futuras paginas NNA.

- Interpreta el catalogo/API y conserva JSON flexible heredado, respuestas separadas por pipe, labels, `dateInputs`, `age` y ramificaciones.
- Centraliza normalizacion, condiciones, visibilidad, editabilidad, hidratacion y serializacion.
- `age` usa `opciones: [{"id": idFechaReferencia}, {"id": idFechaNacimiento}]`; usa la fecha de registro si la primera no es valida y nunca activa reglas bloqueantes.
- `date` conserva el control nativo del navegador y solo admite fechas calendario validas en formato `YYYY-MM-DD`.
- Los selects HTTP dependientes aceptan `defaultValueBifurcaciones: [{"tipo":"ref","id":4276,"t":"Departamento domicilio"}]`. Una regla `ref` busca la respuesta visible de la pregunta origen por contenido en ambos sentidos y precarga la rama indicada.
- Las preguntas no ramificadas aceptan `defaultValue: [{"tipo":"ref","id":4259,"valor":"SI","defecto":"DNI"}]`. En fichas nuevas, la primera regla valida cuya respuesta visible de referencia contenga `valor` completa solo una respuesta destino vacia; una coincidencia activa deja el destino en solo lectura, incluso en edicion y por encima de `editable`. No modifica visibilidad, obligatoriedad ni reglas bloqueantes.
- `editable` aplica solo a la pregunta principal. Las ramificaciones se controlan exclusivamente con `editableBifurcaciones` o, en su ausencia, con su atributo individual `editable`.
- No accede a Vue, Quasar, HTTP ni al DOM. Cada pagina usa un adaptador Vue 2 solo para aplicar mutaciones reactivas y presentar la UI.
- Las paginas no deben reimplementar reglas por ruta. Un cambio de regla se realiza en este modulo y afecta a todos los consumidores.

## Validacion manual de `defaultValue`

- Crear una ficha nueva con la respuesta de referencia `SÍ` y verificar que `valor: "SI"` aplique `defecto`.
- Verificar que una coincidencia activa deje el destino en solo lectura, incluso si su regla `editable` permitiria editarlo; al dejar de coincidir, debe volver a regir `editable`.
- Verificar que una respuesta destino no vacia se conserve y que, al borrarla, el defecto se restaure mientras se mantenga la condicion.
- Verificar que la primera coincidencia del arreglo prevalezca y que reglas invalidas, referencias ausentes o condiciones no cumplidas no cambien el destino.
- Verificar que la regla no se aplique al editar y no afecte preguntas ramificadas, visibilidad, obligatoriedad ni cierre.
