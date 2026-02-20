const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    espnId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    is_indoor: { type: Boolean, default: false },
    capacity: { type: Number },
}, { timestamps: true });

venueSchema.virtual('location').get(function () {
    if (this.city && this.state) {
        return `${this.city}, ${this.state}`;
    }
    return this.city || '';
});

// String representation helper for tests/display
venueSchema.methods.toString = function () {
    if (this.city && this.state) {
        return `${this.name} (${this.city}, ${this.state})`;
    }
    return this.name;
};

module.exports = mongoose.model('Venue', venueSchema);
