const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testDetails() {
    try {
        console.log('🔍 Testing Player & Team Details API...');

        // 1. Get a team ID from the teams list
        const teamsRes = await axios.get(`${BASE_URL}/teams`);
        if (teamsRes.data.length === 0) {
            console.warn('⚠️ No teams found to test.');
            return;
        }
        const teamId = teamsRes.data[0]._id;
        console.log(`✅ Fetched Team ID: ${teamId} (${teamsRes.data[0].name})`);

        // 2. Get Team Details
        const teamDetailRes = await axios.get(`${BASE_URL}/teams/${teamId}`);
        const teamData = teamDetailRes.data;
        console.log('✅ Team Details Response:', {
            name: teamData.name,
            playersCount: teamData.playersList?.length,
            matchCategories: Object.keys(teamData.matches || {})
        });

        // 3. Get a player ID from the team's player list
        if (teamData.playersList && teamData.playersList.length > 0) {
            const playerId = teamData.playersList[0]._id;
            console.log(`✅ Fetched Player ID: ${playerId} (${teamData.playersList[0].name})`);

            // 4. Get Player Details
            const playerDetailRes = await axios.get(`${BASE_URL}/players/${playerId}`);
            const playerData = playerDetailRes.data;
            console.log('✅ Player Details Response:', {
                name: playerData.name,
                role: playerData.role,
                hasStats: playerData.stats ? playerData.stats.length : 'No stats array'
            });
        } else {
            console.warn('⚠️ No players found in this team to test player details.');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
}

testDetails();
