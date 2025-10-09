import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useProductionStore } from '@/store/production-store';
import { Card } from '@/components/ui/Card';
import { WIPData } from '@/types/production';
import { QUEUE_STAGES } from '@/constants/production';

export default function WIPRecordsScreen() {
  const { wipRecords } = useProductionStore();

  const getTotalWIP = (record: WIPData) => {
    return record.queueBeforePortioning +
           record.queueBeforePackaging +
           record.queueBeforeIndividualLabeling +
           record.queueBeforeBoxClosure +
           record.queueBeforeBoxStrapping;
  };

  const renderRecord = ({ item }: { item: WIPData }) => {
    const totalWIP = getTotalWIP(item);
    
    return (
      <Card style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleString('es-MX')}
          </Text>
        </View>
        
        <View style={styles.recordDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Inspector:</Text>
            <Text style={styles.detailValue}>{item.inspector}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Línea:</Text>
            <Text style={styles.detailValue}>{item.line}</Text>
          </View>
        </View>

        <View style={styles.wipSection}>
          <Text style={styles.wipTitle}>Trabajo en Proceso (WIP)</Text>
          
          {QUEUE_STAGES.map((queue) => {
            const value = item[queue.key as keyof WIPData] as number;
            return (
              <View key={queue.key} style={styles.wipRow}>
                <Text style={styles.wipLabel}>{queue.label}:</Text>
                <Text style={styles.wipValue}>{value}</Text>
              </View>
            );
          })}
          
          <View style={styles.totalWIP}>
            <Text style={styles.totalWIPLabel}>Total WIP:</Text>
            <Text style={styles.totalWIPValue}>{totalWIP} unidades</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registros de WIP</Text>
        <Text style={styles.subtitle}>
          {wipRecords.length} registro{wipRecords.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {wipRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No hay registros</Text>
          <Text style={styles.emptyDescription}>
            Los registros de trabajo en proceso (WIP) aparecerán aquí una vez que comience a capturar datos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={wipRecords.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())}
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
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
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
  wipSection: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
  },
  wipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  wipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wipLabel: {
    fontSize: 14,
    color: '#92400e',
  },
  wipValue: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  totalWIP: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fbbf24',
  },
  totalWIPLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  totalWIPValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
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