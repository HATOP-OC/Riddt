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
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore, useAuthStore } from '@/store';
import { handleApiError } from '@/api';
import type { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { theme } = useThemeStore();
  const { loginUser, isLoading, error, clearError } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setLocalError('Please enter both username and password');
      return;
    }
    
    try {
      clearError();
      setLocalError('');
      await loginUser({ username: username.trim(), password });
    } catch (err) {
      setLocalError(handleApiError(err));
    }
  };
  
  const goToRegister = () => {
    navigation.navigate('Register');
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
            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Ionicons name="chatbubbles" size={48} color={colors.primaryForeground} />
            </View>
            <Text style={[styles.appName, { color: theme.colors.foreground }]}>
              Riddt
            </Text>
            <Text style={[styles.tagline, { color: theme.colors.mutedForeground }]}>
              Join the conversation
            </Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.title, { color: theme.colors.foreground }]}>
              Log In
            </Text>
            
            {(localError || error) && (
              <View style={[styles.errorContainer, { backgroundColor: colors.destructive + '20' }]}>
                <Ionicons name="alert-circle" size={20} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {localError || error}
                </Text>
              </View>
            )}
            
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.passwordContainer}>
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
            
            <Button
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            >
              Log In
            </Button>
            
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.mutedForeground }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={goToRegister}>
                <Text style={[styles.link, { color: colors.primary }]}>
                  Sign Up
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
    padding: spacing[6],
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: spacing[1],
  },
  tagline: {
    fontSize: fontSizes.md,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
  },
  errorText: {
    flex: 1,
    marginLeft: spacing[2],
    fontSize: fontSizes.sm,
  },
  passwordContainer: {
    position: 'relative',
  },
  showPasswordButton: {
    position: 'absolute',
    right: spacing[3],
    top: 36,
    padding: spacing[2],
  },
  submitButton: {
    marginTop: spacing[2],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  footerText: {
    fontSize: fontSizes.base,
  },
  link: {
    fontSize: fontSizes.base,
    fontWeight: '600',
  },
});
