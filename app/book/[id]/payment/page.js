"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { ticketPrices } from "@/config/ticketPrices";
import { useRef } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const COMBOS = [
  { id: 1, name: "Bắp + Nước", price: 70000 },
  { id: 2, name: "Combo 2 Bắp + 2 Nước", price: 130000 },
  { id: 3, name: "Combo Gia đình", price: 199000 },
];

// Hàm lấy giá vé theo rạp, loại màn hình, loại ghế
function getSeatPrice(theaterChain, screenType, seatType) {
  const chain = ticketPrices[theaterChain] || ticketPrices[Object.keys(ticketPrices)[0]];
  const type = chain[screenType] || chain[Object.keys(chain)[0]];
  return type[seatType] || type["normal"] || 70000;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const showtimeId = params.id;
  const [bookingInfo, setBookingInfo] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    const storedBookingInfo = localStorage.getItem('bookingInfo');
    if (storedBookingInfo) {
      const info = JSON.parse(storedBookingInfo);
      setBookingInfo(info);
      setShowtime({ movie_id: info.movie, theater_id: info.theater });
    }
    setLoading(false);
  }, []);

  // Cảnh báo khi chuyển route (Next.js app router)
  useEffect(() => {
    const handleClick = (e) => {
      // Chỉ cảnh báo nếu click vào link (a) hoặc button trên header
      let el = e.target;
      while (el && el.tagName !== 'A' && el.tagName !== 'BUTTON') el = el.parentElement;
      if (el && (el.tagName === 'A' || el.tagName === 'BUTTON')) {
        if (!window.confirm("Nếu chuyển trang thì thông tin thanh toán sẽ bị hủy. Bạn có chắc chắn muốn rời khỏi trang này?")) {
          e.preventDefault();
        }
      }
    };
    // Gắn listener cho header
    const header = document.querySelector('header, .header, #header');
    if (header) header.addEventListener('click', handleClick, true);
    return () => { if (header) header.removeEventListener('click', handleClick, true); };
  }, []);

  useEffect(() => {
    if (!bookingInfo) return;
    let seatTotal = 0;
    const countedCoupleSeats = new Set();
    for (let i = 0; i < bookingInfo?.selectedSeats.length; i++) {
      const s = bookingInfo.selectedSeats[i];
      if (s.type === 'couple') {
        // Nếu seat_id đã tính rồi thì bỏ qua
        if (countedCoupleSeats.has(s.seat_id)) continue;
        // Tìm seat couple còn lại trong cặp (liền kề trong selectedSeats)
        const pair = bookingInfo.selectedSeats.find(
          (other, idx) =>
            other.type === 'couple' &&
            other.seat_id !== s.seat_id &&
            !countedCoupleSeats.has(other.seat_id)
        );
        // Đánh dấu cả 2 seat_id đã tính
        countedCoupleSeats.add(s.seat_id);
        if (pair) countedCoupleSeats.add(pair.seat_id);
        seatTotal += getSeatPrice(showtime?.theater_chain, showtime?.type, 'couple');
      } else {
        seatTotal += getSeatPrice(showtime?.theater_chain, showtime?.type, s.type);
      }
    }
    let comboTotal = 0;
    if (bookingInfo.comboCounts) {
        comboTotal = Object.entries(bookingInfo.comboCounts).reduce((sum, [id, qty]) => {
          const combo = COMBOS.find(c => c.id === Number(id));
          return sum + (combo ? combo.price * qty : 0);
        }, 0);
    }
    const newTotal = seatTotal + comboTotal;
    
    // So sánh để tránh vòng lặp vô hạn
    if (bookingInfo.total !== newTotal) {
      setBookingInfo(prev => ({...prev, total: newTotal}));
    }

  }, [bookingInfo?.selectedSeats, bookingInfo?.comboCounts]); // Phụ thuộc vào cả ghế và combo

  const handleComboChange = (id, qty) => {
    setBookingInfo(prev => ({ ...prev, comboCounts: { ...prev.comboCounts, [id]: qty } }));
  };

  // Hàm upload ảnh lên server, trả về url
  async function uploadPaymentProof(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  }

  // Hàm xử lý thanh toán
  async function handlePayment() {
    if (!paymentProof) {
      alert("Vui lòng chọn ảnh giao dịch!");
      return;
    }
    try {
      setLoading(true);
      // 1. Upload ảnh
      const proofUrl = await uploadPaymentProof(paymentProof);
      // 2. Gửi API tạo booking trạng thái pending
      const seatsForBooking = bookingInfo.selectedSeats.map(s => ({ seat_id: s.seat_id, type: s.type }));
      // Log dữ liệu gửi lên API booking
      console.log('Booking payload:', {
        showtime_id: bookingInfo.showtimeId,
        seats: seatsForBooking,
        combos: bookingInfo.comboCounts,
        payment_proof_url: proofUrl,
        status: "pending"
      });
      const token = localStorage.getItem('auth-token');
      console.log('Token gửi lên API booking:', token);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          showtime_id: bookingInfo.showtimeId,
          seats: seatsForBooking,
          combos: bookingInfo.comboCounts,
          payment_proof_url: proofUrl,
          status: "pending"
        })
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = { error: 'Không parse được JSON từ API' };
      }
      if (!res.ok) {
        console.error('Booking API error:', data);
        throw new Error(data.error || "Đặt vé thất bại");
      }
      // 3. Chuyển sang trang chờ xác nhận
      router.push(`/book/${showtimeId}/pending?bookingId=${data.bookingId}`);
      // KHÔNG setLoading(false) ở đây nữa!
    } catch (err) {
      alert("Có lỗi khi thanh toán: " + err.message);
      setLoading(false);
    }
  }

  if (loading || !bookingInfo) return <div className="p-8 text-center text-white">Đang tải dữ liệu...</div>;

  const { selectedSeats, comboCounts, movie, theater } = bookingInfo;

  // Đếm số lượng vé thực tế: mỗi cặp couple chỉ tính 1 vé
  let ticketCount = 0;
  const countedCoupleSeats = new Set();
  for (let i = 0; i < selectedSeats.length; i++) {
    const s = selectedSeats[i];
    if (s.type === 'couple') {
      if (countedCoupleSeats.has(s.seat_id)) continue;
      const pair = selectedSeats.find(
        (other, idx) =>
          other.type === 'couple' &&
          other.seat_id !== s.seat_id &&
          !countedCoupleSeats.has(other.seat_id)
      );
      countedCoupleSeats.add(s.seat_id);
      if (pair) countedCoupleSeats.add(pair.seat_id);
      ticketCount++;
    } else {
      ticketCount++;
    }
  }

  return (
    <>
    <Header />
    <div className="min-h-screen bg-[#181c2f] flex flex-col items-center py-8 px-2 mt-10">
      <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-6 md:p-8 mb-8">
        <h2 className="text-2xl font-bold text-center text-[#3b3b3b] mb-6 tracking-wide">Thông tin thanh toán</h2>
        {/* Card thông tin phim/rạp/suất chiếu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-gray-700">Phim:</div>
            <div className="text-base text-gray-900 font-bold">{movie?.title}</div>
            <div className="font-semibold text-gray-700 mt-2">Rạp:</div>
            <div className="text-base text-gray-900">{theater?.name}</div>
            <div className="font-semibold text-gray-700 mt-2">Phòng:</div>
            <div className="text-base text-gray-900">{showtime?.room}</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-gray-700">Thời gian:</div>
            <div className="text-base text-gray-900">{new Date(showtime?.time).toLocaleString()}</div>
            <div className="font-semibold text-gray-700 mt-2">Loại màn hình:</div>
            <div className="text-base text-gray-900">{showtime?.type}</div>
            <div className="font-semibold text-gray-700 mt-2">Địa chỉ:</div>
            <div className="text-base text-gray-900">{theater?.address}</div>
          </div>
        </div>
        {/* Card ghế đã chọn */}
        <div className="bg-[#f6f8fa] rounded-xl p-4 mb-6 shadow-sm">
          <div className="font-semibold text-gray-700 mb-2">Ghế đã chọn:</div>
          {selectedSeats.length === 0 ? (
            <div className="text-gray-500 italic">Bạn chưa chọn ghế nào.</div>
          ) : (
            // Gom các cặp couple lại thành 1 dòng
            (() => {
              const usedCoupleSeats = new Set();
              const displaySeats = [];
              for (let i = 0; i < selectedSeats.length; i++) {
                const s = selectedSeats[i];
                if (s.type === "couple") {
                  if (usedCoupleSeats.has(s.seat_id)) continue;
                  // Tìm seat couple còn lại trong cặp
                  const pair = selectedSeats.find(
                    (other) =>
                      other.type === "couple" &&
                      other.seat_id !== s.seat_id &&
                      !usedCoupleSeats.has(other.seat_id)
                  );
                  usedCoupleSeats.add(s.seat_id);
                  if (pair) usedCoupleSeats.add(pair.seat_id);
                  displaySeats.push({
                    seat_ids: pair ? [s.seat_id, pair.seat_id] : [s.seat_id],
                    type: "couple",
                    price: getSeatPrice(showtime?.theater_chain, showtime?.type, "couple"),
                  });
                } else {
                  displaySeats.push({
                    seat_ids: [s.seat_id],
                    type: s.type,
                    price: getSeatPrice(showtime?.theater_chain, showtime?.type, s.type),
                  });
                }
              }
              return (
                <ul className="flex flex-wrap gap-3 mb-2">
                  {displaySeats.map((s, idx) => (
                    <li key={s.seat_ids.join('-')} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold text-sm shadow">
                      {s.seat_ids.join(' ')} <span className="font-normal">({s.type === "couple" ? "Couple" : s.type || "Thường"})</span> - {s.price.toLocaleString()}đ
                    </li>
                  ))}
                </ul>
              );
            })()
          )}
          <div className="text-gray-700 mt-2">Số lượng vé: <span className="font-bold">{ticketCount}</span></div>
        </div>
        {/* Card combo đồ ăn */}
        <div className="bg-[#f6f8fa] rounded-xl p-4 mb-6 shadow-sm">
          <div className="font-semibold text-gray-700 mb-2">Chọn combo đồ ăn:</div>
          <ul className="flex flex-col gap-2">
            {COMBOS.map(combo => (
              <li key={combo.id} className="flex items-center gap-3">
                <span className="min-w-[140px] text-gray-800">{combo.name}</span>
                <span className="text-gray-600">({combo.price.toLocaleString()}đ)</span>
                <input
                  type="number"
                  min={0}
                  value={comboCounts[combo.id] || 0}
                  onChange={e => handleComboChange(combo.id, Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-center shadow-sm"
                />
              </li>
            ))}
          </ul>
        </div>
        {/* Tổng tiền và thanh toán */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span className="text-gray-700">Tổng tiền:</span>
              <span className="text-green-600 text-2xl font-bold">{(bookingInfo?.total || 0).toLocaleString()}đ</span>
            </div>
            <div className="text-gray-700">
              <span className="font-semibold">Số tài khoản ngân hàng:</span> <span className="text-blue-700 font-bold">0123456789 - Ngân hàng VietcomBank</span>
            </div>
            {/* Upload ảnh giao dịch */}
            <fieldset className="fieldset mt-4">
              <legend className="fieldset-legend" style={{color: "black", fontSize: 18}}>Ảnh giao dịch</legend>
              <input
                type="file"
                className="file-input"
                style={{backgroundColor: "white"}}
                accept="image/*"
                ref={fileInputRef}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) setPaymentProof(e.target.files[0]);
                }}
              />
              <label className="label" style={{color: "black"}}>Max size 2MB</label>
              {paymentProof && (
                <img
                  src={URL.createObjectURL(paymentProof)}
                  alt="Ảnh giao dịch"
                  className="mt-2 max-h-40 rounded border"
                />
              )}
            </fieldset>
          </div>
          <button
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-bold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all mt-2"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
} 