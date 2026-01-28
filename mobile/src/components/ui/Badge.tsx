import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, fontSizes } from '@/theme';
import { useThemeStore } from '@/store';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const { theme } = useThemeStore();
  
  const variantStyles = {
    default: {
      backgroundColor: colors.primary,
      textColor: colors.primaryForeground,
    },
    secondary: {
      backgroundColor: theme.colors.muted,
      textColor: theme.colors.foreground,
    },
    destructive: {
      backgroundColor: colors.destructive,
      textColor: colors.destructiveForeground,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
      textColor: theme.colors.foreground,
    },
  };
  
  const variantStyle = variantStyles[variant];
  
  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: variantStyle.backgroundColor,
          borderColor: (variantStyle as any).borderColor,
          borderWidth: (variantStyle as any).borderWidth || 0,
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: variantStyle.textColor }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
});
