'use client';
import AdminGuard from '@/components/AdminGuard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useCurrentUser';

const SCREEN_TYPE_OPTIONS = ['2D', '3D', 'IMAX', '4DX', 'ScreenX'];

export default function CreateTheaterPage() {
  const router = useRouter();
  const { user } = useAdmin();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [rooms, setRooms] = useState(1);
  const [screenTypes, setScreenTypes] = useState([]);
  const [message, setMessage] = useState('');

  function handleScreenTypeChange(e) {
    const { value, checked } = e.target;
    setScreenTypes(prev => checked ? [...prev, value] : prev.filter(t => t !== value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    // Kiểm tra ký tự đầu tiên
    if (user?.theater_chain) {
      const userChainFirst = user.theater_chain.trim()[0]?.toLowerCase();
      const nameFirst = name.trim()[0]?.toLowerCase();
      if (userChainFirst !== nameFirst) {
        setMessage("Tên rạp phải bắt đầu bằng ký tự đầu tiên của chuỗi rạp bạn quản lý (" + user.theater_chain + "). Vui lòng nhập lại cho đúng!");
        return;
      }
    }
    try {
      const res = await fetch('/api/theaters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, rooms, screenTypes, theater_chain: user?.theater_chain }),
      });
      if (res.ok) {
        router.push('/admin/theaters');
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.message || 'Create theater fail. Please try again!');
      }
    } catch (err) {
      setMessage('An error occurred. Please try again!');
    }
  }

  return (
    // <AdminGuard>
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] pt-10"> {/* 64px là chiều cao navbar */}
        <div className="w-full max-w-md bg-base-200 p-6 rounded shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-center">Create a theater</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theater's name</label>
              <input className="input input-bordered w-full" placeholder="Theater's name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input className="input input-bordered w-full" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of rooms</label>
              <input type="number" min={1} max={50} className="input input-bordered w-full" value={rooms} onChange={e => setRooms(Number(e.target.value))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Screen Types</label>
              <div className="flex flex-wrap gap-3">
                {SCREEN_TYPE_OPTIONS.map(type => (
                  <label key={type} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      value={type}
                      checked={screenTypes.includes(type)}
                      onChange={handleScreenTypeChange}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button type="button" className="btn btn-secondary" onClick={() => router.push('/admin/theaters')}>Cancel</button>
              <button className="btn btn-primary" type="submit">Create</button>
            </div>
          </form>
          {message && <div className="mt-2 text-error text-center">{message}</div>}
        </div>
      </div>
    // </AdminGuard>
  );
} 