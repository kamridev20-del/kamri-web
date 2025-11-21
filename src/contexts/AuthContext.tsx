'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser l'auth au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          console.log('🔑 [AuthProvider] Token trouvé, récupération du profil...');
          setToken(storedToken);
          apiClient.setToken(storedToken); // ✅ Mettre à jour l'ApiClient
          
          // Récupérer le profil utilisateur
          const response = await fetch('http://localhost:3001/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const responseData = await response.json();
            const userData = responseData.data || responseData;
            setUser(userData);
            console.log('✅ [AuthProvider] Utilisateur connecté:', userData.email);
          } else {
            console.log('❌ [AuthProvider] Token invalide, déconnexion...');
            localStorage.removeItem('auth_token');
            setToken(null);
            apiClient.setToken(null); // ✅ Mettre à jour l'ApiClient
          }
        } else {
          console.log('ℹ️ [AuthProvider] Aucun token trouvé');
        }
      } catch (error) {
        console.error('❌ [AuthProvider] Erreur lors de l\'initialisation:', error);
        localStorage.removeItem('auth_token');
        setToken(null);
        apiClient.setToken(null); // ✅ Mettre à jour l'ApiClient
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔑 [AuthProvider] Tentative de connexion pour:', email);
      setIsLoading(true);

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ [AuthProvider] Connexion réussie:', data.user.email);
        
        // Stocker le token
        localStorage.setItem('auth_token', data.access_token);
        setToken(data.access_token);
        apiClient.setToken(data.access_token); // ✅ Mettre à jour l'ApiClient
        setUser(data.user);
        
        return { success: true };
      } else {
        console.log('❌ [AuthProvider] Erreur de connexion:', data.message);
        return { success: false, error: data.message || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('❌ [AuthProvider] Erreur réseau:', error);
      return { success: false, error: 'Erreur réseau' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🚪 [AuthProvider] Déconnexion...');
    localStorage.removeItem('auth_token');
    setToken(null);
    apiClient.setToken(null); // ✅ Mettre à jour l'ApiClient
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('👤 [AuthProvider] Mise à jour du profil:', data);
      
      const response = await fetch('http://localhost:3001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('✅ [AuthProvider] Profil mis à jour:', responseData.data);
        setUser(responseData.data);
        return { success: true };
      } else {
        console.log('❌ [AuthProvider] Erreur de mise à jour:', responseData.message);
        return { success: false, error: responseData.message || 'Erreur de mise à jour' };
      }
    } catch (error) {
      console.error('❌ [AuthProvider] Erreur réseau:', error);
      return { success: false, error: 'Erreur réseau' };
    }
  }, [token]);

  const isAuthenticated = useMemo(() => !!user && !!token, [user, token]);

  const value: AuthContextType = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
  }), [user, token, isAuthenticated, isLoading, login, logout, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};