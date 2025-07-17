'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Tạo context để chia sẻ trạng thái admin
const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const router = useRouter();

  const checkAdminStatus = async () => {
    if (hasChecked && isAdmin) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/auth/check-admin', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.isAdmin) {
        setIsAdmin(true);
        setUser(data.user);
        setLoading(false);
        setHasChecked(true);
        
        // Redirect theo role
        const currentPath = window.location.pathname;
        if (window.location.pathname.startsWith('/admin')) {
          if (data.user.role === 'super_admin') {
            // Chỉ cho phép super_admin truy cập /admin/theater-admins và /admin/movies
            if (
              currentPath !== '/admin/theater-admins' &&
              !currentPath.startsWith('/admin/theater-admins') &&
              currentPath !== '/admin/movies' &&
              !currentPath.startsWith('/admin/movies')
            ) {
              router.push('/admin/theater-admins');
            }
          } else if (data.user.role === 'theater_admin') {
            // Theater admin nên ở trang quản lý theater
            if (currentPath === '/admin' || currentPath.startsWith('/admin/theater-admins')) {
              router.push('/admin/theater');
            }
          }
        }
      } else {
        setIsAdmin(false);
        setUser(null);
        setLoading(false);
        setHasChecked(true);
        if (window.location.pathname.startsWith('/admin')) {
          router.push('/auth/login?redirect=/admin');
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setUser(null);
      setLoading(false);
      setHasChecked(true);
      if (window.location.pathname.startsWith('/admin')) {
        router.push('/auth/login?redirect=/admin');
      }
    }
  };

  const logout = () => {
    // Xóa localStorage và sessionStorage
    if (typeof window !== 'undefined') {
      let role = null;
      if (user && user.role) {
        role = user.role;
      } else {
        let userData = null;
        try {
          userData = JSON.parse(localStorage.getItem('user'));
        } catch {}
        role = userData?.role;
      }
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      if (role === 'super_admin' || role === 'theater_admin') {
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
    <AdminContext.Provider value={{ isAdmin, user, loading, logout }}>
      {children}
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

// Hook cho user thông thường (không cần AdminProvider context)
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/auth/check-auth', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.isAuthenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
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