import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, fontSizes } from '@/theme';
import { useThemeStore } from '@/store';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  imageUrl?: string;
  style?: ViewStyle;
}

export function Avatar({ size = 'md', name, imageUrl, style }: AvatarProps) {
  const { theme } = useThemeStore();
  
  const sizeStyles = {
    sm: { width: 24, height: 24, fontSize: 10 },
    md: { width: 32, height: 32, fontSize: 12 },
    lg: { width: 40, height: 40, fontSize: 16 },
    xl: { width: 64, height: 64, fontSize: 24 },
  };
  
  const { width, height, fontSize } = sizeStyles[size];
  
  // Get initials from name
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius: width / 2,
          backgroundColor: colors.primary,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize, color: colors.primaryForeground }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '600',
  },
});
