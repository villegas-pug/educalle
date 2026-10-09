# Hidratación de selectores dependientes

## Resumen

Los controles `branched` con selectores muestran en ACTUALIZAR y VER todos los valores guardados en `respuesta`, separados por `|` y en el orden de sus ramas. Los catálogos HTTP enriquecen la selección para mantener la cascada, pero no determinan si se muestran los valores persistidos.

## Reglas

- Asignar cada segmento de la respuesta guardada a su rama por posición antes de cargar catálogos.
- Resolver opciones usando la comparación normalizada existente. Si una opción no coincide o falla una consulta, conservar visibles los valores persistidos de esa rama y las siguientes.
- Continuar la cascada HTTP solo cuando la opción padre se haya resuelto, usando el `valueKey` configurado y su objeto `raw`.
- Al serializar, conservar las posiciones vacías entre ramas para que los valores no se desplacen. Una respuesta sin valores se serializa como `null`.
- Los cambios manuales mantienen la cascada actual: limpiar ramas descendientes y cargar sus opciones.
- Aplicar `defaultValueBifurcaciones` únicamente en ALTA y ACTUALIZAR. VER conserva las respuestas sin aplicar defaults.
- En ACTUALIZAR, completar solo ramas vacías; una respuesta existente prevalece sobre la referencia por defecto.
- Reaplicar un default equivalente al valor actual, según la comparación normalizada, no limpia descendientes ni recarga catálogos. En ALTA, un cambio real de referencia mantiene la cascada actual.
- Observar también el estado vacío de la rama destino en ACTUALIZAR para completar una rama que quede vacía.
- No fijar IDs, modificar endpoints ni cambiar el contrato de persistencia.

## Aceptación

- `TUMBES|TUMBES|TUMBES` muestra cada valor en su selector en ACTUALIZAR y VER.
- Los valores guardados siguen visibles si falta una opción o falla su consulta HTTP.
- Los valores incompletos conservan su posición al guardar; cambiar el padre sigue limpiando los descendientes.
- La reaplicación del default de Departamento no borra Provincia ni Distrito cuando el valor ya coincide.
- ACTUALIZAR conserva valores existentes distintos de la referencia y completa ramas vacías cuando hay coincidencia; VER no ejecuta defaults.

## Validación

Revisar estáticamente la hidratación y serialización de los controles `branched`, y ejecutar `git diff --check`. No ejecutar builds ni pruebas sin autorización explícita.
