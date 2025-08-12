'use client';

import { AdminProvider } from '@/hooks/useCurrentUser';
import MovieDetail from './MovieDetail';

export default function MovieDetailClient({ movieData, movieId, relatedMovies }) {
  // const handleBookTicket = () => {
  //   if (movieData.showtimes && movieData.showtimes.length > 0) {
  //     const showtimeId = movieData.showtimes[0]._id || movieData.showtimes[0].id;
  //     if (showtimeId) {
  //       window.location.href = `/book/seats?showtime_id=${showtimeId}`;
  //       return;
  //     }
  //   }
  // };

  return (
    <AdminProvider>
    <MovieDetail
      {...movieData}
      movieId={movieId} 
      // onBook={handleBookTicket}
      relatedMovies={relatedMovies}
    />
    </AdminProvider>
  );
} 