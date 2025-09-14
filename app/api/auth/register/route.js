import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return new Response(JSON.stringify({ error: 'Email, username và password là bắt buộc' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await connectToDatabase();

    // Kiểm tra trùng email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email đã được sử dụng' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      email,
      username,
      password_hash,
      role: True,
      favorite_genres: []
    });
    await newUser.save();

    // Trả về thông tin user (không nhạy cảm)
    return new Response(JSON.stringify({
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: True,
      favorite_genres: newUser.favorite_genres
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // console.error('Register error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 