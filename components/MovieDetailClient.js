'use client';

import MovieDetail from './MovieDetail';

export default function MovieDetailClient({ movieData, movieId }) {
  const handleBookTicket = () => {
    alert(`Booking ticket for ${movieData.title} (ID: ${movieId})`);
    // Ở đây bạn có thể redirect đến trang booking hoặc mở modal
  };

  return (
    <MovieDetail
      {...movieData}
      onBook={handleBookTicket}
    />
  );
} 