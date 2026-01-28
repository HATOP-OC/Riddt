import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Button, Input } from '@/components/ui';
import { colors, spacing, fontSizes, borderRadius, shadows } from '@/theme';
import { useThemeStore, useAuthStore } from '@/store';
import { handleApiError } from '@/api';
import type { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { theme } = useThemeStore();
  const { registerUser, isLoading, error, clearError } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const handleRegister = async () => {
    if (!username.trim()) {
      setLocalError('Username is required');
      return;
    }
    
    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters');
      return;
    }
    
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    try {
      clearError();
      setLocalError('');
      await registerUser({ username: username.trim(), password });
    } catch (err) {
      setLocalError(handleApiError(err));
    }
  };
  
  const goToLogin = () => {
    navigation.navigate('Login');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logo, shadows.lg]}>
              <View style={styles.logoInner}>
                <Ionicons name="chatbubbles" size={48} color={colors.primaryForeground} />
              </View>
            </View>
            <Text style={[styles.appName, { color: theme.colors.foreground }]}>
              Riddt
            </Text>
            <Text style={[styles.tagline, { color: theme.colors.mutedForeground }]}>
              Join the community
            </Text>
          </View>
          
          {/* Form */}
          <View style={[styles.form, { backgroundColor: theme.colors.card }, shadows.md]}>
            <Text style={[styles.title, { color: theme.colors.foreground }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
              Sign up to get started
            </Text>
            
            {(localError || error) && (
              <View style={[styles.errorContainer, { backgroundColor: colors.destructive + '15' }]}>
                <Ionicons name="alert-circle" size={20} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {localError || error}
                </Text>
              </View>
            )}
            
            <Input
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="person-outline"
            />
            
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />
            
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              leftIcon="shield-checkmark-outline"
            />
            
            <Button
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            >
              Create Account
            </Button>
            
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.mutedForeground }]}>
                or
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>
            
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.mutedForeground }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={goToLogin}>
                <Text style={[styles.link, { color: colors.primary }]}>
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[5],
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 30,
    marginBottom: spacing[4],
    backgroundColor: colors.primary,
    padding: 5,
  },
  logoInner: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: spacing[1],
    letterSpacing: -1,
  },
  tagline: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: borderRadius.xl,
    padding: spacing[6],
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    marginBottom: spacing[1],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.base,
    marginBottom: spacing[5],
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.destructive + '30',
  },
  errorText: {
    flex: 1,
    marginLeft: spacing[2],
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: spacing[2],
    height: 52,
    borderRadius: borderRadius.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[5],
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing[4],
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: fontSizes.base,
  },
  link: {
    fontSize: fontSizes.base,
    fontWeight: '700',
  },
});
