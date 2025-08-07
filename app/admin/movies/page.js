'use client';

import { useState, useEffect } from 'react';
import { getAllMovies, deleteMovie } from '../../../utils/movieApi';
import Link from 'next/link';
import { useAdmin } from '@/hooks/useCurrentUser';

export default function AdminMoviesPage() {
  const { user, adminLoading } = useAdmin();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (user?.role === 'theater_admin') {
      fetchShowtimesAndFilterMovies();
    }
  }, [user, movies]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await getAllMovies();
      if (Array.isArray(response)) {
        setMovies(response);
      } else if (response.success && Array.isArray(response.data)) {
        setMovies(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimesAndFilterMovies = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const showtimesRes = await fetch('/api/showtimes', { headers: { Authorization: `Bearer ${token}` } });
      const showtimesData = await showtimesRes.json();
      const adminChain = (user?.theater_chain || '').split(' ')[0]?.toLowerCase();
      const filteredShowtimes = Array.isArray(showtimesData)
        ? showtimesData.filter(st => {
            const theaterName = st.theater_id?.name || '';
            const theaterChain = theaterName.split(' ')[0]?.toLowerCase();
            return theaterChain === adminChain;
          })
        : [];
      const movieIds = new Set(filteredShowtimes.map(st => st.movie_id?._id || st.movie_id));
    } catch (error) {
      console.error('Filter error', error);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return movie.title?.toLowerCase().includes(q);
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        const response = await deleteMovie(id);
        if (response.success) {
          alert('Movie deleted successfully');
          fetchMovies();
        } else {
          alert(response.message);
        }
      } catch (error) {
        alert('Failed to delete movie');
      }
    }
  };

  if (adminLoading || !user || !['theater_admin', 'super_admin'].includes(user.role)) return null;

  return (
    <div className="min-h-screen bg-gray-900 pt-[60px] pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  
        {/* Header + Search + Button */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center md:text-left">
            Movie Management
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name..."
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {user.role === 'super_admin' && (
              <Link
                href="/admin/movies/create"
                className="bg-info-content hover:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto text-center"
              >
                Add New Movie
              </Link>
            )}
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="text-center text-white text-lg animate-pulse">Đang tải phim...</div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center text-gray-400 text-lg">Không tìm thấy phim phù hợp.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <div key={movie._id} className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="relative h-64 w-full overflow-hidden rounded-t-lg">
                  <img
                    src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Image'}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    movie.isActive ? 'bg-green-500' : 'bg-red-500'
                  } text-white`}>
                    {movie.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">{movie.title}</h3>
                  <p className="text-sm text-gray-400 mb-1">{movie.directors}</p>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>{movie.genre}</span>
                    <span>{movie.runtime}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{movie.releaseDate}</p>

                  <div className="mt-auto">
                    {user.role === 'super_admin' ? (
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/movies/edit/${movie._id}`} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-center py-2 px-3 rounded text-sm font-medium">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(movie._id)}
                          className="flex-1 bg-error-content hover:bg-[#b91c1c] text-white py-2 px-3 rounded text-sm font-medium"
                        >
                          Delete
                        </button>
                        <Link href={`/movies/${movie._id}`} className="flex-1 bg-primary hover:bg-[#2563eb] text-white text-center py-2 px-3 rounded text-sm font-medium">
                          View
                        </Link>
                      </div>
                    ) : (
                      <Link href={`/movies/${movie._id}`} className="block w-full bg-primary hover:bg-green-700 text-white text-center py-2 px-3 rounded text-sm font-medium">
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No movies found</p>
          </div>
        )}
      </div>
    </div>
  );
}
