import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { colors, borderRadius, spacing } from '@/theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'default',
  size = 'md',
  loading = false,
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_size_${size}`],
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'default' ? colors.primaryForeground : colors.primary} 
        />
      ) : (
        typeof children === 'string' ? (
          <Text style={textStyles}>{children}</Text>
        ) : (
          children
        )
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  
  // Variants
  default: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.muted,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.destructive,
  },
  
  // Sizes
  size_sm: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    minHeight: 32,
  },
  size_md: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    minHeight: 40,
  },
  size_lg: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    minHeight: 48,
  },
  
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  text_default: {
    color: colors.primaryForeground,
  },
  text_secondary: {
    color: colors.foreground,
  },
  text_outline: {
    color: colors.foreground,
  },
  text_ghost: {
    color: colors.foreground,
  },
  text_destructive: {
    color: colors.destructiveForeground,
  },
  text_size_sm: {
    fontSize: 13,
  },
  text_size_md: {
    fontSize: 14,
  },
  text_size_lg: {
    fontSize: 16,
  },
  textDisabled: {
    opacity: 0.7,
  },
});
