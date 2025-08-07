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
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then(res => res.json())
      .then(data => {
        setBooking(data);
        setLoading(false);
      });
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return;
    const HOLD_TIMEOUT_MS = 2 * 60 * 1000;
    const created = new Date(booking.createdAt).getTime();
    const end = created + HOLD_TIMEOUT_MS;
    function updateCountdown() {
      const now = Date.now();
      const diff = end - now;
      setCountdown(diff > 0 ? diff : 0);
    }
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [booking]);

  if (loading) return <div className="p-8 text-center text-white">Loading booking information...</div>;
  if (!booking) return <div className="p-8 text-center text-white">Booking not found.</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#181c2f] flex flex-col items-center py-8 px-2 mt-10">
        <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-center text-[#3b3b3b] mb-6 tracking-wide">Booking Pending Confirmation</h2>
          <div className="mb-4 text-center text-lg text-gray-700 font-semibold">Please wait for the admin to confirm your bank transfer.</div>
          <div className="mb-4">
            <div className="font-semibold text-gray-800">Booking ID:</div>
            <div className="text-blue-700 font-bold">{booking._id}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-800">Status:</div>
            <div className="text-yellow-600 font-bold capitalize">{booking.status}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-800">Selected Seats:</div>
            <div className="flex flex-wrap gap-2">
              {booking.seats.map(s => (
                <span key={s.seat_id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold text-sm shadow">
                  {s.seat_id} <span className="font-normal">({s.type})</span>
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-800">Payment Proof:</div>
            {booking.payment_proof_url ? (
              <img src={booking.payment_proof_url} alt="Payment Proof" className="mt-2 max-h-60 rounded border mx-auto" />
            ) : (
              <div className="italic text-gray-500">No payment proof uploaded</div>
            )}
          </div>
          <div className="mb-4 text-gray-800">
            <div className="font-semibold">Booking Time:</div>
            <div>{new Date(booking.createdAt).toLocaleString()}</div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-800">Time left for confirmation:</div>
            <div className="text-gray-600 font-bold text-sm">
              {countdown !== null ? (
                countdown > 0
                  ? `${Math.floor(countdown / 60000)}:${String(Math.floor((countdown % 60000) / 1000)).padStart(2, '0')} min`
                  : "Time's up. If you haven't received confirmation, please contact the admin for support."
              ) : '...'}
            </div>
          </div>
          <div className="text-center text-gray-600 mt-6">You will receive a notification when the booking is confirmed or canceled.</div>
        </div>
      </div>
    </>
  );
}
