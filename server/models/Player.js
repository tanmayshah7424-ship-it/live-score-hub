const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    role: { type: String, required: true },
    sport: { type: String, enum: ['cricket', 'football', 'basketball', 'tennis'], required: true },

    // New fields for detailed profile
    cricApiId: { type: String, unique: true, sparse: true },
    playerImg: { type: String },
    dateOfBirth: { type: Date },
    country: { type: String },
    battingStyle: { type: String },
    bowlingStyle: { type: String },
    isForeign: { type: Boolean, default: false },
    biography: { type: String }, // Player biography
    stats: { type: Array, default: [] }, // Detailed career stats
}, { timestamps: true });

// Text index for search
playerSchema.index({ name: 'text' });

module.exports = mongoose.model('Player', playerSchema);
