const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'cricbuzz-cricket.p.rapidapi.com';
const BASE = `https://${RAPIDAPI_HOST}`;

// Check for missing keys (non-blocking for now, but will log error on use)
if (!RAPIDAPI_KEY) {
    console.warn('⚠️ RAPIDAPI_KEY is not set in .env. Cricbuzz service will fail.');
}

const api = axios.create({
    baseURL: BASE,
    headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
    },
    timeout: 20000,
});

async function safeGet(url, config = {}) {
    try {
        const response = await api.get(url, config);
        return { data: response.data, rawResponse: response };
    } catch (error) {
        console.error(`Cricbuzz API Error [${url}]:`, error.message);
        // Return structured error so caller can handle
        return { data: null, error: error.message };
    }
}

// Matches
async function getLiveMatches() {
    const { data, rawResponse } = await safeGet('/matches/v1/live');
    return { data, rawResponse };
}

async function getUpcomingMatches() {
    const { data, rawResponse } = await safeGet('/matches/v1/upcoming');
    return { data, rawResponse };
}

async function getRecentMatches() {
    const { data, rawResponse } = await safeGet('/matches/v1/recent');
    return { data, rawResponse };
}

// Match center / scorecards
async function getMatchCenter(matchId) {
    if (!matchId) throw new Error('matchId required');
    const { data, rawResponse } = await safeGet(`/mcenter/v1/${matchId}`);
    return { data, rawResponse };
}

async function getScard(matchId) {
    if (!matchId) throw new Error('matchId required');
    const { data, rawResponse } = await safeGet(`/mcenter/v1/${matchId}/scard`);
    return { data, rawResponse };
}

async function getHscard(matchId) {
    if (!matchId) throw new Error('matchId required');
    const { data, rawResponse } = await safeGet(`/mcenter/v1/${matchId}/hscard`);
    return { data, rawResponse };
}

// Team and misc
async function getTeamForMatch(matchId, teamId) {
    if (!matchId || !teamId) throw new Error('matchId and teamId required');
    const { data, rawResponse } = await safeGet(`/mcenter/v1/${matchId}/team/${teamId}`);
    return { data, rawResponse };
}

async function getInternationalTeams() {
    const { data, rawResponse } = await safeGet('/teams/v1/international');
    return { data, rawResponse };
}

async function getTeamStats(teamId, statsType = 'mostRuns') {
    if (!teamId) throw new Error('teamId required');
    const { data, rawResponse } = await safeGet(`/stats/v1/team/${teamId}`, { params: { statsType } });
    return { data, rawResponse };
}

module.exports = {
    getLiveMatches,
    getUpcomingMatches,
    getRecentMatches,
    getMatchCenter,
    getScard,
    getHscard,
    getTeamForMatch,
    getInternationalTeams,
    getTeamStats,
};
