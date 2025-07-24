import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // người nhận (admin hoặc user)
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  type: { type: String, enum: ['booking_pending', 'booking_confirmed', 'booking_cancelled'], required: true },
  message: { type: String },
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema); 