// 'use client';

// import { useState } from 'react';
// import { useCurrentUser } from '../../hooks/useCurrentUser';
// import AuthGuard from '../../components/AuthGuard';
// import { api } from '../../utils/api';
// import Header from '../../components/Header';

// export default function ProfilePage() {
//   const { user, loading, refreshUser } = useCurrentUser();
//   const [editMode, setEditMode] = useState(false);
//   const [changePwMode, setChangePwMode] = useState(false);
//   const [form, setForm] = useState(user || {});
//   const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [pwLoading, setPwLoading] = useState(false);

//   if (loading) {
//     return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
//   }

//   // Khi user thay đổi (login/logout), reset form
//   if (user && !editMode && (form.id !== user.id)) {
//     setForm(user);
//   }

//   // Xử lý thay đổi input
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // Xử lý lưu profile
//   const handleSave = async () => {
//     setError(''); setMessage('');
//     try {
//       await api.put(`/api/users/${user.id}`, form);
//       await refreshUser(); // Refetch lại user mới nhất
//       setMessage('Profile updated successfully!');
//       setEditMode(false);
//     } catch (err) {
//       setError(err.message || 'Update failed');
//     }
//   };

//   // Xử lý đổi mật khẩu
//   const handleChangePassword = async () => {
//     setError(''); setMessage('');
//     setPwLoading(true);
//     if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
//       setError('Please fill all password fields.'); setPwLoading(false); return;
//     }
//     if (pwForm.newPassword !== pwForm.confirmPassword) {
//       setError('New passwords do not match.'); setPwLoading(false); return;
//     }
//     try {
//       await api.post(`/api/users/${user.id}/change-password`, {
//         oldPassword: pwForm.oldPassword,
//         newPassword: pwForm.newPassword,
//       });
//       setMessage('Password changed successfully!');
//       setChangePwMode(false);
//       setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
//     } catch (err) {
//       setError(err.message || 'Change password failed');
//     }
//     setPwLoading(false);
//   };

//   return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-gray-900 py-8 mt-16">
//         <div className="container mx-auto px-4 max-w-4xl">
//           <h1 className="text-4xl font-bold text-white mb-8">My Profile</h1>
//           {message && <div className="mb-4 text-green-400">{message}</div>}
//           {error && <div className="mb-4 text-red-400">{error}</div>}
//           {/* Chế độ đổi mật khẩu */}
//           {changePwMode ? (
//             <div className="bg-gray-800 rounded-lg p-8 max-w-lg mx-auto">
//               <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
//                   <input type="password" name="oldPassword" className="w-full rounded px-3 py-2" value={pwForm.oldPassword} onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
//                   <input type="password" name="newPassword" className="w-full rounded px-3 py-2" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
//                   <input type="password" name="confirmPassword" className="w-full rounded px-3 py-2" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
//                 </div>
//               </div>
//               <div className="flex space-x-4 mt-8">
//                 <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg" onClick={() => { setChangePwMode(false); setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); setError(''); }} disabled={pwLoading}>Cancel</button>
//                 <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg" onClick={handleChangePassword} disabled={pwLoading}>{pwLoading ? 'Saving...' : 'OK'}</button>
//               </div>
//             </div>
//           ) : editMode ? (
//             <div className="bg-gray-800 rounded-lg p-8">
//               <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
//                     <input type="text" name="username" className="w-full rounded px-3 py-2" value={form.username || ''} onChange={handleChange} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
//                     <input type="email" name="email" className="w-full rounded px-3 py-2" value={form.email || ''} onChange={handleChange} />
//                   </div>
//                 </div>
//                 {/* <div>
//                   <h2 className="text-2xl font-bold text-white mb-6">Favorite Genres</h2>
//                   <input type="text" name="favorite_genres" className="w-full rounded px-3 py-2" value={form.favorite_genres ? form.favorite_genres.join(', ') : ''} onChange={e => setForm({ ...form, favorite_genres: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Genre1, Genre2, ..." />
//                 </div> */}
//               </div>
//               <div className="flex space-x-4 mt-8">
//                 <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg" onClick={() => { setEditMode(false); setForm(user); setError(''); }}>Cancel</button>
//                 <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg" onClick={() => {
//                   if (window.confirm('Are you sure you want to save changes?')) {
//                     handleSave();
//                   }
//                 }}>Change</button>
//               </div>
//             </div>
//           ) : (
//             user && (
//               <div className="bg-gray-800 rounded-lg p-8">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
//                         <p className="text-white">{user.username}</p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
//                         <p className="text-white">{user.email}</p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
//                         <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-500 text-white">
//                           {user.role === 'super_admin'
//                             ? 'Super Admin'
//                             : user.role === 'theater_admin'
//                               ? 'Theater Admin'
//                               : 'User'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-bold text-white mb-6">Favorite Genres</h2>
//                     {user.favorite_genres && user.favorite_genres.length > 0 ? (
//                       <div className="flex flex-wrap gap-2">
//                         {user.favorite_genres.map((genre, index) => (
//                           <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">{genre}</span>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-gray-400">No favorite genres yet.</p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="mt-8 pt-6 border-t border-gray-700 flex space-x-4">
//                   <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg" onClick={() => { setEditMode(true); setForm(user); setError(''); setMessage(''); }}>Edit Profile</button>
//                   <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg" onClick={() => { setChangePwMode(true); setError(''); setMessage(''); }}>Change Password</button>
//                   {user.role === true && (
//                     <a href="/admin/movies" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">Admin Panel</a>
//                   )}
//                 </div>
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </>
//   );
// } 

'use client';

import { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import AuthGuard from '../../components/AuthGuard';
import { api } from '../../utils/api';
import Header from '../../components/Header';
import styles from '../auth/register/Register.module.css';
import Select from "react-select";
import { FiEye, FiEyeOff, FiX, FiArrowRight } from "react-icons/fi";
import Link from 'next/link';

const GENRE_OPTIONS = [
  { value: "Action", label: "Action" },
  { value: "Comedy", label: "Comedy" },
  { value: "Drama", label: "Drama" },
  { value: "Horror", label: "Horror" },
  { value: "Romance", label: "Romance" },
  { value: "Sci-Fi", label: "Sci-Fi" },
  { value: "Thriller", label: "Thriller" },
  { value: "Animation", label: "Animation" },
  { value: "Adventure", label: "Adventure" },
  { value: "Crime", label: "Crime" }
];

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: "#ffe066", // Màu vàng nổi bật
    backgroundColor: state.isFocused
      ? "#1abc9c"
      : state.isSelected
      ? "#159c86"
      : "#223a5f",
    fontWeight: state.isSelected ? "bold" : "normal",
    fontSize: 15,
    padding: 12,
    cursor: "pointer",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#223a5f",
    borderRadius: 5,
    marginTop: 4,
    zIndex: 10,
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#223a5f",
    borderRadius: 5,
    border: state.isFocused ? "2px solid #1abc9c" : "1.5px solid #1abc9c",
    color: "#fff",
    minHeight: 44,
    boxShadow: "none",
  }),
  multiValue: (provided) => ({
    ...provided,
    display: "none", // Ẩn tag genre đã chọn trên thanh select
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "2px 8px",
  }),
  input: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#b0b8c1",
  }),
};

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
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white animate-pulse">Loading...</div>;
  }

  if (user && !editMode && form.id !== user.id) {
    setForm(user);
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError(''); setMessage('');
    try {
      await api.put(`/api/users/${user.id}`, form);
      await refreshUser();
      setMessage('✅ Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  const handleRemoveGenre = (genre) => {
    setForm({
      ...form,
      favorite_genres: form.favorite_genres.filter((g) => g !== genre),
    });
  };

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
      setMessage('🔐 Password changed successfully!');
      setChangePwMode(false);
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Change password failed');
    }
    setPwLoading(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4 mt-16">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold text-white mb-8 text-center">🧑 My Profile</h1>
          {message && <div className="mb-4 p-4 bg-green-800/70 rounded-lg text-green-200 text-center">{message}</div>}
          {error && <div className="mb-4 p-4 bg-red-800/70 rounded-lg text-red-300 text-center">{error}</div>}

          {changePwMode ? (
            <div className="bg-gray-800/80 rounded-xl p-8 shadow-lg max-w-lg mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">Change Password</h2>
              <div className="space-y-4">
                {['oldPassword', 'newPassword', 'confirmPassword'].map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">{field.replace('Password', ' Password')}</label>
                    <input type="password" name={field} className="w-full rounded-lg px-4 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={pwForm[field]} onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div className="flex space-x-4 mt-8 justify-center">
                <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-full" onClick={() => { setChangePwMode(false); setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); setError(''); }}>Cancel</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full" onClick={handleChangePassword} disabled={pwLoading}>{pwLoading ? 'Saving...' : 'OK'}</button>
              </div>
            </div>
          ) : editMode ? (
            <div className="bg-gray-800/80 rounded-xl p-8 shadow-xl">
              <h2 className="text-2xl font-semibold text-white mb-6">Edit Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                    <input type="text" name="username" className="w-full rounded-lg px-4 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.username || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input type="email" name="email" className="w-full rounded-lg px-4 py-2 bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.email || ''} onChange={handleChange} />
                  </div>
                  <form className={styles.form1} onSubmit={handleChange}>
                    <label className={styles.label}>Favorite Genres</label>
                    <Select
                      isMulti
                      options={GENRE_OPTIONS}
                      classNamePrefix="customSelect"
                      styles={customStyles}
                      onChange={selected => {
                        setForm({ ...form, favorite_genres: selected.map(opt => opt.value) });
                      }}
                      value={GENRE_OPTIONS.filter(opt => form.favorite_genres.includes(opt.value))}
                    />
                    <div className={styles.selectedGenres}>
                      {form.favorite_genres.map((genre) => (
                        <span className={styles.genreTag} key={genre}>
                          {genre}
                          <button
                            type="button"
                            className={styles.genreRemove}
                            onClick={() => handleRemoveGenre(genre)}
                            aria-label={`Remove ${genre}`}
                          >
                            <FiX />
                          </button>
                        </span>
                      ))}
                    </div>
                    {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
                  </form>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-full" onClick={() => { setEditMode(false); setForm(user); setError(''); }}>Cancel</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full" onClick={() => window.confirm('Are you sure you want to save changes?') && handleSave()}>Save</button>
              </div>
            </div>
          ) : user && (
            <div className="bg-gray-800/80 rounded-xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">Personal Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400">Username:</span>
                      <p className="text-white font-medium">{user.username}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Role:</span>
                      <span className="inline-block ml-2 px-3 py-1 text-sm font-semibold rounded-full bg-blue-600 text-white capitalize">{user.role.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">Favorite Genres</h2>
                  {user.favorite_genres && user.favorite_genres.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.favorite_genres.map((genre, index) => (
                        <span key={index} className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">{genre}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No favorite genres yet.</p>
                  )}
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-gray-700 flex flex-wrap justify-center gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full" onClick={() => { setEditMode(true); setForm(user); setError(''); setMessage(''); }}>Edit Profile</button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-full" onClick={() => { setChangePwMode(true); setError(''); setMessage(''); }}>Change Password</button>
                {user.role === true && (
                  <Link href="/admin/movies" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full">Admin Panel</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}