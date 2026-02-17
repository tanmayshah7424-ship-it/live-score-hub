const Favorite = require('../models/Favorite');

// Get all favorites for the user
exports.getAll = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const favorites = await Favorite.find({ userId })
            .populate('teamId')
            .populate('playerId');

        // Group by type for easier frontend consumption
        const teams = favorites.filter(f => f.teamId).map(f => f.teamId);
        const players = favorites.filter(f => f.playerId).map(f => f.playerId);

        res.json({ teams, players });
    } catch (error) {
        next(error);
    }
};

// Toggle team favorite
exports.toggleTeam = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { teamId } = req.params;

        const existing = await Favorite.findOne({ userId, teamId });

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            return res.json({ message: 'Team removed from favorites', favorited: false });
        } else {
            await Favorite.create({ userId, teamId });
            return res.json({ message: 'Team added to favorites', favorited: true });
        }
    } catch (error) {
        next(error);
    }
};

// Toggle player favorite
exports.togglePlayer = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { playerId } = req.params;

        const existing = await Favorite.findOne({ userId, playerId });

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            return res.json({ message: 'Player removed from favorites', favorited: false });
        } else {
            await Favorite.create({ userId, playerId });
            return res.json({ message: 'Player added to favorites', favorited: true });
        }
    } catch (error) {
        next(error);
    }
};
