const TOKEN_KEY = 'adminToken';
const ADMIN_KEY = 'adminMeta';

const canUseStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const storeAuthToken = (token: string) => {
  if (!canUseStorage) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  if (!canUseStorage) return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = () => {
  if (!canUseStorage) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
};

export const storeAdminMeta = (admin: { id: number; email: string; name: string }) => {
  if (!canUseStorage) return;
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

export const getAdminMeta = (): { id: number; email: string; name: string } | null => {
  if (!canUseStorage) return null;
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse admin metadata', error);
    return null;
  }
};
