import apiClient from './client';
import type { User, InsertUser } from '@/types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
}

// Get current authenticated user
export const getCurrentUser = async (): Promise<Omit<User, 'password'> | null> => {
  try {
    const response = await apiClient.get<Omit<User, 'password'>>('/api/user');
    return response.data;
  } catch (error) {
    return null;
  }
};

// Login user
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/login', credentials);
  return response.data;
};

// Register new user
export const register = async (userData: InsertUser): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/register', userData);
  return response.data;
};

// Logout user
export const logout = async (): Promise<void> => {
  await apiClient.post('/api/logout');
};
