import { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { ProductionStore, Inspector, CapacityData, RejectionData, SetupTimeData, CycleTimeData, Window5minData } from '@/types/production';
import { PRODUCT_CATALOG } from '@/constants/production';
import { saveCapacityDataToSheets, saveRejectionDataToSheets, saveSetupTimeDataToSheets, saveCycleTimeDataToSheets } from '@/services/google-sheets';
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
  productCatalog: PRODUCT_CATALOG,
};

export const [ProductionProvider, useProductionStore] = createContextHook(() => {
  const [inspector, setInspectorState] = useState<Inspector | null>(initialState.inspector);
  const [selectedModule, setSelectedModule] = useState<'capacity' | 'rejection' | 'setup' | 'utilization-5min' | null>(initialState.selectedModule);
  const [capacityRecords, setCapacityRecords] = useState<CapacityData[]>(initialState.capacityRecords);

  const [rejectionRecords, setRejectionRecords] = useState<RejectionData[]>(initialState.rejectionRecords);
  const [setupTimeRecords, setSetupTimeRecords] = useState<SetupTimeData[]>(initialState.setupTimeRecords);
  const [cycleTimeRecords, setCycleTimeRecords] = useState<CycleTimeData[]>(initialState.cycleTimeRecords);
  const [window5minRecords, setWindow5minRecords] = useState<Window5minData[]>(initialState.window5minRecords);
  const [productCatalog] = useState(PRODUCT_CATALOG);

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

  const saveToStorage = useCallback(async () => {
    try {
      const storage = getStorage();
      const dataToSave = {
        inspector,
        capacityRecords,
        rejectionRecords,
        setupTimeRecords,
        cycleTimeRecords,
        window5minRecords,
        lastSaved: getNicaraguaTime().toISOString(),
      };
      await storage.setItem('production-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('❌ Error saving to storage:', error);
    }
  }, [inspector, capacityRecords, rejectionRecords, setupTimeRecords, cycleTimeRecords, window5minRecords, getStorage]);

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
    saveToStorage();
  }, [saveToStorage]);

  const addCapacityRecord = useCallback(async (record: Omit<CapacityData, 'id'>) => {
    const newRecord: CapacityData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    // Save to local state first (always succeeds)
    setCapacityRecords(prev => [...prev, newRecord]);
    await saveToStorage();
    
    // Try to save to Google Sheets immediately if online
    try {
      const result = await saveCapacityDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('capacity', newRecord);
      }
    } catch (error) {
      await syncService.addToPendingSync('capacity', newRecord);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, [saveToStorage]);



  const addRejectionRecord = useCallback(async (record: Omit<RejectionData, 'id'>) => {
    const newRecord: RejectionData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    // Save to local state first (always succeeds)
    setRejectionRecords(prev => [...prev, newRecord]);
    await saveToStorage();
    
    // Try to save to Google Sheets immediately if online
    try {
      const result = await saveRejectionDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('rejection', newRecord);
      }
    } catch (error) {
      await syncService.addToPendingSync('rejection', newRecord);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, [saveToStorage]);

  const addSetupTimeRecord = useCallback(async (record: Omit<SetupTimeData, 'id'>) => {
    const newRecord: SetupTimeData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    // Save to local state first (always succeeds)
    setSetupTimeRecords(prev => [...prev, newRecord]);
    await saveToStorage();
    
    // Try to save to Google Sheets immediately if online
    try {
      const result = await saveSetupTimeDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('setup', newRecord);
      }
    } catch (error) {
      await syncService.addToPendingSync('setup', newRecord);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, [saveToStorage]);

  const addCycleTimeRecord = useCallback(async (record: Omit<CycleTimeData, 'id'>) => {
    const newRecord: CycleTimeData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setCycleTimeRecords(prev => [...prev, newRecord]);
    await saveToStorage();
    
    try {
      const result = await saveCycleTimeDataToSheets(newRecord);
      if (!result.success) {
        await syncService.addToPendingSync('cycle-time', newRecord);
      }
    } catch (error) {
      await syncService.addToPendingSync('cycle-time', newRecord);
    }
    
    return { success: true, message: 'Datos guardados localmente. Se sincronizarán automáticamente cuando haya conexión.' };
  }, [saveToStorage]);

  const addWindow5minRecord = useCallback(async (record: Omit<Window5minData, 'id'>) => {
    const newRecord: Window5minData = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setWindow5minRecords(prev => [...prev, newRecord]);
    await saveToStorage();
    
    return { success: true, message: 'Ventana de 5 minutos guardada localmente.' };
  }, [saveToStorage]);

  const getProductByCode = useCallback((code: string) => {
    const product = productCatalog.find(p => p.code === code);
    return product ? { code: product.code, name: product.name } : null;
  }, [productCatalog]);

  const clearSession = useCallback(() => {
    setSelectedModule(null);
  }, []);

  const loadFromStorage = useCallback(async () => {
    try {
      const storage = getStorage();
      const stored = await storage.getItem('production-data');
      if (!stored) {
        console.log('No stored data found');
        return;
      }
      
      if (typeof stored !== 'string') {
        console.error('❌ Stored data is not a string:', typeof stored);
        await storage.removeItem('production-data');
        return;
      }
      
      let data;
      try {
        data = JSON.parse(stored);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Stored data:', stored.substring(0, 100));
        await storage.removeItem('production-data');
        return;
      }
      
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

  return useMemo(() => ({
    inspector,
    selectedModule,
    capacityRecords,
    rejectionRecords,
    setupTimeRecords,
    cycleTimeRecords,
    window5minRecords,
    productCatalog,
    setInspector,
    setSelectedModule,
    addCapacityRecord,
    addRejectionRecord,
    addSetupTimeRecord,
    addCycleTimeRecord,
    addWindow5minRecord,
    getProductByCode,
    clearSession,
    loadFromStorage,
    saveToStorage,
  }), [
    inspector,
    selectedModule,
    capacityRecords,
    rejectionRecords,
    setupTimeRecords,
    cycleTimeRecords,
    window5minRecords,
    productCatalog,
    setInspector,
    setSelectedModule,
    addCapacityRecord,
    addRejectionRecord,
    addSetupTimeRecord,
    addCycleTimeRecord,
    addWindow5minRecord,
    getProductByCode,
    clearSession,
    loadFromStorage,
    saveToStorage,
  ]);
});
