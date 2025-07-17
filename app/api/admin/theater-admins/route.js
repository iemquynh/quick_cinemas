import { connectToDatabase } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  await connectToDatabase();
  try {
    const theaterAdmins = await User.find({ role: 'theater_admin' });
    return new Response(JSON.stringify(theaterAdmins), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  await connectToDatabase();
  try {
    const data = await req.json();
    
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email đã tồn tại' }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Tạo theater admin mới
    const theaterAdmin = await User.create({
      username: data.username,
      email: data.email,
      password_hash: hashedPassword,
      role: 'theater_admin',
      theater_chain: data.theater_chain
    });

    return new Response(JSON.stringify(theaterAdmin), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 