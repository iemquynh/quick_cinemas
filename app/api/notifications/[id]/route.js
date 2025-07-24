import { NextResponse } from 'next/server';
import Notification from '@/models/Notification';
import { connectToDatabase } from '@/lib/mongodb';

export async function PATCH(req, { params }) {
  await connectToDatabase();
  const { id } = params;
  const { read } = await req.json();
  const updated = await Notification.findByIdAndUpdate(id, { read }, { new: true });
  if (!updated) return NextResponse.json({ success: false }, { status: 404 });
  return NextResponse.json({ success: true, notification: updated });
} 