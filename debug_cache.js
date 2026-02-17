const http = require('http');

function fetch(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

(async () => {
    try {
        console.log("Fetching debug cache...");
        const matches = await fetch('http://127.0.0.1:5001/api/cricapi/debug');
        console.log(`Cached Matches Count: ${matches.length}`);
        if (matches.length > 0) {
            console.log("First match sample:", JSON.stringify(matches[0], null, 2));
        } else {
            console.log("Cache is empty. Polling might have failed or returned no matches.");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
})();
