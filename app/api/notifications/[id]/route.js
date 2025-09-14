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

// DELETE /api/notifications/[id] — xóa thông báo
export async function DELETE(req, { params }) {
  await connectToDatabase();
  const { id } = params;

  try {
    // console.log('🛠️ Xoá notification với ID:', id);
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) {
      // console.warn('⚠️ Không tìm thấy notification để xoá:', id);
      return NextResponse.json({ success: false }, { status: 404 });
    }
    // console.log('✅ Đã xoá notification:', id);
    return NextResponse.json({ success: true });
  } catch (err) {
    // console.error('❌ Lỗi server:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
