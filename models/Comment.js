import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
    user_id: String,
    movie_id: String,
    rating: Number,
    comment: String,
    created_at: Date,
}, {
    timestamps: true
})

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema)