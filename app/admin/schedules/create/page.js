'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import { useAdmin } from '@/hooks/useCurrentUser';
import Swal from 'sweetalert2';

function getDateTimeLocalString(date) {
  return date.toISOString().slice(0, 16);
}

export default function CreateShowtimePage() {
  const router = useRouter();
  const { user } = useAdmin();
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [showtimes, setShowtimes] = useState([{ theater: '', time: '', room: '', type: '' }]);

  const [releaseMinDateTime, setReleaseMinDateTime] = useState('');
  const [releaseMaxDateTime, setReleaseMaxDateTime] = useState('');

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMovies(data);
        else if (Array.isArray(data.data)) setMovies(data.data);
        else setMovies([]);
      });
    fetch('/api/theaters').then(res => res.json()).then(setTheaters);
  }, []);

  useEffect(() => {
    if (selectedMovie) {
      const movie = movies.find(m => m._id === selectedMovie);
      if (movie?.releaseDate) {
        const release = new Date(movie.releaseDate);
        const max = new Date(release);
        max.setDate(max.getDate() + 60);
        setReleaseMinDateTime(getDateTimeLocalString(release));
        setReleaseMaxDateTime(getDateTimeLocalString(max));
      }
    } else {
      setReleaseMinDateTime('');
      setReleaseMaxDateTime('');
    }
  }, [selectedMovie, movies]);

  const handleShowtimeChange = (idx, field, value) => {
    setShowtimes(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleAddShowtime = () => {
    setShowtimes(prev => [...prev, { theater: '', time: '', room: '', type: '' }]);
  };

  const handleRemoveShowtime = (idx) => {
    setShowtimes(prev => prev.filter((_, i) => i !== idx));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedMovie) {
      Swal.fire({
        icon: 'error',
        title: 'Missing movie',
        text: 'Vui lòng chọn phim!',
        confirmButtonColor: '#d33'
      });
      return;
    }
    const valid = showtimes.every(s => s.theater && s.time && s.room && s.type);
    if (!valid) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete information',
        text: 'Vui lòng nhập đầy đủ thông tin cho tất cả suất chiếu!',
        confirmButtonColor: '#d33'
      });
      return;
    }

    let ok = true;
    for (const s of showtimes) {
      const selectedTheater = theaters.find(t => t._id === s.theater);
      const res = await fetch('/api/showtimes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          movie: selectedMovie,
          theater: s.theater,
          room: s.room,
          time: s.time,
          type: s.type,
          theater_chain: selectedTheater?.theater_chain
        }),
      });
      if (!res.ok) ok = false;
    }

    if (ok) {
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Tạo các suất chiếu thành công!',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        router.push('/admin/schedules');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra khi tạo một số suất chiếu!',
        confirmButtonColor: '#d33'
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#1a2332] pt-24">
      <div className="max-w-2xl mx-auto mt-0 bg-base-200 p-6 rounded">
        <h2 className="text-xl font-bold mb-4">Tạo nhiều suất chiếu mới</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <select className="select select-bordered" value={selectedMovie} onChange={e => setSelectedMovie(e.target.value)} required>
            <option value="">Chọn phim</option>
            {Array.isArray(movies) && movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>
          <div className="flex flex-col gap-4">
            {showtimes.map((s, idx) => {
              const selectedTheater = theaters.find(t => t._id === s.theater);
              const roomOptions = selectedTheater ? Array.from({length: selectedTheater.rooms}, (_, i) => `Room ${i+1}`) : [];
              const screenTypeOptions = selectedTheater ? selectedTheater.screenTypes : [];
              const getFirstWord = str => str?.trim().split(' ')[0]?.toLowerCase() || '';
              const filteredTheaters = user?.theater_chain
                ? theaters.filter(t => getFirstWord(t.name) === getFirstWord(user.theater_chain))
                : theaters;
              return (
                <div key={idx} className="flex flex-col md:flex-row gap-2 items-end border-b pb-4">
                  <select className="select select-bordered w-full md:w-1/4" value={s.theater} onChange={e => handleShowtimeChange(idx, 'theater', e.target.value)} required>
                    <option value="">Chọn rạp</option>
                    {filteredTheaters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                  <input
                    className="input input-bordered w-full md:w-1/4"
                    type="datetime-local"
                    value={s.time}
                    min={releaseMinDateTime || getDateTimeLocalString(new Date())}
                    max={releaseMaxDateTime || getDateTimeLocalString(new Date(new Date().setMonth(new Date().getMonth() + 5)))}
                    onChange={e => handleShowtimeChange(idx, 'time', e.target.value)}
                    required
                  />
                  <select className="select select-bordered w-full md:w-1/4" value={s.room} onChange={e => handleShowtimeChange(idx, 'room', e.target.value)} required disabled={!selectedTheater}>
                    <option value="">Chọn phòng chiếu</option>
                    {roomOptions.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                  <select className="select select-bordered w-full md:w-1/4" value={s.type} onChange={e => handleShowtimeChange(idx, 'type', e.target.value)} required disabled={!selectedTheater}>
                    <option value="">Chọn loại màn hình</option>
                    {screenTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {showtimes.length > 1 && (
                    <button type="button" className="btn btn-error btn-sm ml-2" onClick={() => handleRemoveShowtime(idx)}>-</button>
                  )}
                </div>
              );
            })}
          </div>
          <button type="button" className="btn btn-outline btn-info w-fit" onClick={handleAddShowtime}>+ Thêm suất chiếu</button>
          <button className="btn btn-primary mt-4" type="submit">Tạo các suất chiếu</button>
        </form>
      </div>
    </div>
  );
}
