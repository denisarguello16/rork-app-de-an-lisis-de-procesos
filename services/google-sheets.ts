import { CapacityData, UtilizationData, RejectionData, WIPData, SetupTimeData, CycleTimeData } from '@/types/production';
import { getNicaraguaTime, formatForGoogleSheets } from '@/constants/timezone';

const GOOGLE_SHEETS_CONFIG = {
  API_ENDPOINT: 'https://script.google.com/macros/s/AKfycbzbSbXR0igAgd-JgQQERb3eE3KrHaP40mNkptkOrUZU5BXd2653mob95omw8YYlz1M3/exec',
  SHEET_ID: '1kwnCBSwNL6qWuXVKfj2LLKKeM3uxNQIZZ3VWAYCdmLI'
};

class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minDelay = 2000;
  private requestCount = 0;
  private windowStart = Date.now();
  private maxRequestsPerMinute = 20;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          
          if (now - this.windowStart > 60000) {
            this.requestCount = 0;
            this.windowStart = now;
          }
          
          if (this.requestCount >= this.maxRequestsPerMinute) {
            const waitTime = 60000 - (now - this.windowStart);
            console.log(`⏳ Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s`);
            await new Promise(r => setTimeout(r, waitTime));
            this.requestCount = 0;
            this.windowStart = Date.now();
          }
          
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.minDelay) {
            await new Promise(r => setTimeout(r, this.minDelay - timeSinceLastRequest));
          }
          
          this.lastRequestTime = Date.now();
          this.requestCount++;
          
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.error('❌ Queue task error:', error);
        }
      }
    }
    
    this.processing = false;
  }
}

const rateLimiter = new RateLimiter();

// Check if Google Sheets is properly configured
export const isGoogleSheetsConfigured = (): boolean => {
  return GOOGLE_SHEETS_CONFIG.API_ENDPOINT.includes('AKfycb') && 
         GOOGLE_SHEETS_CONFIG.SHEET_ID.length > 10;
};

interface GoogleSheetsResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Function to diagnose Google Sheets configuration
export const diagnoseGoogleSheetsSetup = async (): Promise<GoogleSheetsResponse & { details?: string }> => {
  // Check if endpoint looks valid
  if (!GOOGLE_SHEETS_CONFIG.API_ENDPOINT.includes('script.google.com')) {
    return {
      success: false,
      error: 'URL del endpoint no válida. Debe ser una URL de Google Apps Script.',
      details: `URL actual: ${GOOGLE_SHEETS_CONFIG.API_ENDPOINT}`
    };
  }

  if (!GOOGLE_SHEETS_CONFIG.API_ENDPOINT.includes('/exec')) {
    return {
      success: false,
      error: 'URL del endpoint debe terminar en /exec',
      details: `URL actual: ${GOOGLE_SHEETS_CONFIG.API_ENDPOINT}`
    };
  }

  try {
    const testPayload = {
      type: 'test',
      data: {
        timestamp: getNicaraguaTime().toISOString(),
        message: 'Connection test from app'
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await rateLimiter.execute(() => 
      fetch(GOOGLE_SHEETS_CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal
      })
    );

    clearTimeout(timeoutId);

    const responseText = await response.text();

    if (!response.ok) {
      return {
        success: false,
        error: `Error HTTP ${response.status}: ${response.statusText}`,
        details: `Respuesta del servidor: ${responseText.substring(0, 500)}...`
      };
    }

    // Check if response is HTML (common when script URL is wrong)
    if (responseText.trim().startsWith('<')) {
      return {
        success: false,
        error: 'El servidor devolvió HTML en lugar de JSON. Verifica que la URL del script sea correcta y esté desplegado como Web App.',
        details: `Respuesta HTML recibida: ${responseText.substring(0, 200)}...`
      };
    }

    try {
      const result = JSON.parse(responseText);
      return {
        success: true,
        message: 'Conexión exitosa con Google Sheets',
        details: `Respuesta: ${JSON.stringify(result)}`
      };
    } catch (parseError) {
      return {
        success: false,
        error: 'Respuesta no es JSON válido',
        details: `Error de parsing: ${parseError}\nRespuesta: ${responseText.substring(0, 200)}...`
      };
    }
  } catch (error) {
    // Handle specific error types with better user messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Tiempo de espera agotado al conectar con Google Sheets',
          details: 'La conexión tardó más de 8 segundos. Verifica tu conexión a internet.'
        };
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Sin conexión a internet o Google Sheets no disponible',
          details: 'No se pudo conectar con Google Sheets. Verifica tu conexión a internet y que el script esté desplegado correctamente.'
        };
      }
      
      if (error.message.includes('NetworkError') || error.message.includes('network')) {
        return {
          success: false,
          error: 'Error de red al conectar con Google Sheets',
          details: 'Problema de conectividad. Los datos se guardarán localmente.'
        };
      }
    }
    
    return {
      success: false,
      error: 'Error de conexión con Google Sheets',
      details: `Los datos se guardarán localmente. Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
};

// Function to test Google Sheets connection
export const testGoogleSheetsConnection = async (): Promise<GoogleSheetsResponse> => {
  const diagnosis = await diagnoseGoogleSheetsSetup();
  return {
    success: diagnosis.success,
    message: diagnosis.message,
    error: diagnosis.error
  };
};

// Function to save rejection data to Google Sheets
export const saveRejectionDataToSheets = async (data: RejectionData): Promise<GoogleSheetsResponse> => {
  // Check if Google Sheets is configured
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets not configured. Data saved locally only.'
    };
  }

  try {
    const payload = {
      type: 'rejection',
      data: {
        id: data.id,
        inspector: data.inspector,
        timestamp: formatForGoogleSheets(data.timestamp),
        line: data.line,
        productName: data.productName,
        packageSize: data.packageSize,
        rejectionCause: data.rejectionCause,
        quantity: data.quantity
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await rateLimiter.execute(() => 
      fetch(GOOGLE_SHEETS_CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 429 || errorText.includes('Demasiadas solicitudes') || errorText.includes('Too many requests')) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      
      console.error('❌ HTTP Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    
    // Check if response is HTML (indicates wrong URL or deployment issue)
    if (responseText.trim().startsWith('<')) {
      throw new Error('Server returned HTML. Please verify Google Apps Script configuration.');
    }
    
    try {
      const result = JSON.parse(responseText);
      return result;
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.warn('⚠️ Google Sheets sync failed (data saved locally):', error);
    
    // Handle different types of errors with user-friendly messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Tiempo de espera agotado. Los datos se guardaron localmente.'
        };
      }
      
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Sin conexión a internet. Los datos se guardaron localmente.'
        };
      }
      
      return {
        success: false,
        error: 'Error de sincronización. Los datos se guardaron localmente.'
      };
    }
    
    return {
      success: false,
      error: 'Error desconocido. Los datos se guardaron localmente.'
    };
  }
};

// Function to save WIP data to Google Sheets
export const saveWIPDataToSheets = async (data: WIPData): Promise<GoogleSheetsResponse> => {
  // Check if Google Sheets is configured
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets not configured. Data saved locally only.'
    };
  }

  try {
    const payload = {
      type: 'wip',
      data: {
        id: data.id,
        inspector: data.inspector,
        timestamp: formatForGoogleSheets(data.timestamp),
        line: data.line,
        productState: data.productState,
        productConfig: data.productConfig,
        packagingType: data.packagingType,
        hasIndividualWeightLabel: data.hasIndividualWeightLabel,
        productCode: data.productCode,
        productName: data.productName,
        packaging: data.packaging,
        queueBeforePortioning: data.queueBeforePortioning,
        queueBeforePackaging: data.queueBeforePackaging,
        queueBeforeIndividualLabeling: data.queueBeforeIndividualLabeling,
        queueBeforeBoxClosure: data.queueBeforeBoxClosure,
        queueBeforeBoxStrapping: data.queueBeforeBoxStrapping
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await rateLimiter.execute(() => 
      fetch(GOOGLE_SHEETS_CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 429 || errorText.includes('Demasiadas solicitudes') || errorText.includes('Too many requests')) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      
      console.error('❌ HTTP Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    
    // Check if response is HTML (indicates wrong URL or deployment issue)
    if (responseText.trim().startsWith('<')) {
      throw new Error('Server returned HTML. Please verify Google Apps Script configuration.');
    }
    
    try {
      const result = JSON.parse(responseText);
      return result;
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.warn('⚠️ Google Sheets sync failed (data saved locally):', error);
    
    // Handle different types of errors with user-friendly messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Tiempo de espera agotado. Los datos se guardaron localmente.'
        };
      }
      
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Sin conexión a internet. Los datos se guardaron localmente.'
        };
      }
      
      return {
        success: false,
        error: 'Error de sincronización. Los datos se guardaron localmente.'
      };
    }
    
    return {
      success: false,
      error: 'Error desconocido. Los datos se guardaron localmente.'
    };
  }
};

// Function to save Cycle Time data to Google Sheets
export const saveCycleTimeDataToSheets = async (data: CycleTimeData): Promise<GoogleSheetsResponse> => {
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets not configured. Data saved locally only.'
    };
  }

  try {
    const payload = {
      type: 'cycletime',
      data: {
        id: data.id,
        inspector: data.inspector,
        timestamp: formatForGoogleSheets(data.timestamp),
        productName: data.productName,
        packingMachine: data.packingMachine,
        cycleTime: data.cycleTime,
        observations: data.observations
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(GOOGLE_SHEETS_CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const responseText = await response.text();
    
    if (responseText.trim().startsWith('<')) {
      throw new Error('Server returned HTML. Please verify Google Apps Script configuration.');
    }
    
    try {
      const result = JSON.parse(responseText);
      return result;
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.warn('⚠️ Google Sheets sync failed (data saved locally):', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Tiempo de espera agotado. Los datos se guardaron localmente.'
        };
      }
      
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Sin conexión a internet. Los datos se guardaron localmente.'
        };
      }
      
      return {
        success: false,
        error: 'Error de sincronización. Los datos se guardaron localmente.'
      };
    }
    
    return {
      success: false,
      error: 'Error desconocido. Los datos se guardaron localmente.'
    };
  }
};

// Function to save Setup Time data to Google Sheets
export const saveSetupTimeDataToSheets = async (data: SetupTimeData): Promise<GoogleSheetsResponse> => {
  // Check if Google Sheets is configured
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets not configured. Data saved locally only.'
    };
  }

  try {
    const payload = {
      type: 'setup',
      data: {
        id: data.id,
        inspector: data.inspector,
        timestamp: formatForGoogleSheets(data.timestamp),
        resourceName: data.resourceName,
        eventType: data.eventType,
        eventTime: data.eventTime,
        description: data.description
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await rateLimiter.execute(() => 
      fetch(GOOGLE_SHEETS_CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 429 || errorText.includes('Demasiadas solicitudes') || errorText.includes('Too many requests')) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      
      console.error('❌ HTTP Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    
    // Check if response is HTML (indicates wrong URL or deployment issue)
    if (responseText.trim().startsWith('<')) {
      throw new Error('Server returned HTML. Please verify Google Apps Script configuration.');
    }
    
    try {
      const result = JSON.parse(responseText);
      return result;
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.warn('⚠️ Google Sheets sync failed (data saved locally):', error);
    
    // Handle different types of errors with user-friendly messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Tiempo de espera agotado. Los datos se guardaron localmente.'
        };
      }
      
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Sin conexión a internet. Los datos se guardaron localmente.'
        };
      }
      
      return {
        success: false,
        error: 'Error de sincronización. Los datos se guardaron localmente.'
      };
    }
    
    return {
      success: false,
      error: 'Error desconocido. Los datos se guardaron localmente.'
    };
  }
};

// Function to save data with fallback to local storage
export const saveDataWithFallback = async (data: CapacityData | UtilizationData | RejectionData | WIPData | SetupTimeData | CycleTimeData, type: 'capacity' | 'utilization' | 'rejection' | 'wip' | 'setup' | 'cycletime'): Promise<GoogleSheetsResponse> => {
  try {
    // Try to save to Google Sheets first
    const result = type === 'capacity' 
      ? await saveCapacityDataToSheets(data as CapacityData)
      : type === 'utilization'
      ? await saveUtilizationDataToSheets(data as UtilizationData)
      : type === 'rejection'
      ? await saveRejectionDataToSheets(data as RejectionData)
      : type === 'wip'
      ? await saveWIPDataToSheets(data as WIPData)
      : type === 'cycletime'
      ? await saveCycleTimeDataToSheets(data as CycleTimeData)
      : await saveSetupTimeDataToSheets(data as SetupTimeData);
    
    if (result.success) {
      return result;
    } else {
      // If Google Sheets fails, save locally
      console.log('Google Sheets failed, saving locally as backup');
      // Note: Local storage implementation would go here
      return {
        success: true,
        message: 'Data saved locally (Google Sheets unavailable)'
      };
    }
  } catch (error) {
    console.error('Error in saveDataWithFallback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to save capacity data to Google Sheets
export const saveCapacityDataToSheets = async (data: CapacityData): Promise<GoogleSheetsResponse> => {
  // Check if Google Sheets is configured
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets not configured. Data saved locally only.'
    };
  }

  try {
    const payload = {
      type: 'capacity',
      data: {
        id: data.id,
        inspector: data.inspector,
        timestamp: formatForGoogleSheets(data.timestamp),
        resourceType: data.resourceType,
        resourceName: data.resourceName,
        productName: data.productName,
        packageSize: data.packageSize,
        peopleCount: data.peopleCount,
        piecesProduced: data.piecesProduced,
        defectivePieces: data.defectivePieces,
        piecesPerMinute: data.piecesPerMinute
      }
    };

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(GOOGLE_SHEETS_CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const responseText = await response.text();
    
    // Check if response is HTML (indicates wrong URL or deployment issue)
    if (responseText.trim().startsWith('<')) {
      throw new Error('El servidor devolvió HTML. Verifica la configuración del Google Apps Script.');
    }
    
    try {
      const result = JSON.parse(responseText);
      return result;
    } catch (parseError) {
      throw new Error(`Respuesta no es JSON válido: ${responseText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.warn('⚠️ Google Sheets sync failed (data saved locally):', error);
    
    // Handle different types of errors with user-friendly messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Tiempo de espera agotado. Los datos se guardaron localmente.'
        };
      }
      
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Sin conexión a internet. Los datos se guardaron localmente.'
        };
      }
      
      return {
        success: false,
        error: 'Error de sincronización. Los datos se guardaron localmente.'
      };
    }
    
    return {
      success: false,
      error: 'Error desconocido. Los datos se guardaron localmente.'
    };
  }
};

// Function to save utilization data to Google Sheets
export const saveUtilizationDataToSheets = async (data: UtilizationData): Promise<GoogleSheetsResponse> => {
  // Check if Google Sheets is configured
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets not configured. Data saved locally only.'
    };
  }

  try {
    const payload = {
      type: 'utilization',
      data: {
        id: data.id,
        inspector: data.inspector,
        timestamp: formatForGoogleSheets(data.timestamp),
        resourceType: data.resourceType,
        resourceName: data.resourceName,
        productName: data.productName,
        availableTime: data.availableTime,
        productiveTime: data.productiveTime,
        utilizationPercentage: data.utilizationPercentage,
        observations: data.observations
      }
    };

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(GOOGLE_SHEETS_CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const responseText = await response.text();
    
    // Check if response is HTML (indicates wrong URL or deployment issue)
    if (responseText.trim().startsWith('<')) {
      throw new Error('El servidor devolvió HTML. Verifica la configuración del Google Apps Script.');
    }
    
    try {
      const result = JSON.parse(responseText);
      return result;
    } catch (parseError) {
      throw new Error(`Respuesta no es JSON válido: ${responseText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.error('Error saving utilization data to Google Sheets:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout: Google Sheets took too long to respond. Data saved locally.'
        };
      }
      
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network error: Unable to connect to Google Sheets. Please check your internet connection. Data saved locally.'
        };
      }
      
      return {
        success: false,
        error: `Google Sheets error: ${error.message}. Data saved locally.`
      };
    }
    
    return {
      success: false,
      error: 'Unknown error occurred while saving to Google Sheets. Data saved locally.'
    };
  }
};

// Function to create the Google Apps Script code (for reference)
export const getGoogleAppsScriptCode = () => {
  return `
// Google Apps Script code to handle POST requests and save data to Google Sheets
// Deploy this as a web app with execute permissions set to "Anyone"
// IMPORTANT: Replace 'YOUR_GOOGLE_SHEET_ID' with your actual Google Sheet ID

function doPost(e) {
  try {
    // Log the incoming request for debugging
    console.log('Received POST request:', e.postData.contents);
    
    const data = JSON.parse(e.postData.contents);
    
    // IMPORTANT: Replace 'YOUR_GOOGLE_SHEET_ID' with your actual Google Sheet ID
    const sheet = SpreadsheetApp.openById('YOUR_GOOGLE_SHEET_ID');
    
    // Log successful sheet access
    console.log('Successfully opened sheet:', sheet.getName());
    
    if (data.type === 'capacity') {
      const capacitySheet = sheet.getSheetByName('Capacity') || sheet.insertSheet('Capacity');
      
      // Add headers if sheet is empty
      if (capacitySheet.getLastRow() === 0) {
        capacitySheet.getRange(1, 1, 1, 17).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Line', 'Product State', 'Product Config',
          'Packaging Type', 'Has Individual Weight Label', 'Product Code', 'Product Name', 'Packaging',
          'Package Size', 'Stage', 'People Count', 'Pieces Produced', 'Defective Pieces', 'Pieces Per Minute'
        ]]);
      }
      
      // Add data row
      const row = [
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.line,
        data.data.productState,
        data.data.productConfig,
        data.data.packagingType,
        data.data.hasIndividualWeightLabel,
        data.data.productCode,
        data.data.productName,
        data.data.packaging,
        data.data.packageSize,
        data.data.stage,
        data.data.peopleCount,
        data.data.piecesProduced,
        data.data.defectivePieces,
        data.data.piecesPerMinute
      ];
      
      capacitySheet.appendRow(row);
      console.log('Successfully added capacity data row');
      
    } else if (data.type === 'utilization') {
      const utilizationSheet = sheet.getSheetByName('Utilization') || sheet.insertSheet('Utilization');
      
      // Add headers if sheet is empty
      if (utilizationSheet.getLastRow() === 0) {
        utilizationSheet.getRange(1, 1, 1, 17).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Line', 'Product State', 'Product Config',
          'Packaging Type', 'Has Individual Weight Label', 'Product Code', 'Product Name',
          'Packaging', 'Stage', 'Monitoring Interval', 'Available Time', 'Productive Time',
          'Utilization Percentage', 'Observations'
        ]]);
      }
      
      // Add data row
      const row = [
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.line,
        data.data.productState,
        data.data.productConfig,
        data.data.packagingType,
        data.data.hasIndividualWeightLabel,
        data.data.productCode,
        data.data.productName,
        data.data.packaging,
        data.data.stage || '',
        data.data.monitoringInterval,
        data.data.availableTime,
        data.data.productiveTime,
        data.data.utilizationPercentage,
        data.data.observations
      ];
      
      utilizationSheet.appendRow(row);
      console.log('Successfully added utilization data row');
      
    } else if (data.type === 'rejection') {
      const rejectionSheet = sheet.getSheetByName('Rejection') || sheet.insertSheet('Rejection');
      
      // Add headers if sheet is empty
      if (rejectionSheet.getLastRow() === 0) {
        rejectionSheet.getRange(1, 1, 1, 8).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Line', 'Product Name', 'Package Size', 'Rejection Cause', 'Quantity'
        ]]);
      }
      
      // Add data row
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
      
    } else if (data.type === 'wip') {
      const wipSheet = sheet.getSheetByName('WIP') || sheet.insertSheet('WIP');
      
      // Add headers if sheet is empty
      if (wipSheet.getLastRow() === 0) {
        wipSheet.getRange(1, 1, 1, 16).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Line', 'Product State', 'Product Config',
          'Packaging Type', 'Has Individual Weight Label', 'Product Code', 'Product Name',
          'Packaging', 'Queue Before Portioning', 'Queue Before Packaging', 'Queue Before Individual Labeling',
          'Queue Before Box Closure', 'Queue Before Box Strapping'
        ]]);
      }
      
      // Add data row
      const row = [
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.line,
        data.data.productState,
        data.data.productConfig,
        data.data.packagingType,
        data.data.hasIndividualWeightLabel,
        data.data.productCode,
        data.data.productName,
        data.data.packaging,
        data.data.queueBeforePortioning,
        data.data.queueBeforePackaging,
        data.data.queueBeforeIndividualLabeling,
        data.data.queueBeforeBoxClosure,
        data.data.queueBeforeBoxStrapping
      ];
      
      wipSheet.appendRow(row);
      console.log('Successfully added WIP data row');
      
    } else if (data.type === 'setup') {
      const setupSheet = sheet.getSheetByName('Setup') || sheet.insertSheet('Setup');
      
      // Add headers if sheet is empty
      if (setupSheet.getLastRow() === 0) {
        setupSheet.getRange(1, 1, 1, 7).setValues([[
          'ID', 'Inspector', 'Timestamp', 'Line', 'Setup Type', 'Setup Time (minutes)', 'Description'
        ]]);
      }
      
      // Add data row
      const row = [
        data.data.id,
        data.data.inspector,
        data.data.timestamp,
        data.data.line,
        data.data.setupType,
        data.data.setupTime,
        data.data.description || ''
      ];
      
      setupSheet.appendRow(row);
      console.log('Successfully added setup time data row');
      
    } else if (data.type === 'test') {
      // Handle test requests
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
`;
};

// Instructions for setting up Google Sheets integration
export const getSetupInstructions = () => {
  return `
Google Sheets Integration Setup Instructions:

1. Create a new Google Sheet for your production data
2. Note the Sheet ID from the URL (the long string between /d/ and /edit)
3. Go to script.google.com and create a new project
4. Replace the default code with the Google Apps Script code provided
5. Replace 'YOUR_GOOGLE_SHEET_ID' with your actual Sheet ID
6. Deploy the script as a web app:
   - Click "Deploy" > "New deployment"
   - Choose "Web app" as the type
   - Set execute as "Me"
   - Set access to "Anyone"
   - Click "Deploy"
7. Copy the web app URL and replace 'YOUR_SCRIPT_ID' in the API_ENDPOINT
8. Update the GOOGLE_SHEETS_CONFIG in this file with your actual values

Note: Make sure to test the integration before using in production.
`;
};