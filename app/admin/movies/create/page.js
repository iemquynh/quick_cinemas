'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMovie } from '../../../../utils/movieApi';
import Select from 'react-select';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function CreateMoviePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    isActive: true,
  });

  const [runtimeHour, setRuntimeHour] = useState('');
  const [runtimeMinute, setRuntimeMinute] = useState('');
  const [genreOptions, setGenreOptions] = useState([]);

  const GENRE_OPTIONS = [
    { value: 'Action', label: 'Action' },
    { value: 'Comedy', label: 'Comedy' },
    { value: 'Drama', label: 'Drama' },
    { value: 'Horror', label: 'Horror' },
    { value: 'Romance', label: 'Romance' },
    { value: 'Sci-Fi', label: 'Sci-Fi' },
    { value: 'Thriller', label: 'Thriller' },
    { value: 'Animation', label: 'Animation' },
    { value: 'Adventure', label: 'Adventure' },
    { value: 'Crime', label: 'Crime' },
  ];

  const customSelectStyles = {
    control: (base) => ({ ...base, backgroundColor: '#374151', borderColor: '#4b5563', color: '#fff' }),
    menu: (base) => ({ ...base, backgroundColor: '#1f2937', color: '#fff', zIndex: 50 }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#1e40af' : '#374151',
      color: '#fff',
      fontWeight: state.isSelected ? 'bold' : 'normal',
    }),
    multiValue: (base) => ({ ...base, backgroundColor: '#2563eb', color: '#fff' }),
    multiValueLabel: (base) => ({ ...base, color: '#fff' }),
    placeholder: (base) => ({ ...base, color: '#d1d5db' }),
    singleValue: (base) => ({ ...base, color: '#fff' }),
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleGenreChange = (selected) => {
    setGenreOptions(selected);
    setFormData((prev) => ({ ...prev, genre: selected.map((opt) => opt.value).join(', ') }));
  };

  const showToast = (icon, title) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 2000
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const runtime = `${runtimeHour ? runtimeHour + 'h ' : ''}${runtimeMinute ? runtimeMinute + 'm' : ''}`.trim();

    try {
      const response = await createMovie({ ...formData, runtime });
      if (response.success) {
        showToast('success', 'Movie created successfully!');
        setTimeout(() => {
          router.push('/admin/movies');
        }, 1000);
      } else {
        showToast('error', response.message || 'Failed to create movie');
      }
    } catch (error) {
      showToast('error', 'Error creating movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 px-4 md:px-6 lg:px-8" style={{ marginTop: 20 }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">Create New Movie</h1>
          <a
            href="/admin/movies"
            className="inline-block text-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Back to Movies
          </a>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-lg p-6 md:p-8 space-y-6 shadow-lg"
        >
          {/* Title */}
          <InputField label="Title *" name="title" value={formData.title} onChange={handleChange} required />

          {/* Directors */}
          <InputField label="Directors *" name="directors" value={formData.directors} onChange={handleChange} required />

          {/* Cast */}
          <InputField label="Cast *" name="cast" value={formData.cast} onChange={handleChange} required />

          {/* Synopsis */}
          <div>
            <Label text="Synopsis *" />
            <textarea
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
              rows={4}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Enter movie synopsis"
            />
          </div>

          {/* Runtime + Release Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label text="Runtime *" />
              <div className="flex gap-3">
                <input
                  type="number"
                  min="0"
                  value={runtimeHour}
                  onChange={(e) => setRuntimeHour(e.target.value)}
                  className="w-full max-w-[100px] bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Hours"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={runtimeMinute}
                  onChange={(e) => setRuntimeMinute(e.target.value)}
                  className="w-full max-w-[100px] bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Minutes"
                />
              </div>
            </div>
            <InputField
              label="Release Date *"
              name="releaseDate"
              type="date"
              value={formData.releaseDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Genre + Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label text="Genre *" />
              <Select
                isMulti
                name="genre"
                options={GENRE_OPTIONS}
                value={genreOptions}
                onChange={handleGenreChange}
                styles={customSelectStyles}
                className="text-white"
                placeholder="Select genres..."
              />
            </div>
            <InputField label="Tags" name="tags" value={formData.tags} onChange={handleChange} />
          </div>

          {/* Poster + Background */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Poster URL"
              name="poster"
              value={formData.poster}
              onChange={handleChange}
              type="url"
              placeholder="https://example.com/poster.jpg"
            />
            <InputField
              label="Background URL"
              name="background"
              value={formData.background}
              onChange={handleChange}
              type="url"
              placeholder="https://example.com/background.jpg"
            />
          </div>

          {/* Trailer */}
          <InputField
            label="Trailer URL"
            name="trailerUrl"
            value={formData.trailerUrl}
            onChange={handleChange}
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
          />

          {/* Active */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label className="text-sm text-gray-300 font-medium">Active (Show in movie list)</label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/movies')}
              className="px-5 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-md"
            >
              {loading ? 'Creating...' : 'Create Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = 'text', placeholder, required = false, min }) {
  return (
    <div>
      <Label text={label} />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

function Label({ text }) {
  return <label className="block text-sm font-medium text-gray-300 mb-2">{text}</label>;
}
