const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api/search';

async function testSearch(query) {
    try {
        console.log(`\n🔍 Searching for: "${query}"`);
        const start = Date.now();
        const res = await axios.get(`${BASE_URL}?q=${query}`);
        const duration = Date.now() - start;

        console.log(`✅ Status: ${res.status} (${duration}ms)`);
        const data = res.data.data;

        console.log('Results Summary:');
        console.log(`- Live Matches: ${data.live.length}`);
        console.log(`- Upcoming: ${data.upcoming.length}`);
        console.log(`- Teams: ${data.teams.length}`);
        console.log(`- Players: ${data.players.length}`);
        console.log(`- Series: ${data.series.length}`);

        if (data.teams.length > 0) console.log('  Top Team:', data.teams[0].name);
        if (data.players.length > 0) console.log('  Top Player:', data.players[0].name);

    } catch (error) {
        console.error('❌ Search Failed:', error.response?.data || error.message);
    }
}

async function testSuggest(query) {
    try {
        console.log(`\n💡 Testing Suggest: "${query}"`);
        const res = await axios.get(`${BASE_URL}/suggest?q=${query}`);
        console.log('Suggestions:', res.data.data.map(s => `${s.text} (${s.type})`));
    } catch (error) {
        console.error('❌ Suggest Failed:', error.message);
    }
}

async function runTests() {
    // Wait for server to be likely ready
    console.log('Wait 2s for server...');
    await new Promise(r => setTimeout(r, 2000));

    await testSuggest('Ind');
    await testSearch('India');
    await testSearch('Kohli');
    await testSearch('IPL');
}

runTests();
