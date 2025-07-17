'use client';

import { useAdmin } from '../hooks/useCurrentUser';

export default function AdminGuard({ children, headerOnly }) {
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

  // Nếu chỉ muốn render header
  if (headerOnly) {
    return (
      <div className="fixed top-0 left-0 w-full z-50 bg-[#1a2332] text-white shadow-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">
                {user?.role === 'super_admin' ? 'Super Admin Panel' : 'Theater Admin Panel'}
              </h1>
              <span className="text-sm text-gray-400">
                Welcome, {user?.username || 'Admin'}
                {user?.theater_chain && ` - ${user.theater_chain}`}
              </span>
            </div>
            {/* Navigation Menu */}
            <div className="flex items-center space-x-4">
              {user?.role === 'super_admin' && (
                <>
                <a 
                  href="/admin/theater-admins"
                  className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                >
                  Manage Theater Admins
                </a>
                <a 
                  href="/admin/movies"
                  className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                >
                  Manage Movies
                </a>
              </>
              )}
              {user?.role === 'theater_admin' && (
                <>
                  <a 
                    href="/admin/dashboard"
                    className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                  >
                    Dashboard
                  </a>
                </>
              )}
              {(user?.role !== 'super_admin' && user?.role !== 'theater_admin') && (
                <a 
                  href="/"
                  className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                >
                  View Site
                </a>
              )}
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
    );
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      {/* Admin Header */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#1a2332] text-white shadow-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">
                {user?.role === 'super_admin' ? 'Super Admin Panel' : 'Theater Admin Panel'}
              </h1>
              <span className="text-sm text-gray-400">
                Welcome, {user?.username || 'Admin'}
                {user?.theater_chain && ` - ${user.theater_chain}`}
              </span>
            </div>
            {/* Navigation Menu */}
            <div className="flex items-center space-x-4">
              {user?.role === 'super_admin' && (
                <>
                  <a 
                    href="/admin/theater-admins"
                    className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                  >
                    Manage Theater Admins
                  </a>
                  <a 
                    href="/admin/movies"
                    className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                  >
                    Manage Movies
                  </a>
                </>
                
              )}
              {user?.role === 'theater_admin' && (
                <>
                  <a 
                    href="/admin/dashboard"
                    className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                  >
                    Dashboard
                  </a>
                </>
              )}
              {(user?.role !== 'super_admin' && user?.role !== 'theater_admin') && (
                <a 
                  href="/"
                  className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                >
                  View Site
                </a>
              )}
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