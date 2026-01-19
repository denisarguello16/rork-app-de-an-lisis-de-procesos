# Configuración de Google Sheets

## Paso 1: Abre tu Google Sheet

Abre el Google Sheet donde quieres guardar los datos.

## Paso 2: Abre el Editor de Apps Script

1. Ve a **Extensiones** → **Apps Script**
2. Borra todo el código que aparezca por defecto
3. Copia y pega el siguiente código:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    
    Logger.log('Tipo recibido: ' + data.type);
    Logger.log('Datos: ' + JSON.stringify(data.data));
    
    if (data.type === 'capacity') {
      var capacitySheet = sheet.getSheetByName('Capacity');
      if (!capacitySheet) {
        capacitySheet = sheet.insertSheet('Capacity');
        capacitySheet.appendRow(['ID', 'Inspector', 'Timestamp', 'Tipo Recurso', 'Nombre Recurso', 'Producto', 'Código', 'Línea', 'Etapa', 'Tamaño Empaque', 'Personas', 'Piezas Producidas', 'Piezas Defectuosas', 'Piezas/Min']);
      }
      capacitySheet.appendRow([
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.resourceType,
        data.data.resourceName,
        data.data.productName,
        data.data.productCode,
        data.data.line,
        data.data.stage,
        data.data.packageSize,
        data.data.peopleCount,
        data.data.piecesProduced,
        data.data.defectivePieces,
        data.data.piecesPerMinute
      ]);
    }
    
    else if (data.type === 'rejection') {
      var rejectionSheet = sheet.getSheetByName('Rejection');
      if (!rejectionSheet) {
        rejectionSheet = sheet.insertSheet('Rejection');
        rejectionSheet.appendRow(['ID', 'Inspector', 'Timestamp', 'Línea', 'Producto', 'Tamaño Empaque', 'Causa Rechazo', 'Cantidad']);
      }
      rejectionSheet.appendRow([
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.line,
        data.data.productName,
        data.data.packageSize,
        data.data.rejectionCause,
        data.data.quantity
      ]);
    }
    
    else if (data.type === 'setup') {
      var setupSheet = sheet.getSheetByName('Setup');
      if (!setupSheet) {
        setupSheet = sheet.insertSheet('Setup');
        setupSheet.appendRow(['ID', 'Inspector', 'Timestamp', 'Recurso', 'Tipo Evento', 'Tiempo (min)', 'Descripción']);
      }
      setupSheet.appendRow([
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.resourceName,
        data.data.eventType,
        data.data.eventTime,
        data.data.description
      ]);
    }
    
    else if (data.type === 'cycle-time') {
      var cycleSheet = sheet.getSheetByName('CycleTime');
      if (!cycleSheet) {
        cycleSheet = sheet.insertSheet('CycleTime');
        cycleSheet.appendRow(['ID', 'Inspector', 'Timestamp', 'Producto', 'Máquina Empaque', 'Tiempo Ciclo (seg)', 'Observaciones']);
      }
      cycleSheet.appendRow([
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.productName,
        data.data.packagingMachine,
        data.data.cycleTime,
        data.data.observations
      ]);
    }
    
    else if (data.type === 'productivity') {
      var productivitySheet = sheet.getSheetByName('Productivity');
      if (!productivitySheet) {
        productivitySheet = sheet.insertSheet('Productivity');
        productivitySheet.appendRow(['ID', 'Inspector', 'Timestamp', 'Etapa', 'Familia Producto', 'Unidad', 'Output', 'RUN%', 'STARVED%', 'BLOCKED%', 'SETUP%', 'AJUSTE%', 'SANIT%', 'FALLA%', 'LOGISTICA%', 'OTROS%', 'Utilización%', 'Capacidad/Hora']);
      }
      productivitySheet.appendRow([
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.stage,
        data.data.productFamily,
        data.data.outputUnit,
        data.data.output,
        data.data.runPercentage,
        data.data.starvedPercentage,
        data.data.blockedPercentage,
        data.data.setupPercentage,
        data.data.ajustePercentage,
        data.data.sanitPercentage,
        data.data.fallaPercentage,
        data.data.logisticaPercentage,
        data.data.otrosPercentage,
        data.data.utilizationPercentage,
        data.data.capacityPerHour
      ]);
    }
    
    else if (data.type === 'matanza-utilization') {
      var matanzaUtilSheet = sheet.getSheetByName('MatanzaUtilization');
      if (!matanzaUtilSheet) {
        matanzaUtilSheet = sheet.insertSheet('MatanzaUtilization');
        matanzaUtilSheet.appendRow(['ID', 'Inspector', 'Timestamp', 'Etapa', 'Código Empleado', 'Output', 'CT Seg', 'SSOP Seg', 'Pérdidas Seg', 'CT%', 'SSOP%', 'Pérdidas%', 'Tiempo Total', 'CT/Unidad']);
      }
      matanzaUtilSheet.appendRow([
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.stage,
        data.data.employeeCode,
        data.data.output,
        data.data.ctSeconds,
        data.data.ssopSeconds,
        data.data.perdidasSeconds,
        data.data.ctPercentage,
        data.data.ssopPercentage,
        data.data.perdidasPercentage,
        data.data.totalTime,
        data.data.cycleTimePerUnit
      ]);
    }
    
    else if (data.type === 'matanza-productivity') {
      var matanzaProdSheet = sheet.getSheetByName('MatanzaProductivity');
      if (!matanzaProdSheet) {
        matanzaProdSheet = sheet.insertSheet('MatanzaProductivity');
        matanzaProdSheet.appendRow(['ID', 'Inspector', 'Timestamp', 'Etapa', 'Código Empleado', 'Output', 'RUN Seg', 'STARVED Seg', 'BLOCKED Seg', 'SETUP Seg', 'AJUSTE Seg', 'SANIT Seg', 'FALLA Seg', 'LOGISTICA Seg', 'OTROS Seg', 'RUN%', 'STARVED%', 'BLOCKED%', 'SETUP%', 'AJUSTE%', 'SANIT%', 'FALLA%', 'LOGISTICA%', 'OTROS%', 'Tiempo Total', 'CT/Unidad']);
      }
      matanzaProdSheet.appendRow([
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.stage,
        data.data.employeeCode,
        data.data.output,
        data.data.runSeconds,
        data.data.starvedSeconds,
        data.data.blockedSeconds,
        data.data.setupSeconds,
        data.data.ajusteSeconds,
        data.data.sanitSeconds,
        data.data.fallaSeconds,
        data.data.logisticaSeconds,
        data.data.otrosSeconds,
        data.data.runPercentage,
        data.data.starvedPercentage,
        data.data.blockedPercentage,
        data.data.setupPercentage,
        data.data.ajustePercentage,
        data.data.sanitPercentage,
        data.data.fallaPercentage,
        data.data.logisticaPercentage,
        data.data.otrosPercentage,
        data.data.totalTime,
        data.data.cycleTimePerUnit
      ]);
    }
    
    else if (data.type === 'test') {
      Logger.log('Test recibido exitosamente');
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: 'ok', message: 'API funcionando'})).setMimeType(ContentService.MimeType.JSON);
}
```

## Paso 3: Guardar el proyecto

1. Haz clic en el icono de guardar (💾) o presiona **Ctrl+S**
2. Dale un nombre al proyecto, por ejemplo: "ProductionAPI"

## Paso 4: Implementar como Web App

1. Haz clic en **Implementar** → **Nueva implementación**
2. Haz clic en el icono de engranaje ⚙️ junto a "Seleccionar tipo"
3. Selecciona **Aplicación web**
4. Configura:
   - **Descripción**: "API de Producción"
   - **Ejecutar como**: "Yo" (tu cuenta)
   - **Quién tiene acceso**: **Cualquier persona**
5. Haz clic en **Implementar**
6. Autoriza la aplicación cuando te lo pida (haz clic en "Avanzado" → "Ir a [nombre del proyecto]" si aparece advertencia)
7. **COPIA LA URL** que aparece (empieza con `https://script.google.com/macros/s/...`)

## Paso 5: Actualizar la URL en la App

Si tu URL es diferente a la configurada, necesitas actualizar el archivo `services/google-sheets.ts`:

```typescript
const GOOGLE_SHEETS_CONFIG = {
  API_ENDPOINT: 'TU_NUEVA_URL_AQUÍ',
};
```

## Paso 6: Probar

1. Guarda un registro en la app
2. Verifica en tu Google Sheet que se creó la hoja correspondiente y el dato

## Solución de Problemas

### Los datos no se guardan
1. Verifica que la URL del script esté correcta
2. Asegúrate de que el script esté desplegado con acceso "Cualquier persona"
3. Revisa los logs en Apps Script: **Ver** → **Registros de ejecución**

### Error de autorización
1. Ve a **Implementar** → **Administrar implementaciones**
2. Crea una nueva implementación
3. Vuelve a autorizar con los permisos necesarios

### Para ver los logs del script
1. En Apps Script, ve a **Ver** → **Registros de ejecución**
2. También puedes usar `Logger.log()` para depurar
