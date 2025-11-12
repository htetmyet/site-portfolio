import type { HeroSlide, Post, Product, Service, SiteContent, SiteSettings, AdminUser } from '../types';
import { getAuthToken } from './authStorage';

const normalizeBaseUrl = (value: string) => (value.endsWith('/') ? value.slice(0, -1) : value);

const resolveBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    if (envBaseUrl.startsWith('/')) {
      return normalizeBaseUrl(envBaseUrl);
    }
    if (typeof window !== 'undefined') {
      try {
        const candidate = new URL(envBaseUrl, window.location.origin);
        return normalizeBaseUrl(candidate.toString());
      } catch (error) {
        console.warn('[apiClient] invalid VITE_API_BASE_URL; falling back to relative /api', error);
        return '/api';
      }
    }
    return normalizeBaseUrl(envBaseUrl);
  }
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://localhost:9000/api';
};

const API_BASE_URL = resolveBaseUrl();

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      throw new Error(data.message || 'Request failed');
    }
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const authToken = token ?? getAuthToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(response);
};

export const login = async (email: string, password: string) => {
  return request<{ token: string; admin: { id: number; email: string; name: string } }>('/auth/login', {
    method: 'POST',
    body: { email, password },
    token: null,
  });
};

export const fetchSettings = async (): Promise<{ settings: SiteSettings; heroSlides: HeroSlide[] }> => {
  return request('/settings');
};

export const updateGeneralSettings = async (settings: SiteSettings): Promise<SiteSettings> => {
  const response = await request<{ settings: SiteSettings }>('/settings/general', {
    method: 'PUT',
    body: settings,
  });
  return response.settings;
};

export const updateHeroSlides = async (heroSlides: HeroSlide[]) => {
  return request<{ heroSlides: HeroSlide[] }>('/settings/hero', {
    method: 'PUT',
    body: { heroSlides },
  });
};

export const fetchServices = async (): Promise<Service[]> => {
  return request('/services');
};

export const createService = async (service: Service): Promise<Service> => {
  return request('/services', { method: 'POST', body: service });
};

export const updateService = async (id: number, service: Service): Promise<Service> => {
  return request(`/services/${id}`, { method: 'PUT', body: service });
};

export const deleteService = async (id: number): Promise<void> => {
  return request(`/services/${id}`, { method: 'DELETE' });
};

export const fetchProducts = async (): Promise<Product[]> => {
  return request('/products');
};

export const createProduct = async (product: Product): Promise<Product> => {
  return request('/products', { method: 'POST', body: product });
};

export const updateProduct = async (id: number, product: Product): Promise<Product> => {
  return request(`/products/${id}`, { method: 'PUT', body: product });
};

export const deleteProduct = async (id: number): Promise<void> => {
  return request(`/products/${id}`, { method: 'DELETE' });
};

export const fetchProduct = async (id: number): Promise<Product> => {
  return request(`/products/${id}`);
};

export const fetchPosts = async (): Promise<Post[]> => {
  return request('/posts');
};

export const fetchPost = async (id: number): Promise<Post> => {
  return request(`/posts/${id}`);
};

export const createPost = async (post: Post): Promise<Post> => {
  return request('/posts', { method: 'POST', body: post });
};

export const updatePost = async (id: number, post: Post): Promise<Post> => {
  return request(`/posts/${id}`, { method: 'PUT', body: post });
};

export const deletePost = async (id: number): Promise<void> => {
  return request(`/posts/${id}`, { method: 'DELETE' });
};

export const fetchCurrentAdmin = async (): Promise<AdminUser> => {
  return request('/admin/users/me');
};

export const updateCurrentAdmin = async (payload: { email: string; name: string }): Promise<AdminUser> => {
  return request('/admin/users/me', { method: 'PUT', body: payload });
};

export const updateCurrentAdminPassword = async (payload: { currentPassword: string; newPassword: string }) => {
  return request<{ message: string }>('/admin/users/me/password', { method: 'PUT', body: payload });
};

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  return request('/admin/users');
};

export const fetchAdminUser = async (id: number): Promise<AdminUser> => {
  return request(`/admin/users/${id}`);
};

export const createAdminUser = async (payload: { email: string; name: string; password: string }): Promise<AdminUser> => {
  return request('/admin/users', { method: 'POST', body: payload });
};

export const updateAdminUser = async (id: number, payload: { email: string; name: string; password?: string }): Promise<AdminUser> => {
  return request(`/admin/users/${id}`, { method: 'PUT', body: payload });
};

export const deleteAdminUser = async (id: number): Promise<void> => {
  return request(`/admin/users/${id}`, { method: 'DELETE' });
};

export const fetchSiteContent = async (): Promise<SiteContent> => {
  const [settings, services, products, posts] = await Promise.all([
    fetchSettings(),
    fetchServices(),
    fetchProducts(),
    fetchPosts(),
  ]);

  return {
    settings: settings.settings,
    heroSlides: settings.heroSlides,
    services,
    products,
    posts,
  };
};

export const sendContactMessage = async (payload: { name: string; email: string; message: string }) => {
  return request<{ message: string }>('/contact', {
    method: 'POST',
    body: payload,
    token: null,
  });
};
