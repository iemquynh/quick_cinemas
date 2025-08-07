import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Booking from '@/models/Booking';
import Showtime from '@/models/Showtime';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { connectToDatabase } from '@/lib/mongodb';
import { notifyTheaterAdmin, notifyUser } from '@/lib/socket';

export async function GET(req) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('booking_id');
    if (bookingId) {
      // Lấy booking theo booking_id
      const booking = await Booking.findById(bookingId)
        .populate('user_id', 'username email')
        .populate({
          path: 'showtime_id',
          populate: { path: 'movie_id', select: 'title poster' }
        });
      if (!booking) return NextResponse.json({ bookings: [] });
      return NextResponse.json({ bookings: [booking] });
    }
    const status = searchParams.get('status') || 'pending';
    const theaterChain = searchParams.get('theater_chain');
    let query = { status };
    if (theaterChain) {
      const showtimes = await Showtime.find({ theater_chain: theaterChain });
      const showtimeIds = showtimes.map(s => s._id);
      query.showtime_id = { $in: showtimeIds };
    }
    const bookings = await Booking.find(query)
      .populate('user_id', 'username email')
      .populate({
        path: 'showtime_id',
        populate: {
          path: 'movie_id',
          select: 'title poster'
        }
      })
      .sort({ createdAt: -1 });

    // --- NOTIFY ADMIN IF BOOKING WITH PAYMENT PROOF IS ABOUT TO EXPIRE ---
    const now = Date.now();
    const HOLD_TIMEOUT_MS = 2 * 60 * 1000; // 2 phút
    const WARNING_BEFORE_MS = 30 * 1000; // 30 giây cuối
    for (const booking of bookings) {
      if (
        booking.status === 'pending' &&
        booking.payment_proof_url &&
        booking.createdAt &&
        (now - new Date(booking.createdAt).getTime() > HOLD_TIMEOUT_MS - WARNING_BEFORE_MS) &&
        (now - new Date(booking.createdAt).getTime() < HOLD_TIMEOUT_MS)
      ) {
        // Gửi notification cho theater admin
        const showtime = booking.showtime_id;
        if (showtime && showtime.theater_chain) {
          const message = `Có vé đã upload hóa đơn sắp hết hạn xác nhận!`;
          // Lưu notification vào DB cho tất cả admin của theater_chain
          const admins = await User.find({ role: 'theater_admin', theater_chain: showtime.theater_chain });
          for (const admin of admins) {
            // Kiểm tra đã có notification chưa (tránh spam)
            const existed = await Notification.findOne({
              user_id: admin._id,
              booking_id: booking._id,
              type: 'booking_expiring',
            });
            if (!existed) {
              const notification = await Notification.create({
                user_id: admin._id,
                booking_id: booking._id,
                type: 'booking_expiring',
                message,
                read: false
              });
              notifyTheaterAdmin(showtime.theater_chain, {
                _id: notification._id,
                bookingId: booking._id,
                type: 'booking_expiring',
                message,
                timestamp: new Date(),
                read: false
              });
            }
          }
        }
      }
      // Nếu booking pending chưa có payment_proof_url và quá hạn thì tự động expire
      if (
        booking.status === 'pending' &&
        !booking.payment_proof_url &&
        booking.createdAt &&
        (now - new Date(booking.createdAt).getTime() > HOLD_TIMEOUT_MS)
      ) {
        booking.status = 'expired';
        await booking.save();
        // (Tùy chọn) Gửi notification cho user nếu muốn
      }
    }
    // --- END NOTIFY ---

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const { bookingId, action, adminId } = body;
    if (!bookingId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const showtime = await Showtime.findById(booking.showtime_id);
    if (!showtime) {
        throw new Error('Showtime not found for this booking');
    }

    let newStatus;
    let notificationType;
    let notificationMessage;
    switch (action) {
      case 'confirm':
        newStatus = 'using';
        notificationType = 'booking_confirmed';
        notificationMessage = 'Vé của bạn đã được xác nhận!';
        // Cập nhật ghế
        for (const seat of booking.seats) {
            const seatInLayout = showtime.seats_layout.find(s => s.seat_id === seat.seat_id);
            if (seatInLayout) {
                seatInLayout.status = 'booked';
                seatInLayout.booked_user = booking.user_id;
                seatInLayout.pending_user = null;
                seatInLayout.pending_time = null;
            }
        }
        break;
      case 'reject':
        newStatus = 'cancel';
        notificationType = 'booking_cancelled';
        notificationMessage = 'Vé của bạn đã bị từ chối.';
        // Cập nhật ghế
        for (const seat of booking.seats) {
            const seatInLayout = showtime.seats_layout.find(s => s.seat_id === seat.seat_id);
            if (seatInLayout) {
                seatInLayout.status = 'available';
                seatInLayout.booked_user = null;
                seatInLayout.pending_user = null;
                seatInLayout.pending_time = null;
            }
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await showtime.save();
    
    // Cập nhật trạng thái booking
    booking.status = newStatus;
    await booking.save();
    
    // Tạo thông báo cho user (lưu DB)
    const userNotification = await Notification.create({
      user_id: booking.user_id,
      booking_id: booking._id,
      type: notificationType,
      message: notificationMessage,
      read: false
    });
    
    // Gửi realtime cho user
    notifyUser(booking.user_id, {
      _id: userNotification._id,
      bookingId: booking._id,
      type: notificationType,
      message: notificationMessage,
      timestamp: new Date(),
      status: newStatus,
      read: false
    });

    return NextResponse.json({ success: true, booking });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 