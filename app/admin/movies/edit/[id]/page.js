'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getMovieById, updateMovie } from '../../../../../utils/movieApi';
import AdminGuard from '../../../../../components/AdminGuard';
import Select from 'react-select';


export default function EditMoviePage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    directors: '',
    cast: '',
    synopsis: '',
    runtime: '',
    releaseDate: '',
    genre: '',
    tags: '',
    poster: '',
    background: '',
    trailerUrl: '',
    isActive: true
  });
  const [runtimeHour, setRuntimeHour] = useState('');
  const [runtimeMinute, setRuntimeMinute] = useState('');
  const [genreOptions, setGenreOptions] = useState([]);

  const GENRE_OPTIONS = [
    { value: "Action", label: "Action" },
    { value: "Comedy", label: "Comedy" },
    { value: "Drama", label: "Drama" },
    { value: "Horror", label: "Horror" },
    { value: "Romance", label: "Romance" },
    { value: "Sci-Fi", label: "Sci-Fi" },
    { value: "Thriller", label: "Thriller" },
    { value: "Animation", label: "Animation" },
    { value: "Adventure", label: "Adventure" }
  ];

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#374151',
      borderColor: state.isFocused ? '#2563eb' : '#4b5563',
      color: '#fff',
      minHeight: 48,
      boxShadow: 'none',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#374151',
      color: '#fff',
      zIndex: 20,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#2563eb'
        : state.isFocused
          ? '#1e293b'
          : '#374151',
      color: '#fff',
      fontWeight: state.isSelected ? 'bold' : 'normal',
      cursor: 'pointer',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#2563eb',
      color: '#fff',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#fff',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#d1d5db',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff',
    }),
  };

  useEffect(() => {
    fetchMovie();
  }, [unwrappedParams.id]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const response = await getMovieById(unwrappedParams.id);
      if (response.success) {
        const data = response.data;
        // Parse runtime
        let hour = '', minute = '';
        if (data.runtime) {
          const match = data.runtime.match(/(\d+)h\s*(\d+)?m?/);
          if (match) {
            hour = match[1] || '';
            minute = match[2] || '';
          }
        }
        setRuntimeHour(hour);
        setRuntimeMinute(minute);
        // Parse releaseDate to yyyy-mm-dd
        let releaseDate = '';
        if (data.releaseDate) {
          const d = new Date(data.releaseDate);
          if (!isNaN(d)) {
            releaseDate = d.toISOString().slice(0, 10);
          } else if (/\d{4}-\d{2}-\d{2}/.test(data.releaseDate)) {
            releaseDate = data.releaseDate;
          }
        }
        // Parse genre to array
        let genreArr = [];
        if (data.genre) {
          genreArr = data.genre.split(',').map(g => g.trim()).filter(Boolean).map(g => GENRE_OPTIONS.find(opt => opt.value === g) || { value: g, label: g });
        }
        setGenreOptions(genreArr);
        setFormData({
          ...data,
          releaseDate: releaseDate,
        });
      } else {
        setError(response.message || 'Failed to fetch movie');
      }
    } catch (error) {
      setError('Error fetching movie');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenreChange = (selected) => {
    setGenreOptions(selected);
    setFormData(prev => ({
      ...prev,
      genre: selected.map(opt => opt.value).join(', ')
    }));
  };

  const handleReleaseDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      releaseDate: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Ghép runtime
    const runtime = `${runtimeHour ? runtimeHour + 'h ' : ''}${runtimeMinute ? runtimeMinute + 'm' : ''}`.trim();
    try {
      const response = await updateMovie(unwrappedParams.id, { ...formData, runtime });
      if (response.success) {
        alert('Movie updated successfully!');
        router.push('/admin/movies');
      } else {
        alert(response.message || 'Failed to update movie');
      }
    } catch (error) {
      alert('Error updating movie');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" >
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <a
            href="/admin/movies"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Movies
          </a>
        </div>
      </div>
    );
  }

  return (
    // <AdminGuard>
    <div className="min-h-screen bg-gray-900 py-8 mt-5">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Movie</h1>
          <a
            href="/admin/movies"
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Movies
          </a>
        </div>

        <div className="bg-gray-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter movie title"
              />
            </div>

            {/* Directors */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Directors *
              </label>
              <input
                type="text"
                name="directors"
                value={formData.directors}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter directors"
              />
            </div>

            {/* Cast */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cast *
              </label>
              <input
                type="text"
                name="cast"
                value={formData.cast}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter cast members"
              />
            </div>

            {/* Synopsis */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Synopsis *
              </label>
              <textarea
                name="synopsis"
                value={formData.synopsis}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter movie synopsis"
              />
            </div>

            {/* Runtime and Release Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Runtime */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Runtime *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    name="runtimeHour"
                    value={runtimeHour}
                    onChange={(e) => setRuntimeHour(e.target.value)}
                    required
                    className="w-24 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Hours"
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    name="runtimeMinute"
                    value={runtimeMinute}
                    onChange={(e) => setRuntimeMinute(e.target.value)}
                    required
                    className="w-28 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Minutes"
                  />
                </div>
              </div>

              {/* Release Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Release Date *
                </label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleReleaseDateChange}
                  required
                  min={new Date().toISOString().split("T")[0]} // chỉ chọn từ hôm nay
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Genre and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre *
                </label>
                <Select
                  isMulti
                  name="genre"
                  options={GENRE_OPTIONS}
                  value={genreOptions}
                  onChange={handleGenreChange}
                  classNamePrefix="react-select"
                  className="text-black"
                  placeholder="Select genres..."
                  styles={customSelectStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., violence, language"
                />
              </div>
            </div>

            {/* Poster and Background URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Poster URL
                </label>
                <input
                  type="url"
                  name="poster"
                  value={formData.poster}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com/poster.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Background URL
                </label>
                <input
                  type="url"
                  name="background"
                  value={formData.background}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com/background.jpg"
                />
              </div>
            </div>

            {/* Trailer URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trailer URL
              </label>
              <input
                type="url"
                name="trailerUrl"
                value={formData.trailerUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label className="ml-2 text-sm font-medium text-gray-300">
                Active (Show in movie list)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/movies')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Update Movie'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    // </AdminGuard>
  );
} 