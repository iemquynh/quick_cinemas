import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Booking from '@/models/Booking';
import Showtime from '@/models/Showtime';
import Theater from '@/models/Theater';
import Movie from '@/models/Movie';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const status = searchParams.get('status');
    if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    const query = { user_id };
    if (status) query.status = status;
    const bookings = await Booking.find(query)
      .populate({
        path: 'showtime_id',
        populate: [
          { path: 'theater_id', select: 'name address' },
          { path: 'movie_id', select: 'title' }
        ]
      })
      .sort({ createdAt: -1 });
    return NextResponse.json(bookings, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 