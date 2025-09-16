'use client';

import { useEffect, useState, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { io } from 'socket.io-client';

export default function NotificationBell({ user, token, onMessageNotificationClick }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const notifRef = useRef();


  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user?._id || user.role !== 'user') return;

    // Lấy thông báo ban đầu
    fetch(`/api/notifications?user_id=${user._id}`)
      .then(res => res.json())
      .then(data => setNotifications(data));
  }, [user]);

  // Polling
  useEffect(() => {
    if (!user?._id) return;
    const interval = setInterval(() => {
      fetch(`/api/notifications?user_id=${user._id}`)
        .then(res => res.json())
        .then(data => setNotifications(data));
    }, 1000);
    return () => clearInterval(interval);
  }, [user?._id]);

  // Socket realtime
  // useEffect(() => {
  //   if (!token || !user || user.role !== 'user') return;
  //   const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
  //     auth: { token },
  //   });

  //   socket.on('booking_update', (notification) => {
  //     setNotifications(prev => [notification, ...prev]);
  //     if (typeof window !== 'undefined' && window.showToast) {
  //       window.showToast(notification.message, 'info');
  //     }
  //   });

  //   return () => socket.disconnect();
  // }, [token, user]);

  const deleteNotification = async (id) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const clearAllNotifications = async () => {
    for (const n of notifications) {
      await fetch(`/api/notifications/${n._id}`, { method: 'DELETE' });
    }
    setNotifications([]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  // Click outside để đóng dropdown
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="
           absolute mt-2 
           w-64 sm:w-80 md:w-96 max-w-[95vw]
           bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50
           right-2 sm:right-0
           z-[9999]
         "
        >


          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Thông báo</h3>
              {notifications.length > 0 && (
                <button
                  onClick={() => clearAllNotifications()}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Không có thông báo mới</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer
                    ${notification.read ? 'bg-white' : 'bg-gray-200'}
                    hover:bg-gray-300`}
                    onClick={async () => {
                      const bookingId = notification.booking_id || notification.bookingId;
                      try {
                        if (!notification.read && notification._id) {
                          await fetch(`/api/notifications/${notification._id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ read: true }),
                          });

                          setNotifications(prev =>
                            prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
                          );
                        }

                        // Điều hướng theo type...
                        switch (notification.type) {
                          case 'new_message':
                            if (onMessageNotificationClick) {
                              onMessageNotificationClick(bookingId);
                            }
                            break;
                          case 'booking_pending':
                            window.location.href = user?.role === "theater_admin"
                              ? `/admin/bookings?bookingId=${bookingId}&tab=pending`
                              : `/my-tickets?bookingId=${bookingId}&tab=pending`;
                            break;

                          case 'booking_confirmed':
                            window.location.href = user?.role === "theater_admin"
                              ? `/admin/bookings?bookingId=${bookingId}&tab=using`
                              : `/my-tickets?bookingId=${bookingId}&tab=using`;
                            break;

                          case 'booking_cancelled':
                            window.location.href = user?.role === "theater_admin"
                              ? `/admin/bookings?bookingId=${bookingId}&tab=cancel`
                              : `/my-tickets?bookingId=${bookingId}&tab=cancel`;
                            break;

                          case 'booking_expiring':
                            window.location.href = user?.role === "theater_admin"
                              ? `/admin/bookings?bookingId=${bookingId}&tab=upcoming`
                              : `/my-tickets?bookingId=${bookingId}&tab=upcoming`;
                            break;
                          default:
                            console.warn('Không xác định được loại thông báo:', notification.type);
                        }
                      } catch (error) {
                        console.error('Lỗi khi xử lý thông báo:', error);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">
                          {notification.type === 'new_message'
                            ? 'Tin nhắn mới'
                            : 'Vé đang chờ xác nhận'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {formatTime(
                            notification.createdAt ||
                            notification.created_at ||
                            notification.timestamp
                          )}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600 text-lg font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

function getTabFromStatus(status) {
  if (status === 'using') return 'using';
  if (status === 'cancel') return 'cancel';
  if (status === 'pending') return 'pending';
  return 'using';
}
