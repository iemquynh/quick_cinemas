import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/mongodb.js';
import Booking from '../models/Booking.js';

await connectToDatabase();

const result = await Booking.updateMany(
  { status: 'expired' },
  { $set: { status: 'using' } }
);

console.log(`✅ Reset ${result.modifiedCount} bookings back to 'using'`);

await mongoose.disconnect();
