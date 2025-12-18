import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ProductionProvider } from "@/store/production-store";
import { syncService } from "@/services/sync-service";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Atrás" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="macro-module-selection" 
        options={{ 
          title: "Selección de Área",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="module-selection" 
        options={{ 
          title: "Selección de Módulo",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="wip-form" 
        options={{ 
          title: "Registro de WIP",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="setup-time-form" 
        options={{ 
          title: "Registro de Tiempo de Setup",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="capacity-form" 
        options={{ 
          title: "Registro de Capacidad",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="utilization-form" 
        options={{ 
          title: "Registro de Utilización",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="rejection-form" 
        options={{ 
          title: "Registro de Rechazos",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="utilization-5min-config" 
        options={{ 
          title: "Configuración de Productividad",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="utilization-5min-timer" 
        options={{ 
          title: "Monitor de Productividad",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="cycle-time-form" 
        options={{ 
          title: "Registro de Tiempo de Ciclo",
          presentation: "card"
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    // Initialize automatic sync service with delay to avoid startup issues
    const timer = setTimeout(() => {
      console.log('🚀 Initializing automatic sync service...');
      syncService.startAutoSync().catch(error => {
        console.log('⚠️ Auto-sync initialization skipped:', error);
      });
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      syncService.stopAutoSync();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ProductionProvider>
        <GestureHandlerRootView style={styles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </ProductionProvider>
    </QueryClientProvider>
  );
}