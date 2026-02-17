const mongoose = require('mongoose');

const featuredMatchSchema = new mongoose.Schema({
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeaturedMatch', featuredMatchSchema);
