"use client";
import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useCurrentUser";
// import AdminGuard from "@/components/AdminGuard";
import Image from "next/image";

const STATUS_TABS = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "using", label: "Đang sử dụng" },
  { key: "cancel", label: "Đã hủy" },
  { key: "expired", label: "Hết hiệu lực" },
];

export default function AdminTicketsPage() {
  const { user, loading } = useAdmin();
  const [tab, setTab] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user?.theater_chain) return;
    setLoadingData(true);
    fetch(`/api/admin/bookings?theater_chain=${encodeURIComponent(user.theater_chain)}&status=${tab}`)
      .then(res => res.json())
      .then(data => setBookings(data))
      .finally(() => setLoadingData(false));
  }, [user?.theater_chain, tab]);

  async function handleUpdateStatus(bookingId, status) {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");
      // Reload lại danh sách vé
      setBookings(bookings => bookings.filter(b => b._id !== bookingId));
    } catch (err) {
      alert("Có lỗi khi cập nhật trạng thái vé: " + err.message);
    }
  }

  return (
    // <AdminGuard>
      <div className="container mx-auto py-8" style={{marginTop: 55}}>
        <h1 className="text-2xl font-bold text-white mb-6">Quản lý vé</h1>
        <div className="flex gap-4 mb-6">
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              className={`px-4 py-2 rounded font-semibold ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {loadingData ? (
          <div className="text-center text-white">Đang tải dữ liệu...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center text-gray-400">Không có vé nào.</div>
        ) : (
          <div className="grid gap-6">
            {bookings.map(b => (
              <div key={b._id} className="bg-white/90 rounded-xl shadow p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <div className="font-bold text-lg text-blue-700 mb-2">Mã vé: {b._id}</div>
                  <div className="mb-1">Trạng thái: <span className="capitalize font-semibold text-yellow-600">{b.status}</span></div>
                  <div className="mb-1">Ghế: {b.seats.map(s => s.seat_id).join(", ")}</div>
                  <div className="mb-1">Ngày đặt: {new Date(b.createdAt).toLocaleString()}</div>
                  {b.payment_proof_url && (
                    <div className="mb-1">Ảnh giao dịch:<br /><Image src={b.payment_proof_url} alt="Ảnh giao dịch" className="mt-1 max-h-32 rounded border" /></div>
                  )}
                </div>
                {tab === "pending" && (
                  <div className="flex flex-col gap-2">
                    <button
                      className="px-4 py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700"
                      onClick={() => handleUpdateStatus(b._id, "using")}
                    >
                      Xác nhận vé
                    </button>
                    <button
                      className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700"
                      onClick={() => handleUpdateStatus(b._id, "cancel")}
                    >
                      Hủy vé
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    // </AdminGuard>
  );
} 