const https = require('https');
const { getIO } = require('../socket');

const API_KEY = process.env.CRICAPI_KEY || 'b825cbb1-b220-48bf-854c-2ee543548215';
const BASE_URL = 'https://api.cricapi.com/v1';
const POLL_INTERVAL = 1800_000; // 30 minutes (to stay under 100 req/day limit)
const CACHE_TTL = 600_000; // 10 minutes for details

// In-memory cache
let cachedMatches = [];
let previousScores = new Map(); // id -> score key
const detailsCache = new Map(); // url -> { data, timestamp }

function getFromCache(url) {
    const cached = detailsCache.get(url);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        console.log(`🏏 Returning cached data for: ${url}`);
        return Promise.resolve(cached.data);
    }
    return null;
}

function fetchJSON(url) {
    // Check cache first for detail endpoints
    const cachedPromise = getFromCache(url);
    if (cachedPromise) return cachedPromise;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    // Cache the successful response
                    if (json.status === 'success') {
                        detailsCache.set(url, { data: json, timestamp: Date.now() });
                    }
                    resolve(json);
                }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

function normalizeMatch(m) {
    let status = 'upcoming';
    if (!m.matchStarted) {
        status = 'upcoming';
    } else if (m.matchEnded) {
        status = 'completed';
    } else {
        status = 'live';
    }

    // Extract scores from the score array
    const team1 = m.teams?.[0] || '';
    const team2 = m.teams?.[1] || '';
    const scoreA = m.score?.find(s => s.inning && s.inning.includes(team1));
    const scoreB = m.score?.find(s => s.inning && s.inning.includes(team2));

    return {
        id: m.id,
        sport: 'cricket',
        tournament: m.matchType || '',
        status,
        venue: m.venue || '',
        date: m.dateTimeGMT || m.date || '',
        time: '',
        homeTeam: m.teamInfo?.[0]?.name || team1,
        awayTeam: m.teamInfo?.[1]?.name || team2,
        homeShort: m.teamInfo?.[0]?.shortname || team1.substring(0, 3).toUpperCase(),
        awayShort: m.teamInfo?.[1]?.shortname || team2.substring(0, 3).toUpperCase(),
        homeScore: scoreA ? `${scoreA.r}/${scoreA.w} (${scoreA.o})` : '-',
        awayScore: scoreB ? `${scoreB.r}/${scoreB.w} (${scoreB.o})` : '-',
        homeBadge: m.teamInfo?.[0]?.img || '',
        awayBadge: m.teamInfo?.[1]?.img || '',
        summary: m.status || '',
        matchType: m.matchType || '',
        source: 'cricapi',
    };
}

async function poll() {
    if (!API_KEY) {
        console.warn('🏏 CricAPI: No CRICAPI_KEY set, skipping poll');
        return;
    }

    try {
        console.log('🏏 Polling CricAPI...');
        // Switch to 'matches' endpoint to show Upcoming/Recent matches if Live fails or is empty
        const url = `${BASE_URL}/matches?apikey=${API_KEY}&offset=0`;
        const data = await fetchJSON(url);

        if (data.status !== 'success') {
            // Log detailed error but DO NOT THROW to avoid crashing the server loop
            console.error('❌ CricAPI Error:', data.info || data.status || 'Unknown error');
            return;
        }

        const matches = data.data || [];
        if (matches.length === 0) {
            console.log('🏏 No cricket matches found');
        }

        // Take top 50 matches to avoid overwhelming frontend
        const normalized = matches.slice(0, 50).map(normalizeMatch);

        // Detect score changes and emit Socket.IO events
        const io = getIO();
        for (const match of normalized) {
            const key = match.id;
            const newScoreKey = `${match.homeScore}-${match.awayScore}-${match.status}`;
            const oldScoreKey = previousScores.get(key);

            if (oldScoreKey && oldScoreKey !== newScoreKey) {
                io.emit('score:update', match);
                console.log(`🏏 Score update: ${match.homeTeam} ${match.homeScore} vs ${match.awayTeam} ${match.awayScore}`);
            }
            previousScores.set(key, newScoreKey);
        }

        cachedMatches = normalized;
        console.log(`🏏 CricAPI: cached ${normalized.length} cricket matches`);
    } catch (err) {
        console.error('🏏 CricAPI poll error:', err.message);
    }
}

function getCachedMatches() {
    return cachedMatches;
}

// New methods for detailed data
async function getMatchInfo(id) {
    const url = `${BASE_URL}/match_info?apikey=${API_KEY}&id=${id}`;
    return fetchJSON(url);
}

async function getScorecard(id) {
    const url = `${BASE_URL}/match_scorecard?apikey=${API_KEY}&id=${id}`;
    return fetchJSON(url);
}

async function getSquad(id) {
    const url = `${BASE_URL}/match_squad?apikey=${API_KEY}&id=${id}`;
    return fetchJSON(url);
}

async function getPlayerInfo(id) {
    const url = `${BASE_URL}/players_info?apikey=${API_KEY}&id=${id}`;
    return fetchJSON(url);
}

async function getSeries(offset = 0) {
    const url = `${BASE_URL}/series?apikey=${API_KEY}&offset=${offset}`;
    return fetchJSON(url);
}

async function getCountries(offset = 0) {
    const url = `${BASE_URL}/countries?apikey=${API_KEY}&offset=${offset}`;
    return fetchJSON(url);
}

function start() {
    if (!API_KEY) {
        console.warn('🏏 CricAPI: CRICAPI_KEY not set — cricket polling disabled');
        return;
    }
    console.log('🏏 CricAPI polling started (every 30m)');
    poll(); // Initial fetch
    setInterval(poll, POLL_INTERVAL);
}

module.exports = {
    start,
    getCachedMatches,
    getMatchInfo,
    getScorecard,
    getSquad,
    getPlayerInfo,
    getSeries,
    getCountries
};
