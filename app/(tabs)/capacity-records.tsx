import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useProductionStore } from '@/store/production-store';
import { Card } from '@/components/ui/Card';
import { CapacityData } from '@/types/production';

export default function CapacityRecordsScreen() {
  const { capacityRecords } = useProductionStore();

  const renderRecord = ({ item }: { item: CapacityData }) => (
    <Card style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.productCode}>{item.productCode}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleString('es-MX')}
        </Text>
      </View>
      
      <Text style={styles.productName}>{item.productName}</Text>
      
      <View style={styles.recordDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Inspector:</Text>
          <Text style={styles.detailValue}>{item.inspector}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Línea:</Text>
          <Text style={styles.detailValue}>{item.line}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Size del Empaque:</Text>
          <Text style={styles.detailValue}>{item.packageSize}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Etapa:</Text>
          <Text style={styles.detailValue}>{item.stage}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Personas:</Text>
          <Text style={styles.detailValue}>{item.peopleCount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Piezas (5 min):</Text>
          <Text style={styles.detailValue}>{item.piecesProduced}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Piezas Defectuosas:</Text>
          <Text style={styles.detailValue}>{item.defectivePieces}</Text>
        </View>
      </View>

      <View style={styles.calculations}>
        <View style={styles.calculationItem}>
          <Text style={styles.calculationLabel}>Piezas/min</Text>
          <Text style={styles.calculationValue}>
            {item.piecesPerMinute.toFixed(2)}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registros de Capacidad</Text>
        <Text style={styles.subtitle}>
          {capacityRecords.length} registro{capacityRecords.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {capacityRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No hay registros</Text>
          <Text style={styles.emptyDescription}>
            Los registros de capacidad aparecerán aquí una vez que comience a capturar datos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={capacityRecords.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())}
          renderItem={renderRecord}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  recordCard: {
    marginBottom: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
  },
  productName: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    fontWeight: '500',
  },
  recordDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  calculations: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
  },
  calculationItem: {
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  calculationValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});