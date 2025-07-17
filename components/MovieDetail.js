import React, { useState, useEffect } from "react";
import Header from './Header';
import { useAdmin } from '@/hooks/useCurrentUser';
import AdminGuard from '@/components/AdminGuard';
// import MovieComments from '../movies/[id]/MovieComments';
import MovieComments from '../app/movies/[id]/MovieComments';
import SiteFooter from "./SiteFooter";

function getYouTubeId(url) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// DateSelector chỉ còn chọn ngày, không còn filter theater
function DateSelector({ selectedDate, setSelectedDate, theaterSearch, setTheaterSearch, movieId }) {
  const [selected, setSelected] = useState(0);
  const [startIdx, setStartIdx] = useState(0);
  const daysToShow = 7;

  // Tạo mảng ngày từ hôm nay đến 3 tháng sau (~90 ngày)
  const days = [
    { label: "TODAY", date: new Date() },
    ...Array.from({ length: 89 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      // Sửa: clone object Date để không bị lỗi tham chiếu
      return {
        label: d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }),
        date: new Date(d),
      };
    }),
  ];

  const canPrev = startIdx > 0;
  const canNext = startIdx + daysToShow < days.length;
  const visibleDays = days.slice(startIdx, startIdx + daysToShow);

  // Khi chọn ngày, cập nhật selectedDate ở cha
  const handleSelect = (realIdx, d) => {
    setSelected(realIdx);
    setSelectedDate(d.date);
  };

  useEffect(() => {
    // Khi mount, set ngày hôm nay
    setSelectedDate(days[0].date);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="mt-8 w-full flex flex-col items-center">
      <div className="flex justify-between items-center mb-4 w-full max-w-3xl">
        <div className="text-white text-base md:text-lg">
          Show me times for <span className="text-sky-400 cursor-pointer">Cinemas</span>
        </div>
        <input
          type="text"
          className="px-3 py-1 rounded-lg border border-gray-600 bg-[#1a2332] text-white text-base focus:outline-none min-w-[180px]"
          placeholder="Search theater..."
          value={theaterSearch}
          onChange={e => setTheaterSearch(e.target.value)}
        />
      </div>
      <div className="relative w-full max-w-3xl">
        <div className="flex items-center gap-2 justify-center overflow-x-auto no-scrollbar pb-2">
          <button
            className={`text-sky-400 px-2 py-1 text-xl ${!canPrev ? "opacity-30 cursor-not-allowed" : ""}`}
            aria-label="Prev"
            onClick={() => canPrev && setStartIdx(startIdx - 1)}
            disabled={!canPrev}
          >&lt;</button>
          {visibleDays.map((d, idx) => {
            const realIdx = startIdx + idx;
            return (
              <button
                key={realIdx}
                className={`flex flex-col items-center px-4 py-2 rounded-none font-medium transition-all
                  ${selected === realIdx
                    ? "text-sky-400 border-b-2 border-sky-400"
                    : "text-white/80 hover:text-sky-300"
                  }`}
                onClick={() => handleSelect(realIdx, d)}
                style={{ minWidth: 70 }}
              >
                <span className="text-base font-semibold">{d.label === "TODAY" ? "TODAY" : d.label.split(',')[0] + ','}</span>
                {d.label !== "TODAY" && (
                  <span className="text-sm mt-1">{d.label.split(',')[1]?.trim()}</span>
                )}
              </button>
            );
          })}
          <button
            className={`text-sky-400 px-2 py-1 text-xl ${!canNext ? "opacity-30 cursor-not-allowed" : ""}`}
            aria-label="Next"
            onClick={() => canNext && setStartIdx(startIdx + 1)}
            disabled={!canNext}
          >&gt;</button>
        </div>
        <div className="border-b border-[#233554] absolute left-0 right-0 bottom-0" />
      </div>
    </div>
  );
}

// ShowtimesGrid lấy dữ liệu động từ API
function getTypeColor(type) {
  switch (type) {
    case "4DX": return "bg-pink-500";
    case "IMAX": return "bg-orange-500";
    case "2D": return "bg-green-500";
    case "3D": return "bg-yellow-400";
    case "ScreenX": return "bg-gray-400";
    default: return "bg-cyan-400";
  }
}
function getBookNowColor() {
  return "bg-blue-600 hover:bg-blue-700";
}
function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDateParam(date) {
  // yyyy-mm-dd theo local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function ShowtimesGrid({ movieId, date, theaterSearch }) {
  const [showtimes, setShowtimes] = useState([]);
  useEffect(() => {
    if (!movieId || !date) return;
    fetch(`/api/showtimes?movieId=${movieId}&date=${formatDateParam(date)}`)
      .then(res => res.json())
      .then(data => {
        setShowtimes(Array.isArray(data) ? data : (data.data || []));
      });
  }, [movieId, date]);
  if (!movieId || !date) return null;
  // Lọc showtimes theo theaterSearch nếu có
  const filteredShowtimes = theaterSearch
    ? showtimes.filter(s =>
        s.theater_id &&
        s.theater_id.name &&
        s.theater_id.name.toLowerCase().includes(theaterSearch.toLowerCase())
      )
    : showtimes;
  return (
    <div className="w-full flex flex-col items-center mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-5xl min-h-[180px] place-items-center">
        {filteredShowtimes.length === 0 ? (
          <div className="text-white col-span-full flex justify-center items-center h-full text-lg font-semibold">No theaters in this day</div>
        ) : (
          filteredShowtimes.map((s) => (
            <div key={s._id} className="relative bg-[#0a1a2f] rounded-lg shadow-md w-36 h-32 flex flex-col justify-between p-3 overflow-hidden">
              {/* Dải màu loại màn chiếu */}
              <div className={`absolute top-0 right-0 h-full w-6 ${getTypeColor(s.type)} flex items-center justify-center rounded-tr-lg rounded-br-lg z-10`}>
                <span className="text-xs font-bold text-white rotate-90 tracking-widest">{s.type}</span>
              </div>
              <div className="flex flex-col justify-center items-start h-full">
                <div className="absolute top-2 left-3 text-white text-lg font-bold mb-2">{formatTime(s.time)}</div>
                <div className="absolute top-10 left-3 pr-8 text-xs text-gray-300 font-semibold whitespace-normal break-words w-[110px] max-w-[110px]">
                  {s.theater_id.name}
                </div>
              </div>
              {/* Nút Book Now nằm ngang bên dưới, full width,bo góc phải dưới, màu xanh dương, font bold */}
              <a href={`/book/${s._id}`} className="absolute left-0 right-0 bottom-0 h-6 bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center rounded-br-lg transition z-20">
                Book Now
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function MovieDetail({
    background,
    poster,
    title,
    directors,
    cast,
    synopsis,
    runtime,
    releaseDate,
    genre,
    tags,
    trailerUrl,
    onBook,
    movieId,
    relatedMovies = []
}) {
    console.log('relatedMovies prop:', relatedMovies);
    const [showTrailer, setShowTrailer] = useState(false);
    const videoId = trailerUrl ? getYouTubeId(trailerUrl) : null;
    const { user, loading } = useAdmin();
    const isTheaterAdmin = user && user.role === 'theater_admin';
    const isSuperAdmin = user && user.role === 'super_admin';
    const isNormalUser = user && !isSuperAdmin && !isTheaterAdmin;
    const headerHeight = 60; // chiều cao header admin panel (px)
    const floatingCardTop = 220 + (isSuperAdmin || isTheaterAdmin ? (headerHeight - 60) : 0);
    const [selectedDate, setSelectedDate] = useState(null);
    const [theaterSearch, setTheaterSearch] = useState("");

    useEffect(() => {
      setSelectedDate(null); // hoặc setSelectedDate(new Date());
    }, [movieId]);

    return (
      <div className="relative min-h-screen bg-gray-900">
        {/* Header hoặc Admin Panel */}
        {!loading && (
            isSuperAdmin ? (
                <AdminGuard headerOnly />
            ) : isTheaterAdmin ? (
                <div className="fixed top-0 left-0 w-full z-50 bg-[#1a2332] text-white shadow-lg border-b border-gray-800">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <h1 className="text-xl font-bold text-white">
                                    Theater Admin Panel
                                </h1>
                                <span className="text-sm text-gray-400">
                                    Welcome, {user?.username || 'Admin'}
                                    {user?.theater_chain && ` - ${user.theater_chain}`}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <a 
                                    href="/admin/dashboard"
                                    className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                                >
                                    Dashboard
                                </a>
                                <button
                                    onClick={user.logout}
                                    className="text-gray-300 hover:text-white text-sm px-3 py-1 rounded border border-gray-600"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <Header />
            )
        )}
        {/* Video/Background */}
        <div className="w-full relative" style={{ height: 270, backgroundColor: "#111", marginTop: (isSuperAdmin || isTheaterAdmin) ? headerHeight : 60 }}>
            {showTrailer && videoId ? (
                <iframe
                    className="w-full h-full absolute inset-0"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="Trailer"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />
            ) : (
                <>
                    <img
                        src={background}
                        alt={title}
                        className="w-full h-full object-cover"
                        style={{ height: 270 }}
                    />
                    {videoId && (
                        <button
                            className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                            onClick={() => setShowTrailer(true)}
                        >
                            <div className="w-20 h-20 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
                                <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    )}
                </>
            )}
        </div>
        {/* Floating Card */}
        <div
            className="absolute left-1/2 -translate-x-1/2 z-30 w-full max-w-6xl"
            style={{ top: floatingCardTop }}
        >
            <div className="bg-opacity-95 rounded-lg shadow-2xl px-10 py-8 w-full">
                <div className="flex flex-row items-start gap-10 mx-auto" style={{ width: 950}}>
                    {/* Poster + Book button */}
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 200 }}>
                        <img
                            src={poster}
                            alt={title}
                            className="w-44 h-auto rounded-lg shadow-2xl border-2 border-white"
                        />
                        {/* <button
                            onClick={onBook}
                            className="mt-6 border-2 border-white text-white font-bold py-2 px-8 rounded-lg text-lg transition-colors duration-200 hover:bg-white hover:text-blue-900"
                            disabled={isTheaterAdmin}
                            style={isTheaterAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                            Book tickets
                        </button> */}
                    </div>
                    {/* Info */}
                    <div className="flex flex-col justify-start" style={{ width: 750 }}>
                        {/* Title + badge */}
                        <div className="flex flex-row items-end gap-3 mb-4">
                            <h1 className="text-4xl font-bold text-white uppercase tracking-wide" style={{textShadow: "0 2px 8px #000"}}>
                                {title}
                            </h1>
                            {/* Badge age rating nếu có */}
                            <span className="mb-1 inline-block align-middle bg-pink-600 text-white text-xs px-2 py-1 rounded-full">15</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Left column */}
                            <div className="flex-[1_1_67%]">
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-300">DIRECTORS</span>
                                    <div className="text-white">{directors}</div>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-300">CAST</span>
                                    <div className="text-white">{cast}</div>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-300">SYNOPSIS</span>
                                    <div className="text-white">{synopsis}</div>
                                </div>
                            </div>
                            {/* Right column */}
                            <div className="flex-[1_1_35%]">
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-300">RUNTIME</span>
                                    <div className="text-white">{runtime}</div>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-300">RELEASE DATE</span>
                                    <div className="text-white">{releaseDate}</div>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-300">GENRE</span>
                                    <div>
                                        {genre && genre.split(',').map((g, idx) => (
                                            <span key={idx} className="inline-block border border-white text-white text-xs px-2 py-1 rounded mr-2">{g.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-300">TAGS</span>
                                    <div>
                                        {tags && tags.split(',').map((t, idx) => (
                                            <span key={idx} className="inline-block border border-gray-400 text-gray-300 text-xs px-2 py-1 rounded mr-2">{t.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Spacer để đẩy DateSelector xuống dưới card */}
        <div style={{height: 300}} />
        {/* MovieComments */}
        <MovieComments movieId={movieId} readOnly={user && (isSuperAdmin || isTheaterAdmin)} />
        {/* Ẩn các phần bên dưới nếu là super admin/theater admin */}
        {!(isSuperAdmin || isTheaterAdmin) && (
          <>
            {/* DateSelector căn giữa toàn màn hình, nằm ngoài card */}
            <div className="w-full flex justify-center mt-8">
              <div className="w-full max-w-4xl">
                <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} theaterSearch={theaterSearch} setTheaterSearch={setTheaterSearch} movieId={movieId} />
              </div>
            </div>
            {/* ShowtimesGrid dưới DateSelector */}
            <ShowtimesGrid movieId={movieId} date={selectedDate} theaterSearch={theaterSearch} />
            {/* Related Movies dưới ShowtimesGrid */}
            {relatedMovies && (
              <div className="w-full max-w-6xl mx-auto mt-12">
                <h2 className="text-2xl font-bold text-center mb-6 text-white tracking-wide">Related Movies</h2>
                <div className={
                  `w-full ${relatedMovies.length < 4 ? 'flex justify-center gap-6 flex-wrap' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'}`
                }>
                  {relatedMovies.map(m => {
                    const id = typeof m._id === 'object' && m._id.$oid ? m._id.$oid : m._id;
                    return (
                      <div key={id} className="bg-[#101c2c] rounded-lg shadow p-4 flex flex-col items-center w-64">
                        <img src={m.poster} alt={m.title} className="w-full h-44 object-cover rounded mb-3" />
                        <div className="text-white font-semibold text-lg text-center mb-1 truncate">{m.title}</div>
                        <div className="text-gray-400 text-sm text-center mb-2 truncate">{m.genre}</div>
                        <a href={`/movies/${id}`} className="mt-auto px-4 py-1 bg-sky-700 text-white rounded-full text-xs font-bold hover:bg-sky-500 transition">View</a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <SiteFooter marginBottom={0} />
          </>
        )}
      </div>
    );
}