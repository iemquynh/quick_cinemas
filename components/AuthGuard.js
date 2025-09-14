'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuthStatus = useCallback (async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/auth/check-auth', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Nếu có user (admin hoặc user thường)
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        // Nếu không có user, redirect về login
        const currentPath = window.location.pathname;
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Sẽ redirect trong useEffect
  }

  return (
    <div>
      {/* User Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Welcome, {user?.username || 'User'}
              </span>
              {user?.role && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href={user?.role === 'super_admin' ? '/admin/theater-admins' : '/'}
                className="text-gray-300 hover:text-white text-sm"
              >
                Home
              </Link>
              <button
                onClick={() => {
                  // Xóa localStorage và redirect
                  localStorage.removeItem('auth-token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="text-gray-300 hover:text-white text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Content */}
      {children}
    </div>
  );
} 