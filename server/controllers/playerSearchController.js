const playerService = require('../services/playerService');

exports.searchPlayer = async (req, res, next) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: 'Name query parameter is required' });
        }
        const data = await playerService.searchPlayer(name);
        if (!data) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json(data);
    } catch (err) {
        next(err);
    }
};
