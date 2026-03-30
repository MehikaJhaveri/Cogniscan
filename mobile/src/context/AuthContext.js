import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (e) {
      console.log('Failed to load auth:', e);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, fullName, role) => {
    try {
      const res = await authAPI.signup({ email, password, full_name: fullName, role });
      const data = res.data;
      const userData = {
        id: data.user_id,
        fullName: data.full_name,
        role: data.role,
        email,
        baselineCompleted: data.baseline_completed,
      };
      await storage.setToken(data.access_token);
      await storage.setUser(userData);
      setToken(data.access_token);
      setUser(userData);
      return { success: true, data: userData };
    } catch (e) {
      const msg = e.response?.data?.detail || 'Signup failed';
      return { success: false, error: msg };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const data = res.data;
      const userData = {
        id: data.user_id,
        fullName: data.full_name,
        role: data.role,
        email,
        baselineCompleted: data.baseline_completed,
      };
      await storage.setToken(data.access_token);
      await storage.setUser(userData);
      setToken(data.access_token);
      setUser(userData);
      return { success: true, data: userData };
    } catch (e) {
      const msg = e.response?.data?.detail || 'Login failed';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    await storage.clearAll();
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updates) => {
    const updated = { ...user, ...updates };
    await storage.setUser(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isPatient: user?.role === 'patient',
        isCaregiver: user?.role === 'caregiver',
        signup,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
