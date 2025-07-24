import { QRCodeSVG } from "qrcode.react";

export default function BookingQRCode({ booking }) {
  if (!booking) return null;
  const qrData = {
    bookingId: booking._id,
    showtimeId: booking.showtime_id?._id,
    movie: booking.showtime_id?.movie_id?.title,
    theater: booking.showtime_id?.theater_id?.name,
    seats: booking.seats?.map(s => s.seat_id),
    time: booking.showtime_id?.time,
    // Thêm các trường khác nếu muốn
  };
  return (
    <div style={{ background: 'white', padding: '16px', display: 'inline-block' }}>
      <QRCodeSVG value={JSON.stringify(qrData)} size={180} />
      {/* <p style={{ textAlign: 'center', marginTop: 8 }}>Mã vé: {booking._id}</p> */}
    </div>
  );
} 