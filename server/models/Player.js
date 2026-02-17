const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    role: { type: String, required: true },
    sport: { type: String, enum: ['cricket', 'football', 'basketball', 'tennis'], required: true },
    stats: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
