const https = require('https');
const { getIO } = require('../socket');

const API_KEY = '10713afc09mshb6904d96a0824c6p12bfbbjsnabf5f08d72a9';
const HOST = 'cricket-api-free-data.p.rapidapi.com';
const POLL_INTERVAL = 60_000; // 1 minute

let cachedMatches = [];
let previousScores = new Map();

function fetchJSON(path) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: HOST,
            path: path,
            headers: {
                'x-rapidapi-host': HOST,
                'x-rapidapi-key': API_KEY
            }
        };
        const req = https.request(options, function (res) {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

function normalizeMatch(m) {
    let status = 'upcoming';
    // Mapping status from 'In progress', 'Postponed', etc.
    if (m.status) {
        const s = m.status.toLowerCase();
        if (s.includes('progress') || s.includes('live') || s.includes('ing') || /\d/.test(s)) status = 'live'; // Simple check
        if (s.includes('complete') || s.includes('finish') || s.includes('res.') || s.includes('won')) status = 'completed';
        if (s.includes('match') && !s.includes('progress')) {
            // Sometimes 'Match' could mean just the listing, assuming upcoming if date is future
            // If m.startTime is string like '2023-11-05...', check it
        }
    }

    // Fallback if status unclear but has score
    if (m.score && m.score.length > 5 && status === 'upcoming') status = 'live';

    return {
        id: m.id || m.matchId,
        sport: 'cricket',
        tournament: m.series || m.league || 'International',
        status,
        venue: m.venue || '',
        date: m.dateTimeGMT || m.dateTime || '',
        time: '',
        homeTeam: m.t1 || m.team1 || '',
        awayTeam: m.t2 || m.team2 || '',
        homeShort: (m.t1 || m.team1 || '').substring(0, 3).toUpperCase(),
        awayShort: (m.t2 || m.team2 || '').substring(0, 3).toUpperCase(),
        homeScore: m.t1s || '-',
        awayScore: m.t2s || '-',
        homeBadge: m.t1img || '',
        awayBadge: m.t2img || '',
        summary: m.status || '',
        matchType: m.matchType || 'odi',
        source: 'rapidapi',
    };
}

async function poll() {
    try {
        // Fetch Live Scores
        console.log('🏏 RapidAPI Polling Live Scores...');
        const liveData = await fetchJSON('/cricket-livescores');
        // Fetch Upcoming if live empty or just merge
        const scheduleData = await fetchJSON('/cricket-schedule'); // To have upcoming matches

        let matches = [];
        if (liveData && Array.isArray(liveData.response)) {
            // Transform live data
            // Assuming response is array of objects
            matches = matches.concat(liveData.response.map(normalizeMatch));
        } else {
            console.log('⚠️ RapidAPI Live Data response is not an array:', JSON.stringify(liveData).substring(0, 200));
        }

        if (scheduleData && Array.isArray(scheduleData.response)) {
            // Transform schedule data
            matches = matches.concat(scheduleData.response.map(normalizeMatch));
        } else {
            console.log('⚠️ RapidAPI Schedule Data response is not an array:', JSON.stringify(scheduleData).substring(0, 200));
        }

        // Limit to reasonable number
        const normalized = matches.slice(0, 50);

        // Notify via Socket.IO
        const io = getIO();
        if (io) {
            for (const m of normalized) {
                const key = m.id;
                const newScoreKey = `${m.homeScore}-${m.awayScore}-${m.status}`;
                const oldScoreKey = previousScores.get(key);

                if (oldScoreKey && oldScoreKey !== newScoreKey) {
                    io.emit('score:update', m);
                    console.log(`🏏 Score update: ${m.homeTeam} vs ${m.awayTeam}`);
                }
                previousScores.set(key, newScoreKey);
            }
        }

        cachedMatches = normalized;
        console.log(`🏏 RapidAPI: cached ${normalized.length} matches`);
    } catch (error) {
        console.error('🏏 RapidAPI Poll Error:', error.message);
    }
}

function getCachedMatches() {
    return cachedMatches;
}

// Helpers for other controllers
async function getPlayer(id) {
    // If we have player ID, maybe try finding by team? 
    // Wait, rapidapi might not support direct player lookup by ID
    // So maybe we return null or implement search if supported
    return null;
}

async function getTeam(id) {
    // Assuming team details fetch
    return null;
}

async function getCricketTeams() {
    try {
        const data = await fetchJSON('/cricket-teams');
        return data ? data.response : [];
    } catch (error) {
        console.error('Error fetching cricket teams:', error);
        return [];
    }
}

async function getCricketPlayers(teamId) {
    try {
        const path = teamId ? `/cricket-players?teamid=${teamId}` : '/cricket-players';
        const data = await fetchJSON(path);
        return data ? data.response : [];
    } catch (error) {
        console.error('Error fetching cricket players:', error);
        return [];
    }
}

function start() {
    console.log('🏏 RapidAPI polling started (every 60s)');
    poll();
    setInterval(poll, POLL_INTERVAL);
}

module.exports = {
    start,
    getCachedMatches,
    getPlayer,
    getTeam,
    getCricketTeams,
    getCricketPlayers,

    // Compatibility methods for cricApi.js routes
    getMatchInfo: async (id) => {
        const match = cachedMatches.find(m => m.id === id);
        return { status: 'success', data: match };
    },
    getScorecard: async (id) => {
        const match = cachedMatches.find(m => m.id === id);
        // RapidAPI free tier doesn't seem to have dedicated scorecard endpoint easily mapping to match ID
        // Returning minimal structure to avoid frontend crash
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
    getSquad: async (id) => {
        return { status: 'success', data: [] };
    },
    getPlayerInfo: async (id) => {
        // We can try to use SportsDB here if we had a name, but with just ID it's hard.
        // Returning null data
        return { status: 'success', data: null };
    },
    getSeries: async () => {
        return { status: 'success', data: [] };
    },
    getCountries: async () => {
        return { status: 'success', data: [] };
    }
};
