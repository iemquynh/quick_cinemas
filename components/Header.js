"use client";
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { useRef, useState, useEffect } from 'react'
import { useCurrentUser, useAdmin, AdminProvider } from '../hooks/useCurrentUser.js';
import NotificationBell from './NotificationBell.js';
import { getAuthToken } from '@/utils/auth.js';
import { io } from 'socket.io-client';
import ChatWidget from './ChatWidget';
import { usePathname } from 'next/navigation';
import Link from 'next/link.js';
import Image from 'next/image.js';


const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Films', href: '/films' },
  { name: 'Cinemas', href: '/cinemas' },
  { name: 'My Tickets', href: '/my-tickets' },
  { name: 'Abouts', href: '/abouts' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Header() {
  const { user, loading } = useCurrentUser();
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef();
  const token = getAuthToken();
  const [chatBooking, setChatBooking] = useState(null);
  const pathname = usePathname();

  // Lấy hàm logout từ AdminProvider nếu có
  let adminLogout = null;
  try {
    const adminContext = useAdmin();
    adminLogout = adminContext.logout;
  } catch (error) {
    // Không phải admin context, bỏ qua
  }

  // Lấy thông báo cũ từ DB khi load trang (chỉ user)
  useEffect(() => {
    // Đảm bảo user luôn có _id
    if (user && user.id && !user._id) user._id = user.id;
    console.log('User object in Header:', user);
    if (user?._id && user.role === 'user') {
      console.log('Fetching notifications for user:', user._id);
      fetch(`/api/notifications?user_id=${user._id}`)
        .then(res => res.json())
        .then(data => {
          console.log('User notifications:', data);
          setNotifications(data);
        });
    }
  }, [user]);

  // Polling notification mỗi 1 giây
  useEffect(() => {
    if (!user || !user._id) return;
    const interval = setInterval(() => {
      fetch(`/api/notifications?user_id=${user._id}`)
        .then(res => res.json())
        .then(data => setNotifications(data));
    }, 10000); // 1 giây/lần
    return () => clearInterval(interval);
  }, [user, user?._id]);

  // Lắng nghe realtime booking_update (Socket.IO)
  // useEffect(() => {
  //   if (!token || !user || user.role !== 'user') return;
  //   const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
  //     auth: { token }
  //   });
  //   socket.on('booking_update', (notification) => {
  //     setNotifications(prev => [notification, ...prev]);
  //     if (typeof window !== 'undefined' && window.showToast) {
  //       window.showToast(notification.message, 'info');
  //     }
  //   });
  //   return () => { socket.disconnect(); };
  // }, [token, user]);

  // Số thông báo chưa đọc
  const unreadCount = notifications.filter(n => !n.read).length;

  // Đánh dấu đã đọc khi click
  const handleReadNotification = async (notification, index) => {
    if (!notification.read && notification._id) {
      await fetch(`/api/notifications/${notification._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
      setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
    }
    // Điều hướng đến trang my-tickets, truyền bookingId và tab
    const bookingId = notification.bookingId || notification.booking_id;
    const tab = getTabFromStatus(notification.status);
    if (bookingId) {
      window.location.href = `/my-tickets?bookingId=${bookingId}&tab=${tab}`;
    }
  };
  function getTabFromStatus(status) {
    if (status === 'using') return 'using';
    if (status === 'cancel') return 'cancel';
    if (status === 'pending') return 'pending';
    return 'using';
  }

  // Hàm mở chat từ notification
  const handleMessageNotificationClick = async (bookingId) => {
    const res = await fetch(`/api/users/bookings?booking_id=${bookingId}`);
    const data = await res.json();
    if (data && data.bookings && data.bookings.length > 0) {
      setChatBooking(data.bookings[0]);
    }
    // Đánh dấu đã đọc notification new_message
    const notis = notifications.filter(n => n.type === 'new_message' && n.booking_id === bookingId && !n.read);
    for (const n of notis) {
      await fetch(`/api/notifications/${n._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
    }
    setNotifications(prev => prev.map(n => (n.type === 'new_message' && n.booking_id === bookingId) ? { ...n, read: true } : n));
  };

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

  return (
    <>
      <Disclosure as="nav" className="bg-gray-800 fixed top-0 left-0 w-full z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="shrink-0">
                <img
                  alt="Quick Cinemas"
                  src="/logo/logo.png"
                  className="h-full max-h-16 w-auto object-contain"
                />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={classNames(
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                {/* Notification cho user */}
                {user && user.role === 'user' && (
                  <NotificationBell
                    token={token}
                    user={user}
                    onMessageNotificationClick={handleMessageNotificationClick}
                  />

                )}

                {/* User menu or Join Us */}
                {!user && !loading && (
                  <details className="dropdown">
                    <summary className="btn m-1">Join Us</summary>
                    <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-42 p-2 shadow-sm">
                      <li><Link href="/auth/login">Login</Link></li>
                      <li><Link href="/auth/register">Register</Link></li>
                    </ul>
                  </details>
                )}
                {user && !loading && (
                  <div className="dropdown relative">
                    <button
                      className="flex items-center space-x-2 focus:outline-none"
                      onClick={() => setShowMenu((v) => !v)}
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.email)}&background=0D8ABC&color=fff&size=32`}
                        alt="avatar"
                        className="w-8 h-8 rounded-full border-2 border-blue-400"
                      />
                      <span className="text-white font-semibold text-sm hidden sm:inline">{user.username || user.email}</span>
                    </button>
                    {showMenu && (
                      <div className="dropdown-content absolute right-0 mt-2 menu bg-gray-100 rounded-box z-1 w-35 p-2 shadow-sm">
                        <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-400">Profile</Link>
                        {user && user.role === true && (
                          <Link href="/admin/movies" className="block px-4 py-2 text-gray-800 hover:bg-gray-400">Manage</Link>
                        )}
                        <button
                          className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-400"
                          onClick={() => {
                            if (user && (user.role === 'theater_admin' || user.role === 'super_admin')) {
                              // Admin logout: giữ nguyên về trang đăng nhập
                              if (window.location.pathname.startsWith('/admin') && window.adminLogout) {
                                window.adminLogout();
                              } else {
                                localStorage.removeItem('user');
                                if (window.refreshUser) window.refreshUser();
                                window.location.href = '/auth/login';
                              }
                            } else {
                              // User logout: về trang chủ guest
                              localStorage.removeItem('auth-token');
                              localStorage.removeItem('user');
                              if (window.refreshUser) window.refreshUser();
                              window.location.href = '/';
                            }
                          }}
                        >
                          Logout
                        </button>
                      </div>

                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: ghost, join us, hamburger menu */}
            <div className="flex md:hidden items-center ml-4 space-x-2">
              {/* Notification button (mobile) */}
              {/* Notification cho user */}
              {user && user.role === 'user' && (
                  <NotificationBell
                    token={token}
                    user={user}
                    onMessageNotificationClick={handleMessageNotificationClick}
                  />

                )}


              {/* User menu or Join Us (mobile) */}
              {!user && !loading && (
                <details className="dropdown">
                  <summary className="btn m-1">Join Us</summary>
                  <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-42 p-2 shadow-sm">
                    <li><Link href="/auth/login">Login</Link></li>
                    <li><Link href="/auth/register">Register</Link></li>
                  </ul>
                </details>
              )}
              {user && !loading && (
                <div className="dropdown relative">
                  <button
                    className="flex items-center space-x-2 focus:outline-none"
                    onClick={() => setShowMenu((v) => !v)}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.email)}&background=0D8ABC&color=fff&size=32`}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border-2 border-blue-400"
                    />
                    <span className="text-white font-semibold text-sm hidden sm:inline">{user.username || user.email}</span>
                  </button>
                  {showMenu && (
                    <div className="dropdown-content absolute right-0 mt-2 menu bg-gray-100 rounded-box z-1 w-35 p-2 shadow-sm">
                      <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-400">Profile</Link>
                      <button
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-400"
                        onClick={() => {
                          if (window.location.pathname.startsWith('/admin') && window.adminLogout) {
                            window.adminLogout();
                          } else {
                            localStorage.removeItem('user');
                            if (window.refreshUser) window.refreshUser();
                            window.location.href = '/';
                          }
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
              <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none">
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              </DisclosureButton>
            </div>
          </div>
        </div>
        <DisclosurePanel className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={classNames(
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </DisclosurePanel>

      </Disclosure>
      {
        chatBooking && (
          <ChatWidget
            booking={chatBooking}
            user={user}
            onClose={() => setChatBooking(null)}
          />
        )
      }
    </ >
  )
} 