import { connectToDatabase } from '../lib/mongodb.js';
import Showtime from '../models/Showtime.js';

async function main() {
  await connectToDatabase();
  console.log('Connected to database');
  // Lọc các showtime thuộc rạp Beta
  const betaShowtimes = await Showtime.find({ theater_chain: /Beta/i });
  const result = await Showtime.updateMany({ theater_chain: /Beta/i }, { $unset: { seats_layout: 1 } });
  console.log(`Cleared seats_layout from ${result.modifiedCount || result.nModified} Beta showtimes.`);
  console.log(`Total Beta showtimes found: ${betaShowtimes.length}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 