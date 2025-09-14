import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    const { oldPassword, newPassword } = await request.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Missing password fields' }, { status: 400 });
    }
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 401 });
    }
    // Hash mật khẩu mới
    const newHash = await bcrypt.hash(newPassword, 10);
    user.password_hash = newHash;
    await user.save();
    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    // console.error('Change password error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
} 