import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, fontSizes, shadows } from '@/theme';
import { useThemeStore } from '@/store';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: IoniconsName;
  rightIcon?: IoniconsName;
  onRightIconPress?: () => void;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerStyle, style, leftIcon, rightIcon, onRightIconPress, onFocus, onBlur, ...props }, ref) => {
    const { theme } = useThemeStore();
    const [isFocused, setIsFocused] = useState(false);
    
    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };
    
    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };
    
    const getBorderColor = () => {
      if (error) return colors.destructive;
      if (isFocused) return colors.primary;
      return theme.colors.border;
    };
    
    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: theme.colors.foreground }]}>
            {label}
          </Text>
        )}
        <View 
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.muted,
              borderColor: getBorderColor(),
            },
            isFocused && styles.inputWrapperFocused,
            isFocused && { borderColor: colors.primary },
            error && styles.inputWrapperError,
          ]}
        >
          {leftIcon && (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={leftIcon} 
                size={20} 
                color={isFocused ? colors.primary : theme.colors.mutedForeground} 
              />
            </View>
          )}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: theme.colors.foreground,
              },
              leftIcon && styles.inputWithLeftIcon,
              rightIcon && styles.inputWithRightIcon,
              style,
            ]}
            placeholderTextColor={theme.colors.mutedForeground}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {rightIcon && (
            <View 
              style={styles.rightIconContainer}
              onTouchEnd={onRightIconPress}
            >
              <Ionicons 
                name={rightIcon} 
                size={20} 
                color={theme.colors.mutedForeground} 
              />
            </View>
          )}
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color={colors.destructive} />
            <Text style={styles.error}>{error}</Text>
          </View>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginBottom: spacing[2],
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minHeight: 52,
  },
  inputWrapperFocused: {
    ...shadows.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
  },
  inputWrapperError: {
    borderColor: colors.destructive,
  },
  iconContainer: {
    paddingLeft: spacing[4],
    paddingRight: spacing[1],
  },
  rightIconContainer: {
    paddingRight: spacing[4],
    paddingLeft: spacing[1],
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: fontSizes.base,
    fontWeight: '500',
  },
  inputWithLeftIcon: {
    paddingLeft: spacing[2],
  },
  inputWithRightIcon: {
    paddingRight: spacing[2],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1.5],
    gap: spacing[1],
  },
  error: {
    color: colors.destructive,
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
});
