import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";


import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ProductionProvider } from "@/store/production-store";
import { syncService } from "@/services/sync-service";
import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Atrás" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
    const initializeApp = async () => {
      try {

        await SplashScreen.hideAsync();
        
        console.log('🚀 Initializing automatic sync service...');
        await syncService.startAutoSync();
      } catch (error) {
        console.error('❌ Error during app initialization:', error);
        try {
          await SplashScreen.hideAsync();
        } catch (splashError) {
          console.error('❌ Error hiding splash screen:', splashError);
        }
      }
    };
    
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ProductionProvider>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </ProductionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}