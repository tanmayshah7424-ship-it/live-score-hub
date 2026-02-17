const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: { type: String, enum: ['score', 'match', 'system', 'broadcast'], default: 'system' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For user-specific notifications
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' }, // For match notifications
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track users who read it
    broadcast: { type: Boolean, default: false }, // System-wide notifications
}, { timestamps: true });

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ broadcast: 1, createdAt: -1 });
notificationSchema.index({ readBy: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
