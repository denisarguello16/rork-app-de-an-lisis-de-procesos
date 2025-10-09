import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '@/constants/colors';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export function Logo({ 
  size = 'medium', 
  showText = true, 
  variant = 'vertical' 
}: LogoProps) {
  const sizeConfig = {
    small: { icon: 24, title: 16, subtitle: 12 },
    medium: { icon: 48, title: 24, subtitle: 14 },
    large: { icon: 64, title: 32, subtitle: 16 },
  };

  const config = sizeConfig[size];

  if (!showText) {
    return (
      <View style={[styles.logoContainer, variant === 'horizontal' && styles.horizontal]}>
        <Image 
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/56uz26n2nughtdg5346yn' }}
          style={[styles.logoImage, { width: config.icon + 16, height: config.icon + 16 }]}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={[styles.logoContainer, variant === 'horizontal' && styles.horizontal]}>
      <Image 
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/56uz26n2nughtdg5346yn' }}
        style={[styles.logoImage, { width: config.icon + 32, height: config.icon + 32 }]}
        resizeMode="contain"
      />
      
      <View style={[styles.textContainer, variant === 'horizontal' && styles.textHorizontal]}>
        <Text style={[styles.subtitle, { fontSize: config.subtitle }]}>
          GERENCIA DE PRODUCCIÓN
        </Text>
        <Text style={[styles.systemTitle, { fontSize: config.subtitle - 2 }]}>
          Sistema de Análisis de Procesos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    borderRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  textHorizontal: {
    marginTop: 0,
    marginLeft: 16,
    alignItems: 'flex-start',
  },

  subtitle: {
    fontWeight: '600',
    color: Colors.light.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  systemTitle: {
    fontWeight: '500',
    color: Colors.light.primary,
    marginTop: 2,
    textAlign: 'center',
  },
});