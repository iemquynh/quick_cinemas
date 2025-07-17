import { useAdmin } from '@/hooks/useCurrentUser';

export default function SuperAdminGuard({ children }) {
  const { user, loading } = useAdmin();

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'super_admin') return null;
  return children;
} 