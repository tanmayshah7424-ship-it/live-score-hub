const https = require('https');

const options = {
    method: 'GET',
    hostname: 'cricket-api-free-data.p.rapidapi.com',
    port: null,
    path: '/cricket-players?teamid=2',
    headers: {
        'x-rapidapi-host': 'cricket-api-free-data.p.rapidapi.com',
        'x-rapidapi-key': '10713afc09mshb6904d96a0824c6p12bfbbjsnabf5f08d72a9'
    }
};

const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
        chunks.push(chunk);
    });

    res.on('end', function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
    });
});

req.end();
