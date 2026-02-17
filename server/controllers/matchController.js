const Match = require('../models/Match');
const Team = require('../models/Team');
const { getIO } = require('../socket');

const populateTeams = (query) => query.populate('teamA', 'name shortName logo sport').populate('teamB', 'name shortName logo sport');

exports.getAll = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.sport) filter.sport = req.query.sport;
        const matches = await populateTeams(Match.find(filter)).sort({ date: -1 });
        res.json(matches);
    } catch (error) {
        next(error);
    }
};

exports.getLive = async (req, res, next) => {
    try {
        const matches = await populateTeams(Match.find({ status: 'live' })).sort({ date: -1 });
        res.json(matches);
    } catch (error) {
        next(error);
    }
};

exports.getUpcoming = async (req, res, next) => {
    try {
        const matches = await populateTeams(Match.find({ status: 'upcoming' })).sort({ date: 1 });
        res.json(matches);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const match = await populateTeams(Match.findById(req.params.id));
        if (!match) return res.status(404).json({ message: 'Match not found' });
        res.json(match);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const match = await Match.create(req.body);
        const populated = await populateTeams(Match.findById(match._id));
        res.status(201).json(populated);
    } catch (error) {
        next(error);
    }
};

exports.updateScore = async (req, res, next) => {
    try {
        const { scoreA, scoreB, summary, overs, minute } = req.body;
        const update = {};
        if (scoreA !== undefined) update.scoreA = scoreA;
        if (scoreB !== undefined) update.scoreB = scoreB;
        if (summary !== undefined) update.summary = summary;
        if (overs !== undefined) update.overs = overs;
        if (minute !== undefined) update.minute = minute;

        const match = await populateTeams(
            Match.findByIdAndUpdate(req.params.id, update, { new: true })
        );
        if (!match) return res.status(404).json({ message: 'Match not found' });

        getIO().emit('score:update', match);
        getIO().to(`match:${match._id}`).emit('score:update', match);

        res.json(match);
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const match = await populateTeams(
            Match.findByIdAndUpdate(req.params.id, { status }, { new: true })
        );
        if (!match) return res.status(404).json({ message: 'Match not found' });

        // Update team stats when match is completed
        if (status === 'completed') {
            await Team.findByIdAndUpdate(match.teamA._id, { $inc: { matchesPlayed: 1 } });
            await Team.findByIdAndUpdate(match.teamB._id, { $inc: { matchesPlayed: 1 } });
        }

        getIO().emit('match:status', match);
        getIO().to(`match:${match._id}`).emit('match:status', match);

        res.json(match);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const match = await populateTeams(
            Match.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        );
        if (!match) return res.status(404).json({ message: 'Match not found' });
        res.json(match);
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const match = await Match.findByIdAndDelete(req.params.id);
        if (!match) return res.status(404).json({ message: 'Match not found' });
        res.json({ message: 'Match deleted' });
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const [total, live, upcoming, completed] = await Promise.all([
            Match.countDocuments(),
            Match.countDocuments({ status: 'live' }),
            Match.countDocuments({ status: 'upcoming' }),
            Match.countDocuments({ status: 'completed' }),
        ]);
        const teamCount = await Team.countDocuments();
        res.json({ total, live, upcoming, completed, teamCount });
    } catch (error) {
        next(error);
    }
};

exports.getFinished = async (req, res, next) => {
    try {
        const matches = await populateTeams(Match.find({ 
            status: { $in: ['finished', 'completed'] } 
        })).sort({ date: -1 });
        res.json(matches);
    } catch (error) {
        next(error);
    }
};
