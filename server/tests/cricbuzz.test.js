const request = require('supertest');
const express = require('express');
const cricbuzzRouter = require('../routes/cricbuzz');
const cricbuzzService = require('../services/cricbuzzService');

// Mock the service to avoid actual API calls during test (unless we want integration test)
// For this test, let's verify the route->controller->service wiring works.
jest.mock('../services/cricbuzzService');

const app = express();
app.use(express.json());
app.use('/api/cricbuzz', cricbuzzRouter);

describe('Cricbuzz API Routes', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /matches/live should return live matches', async () => {
        const mockData = {
            typeMatches: [
                { matchType: 'T20', seriesMatches: [{ seriesAdWrapper: { matches: [{ matchInfo: { team1: { teamName: 'India' }, team2: { teamName: 'Australia' } } }] } }] }
            ]
        };

        cricbuzzService.getLiveMatches.mockResolvedValue({ data: mockData });

        const res = await request(app).get('/api/cricbuzz/matches/live');

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toEqual(mockData);
        expect(cricbuzzService.getLiveMatches).toHaveBeenCalled();
    });

    test('GET /matches/upcoming should handle service errors gracefully', async () => {
        cricbuzzService.getUpcomingMatches.mockResolvedValue({ error: 'API Error' });

        const res = await request(app).get('/api/cricbuzz/matches/upcoming');

        expect(res.statusCode).toBe(500);
        expect(res.body.status).toBe('error');
        expect(res.body.message).toBe('API Error');
    });

});
