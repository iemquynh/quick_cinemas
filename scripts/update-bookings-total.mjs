import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import { ticketPrices } from '../config/ticketPrices.js';

const COMBOS = [
  { id: 1, name: "Bắp + Nước", price: 70000 },
  { id: 2, name: "Combo 2 Bắp + 2 Nước", price: 130000 },
  { id: 3, name: "Combo Gia đình", price: 199000 },
];

function getSeatPrice(theaterChain, screenType, seatType) {
  const chain = ticketPrices[theaterChain] || ticketPrices[Object.keys(ticketPrices)[0]];
  const type = chain[screenType] || chain[Object.keys(chain)[0]];
  return type[seatType] || type["normal"] || 70000;
}

async function main() {
  const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/quick_cinema';
  await mongoose.connect(MONGODB_URL);
  const bookings = await Booking.find({});
  let updated = 0;
  for (const booking of bookings) {
    const showtime = await Showtime.findById(booking.showtime_id);
    if (!showtime) continue;
    let seatTotal = 0;
    const countedCoupleSeats = new Set();
    for (let i = 0; i < (booking.seats || []).length; i++) {
      const s = booking.seats[i];
      if (s.type === 'couple') {
        if (countedCoupleSeats.has(s.seat_id)) continue;
        const pair = (booking.seats || []).find(
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
    if (booking.combos) {
      comboTotal = Object.entries(booking.combos).reduce((sum, [id, qty]) => {
        const combo = COMBOS.find(c => c.id === Number(id));
        return sum + (combo ? combo.price * qty : 0);
      }, 0);
    }
    const total = seatTotal + comboTotal;
    booking.total = total;
    await booking.save();
    updated++;
    console.log(`Updated booking ${booking._id}: total = ${total}`);
  }
  console.log(`Done. Updated ${updated} bookings.`);
  process.exit();
}

main(); 