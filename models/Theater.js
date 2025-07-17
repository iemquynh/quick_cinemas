import mongoose from 'mongoose'

const TheaterSchema = new mongoose.Schema({
    name: String,
    address: String,
    rooms: Number,
    screenTypes: [String],
    theater_chain: {
        type: String,
        enum: ['CGV', 'Lotte Cinema', 'Galaxy Cinema', 'BHD Star Cineplex', 'Beta Cinemas'],
        required: true
    }
}, {
    timestamps: true
})

// Middleware để tự động set theater_chain dựa trên tên rạp
TheaterSchema.pre('save', function(next) {
    const name = this.name.toLowerCase();
    
    if (name.includes('cgv')) {
        this.theater_chain = 'CGV';
    } else if (name.includes('lotte')) {
        this.theater_chain = 'Lotte Cinema';
    } else if (name.includes('galaxy')) {
        this.theater_chain = 'Galaxy Cinema';
    } else if (name.includes('bhd')) {
        this.theater_chain = 'BHD Star Cineplex';
    } else if (name.includes('beta')) {
        this.theater_chain = 'Beta Cinemas';
    }
    
    next();
});

export default mongoose.models.Theater || mongoose.model('Theater', TheaterSchema)