// import { useState, useRef, useEffect } from "react";

// export default function useChatMessages({ booking, user }) {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const messageEndRef = useRef(null);
//   const pollingRef = useRef();

//   // Polling lấy tin nhắn từ backend
//   useEffect(() => {
//     async function fetchMessages() {
//       if (!booking?._id) return;
//       const res = await fetch(`/api/bookings/${booking._id}/messages`);
//       const data = await res.json();
//       setMessages(data);
//       console.log("[Chat] Fetched messages:", data);
//     }
//     fetchMessages();
//     pollingRef.current = setInterval(fetchMessages, 1000);
//     return () => clearInterval(pollingRef.current);
//   }, [booking?._id]);

//   // Auto scroll
//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     console.log("[Chat] Messages updated, auto scroll. Messages:", messages);
//   }, [messages]);

//   // Gửi tin nhắn
//   const handleSend = async () => {
//     console.log("[Chat] handleSend called, input:", input);
//     console.log("User in useChatMessages:", user);
//     if (!input.trim()) return;
//     let toId = null;
//     let fromId = user?._id || user?.id; // Sửa ở đây
//     // Nếu là admin thì gửi cho user, nếu là user thì gửi cho admin
//     if (user.role === "theater_admin") {
//       toId = typeof booking.user_id === "object" ? booking.user_id._id : booking.user_id;
//     } else {
//       toId = booking.theaterAdminId;
//     }
//     console.log("Gửi tin nhắn:", { fromId, toId, content: input });
//     console.log("booking:", booking.theaterAdminId)
//     if (!fromId || !toId) {
//       alert("Không xác định được người gửi hoặc người nhận!");
//       return;
//     }
//     try {
//       const res = await fetch(`/api/bookings/${booking._id}/messages`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           from: fromId,
//           to: toId,
//           content: input,
//         }),
//       });
//       const result = await res.json();
//       console.log("[Chat] Sent message result:", result);
//       setInput("");
//     } catch (err) {
//       console.error("[Chat] Error sending message:", err);
//     }
//   };

//   const handleEmojiClick = (emojiData) => {
//     setInput((prev) => {
//       const next = prev + emojiData.emoji;
//       console.log("[Chat] Emoji added, input:", next);
//       return next;
//     });
//   };

//   // Log input mỗi lần thay đổi
//   useEffect(() => {
//     console.log("[Chat] Input changed:", input);
//   }, [input]);

//   return {
//     messages,
//     input,
//     setInput,
//     showEmojiPicker,
//     setShowEmojiPicker,
//     messageEndRef,
//     handleSend,
//     handleEmojiClick,
//   };
// } 

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
          console.warn("Không tìm thấy user_id trong booking.");
        }
      } else {
        // User → find admin via theater_chain
        const theaterChain = booking?.showtime_id?.theater_chain;
        if (!theaterChain) {
          console.warn("Không có theater_chain trong booking.");
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
            console.warn("Không tìm thấy admin phù hợp với theater_chain.");
          }
        } catch (err) {
          console.error("Lỗi khi lấy danh sách admin:", err);
        }
      }
    };

    determineToId();
  }, [booking, user]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!fromId || !toId) {
      alert("Không xác định được người gửi hoặc người nhận!");
      console.error("fromId:", fromId, "toId:", toId);
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${booking._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromId, to: toId, content: input }),
      });
      const result = await res.json();
      console.log("[Chat] Gửi thành công:", result);
      setInput("");
    } catch (err) {
      console.error("[Chat] Gửi tin nhắn thất bại:", err);
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
