const router = require('express').Router();
const cricApi = require('../services/cricApiService');

// Get Match Info
router.get('/match/:id/info', async (req, res) => {
    try {
        const data = await cricApi.getMatchInfo(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Scorecard
router.get('/match/:id/scorecard', async (req, res) => {
    try {
        const data = await cricApi.getScorecard(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Squad
router.get('/match/:id/squad', async (req, res) => {
    try {
        const data = await cricApi.getSquad(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Player Info
router.get('/player/:id', async (req, res) => {
    try {
        const data = await cricApi.getPlayerInfo(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Series
router.get('/series', async (req, res) => {
    try {
        const offset = req.query.offset || 0;
        const data = await cricApi.getSeries(offset);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Countries
router.get('/countries', async (req, res) => {
    try {
        const offset = req.query.offset || 0;
        const data = await cricApi.getCountries(offset);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Debug Cache
router.get('/debug', (req, res) => {
    res.json(cricApi.getCachedMatches());
});

module.exports = router;
