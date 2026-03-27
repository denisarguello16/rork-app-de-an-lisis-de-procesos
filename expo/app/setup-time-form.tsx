import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { EVENT_TYPES } from '@/constants/production';
import { getAllResourceNames } from '@/constants/resources';
import { getNicaraguaTime } from '@/constants/timezone';

export default function SetupTimeFormScreen() {
  const {
    inspector,
    addSetupTimeRecord,
  } = useProductionStore();

  const [formData, setFormData] = React.useState({
    resourceName: '',
    eventType: '',
    eventTime: '',
    description: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.resourceName) {
      newErrors.resourceName = 'Debe seleccionar un recurso involucrado';
    }

    if (!formData.eventType) {
      newErrors.eventType = 'Debe seleccionar el tipo de evento';
    }

    if (!formData.eventTime.trim()) {
      newErrors.eventTime = 'El tiempo del evento es obligatorio';
    } else {
      const time = parseInt(formData.eventTime);
      if (isNaN(time) || time <= 0) {
        newErrors.eventTime = 'Debe ser un número entero positivo (minutos)';
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
      resourceName: formData.resourceName,
      eventType: formData.eventType as any,
      eventTime: parseInt(formData.eventTime),
      description: formData.description.trim() || undefined,
    };

    await addSetupTimeRecord(record);

    setFormData({
      resourceName: '',
      eventType: '',
      eventTime: '',
      description: '',
    });
    setErrors({});

    // Show success message or navigate back
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Registro de Tiempo de Setup y Paros',
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.sectionTitle}>Información del Evento</Text>
          
          <Picker
            label="Recurso Involucrado"
            value={formData.resourceName}
            options={getAllResourceNames().map(name => ({ key: name, label: name }))}
            onSelect={(value) => setFormData(prev => ({ ...prev, resourceName: value }))}
            required
            error={errors.resourceName}
          />

          <Picker
            label="Tipo de Evento"
            value={formData.eventType}
            options={EVENT_TYPES.map(type => ({ key: type.key, label: type.label }))}
            onSelect={(value) => setFormData(prev => ({ ...prev, eventType: value }))}
            required
            error={errors.eventType}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Datos de Tiempo</Text>
          
          <Input
            label="Tiempo del Evento (minutos)"
            value={formData.eventTime}
            onChangeText={(value) => setFormData(prev => ({ ...prev, eventTime: value }))}
            placeholder="Ej: 15"
            keyboardType="numeric"
            required
            error={errors.eventTime}
          />

          <Input
            label="Descripción (opcional)"
            value={formData.description}
            onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="Detalles adicionales del evento..."
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
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 16,
  },
});