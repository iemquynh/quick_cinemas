"use client";
import { useEffect, useState } from 'react';
import SuperAdminGuard from '../../../components/AdminGuard.js';

export default function TheaterAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    theater_chain: ''
  });

  // Predefined theater chain options
  const theaterChains = [
    { value: 'CGV', name: 'CGV' },
    { value: 'Lotte Cinema', name: 'Lotte Cinema' },
    { value: 'Galaxy Cinema', name: 'Galaxy Cinema' },
    { value: 'BHD Star Cineplex', name: 'BHD Star Cineplex' },
    { value: 'Beta Cinemas', name: 'Beta Cinemas' }
  ];

  useEffect(() => {
    fetchAdmins();
    setLoading(false);
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/theater-admins');
      const data = await res.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingAdmin 
      ? `/api/admin/theater-admins/${editingAdmin._id}`
      : '/api/admin/theater-admins';
    
    const method = editingAdmin ? 'PUT' : 'POST';
    const body = editingAdmin 
      ? { ...form, password: form.password || undefined }
      : form;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setShowForm(false);
        setEditingAdmin(null);
        setForm({ username: '', email: '', password: '', theater_chain: '' });
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error saving admin:', error);
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setForm({
      username: admin.username,
      email: admin.email,
      password: '',
      theater_chain: admin.theater_chain || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa admin này?')) return;
    
    try {
      const res = await fetch(`/api/admin/theater-admins/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAdmin(null);
    setForm({ username: '', email: '', password: '', theater_chain: '' });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <SuperAdminGuard>
      <div className="container mx-auto py-8" style={{marginTop: 55}}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Quản lý Admin Rạp</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(true)}
          >
            Thêm Admin Rạp
          </button>
        </div>

        {showForm && (
          <div className="bg-base-200 p-6 rounded mb-6">
            <h3 className="text-xl font-bold mb-4">
              {editingAdmin ? 'Sửa Admin Rạp' : 'Thêm Admin Rạp'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={form.username}
                  onChange={(e) => setForm({...form, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label">
                  Password {editingAdmin && '(Để trống nếu không đổi)'}
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  required={!editingAdmin}
                />
              </div>
              <div>
                <label className="label">Chuỗi Rạp</label>
                <select
                  className="select select-bordered w-full"
                  value={form.theater_chain}
                  onChange={(e) => setForm({...form, theater_chain: e.target.value})}
                  required
                >
                  <option value="">Chọn chuỗi rạp</option>
                  {theaterChains.map(chain => (
                    <option key={chain.value} value={chain.value}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingAdmin ? 'Cập nhật' : 'Thêm'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-base-200 rounded">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Chuỗi Rạp</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin._id}>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>{admin.theater_chain || 'N/A'}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-info mr-2"
                      onClick={() => handleEdit(admin)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(admin._id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminGuard>
  );
} 