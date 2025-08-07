import { connectToDatabase } from '../../../../lib/mongodb';
import Showtime from '../../../../models/Showtime';

export async function GET(req, { params }) {
  await connectToDatabase();
  const showtime = await Showtime.findById(params.id)
    .populate('movie_id', 'title poster')
    .populate('theater_id', 'name address screenTypes')
    .populate('room', 'room')
    .populate('time', 'time')
    .populate('type', 'type');
  if (!showtime) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(showtime), { status: 200 });
}

export async function PUT(req, { params }) {
  await connectToDatabase();
  const data = await req.json();
  // Map frontend fields to database schema fields
  const updateData = {
    movie_id: data.movie,
    theater_id: data.theater,
    room: data.room,
    time: data.time,
    type: data.type
  };
  if (data.seats_layout) updateData.seats_layout = data.seats_layout;
  const showtime = await Showtime.findByIdAndUpdate(params.id, updateData, { new: true })
    .populate('movie_id', 'title poster')
    .populate('theater_id', 'name address');
  if (!showtime) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(showtime), { status: 200 });
}

export async function DELETE(req, { params }) {
  await connectToDatabase();
  const showtime = await Showtime.findByIdAndDelete(params.id);
  if (!showtime) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 