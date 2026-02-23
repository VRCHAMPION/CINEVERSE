const container = document.getElementById("moviesContainer")
const spinner = document.getElementById("loadingSpinner")
const trendingContainer = document.getElementById("trendingContainer")
const paginationEl = document.getElementById("pagination")

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
let currentYear = 0
let totalPages = 1

// ===== SPINNER =====
function showSpinner(){
  spinner.classList.remove("hidden")
  container.classList.add("hidden")
  paginationEl.classList.add("hidden")
}

function hideSpinner(){
  spinner.classList.add("hidden")
  container.classList.remove("hidden")
}

// ===== SET ACTIVE NAV =====
function setActive(el){
  document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"))
  el.classList.add("active")
  document.getElementById("sectionTitle").textContent = el.textContent
  currentPage = 1
}

// ===== GET CONTROLS =====
function getSort(){ return document.getElementById("sortSelect").value }
function getGenre(){ return document.getElementById("genreSelect").value }

// ===== APPLY CONTROLS =====
function applyControls(){
  currentPage = 1
  if(currentMode === "home") loadMovies()
  else if(currentMode === "movies") loadByType()
  else if(currentMode === "series") loadSeries()
  else if(currentMode === "search") searchMovies()
  else if(currentMode === "filter") filterYear(currentYear)
}

// ===== LOAD GENRES =====
async function loadGenres(){
  try{
    const res = await fetch("http://127.0.0.1:3000/genres")
    const genres = await res.json()
    const select = document.getElementById("genreSelect")
    genres.forEach(g => {
      const option = document.createElement("option")
      option.value = g
      option.textContent = g
      select.appendChild(option)
    })
  }catch(err){
    console.log("Could not load genres", err)
  }
}

// ===== TRENDING =====
async function loadTrending(){
  try{
    const res = await fetch("http://127.0.0.1:3000/trending")
    const data = await res.json()
    const movies = data.results

    if(!Array.isArray(movies) || movies.length === 0) return

    trendingContainer.innerHTML = ""

    movies.forEach((movie, i) => {
      const gradient = gradients[i % gradients.length]
      const initial = movie.primarytitle.charAt(0).toUpperCase()

      const card = document.createElement("div")
      card.className = "trending-card"
      card.style.animationDelay = `${i * 0.08}s`
      card.innerHTML = `
        <div class="trending-poster" style="background: ${gradient}">
          <span class="trending-rank">#${i + 1}</span>
          <span class="trending-initial">${initial}</span>
        </div>
        <div class="trending-info">
          <div class="trending-name">${movie.primarytitle}</div>
          <div class="trending-meta">${movie.startyear} &nbsp;★ ${movie.averagerating}</div>
        </div>
      `
      if(movie.tconst){
        card.addEventListener("click", () => openModal(movie.tconst, gradient))
      }
      trendingContainer.appendChild(card)
    })
  }catch(err){
    console.log("Trending failed", err)
  }
}

// ===== SHOW MOVIES =====
function showMovies(movies, pages){
  if(!Array.isArray(movies)){
    showError("ERROR: COULD NOT LOAD TITLES")
    return
  }

  if(movies.length === 0){
    showError("NO TITLES FOUND")
    return
  }

  totalPages = pages || 1
  container.innerHTML = ""

  movies.forEach((movie, i) => {
    const gradient = gradients[i % gradients.length]
    const initial = movie.primarytitle.charAt(0).toUpperCase()

    const ratingHTML = movie.averagerating
      ? `<div class="rating">★ ${movie.averagerating}</div>`
      : ""

    const card = document.createElement("div")
    card.className = "card"
    card.style.animationDelay = `${i * 0.04}s`
    card.innerHTML = `
      <div class="no-poster" style="background: ${gradient}">
        <span class="poster-initial">${initial}</span>
      </div>
      <div class="card-info">
        <div class="title">${movie.primarytitle}</div>
        <div class="year">${movie.startyear || "N/A"}</div>
        ${ratingHTML}
      </div>
    `
    card.addEventListener("click", () => openModal(movie.tconst, gradient))
    container.appendChild(card)
  })

  hideSpinner()
  renderPagination()
}

function showError(msg){
  hideSpinner()
  container.innerHTML = `<div class="error">// ${msg}</div>`
  paginationEl.classList.add("hidden")
}

// ===== PAGINATION =====
function renderPagination(){
  if(totalPages <= 1){ paginationEl.classList.add("hidden"); return }

  paginationEl.classList.remove("hidden")
  paginationEl.innerHTML = ""

  const prev = document.createElement("button")
  prev.textContent = "← PREV"
  prev.disabled = currentPage === 1
  prev.onclick = () => { currentPage--; applyControls() }
  paginationEl.appendChild(prev)

  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, currentPage + 2)

  if(startPage > 1){
    addPageBtn(1)
    if(startPage > 2){
      const dots = document.createElement("span")
      dots.textContent = "..."
      dots.className = "pagination-dots"
      paginationEl.appendChild(dots)
    }
  }

  for(let i = startPage; i <= endPage; i++) addPageBtn(i)

  if(endPage < totalPages){
    if(endPage < totalPages - 1){
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

function addPageBtn(num){
  const btn = document.createElement("button")
  btn.textContent = num
  if(num === currentPage) btn.classList.add("active-page")
  btn.onclick = () => { currentPage = num; applyControls() }
  paginationEl.appendChild(btn)
}

// ===== LOAD MOVIES =====
async function loadMovies(){
  currentMode = "home"
  showSpinner()
  try{
    const res = await fetch(`http://127.0.0.1:3000/movies?page=${currentPage}&sort=${getSort()}`)
    const data = await res.json()
    showMovies(data.results, data.totalPages)
  }catch(err){
    showError("SERVER NOT RUNNING")
  }
}

// ===== LOAD MOVIES BY TYPE =====
async function loadByType(){
  currentMode = "movies"
  showSpinner()
  try{
    const res = await fetch(`http://127.0.0.1:3000/movies/type?page=${currentPage}&sort=${getSort()}`)
    const data = await res.json()
    showMovies(data.results, data.totalPages)
  }catch(err){
    showError("COULD NOT LOAD MOVIES")
  }
}

// ===== LOAD SERIES =====
async function loadSeries(){
  currentMode = "series"
  showSpinner()
  try{
    const res = await fetch(`http://127.0.0.1:3000/series?page=${currentPage}&sort=${getSort()}`)
    const data = await res.json()
    showMovies(data.results, data.totalPages)
  }catch(err){
    showError("COULD NOT LOAD SERIES")
  }
}

// ===== SEARCH =====
let debounceTimer

async function searchMovies(){
  const text = document.getElementById("searchInput").value
  currentSearch = text
  clearTimeout(debounceTimer)

  if(text.trim() === ""){
    currentMode = "home"
    currentPage = 1
    loadMovies()
    return
  }

  debounceTimer = setTimeout(async () => {
    currentMode = "search"
    showSpinner()
    try{
      const res = await fetch(`http://127.0.0.1:3000/search?title=${encodeURIComponent(text)}&page=${currentPage}`)
      const data = await res.json()
      showMovies(data.results, data.totalPages)
    }catch{
      showError("SEARCH FAILED")
    }
  }, 400)
}

// ===== FILTER BY YEAR =====
async function filterYear(year){
  currentMode = "filter"
  currentYear = year
  currentPage = 1
  showSpinner()
  try{
    const genre = getGenre()
    const sort = getSort()
    const res = await fetch(`http://127.0.0.1:3000/filter?year=${year}&rating=0&page=${currentPage}&sort=${sort}&genre=${encodeURIComponent(genre)}`)
    const data = await res.json()
    showMovies(data.results, data.totalPages)
  }catch{
    showError("FILTER FAILED")
  }
}

// ===== OPEN MODAL =====
async function openModal(tconst, gradient){
  if(!tconst) return
  try{
    const res = await fetch(`http://127.0.0.1:3000/details/${tconst}`)
    const movie = await res.json()
    const initial = movie.primarytitle.charAt(0).toUpperCase()

    document.getElementById("modalContent").innerHTML = `
      <div class="modal-poster" style="background: ${gradient}">${initial}</div>
      <div class="modal-title">${movie.primarytitle}</div>
      <div class="modal-info">
        <div class="modal-info-item">
          <div class="modal-info-label">YEAR</div>
          <div class="modal-info-value">${movie.startyear || "N/A"}</div>
        </div>
        <div class="modal-info-item">
          <div class="modal-info-label">TYPE</div>
          <div class="modal-info-value">${movie.titletype || "N/A"}</div>
        </div>
        <div class="modal-info-item">
          <div class="modal-info-label">RATING</div>
          <div class="modal-info-value">${movie.averagerating ? "★ " + movie.averagerating : "N/A"}</div>
        </div>
        <div class="modal-info-item">
          <div class="modal-info-label">VOTES</div>
          <div class="modal-info-value">${movie.numvotes ? movie.numvotes.toLocaleString() : "N/A"}</div>
        </div>
        <div class="modal-info-item">
          <div class="modal-info-label">RUNTIME</div>
          <div class="modal-info-value">${movie.runtimeminutes ? movie.runtimeminutes + " MIN" : "N/A"}</div>
        </div>
        <div class="modal-info-item">
          <div class="modal-info-label">GENRE</div>
          <div class="modal-info-value">${movie.genre || "N/A"}</div>
        </div>
      </div>
    `
    document.getElementById("modal").classList.remove("hidden")
  }catch(err){
    console.error("Modal error", err)
  }
}

// ===== CLOSE MODAL =====
function closeModal(){
  document.getElementById("modal").classList.add("hidden")
}

document.getElementById("modal").addEventListener("click", function(e){
  if(e.target === this) closeModal()
})

document.addEventListener("keydown", function(e){
  if(e.key === "Escape") closeModal()
})

// ===== EVENT LISTENERS =====
document.getElementById("searchInput").addEventListener("keyup", searchMovies)

// ===== INIT =====
loadGenres()
loadTrending()
loadMovies()