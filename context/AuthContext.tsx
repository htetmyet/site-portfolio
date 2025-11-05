import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AdminUser } from '../types';
import { login as apiLogin, fetchCurrentAdmin } from '../services/apiClient';
import { clearAuthToken, getAdminMeta, getAuthToken, storeAdminMeta, storeAuthToken } from '../services/authStorage';

interface AuthContextValue {
  admin: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAdmin: () => Promise<void>;
  setAdminMeta: (admin: AdminUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const stored = getAdminMeta();
    return stored ? stored : null;
  });

  const setAdminMeta = useCallback((adminInfo: AdminUser) => {
    storeAdminMeta(adminInfo);
    setAdmin(adminInfo);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: authToken, admin: adminInfo } = await apiLogin(email, password);
    storeAuthToken(authToken);
    setAdminMeta(adminInfo);
    setToken(authToken);
  }, [setAdminMeta]);

  const logout = useCallback(() => {
    clearAuthToken();
    setToken(null);
    setAdmin(null);
  }, []);

  const refreshAdmin = useCallback(async () => {
    try {
      const me = await fetchCurrentAdmin();
      setAdminMeta(me);
    } catch (error) {
      console.error('[auth] Failed to refresh admin metadata', error);
    }
  }, [setAdminMeta]);

  const value = useMemo(
    () => ({ admin, token, login, logout, refreshAdmin, setAdminMeta }),
    [admin, token, login, logout, refreshAdmin, setAdminMeta],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
