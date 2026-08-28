const STORAGE_KEY = "movie-watchlist";

const movieForm = document.getElementById("movieForm");
const movieTitleInput = document.getElementById("movieTitle");
const movieGenreInput = document.getElementById("movieGenre");
const movieYearInput = document.getElementById("movieYear");
const movieStatusInput = document.getElementById("movieStatus");
const movieList = document.getElementById("movieList");
const searchInput = document.getElementById("searchInput");
const clearAllBtn = document.getElementById("clearAllBtn");
const totalMoviesEl = document.getElementById("totalMovies");
const watchedMoviesEl = document.getElementById("watchedMovies");
const remainingMoviesEl = document.getElementById("remainingMovies");

let movies = loadMovies();

function loadMovies() {
  try {
    const savedMovies = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(savedMovies) ? savedMovies : [];
  } catch (error) {
    return [];
  }
}

function saveMovies() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function updateStats() {
  const watchedCount = movies.filter((movie) => movie.status === "watched").length;
  totalMoviesEl.textContent = movies.length;
  watchedMoviesEl.textContent = watchedCount;
  remainingMoviesEl.textContent = movies.length - watchedCount;
}

function renderMovies() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredMovies = movies.filter((movie) => {
    const searchableText = `${movie.title} ${movie.genre} ${movie.year}`.toLowerCase();
    return searchableText.includes(query);
  });

  if (!filteredMovies.length) {
    const emptyMessage = movies.length
      ? "No movies match your search."
      : "Your watchlist is empty. Add your first movie!";

    movieList.innerHTML = `<li class="empty-state">${emptyMessage}</li>`;
    updateStats();
    return;
  }

  movieList.innerHTML = filteredMovies
    .map((movie) => {
      const watchedClass = movie.status === "watched" ? "watched" : "";
      const buttonLabel = movie.status === "watched" ? "Watched" : "Mark watched";

      return `
        <li class="movie-item ${watchedClass}" data-id="${movie.id}">
          <div class="movie-info">
            <h3>${escapeHtml(movie.title)}</h3>
            <p>${escapeHtml(movie.genre || "General")} • ${escapeHtml(movie.year || "N/A")}</p>
          </div>

          <div class="movie-actions">
            <button type="button" class="toggle-btn" data-action="toggle" data-id="${movie.id}">${buttonLabel}</button>
            <button type="button" class="delete-btn" data-action="delete" data-id="${movie.id}">Delete</button>
          </div>
        </li>
      `;
    })
    .join("");

  updateStats();
}

movieForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = movieTitleInput.value.trim();
  const genre = movieGenreInput.value.trim();
  const year = movieYearInput.value.trim();
  const status = movieStatusInput.value;

  if (!title) {
    movieTitleInput.focus();
    return;
  }

  movies.unshift({
    id: Date.now(),
    title,
    genre: genre || "General",
    year: year || "N/A",
    status,
  });

  saveMovies();
  renderMovies();
  movieForm.reset();
  movieTitleInput.focus();
});

movieList.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  const movieId = Number(target.dataset.id);
  const action = target.dataset.action;

  if (action === "toggle") {
    movies = movies.map((movie) => {
      if (movie.id === movieId) {
        return {
          ...movie,
          status: movie.status === "watched" ? "want-to-watch" : "watched",
        };
      }
      return movie;
    });
  }

  if (action === "delete") {
    movies = movies.filter((movie) => movie.id !== movieId);
  }

  saveMovies();
  renderMovies();
});

searchInput.addEventListener("input", renderMovies);

clearAllBtn.addEventListener("click", () => {
  if (!movies.length) return;

  const confirmed = window.confirm("Remove all movies from your watchlist?");
  if (!confirmed) return;

  movies = [];
  saveMovies();
  renderMovies();
});

renderMovies();
