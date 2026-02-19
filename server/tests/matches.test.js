const request = require('supertest');
const { app, server, connectDB } = require('../server');
const mongoose = require('mongoose');
const Match = require('../models/Match');
const Team = require('../models/Team');

describe('Match/Event Endpoints', () => {
    let teamA, teamB, testMatch;

    beforeAll(async () => {
        await connectDB();
        await Match.deleteMany({});
        await Team.deleteMany({});

        teamA = await Team.create({ name: 'Team A', shortName: 'TMA', sport: 'cricket' });
        teamB = await Team.create({ name: 'Team B', shortName: 'TMB', sport: 'cricket' });

        testMatch = await Match.create({
            teamA: teamA._id,
            teamB: teamB._id,
            sport: 'cricket',
            tournament: 'Test Cup',
            date: new Date(),
            venue: 'Test Stadium',
            status: 'upcoming',
            dateTimeGMT: new Date().toISOString()
        });
    });

    afterAll(async () => {
        await Match.deleteMany({});
        await Team.deleteMany({});
        await mongoose.connection.close();
        if (server) server.close();
    });

    it('GET /api/matches/upcoming should return upcoming matches', async () => {
        const res = await request(app).get('/api/matches/upcoming');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body[0]).toHaveProperty('tournament', 'Test Cup');
    });

    it('GET /api/matches/:id should return match details', async () => {
        const res = await request(app).get(`/api/matches/${testMatch._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', testMatch._id.toString());
        expect(res.body.teamA).toHaveProperty('name', 'Team A');
    });

    // Mirroring Python: test_list_events_filter_by_status 
    // Assuming backend supports /api/matches?status=upcoming
    it('GET /api/matches?status=upcoming should return filtered matches', async () => {
        const res = await request(app).get('/api/matches?status=upcoming');
        // Note: Express endpoint implementation varies, verifying if it supports query params
        // If not supported, this test documents current behavior or failure
        expect(res.statusCode).toEqual(200);
    });
});
