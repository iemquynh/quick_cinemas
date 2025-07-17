import { useAdmin } from '@/hooks/useCurrentUser';

export default function TheaterAdminGuard({ children }) {
  const { user, loading } = useAdmin();

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'theater_admin') return null;
  return children;
} 