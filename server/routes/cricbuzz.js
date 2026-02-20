const express = require('express');
const router = express.Router();
const cricbuzzController = require('../controllers/cricbuzzController');

// Matches
router.get('/matches/live', cricbuzzController.getLiveMatches);
router.get('/matches/upcoming', cricbuzzController.getUpcomingMatches);
router.get('/matches/recent', cricbuzzController.getRecentMatches);

// Match Center
router.get('/match/:id', cricbuzzController.getMatchCenter);
router.get('/match/:id/scard', cricbuzzController.getScard);
router.get('/match/:id/hscard', cricbuzzController.getHscard);
router.get('/match/:id/team/:teamId', cricbuzzController.getTeamForMatch);

// Misc
router.get('/teams/international', cricbuzzController.getInternationalTeams);
router.get('/teams/:teamId/stats', cricbuzzController.getTeamStats);

module.exports = router;
