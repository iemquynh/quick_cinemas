import MovieDetailClient from '../../../components/MovieDetailClient.js';
import { AdminProvider } from '@/hooks/useCurrentUser';

export default async function MoviePage({ params, searchParams }) {
  const movieId = params.id;
  const showtimeId = searchParams?.showtimeId || null;

  // Gọi API để lấy dữ liệu phim
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/movies/${movieId}`, { cache: 'no-store' });
  const result = await res.json();

  // Nếu không tìm thấy phim hoặc lỗi
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Movie Not Found</h1>
          <p className="text-gray-400 mb-6">The movie with ID {movieId} doesn't exist.</p>
          <a 
            href="/movies" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Movies
          </a>
        </div>
      </div>
    );
  }

  // Lấy danh sách phim liên quan trực tiếp từ DB
  const Movie = (await import('../../../models/Movie')).default;
  const { connectToDatabase } = await import('../../../lib/mongodb');
  await connectToDatabase();
  const mongoose = (await import('mongoose')).default;
  const genres = result.data.genre.split(',').map(g => g.trim());
  const relatedMovies = await Movie.aggregate([
    { $match: { _id: { $ne: new mongoose.Types.ObjectId(movieId) } } },
    { $addFields: {
        genreArray: { $map: { input: { $split: ["$genre", ","] }, as: "g", in: { $trim: { input: "$$g" } } } }
      }
    },
    { $addFields: {
        matchCount: {
          $size: {
            $setIntersection: [
              genres,
              "$genreArray"
            ]
          }
        }
      }
    },
    { $match: { matchCount: { $gt: 0 } } },
    { $sort: { matchCount: -1 } },
    { $limit: 4 }
  ]);

  function serializeMovie(m) {
    return {
      ...m,
      _id: m._id?.toString ? m._id.toString() : m._id,
      createdAt: m.createdAt?.toISOString ? m.createdAt.toISOString() : m.createdAt,
      updatedAt: m.updatedAt?.toISOString ? m.updatedAt.toISOString() : m.updatedAt,
    };
  }
  const relatedMoviesSerialized = relatedMovies.map(serializeMovie);

  // Bọc MovieDetailClient trong AdminProvider
  return (
    // <AdminProvider>
      <MovieDetailClient
        movieData={result.data}
        movieId={movieId}
        relatedMovies={relatedMoviesSerialized}
        showtimeId={showtimeId}
      />
    // </AdminProvider>
  );
}