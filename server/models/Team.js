const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    logo: { type: String, default: '🏆' },
    sport: { type: String, enum: ['cricket', 'football', 'basketball', 'tennis'], required: true },
    players: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },

    // New fields for detailed profile
    cricApiId: { type: String, unique: true, sparse: true },
    captain: { type: String },
    coach: { type: String },
    ranking: { type: Number },
    homeGround: { type: String },
    foundedYear: { type: Number },

    // Fields for ESPN Ingestion
    abbreviation: { type: String },
    displayName: { type: String },
    location: { type: String },
    color: { type: String },
    alternateColor: { type: String },
    isActive: { type: Boolean, default: true },
    logos: { type: [Object], default: [] } // For logos array from ingestion
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

teamSchema.virtual('primary_logo').get(function () {
    if (this.logos && this.logos.length > 0) {
        return this.logos[0].href;
    }
    return null;
});

teamSchema.methods.toString = function () {
    // Requires population or knowing league name. 
    // Python test: "Test Team (NBA)". 
    // We might not have league loaded. 
    return this.displayName || this.name;
};

// Text index for search
teamSchema.index({ name: 'text', shortName: 'text' });

module.exports = mongoose.model('Team', teamSchema);
