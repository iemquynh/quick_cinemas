import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { connectToDatabase } from '../lib/mongodb.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Cấu hình dotenv để đọc file .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

// Log để debug
console.log('Current working directory:', process.cwd());
console.log('Looking for .env at:', envPath);

// Đọc file .env
const result = config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Log để debug
console.log('Environment variables:', process.env);
console.log('MONGODB_URL:', process.env.MONGODB_URL);

// Nếu MONGODB_URI không tồn tại, thử set trực tiếp
  if (!process.env.MONGODB_URL) {
  process.env.MONGODB_URL = 'mongodb://localhost:27017/quick_cinema';
  console.log('Set MONGODB_URL manually:', process.env.MONGODB_URL);
}

async function createAdminUser() {
  try {
    await connectToDatabase();

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ email: 'admin@moviebooking.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Tạo mật khẩu đã hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Tạo tài khoản admin
    const adminUser = new User({
      username: 'admin',
      email: 'admin@moviebooking.com',
      password_hash: hashedPassword,
      favorite_genres: [],
      role: true, // true cho admin
      created_at: new Date(),
      updated_at: new Date()
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

createAdminUser(); 