import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SearchablePicker } from '@/components/ui/SearchablePicker';
import { Picker } from '@/components/ui/Picker';
import { PACKING_MACHINES } from '@/constants/resources';
import { PRODUCT_NAMES } from '@/constants/product-names';
import { getNicaraguaTime } from '@/constants/timezone';
import { Colors } from '@/constants/colors';

export default function CycleTimeFormScreen() {
  const {
    inspector,
    addCycleTimeRecord,
  } = useProductionStore();

  const [formData, setFormData] = React.useState({
    productName: '',
    packingMachine: '',
    cycleTime: '',
    observations: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName) {
      newErrors.productName = 'Debe seleccionar un producto';
    }

    if (!formData.packingMachine) {
      newErrors.packingMachine = 'Debe seleccionar una máquina empacadora';
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

    setIsSubmitting(true);

    try {
      const record = {
        inspector: inspector!.name,
        timestamp: getNicaraguaTime(),
        productName: formData.productName,
        packingMachine: formData.packingMachine,
        cycleTime: parseFloat(formData.cycleTime),
        observations: formData.observations.trim() || undefined,
      };

      await addCycleTimeRecord(record);

      setFormData({
        productName: '',
        packingMachine: '',
        cycleTime: '',
        observations: '',
      });
      setErrors({});

      Alert.alert(
        'Éxito',
        'Registro de tiempo de ciclo guardado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting cycle time record:', error);
      Alert.alert(
        'Error',
        'Hubo un error al guardar el registro. Por favor intente nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const productOptions = React.useMemo(() => {
    return PRODUCT_NAMES.map(name => ({
      key: name,
      label: name,
    }));
  }, []);

  const packingMachineOptions = React.useMemo(() => {
    return PACKING_MACHINES.map(machine => ({
      key: machine,
      label: machine,
    }));
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Registro de Tiempo de Ciclo',
          headerLeft: () => (
            <Button
              title="Atrás"
              onPress={() => router.back()}
              variant="secondary"
              size="small"
              style={styles.backButton}
            />
          ),
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.sectionTitle}>Información del Monitoreo</Text>
          <Text style={styles.inspectorText}>Inspector: {inspector?.name}</Text>
          <Text style={styles.timestampText}>
            Hora: {getNicaraguaTime().toLocaleString('es-NI', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Datos del Producto</Text>
          
          <SearchablePicker
            label="Nombre del Producto"
            value={formData.productName}
            options={productOptions}
            onSelect={(value) => setFormData(prev => ({ ...prev, productName: value }))}
            placeholder="Buscar producto..."
            required
            error={errors.productName}
          />

          <Picker
            label="Máquina Empacadora"
            value={formData.packingMachine}
            options={packingMachineOptions}
            onSelect={(value) => setFormData(prev => ({ ...prev, packingMachine: value }))}
            required
            error={errors.packingMachine}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Tiempo de Ciclo</Text>
          
          <Input
            label="Tiempo de Ciclo (segundos)"
            value={formData.cycleTime}
            onChangeText={(value) => setFormData(prev => ({ ...prev, cycleTime: value }))}
            keyboardType="decimal-pad"
            placeholder="Ej: 12.5"
            required
            error={errors.cycleTime}
          />

          <Input
            label="Observaciones"
            value={formData.observations}
            onChangeText={(value) => setFormData(prev => ({ ...prev, observations: value }))}
            multiline
            numberOfLines={3}
            placeholder="Observaciones adicionales (opcional)"
          />
        </Card>

        <Button
          title={isSubmitting ? "Guardando..." : "Guardar Registro"}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
        />
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: -8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  inspectorText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 14,
    color: '#64748b',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});
