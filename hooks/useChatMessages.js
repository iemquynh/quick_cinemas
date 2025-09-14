import { useState, useRef, useEffect } from "react";

export default function useChatMessages({ booking, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageEndRef = useRef(null);
  const pollingRef = useRef();
  const [toId, setToId] = useState(null);
  const [fromId, setFromId] = useState(user?._id || user?.id);

  // Auto scroll when new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages every second
  useEffect(() => {
    if (!booking?._id) return;
    async function fetchMessages() {
      const res = await fetch(`/api/bookings/${booking._id}/messages`);
      const data = await res.json();
      setMessages(data);
    }

    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 1000);
    return () => clearInterval(pollingRef.current);
  }, [booking?._id]);

  // Determine toId based on role + booking data
  useEffect(() => {
    const determineToId = async () => {
      if (!booking || !user) return;

      const senderId = user._id || user.id;
      setFromId(senderId);

      if (user.role === "theater_admin") {
        const userId =
          typeof booking.user_id === "object"
            ? booking.user_id?._id
            : booking.user_id;

        if (userId) {
          setToId(userId);
        } else {
          // console.warn("Không tìm thấy user_id trong booking.");
        }
      } else {
        // User → find admin via theater_chain
        const theaterChain = booking?.showtime_id?.theater_chain;
        if (!theaterChain) {
          // console.warn("Không có theater_chain trong booking.");
          return;
        }

        try {
          const res = await fetch("/api/users");
          const allUsers = await res.json();
          const admin = allUsers.find(
            (u) => u.role === "theater_admin" && u.theater_chain === theaterChain
          );
          if (admin?._id) {
            setToId(admin._id);
          } else {
            // console.warn("Không tìm thấy admin phù hợp với theater_chain.");
          }
        } catch (err) {
          // console.error("Lỗi khi lấy danh sách admin:", err);
        }
      }
    };

    determineToId();
  }, [booking, user]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!fromId || !toId) {
      alert("Không xác định được người gửi hoặc người nhận!");
      // console.error("fromId:", fromId, "toId:", toId);
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${booking._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromId, to: toId, content: input }),
      });
      const result = await res.json();
      // console.log("[Chat] Gửi thành công:", result);
      setInput("");
    } catch (err) {
      // console.error("[Chat] Gửi tin nhắn thất bại:", err);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return {
    messages,
    input,
    setInput,
    showEmojiPicker,
    setShowEmojiPicker,
    messageEndRef,
    handleSend,
    handleEmojiClick,
  };
}
