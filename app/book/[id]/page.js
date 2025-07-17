"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SeatMap from "@/components/SeatMap";
import { seatmapConfigs } from "@/components/seatmapConfigs";
import Header from "@/components/Header";

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
  const params = useParams();
  const showtimeId = params.id;

  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seatConfig, setSeatConfig] = useState(seatmapConfigs.Default);

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

  const handleSeatClick = (seat) => {
    if (!seat || seat.booked) return;
    setSelected(prev =>
      prev.includes(seat.seat_id)
        ? prev.filter(id => id !== seat.seat_id)
        : [...prev, seat.seat_id]
    );
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
          <h2 className="text-xl font-bold mb-4">Chọn ghế ngồi</h2>
          <SeatMap
            seats={seats}
            selected={selected}
            onSeatClick={handleSeatClick}
            readonly={false}
            showLegend={true}
            seatConfig={seatConfig}
          />
          {/* Thêm nút đặt vé ở đây nếu cần */}
        </div>
      </div>
    </>
  );
} 