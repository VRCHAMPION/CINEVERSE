const express = require('express')
const cors = require('cors')
const db = require('./db')

const app = express()

app.use(cors())
app.use(express.json())

// ===== EXCLUDED TYPES =====
const EXCLUDED = `titletype NOT IN ('tvEpisode', 'tvShort', 'short', 'videoGame', 'tvPilot')`

// ================= HOME =================
app.get("/", (req,res)=>{
    res.send("Server is running 🚀")
})

// ================= MOVIES =================
app.get("/movies", async (req,res)=>{
    const page = parseInt(req.query.page) || 1
    const sort = req.query.sort || "default"
    const limit = 20
    const offset = (page - 1) * limit

    let orderBy = ""
    if(sort === "rating") orderBy = "ORDER BY r.averagerating DESC"
    else if(sort === "year_desc") orderBy = "ORDER BY t.startyear DESC"
    else if(sort === "year_asc") orderBy = "ORDER BY t.startyear ASC"
    else if(sort === "title") orderBy = "ORDER BY t.primarytitle ASC"

    try{
        const countResult = await db.query(
            `SELECT COUNT(*) FROM titles WHERE ${EXCLUDED}`
        )
        const total = parseInt(countResult.rows[0].count)

        let query
        if(sort === "rating"){
            query = `SELECT t.tconst, t.primarytitle, t.startyear, r.averagerating
                     FROM titles t
                     LEFT JOIN ratings r ON t.tconst = r.tconst
                     WHERE t.${EXCLUDED}
                     ${orderBy}
                     LIMIT $1 OFFSET $2`
        } else {
            query = `SELECT tconst, primarytitle, startyear
                     FROM titles
                     WHERE ${EXCLUDED}
                     ${orderBy}
                     LIMIT $1 OFFSET $2`
        }

        const result = await db.query(query, [limit, offset])

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            results: result.rows
        })
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:"Error fetching movies"})
    }
})

// ================= SEARCH =================
app.get("/search", async (req,res)=>{
    const title = req.query.title
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const offset = (page - 1) * limit

    if(!title){
        return res.status(400).json({error:"Please provide title parameter"})
    }

    try{
        const countResult = await db.query(
            `SELECT COUNT(*) FROM titles
             WHERE primarytitle ILIKE $1
             AND ${EXCLUDED}`,
            [`%${title}%`]
        )
        const total = parseInt(countResult.rows[0].count)

        const result = await db.query(
            `SELECT tconst, primarytitle, startyear
             FROM titles
             WHERE primarytitle ILIKE $1
             AND ${EXCLUDED}
             LIMIT $2 OFFSET $3`,
            [`%${title}%`, limit, offset]
        )

        res.json({
            search: title,
            page,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            results: result.rows
        })
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:"Search failed"})
    }
})

// ================= FILTER + PAGINATION =================
app.get("/filter", async (req,res)=>{
    const year = parseInt(req.query.year) || 0
    const rating = parseFloat(req.query.rating) || 0
    const genre = req.query.genre || ""
    const sort = req.query.sort || "rating"
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const offset = (page - 1) * limit

    let conditions = ["t.startyear >= $1", "r.averagerating >= $2",
        `t.titletype NOT IN ('tvEpisode', 'tvShort', 'short', 'videoGame', 'tvPilot')`]
    let params = [year, rating]

    if(genre){
        params.push(`%${genre}%`)
        conditions.push(`t.genre ILIKE $${params.length}`)
    }

    let orderBy = "ORDER BY r.averagerating DESC"
    if(sort === "year_desc") orderBy = "ORDER BY t.startyear DESC"
    else if(sort === "year_asc") orderBy = "ORDER BY t.startyear ASC"
    else if(sort === "title") orderBy = "ORDER BY t.primarytitle ASC"

    const whereClause = "WHERE " + conditions.join(" AND ")

    try{
        const countResult = await db.query(
            `SELECT COUNT(*)
             FROM titles t
             JOIN ratings r ON t.tconst = r.tconst
             ${whereClause}`,
            params
        )
        const total = parseInt(countResult.rows[0].count)

        const result = await db.query(
            `SELECT t.tconst, t.primarytitle, t.startyear, r.averagerating
             FROM titles t
             JOIN ratings r ON t.tconst = r.tconst
             ${whereClause}
             ${orderBy}
             LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        )

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            results: result.rows
        })
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:"Filter failed"})
    }
})

// ================= TRENDING =================
app.get("/trending", async (req,res)=>{
    try{
        const result = await db.query(
            `SELECT t.tconst, t.primarytitle, t.startyear, r.averagerating
             FROM titles t
             JOIN ratings r ON t.tconst = r.tconst
             WHERE r.numvotes >= 10000
             AND t.startyear >= 2015
             AND t.titletype IN ('movie', 'tvMovie', 'tvSeries', 'tvMiniSeries')
             ORDER BY r.averagerating DESC
             LIMIT 10`
        )
        res.json({ results: result.rows })
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:"Error fetching trending"})
    }
})

// ================= MOVIES BY TYPE =================
app.get("/movies/type", async (req,res)=>{
    const page = parseInt(req.query.page) || 1
    const sort = req.query.sort || "default"
    const limit = 20
    const offset = (page - 1) * limit

    let orderBy = ""
    if(sort === "rating") orderBy = "ORDER BY r.averagerating DESC"
    else if(sort === "year_desc") orderBy = "ORDER BY t.startyear DESC"
    else if(sort === "year_asc") orderBy = "ORDER BY t.startyear ASC"
    else if(sort === "title") orderBy = "ORDER BY t.primarytitle ASC"

    try{
        const countResult = await db.query(
            `SELECT COUNT(*) FROM titles WHERE titletype IN ('movie', 'tvMovie')`
        )
        const total = parseInt(countResult.rows[0].count)

        let query
        if(sort === "rating"){
            query = `SELECT t.tconst, t.primarytitle, t.startyear, r.averagerating
                     FROM titles t
                     LEFT JOIN ratings r ON t.tconst = r.tconst
                     WHERE t.titletype IN ('movie', 'tvMovie')
                     ${orderBy}
                     LIMIT $1 OFFSET $2`
        } else {
            query = `SELECT tconst, primarytitle, startyear
                     FROM titles
                     WHERE titletype IN ('movie', 'tvMovie')
                     ${orderBy}
                     LIMIT $1 OFFSET $2`
        }

        const result = await db.query(query, [limit, offset])

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            results: result.rows
        })
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:"Error fetching movies"})
    }
})

// ================= SERIES BY TYPE =================
app.get("/series", async (req,res)=>{
    const page = parseInt(req.query.page) || 1
    const sort = req.query.sort || "default"
    const limit = 20
    const offset = (page - 1) * limit

    let orderBy = ""
    if(sort === "rating") orderBy = "ORDER BY r.averagerating DESC"
    else if(sort === "year_desc") orderBy = "ORDER BY t.startyear DESC"
    else if(sort === "year_asc") orderBy = "ORDER BY t.startyear ASC"
    else if(sort === "title") orderBy = "ORDER BY t.primarytitle ASC"

    try{
        const countResult = await db.query(
            `SELECT COUNT(*) FROM titles WHERE titletype IN ('tvSeries', 'tvMiniSeries')`
        )
        const total = parseInt(countResult.rows[0].count)

        let query
        if(sort === "rating"){
            query = `SELECT t.tconst, t.primarytitle, t.startyear, r.averagerating
                     FROM titles t
                     LEFT JOIN ratings r ON t.tconst = r.tconst
                     WHERE t.titletype IN ('tvSeries', 'tvMiniSeries')
                     ${orderBy}
                     LIMIT $1 OFFSET $2`
        } else {
            query = `SELECT tconst, primarytitle, startyear
                     FROM titles
                     WHERE titletype IN ('tvSeries', 'tvMiniSeries')
                     ${orderBy}
                     LIMIT $1 OFFSET $2`
        }

        const result = await db.query(query, [limit, offset])

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            results: result.rows
        })
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:"Error fetching series"})
    }
})

// ================= MOVIE DETAILS =================
app.get("/details/:tconst", async (req,res)=>{
    try{
        const { tconst } = req.params
        const result = await db.query(
            `SELECT t.primarytitle, t.startyear, t.runtimeminutes,
                    t.genre, t.titletype, r.averagerating, r.numvotes
             FROM titles t
             LEFT JOIN ratings r ON t.tconst = r.tconst
             WHERE t.tconst = $1`,
            [tconst]
        )
        if(result.rows.length === 0){
            return res.status(404).json({error:"Title not found"})
        }
        res.json(result.rows[0])
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:"Error fetching details"})
    }
})

// ================= GENRES =================
app.get("/genres", async (req,res)=>{
    try{
        const result = await db.query(
            `SELECT DISTINCT UNNEST(STRING_TO_ARRAY(genre, ',')) AS genre
             FROM titles
             WHERE genre IS NOT NULL
             AND ${EXCLUDED}
             ORDER BY genre`
        )
        res.json(result.rows.map(r => r.genre.trim()))
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:"Error fetching genres"})
    }
})

// ================= SERVER START =================
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} 🚀`)
})