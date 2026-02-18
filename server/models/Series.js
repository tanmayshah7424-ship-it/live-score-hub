const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
    apiId: { type: String, unique: true, sparse: true } // ID from external API (CricAPI/TheSportsDB)
}, { timestamps: true });

// Text index for search
seriesSchema.index({ name: 'text' });

module.exports = mongoose.model('Series', seriesSchema);
