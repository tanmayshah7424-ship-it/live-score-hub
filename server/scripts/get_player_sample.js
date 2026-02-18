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
                    resolve(null);
                }
            });
        });
        req.end();
    });
}

(async () => {
    // ID 2 is India
    console.log('Fetching players for team 2...');
    const result = await request('/cricket-players?teamid=2');

    if (result && result.response && result.response.length > 0) {
        const player = result.response[0];
        console.log('--- KEYS ---');
        console.log(Object.keys(player));

        console.log('\n--- SAMPLE DATA ---');
        console.log(JSON.stringify(player, null, 2));

        // Specifically check bio
        if (player.bio || player.biography || player.content || player.intro) {
            console.log('\n✅ BIO FOUND:', (player.bio || player.biography || player.content || player.intro).substring(0, 100));
        } else {
            console.log('\n❌ NO BIO FIELD FOUND');
        }
    } else {
        console.log('No players found or error.');
    }
})();
