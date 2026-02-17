require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Match = require('../models/Match');
const Commentary = require('../models/Commentary');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Team.deleteMany({}),
            Player.deleteMany({}),
            Match.deleteMany({}),
            Commentary.deleteMany({}),
        ]);
        console.log('Cleared existing data');

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'tanmayshah7424@gmail.com',
            password: 'Tanmay7424@',
            role: 'admin',
        });
        console.log('Created admin user: tanmayshah7424@gmail.com / Tanmay7424@');

        // Create demo user
        await User.create({
            name: 'Demo User',
            email: 'user@scorehub.com',
            password: 'user123',
            role: 'user',
        });
        console.log('Created demo user: user@scorehub.com / user123');

        // Seed Admin Settings
        const AdminSetting = require('../models/AdminSetting');
        await AdminSetting.deleteMany({});
        await AdminSetting.create({
            key: 'newsBanner',
            value: 'Welcome to ScoreHub Live! Catch all the action here.',
        });
        console.log('Seeded default admin settings');

        // Create teams
        const teamsData = [
            { name: 'Mumbai Indians', shortName: 'MI', logo: '🏏', sport: 'cricket', players: 25, matchesPlayed: 12, wins: 8 },
            { name: 'Chennai Super Kings', shortName: 'CSK', logo: '🦁', sport: 'cricket', players: 25, matchesPlayed: 12, wins: 7 },
            { name: 'Royal Challengers', shortName: 'RCB', logo: '👑', sport: 'cricket', players: 25, matchesPlayed: 12, wins: 6 },
            { name: 'Delhi Capitals', shortName: 'DC', logo: '🦅', sport: 'cricket', players: 25, matchesPlayed: 12, wins: 5 },
            { name: 'Manchester United', shortName: 'MUN', logo: '⚽', sport: 'football', players: 30, matchesPlayed: 20, wins: 12 },
            { name: 'Liverpool FC', shortName: 'LIV', logo: '⚽', sport: 'football', players: 30, matchesPlayed: 20, wins: 14 },
            { name: 'LA Lakers', shortName: 'LAL', logo: '🏀', sport: 'basketball', players: 15, matchesPlayed: 40, wins: 25 },
            { name: 'Golden State Warriors', shortName: 'GSW', logo: '🏀', sport: 'basketball', players: 15, matchesPlayed: 40, wins: 28 },
            { name: 'Kolkata Knight Riders', shortName: 'KKR', logo: '⚔️', sport: 'cricket', players: 25, matchesPlayed: 12, wins: 6 },
            { name: 'Barcelona FC', shortName: 'BAR', logo: '⚽', sport: 'football', players: 30, matchesPlayed: 20, wins: 15 },
        ];
        const teams = await Team.insertMany(teamsData);
        console.log(`Created ${teams.length} teams`);

        // Create players
        const playersData = [
            { name: 'Rohit Sharma', teamId: teams[0]._id, role: 'Batsman', sport: 'cricket', stats: { runs: 10480, avg: 48.96, sr: 140.2 } },
            { name: 'Jasprit Bumrah', teamId: teams[0]._id, role: 'Bowler', sport: 'cricket', stats: { wickets: 145, economy: 7.39, avg: 23.5 } },
            { name: 'MS Dhoni', teamId: teams[1]._id, role: 'Wicketkeeper', sport: 'cricket', stats: { runs: 5243, avg: 39.2, sr: 135.2 } },
            { name: 'Virat Kohli', teamId: teams[2]._id, role: 'Batsman', sport: 'cricket', stats: { runs: 7263, avg: 37.25, sr: 130.4 } },
            { name: 'Marcus Rashford', teamId: teams[4]._id, role: 'Forward', sport: 'football', stats: { goals: 131, assists: 57 } },
            { name: 'Mohamed Salah', teamId: teams[5]._id, role: 'Forward', sport: 'football', stats: { goals: 214, assists: 92 } },
            { name: 'LeBron James', teamId: teams[6]._id, role: 'Forward', sport: 'basketball', stats: { points: 40474, rebounds: 10908 } },
            { name: 'Stephen Curry', teamId: teams[7]._id, role: 'Guard', sport: 'basketball', stats: { points: 23067, threes: 3747 } },
            { name: 'Sunil Narine', teamId: teams[8]._id, role: 'All-rounder', sport: 'cricket', stats: { runs: 1400, wickets: 180 } },
            { name: 'Pedri', teamId: teams[9]._id, role: 'Midfielder', sport: 'football', stats: { goals: 22, assists: 18 } },
        ];
        const players = await Player.insertMany(playersData);
        console.log(`Created ${players.length} players`);

        // Create matches
        const now = new Date();
        const matchesData = [
            {
                sport: 'cricket', tournament: 'IPL 2026', status: 'live',
                venue: 'Wankhede Stadium, Mumbai', date: now,
                teamA: teams[0]._id, teamB: teams[1]._id,
                scoreA: '185/4', scoreB: '142/3', summary: 'CSK need 44 runs from 28 balls', overs: '15.2',
            },
            {
                sport: 'football', tournament: 'Premier League', status: 'live',
                venue: 'Old Trafford, Manchester', date: now,
                teamA: teams[4]._id, teamB: teams[5]._id,
                scoreA: '2', scoreB: '1', summary: "Man Utd leading • 72'", minute: '72',
            },
            {
                sport: 'basketball', tournament: 'NBA Season', status: 'live',
                venue: 'Crypto.com Arena, LA', date: now,
                teamA: teams[6]._id, teamB: teams[7]._id,
                scoreA: '98', scoreB: '102', summary: 'Q4 • 4:32 remaining',
            },
            {
                sport: 'cricket', tournament: 'IPL 2026', status: 'upcoming',
                venue: 'Eden Gardens, Kolkata',
                date: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                teamA: teams[2]._id, teamB: teams[3]._id,
                scoreA: '-', scoreB: '-', summary: 'Match starts tomorrow',
            },
            {
                sport: 'football', tournament: 'La Liga', status: 'upcoming',
                venue: 'Camp Nou, Barcelona',
                date: new Date(now.getTime() + 48 * 60 * 60 * 1000),
                teamA: teams[9]._id, teamB: teams[4]._id,
                scoreA: '-', scoreB: '-', summary: 'Upcoming fixture',
            },
            {
                sport: 'cricket', tournament: 'IPL 2026', status: 'completed',
                venue: 'Chinnaswamy Stadium, Bangalore',
                date: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                teamA: teams[2]._id, teamB: teams[8]._id,
                scoreA: '204/5', scoreB: '198/8', summary: 'RCB won by 6 runs',
            },
            {
                sport: 'football', tournament: 'Premier League', status: 'completed',
                venue: 'Anfield, Liverpool',
                date: new Date(now.getTime() - 48 * 60 * 60 * 1000),
                teamA: teams[5]._id, teamB: teams[4]._id,
                scoreA: '3', scoreB: '0', summary: 'Liverpool dominated',
            },
        ];
        const matches = await Match.insertMany(matchesData);
        console.log(`Created ${matches.length} matches`);

        // Create commentary for the live cricket match
        const commentaryData = [
            { matchId: matches[0]._id, timestamp: '15.2', description: 'Dhoni smashes a SIX over long-on!', type: 'six', value: 6 },
            { matchId: matches[0]._id, timestamp: '15.1', description: 'Single to deep midwicket', type: 'run', value: 1 },
            { matchId: matches[0]._id, timestamp: '14.6', description: 'FOUR! Cover drive by Jadeja', type: 'boundary', value: 4 },
            { matchId: matches[0]._id, timestamp: '14.5', description: 'Dot ball, good length outside off', type: 'run', value: 0 },
            { matchId: matches[0]._id, timestamp: '14.4', description: 'WICKET! Caught at slip, Uthappa departs', type: 'wicket', value: 0 },
            { matchId: matches[0]._id, timestamp: '14.3', description: 'Two runs, pushed to long-off', type: 'run', value: 2 },
            { matchId: matches[1]._id, timestamp: "72'", description: 'GOAL! Rashford volleys it in! 2-1', type: 'goal', value: 1 },
            { matchId: matches[1]._id, timestamp: "65'", description: 'Yellow card - Robertson for a late tackle', type: 'foul', value: 0 },
            { matchId: matches[1]._id, timestamp: "54'", description: 'GOAL! Salah equalizes from a corner! 1-1', type: 'goal', value: 1 },
            { matchId: matches[1]._id, timestamp: "23'", description: 'GOAL! Bruno Fernandes free kick! 1-0', type: 'goal', value: 1 },
        ];
        await Commentary.insertMany(commentaryData);
        console.log(`Created ${commentaryData.length} commentary events`);

        console.log('\n✅ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();
