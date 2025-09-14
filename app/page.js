"use client";
import Header from '../components/Header'
import Footer from '@/components/Footer';
import SiteFooter from '../components/SiteFooter';
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // nếu bạn dùng cả isSameOrAfter
import Image from 'next/image';
import { motion } from 'framer-motion';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter); // nếu cần


export default function Home() {
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState('now-showing');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);

  const today = dayjs().startOf('day');
  const [isMobile, setIsMobile] = useState(false);

  // check screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("useEffect promotions chạy");
    const fetchPromotions = async () => {
      console.log("fetchPromotions bắt đầu");
      try {
        const token = localStorage.getItem("auth-token");
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        console.log("Headers gửi đi:", headers);

        const res = await fetch("/api/promotions", { headers });
        console.log("Response object:", res);

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log("Promotions data:", data);

        setPromotions(data);
      } catch (err) {
        console.error("Failed to fetch promotions:", err);
      } finally {
        setLoadingPromotions(false);
      }
    };

    fetchPromotions();
  }, []);


  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        console.log('Dữ liệu phim:', data);
        // Xử lý data ở đây
        if (Array.isArray(data)) {
          setMovies(data);
        } else if (Array.isArray(data.movies)) {
          setMovies(data.movies);
        } else {
          setMovies([]);
        }
      })
      .catch(err => console.error('Lỗi lấy phim:', err));
  }, []);

  const filteredMovies = movies.filter((movie) => {
    const releaseDate = dayjs(movie.releaseDate).startOf('day'); // chuẩn hóa về 00:00
    return filter === 'now-showing'
      ? releaseDate.isSame(today) || releaseDate.isBefore(today)
      : releaseDate.isAfter(today);
  });

  return (
    <>
      <div className="min-h-full">
        <Header />

        <main className="overflow-auto bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" style={{ marginTop: '4rem', maxHeight: 'calc(100vh - 4rem)' }}>
          <div className="px-4 bg-[#0a1a2f]">
            <div className="carousel rounded-xl overflow-x-auto w-full space-x-4 p-4 snap-x snap-mandatory pl-6">
              {promotions.map((promo) => (
                <div
                  key={promo._id}
                  className="carousel-item flex-shrink-0 snap-start flex justify-center"
                >
                  <img
                    src={promo.img_url}
                    alt={promo.title}
                    className="max-w-[600px] max-h-[400px] object-contain rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>


          {/* TOP FILMS */}
          <div className="w-full bg-[#0a1a2f] py-8 pt-16">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-3xl font-bold text-white tracking-widest text-center">
                TOP FILMS
              </h2>
              <div className="w-24 h-1 bg-[#4fd1ff] mt-2 rounded"></div>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              {movies.length === 0 ? (
                <div className="text-white">Loading data...</div>
              ) : (
                [...movies]
                  .filter((m) => typeof m.rating_average === "number")
                  .sort((a, b) => b.rating_average - a.rating_average)
                  .slice(0, 6)
                  .map((movie) => {
                    // Poster + rating badge
                    const Poster = (
                      <Link
                        key={movie._id}
                        href={`/movies/${movie._id}`}
                        className="relative w-full cursor-pointer group"
                        title={movie.title}
                      >
                        <img
                          src={
                            movie.poster ||
                            "https://via.placeholder.com/200x300?text=No+Image"
                          }
                          alt={movie.title}
                          className={`rounded-lg w-full aspect-[2/3] object-cover shadow-lg border border-transparent transition duration-300 ease-in-out 
                  ${!isMobile ? "hover:border-[#4fd1ff] hover:scale-105" : ""}`}
                          onError={(e) =>
                          (e.currentTarget.src =
                            "https://img.lovepik.com/photo/45007/3927.jpg_wh860.jpg")
                          }
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                          ⭐ {movie.rating_average || "N/A"}
                        </div>
                      </Link>
                    );

                    // Tên phim
                    const Title = (
                      <div className="mt-3 text-white font-extrabold text-lg text-center tracking-wide leading-tight">
                        {movie.title}
                      </div>
                    );

                    // Nếu mobile → animation cho poster thôi
                    return isMobile ? (
                      <div
                        key={movie._id}
                        className="w-60 flex flex-col items-center"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{
                            opacity: 1,
                            y: 0,
                            borderColor: "#4fd1ff",
                            boxShadow: "0px 4px 12px rgba(79, 209, 255, 0.4)",
                          }}
                          transition={{ duration: 0.5 }}
                          viewport={{ once: true }}
                          className="w-full"
                        >
                          {Poster}
                        </motion.div>
                        {Title}
                      </div>
                    ) : (
                      <div
                        key={movie._id}
                        className="w-48 sm:w-60 md:w-48 lg:w-48 flex flex-col items-center"
                      >
                        {Poster}
                        {Title}
                      </div>
                    );
                  })
              )}
            </div>
          </div>


          {/* NOW SHOWING / COMING SOON */}
          <section className="bg-[#0a1a2f] py-12 pt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                {filter === "now-showing" ? "NOW SHOWING" : "COMING SOON"}
              </h2>
              <div className="h-1 w-24 bg-blue-400 mx-auto mt-2 rounded-full" />
            </div>

            <div className="flex justify-center gap-6 mb-8">
              <button
                onClick={() => setFilter("now-showing")}
                className={`text-lg font-medium ${filter === "now-showing" ? "text-white" : "text-gray-400"
                  } hover:text-gray-200`}
              >
                Now Showing
              </button>
              <button
                onClick={() => setFilter("coming-soon")}
                className={`text-lg font-medium ${filter === "coming-soon" ? "text-white" : "text-gray-400"
                  } hover:text-gray-200`}
              >
                Coming Soon
              </button>
            </div>

            {/* 👉 chỉ cần 1 grid/flex bọc bên ngoài */}
            <div
              className={`${isMobile ? "grid grid-cols-2 gap-6 px-6" : "flex flex-wrap justify-center gap-6 px-6"
                }`}
            >
              {filteredMovies.map((movie) => (
                <Link
                  key={movie._id}
                  href={`/movies/${movie._id}`}
                  className={`w-40 sm:w-48 rounded-xl border border-transparent transition-all duration-300 ${!isMobile
                    ? "hover:border-blue-400 hover:shadow-xl hover:scale-105 transform"
                    : ""
                    }`}
                >
                  {isMobile ? (
                    <motion.div
                      className="bg-[#152d45] rounded-xl overflow-hidden shadow border border-transparent"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{
                        opacity: 1,
                        scale: 1,
                        borderColor: "#4fd1ff",
                        boxShadow: "0px 4px 12px rgba(79, 209, 255, 0.4)",
                      }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <img
                        src={movie.poster || "https://img.lovepik.com/photo/45007/3927.jpg_wh860.jpg"}
                        alt={movie.title}
                        className="w-full h-60 object-cover"
                      />
                      <div className="p-3 text-center text-white font-semibold truncate">
                        {movie.title}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-[#152d45] rounded-xl overflow-hidden shadow">
                      <img
                        src={movie.poster || "https://img.lovepik.com/photo/45007/3927.jpg_wh860.jpg"}
                        alt={movie.title}
                        className="w-full h-60 object-cover"
                        onError={(e) => (e.currentTarget.src = "https://img.lovepik.com/photo/45007/3927.jpg_wh860.jpg")}
                      />
                      <div className="p-3 text-center text-white font-semibold truncate">
                        {movie.title}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>


          <div className="w-full bg-[#0a1a2f] py-8 pt-16">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-3xl font-bold text-white tracking-widest text-center">SNACK SMARTER - SAVE MORE</h2>
              <div className="w-24 h-1 bg-[#4fd1ff] mt-2 rounded"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {/* Card 1 */}
              <div
                className="relative bg-white w-80 rounded-lg shadow-md flex flex-col overflow-hidden
                 transition-all duration-300 ease-in-out
                 hover:-translate-y-2 hover:shadow-2xl hover:bg-blue-50"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 95% 100%, 0 100%)" }}
              >
                <img
                  className="w-full h-60 object-cover"
                  alt="card 1"
                  src="https://ik.imagekit.io/tvlk/xpe-asset/AyJ40ZAo1DOyPyKLZ9c3RGQHTP2oT4ZXW+QmPVVkFQiXFSv42UaHGzSmaSzQ8DO5QIbWPZuF+VkYVRk6gh-Vg4ECbfuQRQ4pHjWJ5Rmbtkk=/2001689643679/Lotte%2520Cinema%2520Concession%2520Combo%2520Vouchers%2520%2528Nationwide%2529-49864538-e023-42c3-be8b-76259be18e5a.jpeg?tr=q-60,c-at_max,w-1280,h-720&_src=imagekit"
                />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 text-[#0a1a2f]">Quick Bite - 70.000 VND</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    Craving a quick movie snack? Grab this classic combo of buttery popcorn and a refreshing drink – the perfect duo to elevate your cinema experience!
                  </p>
                  <p className="text-xs text-gray-500 mb-1">Save 10% compared to buying directly at the cinema counter!</p>
                  <p className="text-xs text-gray-500 mb-2">Expires: 26/09/2025</p>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="relative bg-white w-80 rounded-lg shadow-md flex flex-col overflow-hidden
                 transition-all duration-300 ease-in-out
                 hover:-translate-y-2 hover:shadow-2xl hover:bg-blue-50"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 95% 100%, 0 100%)" }}
              >
                <img
                  src="https://template.canva.com/EAFhGHEpt4E/1/0/1600w-_DutY_Zv0cM.jpg"
                  alt="Limitless Plus"
                  className="w-full h-60 object-cover"
                />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 text-[#0a1a2f]">Duo Snack Combo - 130.000 VND</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    Double the popcorn, double the fun! Perfect for couples or besties, this combo keeps you fueled throughout your movie journey.
                  </p>
                  <p className="text-xs text-gray-500 mb-1">Enjoy 10% off compared to standard cinema prices!</p>
                </div>
              </div>

              {/* Card 3 */}
              <div
                className="relative bg-white w-80 rounded-lg shadow-md flex flex-col overflow-hidden
                 transition-all duration-300 ease-in-out
                 hover:-translate-y-2 hover:shadow-2xl hover:bg-blue-50"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 95% 100%, 0 100%)" }}
              >
                <img src="/logo/popcorn.png" alt="card 3" className="w-full h-60 object-cover" />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 text-[#0a1a2f]">Family Movie Feast - 199.000 VND</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    Make movie time family time with our ultimate sharing combo! Loaded with generous portions of popcorn and drinks to keep everyone happy.
                  </p>
                  <p className="text-xs text-gray-500 mb-1">Save 10% vs. in-theater pricing – more snacks, less spending!</p>
                  <p className="text-xs text-gray-500 mb-2">Expires: 26/09/2025</p>
                </div>
              </div>
            </div>
          </div>



          <div className="w-full bg-[#0a1a2f] py-12">
            <section className="py-16 text-white">
              <div className="max-w-6xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-12 items-center">

                {/* Hình ảnh bên trái */}
                <div className="flex justify-center">
                  <div className="bg-white/10 p-6 rounded-3xl shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl max-w-full">
                    <img
                      src="https://evgroup.vn/wp-content/uploads/2024/04/thiet_bi_rap_phim_06.jpg"
                      alt="Xem phim cùng gia đình"
                      className="w-72 md:w-96 h-auto object-contain rounded-2xl max-w-full"
                    />
                  </div>
                </div>

                {/* Nội dung bên phải */}
                <div>
                  <h2 className="text-3xl md:text-5xl font-extrabold leading-snug mb-6 tracking-wide text-white drop-shadow-lg">
                    Book Movie Tickets Online –<br className="hidden md:block" />
                    An Easy Experience
                  </h2>
                  <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-xl">
                    Instead of waiting in line at the cinema, you can easily select movies, showtimes, and seats right from home. Our constantly updated system ensures you never miss any exciting screenings.
                  </p>

                  <button
                    onClick={() => router.push('/films')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-600 hover:shadow-2xl transition-all duration-300"
                  >
                    Watch Hot Movies
                  </button>
                </div>
              </div>
            </section>
          </div>





          <SiteFooter />
        </main>


        {/* <Footer /> */}
      </div>
    </>
  )
}


