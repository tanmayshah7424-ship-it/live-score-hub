const Commentary = require('../models/Commentary');
const { getIO } = require('../socket');

exports.getByMatch = async (req, res, next) => {
    try {
        const commentary = await Commentary.find({ matchId: req.params.matchId }).sort({ createdAt: -1 });
        res.json(commentary);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const event = await Commentary.create(req.body);

        // Emit ONLY to the match room – NOT globally (global + room = duplicate for room members)
        const io = getIO();
        if (io) {
            io.to(`match:${event.matchId}`).emit('commentary:new', event);
        }

        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
};
