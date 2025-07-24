'use client';

import { useState, useEffect, useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getAuthToken } from '@/utils/auth';
import { useSearchParams } from 'next/navigation';

export default function AdminBookingsPage() {
  const { user, loading } = useCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [filter, setFilter] = useState('pending');
  const token = getAuthToken();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const bookingRefs = useRef({});

  useEffect(() => {
    if (user && user.role) {
      fetchBookings();
    }
  }, [user, filter]);

  useEffect(() => {
    if (highlightId && bookingRefs.current[highlightId]) {
      bookingRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId, bookings]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const params = new URLSearchParams({ status: filter });
      if (user.role === 'theater_admin' && user.theater_chain) {
        params.append('theater_chain', user.theater_chain);
      }
      const response = await fetch(`/api/admin/bookings?${params}`);
      const data = await response.json();
      if (response.ok) {
        setBookings(data);
      } else {
        console.error('Error fetching bookings:', data.error);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          action,
          adminId: user._id
        }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchBookings();
        if (window.showToast) {
          window.showToast(`Booking ${action}ed successfully`, 'success');
        }
      } else {
        console.error('Error updating booking:', data.error);
        if (window.showToast) {
          window.showToast(`Error: ${data.error}`, 'error');
        }
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      if (window.showToast) {
        window.showToast('Error updating booking', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xác nhận' },
      using: { color: 'bg-green-100 text-green-800', text: 'Đã xác nhận' },
      cancel: { color: 'bg-red-100 text-red-800', text: 'Đã hủy' },
      expired: { color: 'bg-gray-100 text-gray-800', text: 'Hết hạn' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'theater_admin' && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filter tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['pending', 'using', 'cancel', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status === 'pending' && 'Chờ xác nhận'}
                {status === 'using' && 'Đã xác nhận'}
                {status === 'cancel' && 'Đã hủy'}
                {status === 'expired' && 'Hết hạn'}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Bookings list */}
      {loadingBookings ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có bookings</h3>
          <p className="text-gray-500">Không có bookings nào với trạng thái "{filter}"</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <li
                key={booking._id}
                ref={el => bookingRefs.current[booking._id] = el}
                className={`px-6 py-4 transition-all duration-300 ${highlightId === booking._id ? 'border-4 border-blue-500 bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Movie poster */}
                    {booking.showtime_id?.movie_id?.poster && (
                      <img
                        src={booking.showtime_id.movie_id.poster}
                        alt="Movie poster"
                        className="w-16 h-24 object-cover rounded"
                      />
                    )}
                    {/* Booking details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {booking.showtime_id?.movie_id?.title || 'Unknown Movie'}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>User:</strong> {booking.user_id?.username || booking.user_id?.email}</p>
                        <p><strong>Seats:</strong> {booking.seats?.map(s => s.seat_id).join(', ')}</p>
                        <p><strong>Showtime:</strong> {formatDate(booking.showtime_id?.time)}</p>
                        <p><strong>Created:</strong> {formatDate(booking.createdAt)}</p>
                        {booking.payment_proof_url && (
                          <p><strong>Payment Proof:</strong> 
                            <a 
                              href={booking.payment_proof_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 ml-1"
                            >
                              View
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Action buttons */}
                  {booking.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBookingAction(booking._id, 'confirm')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Xác nhận
                      </button>
                      <button
                        onClick={() => handleBookingAction(booking._id, 'reject')}
                        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 