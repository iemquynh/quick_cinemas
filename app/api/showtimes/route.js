import { connectToDatabase } from '../../../lib/mongodb';
import Showtime from '../../../models/Showtime';
import Theater from '../../../models/Theater';
import jwt from 'jsonwebtoken';
import User from '../../../models/User';
import mongoose from 'mongoose';

export async function POST(req) {
  await connectToDatabase();
  const data = await req.json();
  // Lấy thông tin theater để có theater_chain
  const theater = await Theater.findById(data.theater);
  if (!theater) {
    return new Response(JSON.stringify({ error: 'Theater not found' }), { status: 404 });
  }

  // Map frontend fields to database schema fields
  const showtimeData = {
    movie_id: data.movie,
    theater_id: data.theater,
    theater_chain: theater.theater_chain,
    room: data.room,
    time: data.time,
    type: data.type
  };
  if (data.seats_layout) showtimeData.seats_layout = data.seats_layout;
  const showtime = await Showtime.create(showtimeData);
  return new Response(JSON.stringify(showtime), { status: 201 });
}

export async function GET(req) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get('movieId');
    const date = searchParams.get('date'); // yyyy-mm-dd

    // Lấy token từ header Authorization
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    // Xây dựng query
    const query = {};
    if (movieId) query.movie_id = new mongoose.Types.ObjectId(movieId);
    if (date) {
      query.$expr = {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$time", timezone: "+07:00" } },
          date
        ]
      };
    }

    let showtimes = await Showtime.find(query)
      .populate('movie_id', 'title poster')
      .populate('theater_id', 'name address');

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        // Nếu là theater_admin, chỉ lấy showtimes của chuỗi rạp mình (so sánh chuỗi đầu tiên của theater_id.name và user.theater_chain)
        if (user && user.role === 'theater_admin' && user.theater_chain) {
          const adminChain = user.theater_chain.split(' ')[0].toLowerCase();
          showtimes = showtimes.filter(st => {
            const theaterName = st.theater_id?.name || '';
            const theaterChain = theaterName.split(' ')[0].toLowerCase();
            return theaterChain === adminChain;
          });
        }
        // Nếu là super_admin hoặc user thường, lấy tất cả
      } catch (error) {
        // Token không hợp lệ, lấy tất cả showtimes
      }
    }
    return new Response(JSON.stringify(showtimes), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 