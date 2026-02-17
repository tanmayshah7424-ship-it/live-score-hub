const mongoose = require('mongoose');

const commentarySchema = new mongoose.Schema({
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    timestamp: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['run', 'wicket', 'goal', 'foul', 'point', 'boundary', 'six', 'general'], default: 'general' },
    value: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Commentary', commentarySchema);
