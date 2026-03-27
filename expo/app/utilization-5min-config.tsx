import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Picker } from '@/components/ui/Picker';
import { SearchablePicker } from '@/components/ui/SearchablePicker';
import { Colors } from '@/constants/colors';
import { PRODUCT_NAMES } from '@/constants/product-names';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Utilization5minConfigScreen() {
  const insets = useSafeAreaInsets();
  const { inspector } = useProductionStore();
  const [stage, setStage] = useState<string>('Sierra 1');
  const [productFamily, setProductFamily] = useState<string>(PRODUCT_NAMES[0]);
  const [outputUnit, setOutputUnit] = useState<string>('piezas');

  const handleStart = () => {
    if (!stage.trim() || !productFamily.trim()) {
      return;
    }
    
    router.push({
      pathname: '/utilization-5min-timer',
      params: {
        stage: stage.trim(),
        productFamily: productFamily.trim(),
        outputUnit,
      },
    });
  };

  const isValid = stage.trim() && productFamily.trim();

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
            label="Etapa del Proceso"
            value={stage}
            onSelect={(value) => setStage(value)}
            options={[
              { key: 'Sierra 1', label: 'Sierra 1' },
              { key: 'Sierra 2', label: 'Sierra 2' },
              { key: 'Sierra 3', label: 'Sierra 3' },
              { key: 'ULMA 2', label: 'ULMA 2' },
              { key: 'Multivac R-105', label: 'Multivac R-105' },
              { key: 'VS-95', label: 'VS-95' },
              { key: 'Indicador 80', label: 'Indicador 80' },
              { key: 'Indicador 70', label: 'Indicador 70' },
              { key: 'Indicador 40', label: 'Indicador 40' },
              { key: 'Indicador 30', label: 'Indicador 30' },
            ]}
          />

          <SearchablePicker
            label="Corte / Familia de Producto"
            value={productFamily}
            onSelect={(value) => setProductFamily(value)}
            options={PRODUCT_NAMES.map((name) => ({ key: name, label: name }))}
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
