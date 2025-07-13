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
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      window.location.href = '/';
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