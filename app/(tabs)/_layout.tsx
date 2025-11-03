import { Tabs } from "expo-router";
import { Factory, BarChart3, ClipboardList, BookOpen, Clock, AlertTriangle, Timer, Activity } from "lucide-react-native";
import React from "react";

import { Colors } from "@/constants/colors";

function RootLayoutNav() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopColor: Colors.light.border,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTintColor: Colors.light.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Factory color={color} />,
        }}
      />
      <Tabs.Screen
        name="capacity-records"
        options={{
          title: "Capacidad",
          tabBarIcon: ({ color }) => <BarChart3 color={color} />,
        }}
      />
      <Tabs.Screen
        name="utilization-records"
        options={{
          title: "Utilización",
          tabBarIcon: ({ color }) => <ClipboardList color={color} />,
        }}
      />
      <Tabs.Screen
        name="product-catalog"
        options={{
          title: "Catálogo",
          tabBarIcon: ({ color }) => <BookOpen color={color} />,
        }}
      />

      <Tabs.Screen
        name="setup-records"
        options={{
          title: "Setup y Paros",
          tabBarIcon: ({ color }) => <Clock color={color} />,
        }}
      />
      <Tabs.Screen
        name="rejection-summary"
        options={{
          title: "Resumen Rechazos",
          tabBarIcon: ({ color }) => <AlertTriangle color={color} />,
        }}
      />
      <Tabs.Screen
        name="cycle-time-records"
        options={{
          title: "Tiempos de Ciclo",
          tabBarIcon: ({ color }) => <Timer color={color} />,
        }}
      />
      <Tabs.Screen
        name="utilization-5min-records"
        options={{
          title: "Ventanas 5'",
          tabBarIcon: ({ color }) => <Activity color={color} />,
        }}
      />

    </Tabs>
  );
}

export default function TabLayout() {
  return <RootLayoutNav />;
}