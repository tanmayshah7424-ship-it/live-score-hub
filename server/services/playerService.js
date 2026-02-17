const axios = require('axios');

const SPORTSDB_KEY = process.env.SPORTSDB_API_KEY || '3';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${SPORTSDB_KEY}`;

// In-memory cache: key = "name", value = { data, timestamp }
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (player bio rarely changes)

function getCached(key) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    return null;
}

function setCache(key, data) {
    // Limit cache size
    if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
    cache.set(key, { data, timestamp: Date.now() });
}

async function searchPlayer(name) {
    const cacheKey = `search:${name.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const url = `${BASE_URL}/searchplayers.php?p=${encodeURIComponent(name)}`;
        const { data } = await axios.get(url, { timeout: 5000 });

        if (!data.player) return null;

        // Filter for cricket players if possible (TheSportsDB returns all sports)
        // Check strSport field
        const cricketPlayer = data.player.find(p => p.strSport === 'Cricket');

        // If no cricket player found, return the first result (might be multi-sport or data issue)
        const result = cricketPlayer || data.player[0];

        const simplified = {
            id: result.idPlayer,
            name: result.strPlayer,
            fullName: result.strPlayer, // TheSportsDB doesn't distinct always
            dob: result.dateBorn,
            birthLocation: result.strBirthLocation,
            nationality: result.strNationality,
            height: result.strHeight,
            sport: result.strSport,
            team: result.strTeam,
            position: result.strPosition,
            thumb: result.strThumb,
            banner: result.strBanner,
            description: result.strDescriptionEN,
            facebook: result.strFacebook,
            twitter: result.strTwitter,
            instagram: result.strInstagram
        };

        setCache(cacheKey, simplified);
        return simplified;
    } catch (err) {
        console.error(`TheSportsDB search error for ${name}:`, err.message);
        throw err;
    }
}

module.exports = { searchPlayer };
