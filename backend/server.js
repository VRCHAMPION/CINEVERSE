const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()

app.use(helmet())

app.use(cors({
    origin: ['https://cineverse040406.netlify.app', 'http://localhost:3000'],
    methods: ['GET'],
}))

app.use(express.json())

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later." }
})

const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: { error: "Too many search requests, slow down." }
})

app.use(limiter)

// ===== TMDB CONFIG =====
const TMDB_BASE = 'https://api.themoviedb.org/3'

function tmdbHeaders() {
    return {
        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
    }
}

async function tmdbFetch(path) {
    const res = await fetch(`${TMDB_BASE}${path}`, { headers: tmdbHeaders() })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.status_message || 'TMDB error')
    }
    return res.json()
}

// ===== INPUT VALIDATION =====
function validatePage(page) {
    const p = parseInt(page)
    return (!isNaN(p) && p > 0 && p <= 1000) ? p : 1
}

function validateId(id) {
    return /^\d+$/.test(id)
}

// ===== HOME =====
app.get('/', (req, res) => {
    res.send('Cineverse TMDB Server is running 🚀')
})

// ===== TRENDING =====
// Replaces: GET /trending (was top-rated from Supabase)
// Now: real weekly trending from TMDB
app.get('/trending', async (req, res) => {
    try {
        const data = await tmdbFetch('/trending/all/week?language=en-US')
        res.json({ results: data.results })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error fetching trending' })
    }
})

// ===== ALL MOVIES (home) =====
// Replaces: GET /movies (was paginated Supabase query)
// Now: TMDB popular movies with sort support
app.get('/movies', async (req, res) => {
    const page = validatePage(req.query.page)
    const sort = req.query.sort || 'default'

    let endpoint = '/movie/popular'
    if (sort === 'rating') endpoint = '/movie/top_rated'
    else if (sort === 'year_desc' || sort === 'year_asc') endpoint = '/discover/movie?' + new URLSearchParams({
        sort_by: sort === 'year_desc' ? 'primary_release_date.desc' : 'primary_release_date.asc',
        page
    })

    try {
        const path = endpoint.includes('?')
            ? `${endpoint}&page=${page}&language=en-US`
            : `${endpoint}?page=${page}&language=en-US`
        const data = await tmdbFetch(path)
        res.json({
            page: data.page,
            totalPages: Math.min(data.total_pages, 500),
            totalResults: data.total_results,
            results: data.results
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error fetching movies' })
    }
})

// ===== MOVIES BY TYPE =====
// Replaces: GET /movies/type (was movie + tvMovie from Supabase)
// Now: TMDB discover movies only
app.get('/movies/type', async (req, res) => {
    const page = validatePage(req.query.page)
    const sort = req.query.sort || 'default'

    const sortMap = {
        rating: 'vote_average.desc',
        year_desc: 'primary_release_date.desc',
        year_asc: 'primary_release_date.asc',
        title: 'title.asc',
        default: 'popularity.desc'
    }

    const sortBy = sortMap[sort] || 'popularity.desc'

    try {
        const data = await tmdbFetch(
            `/discover/movie?sort_by=${sortBy}&vote_count.gte=100&page=${page}&language=en-US`
        )
        res.json({
            page: data.page,
            totalPages: Math.min(data.total_pages, 500),
            totalResults: data.total_results,
            results: data.results
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error fetching movies' })
    }
})

// ===== SERIES =====
// Replaces: GET /series (was tvSeries + tvMiniSeries from Supabase)
// Now: TMDB discover TV
app.get('/series', async (req, res) => {
    const page = validatePage(req.query.page)
    const sort = req.query.sort || 'default'

    const sortMap = {
        rating: 'vote_average.desc',
        year_desc: 'first_air_date.desc',
        year_asc: 'first_air_date.asc',
        title: 'name.asc',
        default: 'popularity.desc'
    }

    const sortBy = sortMap[sort] || 'popularity.desc'

    try {
        const data = await tmdbFetch(
            `/discover/tv?sort_by=${sortBy}&vote_count.gte=100&page=${page}&language=en-US`
        )
        res.json({
            page: data.page,
            totalPages: Math.min(data.total_pages, 500),
            totalResults: data.total_results,
            results: data.results
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error fetching series' })
    }
})

// ===== SEARCH =====
// Replaces: GET /search?title= (was ILIKE query on Supabase)
// Now: TMDB multi-search (movies + TV + people)
app.get('/search', searchLimiter, async (req, res) => {
    const query = req.query.title
    const page = validatePage(req.query.page)

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Please provide title parameter' })
    }

    if (query.length > 100) {
        return res.status(400).json({ error: 'Search query too long' })
    }

    try {
        const data = await tmdbFetch(
            `/search/multi?query=${encodeURIComponent(query)}&page=${page}&language=en-US&include_adult=false`
        )
        res.json({
            search: query,
            page: data.page,
            totalPages: Math.min(data.total_pages, 500),
            totalResults: data.total_results,
            results: data.results.filter(r => r.media_type !== 'person')
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Search failed' })
    }
})

// ===== FILTER =====
// Replaces: GET /filter?year=&rating=&genre=&sort= (was SQL WHERE on Supabase)
// Now: TMDB discover with filters
app.get('/filter', async (req, res) => {
    const page = validatePage(req.query.page)
    const year = parseInt(req.query.year) || 2010
    const rating = parseFloat(req.query.rating) || 0
    const genreId = req.query.genre_id ? parseInt(req.query.genre_id) : null
    const type = req.query.type || 'movie'
    const sort = req.query.sort || 'rating'

    const sortMap = {
        rating: 'vote_average.desc',
        year_desc: type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc',
        year_asc: type === 'movie' ? 'primary_release_date.asc' : 'first_air_date.asc',
        title: type === 'movie' ? 'title.asc' : 'name.asc',
        default: 'popularity.desc'
    }

    const sortBy = sortMap[sort] || 'vote_average.desc'
    const dateField = type === 'movie' ? 'primary_release_date' : 'first_air_date'
    const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie'

    let params = new URLSearchParams({
        sort_by: sortBy,
        [`${dateField}.gte`]: `${year}-01-01`,
        'vote_average.gte': rating,
        'vote_count.gte': 50,
        page,
        language: 'en-US'
    })

    if (genreId) params.append('with_genres', genreId)

    try {
        const data = await tmdbFetch(`${endpoint}?${params.toString()}`)
        res.json({
            page: data.page,
            totalPages: Math.min(data.total_pages, 500),
            totalResults: data.total_results,
            results: data.results
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Filter failed' })
    }
})

// ===== GENRES =====
// Replaces: GET /genres (was DISTINCT UNNEST from Supabase)
// Now: TMDB official genre list
app.get('/genres', async (req, res) => {
    const type = req.query.type || 'movie'
    try {
        const data = await tmdbFetch(`/genre/${type}/list?language=en-US`)
        res.json(data.genres)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error fetching genres' })
    }
})

// ===== DETAILS =====
// Replaces: GET /details/:tconst (was JOIN on Supabase)
// Now: TMDB full detail with credits, videos, watch providers, recommendations
app.get('/details/:id', async (req, res) => {
    const { id } = req.params
    const type = req.query.type || 'movie'

    if (!validateId(id)) {
        return res.status(400).json({ error: 'Invalid ID format' })
    }

    try {
        const data = await tmdbFetch(
            `/${type}/${id}?append_to_response=credits,videos,watch/providers,recommendations,similar&language=en-US`
        )
        res.json(data)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error fetching details' })
    }
})

// ===== NOW PLAYING =====
// New route — was not possible with static IMDb TSV data
app.get('/movies/now-playing', async (req, res) => {
    const page = validatePage(req.query.page)
    try {
        const data = await tmdbFetch(`/movie/now_playing?page=${page}&language=en-US`)
        res.json({
            page: data.page,
            totalPages: Math.min(data.total_pages, 500),
            totalResults: data.total_results,
            results: data.results
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error fetching now playing' })
    }
})

// ===== UPCOMING =====
// New route — was not possible with static IMDb TSV data
app.get('/movies/upcoming', async (req, res) => {
    const page = validatePage(req.query.page)
    try {
        const data = await tmdbFetch(`/movie/upcoming?page=${page}&language=en-US`)
        res.json({
            page: data.page,
            totalPages: Math.min(data.total_pages, 500),
            totalResults: data.total_results,
            results: data.results
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error fetching upcoming' })
    }
})

// ===== SERVER START =====
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Cineverse TMDB server started on port ${PORT} 🚀`)
})