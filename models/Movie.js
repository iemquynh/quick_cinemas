import mongoose from 'mongoose'

const MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    directors: {
        type: String,
        required: true,
        trim: true
    },
    cast: {
        type: String,
        required: true,
        trim: true
    },
    synopsis: {
        type: String,
        required: true,
        trim: true
    },
    runtime: {
        type: String,
        required: true,
        trim: true
    },
    releaseDate: {
        type: String,
        required: true,
        trim: true
    },
    genre: {
        type: String,
        required: true,
        trim: true
    },
    tags: {
        type: String,
        default: '',
        trim: true
    },
    poster: {
        type: String,
        default: '',
        trim: true
    },
    background: {
        type: String,
        default: '',
        trim: true
    },
    trailerUrl: {
        type: String,
        default: '',
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    rating_average: {
        type: Number,
        default: 0
    },
    rating_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

export default mongoose.models.Movie || mongoose.model('Movie', MovieSchema)