import { connectToDatabase } from '../lib/mongodb.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

async function createSuperAdmin() {
  try {
    await connectToDatabase();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@moviebooking.com' });
    if (existingAdmin) {
      // Cập nhật role thành super_admin nếu chưa phải
      if (existingAdmin.role !== 'super_admin') {
        existingAdmin.role = 'super_admin';
        await existingAdmin.save();
        console.log('🔄 Updated existing admin to super admin role');
      }
      console.log('ℹ️  Super admin already exists!');
      console.log('📧 Email: admin@moviebooking.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: Super Admin');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Create super admin user
      const adminUser = new User({
        username: 'admin',
        email: 'admin@moviebooking.com',
        password_hash: hashedPassword,
        role: 'super_admin', // Set as super admin
        favorite_genres: [],
        search_history: [],
        viewed_movies: []
      });

      await adminUser.save();
      
      console.log('✅ Super admin user created successfully!');
      console.log('📧 Email: admin@moviebooking.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: Super Admin');
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Login Information:');
    console.log('👑 Super Admin: admin@moviebooking.com / admin123');
    console.log('\n💡 Next steps:');
    console.log('1. Login as super admin');
    console.log('2. Create theaters with detailed addresses');
    console.log('3. Create theater admins for each theater chain');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createSuperAdmin(); 