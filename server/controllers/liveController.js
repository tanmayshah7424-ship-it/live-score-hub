const { getCachedMatches: getFootballMatches } = require('../services/sportsDbService');
const { getCachedMatches: getCricketMatches } = require('../services/rapidCricketService');

exports.getLive = async (req, res) => {
    const sport = req.query.sport?.toLowerCase();

    if (sport === 'football') {
        return res.json(getFootballMatches());
    }
    if (sport === 'cricket') {
        return res.json(getCricketMatches());
    }

    // No filter — merge both
    const all = [...getFootballMatches(), ...getCricketMatches()];
    res.json(all);
};
