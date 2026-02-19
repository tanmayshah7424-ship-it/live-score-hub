const { ESPNClient } = require('../services/espnClient');
const { TeamIngestionService, ScoreboardIngestionService, get_or_create_sport_and_league } = require('../services/ingestService');
const Sport = require('../models/Sport');
const League = require('../models/League');

const client = new ESPNClient();
const teamIngest = new TeamIngestionService(client);
const scoreboardIngest = new ScoreboardIngestionService(client);

/**
 * Get all available sports and leagues from local DB.
 */
exports.getGenes = async (req, res, next) => {
    try {
        const sports = await Sport.find();
        const leagues = await League.find().populate('sport');
        res.json({ sports, leagues });
    } catch (error) {
        next(error);
    }
};

/**
 * Fetch teams from ESPN and optionally ingest them.
 * Query params: sport, league, ingest (true/false)
 */
exports.getTeams = async (req, res, next) => {
    try {
        const { sport = 'basketball', league = 'nba', ingest } = req.query;

        if (ingest === 'true') {
            const result = await teamIngest.ingest_teams(sport, league);
            return res.json(result.to_dict());
        }

        // Just fetch raw data if not ingesting
        const response = await client.get_teams(sport, league);
        res.json(response);
    } catch (error) {
        next(error);
    }
};

/**
 * Fetch scoreboard from ESPN and optionally ingest matches.
 * Query params: sport, league, date (YYYYMMDD), ingest (true/false)
 */
exports.getScoreboard = async (req, res, next) => {
    try {
        const { sport = 'basketball', league = 'nba', date, ingest } = req.query;

        if (ingest === 'true') {
            const result = await scoreboardIngest.ingest_scoreboard(sport, league, date);
            return res.json(result.to_dict());
        }

        const response = await client.get_scoreboard(sport, league, date);
        res.json(response);
    } catch (error) {
        next(error);
    }
};

/**
 * Get specific team details by ID
 */
exports.getTeam = async (req, res, next) => {
    try {
        const { sport = 'basketball', league = 'nba', id } = req.params;
        const response = await client.get_team(sport, league, id);
        res.json(response);
    } catch (error) {
        next(error);
    }
};
