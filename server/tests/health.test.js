const request = require('supertest');
const { app, server, connectDB } = require('../server');
const mongoose = require('mongoose');

describe('Health Check Endpoint', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        if (server) server.close();
    });

    it('GET /api/health should return ok status', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('time');
    });
});
