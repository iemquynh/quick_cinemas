"use client";
import { useEffect, useState } from 'react';
import SuperAdminGuard from '../../../components/AdminGuard.js';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

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
    const actionText = editingAdmin ? 'update' : 'create';

    const result = await Swal.fire({
      title: `Confirm ${actionText}?`,
      text: editingAdmin
        ? 'Do you want to save the changes?'
        : 'Do you want to create a new theater admin?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

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
        showToast('success', editingAdmin ? 'Updated successfully' : 'Created successfully');
      } else {
        showToast('error', 'Action failed');
      }
    } catch (error) {
      console.error('Error saving admin:', error);
      showToast('error', 'Action failed');
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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action will delete the admin permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/theater-admins/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAdmins();
        showToast('success', 'Deleted successfully');
      } else {
        showToast('error', 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      showToast('error', 'Delete failed');
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
      <div className="container mx-auto py-8 px-4" style={{ marginTop: 55 }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-white">Theater Admin Management</h2>
          <button
            className="btn bg-gray-600 hover:bg-gray-700 text-white w-full md:w-auto"
            onClick={() => setShowForm(true)}
          >
            Add Theater Admin
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-base-200 p-6 rounded mb-6">
            <h3 className="text-xl font-bold mb-4">
              {editingAdmin ? 'Sửa Admin Rạp' : 'Thêm Admin Rạp'}
            </h3>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingAdmin}
                />
              </div>
              <div>
                <label className="label">Theater chain</label>
                <select
                  className="select select-bordered w-full"
                  value={form.theater_chain}
                  onChange={(e) =>
                    setForm({ ...form, theater_chain: e.target.value })
                  }
                  required
                >
                  <option value="">Select theater chain</option>
                  {theaterChains.map((chain) => (
                    <option key={chain.value} value={chain.value}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
                <button type="submit" className="btn btn-primary w-full sm:w-auto">
                  {editingAdmin ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  className="btn bg-gray-500 hover:bg-gray-700 w-full sm:w-auto"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-base-200 rounded overflow-x-auto">
          <table className="table w-full table-fixed">
            <thead>
              <tr>
                <th className="w-1/4">Username</th>
                <th className="w-1/3">Email</th>
                <th className="w-1/4">Chuỗi Rạp</th>
                <th className="w-1/4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} className="break-words">
                  <td className="whitespace-normal break-words">{admin.username}</td>
                  <td className="whitespace-normal break-words">{admin.email}</td>
                  <td>{admin.theater_chain || 'N/A'}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="flex-1 px-4 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 transition text-sm"
                        onClick={() => handleEdit(admin)}
                      >
                        Edit
                      </button>
                      <button
                        className="flex-1 px-4 py-1 rounded bg-red-500 text-white hover:bg-red-700 transition text-sm"
                        onClick={() => handleDelete(admin._id)}
                      >
                        Delete
                      </button>
                    </div>
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
