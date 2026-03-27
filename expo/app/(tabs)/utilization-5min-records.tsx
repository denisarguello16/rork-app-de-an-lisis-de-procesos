import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { Clock, BarChart3 } from 'lucide-react-native';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { Window5minData } from '@/types/production';

export default function Utilization5minRecordsScreen() {
  const { window5minRecords } = useProductionStore();

  const sortedRecords = [...window5minRecords].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  const handleAddRecord = () => {
    router.push('/module-selection');
  };

  const renderRecord = ({ item }: { item: Window5minData }) => {
    const totalSeconds = item.events.reduce((sum, event) => {
      const duration = (event.endTime ?? 300) - event.startTime;
      return sum + duration;
    }, 0);

    return (
      <Card style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordHeaderLeft}>
            <Text style={styles.recordTitle}>{item.stage}</Text>
            <Text style={styles.recordSubtitle}>{item.productFamily}</Text>
          </View>
          <View style={styles.recordBadge}>
            <Text style={styles.recordBadgeText}>{item.outputUnit}</Text>
          </View>
        </View>

        <View style={styles.recordRow}>
          <View style={styles.recordCol}>
            <View style={styles.iconLabel}>
              <Clock size={16} color={Colors.light.textSecondary} />
              <Text style={styles.recordLabel}>Utilización</Text>
            </View>
            <Text style={styles.recordValue}>{item.utilizationPercentage.toFixed(1)}%</Text>
          </View>
          <View style={styles.recordCol}>
            <View style={styles.iconLabel}>
              <BarChart3 size={16} color={Colors.light.textSecondary} />
              <Text style={styles.recordLabel}>Capacidad/h</Text>
            </View>
            <Text style={styles.recordValue}>
              {item.capacityPerHour.toFixed(0)} {item.outputUnit}/h
            </Text>
          </View>
        </View>

        <View style={styles.recordRow}>
          <View style={styles.recordCol}>
            <Text style={styles.recordLabel}>Output 5 min</Text>
            <Text style={styles.recordValue}>{item.output}</Text>
          </View>
          <View style={styles.recordCol}>
            <Text style={styles.recordLabel}>Tiempo total</Text>
            <Text style={styles.recordValue}>{totalSeconds}s</Text>
          </View>
        </View>

        <View style={styles.recordFooter}>
          <Text style={styles.recordDate}>
            {item.timestamp.toLocaleDateString()} • {item.timestamp.toLocaleTimeString()}
          </Text>
          <Text style={styles.recordInspector}>{item.inspector}</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Estimación de Productividad',
          headerRight: () => (
            <Button
              title="Nueva"
              onPress={handleAddRecord}
              size="small"
              style={styles.addButton}
            />
          ),
        }} 
      />

      {sortedRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={64} color={Colors.light.border} />
          <Text style={styles.emptyTitle}>No hay registros de productividad</Text>
          <Text style={styles.emptyText}>
            Registre su primera ventana de 5 minutos para medir productividad
          </Text>
          <Button
            title="Registrar Primera Medición"
            onPress={handleAddRecord}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <>
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Ventanas</Text>
              <Text style={styles.statValue}>{sortedRecords.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Utilización Prom.</Text>
              <Text style={styles.statValue}>
                {(sortedRecords.reduce((sum, r) => sum + r.utilizationPercentage, 0) / sortedRecords.length).toFixed(1)}%
              </Text>
            </View>
          </View>

          <FlatList
            data={sortedRecords}
            renderItem={renderRecord}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  addButton: {
    marginRight: -8,
  },
  statsBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  listContent: {
    padding: 16,
  },
  recordCard: {
    marginBottom: 12,
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recordHeaderLeft: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  recordSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  recordBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  recordRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  recordCol: {
    flex: 1,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  recordValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  recordFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  recordInspector: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    minWidth: 200,
  },
});
