import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CapacityData, UtilizationData, RejectionData, SetupTimeData, CycleTimeData } from '@/types/production';
import { 
  saveCapacityDataToSheets, 
  saveUtilizationDataToSheets, 
  saveRejectionDataToSheets, 
  saveSetupTimeDataToSheets,
  saveCycleTimeDataToSheets,
  testGoogleSheetsConnection
} from './google-sheets';
import { getNicaraguaTime } from '@/constants/timezone';

interface PendingSyncItem {
  id: string;
  type: 'capacity' | 'utilization' | 'rejection' | 'setup' | 'cycle-time';
  data: CapacityData | UtilizationData | RejectionData | SetupTimeData | CycleTimeData;
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
  private syncInterval: NodeJS.Timeout | null = null;

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Get storage implementation based on platform
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
          } catch {
            // Ignore storage errors on web
          }
        },
        removeItem: async (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch {
            // Ignore storage errors on web
          }
        }
      };
    }
    return AsyncStorage;
  }

  // Add item to pending sync queue
  async addToPendingSync(
    type: 'capacity' | 'utilization' | 'rejection' | 'setup' | 'cycle-time',
    data: CapacityData | UtilizationData | RejectionData | SetupTimeData | CycleTimeData
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

      // Remove any existing item with the same ID to avoid duplicates
      const filteredItems = existingItems.filter(item => item.id !== data.id);
      const updatedItems = [...filteredItems, newItem];

      await storage.setItem(this.pendingSyncKey, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error adding item to pending sync:', error);
    }
  }

  // Get all pending sync items
  async getPendingSyncItems(): Promise<PendingSyncItem[]> {
    try {
      const storage = this.getStorage();
      const stored = await storage.getItem(this.pendingSyncKey);
      if (!stored) return [];
      
      if (typeof stored !== 'string') {
        console.error('❌ Pending sync data is not a string:', typeof stored);
        await storage.removeItem(this.pendingSyncKey);
        return [];
      }
      
      let items;
      try {
        items = JSON.parse(stored) as PendingSyncItem[];
      } catch (parseError) {
        console.error('❌ JSON parse error in pending sync:', parseError);
        console.error('❌ Stored data:', stored.substring(0, 100));
        await storage.removeItem(this.pendingSyncKey);
        return [];
      }
      
      if (!Array.isArray(items)) {
        console.error('❌ Pending sync items is not an array');
        await storage.removeItem(this.pendingSyncKey);
        return [];
      }
      
      return items.map(item => ({
        ...item,
        data: {
          ...item.data,
          timestamp: new Date(item.data.timestamp)
        }
      }));
    } catch (error) {
      console.error('Error getting pending sync items:', error);
      try {
        const storage = this.getStorage();
        await storage.removeItem(this.pendingSyncKey);
      } catch {}
      return [];
    }
  }

  // Remove item from pending sync queue
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

  // Update sync status
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

  // Get sync status
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const storage = this.getStorage();
      const stored = await storage.getItem(this.syncStatusKey);
      if (!stored) {
        return {
          isOnline: true,
          isSyncing: false,
          pendingCount: 0,
          lastSyncTime: null,
          lastSyncError: null
        };
      }
      
      if (typeof stored !== 'string') {
        console.error('❌ Sync status data is not a string:', typeof stored);
        await storage.removeItem(this.syncStatusKey);
        return {
          isOnline: true,
          isSyncing: false,
          pendingCount: 0,
          lastSyncTime: null,
          lastSyncError: null
        };
      }
      
      let status;
      try {
        status = JSON.parse(stored) as SyncStatus;
      } catch (parseError) {
        console.error('❌ JSON parse error in sync status:', parseError);
        await storage.removeItem(this.syncStatusKey);
        return {
          isOnline: true,
          isSyncing: false,
          pendingCount: 0,
          lastSyncTime: null,
          lastSyncError: null
        };
      }
      
      return {
        ...status,
        lastSyncTime: status.lastSyncTime ? new Date(status.lastSyncTime) : null
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: null,
        lastSyncError: null
      };
    }
  }

  // Check internet connectivity
  async checkConnectivity(): Promise<boolean> {
    try {
      const result = await Promise.race([
        testGoogleSheetsConnection(),
        new Promise<{ success: boolean }>((_, reject) => 
          setTimeout(() => reject(new Error('Connectivity check timeout')), 5000)
        )
      ]);
      
      const isOnline = result.success;
      await this.updateSyncStatus({ isOnline });
      return isOnline;
    } catch {
      await this.updateSyncStatus({ isOnline: false });
      return false;
    }
  }

  // Sync a single item
  private async syncItem(item: PendingSyncItem): Promise<boolean> {
    try {
      let result;
      switch (item.type) {
        case 'capacity':
          result = await saveCapacityDataToSheets(item.data as CapacityData);
          break;
        case 'utilization':
          result = await saveUtilizationDataToSheets(item.data as UtilizationData);
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
        default:
          throw new Error(`Unknown sync type: ${item.type}`);
      }

      if (result.success) {
        await this.removeFromPendingSync(item.id);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(`❌ Error syncing ${item.type} item:`, item.id, error);
      return false;
    }
  }

  // Start automatic sync when connection is detected
  async startAutoSync(): Promise<void> {
    try {
      // Stop existing interval if any
      this.stopAutoSync();
      
      // Initial sync attempt (non-blocking)
      this.syncPendingItems().catch(error => {
        console.log('⚠️ Initial sync skipped:', error);
      });
      
      // Set up periodic sync every 30 seconds
      this.syncInterval = setInterval(async () => {
        try {
          const pendingItems = await this.getPendingSyncItems();
          if (pendingItems.length > 0) {
            const isOnline = await this.checkConnectivity();
            if (isOnline && !this.syncInProgress) {
              this.syncPendingItems().catch(error => {
                console.log('⚠️ Periodic sync failed:', error);
              });
            }
          }
        } catch (error) {
          console.log('⚠️ Periodic sync check failed:', error);
        }
      }, 30000); // 30 seconds
    } catch (error) {
      console.log('⚠️ Auto-sync setup failed:', error);
    }
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 Auto-sync stopped');
    }
  }

  // Sync all pending items
  async syncPendingItems(): Promise<{ success: boolean; synced: number; failed: number; error?: string }> {
    if (this.syncInProgress) {
      return { success: false, synced: 0, failed: 0, error: 'Sync already in progress' };
    }

    this.syncInProgress = true;
    
    try {
      await this.updateSyncStatus({ isSyncing: true, lastSyncError: null });

      // Check connectivity first
      const isOnline = await this.checkConnectivity();
      if (!isOnline) {
        await this.updateSyncStatus({ isSyncing: false, lastSyncError: 'No internet connection' });
        return { success: false, synced: 0, failed: 0, error: 'No internet connection' };
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

      // Sync items one by one to avoid overwhelming the server
      for (const item of pendingItems) {
        // Skip items that have exceeded max retries
        if (item.attempts >= this.maxRetries) {
          failed++;
          continue;
        }

        const success = await this.syncItem(item);
        if (success) {
          synced++;
        } else {
          failed++;
          // Increment attempt count
          item.attempts++;
          const storage = this.getStorage();
          const allItems = await this.getPendingSyncItems();
          const updatedItems = allItems.map(i => i.id === item.id ? item : i);
          await storage.setItem(this.pendingSyncKey, JSON.stringify(updatedItems));
        }

        // Small delay between syncs to be nice to the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const remainingItems = await this.getPendingSyncItems();
      const finalStatus: Partial<SyncStatus> = {
        isSyncing: false,
        pendingCount: remainingItems.length,
        lastSyncTime: getNicaraguaTime()
      };

      if (failed > 0 && synced === 0) {
        finalStatus.lastSyncError = `Failed to sync ${failed} items`;
      } else if (failed > 0) {
        finalStatus.lastSyncError = `Partially successful: ${synced} synced, ${failed} failed`;
      }

      await this.updateSyncStatus(finalStatus);

      return { success: synced > 0 || failed === 0, synced, failed };

    } catch (error) {
      console.error('❌ Sync process error:', error);
      await this.updateSyncStatus({ 
        isSyncing: false, 
        lastSyncError: error instanceof Error ? error.message : 'Unknown sync error'
      });
      return { 
        success: false, 
        synced: 0, 
        failed: 0, 
        error: error instanceof Error ? error.message : 'Unknown sync error'
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Clear all pending sync items (use with caution)
  async clearPendingSync(): Promise<void> {
    try {
      const storage = this.getStorage();
      await storage.removeItem(this.pendingSyncKey);
      await this.updateSyncStatus({ pendingCount: 0 });
    } catch (error) {
      console.error('Error clearing pending sync:', error);
    }
  }

  // Get sync statistics
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