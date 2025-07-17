"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import { useAdmin } from '@/hooks/useCurrentUser';

export default function AdminPage() {
  const { user } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // Redirect theo role
    if (user) {
      if (user.role === 'super_admin') {
        router.push('/admin/theater-admins');
      } else if (user.role === 'theater_admin') {
        router.push('/admin/theater');
      }
    }
  }, [user, router]);

  return (
    <AdminGuard>
      <div className="container mx-auto py-8" style={{marginTop: 55}}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Dashboard</h1>
          <p className="text-gray-300">Redirecting to appropriate dashboard...</p>
        </div>
      </div>
    </AdminGuard>
  );
} 