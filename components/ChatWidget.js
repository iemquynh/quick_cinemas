"use client";

import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { X } from "lucide-react";
import useChatMessages from "../hooks/useChatMessages";
import Link from "next/link";


export default function ChatWidget({ booking, user, onClose }) {
    console.log("User prop in ChatWidget:", user);
  const {
    messages,
    input,
    setInput,
    showEmojiPicker,
    setShowEmojiPicker,
    messageEndRef,
    handleSend,
    handleEmojiClick
  } = useChatMessages({ booking, user });

  // Lấy tên hiển thị
  const getDisplayName = () => {
    if (user.role === "theater_admin") {
      // Admin đang xem
      return (
        booking.user_id?.username ||
        booking.user_id?.name ||
        booking.user_id?.email ||
        "Khách"
      );
    }
    // User đang xem
    return (
      (booking.showtime_id?.theater_chain
        ? `Admin ${booking.showtime_id.theater_chain}`
        : "Admin rạp")
    );
  };

  return (
    <div
      className="fixed bottom-4 right-4 w-80 bg-blue-50 rounded-lg shadow-lg flex flex-col"
      style={{ minHeight: 300, maxHeight: 600, height: 400, zIndex: 2147483647, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
    >
      {/* Header */}
      <div className="bg-blue-500 text-white p-2 rounded-t-lg flex items-center justify-between">
        <div className="font-semibold ml-3">{getDisplayName()}</div>
        <button
          className="hover:text-gray-600 transition duration-150 ease-in-out"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-2 z-10">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            height={300}
            width={280}
          />
        </div>
      )}

      {/* Booking Info */}
      <div className="w-full flex justify-center mb-2">
        <div className="bg-white border rounded-lg p-3 shadow-sm w-64 text-sm text-gray-800">
          <div className="flex space-x-3">
            <img
              src={
                booking.showtime_id?.movie_id?.poster
              }
              alt="poster"
              className="w-16 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <div className="font-semibold line-clamp-2">
                {booking.showtime_id?.movie_id?.title || "Tên phim"}
              </div>
              <div className="text-gray-400 text-xs">
                {(booking.showtime_id?.theater_id?.name || "Tên rạp") +
                  (booking.seats?.length
                    ? " - " + booking.seats.map(s => s.seat_id).join(", ")
                    : "")}
              </div>
              <div className="text-red-500 font-bold text-sm">
                {booking.total
                  ? booking.total.toLocaleString("vi-VN") + " ₫"
                  : "Tổng tiền"}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-blue-500 text-sm font-medium">
            <Link href={`/my-tickets?bookingId=${booking._id}`} className="hover:underline">Chi tiết vé</Link>
            {(() => {
              const movieId = typeof booking.showtime_id?.movie_id === 'object'
                ? booking.showtime_id.movie_id._id
                : booking.showtime_id?.movie_id;
              return (
                <Link href={`/movies/${movieId}`} className="hover:underline">Chi tiết phim</Link>
              );
            })()}
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="overflow-y-auto p-3 space-y-2 flex-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{maxHeight: 320}}>
        {messages.map((msg) => {
          const isSender = (msg.from === user._id || msg.from === user.id);
          return (
            <div key={msg._id}>
              <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-4 py-2 rounded-xl text-sm max-w-[70%] shadow-md ${
                    isSender
                      ? 'bg-[#23272f] text-white'
                      : 'bg-[#e5e7eb] text-gray-900'
                  }`}
                  style={{ wordBreak: 'break-word' }}
                >
                  {msg.content}
                </div>
              </div>
              <div className={`text-xs mt-1 ${isSender ? 'text-right text-gray-400 pr-2' : 'text-left text-gray-500 pl-2'}`}>
                {msg.createdAt ? new Date(msg.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>
      {/* Input */}
      <div className="border-t p-2 flex items-center space-x-2 relative">
        <button
          className="text-gray-500"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          😊
        </button>
        <input
          type="text"
          placeholder="Aa"
          className="flex-1 border rounded-full px-3 py-1 text-sm focus:outline-none bg-gray-200 text-gray-700"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="text-blue-500 font-semibold text-sm"
          onClick={handleSend}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}