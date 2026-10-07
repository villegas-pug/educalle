# Intervention Spaces Management

## Summary

Nueva pantalla `#/espacios-intervencion`, titulada GESTIÓN DE ESPACIOS DE INTERVENCIÓN, centrada con tipografía text-h6 y peso bold como Usuario NNA. Permite crear, listar, consultar y editar exclusivamente registros con `idServicioPadre=5`, sin eliminación. El menú Administración → Espacios de intervención se configura en SRH con enlace `espacios-intervencion`; el frontend registra la ruta bajo MainLayout.

## Table

- Columnas: N°, NOMBRE, DEPARTAMENTO, PROVINCIA, DISTRITO, RESPONSABLE y ACCIONES. No mostrar ID, ubigeo ni estado como columnas.
- Tabla dense, flat y bordered, con cabecera bg-inabif text-bold como Usuario NNA. Mantener búsqueda y ordenamiento locales.
- Acciones mediante un único q-btn-dropdown con engranaje settings: Editar espacio y Ver espacio, con iconos edit y visibility, avatares warning y primary y cierre del menú al seleccionar. Consultar el detalle con idEspInterv antes de abrir el modal correspondiente. Deshabilitar el menú mientras se carga, consulta o mantiene abierto el formulario; no incorporar otras acciones ni dependencias del editor de fichas.
- Los avatares de Editar y Ver usan size="32px" y font-size="24px": círculos de 32 × 32 px e iconos de 24 px centrados, sin la reducción local font-size: 16px que Quasar divide entre dos para el contenido. Conservar colores, etiquetas y dimensiones de las opciones.
- Numerar desde 1 según el orden visual después del filtrado y ordenamiento, continuando entre páginas. Mostrar el correlativo con un mínimo de cinco dígitos y ceros a la izquierda (00001, 00002, …, 00010); no truncar secuencias mayores. El correlativo no es una clave ni se persiste; conservar `idEspInterv` como row-key y para las llamadas HTTP.
- Búsqueda y paginación locales; botones Nuevo espacio y Actualizar.
- Botones de cabecera compactos size="sm", alineados a la derecha con q-gutter-sm y min-width: 0 local, usando como referencia FichaPrimaryActions de Registro NNA. Nuevo espacio utiliza btn-inabif e icono add; Actualizar utiliza btn-seccion-acciones, grey-5, texto blanco e icono refresh. Conservar etiquetas, eventos, carga y condiciones de deshabilitado; no modificar estilos globales.
- El backend devuelve `idEspInterv`, `idServicio`, `espNombre`, `espUbigeo`, `espNombreResponsable`, `idUnidadOrganicaPadre`, `idServicioPadre`, `espEstado`, además de `departamento`, `provincia` y `distrito` como nombres opcionales de lectura (string o null) en listado y detalle.
- Filtrar por servicio padre 5 y utilizar directamente los nombres geográficos recibidos, conservando los valores originales. Compartir un formato de celda para mostrar `-` cuando un nombre sea vacío, null o esté ausente. No resolver nombres mediante catálogos ni mostrar un warning general por nombres ausentes.
- Cargar y recargar la tabla consulta únicamente el listado. Actualizar limpia la caché geográfica y recarga el listado; los catálogos renovados se consultan al abrir el siguiente formulario. Conservar el aviso de errores HTTP del listado y su reintento.

## Form

- Cargar catálogos al abrir el diálogo, con caché y solicitudes pendientes compartidas entre aperturas; departamentos una vez, provincias por departamento y distritos por provincia. Máximo cuatro consultas geográficas simultáneas. Los nombres recibidos no sustituyen las opciones ni sus identificadores.
- Nombre obligatorio, sin blancos, máximo 150 caracteres; responsable opcional, máximo 200. Recortar espacios exteriores; responsable vacío se envía como null.
- Selección obligatoria Departamento → Provincia → Distrito. Enviar `distrito.idUbigeo` directamente como cadena de seis dígitos, preservando ceros iniciales.
- Cambiar departamento limpia provincia y distrito; cambiar provincia limpia distrito. Ignorar respuestas obsoletas.
- Al editar, reconstruir departamento por `idDepartamento === espUbigeo.slice(0, 2)`, provincia por `idProvincia === espUbigeo.slice(2, 4)`, distrito por `idUbigeo === espUbigeo`. Usar el idUbigeo real de la opción padre en las consultas.
- La hidratación no dispara limpiezas de cambios manuales. Si el ubigeo guardado no existe o un catálogo falla, conservarlo para identificar la inconsistencia y exigir una selección válida antes de guardar.
- Consultar detalle actualizado y verificar servicio padre 5 antes de Ver / Editar. Ver usa formulario de solo lectura. Servicio, unidad y estado no se editan.
- Bloquear envíos duplicados y cierre del formulario durante guardado; conservar borrador y mostrar errores por campo ante fallos.
- Todos los campos utilizan hide-bottom-space: no reservar espacios inferiores vacíos, pero mostrar errores cuando correspondan. Neutralizar el borde exterior global de q-field únicamente dentro de este modal y conservar el contorno outlined y sus estados de foco, error, deshabilitado y solo lectura. No ocultar permanentemente q-field__bottom ni modificar estilos globales o modales NNA.

## HTTP Contract

Todas las rutas son relativas a API_URL. Escrituras en JSON, sin FormData. No implementar DELETE ni modificar los selectores NNA.

| Operación | Endpoint | Entrada / Resultado |
|---|---|---|
| Listar | GET /findAllEspIntervenciones | data lista; filtrar servicio padre 5 |
| Consultar | GET /findEspIntervencionById | query idEspInterv; data objeto |
| Crear | POST /createEspIntervencion | espNombre, espUbigeo, espNombreResponsable; data ID |
| Editar | PUT /updateEspIntervencion | mismos campos más idEspInterv; data null |
| Departamentos | GET /findAllDepartamentos | data lista idUbigeo, idDepartamento, nombre |
| Provincias | GET /findAllProvinciasPorDepartamento | query idUbigeo del departamento; data lista idUbigeo, idProvincia, nombre |
| Distritos | GET /findAllDistritosPorProvincia | query idUbigeo de la provincia; data lista idUbigeo, idDistrito, nombre |

- Respuesta ApiResponse: code, message, data, totalRows, page, rowsPerPage. La paginación del mantenimiento es local.
- El backend actualizado debe estar desplegado. Los nombres geográficos ausentes no activan consultas de respaldo; no enviar departamento, provincia ni distrito al crear o actualizar, solo espUbigeo para la ubicación.
- Lista o catálogo vacío devuelve HTTP 200, code 200, data null y mensaje ¡Recurso no encontrado!; normalizar a lista vacía. Un detalle inexistente no abre el formulario.
- Validación HTTP 400 devuelve data como mapa campo → mensaje; otros errores se muestran como texto. Nunca anunciar éxito basándose solo en HTTP 200.
- Confirmar actualización con code 200 y mensaje exacto ¡Operación exitosa!: el error ORA-20001 comparte HTTP 200, code 200 y data null con el éxito.
- Tras guardar, cerrar formulario y recargar listado. Si falla únicamente la recarga, informar el guardado completado y permitir Actualizar sin repetir la escritura.

## Acceptance

- La ruta abre la pantalla con el título aprobado; menú provisto por SRH.
- Título centrado y encabezados en mayúsculas; tabla y engranaje siguen la referencia Usuario NNA. Seleccionar Editar / Ver cierra el menú y abre el modal correcto usando el ID real.
- Iconos de Editar y Ver de 24 px centrados dentro de avatares de 32 px. Nuevo espacio y Actualizar adoptan el tamaño compacto de Registro NNA, con Nuevo institucional y Actualizar gris, conservando apertura, recarga y bloqueos.
- Campos sin cajas inferiores vacías; mensajes de validación visibles cuando corresponde y eliminados al corregir. Conservar consulta de solo lectura y bloqueo durante guardado.
- Solo servicio padre 5 puede listarse o abrirse para consultar / editar.
- La columna N° muestra 00001–00010 y 00011–00020 entre páginas; sus correlativos se recomputan tras buscar u ordenar y no se envían a la API.
- Departamento, Provincia y Distrito muestran los nombres del backend; valores vacíos, null o ausentes muestran `-` sin warning general. Buscar y ordenar utilizan los nombres recibidos.
- Cargar y actualizar la tabla no consulta catálogos geográficos. El formulario conserva solicitudes por claves compartidas, con máximo cuatro activas y preservación de ceros iniciales.
- Crear y editar respetan límites y obligatoriedad, preservan ceros iniciales y solo envían los campos del DTO.
- Cascada e hidratación no mezclan respuestas obsoletas ni borran selecciones cargadas.
- Ver es de solo lectura. No existe acción ni llamada de eliminación.
- Errores 400, datos nulos, fallos de catálogo y fallos de recarga tras guardar conservan un estado recuperable y no producen falsos éxitos.

## Risks And Validation

El filtro de servicio es de interfaz: el backend devuelve todos los registros no eliminados y debe aplicar sus propios controles de acceso. Su actualización fija servicio padre 5; su creación usa MAX+1, con riesgo de concurrencia. La detección del éxito PUT depende del texto de respuesta. Estos contratos no se modifican en este trabajo.

Vue 2 Options API y Quasar v1. Solo revisión estática, análisis de sintaxis y git diff --check; no ejecutar builds, compilaciones, servidores ni pruebas sin autorización explícita. Actualizar Graphify tras cambios materiales. Conservar los cambios locales preexistentes.
