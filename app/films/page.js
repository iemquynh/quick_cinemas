"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Sparkles } from "lucide-react";

export default function FilmsPage() {
  const [bookedGenreMovies, setBookedGenreMovies] = useState([]);
  const [preferredGenreMovies, setPreferredGenreMovies] = useState([]);
  const [topRankingMovies, setTopRankingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAllBooked, setShowAllBooked] = useState(false);
  const [showAllPreferred, setShowAllPreferred] = useState(false);
  const [showAllTop, setShowAllTop] = useState(false);

  // New: State for search term
  const [searchTerm, setSearchTerm] = useState('');

  // New: Filter function
  const filterMoviesBySearch = (movies) => {
    if (!searchTerm.trim()) return movies;
    return movies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) {
        console.warn('No user found in localStorage');
        setLoading(false);
        return;
      }

      const userId = user.id;

      const bookedRes = await fetch(`/api/movies?by=user-booked-genre&userId=${userId}`);
      const booked = await bookedRes.json();
      setBookedGenreMovies(booked);

      const prefRes = await fetch(`/api/movies?by=user-preferred-genre&userId=${userId}`);
      const pref = await prefRes.json();
      setPreferredGenreMovies(pref);

      const topRes = await fetch('/api/movies?by=top-ranking');
      const top = await topRes.json();
      setTopRankingMovies(top);

      setLoading(false);
    }

    fetchData();
  }, []);

  const renderMovies = (movies) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <Link key={movie._id} href={`/movies/${movie._id}`} className="group">
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border border-gray-700 hover:border-blue-400">
            <div className="relative">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-64 object-cover rounded-t-xl"
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                ⭐ {movie.rating_average || 'N/A'}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                {movie.title}
              </h3>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span className="capitalize">🎬 {movie.genre}</span>
                <span>⏱ {movie.runtime}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">📅 {movie.releaseDate}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderSection = (title, icon, color, movies, showAll, toggleShowAll) => {
    if (movies.length === 0) return null;
    const displayedMovies = showAll ? movies : movies.slice(0, 6);

    return (
      <section className="mb-16">
        <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold ${color} mb-6 border-b pb-2 flex items-center gap-2`}>
          {icon} {title} <Sparkles className={`${color.replace('text-', 'text-')} w-5 h-5 animate-pulse`} />
        </h2>
        {renderMovies(displayedMovies)}
        {movies.length > 6 && (
          <div className="text-center mt-4">
            <button
              onClick={toggleShowAll}
              className={`text-sm px-4 py-2 rounded-full border ${color.replace('text-', 'border-')} ${color} hover:underline`}
            >
              {showAll ? 'Show less' : 'Show more'}
            </button>
          </div>
        )}
      </section>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-10 mt-6">
        {/* 🔍 Search Input */}
        <div className="container mx-auto px-4 mt-6 flex justify-end">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-7"
          />
        </div>

        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center text-white text-lg animate-pulse">Loading...</div>
          ) : (
            <>
              {renderSection(
                'Movies of the same genre you have previously booked',
                '🎞️',
                'text-blue-400',
                filterMoviesBySearch(bookedGenreMovies),
                showAllBooked,
                () => setShowAllBooked(!showAllBooked)
              )}
              {renderSection(
                'Movies based on your selected interests during registration',
                '🍿',
                'text-green-400',
                filterMoviesBySearch(preferredGenreMovies),
                showAllPreferred,
                () => setShowAllPreferred(!showAllPreferred)
              )}
              {renderSection(
                'Top-rated movies',
                '⭐',
                'text-yellow-400',
                filterMoviesBySearch(topRankingMovies),
                showAllTop,
                () => setShowAllTop(!showAllTop)
              )}

              {filterMoviesBySearch(bookedGenreMovies).length === 0 &&
                filterMoviesBySearch(preferredGenreMovies).length === 0 &&
                filterMoviesBySearch(topRankingMovies).length === 0 && (
                  <div className="text-center text-gray-400 mt-10">No suitable movies to display.</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
