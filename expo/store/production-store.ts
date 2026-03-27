import { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { ProductionStore, Inspector, CapacityData, RejectionData, SetupTimeData, CycleTimeData, Window5minData, MatanzaWindow5minData, MatanzaProductivityData } from '@/types/production';
import { saveCapacityDataToSheets, saveRejectionDataToSheets, saveSetupTimeDataToSheets, saveCycleTimeDataToSheets, saveWindow5minDataToSheets, saveMatanzaUtilizationDataToSheets, saveMatanzaProductivityDataToSheets } from '@/services/google-sheets';
import { syncService } from '@/services/sync-service';
import { getNicaraguaTime } from '@/constants/timezone';

const initialState: ProductionStore = {
  inspector: null,
  selectedModule: null,
  capacityRecords: [],
  rejectionRecords: [],
  setupTimeRecords: [],
  cycleTimeRecords: [],
  window5minRecords: [],
  matanzaWindow5minRecords: [],
  matanzaProductivityRecords: [],
};

export const [ProductionProvider, useProductionStore] = createContextHook(() => {
  const [inspector, setInspectorState] = useState<Inspector | null>(initialState.inspector);
  const [selectedModule, setSelectedModule] = useState<'capacity' | 'rejection' | 'setup' | 'cycle-time' | 'utilization-5min' | null>(initialState.selectedModule);
  const [capacityRecords, setCapacityRecords] = useState<CapacityData[]>(initialState.capacityRecords);

  const [rejectionRecords, setRejectionRecords] = useState<RejectionData[]>(initialState.rejectionRecords);
  const [setupTimeRecords, setSetupTimeRecords] = useState<SetupTimeData[]>(initialState.setupTimeRecords);
  const [cycleTimeRecords, setCycleTimeRecords] = useState<CycleTimeData[]>(initialState.cycleTimeRecords);
  const [window5minRecords, setWindow5minRecords] = useState<Window5minData[]>(initialState.window5minRecords);
  const [matanzaWindow5minRecords, setMatanzaWindow5minRecords] = useState<MatanzaWindow5minData[]>(initialState.matanzaWindow5minRecords);
  const [matanzaProductivityRecords, setMatanzaProductivityRecords] = useState<MatanzaProductivityData[]>(initialState.matanzaProductivityRecords);

  // Get storage implementation based on platform
  const getStorage = useCallback(() => {
    if (Platform.OS === 'web') {
      return {
        getItem: async (key: string) => {
          try {
            return localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        setItem: async (key: string, value: string) => {
          try {
            localStorage.setItem(key, value);
          } catch {
            console.warn('Failed to save to localStorage');
          }
        },
        removeItem: async (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch {
            console.warn('Failed to remove from localStorage');
          }
        }
      };
    }
    return AsyncStorage;
  }, []);

  const setInspector = useCallback((inspector: Inspector) => {
    if (!inspector || !inspector.name || inspector.name.length > 100) {
      return;
    }
    const sanitizedInspector = {
      ...inspector,
      name: inspector.name.trim(),
    };
    if (!sanitizedInspector.name) {
      return;
    }
    setInspectorState(sanitizedInspector);
  }, []);

  const addCapacityRecord = useCallback(async (record: Omit<CapacityData, 'id'>) => {
    const newRecord: CapacityData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setCapacityRecords(prev => [...prev, newRecord]);
    
    try {
      const result = await saveCapacityDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('capacity', newRecord);
      }
    } catch {
      await syncService.addToPendingSync('capacity', newRecord);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, []);



  const addRejectionRecord = useCallback(async (record: Omit<RejectionData, 'id'>) => {
    const newRecord: RejectionData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setRejectionRecords(prev => [...prev, newRecord]);
    
    try {
      const result = await saveRejectionDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('rejection', newRecord);
      }
    } catch {
      await syncService.addToPendingSync('rejection', newRecord);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, []);

  const addSetupTimeRecord = useCallback(async (record: Omit<SetupTimeData, 'id'>) => {
    const newRecord: SetupTimeData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setSetupTimeRecords(prev => [...prev, newRecord]);
    
    try {
      const result = await saveSetupTimeDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('setup', newRecord);
      }
    } catch {
      await syncService.addToPendingSync('setup', newRecord);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, []);

  const addCycleTimeRecord = useCallback(async (record: Omit<CycleTimeData, 'id'>) => {
    const newRecord: CycleTimeData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setCycleTimeRecords(prev => [...prev, newRecord]);
    
    try {
      const result = await saveCycleTimeDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('cycle-time', newRecord);
      }
    } catch {
      await syncService.addToPendingSync('cycle-time', newRecord);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, []);

  const addWindow5minRecord = useCallback(async (record: Omit<Window5minData, 'id'>) => {
    const newRecord: Window5minData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setWindow5minRecords(prev => [...prev, newRecord]);
    
    try {
      const result = await saveWindow5minDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('productivity', newRecord);
      }
    } catch {
      await syncService.addToPendingSync('productivity', newRecord);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, []);

  const addMatanzaWindow5minRecord = useCallback(async (record: Omit<MatanzaWindow5minData, 'id'>) => {
    const newRecord: MatanzaWindow5minData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setMatanzaWindow5minRecords(prev => [...prev, newRecord]);
    
    try {
      const result = await saveMatanzaUtilizationDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('matanza-utilization', newRecord as any);
      }
    } catch {
      await syncService.addToPendingSync('matanza-utilization', newRecord as any);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, []);

  const addMatanzaProductivityRecord = useCallback(async (record: Omit<MatanzaProductivityData, 'id'>) => {
    const newRecord: MatanzaProductivityData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setMatanzaProductivityRecords(prev => [...prev, newRecord]);
    
    try {
      const result = await saveMatanzaProductivityDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('matanza-productivity', newRecord as any);
      }
    } catch {
      await syncService.addToPendingSync('matanza-productivity', newRecord as any);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, []);

  const clearSession = useCallback(() => {
    setSelectedModule(null);
  }, []);

  const loadFromStorage = useCallback(async () => {
    try {
      const storage = getStorage();
      console.log('🔍 Intentando cargar datos del storage...');
      const stored = await storage.getItem('production-data');
      if (!stored) {
        console.log('⚠️ No stored data found');
        return;
      }
      
      console.log('📦 Datos encontrados, tamaño:', stored.length, 'caracteres');
      
      if (typeof stored !== 'string') {
        console.error('❌ Stored data is not a string:', typeof stored);
        await storage.removeItem('production-data');
        return;
      }
      
      let data;
      try {
        data = JSON.parse(stored);
        console.log('✅ Datos parseados exitosamente');
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Stored data:', stored.substring(0, 100));
        await storage.removeItem('production-data');
        return;
      }
      
      const totalRecords = (data.capacityRecords?.length || 0) + (data.rejectionRecords?.length || 0) + 
                           (data.setupTimeRecords?.length || 0) + (data.cycleTimeRecords?.length || 0) + 
                           (data.window5minRecords?.length || 0) + (data.matanzaWindow5minRecords?.length || 0) + 
                           (data.matanzaProductivityRecords?.length || 0);
      
      console.log('📊 Cargando registros:', {
        inspector: data.inspector?.name,
        totalRegistros: totalRecords,
        capacity: data.capacityRecords?.length || 0,
        rejection: data.rejectionRecords?.length || 0,
        setup: data.setupTimeRecords?.length || 0,
        cycleTime: data.cycleTimeRecords?.length || 0,
        window5min: data.window5minRecords?.length || 0,
        matanzaUtilization: data.matanzaWindow5minRecords?.length || 0,
        matanzaProductivity: data.matanzaProductivityRecords?.length || 0,
        lastSaved: data.lastSaved,
      });
      
      if (data.inspector) {
        setInspectorState({ ...data.inspector, timestamp: new Date(data.inspector.timestamp) });
      }
      if (Array.isArray(data.capacityRecords)) {
        setCapacityRecords(data.capacityRecords.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        })));
      }

      if (Array.isArray(data.rejectionRecords)) {
        setRejectionRecords(data.rejectionRecords.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        })));
      }
      if (Array.isArray(data.setupTimeRecords)) {
        setSetupTimeRecords(data.setupTimeRecords.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        })));
      }
      if (Array.isArray(data.cycleTimeRecords)) {
        setCycleTimeRecords(data.cycleTimeRecords.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        })));
      }
      if (Array.isArray(data.window5minRecords)) {
        setWindow5minRecords(data.window5minRecords.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        })));
      }
      if (Array.isArray(data.matanzaWindow5minRecords)) {
        setMatanzaWindow5minRecords(data.matanzaWindow5minRecords.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        })));
      }
      if (Array.isArray(data.matanzaProductivityRecords)) {
        setMatanzaProductivityRecords(data.matanzaProductivityRecords.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        })));
      }
      
      console.log('✅ Todos los datos cargados exitosamente');
    } catch (error) {
      console.error('❌ Error loading from storage:', error);
      try {
        const storage = getStorage();
        await storage.removeItem('production-data');
        console.log('Cleared corrupted storage data');
      } catch (clearError) {
        console.error('❌ Error clearing storage:', clearError);
      }
    }
  }, [getStorage]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const storage = getStorage();
    const dataToSave = {
      inspector,
      capacityRecords,
      rejectionRecords,
      setupTimeRecords,
      cycleTimeRecords,
      window5minRecords,
      matanzaWindow5minRecords,
      matanzaProductivityRecords,
      lastSaved: getNicaraguaTime().toISOString(),
    };
    
    const totalRecords = capacityRecords.length + rejectionRecords.length + setupTimeRecords.length + 
                         cycleTimeRecords.length + window5minRecords.length + matanzaWindow5minRecords.length + 
                         matanzaProductivityRecords.length;
    
    console.log('💾 Guardando datos:', {
      inspector: inspector?.name,
      totalRegistros: totalRecords,
      capacity: capacityRecords.length,
      rejection: rejectionRecords.length,
      setup: setupTimeRecords.length,
      cycleTime: cycleTimeRecords.length,
      window5min: window5minRecords.length,
      matanzaUtilization: matanzaWindow5minRecords.length,
      matanzaProductivity: matanzaProductivityRecords.length,
    });
    
    storage.setItem('production-data', JSON.stringify(dataToSave))
      .then(() => {
        console.log('✅ Datos guardados exitosamente');
      })
      .catch(error => {
        console.error('❌ Error saving to storage:', error);
      });
  }, [inspector, capacityRecords, rejectionRecords, setupTimeRecords, cycleTimeRecords, window5minRecords, matanzaWindow5minRecords, matanzaProductivityRecords, getStorage]);

  return useMemo(() => ({
    inspector,
    selectedModule,
    capacityRecords,
    rejectionRecords,
    setupTimeRecords,
    cycleTimeRecords,
    window5minRecords,
    matanzaWindow5minRecords,
    matanzaProductivityRecords,
    setInspector,
    setSelectedModule,
    addCapacityRecord,
    addRejectionRecord,
    addSetupTimeRecord,
    addCycleTimeRecord,
    addWindow5minRecord,
    addMatanzaWindow5minRecord,
    addMatanzaProductivityRecord,
    clearSession,
  }), [
    inspector,
    selectedModule,
    capacityRecords,
    rejectionRecords,
    setupTimeRecords,
    cycleTimeRecords,
    window5minRecords,
    matanzaWindow5minRecords,
    matanzaProductivityRecords,
    setInspector,
    setSelectedModule,
    addCapacityRecord,
    addRejectionRecord,
    addSetupTimeRecord,
    addCycleTimeRecord,
    addWindow5minRecord,
    addMatanzaWindow5minRecord,
    addMatanzaProductivityRecord,
    clearSession,
  ]);
});
