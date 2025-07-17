"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';
import TheaterAdminGuard from '@/components/TheaterAdminGuard';
import AdminGuard from '@/components/AdminGuard';
import { useAdmin } from '@/hooks/useCurrentUser';

export default function ScheduleListPage() {
  const { user } = useAdmin();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Thêm state cho filter
  const [filterMovie, setFilterMovie] = useState('');
  const [filterTheater, setFilterTheater] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/showtimes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSchedules(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load schedules');
      setLoading(false);
    }
  };

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    const res = await fetch(`/api/showtimes/${id}`, { method: 'DELETE' });
    if (res.ok) setSchedules(schedules.filter(s => s._id !== id));
    else alert('Delete failed');
  }

  // Hàm lọc
  const filteredSchedules = schedules
    .filter(s => {
      if (!user?.theater_chain) return true;
      const getFirstWord = str => str?.trim().split(' ')[0]?.toLowerCase() || '';
      return getFirstWord(user.theater_chain) === getFirstWord(s.theater_id?.name);
    })
    .filter(s => {
      // Lọc theo tên phim
      if (filterMovie && !(s.movie_id?.title || '').toLowerCase().includes(filterMovie.toLowerCase())) return false;
      // Lọc theo tên rạp
      if (filterTheater && !(s.theater_id?.name || '').toLowerCase().includes(filterTheater.toLowerCase())) return false;
      // Lọc theo ngày chiếu
      if (filterDate) {
        // Chuyển filterDate (yyyy-mm-dd) sang dd/m/yyyy để so sánh với hiển thị
        const [year, month, day] = filterDate.split('-');
        const filterDateDisplay = `${parseInt(day)}/${parseInt(month)}/${year}`;
        const showDate = new Date(s.time);
        const showDateDisplay = `${showDate.getDate()}/${showDate.getMonth()+1}/${showDate.getFullYear()}`;
        if (showDateDisplay !== filterDateDisplay) return false;
      }
      return true;
    });

  return (
    <AdminGuard>
    <TheaterAdminGuard>
      <div className="container mx-auto py-8" style={{marginTop: 55}}>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-white">Schedule Lists</h2>
          <a href="/admin/schedules/create" className="btn btn-primary">Add Schedule</a>
        </div>
        {/* Filter hàng ngang bên dưới */}
        <div className="flex gap-2 flex-wrap mb-6 mt-10">
          <input
            className="input input-bordered input-sm"
            placeholder="Lọc theo tên phim"
            value={filterMovie}
            onChange={e => setFilterMovie(e.target.value)}
          />
          <input
            className="input input-bordered input-sm"
            placeholder="Lọc theo tên rạp"
            value={filterTheater}
            onChange={e => setFilterTheater(e.target.value)}
          />
          <input
            className="input input-bordered input-sm"
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
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
              {filteredSchedules.map(s => (
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
    </TheaterAdminGuard>
    </AdminGuard>
  );
} 