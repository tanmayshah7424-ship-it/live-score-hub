const mongoose = require('mongoose');
const {
    IngestionResult,
    get_or_create_sport_and_league,
    TeamIngestionService,
    ScoreboardIngestionService
} = require('../services/ingestService');
const Sport = require('../models/Sport');
const League = require('../models/League');
const Team = require('../models/Team');
const Match = require('../models/Match'); // Event in Python
const { mockTeamsResponse, mockScoreboardResponse } = require('./fixtures/mockData');
const { ESPNClient } = require('../services/espnClient');

// Mock ESPNClient
jest.mock('../services/espnClient');

const { app, server, connectDB } = require('../server');
const request = require('supertest');

describe('Ingestion Services', () => {
    let mockClient;

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
        await Match.deleteMany({});

        // Reset mocks
        mockClient = new ESPNClient();
        mockClient.get_teams = jest.fn();
        mockClient.get_scoreboard = jest.fn();
    });

    describe('get_or_create_sport_and_league', () => {
        test('creates new sport and league', async () => {
            const { sport, league } = await get_or_create_sport_and_league('basketball', 'nba');

            expect(sport.slug).toBe('basketball');
            expect(sport.name).toBe('Basketball');
            expect(league.slug).toBe('nba');
            expect(league.name).toBe('NBA');
            expect(league.abbreviation).toBe('NBA');
            expect(league.sport.toString()).toBe(sport._id.toString());
        });

        test('reuses existing sport and league', async () => {
            const { sport: s1, league: l1 } = await get_or_create_sport_and_league('basketball', 'nba');
            const { sport: s2, league: l2 } = await get_or_create_sport_and_league('basketball', 'nba');

            expect(s1._id.toString()).toBe(s2._id.toString());
            expect(l1._id.toString()).toBe(l2._id.toString());
        });

        test('creates different leagues for same sport', async () => {
            const { league: nba } = await get_or_create_sport_and_league('basketball', 'nba');
            const { league: wnba } = await get_or_create_sport_and_league('basketball', 'wnba');

            expect(nba.sport.toString()).toBe(wnba.sport.toString());
            expect(nba._id.toString()).not.toBe(wnba._id.toString());
        });
    });

    describe('TeamIngestionService', () => {
        test('ingest_teams success', async () => {
            // Mock response
            mockClient.get_teams.mockResolvedValue({ is_success: true, data: mockTeamsResponse });

            const service = new TeamIngestionService(mockClient);
            const result = await service.ingest_teams('basketball', 'nba');

            expect(result.created).toBe(2);
            expect(result.updated).toBe(0);
            expect(result.errors).toBe(0);

            // Verify teams created
            const teams = await Team.find({});
            expect(teams.length).toBe(2);

            const atl = await Team.findOne({ cricApiId: '1' });
            expect(atl).toBeTruthy();
            expect(atl.shortName).toBe('Hawks');
            expect(atl.displayName).toBe('Atlanta Hawks');
        });

        test('ingest_teams updates existing', async () => {
            // Create existing team
            const { league } = await get_or_create_sport_and_league('basketball', 'nba');
            await Team.create({
                name: 'Old Name',
                shortName: 'OLD',
                sport: 'basketball',
                cricApiId: '1',
                abbreviation: 'OLD',
                displayName: 'Old Display Name'
            });

            mockClient.get_teams.mockResolvedValue({ is_success: true, data: mockTeamsResponse });

            const service = new TeamIngestionService(mockClient);
            const result = await service.ingest_teams('basketball', 'nba');

            expect(result.created).toBe(1); // Boston is new
            expect(result.updated).toBe(1); // ATL is updated

            const atl = await Team.findOne({ cricApiId: '1' });
            expect(atl.displayName).toBe('Atlanta Hawks');
        });
    });

    describe('ScoreboardIngestionService', () => {
        test('ingest_scoreboard success', async () => {
            // Pre-create teams
            const { league } = await get_or_create_sport_and_league('basketball', 'nba');
            await Team.create({ cricApiId: '1', name: 'Hawks', shortName: 'ATL', sport: 'basketball', abbreviation: 'ATL', displayName: 'Atlanta Hawks' });
            await Team.create({ cricApiId: '2', name: 'Celtics', shortName: 'BOS', sport: 'basketball', abbreviation: 'BOS', displayName: 'Boston Celtics' });

            mockClient.get_scoreboard.mockResolvedValue({ is_success: true, data: mockScoreboardResponse });

            const service = new ScoreboardIngestionService(mockClient);
            const result = await service.ingest_scoreboard('basketball', 'nba', '20241215');

            expect(result.created).toBe(1);
            expect(result.errors).toBe(0);

            const match = await Match.findOne({ espnId: '401584666' });
            expect(match).toBeTruthy();
            expect(match.name).toBe('Atlanta Hawks at Boston Celtics');
            expect(match.summary).toBe('Atlanta Hawks at Boston Celtics'); // Mapped summary to name
            expect(match.status).toBe('completed');
            expect(match.venue).toBe('TD Garden');

            // Verify competitors/scores
            expect(match.scoreA).toBe('115'); // Home (BOS) -> teamA logic
            expect(match.scoreB).toBe('108'); // Away (ATL) -> teamB logic
        });

        test('ingest_scoreboard creates missing teams', async () => {
            mockClient.get_scoreboard.mockResolvedValue({ is_success: true, data: mockScoreboardResponse });

            const service = new ScoreboardIngestionService(mockClient);
            const result = await service.ingest_scoreboard('basketball', 'nba', '20241215');

            expect(result.created).toBe(1);

            // Verify teams created
            const count = await Team.countDocuments();
            expect(count).toBe(2);
        });

        test('ingest_scoreboard updates existing event', async () => {
            const { league } = await get_or_create_sport_and_league('basketball', 'nba');
            // Create teams
            const t1 = await Team.create({ cricApiId: '1', name: 'Hawks', shortName: 'ATL', sport: 'basketball', abbreviation: 'ATL', displayName: 'Atlanta Hawks' });
            const t2 = await Team.create({ cricApiId: '2', name: 'Celtics', shortName: 'BOS', sport: 'basketball', abbreviation: 'BOS', displayName: 'Boston Celtics' });

            // Create existing match
            await Match.create({
                sport: 'basketball',
                tournament: 'NBA',
                status: 'upcoming',
                venue: 'Old Venue',
                date: new Date('2024-12-15T19:30:00Z'),
                teamA: t1._id,
                teamB: t2._id,
                espnId: '401584666',
                name: 'Old Name'
            });

            mockClient.get_scoreboard.mockResolvedValue({ is_success: true, data: mockScoreboardResponse });

            const service = new ScoreboardIngestionService(mockClient);
            const result = await service.ingest_scoreboard('basketball', 'nba', '20241215');

            expect(result.created).toBe(0);
            expect(result.updated).toBe(1);

            const match = await Match.findOne({ espnId: '401584666' });
            expect(match.name).toBe('Atlanta Hawks at Boston Celtics');
            expect(match.status).toBe('completed');
        });
    });
});
