const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    logo: { type: String, default: '🏆' },
    sport: { type: String, enum: ['cricket', 'football', 'basketball', 'tennis'], required: true },
    players: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },

    // New fields for detailed profile
    cricApiId: { type: String, unique: true, sparse: true },
    captain: { type: String },
    coach: { type: String },
    ranking: { type: Number },
    homeGround: { type: String },
    foundedYear: { type: Number },
}, { timestamps: true });

// Text index for search
teamSchema.index({ name: 'text', shortName: 'text' });

module.exports = mongoose.model('Team', teamSchema);
