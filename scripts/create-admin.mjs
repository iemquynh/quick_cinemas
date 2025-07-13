import { connectToDatabase } from '../lib/mongodb.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    await connectToDatabase();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password_hash: hashedPassword,
      role: true, // Set as admin
      favorite_genres: [],
      search_history: [],
      viewed_movies: []
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: Admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser(); 