import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Showtime from '@/models/Showtime';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    // Lấy user_id từ token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.id || decoded.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { seatIds } = await req.json();
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return NextResponse.json({ error: 'Seat IDs are required' }, { status: 400 });
    }

    const showtimeId = params.id;
    const showtime = await Showtime.findById(showtimeId);

    if (!showtime) {
      return NextResponse.json({ error: 'Showtime not found' }, { status: 404 });
    }

    // --- AUTO RELEASE EXPIRED PENDING SEATS (2 MINUTES) ---
    const now = Date.now();
    const HOLD_TIMEOUT_MS = 2 * 60 * 1000; // 2 phút
    let releasedSeats = [];
    // Lấy tất cả booking pending của showtime này
    const bookings = await import('@/models/Booking').then(m => m.default.find({ showtime_id: showtimeId, status: 'pending' }));
    for (const seat of showtime.seats_layout) {
      if (seat.status === 'pending' && seat.pending_time) {
        // Kiểm tra booking liên quan
        const relatedBooking = bookings.find(b => b.seats.some(s => s.seat_id === seat.seat_id));
        const hasProof = relatedBooking && relatedBooking.payment_proof_url;
        const pendingTime = new Date(seat.pending_time).getTime();
        if (!hasProof && now - pendingTime > HOLD_TIMEOUT_MS) {
          seat.status = 'available';
          seat.pending_user = null;
          seat.pending_time = null;
          releasedSeats.push(seat.seat_id);
        }
      }
    }
    if (releasedSeats.length > 0) {
      await showtime.save(); // Save if any seat was released
    }
    // --- END AUTO RELEASE ---

    const unavailableSeats = [];

    // Kiểm tra xem ghế có available không
    for (const seatId of seatIds) {
      const seat = showtime.seats_layout.find(s => s.seat_id === seatId);
      if (!seat) {
        console.log(`DEBUG: Seat ${seatId} not found in layout.`);
        unavailableSeats.push(seatId); 
        continue;
      }

      const isHeldByOther = seat.pending_user && seat.pending_user.toString() !== userId.toString();
      
      console.log(`DEBUG: Checking seat ${seat.seat_id}:
        - Status: ${seat.status}
        - Pending User in DB: ${seat.pending_user?.toString()}
        - Current User from Token: ${userId}
        - Is Held By Other?: ${isHeldByOther}`);

      // Ghế không khả dụng nếu: đã được đặt (booked), hoặc đang được người khác giữ (pending by other)
      if (seat.status === 'booked' || (seat.status === 'pending' && isHeldByOther)) {
        console.log(`DEBUG: Seat ${seat.seat_id} is considered UNAVAILABLE.`);
        unavailableSeats.push(seatId);
      }
    }

    if (unavailableSeats.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Ghế: ${unavailableSeats.join(', ')} đang có người khác đặt. Vui lòng chờ hoặc chọn ghế khác`,
        unavailableSeats,
      }, { status: 409 });
    }

    // Nếu tất cả ghế đều hợp lệ, tiến hành giữ ghế
    for (const seatId of seatIds) {
        const seat = showtime.seats_layout.find(s => s.seat_id === seatId);
        seat.status = 'pending';
        seat.pending_user = new mongoose.Types.ObjectId(userId);
        seat.pending_time = new Date();
    }

    await showtime.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Ghế đã được giữ thành công.',
      seats: seatIds
    });
  } catch (error) {
    console.error('Hold seat error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 