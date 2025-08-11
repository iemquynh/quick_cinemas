import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Booking from '@/models/Booking'; // file export là BookingV2
import Showtime from '@/models/Showtime';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { connectToDatabase } from '@/lib/mongodb';
import { notifyTheaterAdmin, notifyUser } from '@/lib/socket';
import { getAuth } from '@/utils/auth';
import { ticketPrices } from '@/config/ticketPrices';
import Promotion from '@/models/Promotion';

// Hàm tính tổng tiền giống FE
function getSeatPrice(theaterChain, screenType, seatType) {
  const chain = ticketPrices[theaterChain] || ticketPrices[Object.keys(ticketPrices)[0]];
  const type = chain[screenType] || chain[Object.keys(chain)[0]];
  return type[seatType] || type["normal"] || 70000;
}
const COMBOS = [
  { id: 1, name: "Bắp + Nước", price: 70000 },
  { id: 2, name: "Combo 2 Bắp + 2 Nước", price: 130000 },
  { id: 3, name: "Combo Gia đình", price: 199000 },
];

export async function POST(req) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const { userId } = await getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lấy showtime để lấy thông tin rạp, loại màn hình
    const showtime = await Showtime.findById(body.showtime_id);
    if (!showtime) {
      throw new Error('Showtime not found');
    }
    // Tính tổng tiền
    let seatTotal = 0;
    const countedCoupleSeats = new Set();
    for (let i = 0; i < body.seats.length; i++) {
      const s = body.seats[i];
      if (s.type === 'couple') {
        if (countedCoupleSeats.has(s.seat_id)) continue;
        const pair = body.seats.find(
          (other, idx) =>
            other.type === 'couple' &&
            other.seat_id !== s.seat_id &&
            !countedCoupleSeats.has(other.seat_id)
        );
        countedCoupleSeats.add(s.seat_id);
        if (pair) countedCoupleSeats.add(pair.seat_id);
        seatTotal += getSeatPrice(showtime.theater_chain, showtime.type, 'couple');
      } else {
        seatTotal += getSeatPrice(showtime.theater_chain, showtime.type, s.type);
      }
    }
    let comboTotal = 0;
    if (body.combos) {
      comboTotal = Object.entries(body.combos).reduce((sum, [id, qty]) => {
        const combo = COMBOS.find(c => c.id === Number(id));
        return sum + (combo ? combo.price * qty : 0);
      }, 0);
    }
    const total = seatTotal + comboTotal;

    // Sau khi tính total:

    let discountAmount = 0;
    if (body.promotion_id) {
      // Lấy promotion từ DB
      const promo = await Promotion.findById(body.promotion_id);

      if (promo) {
        // Kiểm tra điều kiện áp dụng mã
        const now = new Date();
        const startDate = promo.start_date ? new Date(promo.start_date) : null;
        const endDate = promo.end_date ? new Date(promo.end_date) : null;
        if (
          promo.active !== false &&
          (startDate === null || now >= startDate) &&
          (endDate === null || now <= endDate) &&
          (promo.max_usage === null || promo.used_count < promo.max_usage) &&
          total >= (promo.minimum_order_amount || 0)
        ) {
          if (promo.discount_type === "percentage") {
            discountAmount = total * (promo.discount_value / 100);
          } else if (promo.discount_type === "fixed") {
            discountAmount = promo.discount_value;
          }
          if (promo.maximum_discount_amount !== null && promo.maximum_discount_amount !== undefined) {
            discountAmount = Math.min(discountAmount, promo.maximum_discount_amount);
          }
          discountAmount = Math.max(0, Math.min(discountAmount, total));
        }
      }
    }

    const finalPrice = total - discountAmount;

    const booking = new Booking({
      user_id: userId,
      showtime_id: body.showtime_id,
      seats: body.seats,
      combos: body.combos,
      payment_proof_url: body.payment_proof_url,
      status: 'pending',
      total: total,
      final_price: finalPrice,
      promotion_id: body.promotion_id || null,
    });
    await booking.save();


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