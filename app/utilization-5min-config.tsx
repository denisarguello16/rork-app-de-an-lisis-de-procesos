import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { RESOURCE_TYPES, getResourcesByType } from '@/constants/resources';
import { Colors } from '@/constants/colors';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Utilization5minConfigScreen() {
  const insets = useSafeAreaInsets();
  const { inspector } = useProductionStore();
  const [resourceType, setResourceType] = useState<string>('');
  const [resourceName, setResourceName] = useState<string>('');
  const [productFamily, setProductFamily] = useState<string>('');
  const [outputUnit, setOutputUnit] = useState<string>('piezas');

  const availableResources = React.useMemo(() => {
    if (!resourceType) {
      return [];
    }
    return getResourcesByType(resourceType as any);
  }, [resourceType]);

  const handleResourceTypeChange = (type: string) => {
    setResourceType(type);
    setResourceName('');
  };

  const handleStart = () => {
    if (!resourceName || !productFamily.trim()) {
      return;
    }
    
    router.push({
      pathname: '/utilization-5min-timer',
      params: {
        stage: resourceName,
        productFamily: productFamily.trim(),
        outputUnit,
      },
    });
  };

  const isValid = resourceName && productFamily.trim();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Configurar Medición',
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
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Configuración de Medición</Text>
            <Text style={styles.subtitle}>
              Configure los parámetros antes de iniciar la medición de 5 minutos
            </Text>
          </View>

          <View style={styles.inspectorCard}>
            <Text style={styles.inspectorLabel}>Inspector:</Text>
            <Text style={styles.inspectorName}>{inspector?.name}</Text>
          </View>

          <Picker
            label="Tipo de Recurso"
            value={resourceType}
            options={RESOURCE_TYPES.map(type => ({ key: type, label: type }))}
            onSelect={handleResourceTypeChange}
            placeholder="Seleccionar tipo..."
          />

          {resourceType && (
            <Picker
              label="Recurso Monitoreado"
              value={resourceName}
              options={availableResources.map(resource => ({ key: resource.name, label: resource.name }))}
              onSelect={setResourceName}
              placeholder="Seleccionar recurso..."
            />
          )}

          <Input
            label="Corte / Familia de Producto"
            placeholder="Ej: Lomo, Chuleta, Chorizo"
            value={productFamily}
            onChangeText={setProductFamily}

          />

          <Picker
            label="Unidad de Salida"
            value={outputUnit}
            onSelect={(value) => setOutputUnit(value)}
            options={[
              { key: 'piezas', label: 'Piezas' },
              { key: 'cajas', label: 'Cajas' },
            ]}

          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Al iniciar, tendrá 5 minutos para registrar estados y contar la producción.
            </Text>
          </View>

          <Button
            title="Iniciar 05:00"
            onPress={handleStart}
            disabled={!isValid}
            style={styles.startButton}

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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: -8,
  },
  card: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  inspectorCard: {
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inspectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inspectorName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },

  infoBox: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  infoText: {
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
  },
  startButton: {
    height: 56,
  },
});
