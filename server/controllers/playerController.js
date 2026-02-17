const Player = require('../models/Player');

// Get all players
exports.getAll = async (req, res) => {
    try {
        const players = await Player.find().populate('teamId');
        res.json(players);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single player
exports.getById = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id).populate('teamId');
        if (!player) return res.status(404).json({ message: 'Player not found' });
        res.json(player);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create player
exports.create = async (req, res) => {
    try {
        const player = new Player(req.body);
        const newPlayer = await player.save();
        res.status(201).json(newPlayer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update player
exports.update = async (req, res) => {
    try {
        const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!player) return res.status(404).json({ message: 'Player not found' });
        res.json(player);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete player
exports.remove = async (req, res) => {
    try {
        const player = await Player.findByIdAndDelete(req.params.id);
        if (!player) return res.status(404).json({ message: 'Player not found' });
        res.json({ message: 'Player deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
