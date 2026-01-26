import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '@/theme';
import { useThemeStore } from '@/store';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { theme } = useThemeStore();
  
  return (
    <View
      style={[
        styles.base,
        variant === 'default' && shadows.sm,
        { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        variant === 'outlined' && styles.outlined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  const { theme } = useThemeStore();
  
  return (
    <View 
      style={[
        styles.footer, 
        { borderTopColor: theme.colors.border },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  outlined: {
    borderWidth: 1,
  },
  header: {
    padding: spacing[4],
    paddingBottom: spacing[2],
  },
  content: {
    padding: spacing[4],
    paddingTop: 0,
  },
  footer: {
    padding: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
