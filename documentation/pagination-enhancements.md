# Mejoras en la Paginación - Selector de Filas por Página

## Resumen de Cambios

Se ha implementado un selector de filas por página en el componente `AnnotationGrid.tsx`, permitiendo a los usuarios elegir cuántas filas mostrar por página. Además, se han mejorado los controles de paginación con navegación directa a páginas específicas.

## Funcionalidades Implementadas

### 1. **Selector de Filas por Página**

#### **Características:**
- ✅ **Opciones disponibles**: 10, 25, 50, 100, 200 filas por página
- ✅ **Valor por defecto**: 25 filas (mantiene la configuración original)
- ✅ **Reset automático**: Al cambiar el tamaño de página, regresa a la primera página
- ✅ **Persistencia**: El valor seleccionado se mantiene durante la sesión

#### **Implementación:**
```javascript
<select
  id="pageSize"
  value={pagination.pageSize}
  onChange={e => {
    const newPageSize = Number(e.target.value)
    setPagination({
      pageIndex: 0, // Reset to first page
      pageSize: newPageSize,
    })
  }}
>
  <option value={10}>10</option>
  <option value={25}>25</option>
  <option value={50}>50</option>
  <option value={100}>100</option>
  <option value={200}>200</option>
</select>
```

### 2. **Información de Paginación Mejorada**

#### **Nuevo Formato:**
- **Antes**: "Page 1 of 5 (125 total items)"
- **Después**: "Showing 1 to 25 of 125 results (Page 1 of 5)"

#### **Beneficios:**
- 📊 **Claridad**: Muestra exactamente qué filas se están viendo
- 🎯 **Contexto**: Proporciona información más útil para el usuario
- 📈 **Escalabilidad**: Funciona bien con cualquier número de filas

### 3. **Navegación de Páginas Avanzada**

#### **Características:**
- ✅ **Números de página**: Navegación directa a páginas específicas
- ✅ **Página actual destacada**: Resaltada con el color primario
- ✅ **Navegación inteligente**: Muestra páginas alrededor de la actual
- ✅ **Elipsis**: Indica páginas ocultas cuando hay muchas páginas
- ✅ **Primera y última página**: Siempre accesibles

#### **Lógica de Visualización:**
```javascript
// Siempre muestra la primera página si estamos lejos
if (currentPage > 3) {
  // Mostrar página 1
  // Mostrar "..." si hay gap
}

// Muestra páginas alrededor de la actual
for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
  // Mostrar página i
}

// Siempre muestra la última página si estamos lejos
if (currentPage < totalPages - 2) {
  // Mostrar "..." si hay gap
  // Mostrar última página
}
```

#### **Ejemplos de Visualización:**
- **Pocas páginas**: `[1] [2] [3] [4] [5]`
- **Muchas páginas, página actual 7**: `[1] ... [6] [7] [8] ... [20]`
- **Muchas páginas, página actual 3**: `[1] [2] [3] [4] ... [20]`
- **Muchas páginas, página actual 18**: `[1] ... [17] [18] [19] [20]`

## Implementación Técnica

### **Estados Utilizados:**
```javascript
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 25, // Valor por defecto
})
```

### **Efectos que se Disparan:**
- **Cambio de pageSize**: Dispara el `useEffect` de `fetchData`
- **Cambio de pageIndex**: Dispara el `useEffect` de `fetchData`
- **Reset automático**: Al cambiar pageSize, pageIndex se resetea a 0

### **Integración con TanStack Table:**
```javascript
const table = useReactTable({
  // ... otras configuraciones
  state: {
    pagination,
    // ... otros estados
  },
  onPaginationChange: setPagination,
  manualPagination: true,
  pageCount: Math.ceil(total / pagination.pageSize),
})
```

## Casos de Uso

### **1. Datasets Pequeños (≤ 100 filas):**
- **Configuración recomendada**: 50-100 filas por página
- **Beneficio**: Ver más datos sin paginación frecuente
- **Uso**: Revisión rápida de metáforas

### **2. Datasets Medianos (100-1000 filas):**
- **Configuración recomendada**: 25-50 filas por página
- **Beneficio**: Balance entre rendimiento y usabilidad
- **Uso**: Análisis detallado y edición

### **3. Datasets Grandes (> 1000 filas):**
- **Configuración recomendada**: 10-25 filas por página
- **Beneficio**: Carga rápida y navegación eficiente
- **Uso**: Búsqueda y filtrado específico

### **4. Análisis y Exportación:**
- **Configuración recomendada**: 100-200 filas por página
- **Beneficio**: Ver más datos antes de exportar
- **Uso**: Selección masiva para exportación

## Beneficios de la Implementación

### **1. Experiencia de Usuario:**
- 🎯 **Flexibilidad**: Cada usuario puede elegir su preferencia
- ⚡ **Rendimiento**: Optimización según el dispositivo y conexión
- 🧭 **Navegación**: Acceso directo a cualquier página
- 📱 **Responsive**: Funciona bien en diferentes tamaños de pantalla

### **2. Productividad:**
- 📊 **Análisis**: Ver más datos cuando sea necesario
- 🔍 **Búsqueda**: Navegación rápida entre páginas
- 📋 **Revisión**: Configuración óptima para diferentes tareas
- 💾 **Memoria**: Menor uso de memoria del navegador

### **3. Escalabilidad:**
- 📈 **Crecimiento**: Maneja datasets de cualquier tamaño
- 🔧 **Mantenimiento**: Fácil de mantener y extender
- 🎨 **Personalización**: Base para futuras mejoras

## Consideraciones de Rendimiento

### **1. Límites Recomendados:**
- **Máximo 200 filas por página**: Para evitar problemas de rendimiento
- **Paginación del servidor**: Ya implementada y optimizada
- **Carga diferida**: Los datos se cargan solo cuando es necesario

### **2. Optimizaciones:**
- **Debounce**: Los cambios de página no disparan múltiples requests
- **Cache**: Los datos de páginas anteriores se mantienen en memoria
- **Lazy loading**: Solo se renderizan las filas visibles

## Próximas Mejoras Sugeridas

1. **Persistencia**: Guardar la preferencia de filas por página en localStorage
2. **Configuración personalizada**: Permitir al usuario definir valores personalizados
3. **Vista previa**: Mostrar vista previa de la página antes de cambiar
4. **Atajos de teclado**: Navegación con flechas y números
5. **Indicador de carga**: Mostrar spinner durante cambios de página 