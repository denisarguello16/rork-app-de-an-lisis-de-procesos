import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ClipboardList, BarChart3, XCircle, Clock } from 'lucide-react-native';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { SyncButton } from '@/components/ui/SyncButton';
import Colors from '@/constants/colors';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { inspector, setInspector } = useProductionStore();
  const [inspectorName, setInspectorName] = React.useState(inspector?.name || '');

  const handleStartSession = () => {
    if (!inspectorName.trim()) {
      return;
    }

    setInspector({
      name: inspectorName.trim(),
      timestamp: new Date(),
    });

    router.push('/module-selection');
  };

  const handleContinueSession = () => {
    router.push('/module-selection');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo size="large" variant="vertical" />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Registro de Inspector</Text>
          
          {inspector ? (
            <View style={styles.inspectorInfo}>
              <Text style={styles.inspectorLabel}>Inspector actual:</Text>
              <Text style={styles.inspectorName}>{inspector.name}</Text>
              <Text style={styles.inspectorTime}>
                Sesión iniciada: {inspector.timestamp.toLocaleString('es-MX')}
              </Text>
              
              <View style={styles.buttonContainer}>
                <Button
                  title="Continuar Sesión"
                  onPress={handleContinueSession}
                  style={styles.button}
                />
                <Button
                  title="Nueva Sesión"
                  onPress={() => {
                    setInspector({
                      name: inspectorName.trim() || inspector.name,
                      timestamp: new Date(),
                    });
                    router.push('/module-selection');
                  }}
                  variant="secondary"
                  style={styles.button}
                />
              </View>
            </View>
          ) : (
            <View>
              <Input
                label="Nombre del Inspector"
                value={inspectorName}
                onChangeText={setInspectorName}
                placeholder="Ingrese su nombre completo"
                required
              />
              
              <Button
                title="Iniciar Sesión"
                onPress={handleStartSession}
                style={styles.startButton}
              />
            </View>
          )}
        </Card>

        <SyncButton onSyncComplete={(result) => {
          console.log('Sync completed:', result);
        }} />

        <View style={styles.modulesPreview}>
          <Text style={styles.modulesTitle}>Módulos Disponibles</Text>
          
          <Card style={styles.moduleCard}>
            <BarChart3 size={32} color={Colors.light.secondary} />
            <Text style={styles.moduleTitle}>Análisis de Capacidad</Text>
            <Text style={styles.moduleDescription}>
              Registro de producción por estación, cálculo de eficiencia y utilización
            </Text>
          </Card>

          <Card style={styles.moduleCard}>
            <ClipboardList size={32} color={Colors.light.primary} />
            <Text style={styles.moduleTitle}>Análisis de Utilización</Text>
            <Text style={styles.moduleDescription}>
              Monitoreo de tiempos de producción entre estaciones
            </Text>
          </Card>

          <Card style={styles.moduleCard}>
            <XCircle size={32} color="#ef4444" />
            <Text style={styles.moduleTitle}>Registro de Rechazos</Text>
            <Text style={styles.moduleDescription}>
              Control de piezas rechazadas por línea de producción y tamaño
            </Text>
          </Card>

          <Card style={styles.moduleCard}>
            <Clock size={32} color="#f59e0b" />
            <Text style={styles.moduleTitle}>Registro de Tiempo de Setup</Text>
            <Text style={styles.moduleDescription}>
              Control de tiempos no productivos por cambios de configuración
            </Text>
          </Card>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  subtitle: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: 'center',
    marginTop: 16,
  },
  card: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  inspectorInfo: {
    alignItems: 'center',
  },
  inspectorLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  inspectorName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  inspectorTime: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
  },
  startButton: {
    marginTop: 8,
  },
  modulesPreview: {
    marginTop: 16,
  },
  modulesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  moduleCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});