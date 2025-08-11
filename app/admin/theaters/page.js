"use client"
import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useAdmin } from '@/hooks/useCurrentUser';
import Link from 'next/link';

const SCREEN_TYPE_OPTIONS = ['2D', '3D', 'IMAX', '4DX', 'ScreenX'];

export default function TheaterListPage() {
  const { user } = useAdmin();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', address: '', rooms: 1, screenTypes: [] });

  useEffect(() => {
    fetchTheaters();
  }, []);

  async function fetchTheaters() {
    setLoading(true);
    try {
      const res = await fetch('/api/theaters');
      const data = await res.json();
      setTheaters(data);
      setLoading(false);
    } catch {
      setError('Failed to load theaters');
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this theater?')) return;
    const res = await fetch(`/api/theaters/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTheaters(theaters.filter(t => t._id !== id));
    } else {
      alert('Delete failed');
    }
  }

  function handleEdit(theater) {
    setEditId(theater._id);
    setEditData({
      name: theater.name || '',
      address: theater.address || '',
      rooms: theater.rooms || 1,
      screenTypes: Array.isArray(theater.screenTypes) ? theater.screenTypes : [],
    });
  }

  function handleCancelEdit() {
    setEditId(null);
    setEditData({ name: '', address: '', rooms: 1, screenTypes: [] });
  }

  function handleScreenTypeChange(e) {
    const { value, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      screenTypes: checked
        ? [...prev.screenTypes, value]
        : prev.screenTypes.filter(t => t !== value),
    }));
  }

  async function handleSaveEdit(id) {
    if (!window.confirm('Are you sure you want to save changes?')) return;
    const res = await fetch(`/api/theaters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      const updated = await res.json();
      setTheaters(theaters.map(t => (t._id === id ? updated : t)));
      setEditId(null);
      setEditData({ name: '', address: '', rooms: 1, screenTypes: [] });
    } else {
      alert('Update failed');
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 md:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 px-2 sm:px-0 mt-5">
          <h2 className="text-lg sm:text-2xl font-bold text-white whitespace-nowrap">Theater Lists</h2>
          <Link
            href="/admin/theaters/create"
            className="btn btn-primary btn-sm sm:btn-md text-sm sm:text-base whitespace-nowrap"
          >
            Add Theater
          </Link>
        </div>


        {loading ? (
          <div className="text-white">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-gray-800 shadow-lg">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700 text-sm text-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Address</th>
                  <th className="px-6 py-4 text-left">Rooms</th>
                  <th className="px-6 py-4 text-left">Screen Types</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {theaters
                  .filter(theater => {
                    if (!user?.theater_chain) return true;
                    const getFirstWord = str => str?.trim().split(' ')[0]?.toLowerCase() || '';
                    return getFirstWord(user.theater_chain) === getFirstWord(theater.name);
                  })
                  .map(theater => (
                    <tr key={theater._id} className="hover:bg-gray-700 transition">
                      <td className="px-6 py-4">
                        {editId === theater._id ? (
                          <input
                            className="input input-sm w-full bg-gray-900 text-white rounded-md"
                            value={editData.name}
                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                          />
                        ) : (
                          theater.name
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editId === theater._id ? (
                          <input
                            className="input input-sm w-full bg-gray-900 text-white rounded-md"
                            value={editData.address}
                            onChange={e => setEditData({ ...editData, address: e.target.value })}
                          />
                        ) : (
                          theater.address
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editId === theater._id ? (
                          <input
                            type="number"
                            min={1}
                            max={50}
                            className="input input-sm w-20 bg-gray-900 text-white rounded-md"
                            value={editData.rooms}
                            onChange={e => setEditData({ ...editData, rooms: Number(e.target.value) })}
                          />
                        ) : (
                          theater.rooms
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editId === theater._id ? (
                          <div className="flex flex-wrap gap-2">
                            {SCREEN_TYPE_OPTIONS.map(type => (
                              <label key={type} className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  value={type}
                                  checked={editData.screenTypes.includes(type)}
                                  onChange={handleScreenTypeChange}
                                />
                                {type}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(theater.screenTypes || []).map(type => (
                              <span
                                key={type}
                                className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {editId === theater._id ? (
                            <>
                              <button
                                className="btn btn-xs bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleSaveEdit(theater._id)}
                                title="Save"
                              >
                                <FaSave />
                              </button>
                              <button
                                className="btn btn-xs btn-ghost"
                                onClick={handleCancelEdit}
                                title="Cancel"
                              >
                                <FaTimes />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-xs bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={() => handleEdit(theater)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn btn-xs bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDelete(theater._id)}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
