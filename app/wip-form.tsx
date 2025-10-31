import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SearchablePicker } from '@/components/ui/SearchablePicker';
import { Picker } from '@/components/ui/Picker';
import { QUEUE_STAGES, PRODUCTION_LINES, PRODUCT_STATES, PRODUCT_CONFIGS, PACKAGING_TYPES } from '@/constants/production';
import { PRODUCT_NAMES } from '@/constants/product-names';
import { getNicaraguaTime } from '@/constants/timezone';
import { ProductionLine, ProductState, ProductConfig, PackagingType } from '@/types/production';

export default function WIPFormScreen() {
  const insets = useSafeAreaInsets();
  const {
    inspector,
    addWipRecord,
  } = useProductionStore();

  const [formData, setFormData] = React.useState({
    line: '' as ProductionLine | '',
    productState: '' as ProductState | '',
    productConfig: '' as ProductConfig | '',
    packagingType: '' as PackagingType | '',
    hasIndividualWeightLabel: false,
    productName: '',
    queueBeforePortioning: '',
    queueBeforePackaging: '',
    queueBeforeIndividualLabeling: '',
    queueBeforeBoxClosure: '',
    queueBeforeBoxStrapping: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleProductNameChange = (productName: string) => {
    setFormData(prev => ({ ...prev, productName }));
    setErrors(prev => ({ ...prev, productName: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.line) {
      newErrors.line = 'La línea de producción es obligatoria';
    }

    if (!formData.productState) {
      newErrors.productState = 'El estado del producto es obligatorio';
    }

    if (!formData.productConfig) {
      newErrors.productConfig = 'La configuración del producto es obligatoria';
    }

    if (!formData.packagingType) {
      newErrors.packagingType = 'El tipo de empaque es obligatorio';
    }

    if (!formData.productName.trim()) {
      newErrors.productName = 'El producto monitoreado es obligatorio';
    }

    // Validar todas las colas
    QUEUE_STAGES.forEach(queue => {
      const value = formData[queue.key as 'queueBeforePortioning' | 'queueBeforePackaging' | 'queueBeforeIndividualLabeling' | 'queueBeforeBoxClosure' | 'queueBeforeBoxStrapping'];
      if (!value || !value.trim()) {
        newErrors[queue.key] = 'Este campo es obligatorio';
      } else {
        const count = parseInt(value);
        if (isNaN(count) || count < 0) {
          newErrors[queue.key] = 'Debe ser un número entero no negativo';
        }
      }
    });

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

    const record = {
      inspector: inspector!.name,
      timestamp: getNicaraguaTime(),
      line: formData.line as ProductionLine,
      productState: formData.productState as ProductState,
      productConfig: formData.productConfig as ProductConfig,
      packagingType: formData.packagingType as PackagingType,
      hasIndividualWeightLabel: formData.hasIndividualWeightLabel,
      productCode: '',
      productName: formData.productName,
      packaging: '',
      queueBeforePortioning: parseInt(formData.queueBeforePortioning),
      queueBeforePackaging: parseInt(formData.queueBeforePackaging),
      queueBeforeIndividualLabeling: parseInt(formData.queueBeforeIndividualLabeling),
      queueBeforeBoxClosure: parseInt(formData.queueBeforeBoxClosure),
      queueBeforeBoxStrapping: parseInt(formData.queueBeforeBoxStrapping),
    };

    await addWipRecord(record);

    setFormData({
      line: '' as ProductionLine | '',
      productState: '' as ProductState | '',
      productConfig: '' as ProductConfig | '',
      packagingType: '' as PackagingType | '',
      hasIndividualWeightLabel: false,
      productName: '',
      queueBeforePortioning: '',
      queueBeforePackaging: '',
      queueBeforeIndividualLabeling: '',
      queueBeforeBoxClosure: '',
      queueBeforeBoxStrapping: '',
    });
    setErrors({});
  };

  const getTotalWIP = () => {
    return QUEUE_STAGES.reduce((total, queue) => {
      const value = formData[queue.key as 'queueBeforePortioning' | 'queueBeforePackaging' | 'queueBeforeIndividualLabeling' | 'queueBeforeBoxClosure' | 'queueBeforeBoxStrapping'];
      const count = parseInt(value) || 0;
      return total + count;
    }, 0);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Registro de WIP',
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.sectionTitle}>Configuración de Línea</Text>
          
          <Picker
            label="Línea de Producción"
            value={formData.line}
            options={PRODUCTION_LINES.map(line => ({ key: line.key, label: line.label }))}
            onSelect={(value) => setFormData(prev => ({ ...prev, line: value as ProductionLine }))}
            placeholder="Seleccionar línea..."
            required
            error={errors.line}
          />

          <Picker
            label="Estado del Producto"
            value={formData.productState}
            options={PRODUCT_STATES.map(state => ({ key: state.key, label: state.label }))}
            onSelect={(value) => setFormData(prev => ({ ...prev, productState: value as ProductState }))}
            placeholder="Seleccionar estado..."
            required
            error={errors.productState}
          />

          <Picker
            label="Configuración del Producto"
            value={formData.productConfig}
            options={PRODUCT_CONFIGS.map(config => ({ key: config.key, label: config.label }))}
            onSelect={(value) => setFormData(prev => ({ ...prev, productConfig: value as ProductConfig }))}
            placeholder="Seleccionar configuración..."
            required
            error={errors.productConfig}
          />

          <Picker
            label="Tipo de Empaque"
            value={formData.packagingType}
            options={PACKAGING_TYPES.map(type => ({ key: type.key, label: type.label }))}
            onSelect={(value) => setFormData(prev => ({ ...prev, packagingType: value as PackagingType }))}
            placeholder="Seleccionar tipo..."
            required
            error={errors.packagingType}
          />

          <Picker
            label="¿Tiene etiqueta de peso individual?"
            value={formData.hasIndividualWeightLabel ? 'yes' : 'no'}
            options={[
              { key: 'yes', label: 'Sí' },
              { key: 'no', label: 'No' },
            ]}
            onSelect={(value) => setFormData(prev => ({ ...prev, hasIndividualWeightLabel: value === 'yes' }))}
            placeholder="Seleccionar..."
            required
          />
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
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Trabajo en Proceso (WIP)</Text>
          <Text style={styles.sectionSubtitle}>
            Registre la cantidad de unidades en cada cola
          </Text>
          
          {QUEUE_STAGES.map((queue) => (
            <Input
              key={queue.key}
              label={queue.label}
              value={formData[queue.key as 'queueBeforePortioning' | 'queueBeforePackaging' | 'queueBeforeIndividualLabeling' | 'queueBeforeBoxClosure' | 'queueBeforeBoxStrapping']}
              onChangeText={(value) => setFormData(prev => ({ ...prev, [queue.key]: value }))}
              placeholder="Ej: 25"
              keyboardType="numeric"
              required
              error={errors[queue.key]}
            />
          ))}

          {getTotalWIP() > 0 && (
            <View style={styles.totalWIP}>
              <Text style={styles.totalWIPTitle}>Total WIP</Text>
              <Text style={styles.totalWIPValue}>{getTotalWIP()} unidades</Text>
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  totalWIP: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalWIPTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  totalWIPValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400e',
  },
  submitButton: {
    marginTop: 16,
  },
});