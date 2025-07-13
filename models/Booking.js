import mongoose from 'mongoose'

const BookingSchema = new mongoose.Schema({
    user_id: String,
    showtime_id: String,
    seats: [String],
    total_price: Number,
    status: Boolean,
    created_at: Date,
}, {
    timestamps: true
})

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema)