const RecipeApp = (function () {
    console.log("RecipeApp initializing...");

    // =====================
    // Recipe Data
    // =====================
    const recipes = [
        {
            id: 1,
            title: "Classic Spaghetti Carbonara",
            time: 25,
            difficulty: "easy",
            description: "A creamy Italian pasta dish made with eggs, cheese, pancetta, and black pepper.",
            category: "pasta",
            ingredients: ["Spaghetti", "Eggs", "Parmesan", "Pancetta", "Pepper"],
            steps: [
                "Boil pasta",
                {
                    text: "Prepare sauce",
                    substeps: [
                        "Whisk eggs and cheese",
                        "Cook pancetta",
                        { text: "Combine", substeps: ["Add pasta", "Mix quickly"] }
                    ]
                },
                "Serve immediately"
            ]
        },
        {
            id: 2,
            title: "Chicken Tikka Masala",
            time: 45,
            difficulty: "medium",
            description: "Tender chicken pieces in a creamy, spiced tomato sauce.",
            category: "curry",
            ingredients: ["Chicken", "Yogurt", "Spices", "Tomato puree", "Cream"],
            steps: [
                "Marinate chicken",
                { text: "Cook sauce", substeps: ["Heat oil", "Add spices", "Add tomato puree"] },
                "Combine chicken and sauce",
                "Simmer and serve"
            ]
        },
        {
            id: 3,
            title: "Homemade Croissants",
            time: 180,
            difficulty: "hard",
            description: "Buttery, flaky French pastries.",
            category: "baking",
            ingredients: ["Flour", "Butter", "Yeast", "Milk", "Sugar"],
            steps: [
                "Prepare dough",
                { text: "Laminate dough", substeps: ["Fold butter", "Chill dough", "Repeat folds"] },
                "Shape croissants",
                "Bake until golden"
            ]
        },
        {
            id: 4,
            title: "Greek Salad",
            time: 15,
            difficulty: "easy",
            description: "Fresh vegetables with feta and olives.",
            category: "salad",
            ingredients: ["Tomatoes", "Cucumber", "Feta", "Olives", "Olive oil"],
            steps: ["Chop vegetables", "Add feta and olives", "Drizzle oil", "Mix and serve"]
        },
        {
            id: 5,
            title: "Beef Wellington",
            time: 120,
            difficulty: "hard",
            description: "Beef fillet wrapped in pastry.",
            category: "meat",
            ingredients: ["Beef", "Mushrooms", "Pastry", "Mustard"],
            steps: [
                "Sear beef",
                { text: "Prepare duxelles", substeps: ["Chop mushrooms", "Cook until dry"] },
                "Wrap and bake"
            ]
        },
        {
            id: 6,
            title: "Vegetable Stir Fry",
            time: 20,
            difficulty: "easy",
            description: "Quick stir-fried vegetables.",
            category: "vegetarian",
            ingredients: ["Bell peppers", "Carrots", "Broccoli", "Soy sauce"],
            steps: ["Chop vegetables", "Heat pan", "Stir fry", "Add sauce"]
        },
        {
            id: 7,
            title: "Pad Thai",
            time: 30,
            difficulty: "medium",
            description: "Thai stir-fried noodles.",
            category: "noodles",
            ingredients: ["Rice noodles", "Shrimp", "Peanuts", "Tamarind sauce"],
            steps: [
                "Soak noodles",
                { text: "Prepare sauce", substeps: ["Mix tamarind", "Add seasoning"] },
                "Stir fry and combine"
            ]
        },
        {
            id: 8,
            title: "Margherita Pizza",
            time: 60,
            difficulty: "medium",
            description: "Classic Italian pizza.",
            category: "pizza",
            ingredients: ["Pizza dough", "Tomato sauce", "Mozzarella", "Basil"],
            steps: ["Prepare dough", "Add toppings", "Bake pizza", "Garnish"]
        }
    ];

    // =====================
    // State
    // =====================
    let currentFilter = "all";
    let currentSort = "none";
    let searchQuery = "";
    let favorites = JSON.parse(localStorage.getItem("recipeFavorites")) || [];
    let debounceTimer;

    // =====================
    // DOM Selection
    // =====================
    const recipeContainer = document.querySelector("#recipe-container");
    const filterButtons = document.querySelectorAll("[data-filter]");
    const sortButtons = document.querySelectorAll("[data-sort]");
    const searchInput = document.querySelector("#search-input");
    const clearSearchBtn = document.querySelector("#clear-search");
    const counterEl = document.querySelector("#recipe-counter");

    // =====================
    // Recursive Steps Renderer
    // =====================
    const renderSteps = (steps) => {
        let html = "<ul>";
        steps.forEach(step => {
            if (typeof step === "string") {
                html += `<li>${step}</li>`;
            } else {
                html += `<li>${step.text}${renderSteps(step.substeps)}</li>`;
            }
        });
        html += "</ul>";
        return html;
    };

    // =====================
    // Card Template
    // =====================
    const createRecipeCard = (recipe) => {
        const isFav = favorites.includes(recipe.id);
        return `
        <div class="recipe-card">
            <button class="favorite-btn" data-id="${recipe.id}">
                ${isFav ? "❤️" : "🤍"}
            </button>

            <h3>${recipe.title}</h3>
            <div class="recipe-meta">
                <span>⏱️ ${recipe.time} min</span>
                <span class="difficulty ${recipe.difficulty}">${recipe.difficulty}</span>
            </div>
            <p>${recipe.description}</p>

            <div class="toggle-buttons">
                <button class="toggle-btn" data-toggle="ingredients" data-id="${recipe.id}">Show Ingredients</button>
                <button class="toggle-btn" data-toggle="steps" data-id="${recipe.id}">Show Steps</button>
            </div>

            <div class="ingredients-container" data-content="ingredients-${recipe.id}">
                <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
            </div>

            <div class="steps-container" data-content="steps-${recipe.id}">
                ${renderSteps(recipe.steps)}
            </div>
        </div>`;
    };

    // =====================
    // Filters
    // =====================
    const applySearch = (list) => {
        if (!searchQuery) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(r =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.ingredients.some(i => i.toLowerCase().includes(q))
        );
    };

    const applyFilter = (list) => {
        if (currentFilter === "favorites") return list.filter(r => favorites.includes(r.id));
        if (currentFilter === "quick") return list.filter(r => r.time < 30);
        if (currentFilter === "all") return list;
        return list.filter(r => r.difficulty === currentFilter);
    };

    const applySort = (list) => {
        if (currentSort === "name") return [...list].sort((a, b) => a.title.localeCompare(b.title));
        if (currentSort === "time") return [...list].sort((a, b) => a.time - b.time);
        return list;
    };

    // =====================
    // Rendering
    // =====================
    const renderRecipes = (list) => {
        recipeContainer.innerHTML = list.map(createRecipeCard).join("");
        counterEl.textContent = `Showing ${list.length} of ${recipes.length} recipes`;
    };

    const updateDisplay = () => {
        let result = applySearch(recipes);
        result = applyFilter(result);
        result = applySort(result);
        renderRecipes(result);
        updateActiveButtons();
    };

    // =====================
    // UI Helpers
    // =====================
    const updateActiveButtons = () => {
        filterButtons.forEach(b => b.classList.toggle("active", b.dataset.filter === currentFilter));
        sortButtons.forEach(b => b.classList.toggle("active", b.dataset.sort === currentSort));
    };

    const saveFavorites = () => {
        localStorage.setItem("recipeFavorites", JSON.stringify(favorites));
    };

    // =====================
    // Event Handling
    // =====================
    const handleContainerClick = (e) => {
        const toggleBtn = e.target.closest(".toggle-btn");
        const favBtn = e.target.closest(".favorite-btn");

        if (toggleBtn) {
            const id = toggleBtn.dataset.id;
            const type = toggleBtn.dataset.toggle;
            const container = document.querySelector(`[data-content="${type}-${id}"]`);
            container.classList.toggle("visible");
            toggleBtn.textContent = container.classList.contains("visible")
                ? `Hide ${type}`
                : `Show ${type}`;
        }

        if (favBtn) {
            const id = Number(favBtn.dataset.id);
            favorites = favorites.includes(id)
                ? favorites.filter(f => f !== id)
                : [...favorites, id];
            saveFavorites();
            updateDisplay();
        }
    };

    const handleSearch = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchQuery = searchInput.value.trim();
            clearSearchBtn.style.display = searchQuery ? "inline" : "none";
            updateDisplay();
        }, 300);
    };

    const clearSearch = () => {
        searchQuery = "";
        searchInput.value = "";
        clearSearchBtn.style.display = "none";
        updateDisplay();
    };

    // =====================
    // Init
    // =====================
    const init = () => {
        recipeContainer.addEventListener("click", handleContainerClick);
        searchInput.addEventListener("input", handleSearch);
        clearSearchBtn.addEventListener("click", clearSearch);

        filterButtons.forEach(b => b.addEventListener("click", () => {
            currentFilter = b.dataset.filter;
            updateDisplay();
        }));

        sortButtons.forEach(b => b.addEventListener("click", () => {
            currentSort = b.dataset.sort;
            updateDisplay();
        }));

        updateDisplay();
        console.log("RecipeApp ready!");
    };

    return { init };
})();

// Start app
RecipeApp.init();
