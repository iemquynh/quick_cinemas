import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb.js';
import User from '../../../../models/User.js';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, newPassword, confirm } = await req.json();

    if (!email || !newPassword || !confirm) {
      return NextResponse.json(
        { success: false, message: 'Email, new password and confirm password are required' },
        { status: 400 }
      );
    }

    // Check confirm password
    if (newPassword !== confirm) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user
    user.password_hash = hashedPassword;
    user.updated_at = new Date();
    await user.save();

    return NextResponse.json(
      { success: true, message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
