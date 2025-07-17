import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    content: { type: String }, 
}, {
    timestamps: true
})

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema)