/* ==========================================================================
   products.js - Product Data & Shared Cart / Auth Utilities
   Fetches live product data from the Spring Boot backend API.
   Falls back to static data if the backend is unavailable.
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. Backend API Configuration
// --------------------------------------------------------------------------
const API_BASE_URL = "http://localhost:8080";

// --------------------------------------------------------------------------
// 2. Products Catalog (starts empty; populated by fetchProducts())
// --------------------------------------------------------------------------
let PRODUCTS = [
  {
    id: 1,
    name: "Wireless Noise-Canceling Headphones",
    category: "Electronics",
    price: 199.99,
    rating: 4.8,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio."
  },
  {
    id: 2,
    name: "Smart Fitness Watch Series 5",
    category: "Electronics",
    price: 149.50,
    rating: 4.7,
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    description: "Track your workouts, heart rate, and sleep with high precision. Water-resistant with an OLED display."
  },
  {
    id: 3,
    name: "Ergonomic Mechanical Keyboard",
    category: "Electronics",
    price: 89.00,
    rating: 4.9,
    reviewsCount: 215,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    description: "Tactile mechanical switches, customizable RGB backlighting, and a comfortable wrist rest for long workdays."
  },
  {
    id: 4,
    name: "Classic Denim Trucker Jacket",
    category: "Fashion",
    price: 65.00,
    rating: 4.6,
    reviewsCount: 76,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80",
    description: "Timeless denim jacket crafted from 100% durable cotton. Features a relaxed fit and durable metal buttons."
  },
  {
    id: 5,
    name: "Casual Streetwear Sneakers",
    category: "Fashion",
    price: 54.99,
    rating: 4.5,
    reviewsCount: 110,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    description: "Lightweight, breathable sneakers designed for all-day comfort and effortless modern street style."
  },
  {
    id: 6,
    name: "Minimalist Leather Backpack",
    category: "Accessories",
    price: 79.99,
    rating: 4.8,
    reviewsCount: 89,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    description: "Water-repellent faux leather with a dedicated padded 15-inch laptop compartment and hidden anti-theft pockets."
  },
  {
    id: 7,
    name: "Polarized Classic Sunglasses",
    category: "Accessories",
    price: 29.99,
    rating: 4.4,
    reviewsCount: 64,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
    description: "UV400 protective polarized lenses with a lightweight, shatterproof alloy frame for outdoor clarity."
  },
  {
    id: 8,
    name: "Ceramic Ultrasonic Aroma Diffuser",
    category: "Home & Living",
    price: 38.50,
    rating: 4.7,
    reviewsCount: 133,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80",
    description: "Quiet ultrasonic mist diffuser with soft ambient lighting and an automatic shut-off safety feature."
  },
  {
    id: 9,
    name: "Insulated Stainless Steel Bottle",
    category: "Home & Living",
    price: 24.99,
    rating: 4.9,
    reviewsCount: 180,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    description: "Double-wall vacuum insulation keeps cold beverages ice-cold for 24 hours and hot coffee warm for 12 hours."
  },
  {
    id: 10,
    name: "Modern LED Desk Lamp & Wireless Charger",
    category: "Home & Living",
    price: 45.00,
    rating: 4.6,
    reviewsCount: 52,
    image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600&auto=format&fit=crop&q=80",
    description: "Eye-caring touch-controlled LED lamp with 5 brightness levels and a built-in 10W fast wireless charging pad."
  }
];

// Keep a copy of the static products as a fallback
const STATIC_PRODUCTS = [...PRODUCTS];

// --------------------------------------------------------------------------
// 3. Backend Fetch — loads live products from Spring Boot API
// --------------------------------------------------------------------------

/**
 * Fetches products from the backend API and updates the global PRODUCTS array.
 * Normalizes backend field names to match the frontend's expectations.
 * @param {function} onSuccess - Called with the fetched products array on success.
 * @param {function} onError   - Called with the Error object if the request fails.
 */
async function fetchProducts(onSuccess, onError) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    const data = await response.json();

    // Normalize each product: map backend field names to frontend expectations
    PRODUCTS = data.map((p) => ({
      id:            p.id,
      name:          p.name,
      description:   p.description,
      price:         p.price,
      image:         p.imageUrl || p.image || "",   // backend sends imageUrl
      category:      p.category,
      stockQuantity: p.stockQuantity,
      rating:        p.rating       ?? 4.5,          // default if not provided
      reviewsCount:  p.reviewsCount ?? 0,
    }));

    if (typeof onSuccess === "function") onSuccess(PRODUCTS);
  } catch (err) {
    console.error("[ShopWave] Failed to fetch products from backend:", err);
    if (typeof onError === "function") onError(err);
  }
}

// --------------------------------------------------------------------------
// 4. LocalStorage Cart Management Utilities
// --------------------------------------------------------------------------
const CART_STORAGE_KEY = "shopping_store_cart_v1";
const USER_STORAGE_KEY = "shopping_store_user_v1";

/**
 * Retrieves the current cart from localStorage.
 * @returns {Array<{ id: number, quantity: number }>}
 */
function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading cart from localStorage:", err);
    return [];
  }
}

/**
 * Saves the updated cart to localStorage.
 * @param {Array<{ id: number, quantity: number }>} cart
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadges();
  } catch (err) {
    console.error("Error writing cart to localStorage:", err);
  }
}

/**
 * Adds 1 unit of a product to the cart.
 * If already in the cart, increments the quantity.
 * @param {number} productId
 * @returns {Array} Updated cart
 */
function addToCart(productId) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  return cart;
}

/**
 * Updates the quantity of a specific item in the cart.
 * If the quantity drops to 0 or less, the item is removed.
 * @param {number} productId
 * @param {number} quantity
 */
function updateCartQuantity(productId, quantity) {
  let cart = getCart();

  if (quantity <= 0) {
    cart = cart.filter(item => item.id !== productId);
  } else {
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity = quantity;
    }
  }

  saveCart(cart);
  return cart;
}

/**
 * Completely removes an item from the cart.
 * @param {number} productId
 */
function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  return cart;
}

/**
 * Clears all items in the cart.
 */
function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartBadges();
}

/**
 * Calculates total number of units in the cart.
 * @returns {number}
 */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Populates product details for all items in the cart.
 * @returns {Array<{ product: Object, quantity: number, itemTotal: number }>}
 */
function getPopulatedCart() {
  const cart = getCart();
  return cart
    .map(item => {
      const product = PRODUCTS.find(p => p.id === item.id);
      if (!product) return null;
      return {
        ...product,
        quantity: item.quantity,
        itemTotal: product.price * item.quantity
      };
    })
    .filter(Boolean);
}

/**
 * Calculates the subtotal of the items in the cart.
 * @returns {number}
 */
function getCartSubtotal() {
  const items = getPopulatedCart();
  return items.reduce((sum, item) => sum + item.itemTotal, 0);
}

// --------------------------------------------------------------------------
// 5. UI Helpers & Formatting
// --------------------------------------------------------------------------

/**
 * Formats a number as a US currency string ($XX.XX).
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  return "$" + Number(amount).toFixed(2);
}

/**
 * Updates any cart badge elements with class '.cart-badge-count' across the page.
 */
function updateCartBadges() {
  const count = getCartItemCount();
  const badges = document.querySelectorAll(".cart-badge-count");
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  });
}

/**
 * Displays a non-blocking toast notification.
 * @param {string} message
 * @param {'success' | 'info'} type
 */
function showToast(message, type = "success") {
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === "success" ? "✓" : "ℹ"}</span>
    <span class="toast-text">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --------------------------------------------------------------------------
// 6. User Session Utilities (Demo Auth)
// --------------------------------------------------------------------------

/**
 * Gets currently logged in user info.
 * @returns {{ name: string, email: string } | null}
 */
function getCurrentUser() {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Sets current user in localStorage.
 * @param {{ name: string, email: string }} user
 */
function setCurrentUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Logs out the user by clearing user session and redirects to sign-in.
 */
function logout() {
  localStorage.removeItem(USER_STORAGE_KEY);
  window.location.href = "index.html";
}

// Run badge update automatically when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadges();

  // If there is a user-greeting element, populate with current user name
  const greetingEl = document.getElementById("userGreeting");
  if (greetingEl) {
    const user = getCurrentUser();
    if (user && user.name) {
      greetingEl.textContent = `Hi, ${user.name.split(" ")[0]}!`;
    }
  }

  // Bind any logout buttons
  const logoutBtns = document.querySelectorAll(".logout-btn");
  logoutBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  });
});
