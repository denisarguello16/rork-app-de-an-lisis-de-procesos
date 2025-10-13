import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Cloud, CloudOff, RefreshCw, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react-native';
import { syncService } from '@/services/sync-service';
import Colors from '@/constants/colors';

const COLORS = Colors.light;

interface SyncButtonProps {
  onSyncComplete?: (result: { success: boolean; synced: number; failed: number }) => void;
  showButton?: boolean;
  style?: any;
}

interface SyncStatusProps {
  style?: any;
}

export const SyncButton: React.FC<SyncButtonProps> = ({ onSyncComplete, showButton = true, style }) => {
  const [syncStats, setSyncStats] = useState({
    pendingCount: 0,
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null as Date | null,
    lastSyncError: null as string | null
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSyncStats = async () => {
    try {
      const stats = await syncService.getSyncStats();
      setSyncStats(stats);
    } catch (error) {
      console.error('Error loading sync stats:', error);
    }
  };

  useEffect(() => {
    loadSyncStats();
    
    // Refresh stats every 5 seconds for better real-time feedback
    const interval = setInterval(loadSyncStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (syncStats.isSyncing) {
      return;
    }

    setIsRefreshing(true);
    
    try {
      // Check connectivity first with better error handling
      const isOnline = await syncService.checkConnectivity();
      
      if (!isOnline) {
        Alert.alert(
          '📱 Sin Conexión',
          'No hay conexión a internet o Google Sheets no está disponible. Los datos están guardados localmente y se sincronizarán automáticamente cuando se restablezca la conexión.',
          [
            { text: 'OK' },
            { 
              text: 'Reintentar', 
              onPress: async () => {
                setIsRefreshing(true);
                await handleSync();
              }
            }
          ]
        );
        await loadSyncStats();
        return;
      }

      if (syncStats.pendingCount === 0) {
        Alert.alert(
          '✅ Sincronización Completa',
          'Todos los datos están sincronizados con la nube.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await syncService.syncPendingItems();
      
      if (result.success) {
        if (result.synced > 0) {
          Alert.alert(
            '✅ Sincronización Exitosa',
            `Se sincronizaron ${result.synced} registros con la nube.${result.failed > 0 ? ` ${result.failed} registros fallaron y se reintentarán.` : ''}`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            '✅ Sincronización Completa',
            'Todos los datos ya estaban sincronizados.',
            [{ text: 'OK' }]
          );
        }
      } else {
        const errorMessage = result.error?.includes('internet') || result.error?.includes('conexión') 
          ? 'Sin conexión a internet. Los datos se mantendrán guardados localmente.'
          : result.error || 'No se pudieron sincronizar algunos datos. Se mantendrán guardados localmente y se reintentará automáticamente.';
          
        Alert.alert(
          '⚠️ Error de Sincronización',
          errorMessage,
          [
            { text: 'OK' },
            { 
              text: 'Reintentar', 
              onPress: async () => {
                setIsRefreshing(true);
                const retryResult = await syncService.syncPendingItems();
                setIsRefreshing(false);
                await loadSyncStats();
                onSyncComplete?.(retryResult);
              }
            }
          ]
        );
      }

      onSyncComplete?.(result);
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error && error.message.includes('fetch')
        ? 'Sin conexión a internet. Los datos están guardados localmente.'
        : 'Ocurrió un error durante la sincronización. Los datos están guardados localmente.';
        
      Alert.alert(
        '❌ Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsRefreshing(false);
      await loadSyncStats();
    }
  };

  const getStatusIcon = () => {
    if (syncStats.isSyncing || isRefreshing) {
      return <RefreshCw size={20} color={COLORS.primary} style={styles.rotatingIcon} />;
    }
    
    if (!syncStats.isOnline) {
      return <WifiOff size={20} color={COLORS.error} />;
    }
    
    if (syncStats.pendingCount > 0) {
      return <CloudOff size={20} color={COLORS.warning} />;
    }
    
    return <Cloud size={20} color={COLORS.success} />;
  };

  const getStatusText = () => {
    if (syncStats.isSyncing || isRefreshing) {
      return 'Sincronizando...';
    }
    
    if (!syncStats.isOnline) {
      return 'Sin conexión - Datos guardados localmente';
    }
    
    if (syncStats.pendingCount > 0) {
      return `${syncStats.pendingCount} pendiente${syncStats.pendingCount > 1 ? 's' : ''}`;
    }
    
    return 'Sincronizado';
  };

  const getButtonStyle = () => {
    if (syncStats.isSyncing || isRefreshing) {
      return [styles.syncButton, styles.syncing];
    }
    
    if (!syncStats.isOnline) {
      return [styles.syncButton, styles.offline];
    }
    
    if (syncStats.pendingCount > 0) {
      return [styles.syncButton, styles.pending];
    }
    
    return [styles.syncButton, styles.synced];
  };

  const formatLastSyncTime = () => {
    if (!syncStats.lastSyncTime) {
      return 'Nunca';
    }
    
    const now = new Date();
    const diff = now.getTime() - syncStats.lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {
      return 'Hace un momento';
    } else if (minutes < 60) {
      return `Hace ${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `Hace ${hours}h`;
    }
  };

  // Status-only display (no button)
  if (!showButton) {
    return (
      <View style={[styles.statusOnlyContainer, style]}>
        <View style={styles.statusOnlyContent}>
          {getStatusIcon()}
          <Text style={styles.statusOnlyText}>
            {getStatusText()}
          </Text>
        </View>
        
        {syncStats.lastSyncTime && syncStats.isOnline && (
          <Text style={styles.lastSyncSmall}>
            Última sync: {formatLastSyncTime()}
          </Text>
        )}
        
        {!syncStats.isOnline && (
          <Text style={styles.offlineNote}>
            Los datos se sincronizarán automáticamente cuando haya conexión
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handleSync}
        disabled={syncStats.isSyncing || isRefreshing}
        testID="sync-button"
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          {getStatusIcon()}
          <Text style={styles.buttonText}>{getStatusText()}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.statusInfo}>
        <View style={styles.statusRow}>
          {syncStats.isOnline ? (
            <Wifi size={14} color={COLORS.success} />
          ) : (
            <WifiOff size={14} color={COLORS.error} />
          )}
          <Text style={styles.statusText}>
            {syncStats.isOnline ? 'En línea' : 'Sin conexión'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          {syncStats.lastSyncError ? (
            <AlertCircle size={14} color={COLORS.error} />
          ) : (
            <CheckCircle size={14} color={COLORS.success} />
          )}
          <Text style={styles.statusText}>
            Última sync: {formatLastSyncTime()}
          </Text>
        </View>
        
        {syncStats.lastSyncError && (
          <Text style={styles.errorText} numberOfLines={2}>
            {syncStats.lastSyncError}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    margin: 16,
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 48,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  synced: {
    backgroundColor: COLORS.success,
  },
  pending: {
    backgroundColor: COLORS.warning,
  },
  offline: {
    backgroundColor: COLORS.error,
  },
  syncing: {
    backgroundColor: COLORS.primary,
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  statusInfo: {
    paddingTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontStyle: 'italic',
    marginTop: 4,
  },
  rotatingIcon: {
    transform: [{ rotate: '45deg' }],
  },
  statusOnlyContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusOnlyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  statusOnlyText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.text,
    flex: 1,
  },
  lastSyncSmall: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  offlineNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

// Export with different name for status-only display
export function SyncStatus({ style }: SyncStatusProps) {
  return <SyncButton style={style} showButton={false} />;
}