const rapidCricketService = require('../services/rapidCricketService');

// Helper to handle API responses
const handleResponse = async (res, promise) => {
    try {
        const result = await promise;
        // rapidCricketService returns { status, data } objects
        if (result && result.status === 'success') {
            res.json({ status: 'success', data: result.data });
        } else if (Array.isArray(result)) {
            res.json({ status: 'success', data: result });
        } else {
            res.json({ status: 'success', data: result });
        }
    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getCountries: (req, res) => handleResponse(res, rapidCricketService.getCountries()),

    getSeries: (req, res) => handleResponse(res, rapidCricketService.getSeries()),
    getSeriesInfo: (req, res) => res.json({ status: 'success', data: null }),
    getSeriesSquad: (req, res) => res.json({ status: 'success', data: [] }),

    getMatches: (req, res) => {
        const matches = rapidCricketService.getCachedMatches();
        res.json({ status: 'success', data: matches });
    },
    getCurrentMatches: (req, res) => {
        const matches = rapidCricketService.getCachedMatches().filter(m => m.status === 'live');
        res.json({ status: 'success', data: matches });
    },
    getMatchInfo: (req, res) => handleResponse(res, rapidCricketService.getMatchInfo(req.query.id)),
    getMatchSquad: (req, res) => handleResponse(res, rapidCricketService.getSquad(req.query.id)),
    getMatchScorecard: (req, res) => handleResponse(res, rapidCricketService.getScorecard(req.query.id)),
    getMatchPoints: (req, res) => res.json({ status: 'success', data: null }),
    getCricScore: (req, res) => {
        const match = rapidCricketService.getCachedMatches().find(m => m.id === req.query.id);
        res.json({ status: 'success', data: match || null });
    },

    getPlayers: (req, res) => handleResponse(res, rapidCricketService.getCricketPlayers()),
    getPlayerInfo: (req, res) => handleResponse(res, rapidCricketService.getPlayerInfo(req.query.id)),
};
