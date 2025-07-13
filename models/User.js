import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password_hash: String,
    favorite_genres: [String],
    search_history: [String],
    role: { type: Boolean, default: false },
    viewed_movies: [String], // movie id
    created_at: Date,
    updated_at: Date,
}, {
    timestamps: true
})

export default mongoose.models.User || mongoose.model('User', UserSchema)