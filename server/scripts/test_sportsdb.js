const https = require('https');

const API_KEY = '3'; // Public test key
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

function fetch(name) {
    const url = `${BASE_URL}/searchplayers.php?p=${encodeURIComponent(name)}`;
    console.log('Fetching:', url);

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.player && json.player.length > 0) {
                    const p = json.player[0];
                    console.log('✅ Found Player:', p.strPlayer);
                    console.log('📝 Bio (strDescriptionEN):', p.strDescriptionEN ? p.strDescriptionEN.substring(0, 100) + '...' : 'NONE');
                    console.log('🖼️ Thumb:', p.strThumb);
                } else {
                    console.log('❌ Player not found in TheSportsDB');
                }
            } catch (e) {
                console.error(e);
            }
        });
    });
}

fetch('Virat Kohli');
fetch('Babar Azam');
