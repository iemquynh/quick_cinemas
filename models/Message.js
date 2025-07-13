import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
    from_user_id: String,
    to_user_id: String,
    message: String,
    timestamp: Date,
}, {
    timestamps: true
})

export default mongoose.models.Message || mongoose.model('Message', MessageSchema)