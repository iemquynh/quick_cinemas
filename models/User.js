import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password_hash: String,
    favorite_genres: [String],
    search_history: [String],
    role: { type: String, enum: ['user', 'theater_admin', 'super_admin'], default: 'user' },
    theater_chain: { 
        type: String, 
        enum: ['CGV', 'Lotte Cinema', 'Galaxy Cinema', 'BHD Star Cineplex', 'Beta Cinemas'],
        required: function() { return this.role === 'theater_admin'; }
    },
    viewed_movies: [String], // movie id
    created_at: Date,
    updated_at: Date,
}, {
    timestamps: true
})

export default mongoose.models.User || mongoose.model('User', UserSchema)