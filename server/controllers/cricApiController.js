const cricApiComService = require('../services/cricApiComService');

// Helper to handle API responses
const handleResponse = async (res, promise) => {
    try {
        const data = await promise;
        res.json({ status: 'success', data: data });
    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getCountries: (req, res) => handleResponse(res, cricApiComService.getCountries()),

    getSeries: (req, res) => handleResponse(res, cricApiComService.getSeries(req.query.search)),
    getSeriesInfo: (req, res) => handleResponse(res, cricApiComService.getSeriesInfo(req.query.id)),
    getSeriesSquad: (req, res) => handleResponse(res, cricApiComService.getSeriesSquad(req.query.id)),

    getMatches: (req, res) => handleResponse(res, cricApiComService.getMatches()),
    getCurrentMatches: (req, res) => handleResponse(res, cricApiComService.getCurrentMatches()),
    getMatchInfo: (req, res) => handleResponse(res, cricApiComService.getMatchInfo(req.query.id)),
    getMatchSquad: (req, res) => handleResponse(res, cricApiComService.getMatchSquad(req.query.id)),
    getMatchScorecard: (req, res) => handleResponse(res, cricApiComService.getMatchScorecard(req.query.id)),
    getMatchPoints: (req, res) => handleResponse(res, cricApiComService.getMatchPoints(req.query.id)),
    getCricScore: (req, res) => handleResponse(res, cricApiComService.getCricScore(req.query.id)),

    getPlayers: (req, res) => handleResponse(res, cricApiComService.getPlayers(req.query.search)),
    getPlayerInfo: (req, res) => handleResponse(res, cricApiComService.getPlayerInfo(req.query.id)),
};
