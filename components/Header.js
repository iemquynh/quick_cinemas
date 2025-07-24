"use client";
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { useRef, useState, useEffect } from 'react'
import { useCurrentUser, useAdmin, AdminProvider } from '../hooks/useCurrentUser.js';
import NotificationBell from './NotificationBell.js';
import { getAuthToken } from '@/utils/auth.js';
import { io } from 'socket.io-client';

const navigation = [
  { name: 'Dashboard', href: '/', current: true },
  { name: 'Cinemas', href: '#', current: false },
  { name: 'My Tickets', href: '/my-tickets', current: false },
  { name: 'Abouts', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Header() {
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const searchRef = useRef(null)
  const inputRef = useRef(null)
  const { user, loading } = useCurrentUser();
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef();
  const token = getAuthToken();

  // Lấy hàm logout từ AdminProvider nếu có
  let adminLogout = null;
  try {
    const adminContext = useAdmin();
    adminLogout = adminContext.logout;
  } catch (error) {
    // Không phải admin context, bỏ qua
  }

  // Debug: log user state
  // console.log('Header - User state:', { user, loading });

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
    }, 1000); // 1 giây/lần
    return () => clearInterval(interval);
  }, [user?._id]);

  // Lắng nghe realtime booking_update (Socket.IO)
  useEffect(() => {
    if (!token || !user || user.role !== 'user') return;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: { token }
    });
    socket.on('booking_update', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(notification.message, 'info');
      }
    });
    return () => { socket.disconnect(); };
  }, [token, user]);

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

  // Ẩn input khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearch(false)
      }
    }
    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearch])

  // Focus input khi hiện
  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showSearch])

  const handleSearch = (e) => {
    e.preventDefault()
    // TODO: Thực hiện tìm kiếm với searchValue
    setShowSearch(false)
  }

  return (
    <AdminProvider>
      <Disclosure as="nav" className="bg-gray-800 fixed top-0 left-0 w-full z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="shrink-0">
                <img
                  alt="Your Company"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="size-8"
                />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      aria-current={item.current ? 'page' : undefined}
                      className={classNames(
                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium',
                      )}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <button className="btn btn-ghost btn-circle" onClick={() => setShowSearch((v) => !v)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg>
                </button>
                {/* Notification cho user */}
                {user && user.role === 'user' && (
                  <div className="relative">
                    <button className="btn btn-ghost btn-circle" onClick={() => setShowNotif(v => !v)}>
                      <div className="indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
                        {unreadCount > 0 && (
                          <span className="badge badge-xs badge-primary indicator-item">{unreadCount}</span>
                        )}
                      </div>
                    </button>
                    {showNotif && (
                      <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                        <div className="p-2 font-bold border-b flex justify-between items-center">
                          <span>Thông báo</span>
                          {notifications.length > 0 && (
                            <button
                              onClick={() => setNotifications([])}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Xóa tất cả
                            </button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                          <div className="p-4 text-gray-500 text-center">Không có thông báo</div>
                        ) : notifications.map((n, index) => (
                          <div
                            key={n._id || index}
                            className={`p-3 border-b hover:bg-blue-50 cursor-pointer ${n.read ? 'bg-gray-100' : 'bg-white font-semibold'}`}
                            onClick={() => handleReadNotification(n, index)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 font-medium">
                                  {n.type === 'booking_confirmed' ? 'Vé đã xác nhận' : n.type === 'booking_cancelled' ? 'Vé bị từ chối' : 'Thông báo mới'}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {n.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(n.timestamp || n.created_at).toLocaleString('vi-VN')}
                                </p>
                              </div>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setNotifications(prev => prev.filter((_, i) => i !== index));
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
                )}
                {showSearch && (
                  <div
                    ref={searchRef}
                    className="absolute right-32 top-12 z-20"
                    style={{ minWidth: 260 }}
                  >
                    {/* Mũi nhọn */}
                    <div className="flex justify-end pr-6">
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: '10px solid transparent',
                          borderRight: '10px solid transparent',
                          borderBottom: '10px solid #fff',
                        }}
                      />
                    </div>
                    {/* Bubble */}
                    <form
                      onSubmit={handleSearch}
                      className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2"
                      style={{ border: '1px solidrgb(0, 0, 0)' }}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 outline-none text-black bg-[rgba(243,244,246,0.8)] placeholder:text-gray-500 rounded px-2 py-1"
                        placeholder="Tìm kiếm phim..."
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        onBlur={() => setShowSearch(false)}
                        onKeyDown={e => {
                          if (e.key === 'Escape') setShowSearch(false)
                        }}
                        style={{ minWidth: 200 }}
                      />
                      {/* <button type="submit" className="text-blue-600 font-semibold">Tìm</button> */}
                    </form>
                  </div>
                )}
                {/* User menu or Join Us */}
                {!user && !loading && (
                  <details className="dropdown">
                    <summary className="btn m-1">Join Us</summary>
                    <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-42 p-2 shadow-sm">
                      <li><a href="/auth/login">Login</a></li>
                      <li><a href="/auth/register">Register</a></li>
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
                        <a href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-400">Profile</a>
                        {user && user.role === true && (
                          <a href="/admin/movies" className="block px-4 py-2 text-gray-800 hover:bg-gray-400">Manage</a>
                        )}
                        <button
                          className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-400"
                          onClick={() => {
                            localStorage.removeItem('auth-token');
                            localStorage.removeItem('user');
                            if (window.refreshUser) window.refreshUser();
                            window.location.href = ''; // hoặc '/auth/login' nếu muốn về trang login
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
              <button className="btn btn-ghost btn-circle" onClick={() => setShowSearch((v) => !v)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg>
              </button>
              {/* Notification button (mobile) */}
              <button className="btn btn-ghost btn-circle">
                <div className="indicator">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
                  <span className="badge badge-xs badge-primary indicator-item"></span>
                </div>
              </button>
              {showSearch && (
                <div
                  ref={searchRef}
                  className="absolute right-32 top-12 z-20"
                  style={{ minWidth: 260 }}
                >
                  {/* Mũi nhọn */}
                  <div className="flex justify-end pr-6">
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderBottom: '10px solid #fff',
                      }}
                    />
                  </div>
                  {/* Bubble */}
                  <form
                    onSubmit={handleSearch}
                    className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2"
                    style={{ border: '1px solidrgb(0, 0, 0)' }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      className="flex-1 outline-none text-black bg-[rgba(243,244,246,0.8)] placeholder:text-gray-500 rounded px-2 py-1"
                      placeholder="Tìm kiếm phim..."
                      value={searchValue}
                      onChange={e => setSearchValue(e.target.value)}
                      onBlur={() => setShowSearch(false)}
                      onKeyDown={e => {
                        if (e.key === 'Escape') setShowSearch(false)
                      }}
                      style={{ minWidth: 200 }}
                    />
                    {/* <button type="submit" className="text-blue-600 font-semibold">Tìm</button> */}
                  </form>
                </div>
              )}
              {/* User menu or Join Us (mobile) */}
              {!user && !loading && (
                <details className="dropdown">
                  <summary className="btn m-1">Join Us</summary>
                  <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-42 p-2 shadow-sm">
                    <li><a href="/auth/login">Login</a></li>
                    <li><a href="/auth/register">Register</a></li>
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
                      <a href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-400">Profile</a>
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
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={classNames(
                  item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium'
                )}
              >
                {item.name}
              </a>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure>
    </AdminProvider>
  )
} 