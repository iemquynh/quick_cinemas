"use client"
import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useAdmin } from '@/hooks/useCurrentUser';

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
      screenTypes: checked ? [...prev.screenTypes, value] : prev.screenTypes.filter(t => t !== value)
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
      // Cập nhật lại bảng
      const updated = await res.json();
      setTheaters(theaters.map(t => t._id === id ? updated : t));
      setEditId(null);
      setEditData({ name: '', address: '', rooms: 1, screenTypes: [] });
    } else {
      alert('Update failed');
    }
  }

  return (
    <AdminGuard>
      <div className="container mx-auto py-8" style={{marginTop: 55}}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Theater Lists</h2>
          <a href="/admin/theaters/create" className="btn btn-primary">Add Theater</a>
        </div>
        {loading ? <div className="text-white">Loading...</div> : error ? <div className="text-error">{error}</div> : (
          <table className="table w-full bg-base-200">
            <thead>
              <tr>
                <th>Theater's name</th>
                <th>Address</th>
                <th>Rooms</th>
                <th>Screen Types</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {theaters
                .filter(theater => {
                  if (!user?.theater_chain) return true;
                  const getFirstWord = str => str?.trim().split(' ')[0]?.toLowerCase() || '';
                  return getFirstWord(user.theater_chain) === getFirstWord(theater.name);
                })
                .map(theater => (
                <tr key={theater._id}>
                  <td>
                    {editId === theater._id ? (
                      <input
                        className="input input-sm"
                        value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                      />
                    ) : (
                      theater.name
                    )}
                  </td>
                  <td>
                    {editId === theater._id ? (
                      <input
                        className="input input-sm"
                        value={editData.address}
                        onChange={e => setEditData({ ...editData, address: e.target.value })}
                      />
                    ) : (
                      theater.address
                    )}
                  </td>
                  <td>
                    {editId === theater._id ? (
                      <input
                        type="number"
                        min={1}
                        max={50}
                        className="input input-sm"
                        value={editData.rooms}
                        onChange={e => setEditData({ ...editData, rooms: Number(e.target.value) })}
                      />
                    ) : (
                      theater.rooms || ''
                    )}
                  </td>
                  <td>
                    {editId === theater._id ? (
                      <div className="flex flex-wrap gap-2">
                        {SCREEN_TYPE_OPTIONS.map(type => (
                          <label key={type} className="flex items-center gap-1">
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
                      <div className="flex flex-wrap gap-2">
                        {(theater.screenTypes || []).map(type => (
                          <span key={type} className="badge badge-info text-white">{type}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="flex gap-2">
                    {editId === theater._id ? (
                      <>
                        <button className="btn btn-xs btn-success" onClick={() => handleSaveEdit(theater._id)} title="Save"><FaSave /></button>
                        <button className="btn btn-xs btn-ghost" onClick={handleCancelEdit} title="Cancel"><FaTimes /></button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-xs btn-info" onClick={() => handleEdit(theater)} title="Edit"><FaEdit /></button>
                        <button className="btn btn-xs btn-error" onClick={() => handleDelete(theater._id)} title="Delete"><FaTrash /></button>
                      </>
                    )}
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