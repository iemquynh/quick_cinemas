import { connectToDatabase } from '../lib/mongodb.js';
import Showtime from '../models/Showtime.js';
import Theater from '../models/Theater.js';
import { seatmapConfigs } from '../components/seatmapConfigs.js';
import mongoose from 'mongoose';

// Hàm sinh seats_layout từ seatmapConfigs
function generateSeatsLayout(theaterChain) {
  // Tìm key trong seatmapConfigs mà tên rạp chứa key đó (không phân biệt hoa thường)
  const keys = Object.keys(seatmapConfigs);
  const foundKey = keys.find(
    k => theaterChain && theaterChain.toLowerCase().includes(k.toLowerCase())
  );
  const config = seatmapConfigs[foundKey] || seatmapConfigs[keys[0]];
  if (!config) return [];
  const seats = [];
  const seatRows = config.SEATS || [];
  const vipSeats = config.VIP_SEATS || [];
  const coupleSeats = config.COUPLE_SEATS || [];
  const flatCoupleSeats = Array.isArray(coupleSeats[0])
    ? coupleSeats.flat().filter(Boolean)
    : coupleSeats;
  for (const row of seatRows) {
    for (const seat_id of row) {
      if (!seat_id) continue;
      let type = 'normal';
      if (flatCoupleSeats.includes(seat_id)) {
        type = 'couple';
      } else if (vipSeats.includes(seat_id)) {
        type = 'vip';
      }
      seats.push({
        seat_id,
        type,
        status: 'available',
        pending_user: null,
        pending_time: null,
        booked_user: null
      });
    }
  }
  return seats;
}

async function main() {
  await connectToDatabase();
  console.log('Connected to database');

  // Lấy tất cả showtime (không limit)
  const showtimes = await Showtime.find({});
  console.log(`Found ${showtimes.length} showtimes to update.`);

  for (const st of showtimes) {
    const theater = await Theater.findById(st.theater_id);
    if (!theater) {
      console.log(`Theater not found for showtime ${st._id}`);
      continue;
    }
    // Sinh lại toàn bộ seats_layout mới
    const seats_layout = generateSeatsLayout(theater.theater_chain);
    // In số lượng ghế từng hàng cho kiểm tra trực quan
    const config = seatmapConfigs[theater.theater_chain] || seatmapConfigs[Object.keys(seatmapConfigs)[0]];
    if (config && config.SEATS) {
      console.log(`Showtime ${st._id} - Theater: ${theater.name} (${theater.theater_chain})`);
      config.SEATS.forEach((row, idx) => {
        const count = row.filter(x => !!x).length;
        console.log(`  Row ${idx}: ${count} seats`);
      });
      console.log(`  Total seats (should match seats_layout): ${seats_layout.length}`);
    }
    st.seats_layout = seats_layout;
    try {
      await st.save();
      console.log(`Updated showtime ${st._id}`);
    } catch (err) {
      console.error('Error updating showtime', st._id, err.message);
    }
  }
  console.log('Done!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 