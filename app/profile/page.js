'use client';

import { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import AuthGuard from '../../components/AuthGuard';
import { api } from '../../utils/api';

export default function ProfilePage() {
  const { user, loading, refreshUser } = useCurrentUser();
  const [editMode, setEditMode] = useState(false);
  const [changePwMode, setChangePwMode] = useState(false);
  const [form, setForm] = useState(user || {});
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  // Khi user thay đổi (login/logout), reset form
  if (user && !editMode && (form.id !== user.id)) {
    setForm(user);
  }

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Xử lý lưu profile
  const handleSave = async () => {
    setError(''); setMessage('');
    try {
      await api.put(`/api/users/${user.id}`, form);
      await refreshUser(); // Refetch lại user mới nhất
      setMessage('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    setError(''); setMessage('');
    setPwLoading(true);
    if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setError('Please fill all password fields.'); setPwLoading(false); return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError('New passwords do not match.'); setPwLoading(false); return;
    }
    try {
      await api.post(`/api/users/${user.id}/change-password`, {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      setMessage('Password changed successfully!');
      setChangePwMode(false);
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Change password failed');
    }
    setPwLoading(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-white mb-8">My Profile</h1>
          {message && <div className="mb-4 text-green-400">{message}</div>}
          {error && <div className="mb-4 text-red-400">{error}</div>}
          {/* Chế độ đổi mật khẩu */}
          {changePwMode ? (
            <div className="bg-gray-800 rounded-lg p-8 max-w-lg mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <input type="password" name="oldPassword" className="w-full rounded px-3 py-2" value={pwForm.oldPassword} onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input type="password" name="newPassword" className="w-full rounded px-3 py-2" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input type="password" name="confirmPassword" className="w-full rounded px-3 py-2" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
                </div>
              </div>
              <div className="flex space-x-4 mt-8">
                <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg" onClick={() => { setChangePwMode(false); setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); setError(''); }} disabled={pwLoading}>Cancel</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg" onClick={handleChangePassword} disabled={pwLoading}>{pwLoading ? 'Saving...' : 'OK'}</button>
              </div>
            </div>
          ) : editMode ? (
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input type="text" name="username" className="w-full rounded px-3 py-2" value={form.username || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input type="email" name="email" className="w-full rounded px-3 py-2" value={form.email || ''} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Favorite Genres</h2>
                  <input type="text" name="favorite_genres" className="w-full rounded px-3 py-2" value={form.favorite_genres ? form.favorite_genres.join(', ') : ''} onChange={e => setForm({ ...form, favorite_genres: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Genre1, Genre2, ..." />
                </div>
              </div>
              <div className="flex space-x-4 mt-8">
                <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg" onClick={() => { setEditMode(false); setForm(user); setError(''); }}>Cancel</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg" onClick={() => {
                  if (window.confirm('Are you sure you want to save changes?')) {
                    handleSave();
                  }
                }}>Change</button>
              </div>
            </div>
          ) : (
            user && (
              <div className="bg-gray-800 rounded-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                        <p className="text-white">{user.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <p className="text-white">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${user.role === true ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}>{user.role === true ? 'Admin' : 'User'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Favorite Genres</h2>
                    {user.favorite_genres && user.favorite_genres.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.favorite_genres.map((genre, index) => (
                          <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">{genre}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No favorite genres yet.</p>
                    )}
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-700 flex space-x-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg" onClick={() => { setEditMode(true); setForm(user); setError(''); setMessage(''); }}>Edit Profile</button>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg" onClick={() => { setChangePwMode(true); setError(''); setMessage(''); }}>Change Password</button>
                  {user.role === true && (
                    <a href="/admin/movies" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">Admin Panel</a>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 