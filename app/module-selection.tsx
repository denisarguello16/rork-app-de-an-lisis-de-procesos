import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { BarChart3, XCircle, Clock, Activity } from 'lucide-react-native';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import { Colors } from '@/constants/colors';

export default function ModuleSelectionScreen() {
  const { inspector, setSelectedModule, clearSession } = useProductionStore();

  const handleModuleSelect = (module: 'capacity' | 'rejection' | 'setup' | 'utilization-5min') => {
    if (!module || !['capacity', 'rejection', 'setup', 'utilization-5min'].includes(module)) {
      return;
    }
    setSelectedModule(module);
    
    if (module === 'rejection') {
      router.push('/rejection-form');
    } else if (module === 'setup') {
      router.push('/setup-time-form');
    } else if (module === 'capacity') {
      router.push('/capacity-form');
    } else if (module === 'utilization-5min') {
      router.push('/utilization-5min-config');
    }
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
          title: 'Línea Signature',
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
          <Text style={styles.subtitle}>Línea Signature - Seleccione el módulo de análisis</Text>
        </View>

        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <BarChart3 size={40} color={Colors.light.secondary} />
            <Text style={styles.moduleTitle}>Análisis de Capacidad</Text>
          </View>
          
          <Text style={styles.moduleDescription}>
            Estimación de capacidad real del proceso productivo:
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Contabilizar piezas producidas cada 5 minutos</Text>
            <Text style={styles.feature}>• Registrar número de personas por etapa</Text>
            <Text style={styles.feature}>• Medir tiempo productivo por estación</Text>
            <Text style={styles.feature}>• Calcular piezas por minuto automáticamente</Text>
            <Text style={styles.feature}>• Determinar porcentaje de utilización</Text>
          </View>

          <Button
            title="Seleccionar Módulo"
            onPress={() => handleModuleSelect('capacity')}
            style={styles.selectButton}
          />
        </Card>



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
            onPress={() => handleModuleSelect('utilization-5min')}
            style={styles.selectButton}
          />
        </Card>

        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <XCircle size={40} color="#ef4444" />
            <Text style={styles.moduleTitle}>Registro de Rechazos</Text>
          </View>
          
          <Text style={styles.moduleDescription}>
            Cuantificación de productos defectuosos por línea:
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.feature}>• ULMA 1 (Central)</Text>
            <Text style={styles.feature}>• ULMA 2 (Izquierda)</Text>
            <Text style={styles.feature}>• Multivac R-105</Text>
            <Text style={styles.feature}>• VS-95</Text>
            <Text style={styles.feature}>• Control por tamaño y cantidad</Text>
          </View>

          <Button
            title="Seleccionar Módulo"
            onPress={() => handleModuleSelect('rejection')}
            style={styles.selectButton}
          />
        </Card>

        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <Clock size={40} color="#f59e0b" />
            <Text style={styles.moduleTitle}>Registro de Tiempo de Setup y Paros</Text>
          </View>
          
          <Text style={styles.moduleDescription}>
            Control de tiempos no productivos por cambios:
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Tiempo de cambio de molde</Text>
            <Text style={styles.feature}>• Reabastecimiento de film plástico</Text>
            <Text style={styles.feature}>• Registro por línea de producción</Text>
            <Text style={styles.feature}>• Análisis de eficiencia de setup</Text>
            <Text style={styles.feature}>• Identificación de mejoras</Text>
          </View>

          <Button
            title="Seleccionar Módulo"
            onPress={() => handleModuleSelect('setup')}
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