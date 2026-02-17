const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    sport: { type: String, enum: ['cricket', 'football', 'basketball', 'tennis'], required: true },
    tournament: { type: String, required: true },
    status: { type: String, enum: ['live', 'upcoming', 'completed'], default: 'upcoming' },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    scoreA: { type: String, default: '-' },
    scoreB: { type: String, default: '-' },
    summary: { type: String, default: '' },
    overs: { type: String },
    minute: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
