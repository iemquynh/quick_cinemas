import { connectToDatabase } from '../../../lib/mongodb';
import Showtime from '../../../models/Showtime';
import Theater from '../../../models/Theater';
import { seatmapConfigs } from '@/components/seatmapConfigs';
import jwt from 'jsonwebtoken';
import User from '../../../models/User';
import mongoose from 'mongoose';

// Hàm sinh seats_layout từ seatmapConfigs
function generateSeatsLayout(theaterChain) {
  const config = seatmapConfigs[theaterChain] || seatmapConfigs[Object.keys(seatmapConfigs)[0]];
  if (!config) return [];
  const seats = [];
  const seatRows = config.SEATS || [];
  const vipSeats = config.VIP_SEATS || [];
  const coupleSeats = config.COUPLE_SEATS || [];
  const flatCoupleSeats = Array.isArray(coupleSeats[0])
    ? coupleSeats.flat().filter(Boolean)
    : coupleSeats;

  for (let rowIndex = 0; rowIndex < seatRows.length; rowIndex++) {
    const row = seatRows[rowIndex];
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const seat_id = row[colIndex];
      if (!seat_id) continue; // Bỏ qua khoảng trống
      let type = 'normal';
      if (flatCoupleSeats.includes(seat_id)) {
        type = 'couple';
      } else if (vipSeats.includes(seat_id)) {
        type = 'vip';
      }
      seats.push({
        seat_id,
        type,
        row: rowIndex,
        col: colIndex,
        status: 'available',
        pending_user: null,
        pending_time: null,
        booked_user: null
      });
    }
  }
  return seats;
}

export async function POST(req) {
  await connectToDatabase();
  const data = await req.json();
  // Lấy thông tin theater để có theater_chain
  const theater = await Theater.findById(data.theater);
  if (!theater) {
    return new Response(JSON.stringify({ error: 'Theater not found' }), { status: 404 });
  }

  // Nếu seats_layout là string (do frontend truyền sai), parse lại
  if (typeof data.seats_layout === 'string') {
    try {
      data.seats_layout = JSON.parse(data.seats_layout);
    } catch (e) {
      data.seats_layout = [];
    }
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
  // Nếu seats_layout là mảng object đúng định dạng thì dùng, nếu không thì tự sinh
  if (Array.isArray(data.seats_layout) && data.seats_layout.length > 0 && typeof data.seats_layout[0] === 'object') {
    showtimeData.seats_layout = data.seats_layout;
  } else {
    showtimeData.seats_layout = generateSeatsLayout(theater.theater_chain);
  }
  console.log('DEBUG seats_layout:', Array.isArray(showtimeData.seats_layout), typeof showtimeData.seats_layout[0]);
  try {
    const showtime = await Showtime.create(showtimeData);
    return new Response(JSON.stringify(showtime), { status: 201 });
  } catch (error) {
    console.error('Showtime create error:', error.message);
    return new Response(JSON.stringify({ error: 'Showtime validation failed' }), { status: 500 });
  }
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