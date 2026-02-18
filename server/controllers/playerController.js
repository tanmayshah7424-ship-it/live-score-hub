const Player = require('../models/Player');

const cricApiService = require('../services/rapidCricketService');

// Get all players
exports.getAll = async (req, res) => {
    try {
        const players = await Player.find().populate('teamId');
        res.json(players);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const sportsDbService = require('../services/sportsDbService');

// Get single player with CricAPI fallback and SportsDB enrichment
exports.getById = async (req, res) => {
    try {
        let player = await Player.findById(req.params.id).populate('teamId');
        if (!player) return res.status(404).json({ message: 'Player not found' });

        // Enrichment Check
        const needsUpdate = !player.biography || !player.stats || player.stats.length === 0;

        if (needsUpdate) {
            // 1. Try CricAPI if we have an ID
            if (player.cricApiId) {
                try {
                    const cricData = await cricApiService.getPlayerInfo(player.cricApiId);
                    if (cricData.status === 'success' && cricData.data) {
                        const info = cricData.data;
                        player.playerImg = info.playerImg || player.playerImg;
                        player.dateOfBirth = info.dateOfBirth || player.dateOfBirth;
                        player.country = info.country || player.country;
                        player.battingStyle = info.battingStyle || player.battingStyle;
                        player.bowlingStyle = info.bowlingStyle || player.bowlingStyle;
                        player.biography = info.bio || info.biography || player.biography;
                        player.stats = info.stats || [];
                    }
                } catch (e) { console.error('CricAPI Error:', e.message); }
            }

            // 2. Try SportsDB for Biography if still missing
            if (!player.biography) {
                try {
                    const sportsData = await sportsDbService.getPlayerBio(player.name);
                    if (sportsData) {
                        player.biography = sportsData.bio;
                        if (!player.playerImg) player.playerImg = sportsData.thumb;
                        if (!player.country) player.country = sportsData.country;
                        if (!player.dateOfBirth) player.dateOfBirth = sportsData.dob;
                    }
                } catch (e) { console.error('SportsDB Error:', e.message); }
            }

            await player.save();
        }

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
