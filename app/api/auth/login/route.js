import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb.js';
import User from '../../../../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    const token = jwt.sign({
      userId: user._id,
      email: user.email,
      role: user.role,
      theater_chain: user.theater_chain || null,
    }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    // Trả về cả _id và id để tương thích
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        id: user._id, // fallback cho client cũ
        username: user.username,
        email: user.email,
        role: user.role,
        favorite_genres: user.favorite_genres
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 