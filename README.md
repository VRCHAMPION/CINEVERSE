# 🎬 CineVerse

A full stack movie browsing website built with Node.js, Express, and PostgreSQL. Browse movies and TV series, search by title, filter by genre and year, and view detailed information for each title.

---
📊 Technical Achievements
This project has been optimized for industrial-grade speed and reliability. Below are the verified Google Lighthouse scores(desktop) for the production environment:

Performance: 98/100 🟢

Best Practices: 96/100 🟢

Accessibility: 87/100 🟢

SEO: 82/100 🟢

---

## 🚀 Features

- 🔥 Trending movies section (top rated from database)
- 🔍 Search movies by title (with debounce)
- 🎭 Filter by genre
- 📅 Filter by year (2000+, 2010+, 2020+)
- 🔃 Sort by rating, year, or title (A-Z)
- 📄 Pagination
- 🎬 Movie detail popup (rating, votes, genre, runtime, type)
- 🎨 Smooth animations and cinematic dark theme
- 📺 Separate Movies and Series tabs

---

🛠️ Tech Stack
Frontend:

HTML, CSS, JavaScript (Vanilla)

OMDb API Integration: Dynamic poster fetching with local caching.

Backend:

Node.js & Express.js

PostgreSQL: Hosted via Supabase on AWS Mumbai (ap-south-1) for low latency.

CORS: Enabled for cross-origin resource sharing.

Connection Pooling: Uses port 6543 to manage high-frequency database traffic.

---

## 📁 Project Structure

```
cineverse/
├── backend/
│   ├── server.js        # Express server and API routes
│   ├── db.js            # PostgreSQL connection (not included)
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/VRCHAMPION/CINEVERSE.git
cd CINEVERSE
```

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Create db.js
Create a file called `db.js` inside the `backend` folder:
```javascript
const { Pool } = require('pg')

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "your_database_name",
  user: "your_username",
  password: "your_password"
})

module.exports = pool
```

### 4. Set up the database
This project uses the IMDB dataset. Your PostgreSQL database should have these tables:
- `Titles` — with columns: `tconst`, `primarytitle`, `originaltitle`, `titletype`, `startyear`, `endyear`, `runtimeminutes`, `genre`
- `Ratings` — with columns: `tconst`, `averagerating`, `numvotes`

### 5. Start the server
```bash
node server.js
```
Server runs on `http://localhost:3000`

### 6. Open the frontend
Open `frontend/index.html` in your browser.

---

## 🔌 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/movies` | Get all movies with pagination and sort |
| GET | `/movies/type` | Get only movies and tvMovies |
| GET | `/series` | Get TV series and mini series |
| GET | `/search?title=` | Search movies by title |
| GET | `/filter?year=&rating=&genre=&sort=` | Filter with multiple options |
| GET | `/trending` | Get top rated movies |
| GET | `/details/:tconst` | Get details for a specific title |
| GET | `/genres` | Get all available genres |

---

## 📸 Screenshots

> Coming soon

---

## 👨‍💻 Author

**VRCHAMPION**
- GitHub: [@VRCHAMPION](https://github.com/VRCHAMPION)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
