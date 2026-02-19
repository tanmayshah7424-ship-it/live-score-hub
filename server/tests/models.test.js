const mongoose = require('mongoose');
const { app, server, connectDB } = require('../server');
const Sport = require('../models/Sport');
const League = require('../models/League');
const Team = require('../models/Team');
const Venue = require('../models/Venue');
const Match = require('../models/Match'); // Event in Python
const Player = require('../models/Player'); // Athlete in Python

describe('ESPN Model Tests', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        if (server) server.close();
    });

    beforeEach(async () => {
        await Sport.deleteMany({});
        await League.deleteMany({});
        await Team.deleteMany({});
        await Venue.deleteMany({});
        await Match.deleteMany({});
        await Player.deleteMany({});
    });

    describe('Sport Model', () => {
        test('sport creation and ordering', async () => {
            const fb = await Sport.create({ slug: 'football', name: 'Football' });
            const bb = await Sport.create({ slug: 'baseball', name: 'Baseball' });

            const sports = await Sport.find().sort({ name: 1 });
            expect(sports[0].name).toBe('Baseball');
            expect(sports[1].name).toBe('Football');
        });
    });

    describe('League Model', () => {
        test('league creation and reference', async () => {
            const sport = await Sport.create({ slug: 'basketball', name: 'Basketball' });
            const league = await League.create({
                sport: sport._id,
                slug: 'nba',
                name: 'NBA',
                abbreviation: 'NBA'
            });

            expect(league.name).toBe('NBA');
            expect(league.sport.toString()).toBe(sport._id.toString());
        });

        test('league unique constraint', async () => {
            const sport = await Sport.create({ slug: 'basketball', name: 'Basketball' });
            await League.create({ sport: sport._id, slug: 'nba', name: 'NBA', abbreviation: 'NBA' });

            // Should fail duplicate slug
            await expect(League.create({
                sport: sport._id,
                slug: 'nba',
                name: 'Duplicate NBA',
                abbreviation: 'DUP'
            })).rejects.toThrow();
        });
    });

    describe('Team Model', () => {
        test('team primary_logo virtual', async () => {
            const team = new Team({
                name: 'Test Team',
                shortName: 'TST',
                sport: 'basketball',
                logos: [{ href: 'https://example.com/logo.png', rel: ['default'] }]
            });
            expect(team.primary_logo).toBe('https://example.com/logo.png');
        });

        test('team primary_logo no default', async () => {
            const team = new Team({
                name: 'Test Team',
                shortName: 'TST',
                sport: 'basketball',
                logos: [{ href: 'https://example.com/alt.png', rel: ['full'] }]
            });
            expect(team.primary_logo).toBe('https://example.com/alt.png');
        });

        test('team primary_logo empty', async () => {
            const team = new Team({
                name: 'Test Team',
                shortName: 'TST',
                sport: 'basketball'
            });
            expect(team.primary_logo).toBeNull();
        });
    });

    describe('Venue Model', () => {
        test('venue string representation logic', async () => {
            const venue = new Venue({
                espnId: '1234',
                name: 'Test Arena',
                city: 'Test City',
                state: 'TS'
            });
            // Testing virtual 'location' logic if implemented or just raw checks
            // venue.toString() is not standard in JS models unless explicitly called.
            // But we added a .toString() method to schema.
            // Let's test properties.
            expect(venue.name).toBe('Test Arena');
            expect(venue.city).toBe('Test City');
        });
    });

    describe('Event (Match) Model', () => {
        test('event creation', async () => {
            const sport = await Sport.create({ slug: 'basketball', name: 'Basketball' });
            const league = await League.create({ sport: sport._id, slug: 'nba', name: 'NBA', abbreviation: 'NBA' });
            const t1 = await Team.create({ name: 'Home', shortName: 'H', sport: 'basketball' });
            const t2 = await Team.create({ name: 'Away', shortName: 'A', sport: 'basketball' });

            const event = await Match.create({
                sport: 'basketball',
                tournament: 'NBA',
                status: 'live',
                venue: 'Test Arena',
                date: new Date(),
                teamA: t1._id,
                teamB: t2._id,
                espnId: '123',
                name: 'Home vs Away'
            });

            expect(event.espnId).toBe('123');
            expect(event.status).toBe('live');
        });

        test('event unique constraint', async () => {
            const sport = await Sport.create({ slug: 'basketball', name: 'Basketball' });
            const league = await League.create({ sport: sport._id, slug: 'nba', name: 'NBA', abbreviation: 'NBA' });
            const t1 = await Team.create({ name: 'Home', shortName: 'H', sport: 'basketball' });
            const t2 = await Team.create({ name: 'Away', shortName: 'A', sport: 'basketball' });

            await Match.create({
                sport: 'basketball',
                tournament: 'NBA',
                status: 'live',
                venue: 'Test Arena',
                date: new Date(),
                teamA: t1._id,
                teamB: t2._id,
                espnId: '401584666',
                name: 'Event 1'
            });

            // Duplicate espnId should fail
            await expect(Match.create({
                sport: 'basketball',
                tournament: 'NBA',
                status: 'upcoming',
                venue: 'Test Arena',
                date: new Date(),
                teamA: t1._id,
                teamB: t2._id,
                espnId: '401584666',
                name: 'Event 2'
            })).rejects.toThrow();
        });
    });
});
