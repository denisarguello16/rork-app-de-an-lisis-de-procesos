# Configuración de Google Sheets para la App de Producción

## Instrucciones de Configuración

### 1. Crear Google Sheet
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala "Datos de Producción" o similar
4. Copia el ID de la hoja desde la URL (la cadena larga entre `/d/` y `/edit`)

### 2. Configurar Google Apps Script
1. Ve a [Google Apps Script](https://script.google.com)
2. Crea un nuevo proyecto
3. Reemplaza el código predeterminado con el siguiente:

```javascript
// IMPORTANTE: Este script incluye deduplicación para evitar registros duplicados
function doPost(e) {
  try {
    console.log('Received POST request:', e.postData.contents);
    
    const data = JSON.parse(e.postData.contents);
    
    // Reemplaza con tu ID de Google Sheet
    const sheet = SpreadsheetApp.openById('1kwnCBSwNL6qWuXVKfj2LLKKeM3uxNQIZZ3VWAYCdmLI');
    
    console.log('Successfully opened sheet:', sheet.getName());
    
    // Función auxiliar para verificar si un ID ya existe en la hoja
    function isDuplicate(targetSheet, id) {
      if (targetSheet.getLastRow() <= 1) return false; // Solo encabezados o vacío
      
      const idColumn = targetSheet.getRange(2, 1, targetSheet.getLastRow() - 1, 1).getValues();
      return idColumn.some(row => row[0] === id);
    }
    
    if (data.type === 'capacity') {
      const capacitySheet = sheet.getSheetByName('Capacity') || sheet.insertSheet('Capacity');
      
      // Agregar encabezados si la hoja está vacía
      if (capacitySheet.getLastRow() === 0) {
        capacitySheet.getRange(1, 1, 1, 13).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Resource Type', 'Resource Name', 
          'Product Name', 'Product Code', 'Line', 'Stage', 'Package Size', 
          'People Count', 'Pieces Produced', 'Defective Pieces', 'Pieces Per Minute'
        ]]);
      }
      
      // Verificar duplicados
      if (isDuplicate(capacitySheet, data.data.id)) {
        console.log('Duplicate capacity record detected, skipping:', data.data.id);
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: true, 
            message: 'Duplicate record skipped', 
            timestamp: new Date().toISOString() 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Agregar fila de datos
      const row = [
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.resourceType || '',
        data.data.resourceName || '',
        data.data.productName,
        data.data.productCode || '',
        data.data.line || '',
        data.data.stage || '',
        data.data.packageSize,
        data.data.peopleCount,
        data.data.piecesProduced,
        data.data.defectivePieces || 0,
        data.data.piecesPerMinute
      ];
      
      capacitySheet.appendRow(row);
      console.log('Successfully added capacity data row');
      
    } else if (data.type === 'rejection') {
      const rejectionSheet = sheet.getSheetByName('Rejection') || sheet.insertSheet('Rejection');
      
      // Agregar encabezados si la hoja está vacía
      if (rejectionSheet.getLastRow() === 0) {
        rejectionSheet.getRange(1, 1, 1, 8).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Line', 'Product Name', 'Package Size', 'Rejection Cause', 'Quantity'
        ]]);
      }
      
      // Verificar duplicados
      if (isDuplicate(rejectionSheet, data.data.id)) {
        console.log('Duplicate rejection record detected, skipping:', data.data.id);
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: true, 
            message: 'Duplicate record skipped', 
            timestamp: new Date().toISOString() 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Agregar fila de datos
      const row = [
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.line,
        data.data.productName,
        data.data.packageSize,
        data.data.rejectionCause,
        data.data.quantity
      ];
      
      rejectionSheet.appendRow(row);
      console.log('Successfully added rejection data row');
      
    } else if (data.type === 'setup') {
      const setupSheet = sheet.getSheetByName('Setup') || sheet.insertSheet('Setup');
      
      // Agregar encabezados si la hoja está vacía
      if (setupSheet.getLastRow() === 0) {
        setupSheet.getRange(1, 1, 1, 7).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Resource Name', 'Event Type', 'Event Time (minutes)', 'Description'
        ]]);
      }
      
      // Verificar duplicados
      if (isDuplicate(setupSheet, data.data.id)) {
        console.log('Duplicate setup record detected, skipping:', data.data.id);
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: true, 
            message: 'Duplicate record skipped', 
            timestamp: new Date().toISOString() 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Agregar fila de datos
      const row = [
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.resourceName,
        data.data.eventType,
        data.data.eventTime,
        data.data.description || ''
      ];
      
      setupSheet.appendRow(row);
      console.log('Successfully added setup time data row');
      
    } else if (data.type === 'cycle-time') {
      const cycleTimeSheet = sheet.getSheetByName('CycleTime') || sheet.insertSheet('CycleTime');
      
      // Agregar encabezados si la hoja está vacía
      if (cycleTimeSheet.getLastRow() === 0) {
        cycleTimeSheet.getRange(1, 1, 1, 7).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Product Name', 'Packaging Machine', 'Cycle Time (seconds)', 'Observations'
        ]]);
      }
      
      // Verificar duplicados
      if (isDuplicate(cycleTimeSheet, data.data.id)) {
        console.log('Duplicate cycle time record detected, skipping:', data.data.id);
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: true, 
            message: 'Duplicate record skipped', 
            timestamp: new Date().toISOString() 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Agregar fila de datos
      const row = [
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.productName,
        data.data.packagingMachine,
        data.data.cycleTime,
        data.data.observations || ''
      ];
      
      cycleTimeSheet.appendRow(row);
      console.log('Successfully added cycle time data row');
      
    } else if (data.type === 'productivity') {
      const productivitySheet = sheet.getSheetByName('Productivity') || sheet.insertSheet('Productivity');
      
      // Agregar encabezados si la hoja está vacía
      if (productivitySheet.getLastRow() === 0) {
        productivitySheet.getRange(1, 1, 1, 10).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Stage', 'Product Family', 'Output Unit', 'Output', 'Events', 'Utilization %', 'Capacity per Hour'
        ]]);
      }
      
      // Verificar duplicados
      if (isDuplicate(productivitySheet, data.data.id)) {
        console.log('Duplicate productivity record detected, skipping:', data.data.id);
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: true, 
            message: 'Duplicate record skipped', 
            timestamp: new Date().toISOString() 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Agregar fila de datos
      const row = [
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.stage,
        data.data.productFamily,
        data.data.outputUnit,
        data.data.output,
        data.data.events || '',
        data.data.utilizationPercentage,
        data.data.capacityPerHour
      ];
      
      productivitySheet.appendRow(row);
      console.log('Successfully added productivity data row');
      
    } else if (data.type === 'capacity') {
      const capacitySheet = sheet.getSheetByName('Capacity') || sheet.insertSheet('Capacity');
      
      // Agregar encabezados si la hoja está vacía
      if (capacitySheet.getLastRow() === 0) {
        capacitySheet.getRange(1, 1, 1, 10).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Resource Type', 'Resource Name', 'Product Name', 'Package Size', 'People Count', 'Pieces Produced', 'Defective Pieces', 'Pieces Per Minute'
        ]]);
      }
      
      // Verificar duplicados
      if (isDuplicate(capacitySheet, data.data.id)) {
        console.log('Duplicate capacity record detected, skipping:', data.data.id);
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: true, 
            message: 'Duplicate record skipped', 
            timestamp: new Date().toISOString() 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Agregar fila de datos
      const row = [
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.resourceType || '',
        data.data.resourceName || '',
        data.data.productName,
        data.data.packageSize,
        data.data.peopleCount,
        data.data.piecesProduced,
        data.data.defectivePieces || 0,
        data.data.piecesPerMinute
      ];
      
      capacitySheet.appendRow(row);
      console.log('Successfully added capacity data row');
      
    } else if (data.type === 'test') {
      console.log('Test request received:', data.data);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Test successful', timestamp: new Date().toISOString() }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      console.log('Unknown data type received:', data.type);
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Unknown data type: ' + data.type }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('Data processing completed successfully');
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully', timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error.toString());
    console.error('Error stack:', error.stack);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. **IMPORTANTE**: Reemplaza el ID de la hoja en la línea `SpreadsheetApp.openById('...')` con tu ID real
5. El código incluye deduplicación automática basada en el ID único de cada registro

### 3. Desplegar como Web App
1. En Google Apps Script, haz clic en "Desplegar" > "Nueva implementación"
2. Selecciona "Aplicación web" como tipo
3. Configura:
   - Ejecutar como: "Yo"
   - Acceso: "Cualquier persona"
4. Haz clic en "Desplegar"
5. Copia la URL de la aplicación web
6. **IMPORTANTE**: Si ya tienes una implementación anterior, debes crear una "Nueva implementación" para que los cambios surtan efecto

### 4. Actualizar la Configuración en la App
1. Abre el archivo `services/google-sheets.ts`
2. Actualiza `API_ENDPOINT` con la URL de tu Google Apps Script
3. Actualiza `SHEET_ID` con el ID de tu Google Sheet

### 5. Solución de Problemas Comunes

**Registros Duplicados:**
- El nuevo script incluye deduplicación automática
- Cada registro tiene un ID único que combina timestamp y un código aleatorio
- Si un registro con el mismo ID ya existe, se omite automáticamente

**Error "openById on object SpreadsheetApp":**
- Verifica que el ID de la hoja sea correcto (solo el ID, no la URL completa)
- Asegúrate de que el script tenga permisos para acceder a la hoja

**Error "HTML en lugar de JSON":**
- Verifica que el script esté desplegado como "Web App"
- Asegúrate de que el acceso esté configurado como "Cualquier persona"
- Crea una nueva implementación si modificaste el código

**Timeout al guardar:**
- El timeout se aumentó a 15 segundos
- Los datos se guardan localmente si falla la sincronización
- Se reintentarán automáticamente cuando haya conexión

### 6. Probar la Integración
1. Ejecuta la app
2. Registra algunos datos de prueba
3. Verifica que los datos aparezcan en tu Google Sheet sin duplicados

## Mejoras Implementadas

### 1. IDs Únicos
- Cada registro ahora tiene un ID único: `timestamp-randomcode`
- Ejemplo: `1704067200000-a3b5c7d9e`
- Esto previene colisiones incluso si dos registros se crean al mismo tiempo

### 2. Deduplicación en Google Sheets
- El script verifica si un ID ya existe antes de insertar
- Si encuentra un duplicado, lo omite y devuelve éxito
- Esto previene duplicados causados por reintentos de sincronización

### 3. Mejor Manejo de Errores
- Timeout aumentado a 15 segundos
- Solo se agregan registros a la cola de sincronización si fallan
- Los registros exitosos no se reintentan

### 4. Sincronización Optimizada
- Los registros se intentan guardar inmediatamente
- Solo se agregan a la cola si falla el guardado inmediato
- Esto reduce la posibilidad de duplicados

## Estructura de Datos Actualizada

### Hoja "Capacity"
- ID, Inspector, Timestamp, Resource Type, Resource Name, Product Name, Package Size, People Count, Pieces Produced, Defective Pieces, Pieces Per Minute

### Hoja "Rejection"
- ID, Inspector, Timestamp, Line, Product Name, Package Size, Rejection Cause, Quantity

### Hoja "Setup"
- ID, Inspector, Timestamp, Resource Name, Event Type, Event Time (minutes), Description

### Hoja "CycleTime"
- ID, Inspector, Timestamp, Product Name, Packaging Machine, Cycle Time (seconds), Observations

### Hoja "Productivity" (Estimación de Productividad)
- ID, Inspector, Timestamp, Stage, Product Family, Output Unit, Output, Events, Utilization %, Capacity per Hour

## Notas Importantes
- Los datos se guardan localmente en la app primero
- Se intenta sincronizar inmediatamente con Google Sheets
- Si falla, se agrega a una cola de sincronización automática
- La deduplicación previene registros duplicados en Google Sheets
- Los IDs únicos aseguran que cada registro sea identificable
