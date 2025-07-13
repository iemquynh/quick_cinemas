'use client';
import { AdminProvider } from '../../hooks/useCurrentUser.js';

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
}