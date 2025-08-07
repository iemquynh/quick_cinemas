import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';

async function main() {
  const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/quick_cinema';
  await mongoose.connect(MONGODB_URL);

  const now = new Date();

  // Lấy tất cả bookings đang ở trạng thái "using"
  const bookings = await Booking.find({ status: 'using' }).populate('showtime_id');

  let updated = 0;

  for (const booking of bookings) {
    const showtime = booking.showtime_id;
    if (!showtime || !showtime.time) continue;

    const showtimeDate = new Date(showtime.time);
    if (showtimeDate < now) {
      booking.status = 'expired';
      await booking.save();
      updated++;
      console.log(`🔄 Booking ${booking._id} marked as expired.`);
    }
  }

  console.log(`✅ Done. Updated ${updated} bookings.`);
  process.exit();
}

main().catch(err => {
  console.error('❌ Error updating bookings:', err);
  process.exit(1);
});
