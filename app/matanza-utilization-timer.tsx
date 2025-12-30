import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react-native';
import { useProductionStore } from '@/store/production-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { MatanzaTimeCategory, MatanzaTimeEvent } from '@/types/production';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNicaraguaTime } from '@/constants/timezone';

const TIME_CATEGORIES: MatanzaTimeCategory[] = ['CT', 'SSOP', 'PERDIDAS'];

const CATEGORY_COLORS: Record<MatanzaTimeCategory, string> = {
  CT: '#10b981',
  SSOP: '#3b82f6',
  PERDIDAS: '#ef4444',
};

const CATEGORY_LABELS: Record<MatanzaTimeCategory, string> = {
  CT: 'CT (Cycle Time)',
  SSOP: 'SSOP (Inocuidad)',
  PERDIDAS: 'Pérdidas',
};

const CATEGORY_DESCRIPTIONS: Record<MatanzaTimeCategory, string> = {
  CT: 'Segundos "hands-on" por res',
  SSOP: 'Lavado de manos y esterilización',
  PERDIDAS: 'Espera, caminar, búsqueda, reprocesos',
};

export default function MatanzaUtilizationTimerScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ stage: string; productFamily: string; outputUnit: string }>();
  const { inspector, addMatanzaWindow5minRecord } = useProductionStore();

  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<number>(0);
  const [events, setEvents] = useState<MatanzaTimeEvent[]>([]);
  const [currentCategory, setCurrentCategory] = useState<MatanzaTimeCategory | null>(null);
  const [categoryStartTime, setCategoryStartTime] = useState<number>(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFinish = useCallback(async () => {
    console.log('🔵 handleFinish called');
    console.log('🔵 elapsedTime:', elapsedTime);
    console.log('🔵 inspector:', inspector);
    console.log('🔵 events:', events);
    console.log('🔵 currentCategory:', currentCategory);
    console.log('🔵 output:', output);
    
    if (!inspector) {
      console.error('❌ Inspector no definido');
      Alert.alert('Error', 'Inspector no definido');
      return;
    }

    if (!addMatanzaWindow5minRecord) {
      console.error('❌ Función addMatanzaWindow5minRecord no disponible');
      Alert.alert('Error', 'Función addMatanzaWindow5minRecord no disponible');
      return;
    }

    setIsRunning(false);

    const finalEvents = [...events];
    if (currentCategory) {
      finalEvents.push({
        category: currentCategory,
        startTime: categoryStartTime,
        endTime: elapsedTime,
      });
    }

    console.log('🔵 finalEvents:', finalEvents);

    const categorySecondsMap: Record<MatanzaTimeCategory, number> = {
      CT: 0,
      SSOP: 0,
      PERDIDAS: 0,
    };

    finalEvents.forEach((event) => {
      const duration = (event.endTime ?? elapsedTime) - event.startTime;
      categorySecondsMap[event.category] += duration;
    });

    console.log('🔵 categorySecondsMap:', categorySecondsMap);

    const totalTime = elapsedTime;
    const ctSeconds = categorySecondsMap['CT'];
    const ssopSeconds = categorySecondsMap['SSOP'];
    const perdidasSeconds = categorySecondsMap['PERDIDAS'];

    const ctPercentage = totalTime > 0 ? (ctSeconds / totalTime) * 100 : 0;
    const ssopPercentage = totalTime > 0 ? (ssopSeconds / totalTime) * 100 : 0;
    const perdidasPercentage = totalTime > 0 ? (perdidasSeconds / totalTime) * 100 : 0;
    
    const cycleTimePerUnit = output > 0 ? ctSeconds / output : 0;

    console.log('🔵 Calculations:', {
      totalTime,
      ctSeconds,
      ssopSeconds,
      perdidasSeconds,
      ctPercentage,
      ssopPercentage,
      perdidasPercentage,
      cycleTimePerUnit,
    });

    const recordData = {
      inspector: inspector.name,
      timestamp: getNicaraguaTime(),
      stage: params.stage || '',
      productFamily: params.productFamily || '',
      outputUnit: (params.outputUnit as 'piezas' | 'cajas') || 'piezas',
      output,
      events: finalEvents,
      ctSeconds,
      ssopSeconds,
      perdidasSeconds,
      ctPercentage,
      ssopPercentage,
      perdidasPercentage,
      totalTime,
      cycleTimePerUnit,
    };

    console.log('🔵 recordData to save:', JSON.stringify(recordData, null, 2));

    try {
      console.log('🔵 Calling addMatanzaWindow5minRecord...');
      const result = await addMatanzaWindow5minRecord(recordData);
      console.log('🔵 addMatanzaWindow5minRecord result:', result);

      Alert.alert(
        'Datos Guardados',
        `CT: ${ctPercentage.toFixed(1)}% | SSOP: ${ssopPercentage.toFixed(1)}% | Pérdidas: ${perdidasPercentage.toFixed(1)}%\nCT por unidad: ${cycleTimePerUnit.toFixed(1)}s`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('❌ Error saving window:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      Alert.alert('Error', `No se pudo guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [events, currentCategory, categoryStartTime, output, params, inspector, addMatanzaWindow5minRecord, elapsedTime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
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
  }, [isRunning]);

  const handlePlayPause = () => {
    if (!isRunning && !currentCategory) {
      Alert.alert('Atención', 'Seleccione una categoría antes de iniciar el cronómetro');
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
            setElapsedTime(0);
            setIsRunning(false);
            setOutput(0);
            setEvents([]);
            setCurrentCategory(null);
            setCategoryStartTime(0);
          },
        },
      ]
    );
  };

  const handleCategoryChange = (newCategory: MatanzaTimeCategory) => {
    if (currentCategory) {
      const completedEvent: MatanzaTimeEvent = {
        category: currentCategory,
        startTime: categoryStartTime,
        endTime: elapsedTime,
      };
      setEvents((prev) => [...prev, completedEvent]);
    }

    setCurrentCategory(newCategory);
    setCategoryStartTime(elapsedTime);
  };

  const handleOutputChange = (delta: number) => {
    setOutput((prev) => Math.max(0, prev + delta));
  };

  const categorySeconds = useMemo((): Record<MatanzaTimeCategory, number> => {
    const seconds: Record<MatanzaTimeCategory, number> = {
      CT: 0,
      SSOP: 0,
      PERDIDAS: 0,
    };

    events.forEach((event) => {
      const duration = (event.endTime ?? elapsedTime) - event.startTime;
      seconds[event.category] += duration;
    });

    if (currentCategory) {
      const duration = elapsedTime - categoryStartTime;
      seconds[currentCategory] += duration;
    }

    return seconds;
  }, [events, currentCategory, categoryStartTime, elapsedTime]);



  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;

  const formatTime = () => {
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0f172a' }]}>
      <Stack.Screen
        options={{
          title: 'Análisis en Curso',
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
            <Text style={styles.headerLabel}>Producto</Text>
            <Text style={styles.headerValue}>{params.productFamily}</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerLabel}>Unidad</Text>
            <Text style={styles.headerValue}>{params.outputUnit}</Text>
          </View>
        </Card>

        <Card style={styles.timerCard}>
          <Text style={styles.timerLabel}>Tiempo Transcurrido</Text>
          <Text style={styles.timerValue}>{formatTime()}</Text>

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
          <Text style={styles.outputUnit}>{params.outputUnit}</Text>
        </Card>

        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Categorías de Tiempo</Text>
          <View style={styles.categoriesGrid}>
            {TIME_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: CATEGORY_COLORS[category],
                    opacity: currentCategory === category ? 1 : 0.7,
                    borderWidth: currentCategory === category ? 3 : 0,
                    borderColor: '#fff',
                  },
                ]}
                onPress={() => handleCategoryChange(category)}
              >
                <Text style={styles.categoryButtonText}>{CATEGORY_LABELS[category]}</Text>
                <Text style={styles.categoryDescription}>{CATEGORY_DESCRIPTIONS[category]}</Text>
                <Text style={styles.categorySeconds}>{categorySeconds[category]}s</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen Actual</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiempo Transcurrido:</Text>
            <Text style={styles.summaryValue}>{elapsedTime}s</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Output Actual:</Text>
            <Text style={styles.summaryValue}>
              {output} {params.outputUnit}
            </Text>
          </View>
          {output > 0 && categorySeconds.CT > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>CT por Unidad:</Text>
              <Text style={styles.summaryValue}>{(categorySeconds.CT / output).toFixed(1)}s</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: CATEGORY_COLORS.CT }]}>CT:</Text>
            <Text style={[styles.summaryValue, { color: CATEGORY_COLORS.CT }]}>
              {elapsedTime > 0 ? ((categorySeconds.CT / elapsedTime) * 100).toFixed(1) : '0.0'}%
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: CATEGORY_COLORS.SSOP }]}>SSOP:</Text>
            <Text style={[styles.summaryValue, { color: CATEGORY_COLORS.SSOP }]}>
              {elapsedTime > 0 ? ((categorySeconds.SSOP / elapsedTime) * 100).toFixed(1) : '0.0'}%
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: CATEGORY_COLORS.PERDIDAS }]}>Pérdidas:</Text>
            <Text style={[styles.summaryValue, { color: CATEGORY_COLORS.PERDIDAS }]}>
              {elapsedTime > 0 ? ((categorySeconds.PERDIDAS / elapsedTime) * 100).toFixed(1) : '0.0'}%
            </Text>
          </View>
        </Card>

        <Button
          title="Guardar y Finalizar"
          onPress={() => handleFinish()}
          style={styles.finishButton}
          disabled={elapsedTime === 0 || output === 0}
        />
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
    marginBottom: 24,
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
  categoriesSection: {
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryButton: {
    padding: 20,
    borderRadius: 12,
    minHeight: 100,
  },
  categoryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  categorySeconds: {
    fontSize: 24,
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
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 12,
  },
  finishButton: {
    marginTop: 8,
  },
});
