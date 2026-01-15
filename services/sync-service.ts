import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CapacityData, RejectionData, SetupTimeData, CycleTimeData, Window5minData, MatanzaWindow5minData } from '@/types/production';
import { 
  saveCapacityDataToSheets, 
  saveRejectionDataToSheets, 
  saveSetupTimeDataToSheets,
  saveCycleTimeDataToSheets,
  saveWindow5minDataToSheets,
  saveMatanzaUtilizationDataToSheets,
  saveMatanzaProductivityDataToSheets,
} from './google-sheets';
import { getNicaraguaTime } from '@/constants/timezone';

interface PendingSyncItem {
  id: string;
  type: 'capacity' | 'rejection' | 'setup' | 'cycle-time' | 'productivity' | 'matanza-utilization' | 'matanza-productivity';
  data: CapacityData | RejectionData | SetupTimeData | CycleTimeData | Window5minData | MatanzaWindow5minData;
  timestamp: string;
  attempts: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  lastSyncError: string | null;
}

class SyncService {
  private static instance: SyncService;
  private pendingSyncKey = 'pending-sync-items';
  private syncStatusKey = 'sync-status';
  private maxRetries = 3;
  private syncInProgress = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private getStorage() {
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
          } catch {}
        },
        removeItem: async (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch {}
        }
      };
    }
    return AsyncStorage;
  }

  async addToPendingSync(
    type: PendingSyncItem['type'],
    data: PendingSyncItem['data']
  ): Promise<void> {
    try {
      const storage = this.getStorage();
      const existingItems = await this.getPendingSyncItems();
      
      const newItem: PendingSyncItem = {
        id: data.id,
        type,
        data,
        timestamp: getNicaraguaTime().toISOString(),
        attempts: 0
      };

      const filteredItems = existingItems.filter(item => item.id !== data.id);
      const updatedItems = [...filteredItems, newItem];

      await storage.setItem(this.pendingSyncKey, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error adding item to pending sync:', error);
    }
  }

  async getPendingSyncItems(): Promise<PendingSyncItem[]> {
    try {
      const storage = this.getStorage();
      const stored = await storage.getItem(this.pendingSyncKey);
      if (!stored || typeof stored !== 'string') return [];
      
      const items = JSON.parse(stored) as PendingSyncItem[];
      if (!Array.isArray(items)) return [];
      
      return items.map(item => ({
        ...item,
        data: {
          ...item.data,
          timestamp: new Date(item.data.timestamp)
        }
      }));
    } catch (error) {
      console.error('Error getting pending sync items:', error);
      return [];
    }
  }

  async removeFromPendingSync(id: string): Promise<void> {
    try {
      const storage = this.getStorage();
      const existingItems = await this.getPendingSyncItems();
      const filteredItems = existingItems.filter(item => item.id !== id);
      await storage.setItem(this.pendingSyncKey, JSON.stringify(filteredItems));
    } catch (error) {
      console.error('Error removing item from pending sync:', error);
    }
  }

  async updateSyncStatus(status: Partial<SyncStatus>): Promise<void> {
    try {
      const storage = this.getStorage();
      const currentStatus = await this.getSyncStatus();
      const updatedStatus = { ...currentStatus, ...status };
      await storage.setItem(this.syncStatusKey, JSON.stringify(updatedStatus));
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const storage = this.getStorage();
      const stored = await storage.getItem(this.syncStatusKey);
      if (!stored || typeof stored !== 'string') {
        return {
          isOnline: true,
          isSyncing: false,
          pendingCount: 0,
          lastSyncTime: null,
          lastSyncError: null
        };
      }
      
      const status = JSON.parse(stored) as SyncStatus;
      return {
        ...status,
        lastSyncTime: status.lastSyncTime ? new Date(status.lastSyncTime) : null
      };
    } catch {
      return {
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: null,
        lastSyncError: null
      };
    }
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
      await this.updateSyncStatus({ isOnline: true });
      return true;
    } catch {
      await this.updateSyncStatus({ isOnline: false });
      return false;
    }
  }

  private async syncItem(item: PendingSyncItem): Promise<boolean> {
    try {
      let result;
      switch (item.type) {
        case 'capacity':
          result = await saveCapacityDataToSheets(item.data as CapacityData);
          break;
        case 'rejection':
          result = await saveRejectionDataToSheets(item.data as RejectionData);
          break;
        case 'setup':
          result = await saveSetupTimeDataToSheets(item.data as SetupTimeData);
          break;
        case 'cycle-time':
          result = await saveCycleTimeDataToSheets(item.data as CycleTimeData);
          break;
        case 'productivity':
          result = await saveWindow5minDataToSheets(item.data as Window5minData);
          break;
        case 'matanza-utilization':
          result = await saveMatanzaUtilizationDataToSheets(item.data as MatanzaWindow5minData);
          break;
        case 'matanza-productivity':
          result = await saveMatanzaProductivityDataToSheets(item.data as MatanzaWindow5minData);
          break;
        default:
          return false;
      }

      if (result.success) {
        await this.removeFromPendingSync(item.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error syncing ${item.type} item:`, item.id, error);
      return false;
    }
  }

  async startAutoSync(): Promise<void> {
    this.stopAutoSync();
    
    this.syncPendingItems().catch(() => {});
    
    this.syncInterval = setInterval(async () => {
      try {
        const pendingItems = await this.getPendingSyncItems();
        if (pendingItems.length > 0 && !this.syncInProgress) {
          this.syncPendingItems().catch(() => {});
        }
      } catch {}
    }, 30000);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncPendingItems(): Promise<{ success: boolean; synced: number; failed: number; error?: string }> {
    if (this.syncInProgress) {
      return { success: false, synced: 0, failed: 0, error: 'Sync already in progress' };
    }

    this.syncInProgress = true;
    
    try {
      await this.updateSyncStatus({ isSyncing: true, lastSyncError: null });

      const isOnline = await this.checkConnectivity();
      if (!isOnline) {
        await this.updateSyncStatus({ isSyncing: false, lastSyncError: 'Sin conexión' });
        return { success: false, synced: 0, failed: 0, error: 'Sin conexión' };
      }

      const pendingItems = await this.getPendingSyncItems();

      if (pendingItems.length === 0) {
        await this.updateSyncStatus({ 
          isSyncing: false, 
          pendingCount: 0,
          lastSyncTime: getNicaraguaTime()
        });
        return { success: true, synced: 0, failed: 0 };
      }

      let synced = 0;
      let failed = 0;

      for (const item of pendingItems) {
        if (item.attempts >= this.maxRetries) {
          failed++;
          continue;
        }

        const success = await this.syncItem(item);
        if (success) {
          synced++;
        } else {
          failed++;
          item.attempts++;
          const storage = this.getStorage();
          const allItems = await this.getPendingSyncItems();
          const updatedItems = allItems.map(i => i.id === item.id ? item : i);
          await storage.setItem(this.pendingSyncKey, JSON.stringify(updatedItems));
        }

        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const remainingItems = await this.getPendingSyncItems();
      await this.updateSyncStatus({
        isSyncing: false,
        pendingCount: remainingItems.length,
        lastSyncTime: getNicaraguaTime(),
        lastSyncError: failed > 0 ? `${failed} items fallidos` : null
      });

      return { success: synced > 0 || failed === 0, synced, failed };

    } catch {
      await this.updateSyncStatus({ 
        isSyncing: false, 
        lastSyncError: 'Error de sincronización'
      });
      return { success: false, synced: 0, failed: 0, error: 'Error de sincronización' };
    } finally {
      this.syncInProgress = false;
    }
  }

  async clearPendingSync(): Promise<void> {
    try {
      const storage = this.getStorage();
      await storage.removeItem(this.pendingSyncKey);
      await this.updateSyncStatus({ pendingCount: 0 });
    } catch {
      // Silently ignore
    }
  }

  async getSyncStats(): Promise<{
    pendingCount: number;
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncTime: Date | null;
    lastSyncError: string | null;
  }> {
    const [pendingItems, status] = await Promise.all([
      this.getPendingSyncItems(),
      this.getSyncStatus()
    ]);

    return {
      pendingCount: pendingItems.length,
      isOnline: status.isOnline,
      isSyncing: status.isSyncing,
      lastSyncTime: status.lastSyncTime,
      lastSyncError: status.lastSyncError
    };
  }
}

export const syncService = SyncService.getInstance();
export type { SyncStatus, PendingSyncItem };
