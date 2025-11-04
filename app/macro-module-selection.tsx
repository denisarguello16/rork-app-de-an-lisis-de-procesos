import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Beef, Cog } from 'lucide-react-native';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import { Colors } from '@/constants/colors';

export default function MacroModuleSelectionScreen() {
  const { inspector, clearSession } = useProductionStore();

  const handleMacroModuleSelect = (macroModule: 'signature' | 'deshuese') => {
    if (macroModule === 'signature') {
      router.push('/module-selection');
    } else if (macroModule === 'deshuese') {
      // TODO: Crear módulos para Deshuese en el futuro
      console.log('Módulos de Deshuese aún no implementados');
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
          title: 'Selección de Área',
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
          <Text style={styles.subtitle}>Seleccione el área de producción</Text>
        </View>

        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <Beef size={48} color={Colors.light.primary} />
            <Text style={styles.moduleTitle}>Línea Signature</Text>
          </View>
          
          <Text style={styles.moduleDescription}>
            Módulos de análisis y control para la línea Signature:
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Análisis de Capacidad</Text>
            <Text style={styles.feature}>• Estimación de Productividad</Text>
            <Text style={styles.feature}>• Registro de Rechazos</Text>
            <Text style={styles.feature}>• Tiempo de Setup y Paros</Text>
          </View>

          <Button
            title="Seleccionar Línea Signature"
            onPress={() => handleMacroModuleSelect('signature')}
            style={styles.selectButton}
          />
        </Card>

        <Card style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <Cog size={48} color="#dc2626" />
            <Text style={styles.moduleTitle}>Deshuese</Text>
          </View>
          
          <Text style={styles.moduleDescription}>
            Módulos de análisis y control para el área de Deshuese:
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureDisabled}>• Módulos en desarrollo</Text>
            <Text style={styles.featureDisabled}>• Próximamente disponibles</Text>
          </View>

          <Button
            title="Próximamente"
            onPress={() => handleMacroModuleSelect('deshuese')}
            variant="secondary"
            style={styles.selectButton}
            disabled
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
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 16,
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
    fontSize: 15,
    color: '#64748b',
    marginBottom: 10,
    lineHeight: 22,
    fontWeight: '500',
  },
  featureDisabled: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 10,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  selectButton: {
    marginTop: 8,
  },
});
