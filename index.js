// API credentials
const apiKey = "a994a5265a05c433cbbfc5d2ae52820a";
const appId = "b4a4daaa";
const userId = "ParellaAkhila";

// Base URL for Edamam Recipe Search API
const baseUrl = "https://api.edamam.com/api/recipes/v2?type=public&q=";

// DOM elements
const searchInput = document.getElementById("search_input");
const searchButton = document.getElementById("search_btn");
const cardContainer = document.getElementById("card_container");
const favoritesButton = document.getElementById("favoritesButton");
const breakfast = document.getElementById("breakfast");
const lunch = document.getElementById("lunch");
const snacks = document.getElementById("snacks");
const dinner = document.getElementById("dinner");

// Create modal elements
const ingredientsModal = document.createElement("div");
ingredientsModal.id = "ingredientsModal";
ingredientsModal.className = "modal";
ingredientsModal.innerHTML = `
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Ingredients</h2>
    <ul id="ingredientsList"></ul>
  </div>
`;
document.body.appendChild(ingredientsModal);

// Function to open modal with ingredients
function showIngredients(ingredientLines) {
  const ingredientsList = document.getElementById("ingredientsList");
  ingredientsList.innerHTML = "";

  ingredientLines.forEach(ingredient => {
    const li = document.createElement("li");
    li.textContent = ingredient;
    ingredientsList.appendChild(li);
  });

  ingredientsModal.style.display = "block";
}

// Event listener to close the modal
const closeBtn = ingredientsModal.querySelector(".close");
closeBtn.addEventListener("click", () => {
  ingredientsModal.style.display = "none";
});

// Close modal when clicking outside of the modal content
window.addEventListener("click", (event) => {
  if (event.target === ingredientsModal) {
    ingredientsModal.style.display = "none";
  }
});

// Function to fetch recipes based on query
async function fetchRecipes(query) {
  try {
    const response = await fetch(`${baseUrl}${encodeURIComponent(query)}&app_id=${appId}&app_key=${apiKey}`, {
      headers: {
        "Edamam-Account-User": userId
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    displayRecipes(data.hits);
    console.log(data);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    cardContainer.innerHTML = `<p class="text-danger">Failed to load recipes. Please try again later.</p>`;
  }
}

// Function to display recipes on the page
function displayRecipes(hits) {
  cardContainer.innerHTML = "";

  if (hits.length === 0) {
    cardContainer.innerHTML = `<p class="text-center">No recipes found!</p>`;
    return;
  }

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  hits.forEach(hit => {
    const recipe = hit.recipe;

    const card = document.createElement("div");
    card.className = "col-md-4 mb-4 col-lg-4";
    card.innerHTML = `
      <div class="card">
        <img src="${recipe.image}" class="card-img-top" alt="${recipe.label}">
        <div class="card-body" style="font-family: 'Brush Script MT', cursive;">
          <h5 class="card-title">${recipe.label}</h5>
          <p class="card-text">Calories: ${Math.round(recipe.calories)}</p>
          <p class="card-text">Cuisine Type: ${recipe.cuisineType.join(", ")}</p>
          <div class="row">
            <div class="col-6">
              <a href="${recipe.url}" target="_blank" class="button-78" role="button">View Recipe</a>
            </div>
            <div class="col-6">
              <button class=" button-78 view-ingredients-btn" role="button">View Ingredients</button>
           
            </div>
          </div>
          <span class="addFavIcon position-absolute top-0 end-0 m-2" title="Add to favorites" style="cursor:pointer; font-size: 24px; color: #ccc;">&#10084;</span>
        </div>
      </div>
    `;

    cardContainer.appendChild(card);

    // Ingredients button event listener
    const ingredientsButton = card.querySelector(".view-ingredients-btn");
    ingredientsButton.addEventListener("click", () => {
      showIngredients(recipe.ingredientLines);
    });

    // Favorite icon event listener
    const addFavIcon = card.querySelector(".addFavIcon");

    // If already in favorites, make heart red
    if (favorites.some(fav => fav.id === recipe.uri)) {
      addFavIcon.style.color = '#e0245e';
    }

    addFavIcon.addEventListener("click", () => {
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

      if (!favorites.some(fav => fav.id === recipe.uri)) {
        addToFavorites({
          id: recipe.uri,
          title: recipe.label,
          image: recipe.image,
          calories: recipe.calories,
          url: recipe.url
        });
      }

      addFavIcon.style.color = '#e0245e'; // turn red regardless
    });
  });
}

// Function to add a recipe to favorites
function addToFavorites(recipe) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.some(fav => fav.id === recipe.id)) {
    return;
  }

  favorites.push(recipe);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Function to remove a recipe from favorites
function removeFromFavorites(recipeId) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  favorites = favorites.filter(fav => fav.id !== recipeId);

  localStorage.setItem("favorites", JSON.stringify(favorites));

  displayFavorites();
}

// Function to display favorite recipes
function displayFavorites() {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  cardContainer.innerHTML = "";

  if (favorites.length === 0) {
    cardContainer.innerHTML = `<p class="text-center">No favorites added yet!</p>`;
    return;
  }

  favorites.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4 col-lg-3";
    card.innerHTML = `
      <div class="card">
        <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
        <div class="card-body">
          <h5 class="card-title">${recipe.title}</h5>
          <p class="card-text">Calories: ${Math.round(recipe.calories)}</p>
          <a href="${recipe.url}" target="_blank" class="btn btn-primary">View Recipe</a>
          <span class="remove-fav-btn" title="Remove from favorites" style="cursor:pointer; font-size: 24px; color: #ccc;">&#10084;</span>
        </div>
      </div>
    `;

    cardContainer.appendChild(card);

    const removeButton = card.querySelector(".remove-fav-btn");
    removeButton.addEventListener("click", () => {
      removeFromFavorites(recipe.id);
    });
  });
}

// Event listener for search button
searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    fetchRecipes(searchTerm);
  }
});

// Event listener for favorites button
favoritesButton.addEventListener("click", displayFavorites);

// Initial fetch for default recipe
fetchRecipes("chicken");

// Event listeners for meal type buttons
breakfast.addEventListener("click", (e) => {
  e.preventDefault();
  fetchRecipes("breakfast");
});
lunch.addEventListener("click", (e) => {
  e.preventDefault();
  fetchRecipes("lunch");
});
snacks.addEventListener("click", (e) => {
  e.preventDefault();
  fetchRecipes("snacks");
});
dinner.addEventListener("click", (e) => {
  e.preventDefault();
  fetchRecipes("dinner");
});
