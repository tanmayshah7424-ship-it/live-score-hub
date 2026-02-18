const https = require('https');

const API_KEY = '10713afc09mshb6904d96a0824c6p12bfbbjsnabf5f08d72a9';
const HOST = 'cricket-api-free-data.p.rapidapi.com';

function fetch(path) {
    const options = {
        method: 'GET',
        hostname: HOST,
        port: null,
        path: path,
        headers: {
            'x-rapidapi-host': HOST,
            'x-rapidapi-key': API_KEY
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, function (res) {
            const chunks = [];
            res.on('data', function (chunk) {
                chunks.push(chunk);
            });
            res.on('end', function () {
                const body = Buffer.concat(chunks);
                try {
                    const json = JSON.parse(body.toString());
                    resolve(json);
                } catch (e) {
                    console.error('Failed to parse JSON:', body.toString());
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function test() {
    try {
        console.log('--- Testing Teams ---');
        const teams = await fetch('/cricket-teams');
        console.log('Teams count:', teams.response ? teams.response.length : 0);
        if (teams.response && teams.response.length > 0) {
            console.log('Sample Team:', JSON.stringify(teams.response[0], null, 2));
        }

        console.log('\n--- Testing Players (Team ID 7) ---');
        // Trying Team ID 7: Pakistan (from previous example it was 2 but let's see)
        // Check first team ID from the teams call
        let teamId = 2;
        if (teams.response && teams.response.length > 0) {
            teamId = teams.response[0].team_id;
            console.log(`Using Team ID: ${teamId} (${teams.response[0].team_name})`);
        }

        const players = await fetch(`/cricket-players?teamid=${teamId}`);
        console.log('Players count:', players.response ? players.response.length : 0);
        if (players.response && players.response.length > 0) {
            console.log('Sample Player:', JSON.stringify(players.response[0], null, 2));

            // Check for biography or bio
            const playerWithBio = players.response.find(p => p.bio || p.biography || p.details);
            if (playerWithBio) {
                console.log('Found player with bio/details:', JSON.stringify(playerWithBio));
            } else {
                console.log('No player found with bio details in this team.');
            }
        }

        console.log('\n--- Testing Live Scores ---');
        const live = await fetch('/cricket-livescores');
        // Inspect structure to see if match details are rich
        if (live.response && live.response.length > 0) {
            console.log('Sample Live Match:', JSON.stringify(live.response[0], null, 2));
        } else {
            console.log('No live matches currently.');
        }

    } catch (err) {
        console.error('Test Error:', err);
    }
}

test();
