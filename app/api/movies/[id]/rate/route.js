import { connectToDatabase } from '../../../../../lib/mongodb';
import Movie from '../../../../../models/Movie';

export async function POST(req, { params }) {
  await connectToDatabase();
  const movie_id = params.id;
  const { rating, oldRating } = await req.json();
  if (typeof rating !== 'number' || rating <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid rating' }), { status: 400 });
  }
  const movie = await Movie.findById(movie_id);
  if (!movie) {
    return new Response(JSON.stringify({ error: 'Movie not found' }), { status: 404 });
  }
  let rating_average = movie.rating_average || 0;
  let rating_count = movie.rating_count || 0;
  if (typeof oldRating === 'number' && oldRating > 0) {
    // Update: không tăng rating_count, chỉ cập nhật lại trung bình
    rating_average = ((rating_average * rating_count - oldRating + rating) / rating_count);
  } else {
    // New rating
    rating_average = ((rating_average * rating_count + rating) / (rating_count + 1));
    rating_count += 1;
  }
  movie.rating_average = rating_average;
  movie.rating_count = rating_count;
  await movie.save();
  return new Response(JSON.stringify({ rating_average, rating_count }), { status: 200 });
}

export async function GET(req, { params }) {
  await connectToDatabase();
  const movie_id = params.id;
  const movie = await Movie.findById(movie_id);
  if (!movie) {
    return new Response(JSON.stringify({ error: 'Movie not found' }), { status: 404 });
  }
  return new Response(JSON.stringify({ rating_average: movie.rating_average || 0, rating_count: movie.rating_count || 0 }), { status: 200 });
} 