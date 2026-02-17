const https = require('https');
const { getIO } = require('../socket');

const API_KEY = process.env.SPORTSDB_API_KEY || '3';
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const POLL_INTERVAL = 60_000; // 60 seconds

// In-memory cache
let cachedMatches = [];
let previousScores = new Map(); // idEvent -> "homeScore-awayScore"

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

function normalizeEvent(ev) {
    // Determine status from strStatus field
    let status = 'upcoming';
    const s = (ev.strStatus || '').toLowerCase();
    if (s === 'match finished' || s === 'ft' || s === 'aet' || s === 'ap') {
        status = 'completed';
    } else if (s === 'not started' || s === 'ns' || s === '') {
        status = 'upcoming';
    } else {
        // Any other status (1H, 2H, HT, live, numeric minute, etc.) means live
        status = 'live';
    }

    return {
        id: ev.idEvent,
        sport: 'football',
        tournament: ev.strLeague || '',
        status,
        venue: ev.strVenue || '',
        date: ev.dateEvent || '',
        time: ev.strTime || '',
        homeTeam: ev.strHomeTeam || '',
        awayTeam: ev.strAwayTeam || '',
        homeScore: ev.intHomeScore != null ? String(ev.intHomeScore) : '-',
        awayScore: ev.intAwayScore != null ? String(ev.intAwayScore) : '-',
        homeBadge: ev.strHomeTeamBadge || '',
        awayBadge: ev.strAwayTeamBadge || '',
        homeId: ev.idHomeTeam || '',
        awayId: ev.idAwayTeam || '',
        leagueId: ev.idLeague || '',
        source: 'thesportsdb',
    };
}

async function poll() {
    try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const url = `${BASE}/eventsday.php?d=${today}&s=Soccer`;
        const data = await fetchJSON(url);
        const events = data.events || [];

        const normalized = events.map(normalizeEvent);

        // Detect score changes and emit Socket.IO events
        const io = getIO();
        for (const match of normalized) {
            const key = match.id;
            const newScoreKey = `${match.homeScore}-${match.awayScore}-${match.status}`;
            const oldScoreKey = previousScores.get(key);

            if (oldScoreKey && oldScoreKey !== newScoreKey) {
                // Score or status changed — emit real-time update
                io.emit('score:update', match);
                console.log(`⚽ Score update: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`);
            }
            previousScores.set(key, newScoreKey);
        }

        cachedMatches = normalized;
        console.log(`📡 TheSportsDB: cached ${normalized.length} football events for ${today}`);
    } catch (err) {
        console.error('TheSportsDB poll error:', err.message);
    }
}

function getCachedMatches(sport) {
    if (sport) {
        return cachedMatches.filter((m) => m.sport === sport.toLowerCase());
    }
    return cachedMatches;
}

function start() {
    console.log('🏟️  TheSportsDB polling started (every 60s)');
    poll(); // Initial fetch
    setInterval(poll, POLL_INTERVAL);
}

module.exports = { start, getCachedMatches };
