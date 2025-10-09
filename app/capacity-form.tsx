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

export default function CapacityFormScreen() {
  const insets = useSafeAreaInsets();
  const {
    inspector,
    addCapacityRecord,
  } = useProductionStore();

  const [formData, setFormData] = React.useState({
    resourceType: '',
    resourceName: '',
    productName: '',
    packageSize: '',
    peopleCount: '',
    piecesProduced: '',
    defectivePieces: '',
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

    if (!formData.packageSize) {
      newErrors.packageSize = 'El size del empaque es obligatorio';
    }

    if (!formData.peopleCount.trim()) {
      newErrors.peopleCount = 'El número de personas es obligatorio';
    } else {
      const count = parseInt(formData.peopleCount);
      if (isNaN(count) || count <= 0) {
        newErrors.peopleCount = 'Debe ser un número entero positivo';
      }
    }

    if (!formData.piecesProduced.trim()) {
      newErrors.piecesProduced = 'Las piezas producidas son obligatorias';
    } else {
      const pieces = parseInt(formData.piecesProduced);
      if (isNaN(pieces) || pieces < 0) {
        newErrors.piecesProduced = 'Debe ser un número entero no negativo';
      }
    }

    if (!formData.defectivePieces.trim()) {
      newErrors.defectivePieces = 'Las piezas defectuosas son obligatorias';
    } else {
      const defective = parseInt(formData.defectivePieces);
      if (isNaN(defective) || defective < 0) {
        newErrors.defectivePieces = 'Debe ser un número entero no negativo';
      } else if (formData.piecesProduced.trim()) {
        const produced = parseInt(formData.piecesProduced);
        if (!isNaN(produced) && defective > produced) {
          newErrors.defectivePieces = 'No puede ser mayor que las piezas producidas';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!formData.productName.trim()) {
      return;
    }

    const piecesProduced = parseInt(formData.piecesProduced);
    
    // Cálculos críticos según las especificaciones
    const piecesPerMinute = piecesProduced / 5; // Dividir entre 5 minutos

    const record = {
      inspector: inspector!.name,
      timestamp: getNicaraguaTime(),
      resourceType: formData.resourceType,
      resourceName: formData.resourceName,
      productName: formData.productName,
      packageSize: formData.packageSize,
      peopleCount: parseInt(formData.peopleCount),
      piecesProduced,
      defectivePieces: parseInt(formData.defectivePieces),
      piecesPerMinute,
    };

    await addCapacityRecord(record);

    setFormData({
      resourceType: '',
      resourceName: '',
      productName: '',
      packageSize: '',
      peopleCount: '',
      piecesProduced: '',
      defectivePieces: '',
    });
    setErrors({});
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Registro de Capacidad',
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
          <Text style={styles.sectionTitle}>Información del Producto</Text>
          
          <SearchablePicker
            label="Producto Monitoreado"
            value={formData.productName}
            options={PRODUCT_NAMES.map(name => ({ key: name, label: name }))}
            onSelect={handleProductNameChange}
            placeholder="Buscar producto..."
            required
            error={errors.productName}
          />

          <Picker
            label="Size del Empaque"
            value={formData.packageSize}
            options={[
              { key: '3X1', label: '3X1' },
              { key: '2X1', label: '2X1' },
              { key: '2X2', label: '2X2' },
              { key: 'BOLSA TBG', label: 'BOLSA TBG' },
              { key: 'BOLSA TERMOENCOGIBLE', label: 'BOLSA TERMOENCOGIBLE' },
            ]}
            onSelect={(value) => setFormData(prev => ({ ...prev, packageSize: value }))}
            required
            error={errors.packageSize}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Datos de Producción</Text>
          
          <Input
            label="Número de Personas"
            value={formData.peopleCount}
            onChangeText={(value) => setFormData(prev => ({ ...prev, peopleCount: value }))}
            placeholder="Ej: 3"
            keyboardType="numeric"
            required
            error={errors.peopleCount}
          />

          <Input
            label="Piezas Producidas (en 5 minutos)"
            value={formData.piecesProduced}
            onChangeText={(value) => setFormData(prev => ({ ...prev, piecesProduced: value }))}
            placeholder="Ej: 150"
            keyboardType="numeric"
            required
            error={errors.piecesProduced}
          />

          <Input
            label="Piezas Defectuosas"
            value={formData.defectivePieces}
            onChangeText={(value) => setFormData(prev => ({ ...prev, defectivePieces: value }))}
            placeholder="Ej: 5"
            keyboardType="numeric"
            required
            error={errors.defectivePieces}
          />

          {formData.piecesProduced && !isNaN(parseInt(formData.piecesProduced)) && (
            <View style={styles.calculations}>
              <Text style={styles.calculationsTitle}>Cálculos Automáticos</Text>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Piezas por minuto:</Text>
                <Text style={styles.calculationValue}>
                  {(parseInt(formData.piecesProduced) / 5).toFixed(2)}
                </Text>
              </View>
            </View>
          )}

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
    marginBottom: 20,
  },
  productInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  productLabel: {
    fontSize: 14,
    color: '#0c4a6e',
    fontWeight: '500',
  },
  productName: {
    fontSize: 16,
    color: '#0c4a6e',
    fontWeight: '600',
    marginTop: 4,
  },
  calculations: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  calculationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#166534',
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  submitButton: {
    marginTop: 16,
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