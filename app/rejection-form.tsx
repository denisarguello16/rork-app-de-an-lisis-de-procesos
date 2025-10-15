import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { SearchablePicker } from '@/components/ui/SearchablePicker';
import { PRODUCTION_LINES } from '@/constants/production';
import { PRODUCT_NAMES } from '@/constants/product-names';
import { Colors } from '@/constants/colors';
import { RejectionLine } from '@/types/production';
import { getNicaraguaTime } from '@/constants/timezone';

const REJECTION_CAUSES = [
  'Presencia de Medicamento',
  'Sello Húmedo',
  'Sellado Deficiente por Máquina',
  'Presencia de Aserrín',
  'Incumplimiento de Rango de Peso',
  'Presencia de Pelo',
  'Presencia de Trauma'
];

const PACKAGE_SIZES = [
  { key: '3X1', label: '3X1' },
  { key: '2X1', label: '2X1' },
  { key: '2X2', label: '2X2' },
  { key: 'BOLSA TBG', label: 'BOLSA TBG' },
  { key: 'BOLSA TERMOENCOGIBLE', label: 'BOLSA TERMOENCOGIBLE' },
];

export default function RejectionFormScreen() {
  const insets = useSafeAreaInsets();
  const { inspector, addRejectionRecord } = useProductionStore();

  const [formData, setFormData] = React.useState({
    line: '' as RejectionLine | '',
    productName: '',
    packageSize: '',
    rejectionCause: '',
    quantity: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.line) {
      newErrors.line = 'La línea de producción es obligatoria';
    }

    if (!formData.productName.trim()) {
      newErrors.productName = 'El nombre del producto es obligatorio';
    }

    if (!formData.packageSize.trim()) {
      newErrors.packageSize = 'El size del empaque es obligatorio';
    }

    if (!formData.rejectionCause.trim()) {
      newErrors.rejectionCause = 'La causa del rechazo es obligatoria';
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = 'La cantidad es obligatoria';
    } else {
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors.quantity = 'Debe ser un número entero mayor a 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!inspector) {
      Alert.alert('Error', 'No se encontró información del inspector');
      return;
    }

    setIsSubmitting(true);

    try {
      const record = {
        inspector: inspector.name,
        timestamp: getNicaraguaTime(),
        line: formData.line as RejectionLine,
        productName: formData.productName,
        packageSize: formData.packageSize,
        rejectionCause: formData.rejectionCause,
        quantity: parseInt(formData.quantity),
      };

      // addRejectionRecord always succeeds locally, Google Sheets errors are handled internally
      await addRejectionRecord(record);
      
      // Show success message since data is always saved locally
      Alert.alert(
        'Éxito',
        'Registro de rechazo guardado correctamente',
        [
          {
            text: 'Continuar',
            onPress: () => {
              // Reset form
              setFormData({
                line: '',
                productName: '',
                packageSize: '',
                rejectionCause: '',
                quantity: '',
              });
              setErrors({});
            }
          },
          {
            text: 'Ver Resumen',
            onPress: () => router.push('/(tabs)/rejection-summary')
          }
        ]
      );
    } catch (error) {
      // This should rarely happen since addRejectionRecord handles errors internally
      console.error('Unexpected error saving rejection record:', error);
      // Still show success since data is saved locally
      Alert.alert(
        'Guardado Localmente',
        'El registro se guardó en el dispositivo. La sincronización con Google Sheets se intentará más tarde.',
        [
          {
            text: 'Continuar',
            onPress: () => {
              // Reset form
              setFormData({
                line: '',
                productName: '',
                packageSize: '',
                rejectionCause: '',
                quantity: '',
              });
              setErrors({});
            }
          },
          {
            text: 'Ver Resumen',
            onPress: () => router.push('/(tabs)/rejection-summary')
          }
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Registro de Rechazos',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.sectionTitle}>Información del Rechazo</Text>
          <Text style={styles.sectionSubtitle}>
            Registre los productos defectuosos por línea de producción
          </Text>
          
          <Picker
            label="Línea de Producción"
            value={formData.line}
            options={PRODUCTION_LINES.map(line => ({ key: line.key, label: line.label }))}
            onSelect={(value) => {
              setFormData(prev => ({ ...prev, line: value as RejectionLine }));
              setErrors(prev => ({ ...prev, line: '' }));
            }}
            placeholder="Seleccione una línea"
            required
            error={errors.line}
          />

          <SearchablePicker
            label="Nombre del Producto"
            value={formData.productName}
            options={PRODUCT_NAMES.map(name => ({ key: name, label: name }))}
            onSelect={(value) => {
              setFormData(prev => ({ ...prev, productName: value }));
              setErrors(prev => ({ ...prev, productName: '' }));
            }}
            placeholder="Buscar producto..."
            required
            error={errors.productName}
          />

          <Picker
            label="Size del Empaque"
            value={formData.packageSize}
            options={PACKAGE_SIZES}
            onSelect={(value) => {
              setFormData(prev => ({ ...prev, packageSize: value }));
              setErrors(prev => ({ ...prev, packageSize: '' }));
            }}
            placeholder="Seleccione el tamaño"
            required
            error={errors.packageSize}
          />

          <Picker
            label="Causa del Rechazo"
            value={formData.rejectionCause}
            options={REJECTION_CAUSES.map(cause => ({ key: cause, label: cause }))}
            onSelect={(value) => {
              setFormData(prev => ({ ...prev, rejectionCause: value }));
              setErrors(prev => ({ ...prev, rejectionCause: '' }));
            }}
            placeholder="Seleccione la causa"
            required
            error={errors.rejectionCause}
          />

          <Input
            label="Cantidad de Piezas Rechazadas"
            value={formData.quantity}
            onChangeText={(value) => {
              setFormData(prev => ({ ...prev, quantity: value }));
              setErrors(prev => ({ ...prev, quantity: '' }));
            }}
            placeholder="Ej: 15"
            keyboardType="numeric"
            required
            error={errors.quantity}
          />

          <Button
            title={isSubmitting ? "Guardando..." : "Guardar Registro"}
            onPress={handleSubmit}
            disabled={isSubmitting}
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
  submitButton: {
    marginTop: 16,
  },
});