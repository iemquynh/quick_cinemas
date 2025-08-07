'use client';

import { useAdmin } from '../hooks/useCurrentUser';
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { getAuthToken } from '@/utils/auth';
import ChatWidget from './ChatWidget';
import NotificationBell from './NotificationBell.js';

export default function AdminGuard({ children, headerOnly }) {
  const { isAdmin, user, loading, logout, hasChecked } = useAdmin();
  const [dbNotifications, setDbNotifications] = useState([]);
  const [socketNotifications, setSocketNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [chatBooking, setChatBooking] = useState(null);
  const token = getAuthToken();
  const { notifications: socketNotiFromHook, isConnected, clearNotification, clearAllNotifications } = useSocket(token);
  const notifRef = useRef();
  const [notifications, setNotifications] = useState([]);

  // Sync socket notifications to local state for update
  useEffect(() => {
    setSocketNotifications(socketNotiFromHook);
  }, [socketNotiFromHook]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!showNotif) return;
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotif]);

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

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id) return;

      try {
        const res = await fetch(`/api/notifications?user_id=${user._id}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []); // kiểm tra đúng định dạng backend trả về
          const unread = (data.notifications || []).filter(n => !n.read).length;
          // setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, [user]);


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

  // Hàm mở chat từ notification
  const handleMessageNotificationClick = async (bookingId) => {
    // Lấy thông tin booking từ API
    const res = await fetch(`/api/admin/bookings?booking_id=${bookingId}`);
    const data = await res.json();
    if (data && data.bookings && data.bookings.length > 0) {
      setChatBooking(data.bookings[0]);
    }
    // Đánh dấu tất cả notification new_message của booking này là đã đọc
    const notis = allNotifications.filter(n => n.type === 'new_message' && n.booking_id === bookingId && !n.read);
    for (const n of notis) {
      await fetch(`/api/notifications/${n._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
    }
    setDbNotifications(prev => prev.map(n => (n.type === 'new_message' && n.booking_id === bookingId) ? { ...n, read: true } : n));
    setSocketNotifications(prev => prev.map(n => (n.type === 'new_message' && n.booking_id === bookingId) ? { ...n, read: true } : n));
  };

  if (!hasChecked) {
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
      <div className="fixed top-0 left-0 w-full z-50 bg-[#1a2332] text-white shadow-lg border-b border-gray-800 text-xs sm:text-sm">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-3">
            {/* Left: Title and user info */}
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-1 sm:space-y-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">
                {user?.role === 'super_admin' ? 'Super Admin Panel' : 'Theater Admin Panel'}
              </h1>
              <span className="text-gray-400 hidden md:inline">
                Welcome, {user?.username || 'Admin'}
                {user?.theater_chain && ` - ${user.theater_chain}`}
              </span>
            </div>
  
            {/* Right: Navigation */}
            <div className="flex flex-wrap gap-2 items-center">
              {user?.role === 'theater_admin' && (
                <>
                  <a
                    href="/admin/dashboard"
                    className="text-gray-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-gray-600"
                  >
                    Dashboard
                  </a>
  
                  <NotificationBell
                    token={token}
                    user={user}
                    onMessageNotificationClick={handleMessageNotificationClick}
                  />
                </>
              )}
  
              {user?.role === 'super_admin' && (
                <>
                  <a
                    href="/admin/theater-admins"
                    className="text-gray-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-gray-600"
                  >
                    Manage Theater Admins
                  </a>
                  <a
                    href="/admin/movies"
                    className="text-gray-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-gray-600"
                  >
                    Manage Movies
                  </a>
                </>
              )}
  
              {(user?.role !== 'super_admin' && user?.role !== 'theater_admin') && (
                <a
                  href="/"
                  className="text-gray-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-gray-600"
                >
                  View Site
                </a>
              )}
  
              <button
                onClick={logout}
                className="text-gray-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-gray-600"
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
    <div className="min-h-screen bg-gray-900 text-xs sm:text-sm">
      {/* Admin Header */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#1a2332] text-white shadow-lg border-b border-gray-800">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-base sm:text-xl font-bold text-white">
                {user?.role === 'super_admin'
                  ? 'Super Admin Panel'
                  : user?.role === 'theater_admin'
                  ? 'Theater Admin Panel'
                  : 'User Panel'}
              </h1>
              <span className="text-gray-400 hidden md:inline">
                Welcome, {user?.username || 'Admin'}
                {user?.theater_chain && ` - ${user.theater_chain}`}
              </span>
            </div>
            {/* Navigation Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4 relative">
              {user?.role === 'theater_admin' && (
                <>
                  <NotificationBell
                    token={token}
                    user={user}
                    onMessageNotificationClick={handleMessageNotificationClick}
                  />
                </>
              )}
              {user?.role === 'super_admin' && (
                <>
                  <a
                    href="/admin/theater-admins"
                    className="text-gray-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-gray-600"
                  >
                    Manage Theater Admins
                  </a>
                  <a
                    href="/admin/movies"
                    className="text-gray-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-gray-600"
                  >
                    Manage Movies
                  </a>
                </>
              )}
              {user?.role === 'theater_admin' && (
                <a
                  href="/admin/dashboard"
                  className="text-gray-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-gray-600"
                >
                  Dashboard
                </a>
              )}
              {(user?.role !== 'super_admin' && user?.role !== 'theater_admin') && (
                <a
                  href="/"
                  className="text-gray-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-gray-600"
                >
                  View Site
                </a>
              )}
              <button
                onClick={logout}
                className="text-gray-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded border border-gray-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
  
      {/* Admin Content */}
      {children}
      {chatBooking && (
        <ChatWidget
          booking={chatBooking}
          user={user}
          onClose={() => setChatBooking(null)}
        />
      )}
    </div>
  );
  
} 