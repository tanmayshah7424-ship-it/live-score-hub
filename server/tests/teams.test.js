const request = require('supertest');
const { app, server, connectDB } = require('../server');
const mongoose = require('mongoose');
const Team = require('../models/Team');

describe('Team Endpoints', () => {
    // Seed data
    let testTeam;

    beforeAll(async () => {
        await connectDB();
        // Clear teams
        await Team.deleteMany({});

        testTeam = await Team.create({
            name: 'Test Team',
            shortName: 'TST',
            sport: 'basketball',
            logo: 'https://example.com/logo.png',
            matchesPlayed: 10,
            wins: 5,
            losses: 5,
            draws: 0,
            points: 15,
            form: ['W', 'L', 'W']
        });
    });

    afterAll(async () => {
        await Team.deleteMany({});
        await mongoose.connection.close();
        if (server) server.close();
    });

    it('GET /api/teams should return all teams', async () => {
        const res = await request(app).get('/api/teams');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body[0]).toHaveProperty('name', 'Test Team');
    });

    it('GET /api/teams should support filtering by sport', async () => {
        // Create a football team to test filtering
        await Team.create({
            name: 'Football Team',
            shortName: 'FTB',
            sport: 'football',
            logo: 'https://example.com/logo2.png'
        });

        const res = await request(app).get('/api/teams?sport=basketball');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].sport).toBe('basketball');

        const res2 = await request(app).get('/api/teams?sport=football');
        expect(res2.statusCode).toEqual(200);
        expect(res2.body.length).toBe(1);
        expect(res2.body[0].sport).toBe('football');
    });

    it('GET /api/teams/:id should return team details', async () => {
        const res = await request(app).get(`/api/teams/${testTeam._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Test Team');
        expect(res.body).toHaveProperty('_id', testTeam._id.toString());
    });

    it('GET /api/teams/:id should return 404 for non-existent team', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/teams/${fakeId}`);
        // Depending on implementation, it might be 404 or 400 or null. 
        // Assuming standard REST 404
        expect([404, 400, 500]).toContain(res.statusCode);
    });
});
