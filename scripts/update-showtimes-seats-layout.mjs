import { connectToDatabase } from '../lib/mongodb.js';
import Showtime from '../models/Showtime.js';
import Theater from '../models/Theater.js';
import { seatmapConfigs } from '../components/seatmapConfigs.js';

function generateSeatsLayout(theaterChain) {
  const config = seatmapConfigs[theaterChain] || seatmapConfigs[Object.keys(seatmapConfigs)[0]];
  if (!config) return [];
  const seats = [];
  const rows = config.ROWS || [];
  const cols = config.COLS || [];
  const vipRows = config.VIP_ROWS || [];
  const coupleSeats = config.COUPLE_SEATS || [];
  for (const row of rows) {
    for (const col of cols) {
      const seat_id = row + col;
      let type = 'normal';
      if (vipRows.includes(row)) type = 'vip';
      if (Array.isArray(coupleSeats) && coupleSeats.includes(seat_id)) type = 'couple';
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
  const showtimes = await Showtime.find({});
  let updated = 0;
  for (const st of showtimes) {
    if (!st.seats_layout || st.seats_layout.length === 0) {
      // Lấy theater_chain từ trường hoặc từ theater_id
      let theaterChain = st.theater_chain;
      if (!theaterChain && st.theater_id) {
        const theater = await Theater.findById(st.theater_id);
        theaterChain = theater?.theater_chain;
      }
      if (!theaterChain) continue;
      st.seats_layout = generateSeatsLayout(theaterChain);
      await st.save();
      updated++;
      console.log(`Updated showtime ${st._id} with seats_layout (${theaterChain})`);
    }
  }
  console.log(`Done. Updated ${updated} showtimes.`);
  process.exit();
}

main(); 