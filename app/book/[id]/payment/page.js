"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { ticketPrices } from "@/config/ticketPrices";
import Promotions from "@/components/Promotions";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { ShoppingBag, Clock, Film, Building } from "lucide-react";

const COMBOS = [
  { id: 1, name: "Popcorn & Drink", price: 70000 },
  { id: 2, name: "2 Popcorns & 2 Drinks", price: 130000 },
  { id: 3, name: "Family Feast", price: 199000 },
];

// Lấy giá vé theo rạp, loại màn hình, loại ghế
function getSeatPrice(theaterChain, screenType, seatType) {
  const chain = ticketPrices[theaterChain] || ticketPrices[Object.keys(ticketPrices)[0]];
  const type = chain?.[screenType] || chain?.[Object.keys(chain || {})[0]] || {};
  return type?.[seatType] ?? type?.["normal"] ?? 70000;
}

export default function PaymentPage() {
  const { id: showtimeId } = useParams();
  const router = useRouter();

  const [bookingInfo, setBookingInfo] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProof, setPaymentProof] = useState(null);
  const fileInputRef = useRef(null);

  // Đếm ngược 2 phút
  const [countdown, setCountdown] = useState(2 * 60 * 1000);
  const timerStartRef = useRef(Date.now());
  const hasHandledTimeout = useRef(false);

  const [selectedPromotion, setSelectedPromotion] = useState(null);

  // Tính số tiền giảm giá dựa trên total hiện tại
  const discountAmount = useMemo(() => {
    if (!selectedPromotion) return 0;
    const orderTotal = bookingInfo?.total || 0;

    // Điều kiện đơn hàng tối thiểu
    if (orderTotal < (selectedPromotion.minimum_order_amount || 0)) return 0;

    // Số lần sử dụng tối đa
    if (
      selectedPromotion.max_usage !== null &&
      selectedPromotion.max_usage !== undefined &&
      selectedPromotion.used_count >= selectedPromotion.max_usage
    ) {
      return 0;
    }

    // Khoảng thời gian hiệu lực
    const now = new Date();
    const startDate = selectedPromotion.start_date ? new Date(selectedPromotion.start_date) : null;
    const endDate = selectedPromotion.end_date ? new Date(selectedPromotion.end_date) : null;
    if ((startDate && now < startDate) || (endDate && now > endDate)) return 0;

    if (selectedPromotion.active === false) return 0;

    let discount = 0;
    if (selectedPromotion.discount_type === "percentage") {
      discount = orderTotal * (selectedPromotion.discount_value / 100);
    } else if (selectedPromotion.discount_type === "fixed") {
      discount = selectedPromotion.discount_value;
    }

    if (
      selectedPromotion.maximum_discount_amount !== null &&
      selectedPromotion.maximum_discount_amount !== undefined
    ) {
      discount = Math.min(discount, selectedPromotion.maximum_discount_amount);
    }

    discount = Math.max(0, Math.min(discount, orderTotal));
    return discount;
  }, [selectedPromotion, bookingInfo?.total]);

  const finalPrice = Math.max(0, (bookingInfo?.total || 0) - discountAmount);

  // Load dữ liệu từ localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookingInfo");
      if (stored) {
        const info = JSON.parse(stored);
        info.comboCounts = info.comboCounts || {};
        setBookingInfo(info);
      }
    } catch (e) {
      console.error("Failed to parse bookingInfo from localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy showtime (không chặn UI nếu API chậm)
  useEffect(() => {
    if (!showtimeId) return;
    let mounted = true;
    fetch(`/api/showtimes/${showtimeId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data) setShowtime(data);
      })
      .catch((err) => console.error("fetch showtime error", err));
    return () => {
      mounted = false;
    };
  }, [showtimeId]);

  // Lưu lại vào localStorage khi bookingInfo đổi
  useEffect(() => {
    if (bookingInfo) {
      localStorage.setItem("bookingInfo", JSON.stringify(bookingInfo));
    }
  }, [bookingInfo]);

  // Đếm ngược thời gian giữ chỗ
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const total = 2 * 60 * 1000; // 2 phút
      const diff = timerStartRef.current + total - now;
      setCountdown(diff > 0 ? diff : 0);
      if (diff <= 0 && !hasHandledTimeout.current) {
        hasHandledTimeout.current = true;
        Swal.fire({
          icon: "warning",
          title: "Reservation expired",
          text: "Reservation time expired. Please select your seats again!",
          confirmButtonText: "OK",
        }).then(() => router.replace(`/book/${showtimeId}`));
      }
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [router, showtimeId]);

  // Cảnh báo khi chuyển route bằng click ở header
  useEffect(() => {
    const handleClick = (e) => {
      let el = e.target;
      while (el && el.tagName !== "A" && el.tagName !== "BUTTON") el = el.parentElement;
      if (el && (el.tagName === "A" || el.tagName === "BUTTON")) {
        e.preventDefault();
        Swal.fire({
          icon: "warning",
          title: "Are you sure?",
          text: "If you leave this page, your payment information will be lost.",
          showCancelButton: true,
          confirmButtonText: "Yes, leave",
          cancelButtonText: "No, stay",
        }).then((result) => {
          if (result.isConfirmed) {
            if (el.tagName === "A" && el.href) {
              window.location.href = el.href;
            } else if (el.tagName === "BUTTON") {
              el.click();
            }
          }
        });
      }
    };
    const header = document.querySelector("header, .header, #header");
    if (header) header.addEventListener("click", handleClick, true);
    return () => {
      if (header) header.removeEventListener("click", handleClick, true);
    };
  }, []);

  // Recalculate total từ ghế + combo
  useEffect(() => {
    if (!bookingInfo) return;

    let seatTotal = 0;
    const countedCoupleSeats = new Set();

    for (let i = 0; i < (bookingInfo?.selectedSeats || []).length; i++) {
      const s = bookingInfo.selectedSeats[i];
      if (s.type === "couple") {
        if (countedCoupleSeats.has(s.seat_id)) continue;
        const pair = bookingInfo.selectedSeats.find(
          (other) => other.type === "couple" && other.seat_id !== s.seat_id && !countedCoupleSeats.has(other.seat_id)
        );
        countedCoupleSeats.add(s.seat_id);
        if (pair) countedCoupleSeats.add(pair.seat_id);
        seatTotal += getSeatPrice(showtime?.theater_chain, showtime?.type, "couple");
      } else {
        seatTotal += getSeatPrice(showtime?.theater_chain, showtime?.type, s.type);
      }
    }

    let comboTotal = 0;
    if (bookingInfo.comboCounts) {
      comboTotal = Object.entries(bookingInfo.comboCounts).reduce((sum, [id, qty]) => {
        const combo = COMBOS.find((c) => c.id === Number(id));
        const q = Number(qty) || 0;
        return sum + (combo ? combo.price * q : 0);
      }, 0);
    }

    const newTotal = seatTotal + comboTotal;

    if (bookingInfo.total !== newTotal) {
      setBookingInfo((prev) => ({ ...(prev || {}), total: newTotal }));
    }
  }, [bookingInfo?.selectedSeats, bookingInfo?.comboCounts, showtime]);

  const handleComboChange = (id, qty) => {
    const value = Math.max(0, Number(qty) || 0);
    setBookingInfo((prev) => ({
      ...(prev || {}),
      comboCounts: { ...(prev?.comboCounts || {}), [id]: value },
    }));
  };

  // async function uploadPaymentProof(file) {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   const res = await fetch("/api/upload", { method: "POST", body: formData });
  //   if (!res.ok) throw new Error("Upload failed");
  //   const data = await res.json();
  //   return data.url;
  // }

  async function uploadPaymentProof(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");

    const { url } = await res.json();

    // cập nhật bookingInfo trong localStorage
    const info = JSON.parse(localStorage.getItem("bookingInfo")) || {};
    info.payment_proof_url = url;
    localStorage.setItem("bookingInfo", JSON.stringify(info));

    return url;
  }


  // async function handlePayment() {
  //   if (!paymentProof) {
  //     Swal.fire({ icon: "error", title: "Missing payment proof", text: "Please upload a payment screenshot!" });
  //     return;
  //   }

  //   try {
  //     const confirm = await Swal.fire({
  //       title: "Confirm Payment",
  //       text: `Are you sure to pay ${finalPrice.toLocaleString()}đ?`,
  //       icon: "question",
  //       showCancelButton: true,
  //       confirmButtonText: "Yes, pay now",
  //       cancelButtonText: "Cancel",
  //     });
  //     if (!confirm.isConfirmed) return;

  //     const proofUrl = await uploadPaymentProof(paymentProof);

  //     const seatsForBooking = (bookingInfo?.selectedSeats || []).map((s) => ({ seat_id: s.seat_id, type: s.type }));

  //     const token = localStorage.getItem("auth-token");

  //     const res = await fetch("/api/bookings", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         ...(token ? { Authorization: "Bearer " + token } : {}),
  //       },
  //       body: JSON.stringify({
  //         showtime_id: bookingInfo?.showtimeId || showtimeId,
  //         seats: seatsForBooking,
  //         combos: bookingInfo?.comboCounts || {},
  //         payment_proof_url: proofUrl,
  //         status: "pending",
  //         final_price: finalPrice,
  //         promotion_id: selectedPromotion?._id || null,
  //       }),
  //     });

  //     let data;
  //     try {
  //       data = await res.json();
  //     } catch (e) {
  //       data = { error: "Failed to parse JSON response from API" };
  //     }

  //     if (!res.ok) {
  //       console.error("Booking API error:", data);
  //       throw new Error(data.error || "Booking failed");
  //     }

  //     await Swal.fire({
  //       icon: "success",
  //       title: "Payment successful",
  //       text: "Your booking is pending confirmation.",
  //       timer: 2000,
  //       showConfirmButton: false,
  //       toast: true,
  //       position: "top-end",
  //     });

  //     router.push(`/book/${showtimeId}/pending?bookingId=${data.bookingId}`);
  //   } catch (err) {
  //     Swal.fire({ icon: "error", title: "Payment failed", text: err.message || "An error occurred during payment." });
  //   }
  // }

  async function handlePayment() {
    if (!paymentProof) {
      Swal.fire({
        icon: "error",
        title: "Missing payment proof",
        text: "Please upload a payment screenshot!",
      });
      return;
    }

    try {
      const confirm = await Swal.fire({
        title: "Confirm Payment",
        text: `Are you sure to pay ${finalPrice.toLocaleString()}đ?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, pay now",
        cancelButtonText: "Cancel",
      });
      if (!confirm.isConfirmed) return;

      // 1. Upload ảnh lên Cloudinary
      const proofUrl = await uploadPaymentProof(paymentProof);
      console.log("BookingInfo:", bookingInfo);
      console.log("Sending showtime_id:", bookingInfo?.showtimeId || showtimeId);


      // 2. Lấy bookingInfo từ localStorage và gán payment_proof_url
      let info = JSON.parse(localStorage.getItem("bookingInfo")) || {};
      info.payment_proof_url = proofUrl;
      localStorage.setItem("bookingInfo", JSON.stringify(info));

      // 3. Gửi booking
      const token = localStorage.getItem("auth-token");

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({
          showtime_id: bookingInfo?.showtimeId || showtimeId, // ✅ đổi key cho đúng BE
          seats: bookingInfo?.selectedSeats?.map(s => ({ seat_id: s.seat_id, type: s.type })) || [],
          combos: bookingInfo?.comboCounts || {},
          payment_proof_url: proofUrl,
          status: "pending",
          final_price: finalPrice,
          promotion_id: selectedPromotion?._id || null,
        }),
      });
      

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      await Swal.fire({
        icon: "success",
        title: "Payment successful",
        text: "Your booking is pending confirmation.",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      router.push(`/book/${info.showtimeId}/pending?bookingId=${data.bookingId}`);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Payment failed",
        text: err.message || "An error occurred during payment.",
      });
    }
  }



  const handlePaymentWithTimer = async () => {
    // reset đếm ngược 2 phút kể từ lúc bấm thanh toán
    timerStartRef.current = Date.now();
    hasHandledTimeout.current = false;
    await handlePayment();
  };

  const seatCount = useMemo(() => {
    if (!bookingInfo?.selectedSeats) return 0;
    const counted = new Set();
    let count = 0;
    for (const s of bookingInfo.selectedSeats) {
      if (s.type === "couple") {
        if (counted.has(s.seat_id)) continue;
        const pair = bookingInfo.selectedSeats.find(
          (other) => other.type === "couple" && other.seat_id !== s.seat_id && !counted.has(other.seat_id)
        );
        counted.add(s.seat_id);
        if (pair) counted.add(pair.seat_id);
        count++;
      } else {
        count++;
      }
    }
    return count;
  }, [bookingInfo?.selectedSeats]);

  const fmtMMSS = (ms) => {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
    const ss = (totalSec % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-800 to-slate-900 text-white text-lg animate-pulse">
        Loading your booking...
      </div>
    );


  if (!bookingInfo)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="bg-slate-800/60 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">No booking found</h2>
          <p className="opacity-80 mb-6">Please select your seats again to continue.</p>
          <button
            onClick={() => router.replace(`/book/${showtimeId || ""}`)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
          >
            Go to booking
          </button>
        </div>
      </div>
    );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0b1220] py-10 px-4 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          {/* Title */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
              Payment Information
            </h2>
            <p className="text-white/80 mt-2 text-sm md:text-base">Complete your booking within the time limit</p>
          </div>

          {/* Movie + Theater */}
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-gray-700">
                <Film className="w-5 h-5 text-indigo-600" /> Movie:
              </div>
              <div className="text-lg font-bold text-gray-900">{bookingInfo?.movie?.title || showtime?.movie_id?.title || "—"}</div>

              <div className="flex items-center gap-2 font-semibold text-gray-700">
                <Building className="w-5 h-5 text-indigo-600" /> Theater:
              </div>
              <div className="text-gray-800">{bookingInfo?.theater?.name || showtime?.theater_id?.name || "—"}</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-gray-700">
                <Clock className="w-5 h-5 text-indigo-600" /> Time:
              </div>
              <div className="text-gray-800">
                {showtime?.time
                  ? new Date(showtime.time).toLocaleString("vi-VN")
                  : "—"}
              </div>


              <div className="font-semibold text-gray-700">Type screen:</div>
              <div className="text-gray-800">{bookingInfo?.type || showtime?.type || "—"}</div>
              <div className="text-sm text-gray-500">{bookingInfo?.theater?.address || showtime?.theater_id?.address || ""}</div>
            </div>
          </motion.div>

          {/* Seats */}
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold text-gray-800 mb-3">Selected Seats</h3>
            <ul className="flex flex-wrap gap-2">
              {(bookingInfo?.selectedSeats || []).map((s) => (
                <li key={`${s.seat_id}-${s.type}`} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium shadow-sm">
                  {s.seat_id} ({s.type})
                </li>
              ))}
            </ul>
            <p className="mt-3 text-gray-700">
              Number of tickets: <span className="font-bold text-indigo-600">{seatCount}</span>
            </p>
          </motion.div>

          {/* Combos */}
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-600" /> Food Combos
            </h3>
            <ul className="space-y-3">
              {COMBOS.map((combo) => (
                <li
                  key={combo.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center bg-gray-50 p-3 rounded-xl gap-3"
                >
                  <span className="text-gray-700 font-medium">{combo.name}</span>

                  {/* Giá: căn phải để thẳng hàng */}
                  <span className="text-gray-500 text-sm text-right w-20">
                    {combo.price.toLocaleString()}đ
                  </span>

                  <input
                    type="number"
                    min={0}
                    value={bookingInfo?.comboCounts?.[combo.id] ?? 0}
                    onChange={(e) => handleComboChange(combo.id, e.target.value)}
                    className="w-20 px-2 py-1 text-center rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </li>
              ))}
            </ul>

          </motion.div>

          {/* Payment card */}
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-600">Total amount:</span>
              <span className="text-indigo-600 font-bold">{(bookingInfo?.total || 0).toLocaleString()}đ</span>
            </div>

            <Promotions showtimeId={showtimeId} onPromotionSelected={(promo) => setSelectedPromotion(promo)} />

            {selectedPromotion && (
              <div className="bg-green-100 p-3 rounded-xl text-green-700 text-sm">
                <strong>Promotion:</strong> {selectedPromotion.title}
              </div>
            )}

            <div className="flex justify-between text-xl font-bold">
              <span className="text-gray-800">Final Total:</span>
              <span className="text-pink-600">{finalPrice.toLocaleString()}đ</span>
            </div>

            <div className="text-gray-700 text-lg">
              <span className="font-semibold">Bank account:</span>{" "}
              <span className="text-indigo-700 font-bold">0123456789 - VietcomBank</span>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Upload Payment Proof</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                className="w-full text-sm border rounded-lg p-2 bg-gray-50"
              />
              {paymentProof && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={URL.createObjectURL(paymentProof)} alt="Payment proof" className="mt-3 max-h-40 rounded-lg border" />
              )}
            </div>

            <div className="text-center text-red-600 font-bold text-lg">⏳ Time left: {fmtMMSS(countdown)}</div>

            <button
              onClick={handlePaymentWithTimer}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-600 text-white font-bold shadow-lg hover:opacity-90 transition"
            >
              Pay Now
            </button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
