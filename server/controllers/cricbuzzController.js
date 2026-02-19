const cricbuzzService = require('../services/cricbuzzService');

// Helper to handle API responses
const handleResponse = async (res, promise) => {
    try {
        const result = await promise;
        // cricbuzzService returns { data, rawResponse } or { data: null, error }
        if (result.error) {
            return res.status(500).json({ status: 'error', message: result.error });
        }
        res.json({ status: 'success', data: result.data });
    } catch (error) {
        console.error('Cricbuzz Controller Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getLiveMatches: (req, res) => handleResponse(res, cricbuzzService.getLiveMatches()),
    getUpcomingMatches: (req, res) => handleResponse(res, cricbuzzService.getUpcomingMatches()),
    getRecentMatches: (req, res) => handleResponse(res, cricbuzzService.getRecentMatches()),

    // Match Detail
    getMatchCenter: (req, res) => handleResponse(res, cricbuzzService.getMatchCenter(req.params.id)),
    getScard: (req, res) => handleResponse(res, cricbuzzService.getScard(req.params.id)),
    getHscard: (req, res) => handleResponse(res, cricbuzzService.getHscard(req.params.id)),

    // Team/Misc
    getTeamForMatch: (req, res) => handleResponse(res, cricbuzzService.getTeamForMatch(req.params.id, req.params.teamId)),
    getInternationalTeams: (req, res) => handleResponse(res, cricbuzzService.getInternationalTeams()),
    getTeamStats: (req, res) => handleResponse(res, cricbuzzService.getTeamStats(req.params.teamId, req.query.statsType)),
};
