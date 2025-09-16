  "use client";

  import { useEffect, useRef, useState } from "react";
  import { useCurrentUser } from "@/hooks/useCurrentUser";
  import Header from "@/components/Header";
  import { useSearchParams } from "next/navigation";
  import BookingQRCode from "@/components/BookingQRCode";
  import ChatWidget from "@/components/ChatWidget";
  import { FaRegCommentDots } from "react-icons/fa";
  import { getAllTickets, saveTicket } from "@/utils/db";

  const STATUS_TABS = [
    { key: "using", label: "Using" },
    { key: "pending", label: "Pending" },
    { key: "cancel", label: "Cancelled" },
    { key: "expired", label: "Expired" },
  ];

  export default function MyTicketsPage() {
    const { user } = useCurrentUser();
    const [tab, setTab] = useState("using");
    const [bookings, setBookings] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const searchParams = useSearchParams();
    const bookingId = searchParams.get("bookingId");
    const ticketRefs = useRef({});
    const [chatBooking, setChatBooking] = useState(null);
    const [adminMap, setAdminMap] = useState({});

    useEffect(() => {
      fetch("/api/admin/theater-admins")
        .then(res => res.json())
        .then(data => {
          const map = {};
          data.forEach(admin => {
            if (admin.theater_chain) map[admin.theater_chain] = admin._id;
          });
          setAdminMap(map);
        });
    }, []);

    useEffect(() => {
      const userId = user?._id || user?.id;
      if (!userId) return;

      const loadData = async () => {
        setLoadingData(true);

        if (navigator.onLine) {
          try {
            const res = await fetch(`/api/users/bookings?user_id=${userId}&status=${tab}`);
            const data = await res.json();
            const bookings = Array.isArray(data) ? data : data.bookings || [];

            for (const ticket of bookings) {
              const id = ticket.id || ticket._id;
              if (id) await saveTicket({ ...ticket, id });
            }

            setBookings(bookings.filter(t => t.status === tab));
          } catch (err) {
            console.error("Failed to fetch from server:", err);
            setBookings([]);
          }
        } else {
          try {
            const offlineTickets = await getAllTickets();
            const filtered = offlineTickets.filter(t => t.status === tab);
            setBookings(filtered);
          } catch (err) {
            console.error("Failed to load from IndexedDB:", err);
            setBookings([]);
          }
        }

        setLoadingData(false);
      };

      loadData();
    }, [user, tab]);

    useEffect(() => {
      if (bookingId && ticketRefs.current[bookingId]) {
        ticketRefs.current[bookingId].scrollIntoView({ behavior: "smooth", block: "center" });
        ticketRefs.current[bookingId].classList.add("ring-4", "ring-blue-400");
        setTimeout(() => {
          ticketRefs.current[bookingId]?.classList.remove("ring-4", "ring-blue-400");
        }, 2000);
      }
    }, [bookings, bookingId]);

    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 pt-24 pb-16">
          <div className="max-w-6xl mx-auto text-white">
            <h1 className="text-4xl font-bold mb-8 text-center tracking-wider">My Tickets</h1>

            <div className="flex justify-center gap-4 flex-wrap mb-10">
              {STATUS_TABS.map(t => (
                <button
                  key={t.key}
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-200 
                  ${tab === t.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {loadingData ? (
              <div className="text-center text-gray-300 animate-pulse">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center text-gray-400">No tickets found.</div>
            ) : (
              <div className="flex flex-col gap-10">
                {bookings.map(b => {
                  const showtime = b.showtime_id;
                  const movie = showtime?.movie_id;
                  const adminId = adminMap[showtime?.theater_chain];

                  const showDate = showtime?.time ? new Date(showtime.time) : null;
                  const formattedDate = showDate
                    ? `${String(showDate.getDate()).padStart(2, "0")} - ${String(showDate.getMonth() + 1).padStart(2, "0")} - ${showDate.getFullYear()}`
                    : "N/A";
                  const formattedTime = showDate
                    ? showDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    }).toUpperCase()
                    : "N/A";


                  return (
                    <div
                      key={b._id}
                      ref={el => ticketRefs.current[b._id] = el}
                      className="flex flex-col md:flex-row items-stretch w-full max-w-3xl mx-auto shadow-xl rounded-lg overflow-hidden relative z-10"
                      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
                    >
                      {/* Left red part */}
                      <div className="relative flex flex-col justify-between min-h-[200px] md:min-w-[260px] p-6"
                        style={{ backgroundColor: "#d32f2f", color: "white" }}>
                        {/* Stars */}
                        <div className="flex justify-center mb-4 text-yellow-300 relative z-10">
                          {[...Array(4)].map((_, i) => (
                            <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 
              1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 
              1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 
              0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.285-3.955a1 1 
              0 00-.364-1.118L2.04 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 
              1 0 00.95-.69l1.286-3.955z" />
                            </svg>
                          ))}
                        </div>

                        {/* Title */}
                        <div className="flex items-center gap-2 mb-6 relative z-10">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h2zM4 
            6h16M4 10h16M4 14h16" />
                          </svg>
                          <h2 className="text-xl md:text-2xl font-bold">CINEMA TICKET</h2>
                        </div>

                        {/* Info */}
                        <div className="text-xs md:text-sm font-semibold space-y-2 relative z-10">
                          <div className="flex justify-between"><span>DATE :</span><span>{formattedDate}</span></div>
                          <div className="flex justify-between"><span>TIME :</span><span>{formattedTime}</span></div>
                          <div className="flex justify-between"><span>SCREEN :</span><span>{showtime?.type || 'N/A'}</span></div>
                          <div className="flex justify-between"><span>SEAT :</span><span>{b.seats.map(s => s.seat_id).join(', ')}</span></div>
                        </div>

                        {/* Movie name */}
                        <p className="mt-4 text-sm md:text-base font-semibold truncate relative z-10" title={movie?.title || 'Unknown'}>
                          🎬 {movie?.title || 'Unknown'}
                        </p>
                      </div>

                      {/* Middle cut effect (ẩn trên mobile) */}
                      <div className="hidden md:block w-4" style={{ backgroundColor: "#f6e8d9" }}>
                        <div className="absolute -left-2 top-4 w-4 h-4 bg-white rounded-full"></div>
                        <div className="absolute -left-2 bottom-4 w-4 h-4 bg-white rounded-full"></div>
                      </div>

                      {/* Right beige part */}
                      <div
                        className="bg-[#f6e8d9] flex-1 p-6 md:p-8 flex flex-col justify-between text-red-900"
                        style={{ backgroundColor: "#f6e8d9" }}
                      >
                        {/* Info + QR Code */}
                        <div className="flex flex-col md:flex-row md:items-start w-full gap-4 md:gap-8">
                          {/* Info */}
                          <div className="flex flex-col text-sm space-y-1 flex-grow order-1 md:order-none">
                            <p><span className="font-bold">THEATER :</span> {showtime?.theater_id.name}</p>
                            <p><span className="font-bold">ADDRESS :</span> {showtime?.theater_id.address}</p>
                          </div>

                          {/* QR Code */}
                          <div className="w-full md:w-48 md:h-48 flex items-center justify-center p-2 bg-white rounded-lg shadow order-2 md:order-none">
                            <BookingQRCode booking={b} className="max-w-full max-h-full object-contain" />
                          </div>
                        </div>

                        {/* Website + Status + Icon */}
                        <div className="mt-6 flex flex-col md:flex-row items-start md:items-center w-full gap-3">
                          {/* <a
                            href="https://www.website.com"
                            className="px-5 py-1 text-white rounded-full text-xs hover:opacity-90 transition"
                            style={{ backgroundColor: "#d32f2f" }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            www.website.com
                          </a> */}

                          <div className="flex items-center gap-3 md:ml-auto">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold border ${b.status === 'using'
                                  ? 'bg-green-100 text-green-800 border-green-300'
                                  : b.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                    : b.status === 'cancel'
                                      ? 'bg-red-100 text-red-800 border-red-300'
                                      : 'bg-gray-100 text-gray-700 border-gray-300'
                                }`}
                            >
                              {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </span>

                            {(b.status === "using" || b.status === "pending" || b.status === "cancel") && (
                              <button
                                title="Chat với admin rạp"
                                className="hover:scale-110 transition-transform"
                                onClick={() => setChatBooking({ ...b, theaterAdminId: adminId })}
                              >
                                <FaRegCommentDots size={24} className="text-blue-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                  );
                })}
              </div>
            )}
          </div>
        </div>

        {chatBooking && (
          <ChatWidget
            booking={chatBooking}
            user={user}
            onClose={() => setChatBooking(null)}
          />
        )}
      </>
    );
  }
