import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find();
    return NextResponse.json(users);
  } catch (error) {
    // console.error('Get users error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Kiểm tra request có phải JSON không
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { message: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const userData = await request.json();

    // Validate required fields
    if (!userData.username || !userData.email || !userData.password_hash) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Return user data without sensitive information
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      favorite_genres: user.favorite_genres,
      role: user.role,
      created_at: user.created_at
    };

    return NextResponse.json(userResponse, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    // console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Failed to create user', error: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 