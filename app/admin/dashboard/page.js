"use client";
import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useCurrentUser';
import Link from 'next/link';

export default function TheaterAdminPage() {
  const { user, loading } = useAdmin();
  const [stats, setStats] = useState({
    movies: 0,
    showtimes: 0,
    theaters: 0
  });

  useEffect(() => {
    if (user) {
      fetchAllMoviesStats();
      fetchStats();
    }
  }, [user]);

  const fetchAllMoviesStats = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const moviesRes = await fetch('/api/movies', { headers: { Authorization: `Bearer ${token}` } });
      const moviesData = await moviesRes.json();
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

      const filteredShowtimes = Array.isArray(showtimesData)
        ? showtimesData.filter(st => {
            const theaterName = st.theater_id?.name || '';
            const theaterChain = theaterName.split(' ')[0]?.toLowerCase();
            return theaterChain === adminChain;
          })
        : [];

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
    <div className="min-h-screen bg-gray-900 pt-8 px-4 md:px-6 lg:px-8" style={{ marginTop: 55 }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {user?.role === 'super_admin' ? 'Super Admin Dashboard' : 'Theater Admin Dashboard'}
          </h1>
          <p className="text-gray-300">
            Welcome, {user?.username} {user?.role === 'theater_admin' && `- Managing ${user?.theater_id?.name || 'your theater'}`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/movies" className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors">
            <h3 className="text-lg font-semibold mb-2">List Movies</h3>
            <p className="text-blue-200 text-sm">View movies</p>
          </Link>

          <Link href="/admin/theaters" className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center transition-colors">
            <h3 className="text-lg font-semibold mb-2">Manage Theaters</h3>
            <p className="text-green-200 text-sm">Update theater information</p>
          </Link>

          <Link href="/admin/schedules" className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center transition-colors">
            <h3 className="text-lg font-semibold mb-2">Manage Schedules</h3>
            <p className="text-purple-200 text-sm">Create and manage showtimes</p>
          </Link>

          <Link href="/admin/bookings" className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg text-center transition-colors">
            <h3 className="text-lg font-semibold mb-2">Manage Bookings</h3>
            <p className="text-red-200 text-sm">Confirm pending bookings</p>
          </Link>

          <Link href="/admin/promotions" className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg text-center transition-colors">
            <h3 className="text-lg font-semibold mb-2">Manage Promotions</h3>
            <p className="text-red-200 text-sm">Create and manage promotions</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
