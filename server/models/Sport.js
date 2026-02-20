const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }, // e.g., "Basketball"
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true }, // e.g., "basketball"
}, { timestamps: true });

module.exports = mongoose.model('Sport', sportSchema);
