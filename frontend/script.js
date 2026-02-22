const container = document.getElementById("moviesContainer")
const spinner = document.getElementById("loadingSpinner")
const trendingContainer = document.getElementById("trendingContainer")
const paginationEl = document.getElementById("pagination")

const gradients = [
  "linear-gradient(135deg, #f953c6, #b91d73)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #ff9a9e, #fad0c4)",
  "linear-gradient(135deg, #ffecd2, #fcb69f)",
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f77062, #fe5196)",
  "linear-gradient(135deg, #2af598, #009efd)",
]

// ===== STATE =====
let currentMode = "home"   // home | movies | series | search | filter
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
function getSort(){
  return document.getElementById("sortSelect").value
}

function getGenre(){
  return document.getElementById("genreSelect").value
}

// ===== APPLY CONTROLS (genre or sort changed) =====
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
          <div class="trending-meta">${movie.startyear} &nbsp;⭐ ${movie.averagerating}</div>
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
    showError("Error loading movies from server")
    return
  }

  if(movies.length === 0){
    showError("No movies found")
    return
  }

  totalPages = pages || 1
  container.innerHTML = ""

  movies.forEach((movie, i) => {
    const gradient = gradients[i % gradients.length]
    const initial = movie.primarytitle.charAt(0).toUpperCase()

    const ratingHTML = movie.averagerating
      ? `<div class="rating">⭐ ${movie.averagerating}</div>`
      : ""

    const card = document.createElement("div")
    card.className = "card"
    card.style.animationDelay = `${i * 0.05}s`
    card.innerHTML = `
      <div class="no-poster" style="background: ${gradient}">
        <span class="poster-initial">${initial}</span>
      </div>
      <div class="card-info">
        <div class="title">${movie.primarytitle}</div>
        <div class="year">${movie.startyear}</div>
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
  container.innerHTML = `<div class="error">${msg}</div>`
  paginationEl.classList.add("hidden")
}

// ===== PAGINATION =====
function renderPagination(){
  if(totalPages <= 1){
    paginationEl.classList.add("hidden")
    return
  }

  paginationEl.classList.remove("hidden")
  paginationEl.innerHTML = ""

  // Prev button
  const prev = document.createElement("button")
  prev.textContent = "← Prev"
  prev.disabled = currentPage === 1
  prev.onclick = () => { currentPage--; applyControls() }
  paginationEl.appendChild(prev)

  // Page numbers
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

  for(let i = startPage; i <= endPage; i++){
    addPageBtn(i)
  }

  if(endPage < totalPages){
    if(endPage < totalPages - 1){
      const dots = document.createElement("span")
      dots.textContent = "..."
      dots.className = "pagination-dots"
      paginationEl.appendChild(dots)
    }
    addPageBtn(totalPages)
  }

  // Next button
  const next = document.createElement("button")
  next.textContent = "Next →"
  next.disabled = currentPage === totalPages
  next.onclick = () => { currentPage++; applyControls() }
  paginationEl.appendChild(next)

  // Scroll to top of grid
  window.scrollTo({ top: document.getElementById("sectionTitle").offsetTop - 80, behavior: "smooth" })
}

function addPageBtn(num){
  const btn = document.createElement("button")
  btn.textContent = num
  if(num === currentPage) btn.classList.add("active-page")
  btn.onclick = () => { currentPage = num; applyControls() }
  paginationEl.appendChild(btn)
}

// ===== LOAD ALL MOVIES =====
async function loadMovies(){
  currentMode = "home"
  showSpinner()
  try{
    const res = await fetch(`http://127.0.0.1:3000/movies?page=${currentPage}&sort=${getSort()}`)
    const data = await res.json()
    showMovies(data.results, data.totalPages)
  }catch(err){
    showError("Server not running")
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
    showError("Could not load movies")
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
    showError("Could not load series")
  }
}

// ===== SEARCH WITH DEBOUNCE =====
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
      showError("Search failed")
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
    showError("Filter failed")
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
      <div class="modal-poster" style="background: ${gradient}">
        ${initial}
      </div>
      <div class="modal-title">${movie.primarytitle}</div>
      <div class="modal-info">
        <div class="modal-info-item">
          <div class="modal-info-label">Year</div>
          <div class="modal-info-value">${movie.startyear || "N/A"}</div>
        </div>
        <div class="modal-info-item">
          <div class="modal-info-label">Type</div>
          <div class="modal-info-value">${movie.titletype || "N/A"}</div>
        </div>
        <div class="modal-info-item">
          <div class="modal-info-label">Rating</div>
          <div class="modal-info-value">${movie.averagerating ? "⭐ " + movie.averagerating : "N/A"}</div>
        </div>
        <div class="modal-info-item">
          <div class="modal-info-label">Votes</div>
          <div class="modal-info-value">${movie.numvotes ? movie.numvotes.toLocaleString() : "N/A"}</div>
        </div>
        <div class="modal-info-item">
          <div class="modal-info-label">Runtime</div>
          <div class="modal-info-value">${movie.runtimeminutes ? movie.runtimeminutes + " min" : "N/A"}</div>
        </div>
        <div class="modal-info-item">
          <div class="modal-info-label">Genre</div>
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

// close modal when clicking outside
document.getElementById("modal").addEventListener("click", function(e){
  if(e.target === this) closeModal()
})

// close modal with Escape key
document.addEventListener("keydown", function(e){
  if(e.key === "Escape") closeModal()
})

// ===== EVENT LISTENERS =====
document.getElementById("searchInput").addEventListener("keyup", searchMovies)

// ===== INIT =====
loadGenres()
loadTrending()
loadMovies()