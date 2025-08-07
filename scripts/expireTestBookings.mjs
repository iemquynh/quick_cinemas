import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/mongodb.js';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';

await connectToDatabase(); // đảm bảo đã kết nối MongoDB

// Fake thời gian hiện tại
const fakeNow = new Date('2025-10-07T10:00:00Z');

// Lấy tất cả showtime đã diễn ra trước thời điểm fakeNow
const expiredShowtimes = await Showtime.find({ time: { $lt: fakeNow } }).select('_id');

// Lấy ID showtime
const expiredShowtimeIds = expiredShowtimes.map(s => s._id);

// Cập nhật vé thành expired
const result = await Booking.updateMany(
  {
    status: 'using',
    showtime_id: { $in: expiredShowtimeIds }
  },
  {
    $set: { status: 'expired' }
  }
);

console.log('Expired showtime IDs:', expiredShowtimeIds);

console.log(`✅ Updated ${result.modifiedCount} bookings to expired`);

await mongoose.disconnect();
