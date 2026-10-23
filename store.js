/* ==========================================================================
   store.js - Store Page Logic
   Handles product rendering, search filtering, category filtering, and Add to Cart.
   ========================================================================== */

// DOM Elements
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilters = document.getElementById("categoryFilters");
const resultsCount = document.getElementById("resultsCount");

// State
let selectedCategory = "All";
let searchQuery = "";

// Fallback image in case network or unsplash is slow/offline
const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EProduct%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

/**
 * Generates rating stars HTML string based on rating number (e.g. 4.8).
 * @param {number} rating
 * @param {number} reviewsCount
 * @returns {string}
 */
function renderRating(rating, reviewsCount) {
  const fullStars = Math.floor(rating);
  const starsHtml = "★".repeat(fullStars) + (rating % 1 >= 0.5 ? "★" : "");
  return `
    <div class="product-rating" aria-label="Rating: ${rating} out of 5 stars">
      <span>${starsHtml}</span>
      <span class="rating-count">(${reviewsCount})</span>
    </div>
  `;
}

/**
 * Filters the product catalog by selectedCategory and searchQuery.
 * @returns {Array<Object>}
 */
function getFilteredProducts() {
  return PRODUCTS.filter((product) => {
    // Category match
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    // Search query match (searches name, description, and category)
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
}

/**
 * Renders the products inside #productGrid.
 */
function renderProducts() {
  const filtered = getFilteredProducts();

  // Update counter text
  if (filtered.length === PRODUCTS.length) {
    resultsCount.textContent = `Showing all ${PRODUCTS.length} products`;
  } else {
    resultsCount.textContent = `Showing ${filtered.length} product${filtered.length === 1 ? "" : "s"}`;
  }

  // Handle empty state
  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">No products found</h3>
        <p class="empty-state-text">
          No items match "${searchQuery}" in category "${selectedCategory}".
        </p>
        <button class="reset-filter-btn" id="resetFiltersBtn">Reset Filters</button>
      </div>
    `;

    document.getElementById("resetFiltersBtn").addEventListener("click", () => {
      searchQuery = "";
      searchInput.value = "";
      selectedCategory = "All";
      updateActiveCategoryPill();
      renderProducts();
    });
    return;
  }

  // Render product cards
  productGrid.innerHTML = filtered
    .map((product) => {
      return `
        <article class="product-card" data-id="${product.id}">
          <div class="product-image-box">
            <span class="product-category-badge">${product.category}</span>
            <img 
              src="${product.image}" 
              alt="${product.name}" 
              class="product-image" 
              loading="lazy" 
              onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
            />
          </div>
          <div class="product-details">
            ${renderRating(product.rating, product.reviewsCount)}
            <h2 class="product-title">${product.name}</h2>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
              <span class="product-price">${formatCurrency(product.price)}</span>
              <button 
                class="add-to-cart-btn" 
                data-id="${product.id}"
                aria-label="Add ${product.name} to Cart"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  // Attach Add to Cart event listeners to all newly rendered buttons
  attachAddToCartListeners();
}

/**
 * Binds click events to all "Add to Cart" buttons.
 */
function attachAddToCartListeners() {
  const buttons = productGrid.querySelectorAll(".add-to-cart-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = parseInt(btn.getAttribute("data-id"), 10);
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!product) return;

      // Add to localStorage cart
      addToCart(productId);

      // Show toast notification
      showToast(`Added "${product.name}" to cart!`, "success");

      // Temporarily change button state to "Added!"
      const originalHtml = btn.innerHTML;
      btn.classList.add("added");
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Added!</span>
      `;

      setTimeout(() => {
        btn.classList.remove("added");
        btn.innerHTML = originalHtml;
      }, 1200);
    });
  });
}

/**
 * Updates CSS active class on category pill buttons.
 */
function updateActiveCategoryPill() {
  const pills = categoryFilters.querySelectorAll(".category-pill");
  pills.forEach((pill) => {
    if (pill.getAttribute("data-category") === selectedCategory) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });
}

// --------------------------------------------------------------------------
// Event Listeners
// --------------------------------------------------------------------------

// Category filter clicks
if (categoryFilters) {
  categoryFilters.addEventListener("click", (e) => {
    const pill = e.target.closest(".category-pill");
    if (!pill) return;

    selectedCategory = pill.getAttribute("data-category");
    updateActiveCategoryPill();
    renderProducts();
  });
}

// Search input typing
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });
}

// Initialize on page load — fetch from backend first, then render
document.addEventListener("DOMContentLoaded", () => {
  showLoadingState();

  fetchProducts(
    // ✅ Success: backend returned products
    () => {
      renderProducts();
    },
    // ❌ Error: backend is unavailable
    (err) => {
      showBackendError(err);
    }
  );
});

/**
 * Shows a loading spinner while products are being fetched from the backend.
 */
function showLoadingState() {
  productGrid.innerHTML = `
    <div class="loading-state" style="
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
      color: #64748b;
    ">
      <div class="loading-spinner" style="
        width: 48px; height: 48px;
        border: 4px solid #e2e8f0;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      "></div>
      <p style="font-size: 1rem; font-weight: 500;">Loading products from server…</p>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    </div>
  `;
  resultsCount.textContent = "Fetching products…";
}

/**
 * Shows a friendly error banner when the backend cannot be reached.
 * @param {Error} err
 */
function showBackendError(err) {
  productGrid.innerHTML = `
    <div class="backend-error-state" style="
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
      text-align: center;
    ">
      <div style="font-size: 3rem;">⚠️</div>
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0;">
        Could not connect to the server
      </h3>
      <p style="color: #64748b; max-width: 480px; margin: 0; line-height: 1.6;">
        The product catalog could not be loaded because the backend server is unavailable.
        Please make sure your <strong>Spring Boot backend</strong> is running at
        <code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">http://localhost:8080</code>
        and try refreshing the page.
      </p>
      <button
        onclick="location.reload()"
        style="
          margin-top: 0.5rem;
          padding: 0.6rem 1.5rem;
          background: #6366f1;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
        "
      >🔄 Retry</button>
      <p style="font-size: 0.78rem; color: #94a3b8; margin: 0;">
        Error: ${err.message}
      </p>
    </div>
  `;
  resultsCount.textContent = "Backend unavailable";
}
