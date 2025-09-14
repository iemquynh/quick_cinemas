"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Sparkles, Clapperboard, Heart, Star } from "lucide-react";
import Image from 'next/image';
import { motion } from "framer-motion";


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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);


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

  const renderMovies = (movies, isMobile) => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
      {movies.map((movie) => {
        const CardContent = (
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={movie.poster || "https://img.lovepik.com/photo/45007/3927.jpg_wh860.jpg"}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => (e.currentTarget.src = "https://img.lovepik.com/photo/45007/3927.jpg_wh860.jpg")}
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
              ⭐ {movie.rating_average || "N/A"}
            </div>
          </div>
        );

        const CardWrapper = (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300">
            {CardContent}
            <div className="p-4">
              <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                {movie.title}
              </h3>
              <div className="mt-2 text-sm text-gray-400 space-y-1">
                <p>🎬 {movie.genre}</p>
                <p>⏱ {movie.runtime}</p>
                <p>📅 {movie.releaseDate}</p>
              </div>
            </div>
          </div>
        );

        return (
          <Link key={movie._id} href={`/movies/${movie._id}`} className="group">
            {isMobile ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1, // giảm scale cho nhẹ, không tràn màn hình
                  borderColor: "#3b82f6",
                  boxShadow: "0px 4px 12px rgba(59,130,246,0.4)",
                }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true, amount: 0.3 }}
                className="rounded-2xl border border-transparent"
              >
                {CardWrapper}
              </motion.div>

            ) : (
              CardWrapper
            )}
          </Link>
        );
      })}
    </div>
  );


  const renderSection = (title, icon, color, movies, showAll, toggleShowAll) => {
    if (movies.length === 0) return null;
    const displayedMovies = showAll ? movies : movies.slice(0, 6);

    return (
      <section className="mb-16">
        {/* Phần tiêu đề */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-3">
          <div className={`p-2 rounded-full bg-gray-800 border ${color.replace("text-", "border-")}`}>
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-snug">
              {title}
            </h2>
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 animate-pulse text-blue-400 flex-shrink-0" />
          </div>


        </div>

        {/* Grid phim */}
        {renderMovies(displayedMovies, isMobile)}

        {/* Show more button ở dưới */}
        {movies.length > 6 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={toggleShowAll}
              className={`text-sm px-6 py-2 rounded-full border ${color.replace("text-", "border-")} ${color} hover:underline transition-all duration-200`}
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

        <div className="max-w-6xl mx-auto px-8">
          {loading ? (
            <div className="text-center text-white text-lg animate-pulse">Loading...</div>
          ) : (
            <>
              {renderSection(
                'Movies of the same genre you have previously booked',
                <Clapperboard className="w-5 h-5 text-neutral-200" />,
                'text-neutral-200',
                filterMoviesBySearch(bookedGenreMovies),
                showAllBooked,
                () => setShowAllBooked(!showAllBooked)
              )}
              {renderSection(
                'Movies based on your selected interests during registration',
                <Heart className="w-5 h-5 text-neutral-200" />,
                'text-neutral-200',
                filterMoviesBySearch(preferredGenreMovies),
                showAllPreferred,
                () => setShowAllPreferred(!showAllPreferred)
              )}
              {renderSection(
                'Top-rated movies',
                <Star className="w-5 h-5 text-neutral-200" />,
                'text-neutral-200',
                filterMoviesBySearch(topRankingMovies),
                showAllTop,
                () => setShowAllTop(!showAllTop)
              )}

              {/* {renderSection(
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
              )} */}

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
