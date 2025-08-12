"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { ticketPrices } from "@/config/ticketPrices";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCallback } from "react";
import Promotions from "@/components/Promotions";
import Swal from 'sweetalert2';

const COMBOS = [
  { id: 1, name: "Popcorn & Drink", price: 70000 },
  { id: 2, name: "2 Popcorns & 2 Drinks", price: 130000 },
  { id: 3, name: "Family Feast", price: 199000 },
];

// Hàm lấy giá vé theo rạp, loại màn hình, loại ghế
function getSeatPrice(theaterChain, screenType, seatType) {
  const chain = ticketPrices[theaterChain] || ticketPrices[Object.keys(ticketPrices)[0]];
  const type = chain[screenType] || chain[Object.keys(chain)[0]];
  return type[seatType] || type["normal"] || 70000;
}

export default function PaymentPage() {
  console.log("PaymentPage rendered");
  const params = useParams();
  const router = useRouter();
  // const showtimeId = params.id;
  const [bookingInfo, setBookingInfo] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const fileInputRef = useRef();
  const [countdown, setCountdown] = useState(2 * 60 * 1000); // 2 phút
  const [timerStartedAt, setTimerStartedAt] = useState(Date.now());
  const [paymentClicked, setPaymentClicked] = useState(false);
  const { id: showtimeId } = useParams();
  const hasHandledTimeout = useRef(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const discountAmount = useMemo(() => {
    if (!selectedPromotion) return 0;

    const orderTotal = bookingInfo?.total || 0;

    // Kiểm tra điều kiện đơn hàng tối thiểu để áp dụng khuyến mãi
    if (orderTotal < selectedPromotion.minimum_order_amount) {
      return 0; // Không áp dụng giảm giá nếu đơn hàng không đạt tối thiểu
    }

    // Kiểm tra số lần đã dùng và số lần tối đa
    if (
      selectedPromotion.max_usage !== null &&
      selectedPromotion.max_usage !== undefined &&
      selectedPromotion.used_count >= selectedPromotion.max_usage
    ) {
      return 0; // Mã giảm giá đã dùng hết số lần cho phép
    }

    // Kiểm tra ngày hiệu lực (giả sử start_date và end_date là string ISO hoặc Date)
    const now = new Date();
    const startDate = selectedPromotion.start_date ? new Date(selectedPromotion.start_date) : null;
    const endDate = selectedPromotion.end_date ? new Date(selectedPromotion.end_date) : null;

    if ((startDate && now < startDate) || (endDate && now > endDate)) {
      return 0; // Mã chưa đến hạn sử dụng hoặc đã hết hạn
    }

    // Nếu có trường active để check trạng thái kích hoạt
    if (selectedPromotion.active === false) {
      return 0; // Mã đang bị vô hiệu hóa
    }

    let discount = 0;

    if (selectedPromotion.discount_type === "percentage") {
      discount = orderTotal * (selectedPromotion.discount_value / 100);
    } else if (selectedPromotion.discount_type === "fixed") {
      discount = selectedPromotion.discount_value;
    }

    // Áp dụng giới hạn tối đa giảm giá nếu có
    if (
      selectedPromotion.maximum_discount_amount !== null &&
      selectedPromotion.maximum_discount_amount !== undefined
    ) {
      discount = Math.min(discount, selectedPromotion.maximum_discount_amount);
    }

    // Không để giảm giá âm hoặc lớn hơn tổng
    discount = Math.max(0, Math.min(discount, orderTotal));

    return discount;
  }, [selectedPromotion, bookingInfo?.total]);

  const finalPrice = (bookingInfo?.total || 0) - discountAmount;

  useEffect(() => {
    const storedBookingInfo = localStorage.getItem('bookingInfo');
    if (storedBookingInfo) {
      const info = JSON.parse(storedBookingInfo);
      setBookingInfo(info);
      setShowtime({ movie_id: info.movie, theater_id: info.theater });
    } else {
      setBookingInfo(null);  // Reset bookingInfo khi không có trong localStorage
    }
    // Lấy showtime từ API bất kể
    fetch(`/api/showtimes/${showtimeId}`)
      .then(res => res.json())
      .then(data => {
        setShowtime(data);
      });
    setLoading(false);  // Chuyển setLoading ra ngoài fetch và localStorage
  }, [showtimeId]);
  
  useEffect(() => {
    if (bookingInfo) {
      localStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
    }
  }, [bookingInfo]);
  

  // Đếm ngược thời gian giữ chỗ
  useEffect(() => {
    let timeout;
    function updateCountdown() {
      const now = Date.now();
      let base = timerStartedAt;
      let total = paymentClicked ? 2 * 60 * 1000 : 2 * 60 * 1000;
      const diff = base + total - now;
      setCountdown(diff > 0 ? diff : 0);
      if (diff <= 0 && !paymentClicked && !hasHandledTimeout.current) {
        // Hết thời gian giữ chỗ mà chưa thanh toán
        hasHandledTimeout.current = true;
        Swal.fire({
          icon: 'warning',
          title: 'Reservation expired',
          text: 'Reservation time expired. Please select your seats again!',
          confirmButtonText: 'OK'
        }).then(() => router.replace(`/book/${showtimeId}`));
      }
    }
    updateCountdown();
    timeout = setInterval(updateCountdown, 1000);
    return () => clearInterval(timeout);
  }, [timerStartedAt, paymentClicked]);

  // Cảnh báo khi chuyển route (Next.js app router)
  useEffect(() => {
    const handleClick = (e) => {
      // Chỉ cảnh báo nếu click vào link (a) hoặc button trên header
      let el = e.target;
      while (el && el.tagName !== 'A' && el.tagName !== 'BUTTON') el = el.parentElement;
      if (el && (el.tagName === 'A' || el.tagName === 'BUTTON')) {
        e.preventDefault();
        Swal.fire({
          icon: 'warning',
          title: 'Are you sure?',
          text: "If you leave this page, your payment information will be lost.",
          showCancelButton: true,
          confirmButtonText: 'Yes, leave',
          cancelButtonText: 'No, stay'
        }).then((result) => {
          if (result.isConfirmed) {
            if (el.tagName === 'A' && el.href) {
              window.location.href = el.href;
            } else if (el.tagName === 'BUTTON') {
              el.click();
            }
          }
        });
      }
    };
    // Gắn listener cho header
    const header = document.querySelector('header, .header, #header');
    if (header) header.addEventListener('click', handleClick, true);
    return () => { if (header) header.removeEventListener('click', handleClick, true); };
  }, []);

  useEffect(() => {
    if (!bookingInfo) return;
    console.log("Recalculate total, bookingInfo:", bookingInfo);
    let seatTotal = 0;
    const countedCoupleSeats = new Set();
    for (let i = 0; i < bookingInfo?.selectedSeats.length; i++) {
      const s = bookingInfo.selectedSeats[i];
      console.log("Seat", s);
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
    console.log("Calculated newTotal:", newTotal, "previous total:", bookingInfo.total);

    // So sánh để tránh vòng lặp vô hạn
    if (bookingInfo.total !== newTotal) {
      setBookingInfo(prev => ({ ...prev, total: newTotal }));
    }

  }, [bookingInfo?.selectedSeats, bookingInfo?.comboCounts, showtime]); // Phụ thuộc vào cả ghế và combo

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
      Swal.fire({
        icon: 'error',
        title: 'Missing payment proof',
        text: 'Please upload a payment screenshot!',
      });
      return;
    }
    try {
      setLoading(true);
      const result = await Swal.fire({
        title: 'Confirm Payment',
        text: `Are you sure to pay ${finalPrice.toLocaleString()}đ?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, pay now',
        cancelButtonText: 'Cancel',
      });
      if (!result.isConfirmed) {
        setLoading(false);
        return;
      }
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
        status: "pending",
        final_price: finalPrice, 
        promotion_id: setSelectedPromotion?._id || null,
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
          status: "pending",
          final_price: finalPrice,                 // <-- thêm final_price
          promotion_id: selectedPromotion?._id || null
        })
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = { error: 'Failed to parse JSON response from API' };
      }
      if (!res.ok) {
        console.error('Booking API error:', data);
        throw new Error(data.error || "Booking failed");
      }

      Swal.fire({
        icon: 'success',
        title: 'Payment successful',
        text: 'Your booking is pending confirmation.',
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      // 3. Chuyển sang trang chờ xác nhận
      router.push(`/book/${showtimeId}/pending?bookingId=${data.bookingId}`);
      // KHÔNG setLoading(false) ở đây nữa!
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Payment failed',
        text: err.message || 'An error occurred during payment.',
      });
      setLoading(false);
    }
  }

  // Khi ấn thanh toán, set lại 2 phút
  const handlePaymentWithTimer = useCallback(async () => {
    setPaymentClicked(true);
    setTimerStartedAt(Date.now()); // reset timer, sẽ đếm 2 phút từ lúc này
    // Đợi 1 giây để đồng hồ nhảy lên 2 phút
    setTimeout(() => handlePayment(), 1000);
  }, [handlePayment]);

  if (loading || !bookingInfo) return <div className="p-8 text-center text-white">Loading data...</div>;

  // Lấy thông tin để hiển thị
  const movie = bookingInfo?.movie || showtime?.movie_id;
  const theater = bookingInfo?.theater || showtime?.theater_id;
  const room = bookingInfo?.room || showtime?.room;
  const time = bookingInfo?.time || showtime?.time;
  const type = bookingInfo?.type || showtime?.type;

  // Đếm số lượng vé thực tế: mỗi cặp couple chỉ tính 1 vé
  let ticketCount = 0;
  const countedCoupleSeats = new Set();
  for (let i = 0; i < bookingInfo.selectedSeats.length; i++) {
    const s = bookingInfo.selectedSeats[i];
    if (s.type === 'couple') {
      if (countedCoupleSeats.has(s.seat_id)) continue;
      const pair = bookingInfo.selectedSeats.find(
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
          <h2 className="text-2xl font-bold text-center text-[#3b3b3b] mb-6 tracking-wide">Payment information</h2>
          {/* Card thông tin phim/rạp/suất chiếu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-gray-700">Movie:</div>
              <div className="text-base text-gray-900 font-bold">{movie?.title}</div>
              <div className="font-semibold text-gray-700 mt-2">Theater:</div>
              <div className="text-base text-gray-900">{theater?.name}</div>
              <div className="font-semibold text-gray-700 mt-2">Room:</div>
              <div className="text-base text-gray-900">{room || 'N/A'}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-gray-700">Time:</div>
              <div className="text-base text-gray-900">{time ? new Date(time).toLocaleString() : ''}</div>
              <div className="font-semibold text-gray-700 mt-2">Type screen:</div>
              <div className="text-base text-gray-900">{type}</div>
              <div className="font-semibold text-gray-700 mt-2">Address:</div>
              <div className="text-base text-gray-900">{theater?.address}</div>
            </div>
          </div>
          {/* Card ghế đã chọn */}
          <div className="bg-[#f6f8fa] rounded-xl p-4 mb-6 shadow-sm">
            <div className="font-semibold text-gray-700 mb-2">Selected seat:</div>
            {bookingInfo.selectedSeats.length === 0 ? (
              <div className="text-gray-500 italic">You haven't selected any seats.</div>
            ) : (
              // Gom các cặp couple lại thành 1 dòng
              (() => {
                const usedCoupleSeats = new Set();
                const displaySeats = [];
                for (let i = 0; i < bookingInfo.selectedSeats.length; i++) {
                  const s = bookingInfo.selectedSeats[i];
                  if (s.type === "couple") {
                    if (usedCoupleSeats.has(s.seat_id)) continue;
                    // Tìm seat couple còn lại trong cặp
                    const pair = bookingInfo.selectedSeats.find(
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
            <div className="text-gray-700 mt-2">Number of tickets: <span className="font-bold">{ticketCount}</span></div>
          </div>
          {/* Card combo đồ ăn */}
          <div className="bg-[#f6f8fa] rounded-xl p-4 mb-6 shadow-sm">
            <div className="font-semibold text-gray-700 mb-2">Select food combo: </div>
            <ul className="flex flex-col gap-2">
              {COMBOS.map(combo => (
                <li key={combo.id} className="flex items-center gap-3">
                  <span className="min-w-[140px] text-gray-800">{combo.name}</span>
                  <span className="text-gray-600">({combo.price.toLocaleString()}đ)</span>
                  <input
                    type="number"
                    min={0}
                    value={bookingInfo.comboCounts[combo.id] || 0}
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
                <span className="text-gray-700">Total amount:</span>
                <span className="text-green-600 text-2xl font-bold">{(bookingInfo?.total || 0).toLocaleString()}đ</span>
              </div>

              <Promotions
                showtimeId={showtimeId}
                onPromotionSelected={(promo) => {
                  console.log('Chọn promo:', promo);

                  if (!promo) {
                    setSelectedPromotion(null);
                    return;
                  }

                  const orderTotal = bookingInfo?.total || 0;

                  // Kiểm tra điều kiện đơn hàng tối thiểu
                  if (orderTotal < promo.minimum_order_amount) {
                    Swal.fire({
                      icon: 'error',
                      title: 'The order does not meet the minimum amount required to apply this code.',
                      // text: err.message || 'An error occurred during payment.',
                    });
                    // alert("Đơn hàng chưa đạt tối thiểu để áp dụng mã này.");
                    setSelectedPromotion(null);
                    return;
                  }

                  // Kiểm tra số lần đã dùng
                  if (
                    promo.max_usage !== null &&
                    promo.max_usage !== undefined &&
                    promo.used_count >= promo.max_usage
                  ) {
                    Swal.fire({
                      icon: 'error',
                      title: 'This discount code has reached its maximum usage limit.',
                      // text: err.message || 'An error occurred during payment.',
                    });
                    // alert("Mã giảm giá đã được sử dụng hết số lần cho phép.");
                    setSelectedPromotion(null);
                    return;
                  }

                  // Kiểm tra ngày hiệu lực
                  const now = new Date();
                  const startDate = promo.start_date ? new Date(promo.start_date) : null;
                  const endDate = promo.end_date ? new Date(promo.end_date) : null;

                  if ((startDate && now < startDate) || (endDate && now > endDate)) {
                    alert("Mã giảm giá chưa đến hạn hoặc đã hết hạn sử dụng.");
                    setSelectedPromotion(null);
                    return;
                  }

                  // Kiểm tra trạng thái active
                  if (promo.active === false) {
                    alert("Mã giảm giá đang bị vô hiệu hóa.");
                    setSelectedPromotion(null);
                    return;
                  }

                  // Nếu qua hết các check trên thì set mã giảm giá
                  setSelectedPromotion(promo);
                }}
              />

              {selectedPromotion && (
                <div className="mt-4 p-4 border rounded bg-green-50 text-green-800">
                  <p><strong>Selected Promotion:</strong> {selectedPromotion.title}</p>
                  <p>Discount: {discountAmount.toLocaleString()}đ</p>
                  
                </div>
              )}

              {/* <p><strong>Tổng tiền cuối:</strong> {finalPrice.toLocaleString()} đ</p> */}
              <div className="flex items-center justify-between text-lg font-semibold pt-3 pb-3">
                <span className="text-gray-700">Final Total:</span>
                <span className="text-green-600 text-2xl font-bold">{finalPrice.toLocaleString()}đ</span>
              </div>

              <div className="text-gray-700">
                <span className="font-semibold">Bank account number:</span> <span className="text-blue-700 font-bold">0123456789 - VietcomBank</span>
              </div>
              {/* Upload ảnh giao dịch */}
              <fieldset className="fieldset mt-4">
                <legend className="fieldset-legend" style={{ color: "black", fontSize: 18 }}>Payment screenshot</legend>
                <input
                  type="file"
                  className="file-input"
                  style={{ backgroundColor: "white" }}
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) setPaymentProof(e.target.files[0]);
                  }}
                />
                <label className="label" style={{ color: "black" }}>Max size 2MB</label>
                {paymentProof && (
                  <img
                    src={URL.createObjectURL(paymentProof)}
                    alt="Ảnh giao dịch"
                    className="mt-2 max-h-40 rounded border"
                  />
                )}
              </fieldset>
            </div>
            <div className="mb-4">
              <div className="font-semibold text-gray-800">Time left to hold seats:</div>
              <div className="text-red-600 font-bold text-xl">
                {countdown !== null ? (
                  countdown > 0 ?
                    `${Math.floor(countdown / 60000)}:${String(Math.floor((countdown % 60000) / 1000)).padStart(2, '0')} phút` :
                    'Seat reservation time expired'
                ) : '...'}
              </div>
            </div>
            <button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-bold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all mt-2"
              onClick={handlePaymentWithTimer}
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay now"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 