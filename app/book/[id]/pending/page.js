"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Image from "next/image";

export default function PendingBookingPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // --- data ---
  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        setBooking(data);
        setLoading(false);
      });
  }, [bookingId]);

  // --- countdown ---
  useEffect(() => {
    if (!booking) return;
    const HOLD_TIMEOUT_MS = 2 * 60 * 1000; // 2 phút (giữ nguyên logic)
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

  const holdMs = 2 * 60 * 1000;
  const progress =
    countdown === null ? 100 : Math.max(0, Math.min(100, (countdown / holdMs) * 100));

  const mm = countdown !== null ? Math.floor(countdown / 60000) : 0;
  const ss =
    countdown !== null
      ? String(Math.floor((countdown % 60000) / 1000)).padStart(2, "0")
      : "00";

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0b1220] grid place-items-center p-8">
          <div className="text-gray-400 animate-pulse">Loading booking information…</div>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0b1220] grid place-items-center p-8">
          <div className="text-gray-400">Booking not found.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      {/* Background: cinema vibe, không chói */}
      <div className="relative min-h-screen overflow-hidden bg-[#0b1220] px-3 py-10 md:px-6 mt-12">
        {/* ambient lights */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="mx-auto w-full max-w-2xl">
          {/* Ticket Card */}
          <div className="relative rounded-3xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            {/* perforation holes */}
            <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-[#0b1220] border border-slate-800" />
            <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full bg-[#0b1220] border border-slate-800" />

            {/* Header */}
            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎬</span>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
                    Booking Pending
                  </h1>
                </div>
                <p className="text-slate-400 text-center">
                  Please wait while we confirm your bank transfer
                </p>
              </div>

              {/* Stepper */}
              <div className="mt-6 flex items-center justify-center gap-3 text-xs md:text-sm text-slate-300">
                <Step label="Booking" active />
                <Line />
                <Step label="Seats" active />
                <Line />
                <Step label="Payment" active={booking.payment_proof_url ? true : false} />
              </div>
            </div>

            {/* Divider (dashed like ticket) */}
            <div className="mx-6 md:mx-8 h-[1px] border-t border-dashed border-slate-700" />

            {/* Body */}
            <div className="px-6 py-6 md:px-8 md:py-8 space-y-6">
              {/* Booking ID */}
              <div>
                <p className="text-slate-300 font-semibold">Booking ID</p>
                <p className="mt-1 font-mono text-blue-300 underline decoration-blue-800/60 underline-offset-4 break-all">
                  {booking._id}
                </p>
              </div>

              {/* Status + Countdown */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-slate-300 font-semibold">Status</p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-500/10 px-3 py-1">
                    <span className="relative inline-flex">
                      <span className="absolute inline-flex h-3 w-3 rounded-full bg-yellow-400 opacity-60 animate-ping" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-400" />
                    </span>
                    <span className="text-yellow-300 text-sm font-bold capitalize">
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-slate-300 font-semibold">Time left for confirmation</p>
                  <div className="mt-2">
                    <div className="h-2 w-full rounded-full bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-400/80 to-lime-300/70 transition-[width] duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2 font-mono text-slate-200">
                      {countdown > 0 ? (
                        <span>
                          {mm}:{ss} <span className="text-slate-400 text-xs">min</span>
                        </span>
                      ) : (
                        <span className="text-red-300 text-sm">
                          Time’s up. Please contact admin.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seats */}
              <div>
                <p className="text-slate-300 font-semibold">Selected Seats</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {booking.seats.map((s) => (
                    <span
                      key={s.seat_id}
                      className="rounded-lg bg-indigo-500/15 px-3 py-1 text-sm font-medium text-indigo-200 shadow-sm ring-1 ring-inset ring-indigo-400/20 hover:scale-105 transition"
                    >
                      {s.seat_id}{" "}
                      <span className="text-slate-400 font-normal">({s.type})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment proof */}
              <div>
                <p className="text-slate-300 font-semibold">Payment Proof</p>
                {booking.payment_proof_url ? (
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="mt-3 block w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 shadow hover:shadow-lg transition"
                    title="Click to preview"
                  >
                    <Image
                      src={booking.payment_proof_url}
                      alt="Payment Proof"
                      width={1200}
                      height={800}
                      className="mx-auto max-h-80 w-auto object-contain"
                    />
                  </button>
                ) : (
                  <p className="mt-2 italic text-slate-500">No payment proof uploaded</p>
                )}
              </div>

              {/* Tips / CTAs (không đụng vào logic) */}
              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
                
                <a
                  href="/my-tickets"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                >
                  Back to My Tickets
                </a>
              </div>
            </div>
          </div>

          {/* tiny footer */}
          <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-slate-500">
            You will be notified once the booking is confirmed or canceled.
          </p>
        </div>

        {/* Image preview modal */}
        {previewOpen && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
              <Image
                src={booking.payment_proof_url}
                alt="Payment Proof Large"
                width={1600}
                height={1200}
                className="mx-auto h-auto max-h-[85vh] w-auto object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* --- tiny subcomponents --- */
function Step({ label, active }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-yellow-400" : "bg-gray-500"
        }`}
      />
      <span className={active ? "text-yellow-400 font-medium" : "text-gray-400"}>
        {label}
      </span>
    </div>
  );
}


function Line() {
  return <div className="h-px w-6 md:w-10 bg-slate-700/60" />;
}
