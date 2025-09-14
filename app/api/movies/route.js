import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Movie from '../../../models/Movie';
import User from '@/models/User';
import Booking from '@/models/Booking';
import Showtime from '@/models/Showtime';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

function decodeTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // console.error('❌ Failed to decode token:', error.message);
    return null;
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const by = searchParams.get('by');
    const userId = searchParams.get('userId');

    const userFromToken = decodeTokenFromRequest(request);

    const role = userFromToken
      ? (await User.findById(userFromToken.userId))?.role || 'guest'
      : 'guest';


    // 👇 Nếu không phải super_admin thì chỉ hiển thị phim active
    let movieFilter = {};
    if (role !== 'super_admin') {
      movieFilter.isActive = true;
    }

    if (by === 'user-preferred-genre') {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }

      const genreRegexArray = (user.favorite_genres || []).map(g => new RegExp(g, 'i'));
      movieFilter.genre = { $in: genreRegexArray };
    }

    else if (by === 'user-booked-genre') {
      if (!userId) {
        return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
      }

      const bookings = await Booking.find({ user_id: userId });
      const showtimeIds = bookings.map(b => b.showtime_id);
      const showtimes = await Showtime.find({ _id: { $in: showtimeIds } });
      const bookedMovieIds = showtimes.map(st => st.movie_id.toString());

      const bookedMovies = await Movie.find({ _id: { $in: bookedMovieIds }, isActive: true });

      let genres = [];
      for (const movie of bookedMovies) {
        if (Array.isArray(movie.genre)) {
          genres.push(...movie.genre.map(g => g.trim()));
        } else if (typeof movie.genre === 'string') {
          genres.push(...movie.genre.split(',').map(g => g.trim()));
        }
      }
      genres = [...new Set(genres)];

      const movies = await Movie.find({
        isActive: true,
        _id: { $nin: bookedMovieIds },
        $or: [
          { genre: { $in: genres } },
          { genre: { $regex: genres.join('|'), $options: 'i' } }
        ]
      });

      return NextResponse.json(movies);
    }

    else if (by === 'top-ranking') {
      const movies = await Movie.find(
        role === 'super_admin' ? {} : { isActive: true }
      )
        .sort({ rating_average: -1 })
        .limit(10);

      return NextResponse.json(movies);
    }

    const movies = await Movie.find(movieFilter).sort({ createdAt: -1 });
    return NextResponse.json(movies);

  } catch (error) {
    // console.error('❌ Error fetching movies:', error.message);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch movies', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const movie = await Movie.create(body);

    return NextResponse.json({ success: true, movie }, { status: 201 });
  } catch (error) {
    // console.error("❌ Error creating movie:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to create movie", error: error.message },
      { status: 500 }
    );
  }
}

