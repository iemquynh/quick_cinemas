import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Message from '@/models/Message';
import Notification from '@/models/Notification';

export async function GET(req, { params }) {
  await connectToDatabase();
  const { id } = params;
  const messages = await Message.find({ bookingId: id }).sort({ createdAt: 1 });
  return NextResponse.json(messages);
}

export async function POST(req, { params }) {
  await connectToDatabase();
  const { id } = params;
  const { from, to, content } = await req.json();
  // console.log("POST /api/bookings/[id]/messages", { id, from, to, content });
  if (!id || !from || !to || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  try {
    const message = await Message.create({ bookingId: id, from, to, content });
    // Tạo notification cho người nhận
    await Notification.create({
      user_id: to,
      booking_id: id,
      type: 'new_message',
      message: `Bạn có tin nhắn mới ở vé ${id} từ ${from}`,
      read: false
    });
    return NextResponse.json(message);
  } catch (err) {
    // console.error("Error creating message:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 