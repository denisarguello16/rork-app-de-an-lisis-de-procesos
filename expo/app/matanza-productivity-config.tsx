import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Picker } from '@/components/ui/Picker';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MatanzaProductivityConfigScreen() {
  const insets = useSafeAreaInsets();
  const { inspector } = useProductionStore();
  const [stage, setStage] = useState<string>('Aturdimiento');

  const handleStart = () => {
    if (!stage.trim()) {
      return;
    }
    
    router.push({
      pathname: '/matanza-productivity-timer',
      params: {
        stage: stage.trim(),
      },
    });
  };

  const isValid = stage.trim().length > 0;

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
              { key: 'Aturdimiento', label: 'Aturdimiento' },
              { key: 'Izado', label: 'Izado' },
              { key: 'Degüelle', label: 'Degüelle' },
              { key: 'Corte de Cachos y Orejas', label: 'Corte de Cachos y Orejas' },
              { key: 'Desollado de Cabezas', label: 'Desollado de Cabezas' },
              { key: 'Corte de Patas Delanteras', label: 'Corte de Patas Delanteras' },
              { key: 'Ligado de Esófago', label: 'Ligado de Esófago' },
              { key: 'Separación de Cabezas', label: 'Separación de Cabezas' },
              { key: 'Embolsado de Esófago y Tráquea', label: 'Embolsado de Esófago y Tráquea' },
              { key: 'Ligado de Recto y Vejiga', label: 'Ligado de Recto y Vejiga' },
              { key: 'Corte de Patas Traseras', label: 'Corte de Patas Traseras' },
              { key: 'Desollado Rectal', label: 'Desollado Rectal' },
              { key: 'Desollado de Cuarto Trasero y Corte de Patas Traseras', label: 'Desollado de Cuarto Trasero y Corte de Patas Traseras' },
              { key: 'Desollado de Flanco', label: 'Desollado de Flanco' },
              { key: 'Desollado de Cola', label: 'Desollado de Cola' },
              { key: 'Desollado Región Toracolumbar', label: 'Desollado Región Toracolumbar' },
              { key: 'Desollado Cuarto Delantero', label: 'Desollado Cuarto Delantero' },
              { key: 'Chequeo de Pecho', label: 'Chequeo de Pecho' },
              { key: 'Descuerado', label: 'Descuerado' },
              { key: 'Corte de Esternón', label: 'Corte de Esternón' },
              { key: 'Limpieza de Cuello', label: 'Limpieza de Cuello' },
              { key: 'Evisceración', label: 'Evisceración' },
              { key: 'División', label: 'División' },
              { key: 'Remoción de Médula Espinal', label: 'Remoción de Médula Espinal' },
              { key: 'Limpieza de Entraña', label: 'Limpieza de Entraña' },
              { key: 'Desebado y Chequeo Cuarto Trasero', label: 'Desebado y Chequeo Cuarto Trasero' },
              { key: 'Desebado y Chequeo Cuarto Delantero', label: 'Desebado y Chequeo Cuarto Delantero' },
              { key: 'Pre Deshuese de Chuck Roll', label: 'Pre Deshuese de Chuck Roll' },
              { key: 'Chequeo de Cogote', label: 'Chequeo de Cogote' },
              { key: 'Chequeo de Lomo', label: 'Chequeo de Lomo' },
              { key: 'Lavado de Canales', label: 'Lavado de Canales' },
              { key: 'Pre Deshuese de Pierna', label: 'Pre Deshuese de Pierna' },
              { key: 'Intervención con Agua Caliente', label: 'Intervención con Agua Caliente' },
              { key: 'Numeración de Canales', label: 'Numeración de Canales' },
              { key: 'Intervención Antibacteriana Ac. Láctico', label: 'Intervención Antibacteriana Ac. Láctico' },
              { key: 'Separación de Ubres', label: 'Separación de Ubres' },
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
