const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
    // 1. Test root endpoint
    it('GET / - Should return server running message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Cineverse TMDB Server is running');
    });

    // 2. Test /movies endpoint
    it('GET /movies - Should return popular movies', async () => {
        // We mock process.env for tests, or testing standard behavior
        // Since we are not actually mock matching tmdb fetch here, it might fail without TMDB_BEARER_TOKEN or with rate limits based on user's real env, but since we are showing "basic API tests" we can write simple ones. 
        // A better approach for CI without API keys is to mock node-fetch (or global fetch) if possible. Let's write the test so it doesn't try actual network requests or we mock them.
        
        // Temporarily override global fetch to prevent actual TMDB network calls
        const originalFetch = global.fetch;
        global.fetch = jest.fn(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    page: 1,
                    total_pages: 5,
                    total_results: 100,
                    results: [{ id: 1, title: 'Mock Movie' }]
                })
            })
        );
        
        const res = await request(app).get('/movies');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('results');
        expect(res.body.results[0].title).toBe('Mock Movie');
        
        // Restore global fetch
        global.fetch = originalFetch;
    });

    // 3. Test /search endpoint
    it('GET /search - Should return error without title param', async () => {
        const res = await request(app).get('/search');
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Please provide title parameter');
    });
});
