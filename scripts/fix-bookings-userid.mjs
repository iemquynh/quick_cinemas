import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/quick_cinema';

async function main() {
  try {
    await mongoose.connect(MONGODB_URL);

    // Bước 1: Lấy danh sách ID của tất cả các theater_admin
    const theaterAdmins = await User.find({ role: 'theater_admin' }, '_id');
    const theaterAdminIds = theaterAdmins.map(admin => admin._id);
    const theaterAdminIdStrings = theaterAdminIds.map(id => id.toString());

    // Bước 2: Tìm các booking có user_id thuộc danh sách theater_admin
    const faultyBookings = await Booking.find({ user_id: { $in: theaterAdminIds } });

    console.log(`Tìm thấy ${faultyBookings.length} booking cần được sửa...`);

    let updatedCount = 0;

    for (const booking of faultyBookings) {
      // Bước 3: Tìm notification có user_id của người dùng thực
      const noti = await Notification.findOne({
        booking_id: booking._id,
        user_id: { $nin: theaterAdminIds } // Đảm bảo user_id không phải là của admin
      }).populate('user_id');

      if (noti && noti.user_id) {
        // Kiểm tra chắc chắn role của user từ notification
        if (noti.user_id.role === 'user') {
            const originalUserId = booking.user_id;
            booking.user_id = noti.user_id._id;
            await booking.save();
            updatedCount++;
            console.log(`Đã cập nhật booking ${booking._id}: user_id từ ${originalUserId} thành ${noti.user_id._id}`);
        } else {
             console.log(`Booking ${booking._id} có notification, nhưng user_id ${noti.user_id._id} không phải là 'user'. Bỏ qua.`);
        }
      } else {
        console.log(`Không tìm thấy notification phù hợp cho booking ${booking._id}.`);
      }
    }

    console.log(`Hoàn thành! Đã cập nhật thành công ${updatedCount} booking.`);
  } catch (error) {
    console.error('Đã xảy ra lỗi trong quá trình cập nhật:', error);
  } finally {
    await mongoose.disconnect();
  }
}

main(); 