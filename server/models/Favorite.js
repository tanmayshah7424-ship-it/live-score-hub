const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
}, { timestamps: true });

// Ensure a user can't favorite the same thing twice
favoriteSchema.index({ userId: 1, teamId: 1 }, { unique: true, partialFilterExpression: { teamId: { $exists: true } } });
favoriteSchema.index({ userId: 1, playerId: 1 }, { unique: true, partialFilterExpression: { playerId: { $exists: true } } });

module.exports = mongoose.model('Favorite', favoriteSchema);
