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

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter); // nếu cần


export default function Home() {
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState('now-showing');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const today = dayjs().startOf('day');

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
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(173,176,181,0.8) 100%)' }}>
            <div className="carousel w-full">
              <div id="slide1" className="carousel-item relative w-full">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp"
                  className="w-full" />
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                  <a href="#slide4" className="btn btn-circle">❮</a>
                  <a href="#slide2" className="btn btn-circle">❯</a>
                </div>
              </div>
              <div id="slide2" className="carousel-item relative w-full">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp"
                  className="w-full" />
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                  <a href="#slide1" className="btn btn-circle">❮</a>
                  <a href="#slide3" className="btn btn-circle">❯</a>
                </div>
              </div>
              <div id="slide3" className="carousel-item relative w-full">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp"
                  className="w-full" />
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                  <a href="#slide2" className="btn btn-circle">❮</a>
                  <a href="#slide4" className="btn btn-circle">❯</a>
                </div>
              </div>
              <div id="slide4" className="carousel-item relative w-full">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp"
                  className="w-full" />
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                  <a href="#slide3" className="btn btn-circle">❮</a>
                  <a href="#slide1" className="btn btn-circle">❯</a>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#0a1a2f] py-8 pt-16">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-3xl font-bold text-white tracking-widest text-center">TOP FILMS</h2>
              <div className="w-24 h-1 bg-[#4fd1ff] mt-2 rounded"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {movies.length === 0 ? (
                <div className="text-white">Đang tải phim...</div>
              ) : (
                [...movies]
                  .filter(m => typeof m.rating_average === 'number') // Đảm bảo có rating
                  .sort((a, b) => b.rating_average - a.rating_average)       // Sắp xếp giảm dần theo rating
                  .slice(0, 6)                                // Chỉ lấy 6 phim đầu
                  .map((movie) => (
                    <Link
                      key={movie._id}
                      href={`/movies/${movie._id}`}
                      className="relative w-48 cursor-pointer group"
                      title={movie.title}
                    >
                      <img
                        src={movie.poster || 'https://via.placeholder.com/200x300?text=No+Image'}
                        alt={movie.title}
                        className="rounded-lg w-full aspect-[2/3] object-cover shadow-lg group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                        ⭐ {movie.rating_average || 'N/A'}
                      </div>
                      <div className="mt-3 text-white font-extrabold text-lg text-center tracking-wide leading-tight">
                        {movie.title}
                      </div>
                    </Link>
                  ))
              )}
            </div>
          </div>

          
          {/* <div className="w-full bg-[#0a1a2f] py-8">
          <hr className="my-8" />
            <div className="min-h-screen px-6 py-10 text-white ">
              <h2 className="text-3xl font-bold text-center mb-8">
                {filter === 'now-showing' ? 'NOW SHOWING' : 'COMING SOON'}
                <div className="h-1 w-24 bg-blue-400 mx-auto mt-2 rounded-full"></div>
              </h2>

              <div className="flex justify-center gap-4 mb-8 text-lg font-medium">
                <button
                  onClick={() => setFilter('now-showing')}
                  className={`hover:text-gray-300 ${filter === 'now-showing' ? 'text-white' : 'text-gray-400'}`}
                >
                  Đang chiếu
                </button>
                <button
                  onClick={() => setFilter('coming-soon')}
                  className={`hover:text-gray-300 ${filter === 'coming-soon' ? 'text-white' : 'text-gray-400'}`}
                >
                  Sắp chiếu
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 px-4">
                {filteredMovies.map((movie) => (
                  <Link key={movie._id} href={`/movies/${movie._id}`} className="group w-40 sm:w-48 md:w-52 lg:w-56">
                    <div className="bg-[#152d45] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 ">
                      <div className="relative w-full h-60">
                        <img
                          src={movie.poster || '/default-poster.jpg'}
                          alt={movie.title}
                          className="w-full h-60 object-cover rounded-t-2xl"
                        />

                      </div>
                      <div className="p-3 text-center">
                        <h3 className="text-sm font-semibold truncate">{movie.title}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div> */}

          <section className="bg-[#0a1a2f] py-12 pt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">
              {filter === 'now-showing' ? 'NOW SHOWING' : 'COMING SOON'}
            </h2>
            <div className="h-1 w-24 bg-blue-400 mx-auto mt-2 rounded-full" />
          </div>
          <div className="flex justify-center gap-6 mb-8">
            <button onClick={() => setFilter('now-showing')} className={`text-lg font-medium ${filter === 'now-showing' ? 'text-white' : 'text-gray-400'} hover:text-gray-200`}>Now Showing</button>
            <button onClick={() => setFilter('coming-soon')} className={`text-lg font-medium ${filter === 'coming-soon' ? 'text-white' : 'text-gray-400'} hover:text-gray-200`}>Coming Soon</button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 px-6">
            {filteredMovies.map((movie) => (
              <Link key={movie._id} href={`/movies/${movie._id}`} className="w-40 sm:w-48">
                <div className="bg-[#152d45] rounded-xl overflow-hidden shadow hover:shadow-xl">
                  <img src={movie.poster || '/default-poster.jpg'} alt={movie.title} className="w-full h-60 object-cover" />
                  <div className="p-3 text-center text-white font-semibold truncate">{movie.title}</div>
                </div>
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
              <div className="relative bg-white w-80 rounded-lg shadow-md flex flex-col overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 95% 100%, 0 100%)" }}>
                <img className="w-full h-60 object-cover" src="https://ik.imagekit.io/tvlk/xpe-asset/AyJ40ZAo1DOyPyKLZ9c3RGQHTP2oT4ZXW+QmPVVkFQiXFSv42UaHGzSmaSzQ8DO5QIbWPZuF+VkYVRk6gh-Vg4ECbfuQRQ4pHjWJ5Rmbtkk=/2001689643679/Lotte%2520Cinema%2520Concession%2520Combo%2520Vouchers%2520%2528Nationwide%2529-49864538-e023-42c3-be8b-76259be18e5a.jpeg?tr=q-60,c-at_max,w-1280,h-720&_src=imagekit" />
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
              <div className="relative bg-white w-80 rounded-lg shadow-md flex flex-col overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 95% 100%, 0 100%)" }}>
                <img src="https://template.canva.com/EAFhGHEpt4E/1/0/1600w-_DutY_Zv0cM.jpg" alt="Limitless Plus" className="w-full h-60 object-cover" />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 text-[#0a1a2f]">Duo Snack Combo - 130.000 VND</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    Double the popcorn, double the fun! Perfect for couples or besties, this combo keeps you fueled throughout your movie journey.
                  </p>
                  <p className="text-xs text-gray-500 mb-1">Enjoy 10% off compared to standard cinema prices!</p>
                </div>
              </div>
              {/* Card 3 */}
              <div className="relative bg-white w-80 rounded-lg shadow-md flex flex-col overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 95% 100%, 0 100%)" }}>
                <img src="/logo/popcorn.png" className="w-full h-60 object-cover" />
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

          <div className="w-full bg-[#0a1a2f] py-8">
          <section className="py-16 text-white">
            <div className="max-w-6xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-10 items-center">

              {/* Hình ảnh bên trái */}
              <div className="flex justify-center">
                <div className="bg-white/10 p-6 rounded-2xl shadow-lg">
                  <img
                    src="https://www.shutterstock.com/image-vector/vector-illustration-happy-kids-going-260nw-201747179.jpg"  // <- Đổi tên file thành banner-cinema.png
                    alt="Xem phim cùng gia đình"
                    className="w-72 md:w-80 h-auto object-contain"
                  />
                </div>
              </div>

              {/* Nội dung bên phải */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-4">
                  Book Movie Tickets Online –<br className="hidden md:block" />
                  An Easy Experience
                </h2>
                <p className="text-lg text-gray-200 mb-6">
                  Instead of waiting in line at the cinema, you can easily select movies, showtimes, and seats right from home. Our constantly updated system ensures you never miss any exciting screenings.
                </p>

                <button onClick={() => router.push('/films')} className="bg-white text-[#1e2b7a] font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition">
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


