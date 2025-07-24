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