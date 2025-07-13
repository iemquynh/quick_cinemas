import mongoose from 'mongoose'

const TheaterSchema = new mongoose.Schema({
    name: String,
    address: String,
    rooms: Number,
    screenTypes: [String],
}, {
    timestamps: true
})

export default mongoose.models.Theater || mongoose.model('Theater', TheaterSchema)