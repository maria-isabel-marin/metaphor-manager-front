# Análisis del Flujo de Actualización de Datos en AnnotationGrid.tsx

El componente `AnnotationGrid.tsx` implementa una tabla de datos editable y con paginación del lado del servidor. El flujo de actualización se puede dividir en tres mecanismos principales:

1.  **Edición en Lote (Batch Editing)**: El usuario modifica varias celdas. Los cambios se acumulan localmente y no se envían al servidor hasta que el usuario hace clic en "Guardar cambios".
2.  **Acciones Directas**: Ciertos botones (como los de la columna "Actions") guardan un cambio específico inmediatamente en el servidor.
3.  **Actualización en Masa (Bulk Update)**: El usuario puede seleccionar varias filas y aplicar un cambio (por ejemplo, "Approve Selected") a todas ellas de una vez.

A continuación, un análisis detallado de cada parte.

---

### 1. Carga Inicial de Datos y Estado

Todo comienza con la obtención de los datos iniciales del servidor.

-   **`useEffect(fetchData, ...)` (Líneas 342-376)**: Este `useEffect` es el responsable de cargar los datos. Se ejecuta cada vez que cambian las dependencias `[projectId, documentId, pagination, sorting, filters]`.
    -   Dentro, la función `fetchData` hace una llamada `GET` a la API a `/projects/${projectId}/documents/${documentId}/annotations`.
    -   Envía parámetros para la paginación (`page`, `limit`), ordenación (`sortBy`, `sortDir`) y filtros (`search`, `status`, etc.).
    -   Cuando recibe la respuesta, actualiza dos estados clave con `setData(normalized)` y `setTotal(res.data.total)`. `data` contiene las anotaciones de la página actual y `total` el número total de anotaciones, necesario para la paginación.
    -   Los datos se "normalizan" (líneas 364-372) para asegurar que campos como `location` o `sourceDomain` tengan valores predeterminados y no sean `null` o `undefined`, evitando errores en el renderizado.

-   **Estados Principales**:
    -   `data`: Almacena los datos de las anotaciones que se muestran en la tabla.
    -   `editedCells`: Un array que funciona como un "log" de cambios. Es la pieza central del flujo de edición en lote. Su estructura es `{ id, field, oldValue, newValue }`.
    -   `pagination`, `sorting`, `filters`: Estados que controlan la consulta al servidor. Cualquier cambio en ellos dispara el `useEffect` de `fetchData`.

---

### 2. Flujo de Edición Celda por Celda (Edición en Lote)

Este es el flujo más complejo. Ocurre cuando el usuario edita directamente el contenido de una celda.

-   **Renderizado de Celdas Editables (Líneas 381-499)**: La definición de las columnas (`columns`) se recalcula con `useMemo`. Para la mayoría de las columnas, se sobrescribe la función `cell` para hacerlas editables.
    -   Se busca si la celda actual tiene cambios pendientes en el estado `editedCells`.
        ```javascript
        const editedCell = editedCells.find(cell => cell.id === row.original._id && cell.field === colKey)
        const isEdited = !!editedCell
        const currentValue = editedCell ? editedCell.newValue : originalValue
        ```
    -   Si la celda ha sido editada (`isEdited`), su fondo se colorea de amarillo (`bg-yellow-100`) gracias a la función `getEditedCellColor`.
    -   Dependiendo del tipo de dato, se renderiza un `input`, un `select` o un `div` con `contentEditable`.

-   **`handleCellEdit` (Líneas 287-306)**: Esta es la función clave que se llama cada vez que el valor de una celda editable cambia (a través de `onBlur`, `onChange`, etc.).
    -   Recibe el `id` de la fila, el nombre del campo (`field`), el valor original y el nuevo valor.
    -   **Línea 290**: Compara el valor original con el nuevo usando la función auxiliar `areValuesEqual`. Esta función es importante porque si el usuario edita una celda y luego la revierte a su valor original, el cambio se elimina del log de `editedCells`.
    -   **Líneas 296-304**: Si el valor es realmente nuevo, actualiza el estado `editedCells`. Primero, filtra el array para eliminar cualquier cambio previo para la misma celda (`id` y `field`). Luego, añade el nuevo cambio al array. Esto asegura que solo haya una entrada por celda editada.

-   **`saveChanges` (Líneas 308-330)**: Esta función se ejecuta cuando el usuario hace clic en "Confirmar" en el diálogo de confirmación.
    -   **Líneas 310-315**: Agrupa todos los cambios del array `editedCells` por el `id` de la fila. Esto es eficiente porque si se editaron 3 campos de la misma fila, se agrupan para ser enviados en una sola petición `PATCH` por fila.
    -   **Líneas 318-324**: Itera sobre cada fila modificada y envía una petición `api.patch` al endpoint `/projects/.../annotations/${id}` con los campos actualizados para esa fila.
    -   **Líneas 327-329**: Una vez que todas las peticiones han terminado, limpia el log de cambios (`setEditedCells([])`), dispara una recarga de los datos para la página actual y cierra el diálogo de confirmación. La recarga se fuerza ingeniosamente al llamar a `setPagination` con el mismo valor, lo que es suficiente para disparar el `useEffect` de `fetchData`.

---

### 3. Flujo de Acciones Directas

Este flujo es más simple y se usa para actualizaciones inmediatas.

-   **Columna "Actions" (Líneas 250-272)**: Esta columna renderiza una serie de botones ("APPROVED", "TO EDIT", etc.).
    -   Cada botón tiene un `onClick` que realiza dos acciones en secuencia:
        1.  **`handleCellEdit(...)`**: Llama a esta función para que el cambio se refleje visualmente en la UI de inmediato (por ejemplo, cambiando el color de fondo).
        2.  **`api.patch(...)`**: Inmediatamente después, envía la petición `PATCH` al servidor para guardar el cambio de estado (`status`).
        3.  En el `.then()` de la promesa de `api.patch`, se vuelve a llamar a `setPagination` para refrescar los datos de la tabla y mostrar el estado final persistido.

La diferencia clave con el flujo anterior es que el guardado es inmediato, no requiere del botón "Guardar cambios".

---

### 4. Flujo de Actualización en Masa

Este flujo permite modificar muchas filas a la vez.

-   **Selección de Filas (Líneas 100-137)**: La primera columna contiene checkboxes para seleccionar filas. El estado de las filas seleccionadas se gestiona en el `useState` `selected`.
-   **Botón "Approve Selected" (Líneas 676-692)**:
    -   Este botón solo es visible si hay filas seleccionadas (`selected.size > 0`).
    -   Al hacer clic, envía una única petición `POST` al endpoint `/bulk-update`.
    -   El cuerpo de la petición contiene los `ids` de todas las filas seleccionadas y el objeto `updates` con los cambios a aplicar (en este caso, `{ status: 'approved' }`).
    -   Tras la actualización, limpia el conjunto de selección (`setSelected(new Set())`) y refresca los datos de la tabla.

### Conclusión

El componente `AnnotationGrid.tsx` implementa un sistema de actualización de datos robusto y flexible. Combina:

-   Un estado local (`editedCells`) para gestionar cambios pendientes de forma eficiente, permitiendo al usuario revisar antes de guardar.
-   Llamadas directas a la API para acciones rápidas y frecuentes.
-   Endpoints de actualización masiva para mejorar la productividad.
-   Un sistema de recarga de datos centralizado a través del `useEffect` de `fetchData`, que garantiza que la UI siempre esté sincronizada con el backend después de cualquier tipo de modificación. 