import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(token) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    console.log('Socket connecting with token:', token);
    if (!token) return;

    // Tạo kết nối Socket.IO
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: token
      }
    });

    socketRef.current = socketInstance;

    // Xử lý kết nối
    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
    });

    // Xử lý ngắt kết nối
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    // Lắng nghe thông báo booking pending (cho theater admin)
    socketInstance.on('booking_pending', (notification) => {
      console.log('[SOCKET] Received booking_pending notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Hiển thị toast notification
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(notification.message, 'info');
      }
    });

    // Lắng nghe thông báo booking update (cho user)
    socketInstance.on('booking_update', (notification) => {
      console.log('[SOCKET] Received booking_update notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Hiển thị toast notification
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(notification.message, 'info');
      }
    });

    // Xử lý lỗi
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup khi component unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [token]);

  // Hàm gửi thông báo
  const sendNotification = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  // Hàm xóa thông báo
  const clearNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  // Hàm xóa tất cả thông báo
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    socket,
    isConnected,
    notifications,
    sendNotification,
    clearNotification,
    clearAllNotifications
  };
} 