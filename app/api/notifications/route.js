import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Notification from '@/models/Notification';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req) {
  await connectToDatabase();
  try {
    // Lấy user_id từ query (hoặc từ token/session thực tế)
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id') || '000000000000000000000000'; // giả lập
    const notifications = await Notification.find({ user_id }).sort({ created_at: -1 }).limit(50);
    return NextResponse.json(notifications, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 