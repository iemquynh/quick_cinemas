import React from "react";

export default function SeatMap({ seats, selected = [], onSeatClick, readonly = false, showLegend = true, seatConfig }) {
  const hasCustomSeats = !!seatConfig?.SEATS;
  const SEATS = seatConfig?.SEATS;
  const VIP_SEATS = seatConfig?.VIP_SEATS || [];
  const ROWS = seatConfig?.ROWS || ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
  const COLS = seatConfig?.COLS || Array.from({ length: 19 }, (_, i) => i + 1);
  const VIP_ROWS = seatConfig?.VIP_ROWS || [];
  const COUPLE_SEATS = Array.isArray(seatConfig?.COUPLE_SEATS?.[0])
    ? seatConfig.COUPLE_SEATS.flat().filter(Boolean)
    : seatConfig?.COUPLE_SEATS || [];
  const hasCoupleSeats = COUPLE_SEATS.length > 0;

  function getSeatType(row, col, seatId) {
    if (hasCustomSeats) {
      if (VIP_SEATS.includes(seatId)) return "vip";
      if (hasCoupleSeats && COUPLE_SEATS.includes(seatId)) return "couple";
      return "normal";
    }
    const id = seatId || row + col;
    if (hasCoupleSeats && COUPLE_SEATS.includes(id)) return "couple";
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

  return (
    <div className="w-full overflow-x-auto">
      <div className="w-max mx-auto px-2">
        <div className="inline-block">
          <div className="text-center font-bold mb-2">SCREEN</div>
          <div className="flex flex-col gap-1 items-center">
            {hasCustomSeats ? (
              SEATS.map((rowArr, rowIdx) => (
                <div key={rowIdx} className="flex flex-row gap-1">
                  {(() => {
                    const rowButtons = [];
                    for (let colIdx = 0; colIdx < rowArr.length; colIdx++) {
                      const seatId = rowArr[colIdx];
                      if (!seatId) {
                        rowButtons.push(<span key={colIdx} className="w-8 h-8 m-0.5"></span>);
                        continue;
                      }
                      const isCouple = hasCoupleSeats && COUPLE_SEATS.includes(seatId);
                      if (isCouple && colIdx < rowArr.length - 1) {
                        const nextSeatId = rowArr[colIdx + 1];
                        if (COUPLE_SEATS.includes(nextSeatId)) {
                          const seat1 = seats.find(s => s.seat_id === seatId) || { seat_id: seatId, status: undefined };
                          const seat2 = seats.find(s => s.seat_id === nextSeatId) || { seat_id: nextSeatId, status: undefined };
                          const selectedFlag = selected.includes(seat1.seat_id) || selected.includes(seat2.seat_id);
                          const booked = seat1.status === 'booked' || seat2.status === 'booked';
                          rowButtons.push(
                            <button
                              key={seatId + '-' + nextSeatId}
                              className={`w-16 h-8 m-0.5 rounded-full ${getSeatColor('couple', booked, selectedFlag)} border border-gray-400 text-xs font-bold`}
                              disabled={booked || readonly}
                              onClick={() => !readonly && onSeatClick && onSeatClick([seat1, seat2])}
                              type="button"
                            >
                              {seat1.seat_id} {seat2.seat_id}
                            </button>
                          );
                          colIdx++; // skip next
                          continue;
                        }
                      }
                      const seat = seats.find(s => s.seat_id === seatId) || { seat_id: seatId, status: undefined };
                      const selectedFlag = selected.includes(seat.seat_id);
                      const type = getSeatType(null, null, seatId);
                      const booked = seat.status === 'booked';
                      rowButtons.push(
                        <button
                          key={seat.seat_id}
                          className={`w-8 h-8 m-0.5 rounded ${getSeatColor(type, booked, selectedFlag)} border border-gray-400 text-xs font-bold`}
                          disabled={booked || readonly}
                          onClick={() => !readonly && onSeatClick && onSeatClick(seat)}
                          type="button"
                        >
                          {seat.seat_id}
                        </button>
                      );
                    }
                    return rowButtons;
                  })()}
                </div>
              ))
            ) : (
              ROWS.map((row) => (
                <div key={row} className="flex flex-row gap-1">
                  <span className="w-6 inline-block text-right mr-1 font-bold">{row}</span>
                  {(() => {
                    const rowButtons = [];
                    for (let idx = 0; idx < COLS.length; idx++) {
                      const col = COLS[idx];
                      const seatId = row + col;
                      const isCouple = hasCoupleSeats && COUPLE_SEATS.includes(seatId);
                      if (isCouple && idx < COLS.length - 1) {
                        const nextCol = COLS[idx + 1];
                        const nextSeatId = row + nextCol;
                        if (COUPLE_SEATS.includes(nextSeatId)) {
                          const seat1 = seats.find(s => s.seat_id === seatId) || { seat_id: seatId, status: undefined };
                          const seat2 = seats.find(s => s.seat_id === nextSeatId) || { seat_id: nextSeatId, status: undefined };
                          const selectedFlag = selected.includes(seat1.seat_id) || selected.includes(seat2.seat_id);
                          const booked = seat1.status === 'booked' || seat2.status === 'booked';
                          rowButtons.push(
                            <button
                              key={seatId + '-' + nextSeatId}
                              className={`w-16 h-8 m-0.5 rounded-full ${getSeatColor('couple', booked, selectedFlag)} border border-gray-400 text-xs font-bold`}
                              disabled={booked || readonly}
                              onClick={() => !readonly && onSeatClick && onSeatClick([seat1, seat2])}
                              type="button"
                            >
                              {seat1.seat_id} {seat2.seat_id}
                            </button>
                          );
                          idx++;
                          continue;
                        }
                      }
                      const seat = seats.find(s => s.seat_id === seatId) || { row, col, seat_id: seatId, type: getSeatType(row, col), status: undefined };
                      const selectedFlag = selected.includes(seat.seat_id);
                      const booked = seat.status === 'booked';
                      rowButtons.push(
                        <button
                          key={seat.seat_id}
                          className={`w-8 h-8 m-0.5 rounded ${getSeatColor(seat.type, booked, selectedFlag)} border border-gray-400 text-xs font-bold`}
                          disabled={booked || readonly}
                          onClick={() => !readonly && onSeatClick && onSeatClick(seat)}
                          type="button"
                        >
                          {seat.col}
                        </button>
                      );
                    }
                    return rowButtons;
                  })()}
                </div>
              ))
            )}
          </div>
          {showLegend && (
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              <div><span className="inline-block w-6 h-6 rounded bg-gray-200 border border-gray-400 align-middle"></span> Regular seat</div>
              {(VIP_ROWS.length > 0 || VIP_SEATS.length > 0) && (
                <div><span className="inline-block w-6 h-6 rounded bg-yellow-400 border border-gray-400 align-middle"></span> VIP seat</div>
              )}
              {hasCoupleSeats && (
                <div><span className="inline-block w-6 h-6 rounded bg-pink-400 border border-gray-400 align-middle"></span> Couple seat</div>
              )}
              <div><span className="inline-block w-6 h-6 rounded bg-gray-400 border border-gray-400 align-middle"></span> Booked</div>
              <div><span className="inline-block w-6 h-6 rounded bg-green-500 border border-gray-400 align-middle"></span> Selected</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
