import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { XCircle, Calendar, User, Package, AlertTriangle, BarChart3 } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { useProductionStore } from '@/store/production-store';
import { Colors } from '@/constants/colors';

interface RejectionSummary {
  totalRejections: number;
  rejectionsByLine: Record<string, number>;
  rejectionsByProduct: Record<string, number>;
  rejectionsByCause: Record<string, number>;
  rejectionsByPackageSize: Record<string, number>;
  recentRejections: any[];
}

export default function RejectionSummaryScreen() {
  const { rejectionRecords } = useProductionStore();

  const summary: RejectionSummary = useMemo(() => {
    const totalRejections = rejectionRecords.reduce((sum, record) => sum + record.quantity, 0);
    
    const rejectionsByLine: Record<string, number> = {};
    const rejectionsByProduct: Record<string, number> = {};
    const rejectionsByCause: Record<string, number> = {};
    const rejectionsByPackageSize: Record<string, number> = {};
    
    rejectionRecords.forEach(record => {
      // By line
      rejectionsByLine[record.line] = (rejectionsByLine[record.line] || 0) + record.quantity;
      
      // By product
      rejectionsByProduct[record.productName] = (rejectionsByProduct[record.productName] || 0) + record.quantity;
      
      // By cause
      rejectionsByCause[record.rejectionCause] = (rejectionsByCause[record.rejectionCause] || 0) + record.quantity;
      
      // By package size
      rejectionsByPackageSize[record.packageSize] = (rejectionsByPackageSize[record.packageSize] || 0) + record.quantity;
    });
    
    const recentRejections = rejectionRecords
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
    
    return {
      totalRejections,
      rejectionsByLine,
      rejectionsByProduct,
      rejectionsByCause,
      rejectionsByPackageSize,
      recentRejections,
    };
  }, [rejectionRecords]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLineName = (line: string) => {
    return line;
  };

  const getTopItems = (data: Record<string, number>, limit: number = 5) => {
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Resumen de Rechazos',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <BarChart3 size={28} color={Colors.light.primary} />
            <Text style={styles.title}>Resumen de Productos Rechazados</Text>
          </View>
        </View>

        {/* Total Rejections Card */}
        <Card style={styles.totalCard}>
          <View style={styles.totalHeader}>
            <AlertTriangle size={32} color="#ef4444" />
            <View style={styles.totalInfo}>
              <Text style={styles.totalNumber}>{summary.totalRejections}</Text>
              <Text style={styles.totalLabel}>Total de Piezas Rechazadas</Text>
            </View>
          </View>
        </Card>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          {/* Rejections by Line */}
          <Card style={styles.statCard}>
            <Text style={styles.statTitle}>Por Línea de Producción</Text>
            {getTopItems(summary.rejectionsByLine, 3).map(([line, count]) => (
              <View key={line} style={styles.statItem}>
                <Text style={styles.statLabel}>{formatLineName(line)}</Text>
                <Text style={styles.statValue}>{count}</Text>
              </View>
            ))}
            {Object.keys(summary.rejectionsByLine).length === 0 && (
              <Text style={styles.noDataText}>Sin datos</Text>
            )}
          </Card>

          {/* Rejections by Cause */}
          <Card style={styles.statCard}>
            <Text style={styles.statTitle}>Por Causa de Rechazo</Text>
            {getTopItems(summary.rejectionsByCause, 3).map(([cause, count]) => (
              <View key={cause} style={styles.statItem}>
                <Text style={styles.statLabel} numberOfLines={2}>{cause}</Text>
                <Text style={styles.statValue}>{count}</Text>
              </View>
            ))}
            {Object.keys(summary.rejectionsByCause).length === 0 && (
              <Text style={styles.noDataText}>Sin datos</Text>
            )}
          </Card>
        </View>

        <View style={styles.statsGrid}>
          {/* Rejections by Product */}
          <Card style={styles.statCard}>
            <Text style={styles.statTitle}>Por Producto</Text>
            {getTopItems(summary.rejectionsByProduct, 3).map(([product, count]) => (
              <View key={product} style={styles.statItem}>
                <Text style={styles.statLabel} numberOfLines={2}>{product}</Text>
                <Text style={styles.statValue}>{count}</Text>
              </View>
            ))}
            {Object.keys(summary.rejectionsByProduct).length === 0 && (
              <Text style={styles.noDataText}>Sin datos</Text>
            )}
          </Card>

          {/* Rejections by Package Size */}
          <Card style={styles.statCard}>
            <Text style={styles.statTitle}>Por Size del Empaque</Text>
            {getTopItems(summary.rejectionsByPackageSize, 3).map(([size, count]) => (
              <View key={size} style={styles.statItem}>
                <Text style={styles.statLabel}>{size}</Text>
                <Text style={styles.statValue}>{count}</Text>
              </View>
            ))}
            {Object.keys(summary.rejectionsByPackageSize).length === 0 && (
              <Text style={styles.noDataText}>Sin datos</Text>
            )}
          </Card>
        </View>

        {/* Recent Rejections */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Registros Recientes</Text>
          
          {summary.recentRejections.length === 0 ? (
            <Card style={styles.emptyCard}>
              <XCircle size={48} color={Colors.light.tabIconDefault} />
              <Text style={styles.emptyText}>No hay registros de rechazos</Text>
              <Text style={styles.emptySubtext}>
                Los registros aparecerán aquí una vez que comience a registrar rechazos
              </Text>
            </Card>
          ) : (
            <View>
              {summary.recentRejections.map((record) => (
                <Card key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordLine}>{formatLineName(record.line)}</Text>
                      <View style={styles.recordMeta}>
                        <User size={14} color={Colors.light.tabIconDefault} />
                        <Text style={styles.recordMetaText}>{record.inspector}</Text>
                      </View>
                    </View>
                    <View style={styles.recordStats}>
                      <Text style={styles.recordQuantity}>{record.quantity}</Text>
                      <Text style={styles.recordQuantityLabel}>piezas</Text>
                    </View>
                  </View>
                  
                  <View style={styles.recordDetails}>
                    <View style={styles.recordDetail}>
                      <Package size={16} color={Colors.light.tabIconDefault} />
                      <Text style={styles.recordDetailText}>Producto: {record.productName}</Text>
                    </View>
                    <View style={styles.recordDetail}>
                      <Package size={16} color={Colors.light.tabIconDefault} />
                      <Text style={styles.recordDetailText}>Size del Empaque: {record.packageSize}</Text>
                    </View>
                    <View style={styles.recordDetail}>
                      <Package size={16} color={Colors.light.tabIconDefault} />
                      <Text style={styles.recordDetailText}>Causa: {record.rejectionCause}</Text>
                    </View>
                    <View style={styles.recordDetail}>
                      <Calendar size={16} color={Colors.light.tabIconDefault} />
                      <Text style={styles.recordDetailText}>{formatDate(record.timestamp)}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    flex: 1,
  },
  totalCard: {
    marginBottom: 20,
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
  },
  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalInfo: {
    flex: 1,
  },
  totalNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  totalLabel: {
    fontSize: 16,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minHeight: 120,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    flex: 1,
    marginRight: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  noDataText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  recentSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: 20,
  },
  recordCard: {
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordLine: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordMetaText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  recordStats: {
    alignItems: 'flex-end',
  },
  recordQuantity: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  recordQuantityLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  recordDetails: {
    gap: 8,
  },
  recordDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordDetailText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
});