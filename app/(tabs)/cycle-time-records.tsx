import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useProductionStore } from '@/store/production-store';
import { Card } from '@/components/ui/Card';
import { CycleTimeData } from '@/types/production';
import Colors from '@/constants/colors';

export default function CycleTimeRecordsScreen() {
  const { cycleTimeRecords } = useProductionStore();

  const formatCycleTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(0);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getAverageCycleTime = () => {
    if (cycleTimeRecords.length === 0) return 0;
    const total = cycleTimeRecords.reduce((sum, record) => sum + record.cycleTime, 0);
    return total / cycleTimeRecords.length;
  };

  const getAverageCycleTimeByMachine = (machine: string) => {
    const machineRecords = cycleTimeRecords.filter(r => r.packingMachine === machine);
    if (machineRecords.length === 0) return 0;
    const total = machineRecords.reduce((sum, record) => sum + record.cycleTime, 0);
    return total / machineRecords.length;
  };

  const getMachineStats = () => {
    const machines = [...new Set(cycleTimeRecords.map(r => r.packingMachine))];
    return machines.map(machine => ({
      machine,
      count: cycleTimeRecords.filter(r => r.packingMachine === machine).length,
      average: getAverageCycleTimeByMachine(machine),
    }));
  };

  const renderCycleTimeRecord = ({ item }: { item: CycleTimeData }) => (
    <Card style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordTitle}>{item.productName}</Text>
        <Text style={styles.recordTime}>{formatCycleTime(item.cycleTime)}</Text>
      </View>
      
      <View style={styles.recordDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Máquina:</Text>
          <Text style={styles.detailValue}>{item.packingMachine}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Inspector:</Text>
          <Text style={styles.detailValue}>{item.inspector}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha:</Text>
          <Text style={styles.detailValue}>
            {item.timestamp.toLocaleDateString('es-NI')} {item.timestamp.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {item.observations && (
          <View style={styles.observationsContainer}>
            <Text style={styles.detailLabel}>Observaciones:</Text>
            <Text style={styles.observationsText}>{item.observations}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Registros de Tiempo de Ciclo</Text>
          <Text style={styles.subtitle}>
            Monitoreo de tiempos de ciclo de máquinas empacadoras
          </Text>
        </View>

        {cycleTimeRecords.length > 0 && (
          <>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumen General</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{cycleTimeRecords.length}</Text>
                  <Text style={styles.summaryLabel}>Registros</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatCycleTime(getAverageCycleTime())}</Text>
                  <Text style={styles.summaryLabel}>Promedio</Text>
                </View>
              </View>
            </Card>

            {getMachineStats().length > 0 && (
              <Card style={styles.machineStatsCard}>
                <Text style={styles.summaryTitle}>Estadísticas por Máquina</Text>
                {getMachineStats().map((stat, index) => (
                  <View key={index} style={styles.machineStatRow}>
                    <View style={styles.machineStatInfo}>
                      <Text style={styles.machineStatName}>{stat.machine}</Text>
                      <Text style={styles.machineStatCount}>{stat.count} registros</Text>
                    </View>
                    <Text style={styles.machineStatAverage}>{formatCycleTime(stat.average)}</Text>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}

        {cycleTimeRecords.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay registros de tiempo de ciclo</Text>
            <Text style={styles.emptyText}>
              Los registros de tiempo de ciclo aparecerán aquí una vez que comiences a registrar datos.
            </Text>
          </Card>
        ) : (
          <FlatList
            data={cycleTimeRecords.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())}
            renderItem={renderCycleTimeRecord}
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
    fontWeight: 'bold' as const,
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
    marginBottom: 16,
    backgroundColor: '#dbeafe',
    borderColor: Colors.light.primary,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 16,
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
    fontWeight: 'bold' as const,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  machineStatsCard: {
    marginBottom: 24,
  },
  machineStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  machineStatInfo: {
    flex: 1,
  },
  machineStatName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 4,
  },
  machineStatCount: {
    fontSize: 14,
    color: '#64748b',
  },
  machineStatAverage: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.light.primary,
  },
  recordCard: {
    marginBottom: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1e293b',
    flex: 1,
  },
  recordTime: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.light.primary,
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
    fontWeight: '500' as const,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
  },
  observationsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  observationsText: {
    fontSize: 14,
    color: '#1e293b',
    marginTop: 4,
    lineHeight: 20,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
