import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import Showtime from '@/models/Showtime';
import Promotion from '@/models/Promotion';
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
    const { status, promotion_id } = body;

    if (!['using', 'cancel'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let finalTotal = booking.final_price;
    let appliedPromotion = null;

    // Nếu có promotion_id thì kiểm tra hợp lệ
    if (promotion_id && status === 'using') {
      appliedPromotion = await Promotion.findById(promotion_id);

      if (
        appliedPromotion &&
        new Date(appliedPromotion.start_date) <= new Date() &&
        new Date(appliedPromotion.end_date) >= new Date() &&
        appliedPromotion.used_count < appliedPromotion.max_usage
      ) {
        // Giảm giá theo % hoặc số tiền
        if (appliedPromotion.discount_type === 'percent') {
          finalTotal = finalTotal - (finalTotal * appliedPromotion.discount_value) / 100;
        } else if (appliedPromotion.discount_type === 'amount') {
          finalTotal = finalTotal - appliedPromotion.discount_value;
        }

        if (finalTotal < 0) finalTotal = 0;

        // Tăng used_count
        appliedPromotion.used_count += 1;
        await appliedPromotion.save();

        booking.promotion_id = appliedPromotion._id;
      }
    }

    // Cập nhật status + final_total
    booking.status = status;
    if (status === 'using') {
      booking.final_price = finalTotal;
    }
    await booking.save();

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
      message:
        status === 'using'
          ? 'Vé của bạn đã được xác nhận!'
          : 'Vé của bạn đã bị hủy.',
    });

    return NextResponse.json(booking, { status: 200 });
  } catch (err) {
    console.error('Error updating booking:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
