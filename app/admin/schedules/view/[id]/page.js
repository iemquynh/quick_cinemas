"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SeatMap from "@/components/SeatMap";
import { seatmapConfigs } from "@/components/seatmapConfigs";
import TheaterAdminGuard from "@/components/TheaterAdminGuard";
import AdminGuard from "@/components/AdminGuard";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

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

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
const COLS = Array.from({ length: 19 }, (_, i) => i + 1);

function generateSeatsLayout(existingLayout) {
  if (Array.isArray(existingLayout) && existingLayout.length > 0) return existingLayout;
  let seats = [];
  for (let r = 0; r < ROWS.length; r++) {
    let row = ROWS[r];
    for (let c = 0; c < COLS.length; c++) {
      let col = COLS[c];
      seats.push({
        seat_id: row + col,
        row,
        col,
        type: getSeatType(row, col),
        status: "available",
        pending_user: null,
        pending_time: null,
        booked_user: null,
      });
    }
  }
  return seats;
}

const getSeatConfigByTheaterName = (theaterName) => {
  if (!theaterName) return seatmapConfigs.Default;
  const firstWord = theaterName.trim().split(" ")[0].toLowerCase();
  if (firstWord === "cgv") return seatmapConfigs.CGV;
  if (firstWord === "lotte") return seatmapConfigs.Lotte;
  if (firstWord === "galaxy") return seatmapConfigs.Galaxy;
  if (firstWord === "bhd") return seatmapConfigs.BHD;
  if (firstWord === "beta") return seatmapConfigs.Beta;
  return seatmapConfigs.Default;
};

export default function ShowtimeDetailPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ movie: "", theater: "", time: "", room: "", type: "" });
  const [theaterDetail, setTheaterDetail] = useState(null);
  const [hasBookedSeat, setHasBookedSeat] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/showtimes/${unwrappedParams.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setShowtime(data);
        const layout = generateSeatsLayout(data.seats_layout);
        setSeats(layout);
        setForm({
          movie: data.movie_id?._id || data.movie_id || "",
          theater: data.theater_id?._id || data.theater_id || "",
          time: data.time ? new Date(data.time).toISOString().slice(0, 16) : "",
          room: data.room || "",
          type: data.type || ""
        });
        setHasBookedSeat(layout.some(s => s.status === "booked" || s.booked_user));
        setLoading(false);

        const tid = data.theater_id?._id || data.theater_id;
        if (tid) {
          fetch(`/api/theaters/${tid}`).then(res => res.json()).then(setTheaterDetail);
        }
      });
  }, [unwrappedParams.id]);

  const handleSeatClick = (seat) => {
    if (Array.isArray(seat)) {
      const ids = seat.map(s => s.seat_id);
      setSelected(prev =>
        ids.every(id => prev.includes(id))
          ? prev.filter(id => !ids.includes(id))
          : [...prev, ...ids.filter(id => !prev.includes(id))]
      );
    } else {
      setSelected(prev =>
        prev.includes(seat.seat_id)
          ? prev.filter(id => id !== seat.seat_id)
          : [...prev, seat.seat_id]
      );
    }
  };

  const handleSaveSeats = async () => {
    const newSeats = seats.map((s) =>
      selected.includes(s.seat_id)
        ? { ...s, booked: true, user_id: "admin" }
        : { ...s, booked: false, user_id: null }
    );
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/showtimes/${unwrappedParams.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ seats_layout: newSeats }),
    });

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: res.ok ? "success" : "error",
      title: res.ok ? "Seats saved successfully" : "Failed to save seats",
      showConfirmButton: false,
      timer: 2000
    });

    if (res.ok) {
      setSeats(newSeats);
      setSelected([]);
    }
  };

  const handleEdit = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to edit this schedule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, edit it"
    }).then((result) => {
      if (result.isConfirmed) {
        setEditMode(true);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Edit mode activated",
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({
      movie: showtime.movie_id?._id || showtime.movie_id || "",
      theater: showtime.theater_id?._id || showtime.theater_id || "",
      time: showtime.time ? new Date(showtime.time).toISOString().slice(0, 16) : "",
      room: showtime.room || "",
      type: showtime.type || ""
    });
  };

  const handleFormChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSaveInfo = async () => {
    const confirmResult = await Swal.fire({
      title: "Confirm save?",
      text: "Do you want to save changes to this schedule?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save it",
      cancelButtonText: "Cancel"
    });

    if (!confirmResult.isConfirmed) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/showtimes/${unwrappedParams.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        time: form.time,
        room: form.room,
        type: form.type
      }),
    });

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: res.ok ? "success" : "error",
      title: res.ok ? "Schedule updated" : "Failed to update schedule",
      showConfirmButton: false,
      timer: 2000
    });

    if (res.ok) {
      setEditMode(false);
      fetch(`/api/showtimes/${unwrappedParams.id}`).then(res => res.json()).then(setShowtime);
    }
  };

  if (loading) return <div className="p-8">Loading data...</div>;
  if (!showtime) return <div className="p-8">Not found showtimes</div>;

  return (
    <div className="min-h-screen bg-[#1a2332] pt-20 px-4 md:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto bg-base-200 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Schedule Information</h2>
          {!editMode && !hasBookedSeat && (
            <button className="btn btn-outline btn-info" onClick={handleEdit}>Edit</button>
          )}
        </div>

        {hasBookedSeat && (
          <div className="mb-4 text-warning font-medium">
            ⚠️ Some seats have been booked. You cannot edit the showtime information.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="font-semibold text-white">🎬 Movie:</label>
            <input className="input input-bordered w-full" value={showtime.movie_id?.title || ""} disabled />
          </div>
          <div>
            <label className="font-semibold text-white">🏢 Theater:</label>
            <input className="input input-bordered w-full" value={showtime.theater_id?.name || ""} disabled />
          </div>
          <div>
            <label className="font-semibold text-white">🕒 Time:</label>
            <input
              className="input input-bordered w-full"
              type="datetime-local"
              name="time"
              value={form.time}
              onChange={handleFormChange}
              disabled={!editMode || hasBookedSeat}
            />
          </div>
          <div>
            <label className="font-semibold text-white">🏠 Room:</label>
            {editMode && theaterDetail && !hasBookedSeat ? (
              <select
                className="select select-bordered w-full"
                name="room"
                value={form.room}
                onChange={handleFormChange}
              >
                <option value="">Select room</option>
                {Array.from({ length: theaterDetail.rooms }, (_, i) => `Room ${i + 1}`).map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            ) : (
              <input className="input input-bordered w-full" name="room" value={form.room} disabled />
            )}
          </div>
          <div>
            <label className="font-semibold text-white">📺 Type screen:</label>
            {editMode && theaterDetail && !hasBookedSeat ? (
              <select
                className="select select-bordered w-full"
                name="type"
                value={form.type}
                onChange={handleFormChange}
              >
                <option value="">Select type screen</option>
                {theaterDetail.screenTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            ) : (
              <input className="input input-bordered w-full" name="type" value={form.type} disabled />
            )}
          </div>
        </div>

        {editMode && !hasBookedSeat && (
          <div className="flex gap-3 mb-6">
            <button className="btn btn-primary" onClick={handleSaveInfo} type="button">
              💾 Save
            </button>
            <button className="btn btn-secondary" onClick={handleCancel} type="button">
              ❌ Cancel
            </button>
          </div>
        )}

        <div className="mb-6">
          <SeatMap
            seats={seats}
            selected={selected}
            onSeatClick={handleSeatClick}
            readonly={false}
            showLegend={true}
            seatConfig={getSeatConfigByTheaterName(theaterDetail?.name)}
          />
        </div>
      </div>
    </div>
  );
}
