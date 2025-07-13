import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    // Lấy token từ header Authorization
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    console.log('check-auth - Token:', token);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    await connectToDatabase();
    
    // Tìm user theo ID từ token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        favorite_genres: user.favorite_genres
      }
    });
    
  } catch (error) {
    console.error('Error checking auth status:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 