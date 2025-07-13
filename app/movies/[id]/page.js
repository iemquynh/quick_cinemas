import MovieDetailClient from '../../../components/MovieDetailClient.js';
import Header from '../../../components/Header.js';

export default async function MoviePage({ params }) {
  const movieId = params.id;

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

  // Trả về giao diện chi tiết phim
  return (
    <>
      <Header />
      <MovieDetailClient
        movieData={result.data}
        movieId={movieId}
      />
    </>
  );
}