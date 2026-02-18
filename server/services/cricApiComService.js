const https = require('https');

const API_KEY = 'b825cbb1-b220-48bf-854c-2ee543548215';
const HOST = 'api.cricapi.com';

const cache = {};
const CACHE_TTL = 60 * 1000; // 1 minute

const request = (path, params = {}) => {
    return new Promise((resolve, reject) => {
        const queryParams = new URLSearchParams({
            apikey: API_KEY,
            offset: 0,
            ...params
        });

        const options = {
            method: 'GET',
            hostname: HOST,
            path: `/v1${path}?${queryParams.toString()}`,
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    console.error('Failed to parse JSON for path:', path);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request error:', e.message);
            reject(e);
        });
        req.end();
    });
};

// Generic fetcher with caching
const fetchFromApi = async (endpoint, params = {}) => {
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
        return cache[cacheKey].data;
    }

    try {
        const data = await request(endpoint, params);
        if (data && data.status === 'success') {
            cache[cacheKey] = {
                data: data.data,
                timestamp: Date.now()
            };
            return data.data;
        } else if (data && data.status === 'failure') {
            console.warn(`[CricApiCom] API Failure: ${data.reason}`);
            // Return cached data if available even if expired, to prevent blank screen
            return cache[cacheKey] ? cache[cacheKey].data : null;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
};

const service = {
    // Countries
    getCountries: async () => fetchFromApi('/countries') || [],

    // Series
    getSeries: async (search) => fetchFromApi('/series', { search }) || [],
    getSeriesInfo: async (id) => fetchFromApi('/series_info', { id }),
    getSeriesSquad: async (id) => fetchFromApi('/series_squad', { id }),

    // Matches
    getMatches: async () => fetchFromApi('/matches') || [],
    getCurrentMatches: async () => fetchFromApi('/currentMatches') || [],
    getMatchInfo: async (id) => fetchFromApi('/match_info', { id }),
    getMatchSquad: async (id) => fetchFromApi('/match_squad', { id }),
    getMatchScorecard: async (id) => fetchFromApi('/match_scorecard', { id }),
    getMatchPoints: async (id) => fetchFromApi('/match_points', { id, ruleset: 0 }),
    getCricScore: async (id) => fetchFromApi('/cricScore', { id }),

    // Players
    getPlayers: async (search) => fetchFromApi('/players', { search }) || [],
    getPlayerInfo: async (id) => fetchFromApi('/players_info', { id }),
};

module.exports = service;
