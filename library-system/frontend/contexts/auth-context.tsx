"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, apiClient } from '@/lib/api';
import { LoginRequest, RegisterRequest, ForgotPasswordRequest, UserProfile } from '@/lib/api';
import { usersAPI } from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  forgotPassword: (email: ForgotPasswordRequest) => Promise<boolean>;
  logout: (shouldRedirect?: boolean) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        // Try to get user profile to verify token is still valid
        const response = await usersAPI.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Token is invalid, clear it
          await logout(false); // Không redirect khi check auth
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout(false); // Không redirect khi check auth
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        // Set token in apiClient
        apiClient.setToken(response.data.access_token);
        
        // Get user profile after successful login
        const profileResponse = await usersAPI.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
          
          // Auto redirect based on role
          if (profileResponse.data.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      return response.success;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: ForgotPasswordRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.forgotPassword(email);
      return response.success;
    } catch (error) {
      console.error('Forgot password failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (shouldRedirect: boolean = true) => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      if (shouldRedirect) {
        router.push('/login');
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    forgotPassword,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to get user profile
export function useUserProfile() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}

// Hook to check if user is admin
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === 'admin';
}

// Hook to require authentication
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

// Hook to require admin role
export function useRequireAdmin() {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  return { isAuthenticated, isAdmin, isLoading };
}
