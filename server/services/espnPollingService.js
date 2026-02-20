const { TeamIngestionService, ScoreboardIngestionService } = require('./ingestService');
const { ESPNClient } = require('./espnClient');

const POLL_INTERVAL = 60000 * 5; // 5 minutes
const client = new ESPNClient();
const scoreboardIngest = new ScoreboardIngestionService(client);
// teamIngest is less frequent, maybe valid to run on startup or weekly? 
// For now, let's focus on matches (Scoreboard).

async function poll() {
    console.log('🏀 Polling ESPN Scoreboard...');
    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}${mm}${dd}`;

        // Define leagues to poll
        const leagues = [
            { sport: 'basketball', league: 'nba' },
            { sport: 'cricket', league: 'icc' } // Example, adjust as needed
        ];

        for (const { sport, league } of leagues) {
            console.log(`   Fetching ${sport}/${league} for ${dateStr}...`);
            const result = await scoreboardIngest.ingest_scoreboard(sport, league, dateStr);
            console.log(`   ${sport}/${league}: Created ${result.created}, Updated ${result.updated}, Errors ${result.errors}`);
        }
    } catch (error) {
        console.error('❌ ESPN Poll Error:', error.message);
    }
}

function start() {
    // Initial poll
    poll();
    // Schedule
    setInterval(poll, POLL_INTERVAL);
    console.log(`🏀 ESPN Polling Service started (Interval: ${POLL_INTERVAL}ms)`);
}

module.exports = { start, poll };
