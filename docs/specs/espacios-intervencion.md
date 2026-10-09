# Intervention Spaces Management

## Summary

Nueva pantalla `#/espacios-intervencion`, titulada GESTIÓN DE ESPACIOS DE INTERVENCIÓN, centrada con tipografía text-h6 y peso bold como Usuario NNA. Permite crear, listar, consultar y editar exclusivamente registros con `idServicioPadre=5`, sin eliminación. El menú Administración → Espacios de intervención se configura en SRH con enlace `espacios-intervencion`; el frontend registra la ruta bajo MainLayout.

## Table

- Columnas: N°, NOMBRE, DEPARTAMENTO, PROVINCIA, DISTRITO, RESPONSABLE y ACCIONES. No mostrar ID, ubigeo ni estado como columnas.
- Tabla dense, flat y bordered, con cabecera bg-inabif text-bold como Usuario NNA. Mantener búsqueda y ordenamiento locales.
- Altura local adaptable al viewport: calc(100vh - 230px), mínimo 320px, reemplazando el máximo global de 500px únicamente para esta tabla. Conservar scroll interno, encabezado fijo y paginación.
- Acciones mediante un único q-btn-dropdown con engranaje settings: Editar espacio y Ver espacio, con iconos edit y visibility, avatares warning y primary y cierre del menú al seleccionar. Consultar el detalle con idEspInterv antes de abrir el modal correspondiente. Deshabilitar el menú mientras se carga, consulta o mantiene abierto el formulario; no incorporar otras acciones ni dependencias del editor de fichas.
- Los avatares de Editar y Ver usan size="32px" y font-size="16px": círculos de 32 × 32 px e iconos de 16 px centrados, igual que las acciones de Usuario NNA. Definir font-size en la propiedad del contenido de q-avatar, sin reducir el tamaño de fuente exterior del círculo. El engranaje conserva el tamaño de Quasar (aproximadamente 24px), ya coincidente con Usuario NNA. Conservar colores, etiquetas y dimensiones de las opciones.
- Numerar desde 1 según el orden visual después del filtrado y ordenamiento, continuando entre páginas. Mostrar el correlativo con un mínimo de cinco dígitos y ceros a la izquierda (00001, 00002, …, 00010); no truncar secuencias mayores. El correlativo no es una clave ni se persiste; conservar `idEspInterv` como row-key y para las llamadas HTTP.
- Búsqueda y paginación locales; botones Nuevo espacio y Actualizar.
- Mostrar 20 registros por página inicialmente; conservar opciones 10, 20, 50 y todos. El correlativo continúa entre páginas según el tamaño seleccionado.
- Botones de cabecera compactos size="sm", alineados a la derecha con q-gutter-sm y min-width: 0 local, usando como referencia FichaPrimaryActions de Registro NNA. Nuevo espacio utiliza btn-inabif e icono add; Actualizar utiliza btn-seccion-acciones, grey-5, texto blanco e icono refresh. Conservar etiquetas, eventos, carga y condiciones de deshabilitado; no modificar estilos globales.
- El backend devuelve `idEspInterv`, `idServicio`, `espNombre`, `espUbigeo`, `espNombreResponsable`, `idUnidadOrganicaPadre`, `idServicioPadre`, `espEstado`, además de `departamento`, `provincia` y `distrito` como nombres opcionales de lectura (string o null) en listado y detalle.
- Filtrar por servicio padre 5 y utilizar directamente los nombres geográficos recibidos, conservando los valores originales. Compartir un formato de celda para mostrar `-` cuando un nombre sea vacío, null o esté ausente. No resolver nombres mediante catálogos ni mostrar un warning general por nombres ausentes.
- Cargar y recargar la tabla consulta únicamente el listado. Actualizar limpia la caché geográfica y recarga el listado; los catálogos renovados se consultan al abrir el siguiente formulario. Conservar el aviso de errores HTTP del listado y su reintento.

## Form

- Cargar catálogos al abrir el diálogo, con caché y solicitudes pendientes compartidas entre aperturas; departamentos una vez, provincias por departamento y distritos por provincia. Máximo cuatro consultas geográficas simultáneas. Los nombres recibidos no sustituyen las opciones ni sus identificadores.
- Nombre obligatorio, sin blancos, máximo 150 caracteres; responsable opcional, máximo 200. Recortar espacios exteriores; responsable vacío se envía como null.
- Selección obligatoria Departamento → Provincia → Distrito. Enviar `distrito.idUbigeo` directamente como cadena de seis dígitos, preservando ceros iniciales.
- Cambiar departamento limpia provincia y distrito; cambiar provincia limpia distrito. Ignorar respuestas obsoletas.
- Al consultar o editar, reconstruir la cascada usando los campos `idDepartamento`, `idProvincia` e `idDistrito` del detalle: convertirlos a cadenas, cargar cada catálogo en orden y buscar cada opción por su identificador. Si los tres campos no vienen, conservar la hidratación heredada desde `espUbigeo`; si viene solo una parte o algún identificador no existe, conservar los niveles encontrados e informar la ubicación incompleta sin inferir opciones por nombre. Usar el `idUbigeo` real de cada opción padre en las consultas.
- La hidratación no dispara limpiezas de cambios manuales. Si el ubigeo guardado no existe o un catálogo falla, conservarlo para identificar la inconsistencia y exigir una selección válida antes de guardar.
- Consultar detalle actualizado y verificar servicio padre 5 antes de Ver / Editar. Ver usa formulario de solo lectura. Servicio, unidad y estado no se editan.
- Al seleccionar Editar, capturar el N° de la fila mediante el mismo cálculo de la columna y conservarlo durante la consulta del detalle. Pasarlo al diálogo como propiedad opcional de texto numeroRegistro, independiente del registro, y mostrar una insignia N° 00017 junto al título y antes del cierre. Limpiar al cerrar o iniciar Nuevo. Solo edición muestra la insignia; el correlativo representa la posición visual, no se persiste ni se envía a la API, que conserva idEspInterv.
- Bloquear envíos duplicados y cierre del formulario durante guardado; conservar borrador y mostrar errores por campo ante fallos.
- Todos los campos utilizan hide-bottom-space: no reservar espacios inferiores vacíos, pero mostrar errores cuando correspondan. Neutralizar el borde exterior global de q-field únicamente dentro de este modal y conservar el contorno outlined y sus estados de foco, error, deshabilitado y solo lectura. No ocultar permanentemente q-field__bottom ni modificar estilos globales o modales NNA.

## HTTP Contract

Todas las rutas son relativas a API_URL. Escrituras en JSON, sin FormData. No implementar DELETE ni modificar los selectores NNA.

| Operación | Endpoint | Entrada / Resultado |
|---|---|---|
| Listar | GET /findAllEspIntervenciones | data lista; filtrar servicio padre 5 |
| Consultar | GET /findEspIntervencionById | query idEspInterv; data objeto con los campos de lectura y, cuando estén disponibles, `idDepartamento`, `idProvincia` e `idDistrito` |
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
- Iconos de Editar y Ver de 16 px centrados dentro de avatares de 32 px, como Usuario NNA. Nuevo espacio y Actualizar adoptan el tamaño compacto de Registro NNA, con Nuevo institucional y Actualizar gris, conservando apertura, recarga y bloqueos.
- Campos sin cajas inferiores vacías; mensajes de validación visibles cuando corresponde y eliminados al corregir. Conservar consulta de solo lectura y bloqueo durante guardado.
- La insignia del modal de edición coincide con el N° seleccionado después de buscar, ordenar o paginar y no cambia durante su apertura. Nuevo y Ver no muestran números heredados. Un fallo de detalle no abre el diálogo; guardar sigue usando exclusivamente el ID real.
- Solo servicio padre 5 puede listarse o abrirse para consultar / editar.
- Por defecto, la columna N° muestra 00001–00020 y 00021–00040 entre páginas; sus correlativos se recomputan tras buscar u ordenar y no se envían a la API. Cambiar el tamaño mantiene la continuidad. En escritorio la tabla aprovecha mayor altura sin cambiar las demás tablas.
- Departamento, Provincia y Distrito muestran los nombres del backend; valores vacíos, null o ausentes muestran `-` sin warning general. Buscar y ordenar utilizan los nombres recibidos.
- Cargar y actualizar la tabla no consulta catálogos geográficos. El formulario conserva solicitudes por claves compartidas, con máximo cuatro activas y preservación de ceros iniciales.
- Crear y editar respetan límites y obligatoriedad, preservan ceros iniciales y solo envían los campos del DTO.
- Cascada e hidratación no mezclan respuestas obsoletas ni borran selecciones cargadas.
- Ver es de solo lectura. No existe acción ni llamada de eliminación.
- Errores 400, datos nulos, fallos de catálogo y fallos de recarga tras guardar conservan un estado recuperable y no producen falsos éxitos.

## Risks And Validation

El filtro de servicio es de interfaz: el backend devuelve todos los registros no eliminados y debe aplicar sus propios controles de acceso. Su actualización fija servicio padre 5; su creación usa MAX+1, con riesgo de concurrencia. La detección del éxito PUT depende del texto de respuesta. Estos contratos no se modifican en este trabajo.

Vue 2 Options API y Quasar v1. Solo revisión estática, análisis de sintaxis y git diff --check; no ejecutar builds, compilaciones, servidores ni pruebas sin autorización explícita. Actualizar Graphify tras cambios materiales. Conservar los cambios locales preexistentes.
