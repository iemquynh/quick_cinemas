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
    seats_layout: [{seat_id: String, booked: Boolean, user_id: String}],
}, {
    timestamps: true
})

export default mongoose.models.Showtime || mongoose.model('Showtime', showtimeSchema)