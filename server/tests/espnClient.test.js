const axios = require('axios');
const {
    ESPNClient,
    ESPNEndpointDomain,
    ESPNClientError,
    ESPNNotFoundError,
    ESPNRateLimitError
} = require('../services/espnClient');

jest.mock('axios');

describe('ESPNClient', () => {
    let mockAxiosInstance;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock axios create to return a mocked instance
        mockAxiosInstance = {
            interceptors: {
                response: {
                    use: jest.fn(),
                }
            },
            request: jest.fn(),
            get: jest.fn()
        };

        // When we call axios.create, return our mock instance
        axios.create.mockReturnValue(mockAxiosInstance);

        // We also need to handle the fact that the actual code calls `this.client(config)` for retries
        // This means the mock instance itself needs to be callable or we mock the implementation differently.
        // However, axios.create returns a function that also has properties.
        const mockFn = jest.fn();
        Object.assign(mockFn, mockAxiosInstance);
        axios.create.mockReturnValue(mockFn);
        mockAxiosInstance = mockFn;
    });

    test('client initialization with default settings', () => {
        const client = new ESPNClient();
        expect(client.site_api_url).toBe("https://site.api.espn.com");
        expect(client.core_api_url).toBe("https://sports.core.api.espn.com");
        expect(client.timeout).toBe(5000);
        expect(client.max_retries).toBe(1);
    });

    test('client custom initialization', () => {
        const client = new ESPNClient({
            site_api_url: "https://custom.api.com",
            timeout: 60000,
            max_retries: 5
        });
        expect(client.site_api_url).toBe("https://custom.api.com");
        expect(client.timeout).toBe(60000);
        expect(client.max_retries).toBe(5);
    });

    test('build_url site domain', () => {
        const client = new ESPNClient();
        const url = client._build_url(
            ESPNEndpointDomain.SITE,
            "/apis/site/v2/sports/basketball/nba/scoreboard"
        );
        expect(url).toBe("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard");
    });

    test('build_url core domain', () => {
        const client = new ESPNClient();
        const url = client._build_url(
            ESPNEndpointDomain.CORE,
            "/v2/sports/basketball/leagues/nba"
        );
        expect(url).toBe("https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba");
    });

    test('get_scoreboard success', async () => {
        const mockResponse = {
            data: {
                events: [{ id: "123", name: "Test Game" }]
            }
        };

        // Setup mock response
        mockAxiosInstance.request.mockResolvedValue(mockResponse);

        const client = new ESPNClient();
        const response = await client.get_scoreboard("basketball", "nba", "20241215");

        expect(response.is_success).toBe(true);
        expect(response.data).toEqual(mockResponse.data);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
            url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
            params: { dates: "20241215" }
        }));
    });

    test('get_scoreboard with Date object', async () => {
        const mockResponse = { data: { events: [] } };
        mockAxiosInstance.request.mockResolvedValue(mockResponse);

        const client = new ESPNClient();
        const date = new Date(2024, 11, 15); // Month is 0-indexed: 11 = Dec
        await client.get_scoreboard("basketball", "nba", date);

        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
            params: { dates: "20241215" }
        }));
    });

    test('get_teams success', async () => {
        const mockResponse = {
            data: {
                sports: [{ leagues: [{ teams: [{ id: "1", name: "Test Team" }] }] }]
            }
        };
        mockAxiosInstance.request.mockResolvedValue(mockResponse);

        const client = new ESPNClient();
        const response = await client.get_teams("basketball", "nba");

        expect(response.is_success).toBe(true);
        expect(response.data).toEqual(mockResponse.data);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
            url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams",
            params: { limit: 100 }
        }));
    });

    test('get_team success', async () => {
        const mockResponse = { data: { team: { id: "1", name: "Atlanta Hawks" } } };
        mockAxiosInstance.request.mockResolvedValue(mockResponse);

        const client = new ESPNClient();
        const response = await client.get_team("basketball", "nba", "1");

        expect(response.is_success).toBe(true);
        expect(response.data.team.id).toBe("1");
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
            url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/1"
        }));
    });

    test('handle 404 response', async () => {
        const error = {
            response: { status: 404, statusText: 'Not Found' },
            message: 'Request failed'
        };
        mockAxiosInstance.request.mockRejectedValue(error);

        const client = new ESPNClient();
        await expect(client.get_team("basketball", "nba", "999"))
            .rejects.toThrow(ESPNNotFoundError);
    });

    test('handle 429 response', async () => {
        const error = {
            response: { status: 429, statusText: 'Too Many Requests' },
            message: 'Rate limit'
        };
        mockAxiosInstance.request.mockRejectedValue(error);

        const client = new ESPNClient();
        await expect(client.get_scoreboard("basketball", "nba"))
            .rejects.toThrow(ESPNRateLimitError);
    });

    test('handle 500 response', async () => {
        const error = {
            response: { status: 500, statusText: 'Server Error' },
            message: 'Internal Server Error'
        };
        mockAxiosInstance.request.mockRejectedValue(error);

        const client = new ESPNClient();
        await expect(client.get_scoreboard("basketball", "nba"))
            .rejects.toThrow(ESPNClientError);
    });
});
