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

  const handleSeatSelect = (seat) => {
    setSelectedSeats((prev) =>
      prev.some((s) => s.seat_id === seat.seat_id)
        ? prev.filter((s) => s.seat_id !== seat.seat_id)
        : [...prev, seat]
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế.");
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
        throw new Error(data.message || "Không thể giữ ghế. Vui lòng thử lại.");
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
    return <div className="p-8 text-center text-white">Không tìm thấy suất chiếu.</div>;
  }
  if (loading) {
    return <div className="p-8 text-center text-white">Đang tải dữ liệu...</div>;
  }
  if (!showtime) {
    return <div className="p-8 text-center text-white">Không tìm thấy thông tin suất chiếu.</div>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#1a2332] pt-24 pb-12">
        <div className="w-full max-w-5xl mx-auto bg-base-200 p-6 rounded mb-8" style={{width: '80%'}}>
          <h2 className="text-xl font-bold mb-4">Showtime Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-bold">Film:</label>
              <div className="input input-bordered w-full">{showtime.movie_id?.title || ''}</div>
            </div>
            <div>
              <label className="font-bold">Theater:</label>
              <div className="input input-bordered w-full">{showtime.theater_id?.name || ''}</div>
            </div>
            <div>
              <label className="font-bold">Time:</label>
              <div className="input input-bordered w-full">{new Date(showtime.time).toLocaleString()}</div>
            </div>
            <div>
              <label className="font-bold">Address:</label>
              <div className="input input-bordered w-full">{showtime.theater_id.address}</div>
            </div>
            <div>
              <label className="font-bold">Room:</label>
              <div className="input input-bordered w-full">{showtime.room}</div>
            </div>
            <div>
              <label className="font-bold">Screen Type:</label>
              <div className="input input-bordered w-full">{showtime.type}</div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-5xl mx-auto bg-base-200 p-6 rounded mb-8" style={{width: '80%'}}>
          <div className="flex-1 overflow-auto p-4">
            <h2 className="text-xl font-bold mb-4 text-center">Chọn ghế của bạn</h2>
            <SeatMap
              seats={showtime?.seats_layout || []}
              selected={selectedSeats.map(s => s.seat_id)}
              onSeatClick={handleSeatSelect}
              readonly={false}
              showLegend={true}
              seatConfig={seatConfig}
            />
            <button
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || loading || isHolding}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
            >
              {isHolding ? 'Đang giữ ghế...' : 'Booking now'}
            </button>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>
        </div>
      </div>
    </>
  );
} 