"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

export default function PendingBookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const showtimeId = params.id;
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then(res => res.json())
      .then(data => {
        setBooking(data);
        setLoading(false);
      });
  }, [bookingId]);

  if (loading) return <div className="p-8 text-center text-white">Đang tải thông tin vé...</div>;
  if (!booking) return <div className="p-8 text-center text-white">Không tìm thấy vé.</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#181c2f] flex flex-col items-center py-8 px-2 mt-10">
        <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-center text-[#3b3b3b] mb-6 tracking-wide">Vé đang chờ xác nhận</h2>
          <div className="mb-4 text-center text-lg text-gray-700 font-semibold">Vui lòng chờ admin xác nhận giao dịch chuyển khoản của bạn.</div>
          <div className="mb-4">
            <div className="font-semibold text-gray-800">Mã vé:</div>
            <div className="text-blue-700 font-bold">{booking._id}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-800">Trạng thái:</div>
            <div className="text-yellow-600 font-bold capitalize">{booking.status}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-800">Ghế đã đặt:</div>
            <div className="flex flex-wrap gap-2">
              {booking.seats.map(s => (
                <span key={s.seat_id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold text-sm shadow">
                  {s.seat_id} <span className="font-normal">({s.type})</span>
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-800">Ảnh giao dịch:</div>
            {booking.payment_proof_url ? (
              <img src={booking.payment_proof_url} alt="Ảnh giao dịch" className="mt-2 max-h-60 rounded border mx-auto" />
            ) : (
              <div className="italic text-gray-500">Chưa có ảnh giao dịch</div>
            )}
          </div>
          <div className="mb-4 text-gray-800">
            <div className="font-semibold">Ngày đặt:</div>
            <div>{new Date(booking.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-center text-gray-600 mt-6">Bạn sẽ nhận được thông báo khi vé được xác nhận hoặc bị hủy.</div>
        </div>
      </div>
    </>
  );
} 