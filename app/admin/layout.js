'use client';
import { AdminProvider } from '../../hooks/useCurrentUser.js';
import AdminGuard from '../../components/AdminGuard.js';

export default function AdminLayout({ children }) {
  return (
    // <AdminProvider>
      <AdminGuard>
        <div className="pt-16">
          {children}
        </div>
      </AdminGuard>
    // </AdminProvider>
  );
}