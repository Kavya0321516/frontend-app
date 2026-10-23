/* ==========================================================================
   cart.js - Shopping Cart Logic
   Handles cart rendering, quantity changes, removing items, subtotal/total calculations.
   ========================================================================== */

const cartLayout = document.getElementById("cartLayout");
const cartItemsList = document.getElementById("cartItemsList");
const emptyCartView = document.getElementById("emptyCartView");
const clearCartBtn = document.getElementById("clearCartBtn");

const summaryItemCount = document.getElementById("summaryItemCount");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTax = document.getElementById("summaryTax");
const summaryTotal = document.getElementById("summaryTotal");
const proceedToCheckoutBtn = document.getElementById("proceedToCheckoutBtn");

const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22200%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%226%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EItem%3C%2Ftext%3E%3C%2Fsvg%3E";

/**
 * Renders the shopping cart items and updates totals.
 */
function renderCart() {
  const items = getPopulatedCart();
  const totalCount = getCartItemCount();

  // If cart is empty
  if (items.length === 0) {
    cartLayout.style.display = "none";
    clearCartBtn.style.display = "none";
    emptyCartView.style.display = "block";
    return;
  }

  // Cart has items
  cartLayout.style.display = "grid";
  clearCartBtn.style.display = "inline-flex";
  emptyCartView.style.display = "none";

  // Render cart items
  cartItemsList.innerHTML = items
    .map((item) => {
      return `
        <article class="cart-item" data-id="${item.id}">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="cart-item-img"
            onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
          />

          <div class="cart-item-info">
            <span class="cart-item-category">${item.category}</span>
            <h3 class="cart-item-title">${item.name}</h3>
            <span class="cart-item-unit-price">${formatCurrency(item.price)} each</span>
          </div>

          <!-- Quantity Controls -->
          <div class="cart-qty-wrapper">
            <button 
              class="qty-btn qty-decrease-btn" 
              data-id="${item.id}"
              aria-label="Decrease quantity of ${item.name}"
            >−</button>
            <span class="qty-display">${item.quantity}</span>
            <button 
              class="qty-btn qty-increase-btn" 
              data-id="${item.id}"
              aria-label="Increase quantity of ${item.name}"
            >+</button>
          </div>

          <!-- Total & Remove -->
          <div class="cart-item-actions">
            <span class="cart-item-total">${formatCurrency(item.itemTotal)}</span>
            <button 
              class="remove-item-btn" 
              data-id="${item.id}"
              aria-label="Remove ${item.name} from cart"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Remove</span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  // Update order summary calculations
  const subtotal = getCartSubtotal();
  const tax = subtotal * 0.06; // 6% estimated sales tax
  const total = subtotal + tax;

  summaryItemCount.textContent = totalCount;
  summarySubtotal.textContent = formatCurrency(subtotal);
  summaryTax.textContent = formatCurrency(tax);
  summaryTotal.textContent = formatCurrency(total);

  // Bind interactive buttons
  attachCartEventListeners();
}

/**
 * Attaches click event listeners for quantity buttons and remove buttons.
 */
function attachCartEventListeners() {
  // Increase Quantity
  const incBtns = cartItemsList.querySelectorAll(".qty-increase-btn");
  incBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"), 10);
      const cart = getCart();
      const current = cart.find((i) => i.id === id);
      if (current) {
        updateCartQuantity(id, current.quantity + 1);
        renderCart();
      }
    });
  });

  // Decrease Quantity
  const decBtns = cartItemsList.querySelectorAll(".qty-decrease-btn");
  decBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"), 10);
      const cart = getCart();
      const current = cart.find((i) => i.id === id);
      if (current) {
        if (current.quantity > 1) {
          updateCartQuantity(id, current.quantity - 1);
        } else {
          // If quantity becomes 0, remove item
          removeFromCart(id);
          showToast("Item removed from cart.", "info");
        }
        renderCart();
      }
    });
  });

  // Remove Item
  const removeBtns = cartItemsList.querySelectorAll(".remove-item-btn");
  removeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"), 10);
      const product = PRODUCTS.find((p) => p.id === id);
      removeFromCart(id);
      showToast(product ? `Removed "${product.name}"` : "Item removed.", "info");
      renderCart();
    });
  });
}

// Clear all items button
if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to empty your shopping cart?")) {
      clearCart();
      showToast("Shopping cart cleared.", "info");
      renderCart();
    }
  });
}

// Proceed to checkout button
if (proceedToCheckoutBtn) {
  proceedToCheckoutBtn.addEventListener("click", () => {
    const items = getPopulatedCart();
    if (items.length === 0) {
      alert("Your cart is empty! Please add some items first.");
      return;
    }
    window.location.href = "checkout.html";
  });
}

// Initial render — fetch live product data first, then build the cart
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts(
    () => renderCart(),   // ✅ Backend available — render with live data
    () => renderCart()    // ⚠️ Backend unavailable — render with static fallback data
  );
});
