'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaRegHandPointer } from 'react-icons/fa';
import Header from '@/components/Header';
import { motion } from "framer-motion";

const PLACEHOLDER_IMGS = [
  'https://png.pngtree.com/png-clipart/20190516/original/pngtree-white-cinema-theatre-screen-with-red-curtains-and-chairs-png-image_3662495.jpg',
  'https://kubetvip88.com/wp-content/uploads/2025/02/360_F_752317051_7aFHdD03877W4JH4Y3yjYhkr6q6hT1Gr.jpg',
  'https://www.freeiconspng.com/uploads/movie-theatre-png-11.png',
  'https://png.pngtree.com/thumb_back/fh260/background/20230519/pngtree-an-empty-movie-theater-with-lots-of-red-seats-image_2604057.jpg',
  'https://static.vinwonders.com/production/2025/02/rap-chieu-phim-sai-gon-thumb.jpg',
  'https://cdn.dealtoday.vn/img/s800x400/9641fe44941f436b92a624bc1eb3a679.jpg?sign=2ahfNEQTNzu0VhpR7sOE4Q',
];

export default function CinemasPage() {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768); // < md thì coi là mobile
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    fetch('/api/theaters')
      .then(res => res.json())
      .then(data => {
        const withImg = data.map(theater => ({
          ...theater,
          _randomImg: theater.image || theater.poster || theater.logo
            ? null
            : PLACEHOLDER_IMGS[Math.floor(Math.random() * PLACEHOLDER_IMGS.length)],
        }));
        setTheaters(withImg);
        setLoading(false);
      });
  }, []);

  const filteredTheaters = theaters.filter(theater => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (theater.name && theater.name.toLowerCase().includes(q)) ||
      (theater.address && theater.address.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 mt-16">
        <div className="container mx-auto px-6 md:px-12">
          {/* Search Bar */}
          <div className="mb-10 flex justify-center">
            <input
              type="text"
              placeholder="Search by name or location"
              className="w-full md:w-1/2 px-5 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Loading or Results */}
          {loading ? (
            <div className="text-center text-white text-lg animate-pulse">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTheaters.length === 0 ? (
                <div className="col-span-full text-center text-gray-400">No matching cinemas found.</div>
              ) : (
                filteredTheaters.map(theater => (
                  <motion.div
  key={theater._id}
  initial={{ opacity: 0, y: 30, scale: 0.95 }}
  whileInView={{
    opacity: 1,
    y: 0,
    scale: 1,
    ...(isMobile && { boxShadow: "0 0 20px rgba(59,130,246,0.6)" }) // chỉ mobile mới có ánh sáng
  }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
  className="group bg-gray-900 rounded-2xl overflow-hidden shadow-xl
             transition duration-300
             md:hover:shadow-blue-600/30 md:hover:-translate-y-1 md:hover:scale-[1.02]"
>


                    <Link href={`/cinemas/${theater._id}`}>
                      <div className="relative w-full h-48">
                        <img
                          src={theater.image || theater.poster || theater.logo || theater._randomImg}
                          alt={theater.name}
                          className="w-full h-full object-cover object-center"
                          onError={e => {
                            e.currentTarget.src =
                              PLACEHOLDER_IMGS[Math.floor(Math.random() * PLACEHOLDER_IMGS.length)];
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-200">
                          <FaRegHandPointer className="text-white text-2xl" />
                        </div>
                      </div>

                      <div className="p-4 text-white space-y-1">
                        <h2 className="text-lg font-semibold uppercase group-hover:text-blue-400 line-clamp-2">
                          {theater.name}
                        </h2>
                        <p className="text-sm text-gray-400 line-clamp-2">📍 {theater.address}</p>
                        <p className="text-sm">
                          🏢 Chain:{' '}
                          <span className="font-medium text-blue-400">{theater.theater_chain || 'Unknown'}</span>
                        </p>
                        <p className="text-sm">
                          🎥 Rooms:{' '}
                          <span className="font-medium text-gray-200">{theater.rooms || 'N/A'}</span>
                        </p>
                        <p className="text-sm">
                          🖥️ Screens:{' '}
                          <span className="font-medium text-gray-200">
                            {theater.screenTypes?.length ? theater.screenTypes.join(', ') : 'N/A'}
                          </span>
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
