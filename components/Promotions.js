import React, { useEffect, useState } from "react";

export default function Promotions({ showtimeId, onPromotionSelected }) {
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  // Lấy danh sách khuyến mãi hợp lệ từ API (lọc theo payment + theater_chain)
  useEffect(() => {
    console.log("useEffect chạy với showtimeId:", showtimeId);
    if (!showtimeId) return;

    const fetchPromotions = async () => {
      try {
        const res = await fetch(`/api/promotions?page=payment&showtimeId=${showtimeId}`);

        const data = await res.json();
        console.log("Fetch response data:", data);  // <-- log data ở client
        setPromotions(data);
      } catch (err) {
        console.error("Lỗi khi load promotions:", err);
      }
    };

    fetchPromotions();
  }, [showtimeId]);

  // Áp dụng khuyến mãi
  const applyPromotion = () => {
    onPromotionSelected(selectedPromotion);
    setShowPromoPopup(false);
  };

  return (
    <div>
      {/* Nút mở popup chọn khuyến mãi */}
      <div className="pt-3 pb-3">
      <button
        onClick={() => setShowPromoPopup(true)}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
      >
        Select Promotion
      </button>
      </div>

      {/* Popup chọn khuyến mãi */}
      {showPromoPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Select Promotion</h3>
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
              {promotions.length > 0 ? (
                promotions.map((promo) => (
                  <label
                    key={promo._id}
                    className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:border-orange-500 ${
                      selectedPromotion?._id === promo._id ? "border-orange-500" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="promotion"
                      checked={selectedPromotion?._id === promo._id}
                      onChange={() => setSelectedPromotion(promo)}
                      className="w-5 h-5 text-orange-500"
                    />
                    <div className="flex-1">
                      <div className="text-orange-500 font-bold">{promo.title}</div>
                      <div className="text-sm text-gray-600">{promo.description}</div>
                      <div className="text-sm text-gray-500">
                        End Date: {new Date(promo.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-gray-500 text-center">Không có khuyến mãi khả dụng</div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowPromoPopup(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={applyPromotion}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                disabled={!selectedPromotion}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
