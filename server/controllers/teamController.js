const Team = require('../models/Team');
const Player = require('../models/Player');

exports.getAll = async (req, res, next) => {
    try {
        const teams = await Team.find().sort({ name: 1 });
        res.json(teams);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        const players = await Player.find({ teamId: team._id });
        res.json({ ...team.toObject(), playersList: players });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const team = await Team.create(req.body);
        res.status(201).json(team);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json(team);
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json({ message: 'Team deleted' });
    } catch (error) {
        next(error);
    }
};
