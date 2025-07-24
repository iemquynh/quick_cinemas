"use client";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Header from "@/components/Header";
import { useSearchParams } from "next/navigation";
import BookingQRCode from "@/components/BookingQRCode";

const STATUS_TABS = [
  { key: "using", label: "Using" },
  { key: "cancel", label: "Cancel" },
  { key: "expired", label: "Expired" },
];

export default function MyTicketsPage() {
  const { user, loading } = useCurrentUser();
  const [tab, setTab] = useState("using");
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const urlTab = searchParams.get("tab");
  const ticketRefs = useRef({});

  // Thêm log kiểm tra user
  console.log('User in MyTicketsPage:', user);

  useEffect(() => {
    const userId = user?._id || user?.id;
    console.log('useEffect userId:', userId, 'tab:', tab);
    if (!userId) return;
    setLoadingData(true);
    fetch(`/api/users/bookings?user_id=${userId}&status=${tab}`)
      .then(res => res.json())
      .then(data => {
        console.log("API bookings data:", data); // Thêm dòng này
        // Nếu data là mảng thì dùng luôn, nếu là object thì lấy thuộc tính bookings
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      })
      .finally(() => setLoadingData(false));
  }, [user, tab]);

  useEffect(() => {
    if (bookingId && ticketRefs.current[bookingId]) {
      ticketRefs.current[bookingId].scrollIntoView({ behavior: "smooth", block: "center" });
      ticketRefs.current[bookingId].classList.add("ring-4", "ring-blue-400");
      setTimeout(() => {
        ticketRefs.current[bookingId]?.classList.remove("ring-4", "ring-blue-400");
      }, 2000);
    }
  }, [bookings, bookingId]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#181c2f] flex flex-col items-center py-8 px-2 mt-10">
        <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-center text-[#3b3b3b] mb-6 tracking-wide">Booking History</h2>
          <div className="flex gap-4 mb-6 justify-center">
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
              {bookings.map(b => {
                const showtime = b.showtime_id;
                const theater = showtime?.theater_id;
                const movie = showtime?.movie_id;
                return (
                  <div
                    key={b._id}
                    ref={el => ticketRefs.current[b._id] = el}
                    className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-blue-200 hover:shadow-lg transition-all"
                    style={{ marginBottom: 16 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="font-bold text-xl text-blue-700">
                        Mã vé: <span className="break-all">{b._id}</span>
                        <BookingQRCode booking={b} />
                      </div>
                      <span
                        className={
                          "px-3 py-1 rounded-full text-sm font-semibold " +
                          (b.status === "using"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : b.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                            : b.status === "cancel"
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-gray-100 text-gray-700 border border-gray-300")
                        }
                      >
                        {b.status === "using"
                          ? "Using"
                          : b.status === "pending"
                          ? "Pending"
                          : b.status === "cancel"
                          ? "Cancel"
                          : "Expire"}
                      </span>
                    </div>
                    <div className="mb-1 text-base">
                      <span className="font-semibold text-gray-700">Phim:</span>{" "}
                      <span className="text-gray-900">{movie?.title || 'Không rõ'}</span>
                    </div>
                    <div className="mb-1 text-base">
                      <span className="font-semibold text-gray-700">Rạp:</span>{" "}
                      <span className="text-gray-900">{theater?.name || 'Không rõ'}</span>
                    </div>
                    <div className="mb-1 text-base">
                      <span className="font-semibold text-gray-700">Địa chỉ:</span>{" "}
                      <span className="text-gray-900">{theater?.address || 'Không rõ'}</span>
                    </div>
                    <div className="mb-1 text-base">
                      <span className="font-semibold text-gray-700">Thời gian chiếu:</span>{" "}
                      <span className="text-gray-900">{showtime?.time ? new Date(showtime.time).toLocaleString() : 'Không rõ'}</span>
                    </div>
                    <div className="mb-1 text-base">
                      <span className="font-semibold text-gray-700">Ghế:</span>{" "}
                      <span className="text-gray-900">
                        {b.seats.map(s => `${s.seat_id}${s.type ? ` (${s.type})` : ''}`).join(", ")}
                      </span>
                    </div>
                    {b.combos && Object.keys(b.combos).length > 0 && (
                      <div className="mb-1 text-base">
                        <span className="font-semibold text-gray-700">Combo:</span>{" "}
                        <span className="text-gray-900">
                          {Object.entries(b.combos)
                            .map(([name, value]) =>
                              value > 0 ? `${name}: ${value}` : null
                            )
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="mb-1 text-base">
                      <span className="font-semibold text-gray-700">Ngày đặt:</span>{" "}
                      <span className="text-gray-900">{new Date(b.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 