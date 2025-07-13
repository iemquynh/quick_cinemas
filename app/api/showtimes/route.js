import { connectToDatabase } from '../../../lib/mongodb';
import Showtime from '../../../models/Showtime';

export async function POST(req) {
  await connectToDatabase();
  const data = await req.json();
  // Map frontend fields to database schema fields
  const showtimeData = {
    movie_id: data.movie,
    theater_id: data.theater,
    room: data.room,
    time: data.time,
    type: data.type
  };
  const showtime = await Showtime.create(showtimeData);
  return new Response(JSON.stringify(showtime), { status: 201 });
}

export async function GET() {
  await connectToDatabase();
  const showtimes = await Showtime.find()
    .populate('movie_id', 'title poster')
    .populate('theater_id', 'name address');
  return new Response(JSON.stringify(showtimes), { status: 200 });
} 