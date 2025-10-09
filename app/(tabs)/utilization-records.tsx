import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useProductionStore } from '@/store/production-store';
import { Card } from '@/components/ui/Card';
import { UtilizationData } from '@/types/production';
import { PRODUCT_STATES, PRODUCT_CONFIGS, PACKAGING_TYPES } from '@/constants/production';

export default function UtilizationRecordsScreen() {
  const { utilizationRecords } = useProductionStore();



  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return '#166534'; // Green
    if (percentage >= 60) return '#ca8a04'; // Yellow
    return '#dc2626'; // Red
  };

  const renderRecord = ({ item }: { item: UtilizationData }) => {
    const utilizationColor = getUtilizationColor(item.utilizationPercentage);
    
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
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estado:</Text>
            <Text style={styles.detailValue}>
              {PRODUCT_STATES.find(s => s.key === item.productState)?.label || item.productState}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Configuración:</Text>
            <Text style={styles.detailValue}>
              {PRODUCT_CONFIGS.find(c => c.key === item.productConfig)?.label || item.productConfig}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Empaque:</Text>
            <Text style={styles.detailValue}>
              {PACKAGING_TYPES.find(t => t.key === item.packagingType)?.label || item.packagingType}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Peso Individual:</Text>
            <Text style={styles.detailValue}>{item.hasIndividualWeightLabel ? 'Sí' : 'No'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Código:</Text>
            <Text style={styles.detailValue}>{item.productCode}</Text>
          </View>
          {item.packaging && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo de Empaque:</Text>
              <Text style={styles.detailValue}>{item.packaging}</Text>
            </View>
          )}
        </View>

        <View style={styles.utilizationSection}>
          <Text style={styles.utilizationTitle}>Medición de Utilización</Text>
          
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Tiempo Disponible:</Text>
            <Text style={styles.timeValue}>{item.availableTime} seg</Text>
          </View>
          
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Tiempo Productivo:</Text>
            <Text style={styles.timeValue}>{item.productiveTime} seg</Text>
          </View>
          
          <View style={styles.utilizationResult}>
            <Text style={styles.utilizationResultLabel}>Utilización:</Text>
            <Text style={[styles.utilizationResultValue, { color: utilizationColor }]}>
              {item.utilizationPercentage.toFixed(1)}%
            </Text>
          </View>

          {item.observations && (
            <View style={styles.observationsSection}>
              <Text style={styles.observationsLabel}>Observaciones:</Text>
              <Text style={styles.observationsText}>{item.observations}</Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registros de Utilización</Text>
        <Text style={styles.subtitle}>
          {utilizationRecords.length} registro{utilizationRecords.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {utilizationRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No hay registros</Text>
          <Text style={styles.emptyDescription}>
            Los registros de utilización aparecerán aquí una vez que comience a capturar datos de eficiencia.
          </Text>
        </View>
      ) : (
        <FlatList
          data={utilizationRecords.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())}
          renderItem={renderRecord}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/utilization-form')}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
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
  utilizationSection: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
  },
  utilizationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#0c4a6e',
  },
  timeValue: {
    fontSize: 14,
    color: '#0c4a6e',
    fontWeight: '500',
  },
  utilizationResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#bae6fd',
  },
  utilizationResultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
  },
  utilizationResultValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  observationsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#bae6fd',
  },
  observationsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  observationsText: {
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 18,
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
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});