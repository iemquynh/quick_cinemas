import React from "react";

const VIP_ROWS = ["E", "F", "G"];
const COUPLE_SEATS = [
  "K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8", "K9", "K10", "K11", "K12", "K13", "K14", "K15", "K16", "K17", "K18", "K19"
];
const ROWS = ["A","B","C","D","E","F","G","H","I","J","K"];
const COLS = Array.from({length: 19}, (_, i) => i + 1); // 1-19

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

export default function SeatMap({ seats, selected = [], onSeatClick, readonly = false, showLegend = true }) {
  return (
    <div>
      <div className="text-center font-bold mb-2">SCREEN</div>
      <div className="flex flex-col gap-1 items-center">
        {ROWS.map((row) => (
          <div key={row} className="flex flex-row gap-1">
            <span className="w-6 inline-block text-right mr-1 font-bold">{row}</span>
            {COLS.map((col) => {
              const seatId = row + col;
              const seat = seats.find(s => s.seat_id === seatId) || { row, col, seat_id: seatId, type: getSeatType(row, col), booked: false };
              const selectedFlag = selected.includes(seat.seat_id);
              return (
                <button
                  key={seat.seat_id}
                  className={`w-8 h-8 m-0.5 rounded ${getSeatColor(seat.type, seat.booked, selectedFlag)} border border-gray-400 text-xs font-bold`}
                  disabled={seat.booked || readonly}
                  onClick={() => !readonly && onSeatClick && onSeatClick(seat)}
                  type="button"
                >
                  {seat.col}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {showLegend && (
        <div className="flex gap-4 mt-4 justify-center">
          <div><span className="inline-block w-6 h-6 rounded bg-gray-200 border border-gray-400 align-middle"></span> Ghế thường</div>
          <div><span className="inline-block w-6 h-6 rounded bg-yellow-400 border border-gray-400 align-middle"></span> Ghế VIP</div>
          <div><span className="inline-block w-6 h-6 rounded bg-pink-400 border border-gray-400 align-middle"></span> Ghế couple</div>
          <div><span className="inline-block w-6 h-6 rounded bg-gray-400 border border-gray-400 align-middle"></span> Đã đặt</div>
          <div><span className="inline-block w-6 h-6 rounded bg-green-500 border border-gray-400 align-middle"></span> Đang chọn</div>
        </div>
      )}
    </div>
  );
} 