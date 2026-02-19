const https = require('https');
const { getIO } = require('../socket');

const API_KEY = process.env.CRICAPI_KEY;
const HOST = 'api.cricapi.com';
const POLL_INTERVAL = 60_000; // 1 minute

let cachedMatches = [];
let previousScores = new Map();

function fetchJSON(path) {
    return new Promise((resolve, reject) => {
        // path is like '/v1/currentMatches' (no trailing ?)
        const fullPath = `${path}?apikey=${API_KEY}&offset=0`;
        const options = {
            method: 'GET',
            hostname: HOST,
            path: fullPath,
            headers: { 'Content-Type': 'application/json' }
        };
        const req = https.request(options, function (res) {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

function normalizeMatch(m) {
    const teams = (m.name || '').split(' vs ');
    const homeTeam = teams[0]?.trim() || 'TBD';
    const awayTeam = teams[1]?.split(',')[0]?.trim() || 'TBD';

    let homeScore = '-';
    let awayScore = '-';

    if (m.score && Array.isArray(m.score)) {
        const homeInn = m.score.find(s => s.inning && s.inning.toLowerCase().includes(homeTeam.toLowerCase().substring(0, 4)));
        const awayInn = m.score.find(s => s.inning && s.inning.toLowerCase().includes(awayTeam.toLowerCase().substring(0, 4)));
        if (homeInn) homeScore = `${homeInn.r}/${homeInn.w} (${homeInn.o})`;
        if (awayInn) awayScore = `${awayInn.r}/${awayInn.w} (${awayInn.o})`;
    }

    const homeInfo = m.teamInfo?.find(t => t.name?.toLowerCase().includes(homeTeam.toLowerCase().substring(0, 4)));
    const awayInfo = m.teamInfo?.find(t => t.name?.toLowerCase().includes(awayTeam.toLowerCase().substring(0, 4)));

    // Determine status
    let status = 'upcoming';
    const s = (m.status || '').toLowerCase();
    if (s === 'match not started' || s.includes('not started')) {
        status = 'upcoming';
    } else if (s.includes('won') || s.includes('drawn') || s.includes('tied') || s.includes('abandoned') || s.includes('no result')) {
        status = 'completed';
    } else if (s !== '') {
        // Any other non-empty status means in progress
        status = 'live';
    }

    return {
        id: m.id,
        sport: 'cricket',
        tournament: m.matchType?.toUpperCase() || 'International',
        status,
        venue: m.venue || '',
        date: m.dateTimeGMT ? new Date(m.dateTimeGMT).toLocaleDateString() : '',
        time: m.dateTimeGMT ? new Date(m.dateTimeGMT).toLocaleTimeString() : '',
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        homeBadge: homeInfo?.img || '',
        awayBadge: awayInfo?.img || '',
        summary: m.status || '',
        matchType: m.matchType || 'odi',
        source: 'cricapi',
    };
}

async function poll() {
    try {
        console.log('🏏 CricAPI Polling current matches...');
        // CricAPI response shape: { apikey: '...', data: [...] }
        // There is NO top-level `status` field — only `apikey` and `data`
        const response = await fetchJSON('/v1/currentMatches');
        if (!response || !Array.isArray(response.data)) {
            console.log('⚠️ CricAPI unexpected response:', JSON.stringify(response).substring(0, 200));
            return;
        }

        const matches = response.data.map(normalizeMatch);

        // Emit socket events for score changes
        const io = getIO();
        if (io) {
            for (const m of matches) {
                const key = m.id;
                const newKey = `${m.homeScore}-${m.awayScore}-${m.status}`;
                const oldKey = previousScores.get(key);
                if (oldKey && oldKey !== newKey) {
                    io.emit('score:update', m);
                    console.log(`🏏 Score update: ${m.homeTeam} vs ${m.awayTeam}`);
                }
                previousScores.set(key, newKey);
            }
        }

        cachedMatches = matches;
        console.log(`🏏 CricAPI: cached ${matches.length} matches (${matches.filter(m => m.status === 'live').length} live)`);
    } catch (error) {
        console.error('🏏 CricAPI Poll Error:', error.message);
    }
}

function getCachedMatches() {
    return cachedMatches;
}

function getCachedMatchById(id) {
    return cachedMatches.find(m => m.id === id) || null;
}

function start() {
    console.log('🏏 CricAPI polling started (every 60s)');
    poll();
    setInterval(poll, POLL_INTERVAL);
}

module.exports = {
    start,
    getCachedMatches,
    getCachedMatchById,

    getPlayer: async () => null,
    getTeam: async () => null,

    getCricketTeams: async () => [],
    getCricketPlayers: async () => [],

    // Compatibility methods for cricApi.js routes
    getMatchInfo: async (id) => {
        const match = cachedMatches.find(m => m.id === id);
        return { status: 'success', data: match || null };
    },
    getScorecard: async (id) => {
        const match = cachedMatches.find(m => m.id === id);
        return {
            status: 'success',
            data: {
                scorecard: [
                    { inning: match?.homeTeam || 'Team A', runs: match?.homeScore || 0, wickets: 0, overs: 0, batsman: [] },
                    { inning: match?.awayTeam || 'Team B', runs: match?.awayScore || 0, wickets: 0, overs: 0, batsman: [] }
                ]
            }
        };
    },
    getSquad: async () => ({ status: 'success', data: [] }),
    getPlayerInfo: async () => ({ status: 'success', data: null }),
    getSeries: async () => ({ status: 'success', data: [] }),
    getCountries: async () => ({ status: 'success', data: [] }),
};
