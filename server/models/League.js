const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }, // e.g., "NBA"
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true }, // e.g., "nba"
    abbreviation: { type: String, required: true, trim: true }, // e.g., "NBA"
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true }
}, { timestamps: true });

module.exports = mongoose.model('League', leagueSchema);
