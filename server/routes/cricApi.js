const express = require('express');
const router = express.Router();
const cricApiController = require('../controllers/cricApiController');

// Countries
router.get('/countries', cricApiController.getCountries);

// Series
router.get('/series', cricApiController.getSeries);
router.get('/series_info', cricApiController.getSeriesInfo);
router.get('/series_squad', cricApiController.getSeriesSquad);

// Matches
router.get('/matches', cricApiController.getMatches);
router.get('/currentMatches', cricApiController.getCurrentMatches);
router.get('/match_info', cricApiController.getMatchInfo);
router.get('/match_squad', cricApiController.getMatchSquad);
router.get('/match_scorecard', cricApiController.getMatchScorecard);
router.get('/match_points', cricApiController.getMatchPoints);
router.get('/cricScore', cricApiController.getCricScore);

// Players
router.get('/players', cricApiController.getPlayers);
router.get('/players_info', cricApiController.getPlayerInfo);

module.exports = router;
