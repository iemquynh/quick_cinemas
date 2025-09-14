"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SeatMap from "@/components/SeatMap";
import { seatmapConfigs } from "@/components/seatmapConfigs";
import Header from "@/components/Header";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Hàm chuẩn hóa lấy seatConfig theo tên rạp (giống trang admin)
function getSeatConfigByTheaterName(theaterName) {
  if (!theaterName) return seatmapConfigs.Default;
  const firstWord = theaterName.trim().split(' ')[0].toLowerCase();
  if (firstWord === 'cgv') return seatmapConfigs.CGV;
  if (firstWord === 'lotte') return seatmapConfigs.Lotte;
  if (firstWord === 'galaxy') return seatmapConfigs.Galaxy;
  if (firstWord === 'bhd') return seatmapConfigs.BHD;
  if (firstWord === 'beta') return seatmapConfigs.Beta;
  return seatmapConfigs.Default;
}

export default function BookShowtimePage() {
  const { user } = useCurrentUser();
  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]); // Thêm dòng này
  const [seatConfig, setSeatConfig] = useState(seatmapConfigs.Default); // Thêm dòng này
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [comboCounts, setComboCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const router = useRouter();
  const { id: showtimeId } = useParams();

  useEffect(() => {
    if (!showtimeId) return;
    fetch(`/api/showtimes/${showtimeId}`)
      .then(res => res.json())
      .then(data => {
        setShowtime(data);
        setSeats(Array.isArray(data.seats_layout) ? data.seats_layout : []);
        // Lấy config sơ đồ ghế theo tên rạp (dùng hàm chuẩn hóa)
        const theaterName = data.theater_id?.name;
        setSeatConfig(getSeatConfigByTheaterName(theaterName));
        setLoading(false);
      });
  }, [showtimeId]);

  const handleSeatSelect = (seatOrSeats) => {
    if (Array.isArray(seatOrSeats)) {
      // Ghế couple (mảng 2 ghế)
      const seatIds = seatOrSeats.map(s => s.seat_id);
      const allSelected = seatIds.every(id => selectedSeats.some(s => s.seat_id === id));

      if (allSelected) {
        // Bỏ chọn cả 2 ghế
        setSelectedSeats(prev => prev.filter(s => !seatIds.includes(s.seat_id)));
      } else {
        // Thêm cả 2 ghế
        setSelectedSeats(prev => [...prev, ...seatOrSeats.filter(s => !prev.some(ps => ps.seat_id === s.seat_id))]);
      }
    } else {
      // Ghế đơn
      const seatId = seatOrSeats.seat_id;
      const isSelected = selectedSeats.some(s => s.seat_id === seatId);
      if (isSelected) {
        setSelectedSeats(prev => prev.filter(s => s.seat_id !== seatId));
      } else {
        setSelectedSeats(prev => [...prev, seatOrSeats]);
      }
    }
  };


  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }
    setIsHolding(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth-token');
      const res = await fetch(`/api/showtimes/${showtimeId}/hold-seat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ seatIds: selectedSeats.map(s => s.seat_id) }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to hold seats. Please try again.");
      }

      // Lưu thông tin vào localStorage để trang thanh toán sử dụng
      localStorage.setItem('bookingInfo', JSON.stringify({
        showtimeId,
        selectedSeats,
        comboCounts: comboCounts || {}, // Đảm bảo comboCounts là object
        movie: showtime.movie_id,
        theater: showtime.theater_id
      }));

      // Chuyển sang trang thanh toán
      router.push(`/book/${showtimeId}/payment`);

    } catch (err) {
      setError(err.message);
      // Nếu giữ ghế thất bại, có thể cần làm mới lại sơ đồ ghế
      // để thấy ghế nào đã bị người khác chọn
      // fetchShowtime(); 
    } finally {
      setIsHolding(false);
    }
  };

  if (!showtimeId) {
    return <div className="p-8 text-center text-white">Showtime not found.</div>;
  }
  if (loading) {
    return <div className="p-8 text-center text-white">Loading data...</div>;
  }
  if (!showtime) {
    return <div className="p-8 text-center text-white">Showtime information not found.</div>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black pt-20 pb-10 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 space-y-8">

          {/* Movie Info Card */}
          <div className="bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">

            {/* Poster */}
            <img
              src={showtime.movie_id?.poster || "/poster-fallback.jpg"}
              alt="poster"
              className="w-28 h-40 md:w-48 md:h-72 object-cover rounded-lg shadow-md mx-auto md:mx-0"
            />

            {/* Info */}
            <div className="flex-1 w-full md:ml-6">
              <h2 className="text-xl md:text-3xl font-bold mb-4 text-center md:text-left">
                {showtime.movie_id?.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm md:text-base">
                {/* Date */}
                <div className="flex items-start gap-2">
                  <span className="text-red-400">📅</span>
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-gray-300">{new Date(showtime.time).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-2">
                  <span className="text-red-400">⏰</span>
                  <div>
                    <p className="font-semibold">Time</p>
                    <p className="text-gray-300">{new Date(showtime.time).toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* Theater */}
                <div className="flex items-start gap-2">
                  <span className="text-red-400">🏢</span>
                  <div>
                    <p className="font-semibold">Theater</p>
                    <p className="text-gray-300">{showtime.theater_id?.name}</p>
                  </div>
                </div>

                {/* Room */}
                <div className="flex items-start gap-2">
                  <span className="text-red-400">🪑</span>
                  <div>
                    <p className="font-semibold">Room</p>
                    <p className="text-gray-300">{showtime.room}</p>
                  </div>
                </div>

                {/* Screen */}
                <div className="flex items-start gap-2">
                  <span className="text-red-400">🎞️</span>
                  <div>
                    <p className="font-semibold">Screen</p>
                    <p className="text-gray-300">{showtime.type}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2">
                  <span className="text-red-400">📍</span>
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-gray-300">{showtime.theater_id?.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* SeatMap Section */}
          <div className="bg-gray-800/70 rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex justify-center items-center gap-2">
              Select your seat
            </h2>

            <div className="overflow-x-auto flex justify-center">
              <SeatMap
                seats={showtime?.seats_layout || []}
                selected={selectedSeats.map(s => s.seat_id)}
                onSeatClick={handleSeatSelect}
                readonly={false}
                showLegend={true}
                seatConfig={seatConfig}
              />
            </div>

            <button
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || loading || isHolding}
              className="w-full md:w-1/2 mx-auto mt-6 py-3 text-lg font-bold rounded-xl 
                   bg-gradient-to-r from-pink-500 to-red-500 
                   hover:opacity-90 disabled:opacity-50 
                   transition-all duration-300"
            >
              {isHolding ? "⏳ Holding seat..." : "🎬 Book Now"}
            </button>

            {error && <p className="text-red-400 mt-4">{error}</p>}
          </div>
        </div>
      </div>

    </>
  );
} 