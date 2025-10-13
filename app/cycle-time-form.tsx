import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { SearchablePicker } from '@/components/ui/SearchablePicker';
import { PRODUCT_NAMES } from '@/constants/product-names';
import { MonitoredResource } from '@/types/production';
import { getNicaraguaTime } from '@/constants/timezone';

const MONITORED_RESOURCES: MonitoredResource[] = [
  'Sierra 1',
  'Sierra 2',
  'Sierra 3',
  'Indicador 30',
  'Indicador 40',
  'Indicador 70',
  'Indicador 80'
];

export default function CycleTimeFormScreen() {
  const {
    inspector,
    addCycleTimeRecord,
  } = useProductionStore();

  const [formData, setFormData] = React.useState({
    productName: '',
    monitoredResource: '',
    cycleTime: '',
    observations: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName) {
      newErrors.productName = 'Debe seleccionar un producto';
    }

    if (!formData.monitoredResource) {
      newErrors.monitoredResource = 'Debe seleccionar un recurso monitoreado';
    }

    if (!formData.cycleTime.trim()) {
      newErrors.cycleTime = 'El tiempo de ciclo es obligatorio';
    } else {
      const time = parseFloat(formData.cycleTime);
      if (isNaN(time) || time <= 0) {
        newErrors.cycleTime = 'Debe ser un número positivo (segundos)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const record = {
      inspector: inspector!.name,
      timestamp: getNicaraguaTime(),
      productName: formData.productName,
      monitoredResource: formData.monitoredResource as MonitoredResource,
      cycleTime: parseFloat(formData.cycleTime),
      observations: formData.observations.trim() || undefined,
    };

    await addCycleTimeRecord(record);

    setFormData({
      productName: '',
      monitoredResource: '',
      cycleTime: '',
      observations: '',
    });
    setErrors({});

    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Registro de Tiempo de Ciclo',
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.sectionTitle}>Información del Monitoreo</Text>
          
          <SearchablePicker
            label="Nombre del Producto"
            value={formData.productName}
            options={PRODUCT_NAMES.map(name => ({ key: name, label: name }))}
            onSelect={(value) => setFormData(prev => ({ ...prev, productName: value }))}
            required
            error={errors.productName}
            placeholder="Buscar producto..."
          />

          <Picker
            label="Recurso Monitoreado"
            value={formData.monitoredResource}
            options={MONITORED_RESOURCES.map(resource => ({ key: resource, label: resource }))}
            onSelect={(value) => setFormData(prev => ({ ...prev, monitoredResource: value }))}
            required
            error={errors.monitoredResource}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Datos de Tiempo</Text>
          
          <Input
            label="Tiempo de Ciclo (segundos)"
            value={formData.cycleTime}
            onChangeText={(value) => setFormData(prev => ({ ...prev, cycleTime: value }))}
            placeholder="Ej: 12.5"
            keyboardType="decimal-pad"
            required
            error={errors.cycleTime}
          />

          <Input
            label="Observaciones (opcional)"
            value={formData.observations}
            onChangeText={(value) => setFormData(prev => ({ ...prev, observations: value }))}
            placeholder="Detalles adicionales del monitoreo..."
            multiline
            numberOfLines={3}
          />

          <Button
            title="Guardar Registro"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </Card>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 16,
  },
});
