import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import Showtime from '@/models/Showtime';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req, { params }) {
  await connectToDatabase();
  try {
    const { id } = params;
    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(booking, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  await connectToDatabase();
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;
    if (!['using', 'cancel'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Cập nhật seats_layout của showtime
    const showtime = await Showtime.findById(booking.showtime_id);
    if (showtime) {
      for (const seat of booking.seats) {
        const seatObj = showtime.seats_layout.find(s => s.seat_id === seat.seat_id);
        if (seatObj) {
          if (status === 'using') {
            seatObj.status = 'booked';
            seatObj.booked_user = booking.user_id;
            seatObj.pending_user = null;
            seatObj.pending_time = null;
          } else if (status === 'cancel') {
            seatObj.status = 'available';
            seatObj.booked_user = null;
            seatObj.pending_user = null;
            seatObj.pending_time = null;
          }
        }
      }
      await showtime.save();
    }

    // Tạo notification cho user
    await Notification.create({
      user_id: booking.user_id,
      booking_id: booking._id,
      type: status === 'using' ? 'booking_confirmed' : 'booking_cancelled',
      message: status === 'using' ? 'Vé của bạn đã được xác nhận!' : 'Vé của bạn đã bị hủy.',
    });
    return NextResponse.json(booking, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 