'use client';

import { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useSocket } from '@/hooks/useSocket';

export default function NotificationBell({ token }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, isConnected, clearNotification, clearAllNotifications } = useSocket(token);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
        {/* Connection status indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Thông báo</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
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
                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">
                          Vé đang chờ xác nhận
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          <p>Rạp: {notification.theaterChain}</p>
                          <p>Ghế: {notification.seats?.map(seat => seat.seat_id).join(', ')}</p>
                          <p>Thời gian: {formatTime(notification.timestamp)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => clearNotification(index)}
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
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 