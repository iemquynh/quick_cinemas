import mongoose from 'mongoose';
import Booking from '../models/Booking.js'
import { connectToDatabase } from '../lib/mongodb.js'; // hàm connect DB của bạn

async function updateBookings() {
  try {
    await connectToDatabase();

    // Tìm các booking thiếu final_price hoặc promotion_id
    const bookingsToUpdate = await Booking.find({
      $or: [
        { final_price: { $exists: false } },
        { promotion_id: { $exists: false } }
      ]
    });

    console.log(`Tìm thấy ${bookingsToUpdate.length} booking cần cập nhật.`);

    for (const booking of bookingsToUpdate) {
      let updated = false;

      if (booking.final_price === undefined || booking.final_price === null) {
        booking.final_price = booking.total || 0; // lấy total nếu có, không thì 0
        updated = true;
      }

      if (booking.promotion_id === undefined || booking.promotion_id === null) {
        booking.promotion_id = null;
        updated = true;
      }

      if (updated) {
        await booking.save();
        console.log(`Updated booking ${booking._id}`);
      }
    }

    console.log('Hoàn thành cập nhật booking.');
    process.exit(0);

  } catch (error) {
    console.error('Lỗi khi cập nhật booking:', error);
    process.exit(1);
  }
}

updateBookings();
