const apiKey = "a994a5265a05c433cbbfc5d2ae52820a";
const appId = "b4a4daaa";
const userId = "ParellaAkhila";
const baseUrl = "https://api.edamam.com/api/recipes/v2?type=public&q=";

// DOM Elements
const searchInput = document.getElementById("search_input");
const searchButton = document.getElementById("search_btn");
const cardContainer = document.getElementById("card_container");
const favoritesButton = document.getElementById("favoritesButton");
const mealButtons = {
  breakfast: document.getElementById("breakfast"),
  lunch: document.getElementById("lunch"),
  snacks: document.getElementById("snacks"),
  dinner: document.getElementById("dinner")
};

// Modal
const ingredientsModal = document.createElement("div");
ingredientsModal.id = "ingredientsModal";
ingredientsModal.className = "modal";
ingredientsModal.innerHTML = `
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Ingredients</h2>
    <ul id="ingredientsList"></ul>
  </div>`;
document.body.appendChild(ingredientsModal);

const closeBtn = ingredientsModal.querySelector(".close");
closeBtn.addEventListener("click", () => ingredientsModal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === ingredientsModal) ingredientsModal.style.display = "none";
});

function showIngredients(ingredientLines) {
  const list = document.getElementById("ingredientsList");
  list.innerHTML = "";
  ingredientLines.forEach(ing => {
    const li = document.createElement("li");
    li.textContent = ing;
    list.appendChild(li);
  });
  ingredientsModal.style.display = "block";
}

async function fetchRecipes(query) {
  try {
    const res = await fetch(`${baseUrl}${encodeURIComponent(query)}&app_id=${appId}&app_key=${apiKey}`, {
      headers: { "Edamam-Account-User": userId }
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();
    displayRecipes(data.hits);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    cardContainer.innerHTML = `<p class="text-danger">Failed to load recipes. Try again later.</p>`;
  }
}

function createRecipeCard(recipe, isFavorite = false) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const card = document.createElement("div");
  card.className = "col-md-4 mb-4 col-lg-3";
  card.innerHTML = `
    <div class="card" style="font-family: cursive;">
      <img src="${recipe.image}" class="card-img-top" alt="${recipe.label || recipe.title}">
      <div class="card-body">
        <h5 class="card-title">${recipe.label || recipe.title}</h5>
        <p class="card-text">Calories: ${Math.round(recipe.calories)}</p>
        ${recipe.cuisineType ? `<p class="card-text">Cuisine Type: ${recipe.cuisineType.join(", ")}</p>` : ""}
        <div class="row">
          <div class="col-6">
            <a href="${recipe.url}" target="_blank" class="button-78" role="button">View Recipe</a>
          </div>
          ${!isFavorite ? `
          <div class="col-6">
            <button class="button-78 view-ingredients-btn" role="button">View Ingredients</button>
          </div>` : ""}
        </div>
        <span class="${isFavorite ? "remove-fav-btn" : "addFavIcon"} position-absolute top-0 end-0 m-2"
              title="${isFavorite ? "Remove" : "Add"} from favorites"
              style="cursor:pointer; font-size: 24px; color: ${isFavorite ? "#e0245e" : "#ccc"};">
              &#10084;
        </span>
      </div>
    </div>`;

  cardContainer.appendChild(card);

  if (!isFavorite) {
    card.querySelector(".view-ingredients-btn").addEventListener("click", () => {
      showIngredients(recipe.ingredientLines);
    });

    const heart = card.querySelector(".addFavIcon");
    if (favorites.some(fav => fav.id === recipe.uri)) {
      heart.style.color = '#e0245e';
    }

    heart.addEventListener("click", () => {
      if (!favorites.some(fav => fav.id === recipe.uri)) {
        addToFavorites({
          id: recipe.uri,
          title: recipe.label,
          image: recipe.image,
          calories: recipe.calories,
          url: recipe.url
        });
        heart.style.color = '#e0245e';
      }
    });
  } else {
    card.querySelector(".remove-fav-btn").addEventListener("click", () => {
      removeFromFavorites(recipe.id);
    });
  }
}

function displayRecipes(hits) {
  cardContainer.innerHTML = hits.length
    ? ""
    : `<p class="text-center">No recipes found!</p>`;
  hits.forEach(hit => createRecipeCard(hit.recipe));
}

function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  cardContainer.innerHTML = favorites.length
    ? ""
    : `<p class="text-center">No favorites added yet!</p>`;
  favorites.forEach(recipe => createRecipeCard(recipe, true));
}

function addToFavorites(recipe) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.some(fav => fav.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
}

function removeFromFavorites(recipeId) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(fav => fav.id !== recipeId);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
}

// Event Listeners
searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  const term = searchInput.value.trim();
  if (term) fetchRecipes(term);
});

favoritesButton.addEventListener("click", displayFavorites);

// Event listeners for category elements
document.querySelectorAll('.category-item').forEach(item => {
  item.addEventListener('click', () => {
    const category = item.getAttribute('data-category');
    fetchRecipes(category);
  });
});

// Event listeners for meal buttons
Object.entries(mealButtons).forEach(([meal, button]) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    fetchRecipes(meal);
  });
});

// Initial load
fetchRecipes("chicken");
