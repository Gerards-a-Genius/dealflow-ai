'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: 'AGENT' | 'CLIENT' | 'ADMIN';
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAgent: boolean;
  isClient: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check for stored token on mount
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('dealflow_token') : null;
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, [mounted]);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await apiClient.get<User>('/api/auth/me', authToken);
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dealflow_token');
      }
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/api/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dealflow_token', newToken);
        }

        // Redirect based on role
        if (newUser.role === 'AGENT' || newUser.role === 'ADMIN') {
          router.push('/dashboard');
        } else {
          router.push('/portal');
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await apiClient.post<{ token: string; user: User }>(
        '/api/auth/register',
        data
      );

      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dealflow_token', newToken);
        }

        // Redirect to dashboard for agents
        router.push('/dashboard');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dealflow_token');
    }
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    loading: !mounted || loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAgent: user?.role === 'AGENT' || user?.role === 'ADMIN',
    isClient: user?.role === 'CLIENT',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
