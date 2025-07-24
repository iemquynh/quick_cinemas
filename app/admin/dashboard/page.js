"use client";
import { useEffect, useState } from 'react';
import TheaterAdminGuard from '@/components/TheaterAdminGuard';
import { useAdmin } from '@/hooks/useCurrentUser';
import AdminGuard from '@/components/AdminGuard';

export default function TheaterAdminPage() {
  console.log('TheaterAdminPage loaded');
  const { user, loading, logout } = useAdmin();
  const [stats, setStats] = useState({
    movies: 0,
    showtimes: 0,
    theaters: 0
  });

  useEffect(() => {
    if (user) {
      fetchAllMoviesStats(); // chỉ lấy số lượng movies
      fetchStats(); // chỉ lấy showtimes và theaters đã lọc
    }
  }, [user]);

  const fetchAllMoviesStats = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const moviesRes = await fetch('/api/movies', { headers: { Authorization: `Bearer ${token}` } });
      const moviesData = await moviesRes.json();
      console.log('moviesData', moviesData);
      setStats(prev => ({
        ...prev,
        movies: Array.isArray(moviesData) ? moviesData.length : 0
      }));
    } catch (error) {
      console.error('Error fetching all movies stats:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const [showtimesRes, theatersRes] = await Promise.all([
        fetch('/api/showtimes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/theaters', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const showtimesData = await showtimesRes.json();
      const theatersData = await theatersRes.json();

      const adminChain = (user?.theater_chain || '').split(' ')[0]?.toLowerCase();

      // Lọc showtimes
      const filteredShowtimes = Array.isArray(showtimesData)
        ? showtimesData.filter(st => {
            const theaterName = st.theater_id?.name || '';
            const theaterChain = theaterName.split(' ')[0]?.toLowerCase();
            return theaterChain === adminChain;
          })
        : [];

      // Lọc theaters
      const filteredTheaters = Array.isArray(theatersData)
        ? theatersData.filter(theater => {
            const chain = (theater.name || '').split(' ')[0]?.toLowerCase();
            return chain === adminChain;
          })
        : [];

      setStats(prev => ({
        ...prev,
        showtimes: filteredShowtimes.length,
        theaters: filteredTheaters.length
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSuperAdminStats = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const [moviesRes, showtimesRes, theatersRes] = await Promise.all([
        fetch('/api/movies', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/showtimes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/theaters', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const moviesData = await moviesRes.json();
      const showtimesData = await showtimesRes.json();
      const theatersData = await theatersRes.json();
      setStats({
        movies: Array.isArray(moviesData.data) ? moviesData.data.length : 0,
        showtimes: Array.isArray(showtimesData) ? showtimesData.length : 0,
        theaters: Array.isArray(theatersData) ? theatersData.length : 0
      });
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
    }
  };

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

  return (
    <>
      <AdminGuard>
      <TheaterAdminGuard>
        <div className="container mx-auto py-8" style={{marginTop: 55}}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {user?.role === 'super_admin' ? 'Super Admin Dashboard' : 'Theater Admin Dashboard'}
            </h1>
            <p className="text-gray-300">
              Welcome, {user?.username} {user?.role === 'theater_admin' && `- Managing ${user?.theater_id?.name || 'your theater'}`}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-base-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Movies</h3>
              <p className="text-3xl font-bold text-blue-400">{stats.movies}</p>
              <p className="text-gray-400 text-sm">Total movies</p>
            </div>
            <div className="bg-base-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Showtimes</h3>
              <p className="text-3xl font-bold text-green-400">{stats.showtimes}</p>
              <p className="text-gray-400 text-sm">Active showtimes</p>
            </div>
            <div className="bg-base-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Theaters</h3>
              <p className="text-3xl font-bold text-purple-400">{stats.theaters}</p>
              <p className="text-gray-400 text-sm">Managed theaters</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a 
              href="/admin/movies" 
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">List Movies</h3>
              <p className="text-blue-200 text-sm">View movies</p>
            </a>
            
            <a 
              href="/admin/theaters" 
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">Manage Theaters</h3>
              <p className="text-green-200 text-sm">Update theater information</p>
            </a>
            
            <a 
              href="/admin/schedules" 
              className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">Manage Schedules</h3>
              <p className="text-purple-200 text-sm">Create and manage showtimes</p>
            </a>
            
            {/* <a 
              href="/admin/tickets" 
              className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg text-center transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">View Tickets</h3>
              <p className="text-orange-200 text-sm">Check ticket bookings</p>
            </a> */}
            
            <a 
              href="/admin/bookings" 
              className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg text-center transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">Manage Bookings</h3>
              <p className="text-red-200 text-sm">Confirm pending bookings</p>
            </a>
          </div>
        </div>
      </TheaterAdminGuard>
      </AdminGuard>
    </>
  );
} 