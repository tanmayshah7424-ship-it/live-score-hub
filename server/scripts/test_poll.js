const https = require('https');

const API_KEY = 'b825cbb1-b220-48bf-854c-2ee543548215';
const BASE_URL = 'https://api.cricapi.com/v1';

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

async function poll() {
    console.log(`Polling with key: ${API_KEY}`);
    try {
        const url = `${BASE_URL}/countries?apikey=${API_KEY}&offset=0`;
        console.log(`Fetching: ${url}`);
        const data = await fetchJSON(url);

        console.log('Status:', data.status);
        console.log('Info:', data.info); // API often returns info on failure
        if (data.status === 'success') {
            console.log(`Countries found: ${data.data?.length}`);
        } else {
            console.log("Full response:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

poll();
