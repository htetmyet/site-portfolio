import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminAccountPage from './pages/admin/AdminAccountPage';
import AdminPostsListPage from './pages/admin/AdminPostsListPage';
import AdminPostDetailPage from './pages/admin/AdminPostDetailPage';
import AdminProductsListPage from './pages/admin/AdminProductsListPage';
import AdminProductDetailPage from './pages/admin/AdminProductDetailPage';
import AdminUsersListPage from './pages/admin/AdminUsersListPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminSettingsPage />} />
        <Route path="account" element={<AdminAccountPage />} />
        <Route path="posts" element={<AdminPostsListPage />} />
        <Route path="posts/new" element={<AdminPostDetailPage />} />
        <Route path="posts/:id" element={<AdminPostDetailPage />} />
        <Route path="products" element={<AdminProductsListPage />} />
        <Route path="products/new" element={<AdminProductDetailPage />} />
        <Route path="products/:id" element={<AdminProductDetailPage />} />
        <Route path="users" element={<AdminUsersListPage />} />
        <Route path="users/new" element={<AdminUserDetailPage />} />
        <Route path="users/:id" element={<AdminUserDetailPage />} />
      </Route>
      <Route path="/blog" element={<BlogListPage />} />
      <Route path="/blog/:id" element={<BlogDetailPage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
