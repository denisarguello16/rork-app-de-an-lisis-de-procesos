import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react-native';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { WindowState, StateEvent } from '@/types/production';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNicaraguaTime } from '@/constants/timezone';
import { EMPLOYEE_CATALOG } from '@/constants/employees';

const WINDOW_STATES: WindowState[] = [
  'RUN',
  'STARVED',
  'BLOCKED',
  'SETUP',
  'AJUSTE',
  'SANIT',
  'FALLA',
  'LOGÍSTICA',
  'OTROS',
];

const STATE_COLORS: Record<WindowState, string> = {
  RUN: '#10b981',
  STARVED: '#f59e0b',
  BLOCKED: '#ef4444',
  SETUP: '#8b5cf6',
  AJUSTE: '#06b6d4',
  SANIT: '#3b82f6',
  FALLA: '#dc2626',
  LOGÍSTICA: '#f97316',
  OTROS: '#6b7280',
};

export default function MatanzaProductivityTimerScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ stage: string; employeeCode: string }>();
  const { inspector, addMatanzaProductivityRecord } = useProductionStore();

  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<number>(0);
  const [events, setEvents] = useState<StateEvent[]>([]);
  const [currentState, setCurrentState] = useState<WindowState | null>(null);
  const [stateStartTime, setStateStartTime] = useState<number>(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const employeeName = params.employeeCode ? EMPLOYEE_CATALOG[params.employeeCode] : 'Desconocido';

  const handleFinish = useCallback(async () => {
    console.log('🔵 handleFinish called - Matanza Productivity');
    console.log('🔵 timeLeft:', timeLeft);
    console.log('🔵 inspector:', inspector);
    console.log('🔵 events:', events);
    console.log('🔵 currentState:', currentState);
    console.log('🔵 output:', output);
    
    if (timeLeft > 0) {
      Alert.alert('Atención', 'El timer aún no ha terminado. Espere a que llegue a 0:00');
      return;
    }

    if (!inspector) {
      console.error('❌ Inspector no definido');
      Alert.alert('Error', 'Inspector no definido');
      return;
    }

    if (!addMatanzaProductivityRecord) {
      console.error('❌ Función addMatanzaProductivityRecord no disponible');
      Alert.alert('Error', 'Función addMatanzaProductivityRecord no disponible');
      return;
    }

    setIsRunning(false);

    const finalEvents = [...events];
    if (currentState) {
      finalEvents.push({
        state: currentState,
        startTime: stateStartTime,
        endTime: 300,
      });
    }

    console.log('🔵 finalEvents:', finalEvents);

    const stateSecondsMap: Record<WindowState, number> = {
      RUN: 0,
      STARVED: 0,
      BLOCKED: 0,
      SETUP: 0,
      AJUSTE: 0,
      SANIT: 0,
      FALLA: 0,
      LOGÍSTICA: 0,
      OTROS: 0,
    };

    finalEvents.forEach((event) => {
      const duration = (event.endTime ?? 300) - event.startTime;
      stateSecondsMap[event.state] += duration;
    });

    console.log('🔵 stateSecondsMap:', stateSecondsMap);

    const runSeconds = stateSecondsMap['RUN'];
    const utilizationPercentage = (runSeconds / 300) * 100;
    const capacityPerHour = output * 12;

    console.log('🔵 utilizationPercentage:', utilizationPercentage);
    console.log('🔵 capacityPerHour:', capacityPerHour);

    const recordData = {
      inspector: inspector.name,
      timestamp: getNicaraguaTime(),
      stage: params.stage || '',
      productFamily: `Empleado: ${params.employeeCode} - ${employeeName}`,
      outputUnit: 'piezas' as const,
      output,
      events: finalEvents,
      runPercentage: (stateSecondsMap['RUN'] / 300) * 100,
      starvedPercentage: (stateSecondsMap['STARVED'] / 300) * 100,
      blockedPercentage: (stateSecondsMap['BLOCKED'] / 300) * 100,
      setupPercentage: (stateSecondsMap['SETUP'] / 300) * 100,
      ajustePercentage: (stateSecondsMap['AJUSTE'] / 300) * 100,
      sanitPercentage: (stateSecondsMap['SANIT'] / 300) * 100,
      fallaPercentage: (stateSecondsMap['FALLA'] / 300) * 100,
      logisticaPercentage: (stateSecondsMap['LOGÍSTICA'] / 300) * 100,
      otrosPercentage: (stateSecondsMap['OTROS'] / 300) * 100,
      utilizationPercentage,
      capacityPerHour,
    };

    console.log('🔵 recordData to save:', JSON.stringify(recordData, null, 2));

    try {
      console.log('🔵 Calling addMatanzaProductivityRecord...');
      const result = await addMatanzaProductivityRecord(recordData);
      console.log('🔵 addMatanzaProductivityRecord result:', result);

      Alert.alert(
        'Ventana Guardada',
        `Utilización: ${utilizationPercentage.toFixed(1)}%\nCapacidad: ${capacityPerHour} piezas/h`,
        [{ text: 'OK', onPress: () => router.replace('/matanza-module-selection') }]
      );
    } catch (error) {
      console.error('❌ Error saving window:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      Alert.alert('Error', `No se pudo guardar la ventana: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [events, currentState, stateStartTime, output, params, inspector, addMatanzaProductivityRecord, timeLeft, employeeName]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handlePlayPause = () => {
    if (!isRunning && !currentState) {
      Alert.alert('Atención', 'Seleccione un estado antes de iniciar el cronómetro');
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    Alert.alert(
      'Confirmar Reset',
      '¿Está seguro que desea reiniciar? Perderá todos los datos registrados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: () => {
            setTimeLeft(300);
            setIsRunning(false);
            setOutput(0);
            setEvents([]);
            setCurrentState(null);
            setStateStartTime(0);
          },
        },
      ]
    );
  };

  const handleStateChange = (newState: WindowState) => {
    const currentTime = 300 - timeLeft;

    if (currentState) {
      const completedEvent: StateEvent = {
        state: currentState,
        startTime: stateStartTime,
        endTime: currentTime,
      };
      setEvents((prev) => [...prev, completedEvent]);
    }

    setCurrentState(newState);
    setStateStartTime(currentTime);
  };

  const handleOutputChange = (delta: number) => {
    setOutput((prev) => Math.max(0, prev + delta));
  };

  const stateSeconds = useMemo((): Record<WindowState, number> => {
    const seconds: Record<WindowState, number> = {
      RUN: 0,
      STARVED: 0,
      BLOCKED: 0,
      SETUP: 0,
      AJUSTE: 0,
      SANIT: 0,
      FALLA: 0,
      LOGÍSTICA: 0,
      OTROS: 0,
    };

    events.forEach((event) => {
      const duration = (event.endTime ?? 300) - event.startTime;
      seconds[event.state] += duration;
    });

    if (currentState) {
      const currentTime = 300 - timeLeft;
      const duration = currentTime - stateStartTime;
      seconds[currentState] += duration;
    }

    return seconds;
  }, [events, currentState, stateStartTime, timeLeft]);

  const totalRecordedSeconds = useMemo(
    () => Object.values(stateSeconds).reduce((sum, val) => sum + val, 0),
    [stateSeconds]
  );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <View style={[styles.container, { backgroundColor: '#0f172a' }]}>
      <Stack.Screen
        options={{
          title: 'Ventana en Curso',
          headerLeft: () => (
            <Button
              title="Cancelar"
              onPress={() => router.back()}
              variant="secondary"
              size="small"
              style={styles.backButton}
            />
          ),
        }}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>
        <Card style={styles.headerCard}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerLabel}>Etapa</Text>
            <Text style={styles.headerValue}>{params.stage}</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerLabel}>Empleado</Text>
            <Text style={styles.headerValue}>{employeeName}</Text>
          </View>
        </Card>

        <Card style={styles.timerCard}>
          <Text style={styles.timerLabel}>Tiempo Restante</Text>
          <Text style={styles.timerValue}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${(timeLeft / 300) * 100}%` }]} />
          </View>

          <View style={styles.timerControls}>
            <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
              {isRunning ? <Pause size={24} color="#fff" /> : <Play size={24} color="#fff" />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={handleReset}>
              <RotateCcw size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.outputCard}>
          <Text style={styles.outputLabel}>Contador de Output</Text>
          <View style={styles.outputCounter}>
            <TouchableOpacity style={styles.outputButton} onPress={() => handleOutputChange(-1)}>
              <Minus size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.outputValue}>{output}</Text>
            <TouchableOpacity style={styles.outputButton} onPress={() => handleOutputChange(1)}>
              <Plus size={32} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.outputUnit}>piezas</Text>
        </Card>

        <View style={styles.statesSection}>
          <Text style={styles.statesTitle}>Estados</Text>
          <View style={styles.statesGrid}>
            {WINDOW_STATES.map((state) => (
              <TouchableOpacity
                key={state}
                style={[
                  styles.stateButton,
                  {
                    backgroundColor: STATE_COLORS[state],
                    opacity: currentState === state ? 1 : 0.7,
                    borderWidth: currentState === state ? 3 : 0,
                    borderColor: '#fff',
                  },
                ]}
                onPress={() => handleStateChange(state)}
              >
                <Text style={styles.stateButtonText}>{state}</Text>
                <Text style={styles.stateSeconds}>{stateSeconds[state]}s</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen Actual</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiempo Registrado:</Text>
            <Text style={styles.summaryValue}>{totalRecordedSeconds}s / 300s</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Output Actual:</Text>
            <Text style={styles.summaryValue}>{output} piezas</Text>
          </View>
        </Card>

        {timeLeft === 0 && (
          <Button
            title="Guardar Ventana"
            onPress={() => handleFinish()}
            style={styles.finishButton}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  backButton: {
    marginLeft: -8,
  },
  headerCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  headerDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 8,
  },
  timerCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: Colors.light.secondary,
  },
  outputCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  outputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  outputCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 8,
  },
  outputButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outputValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.light.text,
    minWidth: 80,
    textAlign: 'center',
  },
  outputUnit: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textTransform: 'capitalize',
  },
  statesSection: {
    marginBottom: 16,
  },
  statesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stateButton: {
    width: '31%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  stateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  stateSeconds: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  summaryCard: {
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  finishButton: {
    marginTop: 8,
  },
});
