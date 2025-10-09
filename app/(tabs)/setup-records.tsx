import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useProductionStore } from '@/store/production-store';
import { Card } from '@/components/ui/Card';
import { SetupTimeData } from '@/types/production';
import { EVENT_TYPES } from '@/constants/production';
import Colors from '@/constants/colors';

export default function SetupRecordsScreen() {
  const { setupTimeRecords } = useProductionStore();

  const getEventTypeLabel = (type: string) => {
    return EVENT_TYPES.find(t => t.key === type)?.label || type;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const getTotalEventTime = () => {
    return setupTimeRecords.reduce((total, record) => total + record.eventTime, 0);
  };

  const getAverageEventTime = () => {
    if (setupTimeRecords.length === 0) return 0;
    return Math.round(getTotalEventTime() / setupTimeRecords.length);
  };

  const renderSetupRecord = ({ item }: { item: SetupTimeData }) => (
    <Card style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordTitle}>{item.resourceName}</Text>
        <Text style={styles.recordTime}>{formatDuration(item.eventTime)}</Text>
      </View>
      
      <View style={styles.recordDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tipo:</Text>
          <Text style={styles.detailValue}>{getEventTypeLabel(item.eventType)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Inspector:</Text>
          <Text style={styles.detailValue}>{item.inspector}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha:</Text>
          <Text style={styles.detailValue}>
            {item.timestamp.toLocaleDateString('es-MX')} {item.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {item.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.detailLabel}>Descripción:</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Registros de Tiempo de Setup y Paros</Text>
          <Text style={styles.subtitle}>
            Control de tiempos no productivos por eventos y paros
          </Text>
        </View>

        {setupTimeRecords.length > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{setupTimeRecords.length}</Text>
                <Text style={styles.summaryLabel}>Registros</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{formatDuration(getTotalEventTime())}</Text>
                <Text style={styles.summaryLabel}>Tiempo Total</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{formatDuration(getAverageEventTime())}</Text>
                <Text style={styles.summaryLabel}>Promedio</Text>
              </View>
            </View>
          </Card>
        )}

        {setupTimeRecords.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay registros de eventos</Text>
            <Text style={styles.emptyText}>
              Los registros de tiempo de setup y paros aparecerán aquí una vez que comiences a registrar datos.
            </Text>
          </Card>
        ) : (
          <FlatList
            data={setupTimeRecords.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())}
            renderItem={renderSetupRecord}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  summaryCard: {
    marginBottom: 24,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  recordCard: {
    marginBottom: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  recordTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  recordDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
    lineHeight: 20,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
});