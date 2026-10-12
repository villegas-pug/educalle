# Motor Dinamico NNA

`question-engine.js` es la unica fuente de verdad para las reglas de preguntas dinamicas de Registro NNA, Usuario NNA y futuras paginas NNA.

- Interpreta el catalogo/API y conserva JSON flexible heredado, respuestas separadas por pipe, labels, `dateInputs`, `age` y ramificaciones.
- Centraliza normalizacion, condiciones, visibilidad, editabilidad, hidratacion y serializacion.
- En preguntas `modoControl: "redirected"`, `opciones: {"ref":"CENTROUBIGEO"}` obtiene la ubicacion del centro seleccionado en ALTA. En ACTUALIZAR y VER, con `"sync":true`, prioriza `espIntervUbicacion` del registro de `/listarAnexosCabecera`; si la ubicacion es nula, ausente, vacia o solo contiene espacios, conserva la respuesta persistida como fallback. Sin ese flag conserva siempre la respuesta persistida. Si ambos valores estan vacios, el campo permanece vacio. El contexto temporal no se incluye en el payload de guardado.
- En ALTA y ACTUALIZAR, el adaptador limpia respuestas principales, secundarias y borradores de preguntas ocultas al cargar o cambiar respuestas, hasta estabilizar dependencias. VER conserva los datos. La visibilidad permanece pura; defaults y resultados HTTP pendientes no repueblan preguntas ocultas. ACTUALIZAR envía respuestas nulas para persistir la limpieza mediante el endpoint existente.
- `age` usa `opciones: [{"id": idFechaReferencia}, {"id": idFechaNacimiento}]`; usa la fecha de registro si la primera no es valida y nunca activa reglas bloqueantes.
- `date` conserva el control nativo del navegador y solo admite fechas calendario validas en formato `YYYY-MM-DD`.
- Los selects HTTP dependientes aceptan `defaultValueBifurcaciones: [{"tipo":"ref","id":4276,"t":"Departamento domicilio"}]`. Una regla `ref` busca la respuesta visible de la pregunta origen por contenido en ambos sentidos y precarga la rama indicada.
- Los defaults de ramas operan en ALTA y ACTUALIZAR; en ACTUALIZAR solo completan ramas vacías y en VER no se aplican. Reaplicar un valor equivalente no limpia los descendientes; en ALTA, cambiar realmente el valor mantiene la cascada.
- Las preguntas no ramificadas aceptan `defaultValue: [{"tipo":"ref","id":4259,"valor":"SI","defecto":"DNI"}]`. En fichas nuevas y en edicion, la primera regla valida cuya respuesta visible de referencia contenga `valor` completa solo una respuesta destino vacia; una coincidencia activa deja el destino en solo lectura, incluso en edicion y por encima de `editable`. No modifica visibilidad, obligatoriedad ni reglas bloqueantes.
- Tambien aceptan reglas numericas `defaultValue: [{"tipo":"cond","id":4329,"operador":"<","valor":3,"defecto":"NO","readonly":true}]`. La primera condicion activa aplica el defecto solo si el destino esta vacio; `readonly` bloquea unicamente mientras la condicion se cumple. Si deja de cumplirse, conserva la respuesta y se restablece la editabilidad habitual.
- Si una regla `cond` referencia un control `age`, usa su edad calculada en tiempo real (incluido `0`) sin escribirla anticipadamente en `respuesta`. Los demas tipos de control conservan la evaluacion habitual.
- Al desactivarse una condicion basada en `age` (tambien si la edad no puede calcularse), se limpia solo el default aplicado automaticamente durante la ficha. Las respuestas cargadas o modificadas manualmente se conservan; el registro temporal de aplicacion no se persiste.
- `editable` aplica solo a la pregunta principal. Las ramificaciones se controlan exclusivamente con `editableBifurcaciones` o, en su ausencia, con su atributo individual `editable`.
- No accede a Vue, Quasar, HTTP ni al DOM. Cada pagina usa un adaptador Vue 2 solo para aplicar mutaciones reactivas y presentar la UI.
- Las paginas no deben reimplementar reglas por ruta. Un cambio de regla se realiza en este modulo y afecta a todos los consumidores.

## Validacion manual de `defaultValue`

- Crear o editar una ficha con la respuesta de referencia `SÍ` y verificar que `valor: "SI"` aplique `defecto` cuando el destino esté vacío.
- Verificar que una coincidencia activa deje el destino en solo lectura, incluso si su regla `editable` permitiria editarlo; al dejar de coincidir, debe volver a regir `editable`.
- Verificar que una respuesta destino no vacia se conserve y que, al borrarla, el defecto se restaure mientras se mantenga la condicion.
- Verificar que la primera coincidencia del arreglo prevalezca y que reglas invalidas, referencias ausentes o condiciones no cumplidas no cambien el destino.
- Verificar que la regla no se aplique en Ver Ficha y no afecte preguntas ramificadas, visibilidad, obligatoriedad ni cierre.
