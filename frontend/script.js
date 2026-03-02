const container = document.getElementById("moviesContainer")
const spinner = document.getElementById("loadingSpinner")
const trendingContainer = document.getElementById("trendingContainer")
const paginationEl = document.getElementById("pagination")

// ===== TMDB IMAGE BASE =====
const IMG_BASE = "https://image.tmdb.org/t/p/w500"
const IMG_ORIGINAL = "https://image.tmdb.org/t/p/original"

// ===== BACKEND BASE =====
const API_BASE = "https://cineverse-8je0.onrender.com"

// ===== GRADIENTS (fallback when no poster) =====
const gradients = [
  "linear-gradient(135deg, #0d2137, #0a4a6e)",
  "linear-gradient(135deg, #1a0a2e, #4a0a6e)",
  "linear-gradient(135deg, #0a2e1a, #0a6e4a)",
  "linear-gradient(135deg, #2e0a0a, #6e1a0a)",
  "linear-gradient(135deg, #0a1a2e, #0a2e6e)",
  "linear-gradient(135deg, #2e1a0a, #6e3a0a)",
  "linear-gradient(135deg, #1a2e0a, #3a6e0a)",
  "linear-gradient(135deg, #0a2e2e, #0a5e6e)",
  "linear-gradient(135deg, #2e0a2e, #5e0a6e)",
  "linear-gradient(135deg, #1a1a2e, #2a2a6e)",
]

// ===== STATE =====
let currentMode = "home"
let currentPage = 1
let currentSearch = ""
let currentYear = 2010
let totalPages = 1

// ===== HELPERS =====
function getTitle(item) {
  return item.title || item.name || "Untitled"
}

function getYear(item) {
  const date = item.release_date || item.first_air_date || ""
  return date ? date.substring(0, 4) : "N/A"
}

function getPosterUrl(path) {
  return path ? `${IMG_BASE}${path}` : null
}

function getMediaType(item) {
  return item.media_type || (item.first_air_date ? "tv" : "movie")
}

// ===== CUSTOM DROPDOWN STATE =====
const dropdownValues = { genreDropdown: '', sortDropdown: 'default' }

function getSort() { return dropdownValues['sortDropdown'] }
function getGenre() { return dropdownValues['genreDropdown'] }

function toggleDropdown(id) {
  const dropdown = document.getElementById(id)
  const isOpen = dropdown.classList.contains('open')
  document.querySelectorAll('.custom-select').forEach(d => d.classList.remove('open'))
  if (!isOpen) dropdown.classList.add('open')
}

function selectOption(dropdownId, value, label) {
  dropdownValues[dropdownId] = value
  document.getElementById(dropdownId === 'genreDropdown' ? 'genreValue' : 'sortValue').textContent = label
  document.querySelectorAll(`#${dropdownId} .custom-select-option`).forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.value === String(value))
  })
  document.getElementById(dropdownId).classList.remove('open')
  applyControls()
}

document.addEventListener('click', function (e) {
  if (!e.target.closest('.custom-select')) {
    document.querySelectorAll('.custom-select').forEach(d => d.classList.remove('open'))
  }
})

// ===== SPINNER =====
function showSpinner() {
  spinner.classList.remove("hidden")
  container.classList.add("hidden")
  paginationEl.classList.add("hidden")
}

function hideSpinner() {
  spinner.classList.add("hidden")
  container.classList.remove("hidden")
}

// ===== SET ACTIVE NAV =====
function setActive(el) {
  document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"))
  el.classList.add("active")
  document.getElementById("sectionTitle").textContent = el.textContent
  currentPage = 1
}

// ===== APPLY CONTROLS =====
function applyControls() {
  currentPage = 1
  if (currentMode === "movies") loadByType()
  else if (currentMode === "series") loadSeries()
  else if (currentMode === "search") searchMovies()
  else if (currentMode === "filter") filterYear(currentYear)
  else loadMovies()
}

// ===== LOAD GENRES =====
async function loadGenres() {
  try {
    const res = await fetch(`${API_BASE}/genres?type=movie`)
    const genres = await res.json()
    const genreContainer = document.getElementById("genreOptions")

    if (!Array.isArray(genres)) return

    genres.forEach(g => {
      if (!g || !g.name) return
      const option = document.createElement("div")
      option.className = "custom-select-option"
      option.dataset.value = g.id
      option.textContent = g.name.toUpperCase()
      option.onclick = () => selectOption('genreDropdown', g.id, g.name.toUpperCase())
      genreContainer.appendChild(option)
    })
  } catch (err) {
    console.log("Could not load genres", err)
  }
}

// ===== TRENDING =====
async function loadTrending() {
  try {
    const res = await fetch(`${API_BASE}/trending`)
    const data = await res.json()
    const items = data.results

    if (!Array.isArray(items) || items.length === 0) return

    trendingContainer.innerHTML = ""

    items.slice(0, 10).forEach((item, i) => {
      const gradient = gradients[i % gradients.length]
      const title = getTitle(item)
      const year = getYear(item)
      const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A"
      const poster = getPosterUrl(item.poster_path)
      const initial = title.charAt(0).toUpperCase()
      const type = getMediaType(item)

      const card = document.createElement("div")
      card.className = "trending-card"
      card.style.animationDelay = `${i * 0.08}s`

      const posterHTML = poster
        ? `<img src="${poster}" alt="${title}" class="trending-img poster-fadein">`
        : `<div class="trending-placeholder" style="background:${gradient}"><span class="trending-initial">${initial}</span></div>`

      card.innerHTML = `
        <div class="trending-poster">
          <span class="trending-rank">#${i + 1}</span>
          ${posterHTML}
        </div>
        <div class="trending-info">
          <div class="trending-name">${title}</div>
          <div class="trending-meta">${year} &nbsp;★ ${rating}</div>
        </div>
      `

      card.addEventListener("click", () => openModal(item.id, type, gradient))
      trendingContainer.appendChild(card)
    })

  } catch (err) {
    console.log("Trending failed", err)
  }
}

// ===== SHOW MOVIES =====
async function showMovies(movies, pages) {
  if (!Array.isArray(movies)) {
    showError("ERROR: COULD NOT LOAD TITLES")
    return
  }

  if (movies.length === 0) {
    showError("NO TITLES FOUND")
    return
  }

  totalPages = pages || 1
  container.innerHTML = ""

  movies.forEach((item, i) => {
    const gradient = gradients[i % gradients.length]
    const title = getTitle(item)
    const year = getYear(item)
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null
    const poster = getPosterUrl(item.poster_path)
    const initial = title.charAt(0).toUpperCase()
    const type = getMediaType(item)

    const ratingHTML = rating
      ? `<div class="rating">★ ${rating}</div>`
      : ""

    const posterHTML = poster
      ? `<img src="${poster}" alt="${title}" class="card-poster poster-fadein">`
      : `<div class="no-poster" style="background: ${gradient}"><span class="poster-initial">${initial}</span></div>`

    const card = document.createElement("div")
    card.className = "card"
    card.style.animationDelay = `${i * 0.04}s`
    card.innerHTML = `
      <div class="card-poster-wrap">
        ${posterHTML}
      </div>
      <div class="card-info">
        <div class="title">${title}</div>
        <div class="year">${year}</div>
        ${ratingHTML}
      </div>
    `

    card.addEventListener("click", () => openModal(item.id, type, gradient))
    container.appendChild(card)
  })

  hideSpinner()
  renderPagination()
}

function showError(msg) {
  hideSpinner()
  container.innerHTML = `<div class="error">// ${msg}</div>`
  paginationEl.classList.add("hidden")
}

// ===== PAGINATION =====
function renderPagination() {
  if (totalPages <= 1) { paginationEl.classList.add("hidden"); return }

  paginationEl.classList.remove("hidden")
  paginationEl.innerHTML = ""

  const prev = document.createElement("button")
  prev.textContent = "← PREV"
  prev.disabled = currentPage === 1
  prev.onclick = () => { currentPage--; applyControls() }
  paginationEl.appendChild(prev)

  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, currentPage + 2)

  if (startPage > 1) {
    addPageBtn(1)
    if (startPage > 2) {
      const dots = document.createElement("span")
      dots.textContent = "..."
      dots.className = "pagination-dots"
      paginationEl.appendChild(dots)
    }
  }

  for (let i = startPage; i <= endPage; i++) addPageBtn(i)

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dots = document.createElement("span")
      dots.textContent = "..."
      dots.className = "pagination-dots"
      paginationEl.appendChild(dots)
    }
    addPageBtn(totalPages)
  }

  const next = document.createElement("button")
  next.textContent = "NEXT →"
  next.disabled = currentPage === totalPages
  next.onclick = () => { currentPage++; applyControls() }
  paginationEl.appendChild(next)

  window.scrollTo({ top: document.querySelector(".controls-bar").offsetTop - 80, behavior: "smooth" })
}

function addPageBtn(num) {
  const btn = document.createElement("button")
  btn.textContent = num
  if (num === currentPage) btn.classList.add("active-page")
  btn.onclick = () => { currentPage = num; applyControls() }
  paginationEl.appendChild(btn)
}

// ===== LOAD MOVIES (home) =====
async function loadMovies() {
  currentMode = "home"
  showSpinner()
  try {
    const res = await fetch(`${API_BASE}/movies?page=${currentPage}&sort=${getSort()}`)
    const data = await res.json()
    await showMovies(data.results, data.totalPages)
  } catch (err) {
    showError("SERVER NOT RUNNING")
  }
}

// ===== LOAD MOVIES BY TYPE =====
async function loadByType() {
  currentMode = "movies"
  showSpinner()
  try {
    const res = await fetch(`${API_BASE}/movies/type?page=${currentPage}&sort=${getSort()}`)
    const data = await res.json()
    await showMovies(data.results, data.totalPages)
  } catch (err) {
    showError("COULD NOT LOAD MOVIES")
  }
}

// ===== LOAD SERIES =====
async function loadSeries() {
  currentMode = "series"
  showSpinner()
  try {
    const res = await fetch(`${API_BASE}/series?page=${currentPage}&sort=${getSort()}`)
    const data = await res.json()
    await showMovies(data.results, data.totalPages)
  } catch (err) {
    showError("COULD NOT LOAD SERIES")
  }
}

// ===== SEARCH =====
let debounceTimer

async function searchMovies() {
  const text = document.getElementById("searchInput").value
  currentSearch = text
  clearTimeout(debounceTimer)

  if (text.trim() === "") {
    currentMode = "home"
    currentPage = 1
    loadMovies()
    return
  }

  debounceTimer = setTimeout(async () => {
    currentMode = "search"
    showSpinner()
    try {
      const res = await fetch(`${API_BASE}/search?title=${encodeURIComponent(text)}&page=${currentPage}`)
      const data = await res.json()
      await showMovies(data.results, data.totalPages)
    } catch {
      showError("SEARCH FAILED")
    }
  }, 400)
}

// ===== FILTER BY YEAR =====
async function filterYear(year) {
  currentMode = "filter"
  currentYear = year
  currentPage = 1
  showSpinner()
  try {
    const genre = getGenre()
    const sort = getSort()
    const res = await fetch(`${API_BASE}/filter?year=${year}&rating=0&page=${currentPage}&sort=${sort}&genre_id=${encodeURIComponent(genre)}`)
    const data = await res.json()
    await showMovies(data.results, data.totalPages)
  } catch {
    showError("FILTER FAILED")
  }
}

// ===== OPEN MODAL =====
async function openModal(id, type, gradient) {
  if (!id) return
  try {
    const res = await fetch(`${API_BASE}/details/${id}?type=${type}`)
    const movie = await res.json()

    const title = getTitle(movie)
    const year = getYear(movie)
    const initial = title.charAt(0).toUpperCase()
    const poster = getPosterUrl(movie.poster_path)
    const backdrop = movie.backdrop_path ? `${IMG_ORIGINAL}${movie.backdrop_path}` : null

    const posterHTML = poster
      ? `<img src="${poster}" alt="${title}" class="modal-poster-img">`
      : `<div class="modal-poster" style="background: ${gradient}">${initial}</div>`

    // Trailer
    const trailer = movie.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube")
    const trailerHTML = trailer
      ? `<div class="modal-section">
           <div class="modal-section-title">TRAILER</div>
           <div class="modal-trailer">
             <iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
           </div>
         </div>`
      : ""

    // Cast (top 6)
    const cast = movie.credits?.cast?.slice(0, 6) || []
    const castHTML = cast.length
      ? `<div class="modal-section">
           <div class="modal-section-title">CAST</div>
           <div class="modal-cast">
             ${cast.map(c => `
               <div class="cast-item">
                 ${c.profile_path
                   ? `<img src="https://image.tmdb.org/t/p/w185${c.profile_path}" alt="${c.name}" class="cast-img">`
                   : `<div class="cast-img cast-placeholder">${c.name.charAt(0)}</div>`}
                 <div class="cast-name">${c.name}</div>
                 <div class="cast-char">${c.character}</div>
               </div>`).join("")}
           </div>
         </div>`
      : ""

    // Watch providers (India)
    const providers = movie["watch/providers"]?.results?.IN
    const streaming = providers?.flatrate || providers?.rent || []
    const watchHTML = streaming.length
      ? `<div class="modal-section">
           <div class="modal-section-title">STREAM ON</div>
           <div class="modal-providers">
             ${streaming.map(p => `
               <div class="provider-item">
                 <img src="https://image.tmdb.org/t/p/w92${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}" class="provider-logo">
               </div>`).join("")}
           </div>
         </div>`
      : ""

    // Recommendations (top 6)
    const recs = movie.recommendations?.results?.slice(0, 6) || []
    const recsHTML = recs.length
      ? `<div class="modal-section">
           <div class="modal-section-title">YOU MIGHT ALSO LIKE</div>
           <div class="modal-recs">
             ${recs.map(r => `
               <div class="rec-card" onclick="openModal(${r.id}, '${r.media_type || type}', '${gradient}')">
                 ${r.poster_path
                   ? `<img src="${IMG_BASE}${r.poster_path}" alt="${getTitle(r)}" class="rec-img">`
                   : `<div class="rec-img rec-placeholder">${getTitle(r).charAt(0)}</div>`}
                 <div class="rec-title">${getTitle(r)}</div>
               </div>`).join("")}
           </div>
         </div>`
      : ""

    const backdropStyle = backdrop ? `style="background-image: url('${backdrop}')"` : ""

    document.getElementById("modalContent").innerHTML = `
      <div class="modal-backdrop" ${backdropStyle}></div>
      <div class="modal-body">
        ${posterHTML}
        <div class="modal-main">
          <div class="modal-title">${title}</div>
          <div class="modal-info">
            <div class="modal-info-item">
              <div class="modal-info-label">YEAR</div>
              <div class="modal-info-value">${year}</div>
            </div>
            <div class="modal-info-item">
              <div class="modal-info-label">TYPE</div>
              <div class="modal-info-value">${type.toUpperCase()}</div>
            </div>
            <div class="modal-info-item">
              <div class="modal-info-label">RATING</div>
              <div class="modal-info-value">${movie.vote_average ? "★ " + movie.vote_average.toFixed(1) : "N/A"}</div>
            </div>
            <div class="modal-info-item">
              <div class="modal-info-label">VOTES</div>
              <div class="modal-info-value">${movie.vote_count ? movie.vote_count.toLocaleString() : "N/A"}</div>
            </div>
            <div class="modal-info-item">
              <div class="modal-info-label">RUNTIME</div>
              <div class="modal-info-value">${movie.runtime ? movie.runtime + " MIN" : (movie.episode_run_time?.[0] ? movie.episode_run_time[0] + " MIN" : "N/A")}</div>
            </div>
            <div class="modal-info-item">
              <div class="modal-info-label">GENRE</div>
              <div class="modal-info-value">${movie.genres?.map(g => g.name).join(", ") || "N/A"}</div>
            </div>
          </div>
          ${movie.overview ? `<div class="modal-overview">${movie.overview}</div>` : ""}
          ${watchHTML}
        </div>
      </div>
      ${trailerHTML}
      ${castHTML}
      ${recsHTML}
    `

    document.getElementById("modal").classList.remove("hidden")
  } catch (err) {
    console.error("Modal error", err)
  }
}

// ===== CLOSE MODAL =====
function closeModal() {
  document.getElementById("modal").classList.add("hidden")
  const iframe = document.querySelector(".modal-trailer iframe")
  if (iframe) iframe.src = iframe.src
}

document.getElementById("modal").addEventListener("click", function (e) {
  if (e.target === this) closeModal()
})

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeModal()
})

// ===== EVENT LISTENERS =====
document.getElementById("searchInput").addEventListener("keyup", searchMovies)

// ===== INIT =====
loadGenres()
loadTrending()
loadMovies()