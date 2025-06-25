const API_KEY = '49644d8c'; // Replace this with your OMDb API key
const movieGrid = document.getElementById("movieGrid");
const favoritesGrid = document.getElementById("favoritesGrid");
const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const ratingFilter = document.getElementById("ratingFilter");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

searchInput.addEventListener("input", searchMovies);
yearFilter.addEventListener("input", searchMovies);
ratingFilter.addEventListener("input", searchMovies);

function createMovieCard(movie, isFavorite = false) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.innerHTML = `
    <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300'}" alt="${movie.Title}">
    <div class="movie-info">
      <h3>${movie.Title}</h3>
      <p>Year: ${movie.Year}</p>
      <p>Rating: ${movie.imdbRating}</p>
      <button class="favorite-btn" onclick="toggleFavorite('${movie.imdbID}')">
        ${isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  `;
  return card;
}

function toggleFavorite(imdbID) {
  const index = favorites.indexOf(imdbID);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(imdbID);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  searchMovies();
  loadFavorites();
}

async function fetchMovieDetails(imdbID) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`);
  return await res.json();
}

async function searchMovies() {
  const query = searchInput.value.trim();
  const year = yearFilter.value.trim();
  const rating = ratingFilter.value.trim();

  if (query.length < 3) {
    movieGrid.innerHTML = `<p style="text-align:center;">Start typing a movie title (min 3 characters)...</p>`;
    return;
  }

  const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`);
  const data = await res.json();

  movieGrid.innerHTML = "";

  if (data.Response === "True") {
    for (let m of data.Search) {
      const details = await fetchMovieDetails(m.imdbID);
      if (year && details.Year !== year) continue;
      if (rating && parseFloat(details.imdbRating) < parseFloat(rating)) continue;
      movieGrid.appendChild(createMovieCard(details, favorites.includes(details.imdbID)));
    }
  } else {
    movieGrid.innerHTML = `<p style="text-align:center;">No movies found.</p>`;
  }
}

async function loadFavorites() {
  favoritesGrid.innerHTML = "";
  for (let id of favorites) {
    const movie = await fetchMovieDetails(id);
    favoritesGrid.appendChild(createMovieCard(movie, true));
  }
}

loadFavorites();
