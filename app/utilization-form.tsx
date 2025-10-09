import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { SearchablePicker } from '@/components/ui/SearchablePicker';
import { PRODUCT_NAMES } from '@/constants/product-names';
import { getNicaraguaTime } from '@/constants/timezone';
import { RESOURCE_TYPES, getResourcesByType } from '@/constants/resources';

export default function UtilizationFormScreen() {
  const insets = useSafeAreaInsets();
  const {
    inspector,
    addUtilizationRecord,
  } = useProductionStore();

  const [formData, setFormData] = React.useState({
    resourceType: '',
    resourceName: '',
    productName: '',
    availableTime: '300',
    productiveTime: '',
    observations: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const availableResources = React.useMemo(() => {
    if (!formData.resourceType) {
      return [];
    }
    return getResourcesByType(formData.resourceType as any);
  }, [formData.resourceType]);

  const handleResourceTypeChange = (resourceType: string) => {
    setFormData(prev => ({ ...prev, resourceType, resourceName: '' }));
    setErrors(prev => ({ ...prev, resourceType: '', resourceName: '' }));
  };

  const handleResourceNameChange = (resourceName: string) => {
    setFormData(prev => ({ ...prev, resourceName }));
    setErrors(prev => ({ ...prev, resourceName: '' }));
  };

  const handleProductNameChange = (productName: string) => {
    setFormData(prev => ({ ...prev, productName }));
    setErrors(prev => ({ ...prev, productName: '' }));
  };

  const handleProductiveTimeChange = (productiveTime: string) => {
    setFormData(prev => ({ ...prev, productiveTime }));
    setErrors(prev => ({ ...prev, productiveTime: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.resourceType) {
      newErrors.resourceType = 'El tipo de recurso es obligatorio';
    }

    if (!formData.resourceName) {
      newErrors.resourceName = 'El recurso/estación es obligatorio';
    }

    if (!formData.productName.trim()) {
      newErrors.productName = 'El producto monitoreado es obligatorio';
    }

    if (!formData.productiveTime.trim()) {
      newErrors.productiveTime = 'El tiempo productivo es obligatorio';
    } else {
      const productiveTime = parseFloat(formData.productiveTime);
      const availableTime = parseFloat(formData.availableTime);
      
      if (isNaN(productiveTime) || productiveTime < 0) {
        newErrors.productiveTime = 'Debe ser un número válido mayor o igual a 0';
      } else if (productiveTime > availableTime) {
        newErrors.productiveTime = `No puede ser mayor al tiempo disponible (${availableTime} segundos)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateUtilizationPercentage = () => {
    const productiveTime = parseFloat(formData.productiveTime) || 0;
    const availableTime = parseFloat(formData.availableTime) || 300;
    return availableTime > 0 ? (productiveTime / availableTime) * 100 : 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!inspector) {
      return;
    }

    const utilizationPercentage = calculateUtilizationPercentage();

    const record = {
      inspector: inspector.name,
      timestamp: getNicaraguaTime(),
      resourceType: formData.resourceType,
      resourceName: formData.resourceName,
      productName: formData.productName,
      availableTime: parseFloat(formData.availableTime),
      productiveTime: parseFloat(formData.productiveTime),
      utilizationPercentage,
      observations: formData.observations || undefined,
    };

    await addUtilizationRecord(record);

    setFormData({
      resourceType: '',
      resourceName: '',
      productName: '',
      availableTime: '300',
      productiveTime: '',
      observations: '',
    });
    setErrors({});
  };

  const utilizationPercentage = calculateUtilizationPercentage();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Estimación de Utilización',
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.sectionTitle}>Selección de Recurso/Estación</Text>
          
          <Picker
            label="Tipo de Recurso"
            value={formData.resourceType}
            options={RESOURCE_TYPES.map(type => ({ key: type, label: type }))}
            onSelect={handleResourceTypeChange}
            placeholder="Seleccionar tipo..."
            required
            error={errors.resourceType}
          />

          {formData.resourceType && (
            <Picker
              label="Recurso/Estación"
              value={formData.resourceName}
              options={availableResources.map(resource => ({ key: resource.name, label: resource.name }))}
              onSelect={handleResourceNameChange}
              placeholder="Seleccionar recurso..."
              required
              error={errors.resourceName}
            />
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Información del Monitoreo</Text>
          <Text style={styles.sectionDescription}>
            Evalúe la proporción del tiempo disponible que es tiempo productivo durante un lapso de 300 segundos (5 minutos).
          </Text>
          
          <SearchablePicker
            label="Producto Monitoreado"
            value={formData.productName}
            options={PRODUCT_NAMES.map(name => ({ key: name, label: name }))}
            onSelect={handleProductNameChange}
            placeholder="Buscar producto..."
            required
            error={errors.productName}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Medición de Tiempos</Text>
          
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>Tiempo Disponible:</Text>
            <Text style={styles.timeValue}>300 segundos (fijo)</Text>
          </View>

          <Input
            label="Tiempo Productivo (segundos)"
            value={formData.productiveTime}
            onChangeText={handleProductiveTimeChange}
            placeholder="Ej: 270"
            keyboardType="numeric"
            required
            error={errors.productiveTime}
          />

          {formData.productiveTime && !errors.productiveTime && (
            <View style={styles.utilizationResult}>
              <Text style={styles.utilizationLabel}>Porcentaje de Utilización:</Text>
              <Text style={styles.utilizationValue}>
                {utilizationPercentage.toFixed(1)}%
              </Text>
            </View>
          )}

          <Input
            label="Observaciones (opcional)"
            value={formData.observations}
            onChangeText={(observations) => setFormData(prev => ({ ...prev, observations }))}
            placeholder="Notas adicionales sobre el monitoreo..."
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
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  timeInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#0c4a6e',
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 16,
    color: '#0c4a6e',
    fontWeight: '600',
  },
  utilizationResult: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  utilizationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  utilizationValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
  },
  submitButton: {
    marginTop: 16,
  },
  packagingInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packagingLabel: {
    fontSize: 14,
    color: '#0c4a6e',
    fontWeight: '500',
  },
  packagingValue: {
    fontSize: 16,
    color: '#0c4a6e',
    fontWeight: '600',
  },
  configInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 4,
  },
});