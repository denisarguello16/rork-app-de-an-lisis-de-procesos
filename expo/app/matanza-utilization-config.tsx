import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Picker } from '@/components/ui/Picker';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { MATANZA_STAGES } from '@/constants/production';
import { EMPLOYEE_CATALOG } from '@/constants/employees';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MatanzaUtilizationConfigScreen() {
  const insets = useSafeAreaInsets();
  const { inspector } = useProductionStore();
  const [stage, setStage] = useState<string>('Aturdimiento');
  const [employeeCode, setEmployeeCode] = useState<string>('');
  
  const employeeName = employeeCode ? EMPLOYEE_CATALOG[employeeCode] : null;

  const handleStart = () => {
    if (!stage.trim() || !employeeCode.trim()) {
      return;
    }
    
    router.push({
      pathname: '/matanza-utilization-timer',
      params: {
        stage: stage.trim(),
        employeeCode: employeeCode.trim(),
      },
    });
  };

  const isValid = stage.trim() && employeeCode.trim() && /^\d{1,5}$/.test(employeeCode);

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
            <Text style={styles.title}>Análisis de Productividad</Text>
            <Text style={styles.subtitle}>
              Configure la etapa a evaluar. El timer medirá el tiempo dedicado a cada actividad.
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
            options={MATANZA_STAGES}
          />

          <Input
            label="Código de Empleado"
            value={employeeCode}
            onChangeText={(text) => {
              const numericOnly = text.replace(/[^0-9]/g, '');
              if (numericOnly.length <= 5) {
                setEmployeeCode(numericOnly);
              }
            }}
            placeholder="Ingrese código (máx. 5 dígitos)"
            keyboardType="numeric"
            maxLength={5}
          />

          {employeeCode && (
            <View style={styles.employeeNameCard}>
              {employeeName ? (
                <>
                  <Text style={styles.employeeNameLabel}>Nombre del Empleado:</Text>
                  <Text style={styles.employeeName}>{employeeName}</Text>
                </>
              ) : (
                <Text style={styles.employeeNotFound}>Código no encontrado</Text>
              )}
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Registrará el tiempo por etapa en tres categorías:{"\n"}
              • CT (Cycle Time): segundos &quot;hands-on&quot; por res{"\n"}
              • SSOP: lavado de manos y esterilización{"\n"}
              • Pérdidas: espera, caminar, búsqueda, reprocesos
            </Text>
          </View>

          <Button
            title="Iniciar Timer"
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
  employeeNameCard: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  employeeNameLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
  },
  employeeNotFound: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    textAlign: 'center',
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
