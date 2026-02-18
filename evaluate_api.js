const https = require('https');

const API_KEY = '10713afc09mshb6904d96a0824c6p12bfbbjsnabf5f08d72a9';
const HOST = 'cricket-api-free-data.p.rapidapi.com';

function request(path) {
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

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    console.error('Failed to parse JSON for path:', path, data.substring(0, 100));
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
}

async function run() {
    console.log('🔍 Starting API Evaluation...');

    // 1. Get Teams to find a valid ID
    console.log('\n1. Fetching Teams...');
    const teams = await request('/cricket-teams');
    if (!teams || !teams.response || teams.response.length === 0) {
        console.error('❌ Failed to fetch teams or empty response.');
        return;
    }

    // Log first 3 teams
    console.log(`✅ Found ${teams.response.length} teams.`);
    const teamSample = teams.response.slice(0, 3);
    teamSample.forEach(t => console.log(`   - ID: ${t.id}, Name: ${t.title}`));

    const targetTeamId = teamSample[0].id; // Use first available team
    console.log(`\n👉 Using Team ID: ${targetTeamId} for player lookup.`);

    // 2. Get Players for that Team
    console.log(`\n2. Fetching Players for Team ${targetTeamId}...`);
    const players = await request(`/cricket-players?teamid=${targetTeamId}`);

    if (!players || !players.response || players.response.length === 0) {
        console.error('❌ No players found for this team.');
    } else {
        console.log(`✅ Found ${players.response.length} players.`);
        const player = players.response[0];
        console.log('   - Sample Player Keys:', Object.keys(player));
        console.log('   - Sample Player Data:', JSON.stringify(player, null, 2));

        // Check for bio or detailed info
        // Properties might be 'bio', 'intro', 'content', 'description'
        const hasBio = players.response.some(p =>
            p.bio || p.biography || p.intro || p.content || (p.details && p.details.length > 20)
        );

        if (hasBio) {
            console.log('🎉 FOUND BIOGRAPHY DATA!');
            // Print a sample bio
            const bioPlayer = players.response.find(p => p.bio || p.biography || p.intro);
            console.log('Sample Bio:', bioPlayer.bio || bioPlayer.biography || bioPlayer.intro);
        } else {
            console.warn('⚠️ No obvious biography field found in player list.');
        }
    }

    // 3. Try generic player endpoint
    console.log('\n3. Fetching /cricket-players (no params)...');
    const allPlayers = await request('/cricket-players');
    if (allPlayers && allPlayers.response && allPlayers.response.length > 0) {
        console.log(`✅ Returned ${allPlayers.response.length} entries.`);
        console.log('   - Sample:', JSON.stringify(allPlayers.response[0], null, 2));
    } else {
        console.log('ℹ️ /cricket-players returned no data or empty list.');
    }

    // 4. Check Match Schedule for richness
    console.log('\n4. Checking Schedule...');
    const schedule = await request('/cricket-schedule');
    if (schedule && schedule.response && schedule.response.length > 0) {
        console.log(`✅ Found ${schedule.response.length} scheduled matches.`);
        console.log('   - Sample:', JSON.stringify(schedule.response[0], null, 2));
    }
}

run();
