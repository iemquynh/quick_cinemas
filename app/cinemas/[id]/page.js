'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Image from 'next/image';

const PLACEHOLDER_IMGS = [
  'https://png.pngtree.com/png-clipart/20190516/original/pngtree-white-cinema-theatre-screen-with-red-curtains-and-chairs-png-image_3662495.jpg',
  'https://kubetvip88.com/wp-content/uploads/2025/02/360_F_752317051_7aFHdD03877W4JH4Y3yjYhkr6q6hT1Gr.jpg',
  'https://www.freeiconspng.com/uploads/movie-theatre-png-11.png',
  'https://png.pngtree.com/thumb_back/fh260/background/20230519/pngtree-an-empty-movie-theater-with-lots-of-red-seats-image_2604057.jpg',
  'https://static.vinwonders.com/production/2025/02/rap-chieu-phim-sai-gon-thumb.jpg',
  'https://cdn.dealtoday.vn/img/s800x400/9641fe44941f436b92a624bc1eb3a679.jpg?sign=2ahfNEQTNzu0VhpR7sOE4Q',
  'https://lh3.googleusercontent.com/proxy/40GOZ-RGQNeHhBnkHWBHvBI42aRBEgjBwF-vUz3teYzVkbuRCN65Pts-BBu0LDJjNm8-DP6b_gHI-beuOUp5evGY-HyZRxpZhGyn_CvmJ5JQDY44pnKrB55CgShEGYzPYWPtOh7gGWyY79rSOdPK6EjqYdqNqxnQqWj0DSegTGQsvuOsqwnSMkGSIpg7u1yanHhp1S2KfT6Hh3FFVFE',
];

function getTodayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export default function CinemaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [theater, setTheater] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(getTodayStr());
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/theaters/${id}`)
      .then(res => res.json())
      .then(data => setTheater(data));
    fetch(`/api/showtimes?theater_id=${id}&date=${date}`)
      .then(res => res.json())
      .then(data => setShowtimes(data))
      .finally(() => setLoading(false));
  }, [id, date]);

  const filteredShowtimes = showtimes.filter(st => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return st.movie_id?.title?.toLowerCase().includes(q);
  });

  const days = Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const handleBookTicket = (movieId, showtimeId) => {
    router.push(`/movies/${movieId}?showtimeId=${showtimeId}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 py-8 mt-16">
        <div className="container mx-auto px-4">
          {loading && <div className="text-center text-white">Loading...</div>}
          {theater && (
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex-shrink-0 w-full md:w-80 h-56 md:h-80 bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={theater.image || theater.poster || theater.logo || PLACEHOLDER_IMGS[Math.floor(Math.random() * PLACEHOLDER_IMGS.length)]}
                  alt={theater.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase">{theater.name}</h1>
                <div className="text-gray-400 text-base mb-1">{theater.address}</div>
                <div className="text-gray-400 text-base mb-1">Chain: <span className="font-semibold text-blue-400">{theater.theater_chain}</span></div>
                <div className="text-gray-400 text-base mb-1">Rooms: <span className="font-semibold">{theater.rooms}</span></div>
                <div className="text-gray-400 text-base mb-1">Screen Types: <span className="font-semibold">{theater.screenTypes && theater.screenTypes.length > 0 ? theater.screenTypes.join(', ') : 'N/A'}</span></div>
              </div>
            </div>
          )}

          {/* Date scroll */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {days.map(d => (
              <button
                key={d}
                className={`px-4 py-2 rounded font-semibold text-sm whitespace-nowrap ${date === d ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setDate(d)}
              >
                {new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: '2-digit' })}
              </button>
            ))}
          </div>

          {/* Search movie */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search movie by title..."
              className="w-full md:w-1/2 px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Showtime list */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Showtimes</h2>
            {filteredShowtimes.length === 0 ? (
              <div className="text-gray-400 text-center">No showtimes for this date.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredShowtimes.map(st => (
                  <div key={st._id} className="bg-gray-900 rounded p-4 flex flex-col items-center shadow-md hover:shadow-xl transition-all duration-200">
                    <img
                      src={st.movie_id?.poster || PLACEHOLDER_IMGS[0]}
                      alt={st.movie_id?.title}
                      className="w-28 h-40 object-cover object-center rounded mb-2"
                    />
                    <h3 className="text-lg font-bold text-white mb-1 text-center line-clamp-2">{st.movie_id?.title}</h3>
                    <div className="text-gray-400 text-sm mb-1">Room: <span className="font-semibold">{st.room}</span></div>
                    <div className="text-gray-400 text-sm mb-1">Screen type: <span className="font-semibold">{st.type}</span></div>
                    <div className="text-gray-400 text-sm mb-2">Time: <span className="font-semibold">{new Date(st.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span></div>
                    <button
                      className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                      onClick={() => handleBookTicket(st.movie_id?._id, st._id)}
                    >
                      Book Ticket
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
