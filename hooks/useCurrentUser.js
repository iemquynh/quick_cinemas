'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false); // thêm dòng này


  const checkAdminStatus = async () => {
    const path = window.location.pathname;

    // ✅ Ưu tiên dùng cache nếu có
    const cached = sessionStorage.getItem('admin-status');
    if (cached) {
      const parsed = JSON.parse(cached);
      setIsAdmin(parsed.isAdmin);
      setUser(parsed.user);
      setLoading(false);
      setHasChecked(true);
      redirectByRole(parsed.user, path);
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('No token');

      const res = await fetch('/api/auth/check-admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.isAdmin) {
        setIsAdmin(true);
        setUser(data.user);
        sessionStorage.setItem('admin-status', JSON.stringify({ isAdmin: true, user: data.user }));
        redirectByRole(data.user, path);
      } else {
        handleUnauthorized(path);
      }
    } catch (error) {
      // console.error('Error checking admin status:', error);
      handleUnauthorized(path);
    } finally {
      setLoading(false);
      setHasChecked(true)
    }
  };

  const redirectByRole = (user, currentPath) => {
    if (!currentPath.startsWith('/admin')) {
      return;
    }
    
    if (user.role === 'super_admin') {
      if (
        currentPath === '/admin' ||
        !currentPath.startsWith('/admin/theater-admins') &&
        !currentPath.startsWith('/admin/movies')
      ) {
        router.replace('/admin/theater-admins');
      }
    } else if (user.role === 'theater_admin') {
      if (
        currentPath === '/' ||
        currentPath === '/admin' ||
        currentPath.startsWith('/auth') ||
        currentPath.startsWith('/admin/theater-admins') ||
        currentPath.startsWith('/admin/movies')
      ) {
        router.replace('/admin/dashboard');
      }
    }
  };

  const handleUnauthorized = (path) => {
    setIsAdmin(false);
    setUser(null);
    sessionStorage.removeItem('admin-status');
    if (path.startsWith('/admin')) {
      router.replace('/auth/login?redirect=/admin');
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('admin-status');

      if (user?.role === 'super_admin' || user?.role === 'theater_admin') {
        window.location.href = '/auth/login';
      } else {
        window.location.href = '/';
      }
    }
  };

  useEffect(() => {
    checkAdminStatus();
    if (typeof window !== 'undefined') {
      window.adminLogout = logout;
    }
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, user, loading, logout, hasChecked }}>
      {!loading && children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

// ✅ Dành cho user thường
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const res = await fetch('/api/auth/check-auth', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data.success ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, refreshUser: fetchUser };
}
