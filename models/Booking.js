import mongoose from 'mongoose'

const BookingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showtime_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    seats: [
      {
        seat_id: { type: String },
        type: { type: String }
      }
    ],
    combos: { type: Object },
    payment_proof_url: { type: String },
    status: { type: String, enum: ['pending', 'using', 'cancel', 'expired'], default: 'pending' },
}, {
    timestamps: true
})

if (mongoose.models.BookingV2) {
  delete mongoose.models.BookingV2;
}
export default mongoose.model('BookingV2', BookingSchema)