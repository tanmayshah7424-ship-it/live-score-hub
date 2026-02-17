const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    logo: { type: String, default: '🏆' },
    sport: { type: String, enum: ['cricket', 'football', 'basketball', 'tennis'], required: true },
    players: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
