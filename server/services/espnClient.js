const axios = require('axios');

class ESPNClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'ESPNClientError';
        this.statusCode = statusCode;
    }
}

class ESPNNotFoundError extends ESPNClientError {
    constructor(message) {
        super(message, 404);
        this.name = 'ESPNNotFoundError';
    }
}

class ESPNRateLimitError extends ESPNClientError {
    constructor(message) {
        super(message, 429);
        this.name = 'ESPNRateLimitError';
    }
}

const ESPNEndpointDomain = {
    SITE: 'SITE',
    CORE: 'CORE'
};

class ESPNClient {
    constructor(options = {}) {
        this.site_api_url = options.site_api_url || "https://site.api.espn.com";
        this.core_api_url = options.core_api_url || "https://sports.core.api.espn.com";
        this.timeout = options.timeout || 5000; // 5.0s in Python -> 5000ms
        this.max_retries = options.max_retries !== undefined ? options.max_retries : 1;

        this.client = axios.create({
            timeout: this.timeout
        });

        // Add retry interceptor
        this.client.interceptors.response.use(null, async (error) => {
            const config = error.config;

            // If config does not exist or the retry option is not set, reject
            if (!config || !this.max_retries) {
                return Promise.reject(error);
            }

            // Set the variable for keeping track of the retry count
            config.__retryCount = config.__retryCount || 0;

            // Check if we've maxed out the total number of retries
            if (config.__retryCount >= this.max_retries) {
                return Promise.reject(error);
            }

            // Increase the retry count
            config.__retryCount += 1;

            // Create new promise to handle exponential backoff
            const backoff = new Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, 100); // Simple 100ms delay for now, Python test doesn't specify backoff strategy
            });

            // Return the promise in which recalls axios to retry the request
            await backoff;
            return this.client(config);
        });
    }

    _build_url(domain, path) {
        const baseUrl = domain === ESPNEndpointDomain.SITE ? this.site_api_url : this.core_api_url;
        // Ensure path starts with / logic? Python: client._build_url(..., "/apis/...")
        // If path has leading slash, join correctly.
        // Simple string concat as per Python test expectation
        return `${baseUrl}${path}`;
    }

    async _request(method, url, params = {}) {
        try {
            const response = await this.client.request({
                method,
                url,
                params
            });
            return { is_success: true, data: response.data };
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 404) {
                    throw new ESPNNotFoundError(`Resource not found: ${url}`);
                }
                if (status === 429) {
                    throw new ESPNRateLimitError(`Rate limit exceeded: ${url}`);
                }
                throw new ESPNClientError(`Request failed with status ${status}: ${error.message}`, status);
            } else if (error.request) {
                // Network error (no response received)
                throw new ESPNClientError(`Network error: ${error.message}`, 0);
            } else {
                throw new ESPNClientError(`Error setting up request: ${error.message}`, 0);
            }
        }
    }

    async get_scoreboard(sport, league, date = null) {
        const url = this._build_url(ESPNEndpointDomain.SITE, `/apis/site/v2/sports/${sport}/${league}/scoreboard`);
        const params = {};
        if (date) {
            if (date instanceof Date) {
                // Format YYYYMMDD
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                params.dates = `${yyyy}${mm}${dd}`;
            } else {
                params.dates = date;
            }
        }
        return this._request('GET', url, params);
    }

    async get_teams(sport, league) {
        const url = this._build_url(ESPNEndpointDomain.SITE, `/apis/site/v2/sports/${sport}/${league}/teams`);
        return this._request('GET', url, { limit: 100 });
    }

    async get_team(sport, league, teamId) {
        const url = this._build_url(ESPNEndpointDomain.SITE, `/apis/site/v2/sports/${sport}/${league}/teams/${teamId}`);
        return this._request('GET', url);
    }

    async get_event(sport, league, eventId) {
        const url = this._build_url(ESPNEndpointDomain.SITE, `/apis/site/v2/sports/${sport}/${league}/summary`);
        return this._request('GET', url, { event: eventId });
    }

    async get_league_info(sport, league) {
        const url = this._build_url(ESPNEndpointDomain.CORE, `/v2/sports/${sport}/leagues/${league}`);
        return this._request('GET', url);
    }
}

module.exports = {
    ESPNClient,
    ESPNEndpointDomain,
    ESPNClientError,
    ESPNNotFoundError,
    ESPNRateLimitError
};
