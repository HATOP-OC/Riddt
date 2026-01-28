import { useEffect } from 'react';
import { useAuthStore } from '@/store';

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    initialize,
    loginUser,
    registerUser,
    logoutUser,
    clearError,
  } = useAuthStore();
  
  // Initialize auth on first use
  useEffect(() => {
    if (isLoading && !user) {
      initialize();
    }
  }, []);
  
  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    clearError,
  };
}
