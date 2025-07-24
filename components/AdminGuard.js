'use client';

import { useAdmin } from '../hooks/useCurrentUser';
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { getAuthToken } from '@/utils/auth';

export default function AdminGuard({ children, headerOnly }) {
  const { isAdmin, user, loading, logout } = useAdmin();
  const [dbNotifications, setDbNotifications] = useState([]);
  const [socketNotifications, setSocketNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const token = getAuthToken();
  const { notifications: socketNotiFromHook, isConnected, clearNotification, clearAllNotifications } = useSocket(token);

  // Sync socket notifications to local state for update
  useEffect(() => {
    setSocketNotifications(socketNotiFromHook);
  }, [socketNotiFromHook]);

  // Lấy thông báo cũ từ DB khi load trang
  useEffect(() => {
    if (user?._id && user.role === 'theater_admin') {
      fetch(`/api/notifications?user_id=${user._id}`)
        .then(res => res.json())
        .then(data => {
          setDbNotifications(data);
        });
    }
  }, [user?._id, user?.role]);

  // Polling notification mỗi 1 giây cho theater admin
  useEffect(() => {
    if (!user?._id || user.role !== 'theater_admin') return;
    const interval = setInterval(() => {
      fetch(`/api/notifications?user_id=${user._id}`)
        .then(res => res.json())
        .then(data => setDbNotifications(data));
    }, 1000); // 1 giây/lần
    return () => clearInterval(interval);
  }, [user?._id, user?.role]);

  // Gộp thông báo cũ và mới, không trùng lặp
  const allNotifications = user?.role === 'theater_admin'
    ? [
        ...socketNotifications,
        ...dbNotifications.filter(
          dbNoti => !socketNotifications.some(sockNoti => sockNoti._id === dbNoti._id)
        )
      ]
    : dbNotifications;

  // Số thông báo chưa đọc
  const unreadCount = allNotifications.filter(n => !n.read).length;

  // Đánh dấu đã đọc khi click
  const handleReadNotification = async (notification, index) => {
    if (!notification.read && notification._id) {
      await fetch(`/api/notifications/${notification._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
      // Cập nhật lại state cho cả dbNotifications và socketNotifications
      setDbNotifications(prev =>
        prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
      );
      setSocketNotifications(prev =>
        prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
      );
    }
    // Điều hướng đến trang bookings, truyền bookingId trên URL
    const bookingId = notification.bookingId || notification.booking_id;
    if (bookingId) {
      window.location.href = `/admin/bookings?highlight=${bookingId}`;
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
              {user?.role === 'theater_admin' && (
                <>
                  <a 
                    href="/admin/dashboard"
                    className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                  >
                    Dashboard
                  </a>
                  {/* Notification button */}
                  <div className="relative">
                    <button className="btn btn-ghost btn-circle" onClick={() => setShowNotif(v => !v)}>
                      <div className="indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
                        {unreadCount > 0 && (
                          <span className="badge badge-xs badge-primary indicator-item">{unreadCount}</span>
                        )}
                      </div>
                    </button>
                    {/* Connection status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {showNotif && (
                      <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                        <div className="p-2 font-bold border-b flex justify-between items-center">
                          <span>Thông báo</span>
                          {allNotifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Xóa tất cả
                            </button>
                          )}
                        </div>
                        {allNotifications.length === 0 ? (
                          <div className="p-4 text-gray-500 text-center">Không có thông báo</div>
                        ) : allNotifications.map((n, index) => (
                          <div
                            key={n._id || index}
                            className={`p-3 border-b hover:bg-blue-50 cursor-pointer ${n.read ? 'bg-gray-100' : 'bg-white font-semibold'}`}
                            onClick={() => handleReadNotification(n, index)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 font-medium">
                                  {n.type === 'booking_pending' ? 'Vé đang chờ xác nhận' : 'Thông báo mới'}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {n.message}
                                </p>
                                {n.theaterChain && (
                                  <p className="text-xs text-gray-500 mt-1">Rạp: {n.theaterChain}</p>
                                )}
                                {n.seats && (
                                  <p className="text-xs text-gray-500">Ghế: {n.seats.map(seat => seat.seat_id).join(', ')}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(n.timestamp || n.created_at).toLocaleString('vi-VN')}
                                </p>
                              </div>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  clearNotification(index);
                                }}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
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
                {user?.role === 'super_admin' ? 'Super Admin Panel' : user?.role === 'theater_admin' ? 'Theater Admin Panel' : 'User Panel'}
              </h1>
              <span className="text-sm text-gray-400">
                Welcome, {user?.username || 'Admin'}
                {user?.theater_chain && ` - ${user.theater_chain}`}
              </span>
            </div>
            {/* Navigation Menu */}
            <div className="flex items-center space-x-4">
              {user?.role === 'theater_admin' && (
                <>
                  <div className="relative">
                    <button className="btn btn-ghost btn-circle" onClick={() => setShowNotif(v => !v)}>
                      <div className="indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
                        {unreadCount > 0 && (
                          <span className="badge badge-xs badge-primary indicator-item">{unreadCount}</span>
                        )}
                      </div>
                    </button>
                    {/* Connection status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {showNotif && (
                      <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                        <div className="p-2 font-bold border-b flex justify-between items-center">
                          <span>Thông báo</span>
                          {allNotifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Xóa tất cả
                            </button>
                          )}
                        </div>
                        {allNotifications.length === 0 ? (
                          <div className="p-4 text-gray-500 text-center">Không có thông báo</div>
                        ) : allNotifications.map((n, index) => (
                          <div
                            key={n._id || index}
                            className={`p-3 border-b hover:bg-blue-50 cursor-pointer ${n.read ? 'bg-gray-100' : 'bg-white font-semibold'}`}
                            onClick={() => handleReadNotification(n, index)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 font-medium">
                                  {n.type === 'booking_pending' ? 'Vé đang chờ xác nhận' : 'Thông báo mới'}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {n.message}
                                </p>
                                {n.theaterChain && (
                                  <p className="text-xs text-gray-500 mt-1">Rạp: {n.theaterChain}</p>
                                )}
                                {n.seats && (
                                  <p className="text-xs text-gray-500">Ghế: {n.seats.map(seat => seat.seat_id).join(', ')}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(n.timestamp || n.created_at).toLocaleString('vi-VN')}
                                </p>
                              </div>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  clearNotification(index);
                                }}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
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