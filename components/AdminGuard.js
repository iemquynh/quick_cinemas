'use client';

import { useAdmin } from '../hooks/useCurrentUser';

export default function AdminGuard({ children }) {
  const { isAdmin, user, loading, logout } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Checking admin access...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Sẽ redirect trong AdminProvider
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      {/* Admin Header */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#1a2332] text-white shadow-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <span className="text-sm text-gray-400">
                Welcome, {user?.username || 'Admin'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <a 
                href="/profile"
                className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
              >
                Profile
              </a>
              <a 
                href="/"
                className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
              >
                View Site
              </a>
              <button
                onClick={logout}
                className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Admin Content */}
      {children}
    </div>
  );
} 