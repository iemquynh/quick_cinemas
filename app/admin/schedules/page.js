"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';

export default function ScheduleListPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/showtimes')
      .then(res => res.json())
      .then(data => {
        setSchedules(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load schedules');
        setLoading(false);
      });
  }, []);

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    const res = await fetch(`/api/showtimes/${id}`, { method: 'DELETE' });
    if (res.ok) setSchedules(schedules.filter(s => s._id !== id));
    else alert('Delete failed');
  }

  return (
    <AdminGuard>
      <div className="container mx-auto py-8" style={{marginTop: 55}}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Schedule Lists</h2>
          <a href="/admin/schedules/create" className="btn btn-primary">Add Schedule</a>
        </div>
        {loading ? <div className="text-white">Loading...</div> : error ? <div className="text-error">{error}</div> : (
          <table className="table w-full bg-base-200">
            <thead>
              <tr>
                <th>Film</th>
                <th>Theater</th>
                <th>Time</th>
                <th>Room</th>
                <th>ScreenType</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s._id}>
                  <td>{s.movie_id?.title || 'N/A'}</td>
                  <td>{s.theater_id?.name || 'N/A'}</td>
                  <td>{new Date(s.time).toLocaleString('vi-VN')}</td>
                  <td>{s.room}</td>
                  <td>{s.type}</td>
                  <td>
                    <Link href={`/admin/schedules/view/${s._id}`} className="btn btn-sm btn-info mr-2">View</Link>
                    {/* <button className="btn btn-sm btn-error" onClick={() => handleDelete(s._id)}>Delete</button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminGuard>
  );
} 