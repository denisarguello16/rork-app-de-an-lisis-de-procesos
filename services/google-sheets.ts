import { CapacityData, RejectionData, SetupTimeData, CycleTimeData, Window5minData, MatanzaWindow5minData } from '@/types/production';
import { formatForGoogleSheets } from '@/constants/timezone';

const GOOGLE_SHEETS_CONFIG = {
  API_ENDPOINT: 'https://script.google.com/macros/s/AKfycbyaJIBpiRoGPrv_l1k7nJAnTsNIL-ArMn8hIzQunBDtSxB1_O-YBIT-2Vm4weD-6X3E/exec',
};

export const isGoogleSheetsConfigured = (): boolean => {
  return GOOGLE_SHEETS_CONFIG.API_ENDPOINT.includes('AKfycb');
};

interface GoogleSheetsResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const sendToGoogleSheets = async (payload: object): Promise<GoogleSheetsResponse> => {
  try {
    console.log('📤 Enviando datos a Google Sheets:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(GOOGLE_SHEETS_CONFIG.API_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload),
    });

    console.log('✅ Datos enviados a Google Sheets (response type:', response.type, ')');
    
    return {
      success: true,
      message: 'Datos enviados a Google Sheets'
    };
  } catch (error) {
    console.error('❌ Error enviando a Google Sheets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

export const testGoogleSheetsConnection = async (): Promise<GoogleSheetsResponse> => {
  return sendToGoogleSheets({ type: 'test', data: { timestamp: new Date().toISOString() } });
};

export const diagnoseGoogleSheetsSetup = async (): Promise<GoogleSheetsResponse & { details?: string }> => {
  const result = await testGoogleSheetsConnection();
  return { ...result, details: 'Conexión verificada' };
};

export const saveCapacityDataToSheets = async (data: CapacityData): Promise<GoogleSheetsResponse> => {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets no configurado' };
  }

  return sendToGoogleSheets({
    type: 'capacity',
    data: {
      id: data.id,
      inspector: data.inspector,
      timestamp: formatForGoogleSheets(data.timestamp),
      resourceType: data.resourceType,
      resourceName: data.resourceName,
      productName: data.productName,
      productCode: data.productCode || '',
      line: data.line || '',
      stage: data.stage || '',
      packageSize: data.packageSize,
      peopleCount: data.peopleCount,
      piecesProduced: data.piecesProduced,
      defectivePieces: data.defectivePieces,
      piecesPerMinute: data.piecesPerMinute
    }
  });
};

export const saveRejectionDataToSheets = async (data: RejectionData): Promise<GoogleSheetsResponse> => {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets no configurado' };
  }

  return sendToGoogleSheets({
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
  });
};

export const saveSetupTimeDataToSheets = async (data: SetupTimeData): Promise<GoogleSheetsResponse> => {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets no configurado' };
  }

  return sendToGoogleSheets({
    type: 'setup',
    data: {
      id: data.id,
      inspector: data.inspector,
      timestamp: formatForGoogleSheets(data.timestamp),
      resourceName: data.resourceName,
      eventType: data.eventType,
      eventTime: data.eventTime,
      description: data.description || ''
    }
  });
};

export const saveCycleTimeDataToSheets = async (data: CycleTimeData): Promise<GoogleSheetsResponse> => {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets no configurado' };
  }

  return sendToGoogleSheets({
    type: 'cycle-time',
    data: {
      id: data.id,
      inspector: data.inspector,
      timestamp: formatForGoogleSheets(data.timestamp),
      productName: data.productName,
      packagingMachine: data.packagingMachine,
      cycleTime: data.cycleTime,
      observations: data.observations || ''
    }
  });
};

export const saveWindow5minDataToSheets = async (data: Window5minData): Promise<GoogleSheetsResponse> => {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets no configurado' };
  }

  return sendToGoogleSheets({
    type: 'productivity',
    data: {
      id: data.id,
      inspector: data.inspector,
      timestamp: formatForGoogleSheets(data.timestamp),
      stage: data.stage,
      productFamily: data.productFamily,
      outputUnit: data.outputUnit,
      output: data.output,
      runPercentage: data.runPercentage || 0,
      starvedPercentage: data.starvedPercentage || 0,
      blockedPercentage: data.blockedPercentage || 0,
      setupPercentage: data.setupPercentage || 0,
      ajustePercentage: data.ajustePercentage || 0,
      sanitPercentage: data.sanitPercentage || 0,
      fallaPercentage: data.fallaPercentage || 0,
      logisticaPercentage: data.logisticaPercentage || 0,
      otrosPercentage: data.otrosPercentage || 0,
      utilizationPercentage: data.utilizationPercentage,
      capacityPerHour: data.capacityPerHour
    }
  });
};

export const saveMatanzaUtilizationDataToSheets = async (data: MatanzaWindow5minData): Promise<GoogleSheetsResponse> => {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets no configurado' };
  }

  return sendToGoogleSheets({
    type: 'matanza-utilization',
    data: {
      id: data.id,
      inspector: data.inspector,
      timestamp: formatForGoogleSheets(data.timestamp),
      stage: data.stage,
      employeeCode: data.employeeCode,
      output: data.output,
      ctSeconds: data.ctSeconds,
      ssopSeconds: data.ssopSeconds,
      perdidasSeconds: data.perdidasSeconds,
      ctPercentage: data.ctPercentage,
      ssopPercentage: data.ssopPercentage,
      perdidasPercentage: data.perdidasPercentage,
      totalTime: data.totalTime,
      cycleTimePerUnit: data.cycleTimePerUnit
    }
  });
};

export const saveMatanzaProductivityDataToSheets = async (data: MatanzaWindow5minData): Promise<GoogleSheetsResponse> => {
  if (!isGoogleSheetsConfigured()) {
    return { success: false, error: 'Google Sheets no configurado' };
  }

  return sendToGoogleSheets({
    type: 'matanza-productivity',
    data: {
      id: data.id,
      inspector: data.inspector,
      timestamp: formatForGoogleSheets(data.timestamp),
      stage: data.stage,
      employeeCode: data.employeeCode,
      output: data.output,
      ctSeconds: data.ctSeconds,
      ssopSeconds: data.ssopSeconds,
      perdidasSeconds: data.perdidasSeconds,
      ctPercentage: data.ctPercentage,
      ssopPercentage: data.ssopPercentage,
      perdidasPercentage: data.perdidasPercentage,
      totalTime: data.totalTime,
      cycleTimePerUnit: data.cycleTimePerUnit
    }
  });
};
