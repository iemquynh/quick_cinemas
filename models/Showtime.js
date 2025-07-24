import mongoose from 'mongoose'

const showtimeSchema = new mongoose.Schema({
    movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    theater_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    theater_chain: { 
        type: String, 
        enum: ['CGV', 'Lotte Cinema', 'Galaxy Cinema', 'BHD Star Cineplex', 'Beta Cinemas'],
        required: true
    },
    room: String,
    time: Date,
    type: String,
    seats_layout: [{
      seat_id: { type: String, required: true },
      type: { type: String, required: true },
      status: { type: String, required: true },
      pending_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      pending_time: { type: Date, default: null },
      booked_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    }],
}, {
    timestamps: true
})

export default mongoose.models.Showtime || mongoose.model('Showtime', showtimeSchema)