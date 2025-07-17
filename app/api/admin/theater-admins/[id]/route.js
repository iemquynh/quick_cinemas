import { connectToDatabase } from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import bcrypt from 'bcryptjs';

export async function PUT(req, { params }) {
  await connectToDatabase();
  try {
    const data = await req.json();
    
    // Kiểm tra email đã tồn tại chưa (trừ user hiện tại)
    if (data.email) {
      const existingUser = await User.findOne({ 
        email: data.email, 
        _id: { $ne: params.id } 
      });
      if (existingUser) {
        return new Response(JSON.stringify({ error: 'Email đã tồn tại' }), { status: 400 });
      }
    }

    const updateData = {
      username: data.username,
      email: data.email,
      theater_chain: data.theater_chain
    };

    // Chỉ hash password nếu có password mới
    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
    }

    const theaterAdmin = await User.findByIdAndUpdate(
      params.id, 
      updateData, 
      { new: true }
    );

    if (!theaterAdmin) {
      return new Response(JSON.stringify({ error: 'Không tìm thấy admin' }), { status: 404 });
    }

    return new Response(JSON.stringify(theaterAdmin), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectToDatabase();
  try {
    const theaterAdmin = await User.findByIdAndDelete(params.id);
    
    if (!theaterAdmin) {
      return new Response(JSON.stringify({ error: 'Không tìm thấy admin' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 