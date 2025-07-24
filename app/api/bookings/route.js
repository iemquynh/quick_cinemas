import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Booking from '@/models/Booking'; // file export là BookingV2
import Showtime from '@/models/Showtime';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { connectToDatabase } from '@/lib/mongodb';
import { notifyTheaterAdmin, notifyUser } from '@/lib/socket';
import { getAuth } from '@/utils/auth';

export async function POST(req) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const { userId } = await getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // API này không cần cập nhật ghế nữa, chỉ tạo booking
    const booking = new Booking({
      user_id: userId,
      showtime_id: body.showtime_id,
      seats: body.seats,
      combos: body.combos,
      payment_proof_url: body.payment_proof_url,
      status: 'pending',
    });
    await booking.save();
    
    const showtime = await Showtime.findById(body.showtime_id);
    if (!showtime) {
        throw new Error('Showtime not found');
    }

    // Gửi và lưu notification
    const admins = await User.find({ role: 'theater_admin', theater_chain: showtime.theater_chain });
    const notificationData = {
        bookingId: booking._id,
        showtimeId: showtime._id,
        theaterChain: showtime.theater_chain,
        message: `Có vé mới đang chờ xác nhận cho suất chiếu ${showtime._id}`,
        timestamp: new Date(),
        seats: body.seats,
        userInfo: { userId: userId }
    };
    notifyTheaterAdmin(showtime.theater_chain, notificationData);
    notifyUser(userId, notificationData);

    for (const admin of admins) {
      await Notification.create({
        user_id: admin._id,
        booking_id: booking._id,
        type: 'booking_pending',
        message: `Có vé mới đang chờ xác nhận cho suất chiếu ${showtime._id}`,
      });
    }

    return NextResponse.json({ bookingId: booking._id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 