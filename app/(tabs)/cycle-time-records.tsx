import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Timer } from 'lucide-react-native';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { formatForGoogleSheets } from '@/constants/timezone';

export default function CycleTimeRecordsScreen() {
  const { cycleTimeRecords, inspector } = useProductionStore();

  const handleAddRecord = () => {
    if (!inspector) {
      router.push('/');
      return;
    }
    router.push('/cycle-time-form');
  };

  const sortedRecords = [...cycleTimeRecords].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Tiempos de Ciclo',
          headerRight: () => (
            <TouchableOpacity onPress={handleAddRecord} style={styles.addButton}>
              <Plus size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!inspector && (
          <Card style={styles.warningCard}>
            <Text style={styles.warningText}>
              Debe iniciar sesión como inspector para registrar tiempos de ciclo
            </Text>
            <Button
              title="Ir a Inicio"
              onPress={() => router.push('/')}
              style={styles.warningButton}
            />
          </Card>
        )}

        {inspector && sortedRecords.length === 0 && (
          <Card style={styles.emptyCard}>
            <Timer size={48} color={Colors.light.textSecondary} />
            <Text style={styles.emptyTitle}>No hay registros</Text>
            <Text style={styles.emptyText}>
              Comienza a registrar los tiempos de ciclo de los recursos monitoreados
            </Text>
            <Button
              title="Agregar Registro"
              onPress={handleAddRecord}
              style={styles.emptyButton}
            />
          </Card>
        )}

        {sortedRecords.map((record) => (
          <Card key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <View style={styles.recordHeaderLeft}>
                <Timer size={20} color={Colors.light.primary} />
                <Text style={styles.recordTitle}>{record.productName}</Text>
              </View>
              <Text style={styles.recordTime}>{formatForGoogleSheets(record.timestamp)}</Text>
            </View>

            <View style={styles.recordBody}>
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Recurso Monitoreado:</Text>
                <Text style={styles.recordValue}>{record.monitoredResource}</Text>
              </View>

              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Tiempo de Ciclo:</Text>
                <Text style={styles.recordValue}>{record.cycleTime} segundos</Text>
              </View>

              {record.observations && (
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Observaciones:</Text>
                  <Text style={styles.recordValue}>{record.observations}</Text>
                </View>
              )}

              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Inspector:</Text>
                <Text style={styles.recordValue}>{record.inspector}</Text>
              </View>
            </View>
          </Card>
        ))}
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
  addButton: {
    marginRight: 8,
    padding: 8,
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  warningText: {
    fontSize: 16,
    color: '#92400e',
    marginBottom: 16,
    textAlign: 'center',
  },
  warningButton: {
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  recordCard: {
    marginBottom: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  recordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginLeft: 8,
    flex: 1,
  },
  recordTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  recordBody: {
    gap: 12,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
    flex: 1,
  },
  recordValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600' as const,
    flex: 2,
    textAlign: 'right',
  },
});
