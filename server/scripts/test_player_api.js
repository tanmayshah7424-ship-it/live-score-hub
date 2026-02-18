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
        console.log("Fetching live matches...");
        const matches = await fetch('http://127.0.0.1:5001/api/live');
        const cricketMatch = matches.find(m => m.source === 'cricapi');

        if (!cricketMatch) {
            console.log("No CricAPI matches found.");
            return;
        }

        console.log(`Found CricAPI Match: ${cricketMatch.id}`);

        console.log("Fetching squad...");
        const squadRes = await fetch(`http://127.0.0.1:5001/api/cricapi/match/${cricketMatch.id}/squad`);

        if (!squadRes.data || squadRes.data.length === 0) {
            console.log("No squad data found.");
            return;
        }

        const player = squadRes.data[0].players[0];
        console.log(`Found Player: ${player.name} (${player.id})`);

        console.log("Fetching player info...");
        const playerInfo = await fetch(`http://127.0.0.1:5001/api/cricapi/player/${player.id}`);

        if (playerInfo.data) {
            console.log("Player Info Fetched Successfully:");
            console.log(`Name: ${playerInfo.data.name}`);
            console.log(`Country: ${playerInfo.data.country}`);
        } else {
            console.log("Failed to fetch player info.");
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
})();
