import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types';
import { getCurrentUser, login, logout, register, LoginCredentials } from '@/api/auth';
import type { InsertUser } from '@/types';

interface AuthState {
  user: Omit<User, 'password'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  loginUser: (credentials: LoginCredentials) => Promise<void>;
  registerUser: (userData: InsertUser) => Promise<void>;
  logoutUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = await getCurrentUser();
      set({ 
        user,
        isAuthenticated: !!user,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize auth'
      });
    }
  },
  
  loginUser: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await login(credentials);
      // Store token if returned (session-based auth may not return token)
      set({ 
        user: response.user,
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },
  
  registerUser: async (userData: InsertUser) => {
    try {
      set({ isLoading: true, error: null });
      const response = await register(userData);
      set({ 
        user: response.user,
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },
  
  logoutUser: async () => {
    try {
      set({ isLoading: true, error: null });
      await logout();
      await SecureStore.deleteItemAsync('authToken');
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false 
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      await SecureStore.deleteItemAsync('authToken');
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
}));
