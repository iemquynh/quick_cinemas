"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SeatMap from "@/components/SeatMap";
import { seatmapConfigs } from "@/components/seatmapConfigs";
import TheaterAdminGuard from "@/components/TheaterAdminGuard";
import AdminGuard from "@/components/AdminGuard";

const VIP_ROWS = ["E", "F", "G"];
const COUPLE_SEATS = [
  "K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8", "K9", "K10", "K11", "K12", "K13", "K14", "K15", "K16", "K17", "K18", "K19"
];

function getSeatType(row, col) {
  const seatId = row + col;
  if (COUPLE_SEATS.includes(seatId)) return "couple";
  if (VIP_ROWS.includes(row)) return "vip";
  return "normal";
}

function getSeatColor(type, booked, selected) {
  if (booked) return "bg-gray-400 text-white cursor-not-allowed";
  if (selected) return "bg-green-500 text-white";
  if (type === "vip") return "bg-yellow-400 text-black";
  if (type === "couple") return "bg-pink-400 text-white";
  return "bg-gray-200 text-black";
}

const ROWS = ["A","B","C","D","E","F","G","H","I","J","K"];
const COLS = Array.from({length: 19}, (_, i) => i + 1); // 1-19

function generateSeatsLayout(existingLayout) {
  if (Array.isArray(existingLayout) && existingLayout.length > 0) return existingLayout;
  let seats = [];
  for (let r = 0; r < ROWS.length; r++) {
    let row = ROWS[r];
    for (let c = 0; c < COLS.length; c++) {
      let col = COLS[c];
      let seatId = row + col;
      seats.push({ seat_id: seatId, row, col, booked: false, user_id: null });
    }
  }
  return seats;
}

const getSeatConfigByTheaterName = (theaterName) => {
  if (!theaterName) return seatmapConfigs.Default;
  const firstWord = theaterName.trim().split(' ')[0].toLowerCase();
  if (firstWord === 'cgv') return seatmapConfigs.CGV;
  if (firstWord === 'lotte') return seatmapConfigs.Lotte;
  if (firstWord === 'galaxy') return seatmapConfigs.Galaxy;
  if (firstWord === 'bhd') return seatmapConfigs.BHD;
  if (firstWord === 'beta') return seatmapConfigs.Beta;
  return seatmapConfigs.Default;
};

export default function ShowtimeDetailPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ movie: '', theater: '', time: '', room: '', type: '' });
  const [theaterDetail, setTheaterDetail] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/showtimes/${unwrappedParams.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setShowtime(data);
        setSeats(generateSeatsLayout(data.seats_layout));
        setForm({
          movie: data.movie_id?._id || data.movie_id || '',
          theater: data.theater_id?._id || data.theater_id || '',
          time: data.time ? new Date(data.time).toISOString().slice(0, 16) : '',
          room: data.room || '',
          type: data.type || ''
        });
        setLoading(false);
        // Lấy chi tiết rạp để render dropdown
        if (data.theater_id?._id || data.theater_id) {
          const tid = data.theater_id?._id || data.theater_id;
          fetch(`/api/theaters/${tid}`)
            .then(res => res.json())
            .then(setTheaterDetail);
        }
      });
  }, [unwrappedParams.id]);

  const handleSeatClick = (seat) => {
    if (Array.isArray(seat)) {
      // Ghế couple: toggle cả 2 ghế
      const ids = seat.map(s => s.seat_id);
      setSelected(prev => {
        if (ids.every(id => prev.includes(id))) {
          // Nếu cả 2 ghế đã chọn, bỏ chọn cả 2
          return prev.filter(id => !ids.includes(id));
        } else {
          // Thêm những ghế chưa có vào selected
          return [...prev, ...ids.filter(id => !prev.includes(id))];
        }
      });
    } else {
      // Ghế thường/vip: toggle 1 ghế
      setSelected(prev =>
        prev.includes(seat.seat_id)
          ? prev.filter(id => id !== seat.seat_id)
          : [...prev, seat.seat_id]
      );
    }
  };

  const handleSaveSeats = async () => {
    // Cho phép admin chọn/bỏ chọn lại ghế đã booked
    const newSeats = seats.map((s) =>
      selected.includes(s.seat_id)
        ? { ...s, booked: true, user_id: "admin" }
        : { ...s, booked: false, user_id: null }
    );
    setMessage("Saving...");
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/showtimes/${unwrappedParams.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ seats_layout: newSeats }),
    });
    if (res.ok) {
      setSeats(newSeats);
      setSelected([]);
      setMessage("Lưu thành công!");
    } else {
      setMessage("Có lỗi khi lưu!");
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    // Reset lại form về dữ liệu gốc
    setForm({
      movie: showtime.movie_id?._id || showtime.movie_id || '',
      theater: showtime.theater_id?._id || showtime.theater_id || '',
      time: showtime.time ? new Date(showtime.time).toISOString().slice(0, 16) : '',
      room: showtime.room || '',
      type: showtime.type || ''
    });
  };
  const handleFormChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleSaveInfo = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn lưu thay đổi thông tin suất chiếu?')) return;
    setMessage("Saving...");
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/showtimes/${unwrappedParams.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        time: form.time,
        room: form.room,
        type: form.type
      }),
    });
    if (res.ok) {
      setEditMode(false);
      setMessage("Lưu thành công!");
      // Reload lại dữ liệu showtime
      fetch(`/api/showtimes/${unwrappedParams.id}`)
        .then(res => res.json())
        .then(data => setShowtime(data));
    } else {
      setMessage("Có lỗi khi lưu!");
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (!showtime) return <div className="p-8">Không tìm thấy suất chiếu</div>;

  // Kiểm tra có ghế nào đã đặt không
  const hasBookedSeat = seats.some(s => s.booked);

  return (
    <AdminGuard>
      <TheaterAdminGuard>
        <div className="min-h-screen bg-[#1a2332] pt-24">
          <div className="max-w-4xl mx-auto bg-base-200 p-6 rounded">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết suất chiếu</h2>
              {!editMode && !hasBookedSeat && <button className="btn btn-outline btn-info" onClick={handleEdit}>Edit</button>}
            </div>
            <form className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold">Phim:</label>
                <input className="input input-bordered w-full" value={showtime.movie_id?.title || ''} disabled />
              </div>
              <div>
                <label className="font-bold">Rạp:</label>
                <input className="input input-bordered w-full" value={showtime.theater_id?.name || ''} disabled />
              </div>
              <div>
                <label className="font-bold">Thời gian:</label>
                <input className="input input-bordered w-full" type="datetime-local" name="time" value={form.time} onChange={handleFormChange} disabled={!editMode || hasBookedSeat} />
              </div>
              <div>
                <label className="font-bold">Phòng:</label>
                {editMode && theaterDetail && !hasBookedSeat ? (
                  <select className="select select-bordered w-full" name="room" value={form.room} onChange={handleFormChange}>
                    <option value="">Chọn phòng</option>
                    {Array.from({length: theaterDetail.rooms}, (_, i) => `Room ${i+1}`).map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                ) : (
                  <input className="input input-bordered w-full" name="room" value={form.room} disabled />
                )}
              </div>
              <div>
                <label className="font-bold">Loại màn hình:</label>
                {editMode && theaterDetail && !hasBookedSeat ? (
                  <select className="select select-bordered w-full" name="type" value={form.type} onChange={handleFormChange}>
                    <option value="">Chọn loại màn hình</option>
                    {theaterDetail.screenTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  <input className="input input-bordered w-full" name="type" value={form.type} disabled />
                )}
              </div>
            </form>
            {editMode && !hasBookedSeat && (
              <div className="flex gap-2 mb-4">
                <button className="btn btn-primary" onClick={handleSaveInfo} type="button">Save</button>
                <button className="btn btn-secondary" onClick={handleCancel} type="button">Cancel</button>
              </div>
            )}
            <div className="mb-4">
              <SeatMap
                seats={seats}
                selected={selected}
                onSeatClick={handleSeatClick}
                readonly={false}
                showLegend={true}
                seatConfig={getSeatConfigByTheaterName(theaterDetail?.name)}
              />
            </div>
            <button className="btn btn-primary mt-4" onClick={handleSaveSeats} disabled={selected.length === 0}>Lưu trạng thái chọn ghế</button>
            {message && <div className="mt-2 text-info">{message}</div>}
          </div>
        </div>
      </TheaterAdminGuard>
    </AdminGuard>
  );
} 