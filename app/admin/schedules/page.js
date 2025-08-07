"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/hooks/useCurrentUser';

export default function ScheduleListPage() {
  const { user } = useAdmin();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        headers: { 'Authorization': `Bearer ${token}` }
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

  const filteredSchedules = schedules
    .filter(s => {
      if (!user?.theater_chain) return true;
      const getFirstWord = str => str?.trim().split(' ')[0]?.toLowerCase() || '';
      return getFirstWord(user.theater_chain) === getFirstWord(s.theater_id?.name);
    })
    .filter(s => {
      if (filterMovie && !(s.movie_id?.title || '').toLowerCase().includes(filterMovie.toLowerCase())) return false;
      if (filterTheater && !(s.theater_id?.name || '').toLowerCase().includes(filterTheater.toLowerCase())) return false;
      if (filterDate) {
        const [year, month, day] = filterDate.split('-');
        const filterDateDisplay = `${parseInt(day)}/${parseInt(month)}/${year}`;
        const showDate = new Date(s.time);
        const showDateDisplay = `${showDate.getDate()}/${showDate.getMonth() + 1}/${showDate.getFullYear()}`;
        if (showDateDisplay !== filterDateDisplay) return false;
      }
      return true;
    });

  return (
    <div className="container mx-auto py-8 px-2 sm:px-4" style={{ marginTop: 55 }}>
      {/* Header title + button */}
      <div className="flex items-center justify-between mb-4 px-2 sm:px-0">
        <h2 className="text-lg sm:text-2xl font-bold text-white whitespace-nowrap">Schedule Lists</h2>
        <a
          href="/admin/schedules/create"
          className="btn btn-primary btn-sm sm:btn-md text-sm sm:text-base whitespace-nowrap"
        >
          Add Schedule
        </a>
      </div>

      {/* Filter Inputs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <input
          className="input input-bordered input-sm w-full sm:w-auto"
          placeholder="Lọc theo tên phim"
          value={filterMovie}
          onChange={e => setFilterMovie(e.target.value)}
        />
        <input
          className="input input-bordered input-sm w-full sm:w-auto"
          placeholder="Lọc theo tên rạp"
          value={filterTheater}
          onChange={e => setFilterTheater(e.target.value)}
        />
        <input
          className="input input-bordered input-sm w-full sm:w-auto"
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-md">
          <table className="min-w-full table-auto bg-base-100 text-sm sm:text-base text-white">
            <thead className="bg-base-200">
              <tr className="text-left">
                <th className="px-4 py-3">Film</th>
                <th className="px-4 py-3">Theater</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">ScreenType</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((s, index) => (
                <tr
                  key={s._id}
                  className={index % 2 === 0 ? 'bg-base-100' : 'bg-base-200'}
                >
                  <td className="px-4 py-2">{s.movie_id?.title || 'N/A'}</td>
                  <td className="px-4 py-2">{s.theater_id?.name || 'N/A'}</td>
                  <td className="px-4 py-2">{new Date(s.time).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-2">{s.room}</td>
                  <td className="px-4 py-2">{s.type}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Link
                      href={`/admin/schedules/view/${s._id}`}
                      className="btn btn-xs sm:btn-sm btn-info"
                    >
                      View
                    </Link>
                    {/* <button className="btn btn-xs sm:btn-sm btn-error ml-2" onClick={() => handleDelete(s._id)}>Delete</button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
