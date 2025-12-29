import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Activity } from 'lucide-react-native';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import { Colors } from '@/constants/colors';

export default function MatanzaModuleSelectionScreen() {
  const { inspector, setSelectedModule, clearSession } = useProductionStore();

  const handleModuleSelect = (module: 'matanza-utilization-5min') => {
    if (!module || module !== 'matanza-utilization-5min') {
      return;
    }
    setSelectedModule('utilization-5min');
    router.push('/matanza-utilization-config');
  };

  const handleBack = () => {
    if (typeof clearSession === 'function') {
      clearSession();
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Matanza',
          headerLeft: () => (
            <Button
              title="Atrás"
              onPress={handleBack}
              variant="secondary"
              size="small"
              style={styles.backButton}
            />
          ),
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo size="medium" variant="horizontal" />
          <Text style={styles.welcomeText}>Bienvenido, {inspector?.name}</Text>
          <Text style={styles.subtitle}>Matanza - Seleccione el módulo de análisis</Text>
        </View>

        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <Activity size={40} color="#3b82f6" />
            <Text style={styles.moduleTitle}>Estimación de Productividad</Text>
          </View>
          
          <Text style={styles.moduleDescription}>
            Medición de productividad en ventanas de 5 minutos:
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Cronómetro de 5 minutos (countdown)</Text>
            <Text style={styles.feature}>• 9 estados mutuamente excluyentes</Text>
            <Text style={styles.feature}>• Contador de output (piezas o cajas)</Text>
            <Text style={styles.feature}>• Cálculo automático de utilización y capacidad/h</Text>
            <Text style={styles.feature}>• Validación: suma de segundos = 300</Text>
          </View>

          <Button
            title="Seleccionar Módulo"
            onPress={() => handleModuleSelect('matanza-utilization-5min')}
            style={styles.selectButton}
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  moduleCard: {
    marginBottom: 24,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
  },
  moduleDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 22,
  },
  featureList: {
    marginBottom: 24,
  },
  feature: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  selectButton: {
    marginTop: 8,
  },
});
