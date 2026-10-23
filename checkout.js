/* ==========================================================================
   checkout.js - Checkout Page Logic
   Handles shipping form validation, summary calculation, and simulated order placement.
   ========================================================================== */

// DOM Elements
const checkoutForm = document.getElementById("checkoutForm");
const summaryItemsList = document.getElementById("summaryItemsList");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutTax = document.getElementById("checkoutTax");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutAlert = document.getElementById("checkoutAlert");

// Input Fields
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const addressInput = document.getElementById("address");
const cityInput = document.getElementById("city");
const postalCodeInput = document.getElementById("postalCode");

// Input Groups & Errors
const fullNameGroup = document.getElementById("fullNameGroup");
const emailGroup = document.getElementById("emailGroup");
const addressGroup = document.getElementById("addressGroup");
const cityGroup = document.getElementById("cityGroup");
const postalCodeGroup = document.getElementById("postalCodeGroup");

const fullNameError = document.getElementById("fullNameError");
const emailError = document.getElementById("emailError");
const addressError = document.getElementById("addressError");
const cityError = document.getElementById("cityError");
const postalCodeError = document.getElementById("postalCodeError");

// Modal Elements
const modal = document.getElementById("orderConfirmationModal");
const modalOrderId = document.getElementById("modalOrderId");
const modalCustomerName = document.getElementById("modalCustomerName");
const modalCustomerEmail = document.getElementById("modalCustomerEmail");

const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2248%22%20height%3D%2248%22%20viewBox%3D%220%200%2048%2048%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%2248%22%20height%3D%2248%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%20dy%3D%223.5%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EItem%3C%2Ftext%3E%3C%2Fsvg%3E";

/**
 * Loads order summary from current cart.
 */
function loadOrderSummary() {
  const items = getPopulatedCart();

  // If user opens checkout directly with empty cart, notify and redirect
  if (items.length === 0) {
    alert("Your cart is empty. Please add items before checking out.");
    window.location.href = "store.html";
    return;
  }

  // Populate items
  summaryItemsList.innerHTML = items
    .map((item) => {
      return `
        <div class="summary-item-row">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="summary-item-img"
            onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
          />
          <div class="summary-item-meta">
            <div class="summary-item-name">${item.name}</div>
            <div class="summary-item-qty">Qty: ${item.quantity} × ${formatCurrency(item.price)}</div>
          </div>
          <div class="summary-item-price">${formatCurrency(item.itemTotal)}</div>
        </div>
      `;
    })
    .join("");

  // Calculate totals
  const subtotal = getCartSubtotal();
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  checkoutSubtotal.textContent = formatCurrency(subtotal);
  checkoutTax.textContent = formatCurrency(tax);
  checkoutTotal.textContent = formatCurrency(total);
}

/**
 * Pre-fills logged in user information if available.
 */
function prefillUserInfo() {
  const user = getCurrentUser();
  if (user) {
    if (user.name && !fullNameInput.value) fullNameInput.value = user.name;
    if (user.email && !emailInput.value) emailInput.value = user.email;
  }
}

// --------------------------------------------------------------------------
// Validation Helpers
// --------------------------------------------------------------------------
function setError(input, errorElement, groupElement, message) {
  groupElement.classList.add("has-error");
  errorElement.textContent = message;
}

function clearError(errorElement, groupElement) {
  groupElement.classList.remove("has-error");
  errorElement.textContent = "";
}

function validateField(input, errorEl, groupEl, message) {
  if (input.value.trim() === "") {
    setError(input, errorEl, groupEl, message);
    return false;
  }
  clearError(errorEl, groupEl);
  return true;
}

function validateEmailField() {
  const val = emailInput.value.trim();
  if (val === "") {
    setError(emailInput, emailError, emailGroup, "Email is required.");
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(val)) {
    setError(emailInput, emailError, emailGroup, "Enter a valid email address.");
    return false;
  }
  clearError(emailError, emailGroup);
  return true;
}

// Clear errors on input
fullNameInput.addEventListener("input", () => clearError(fullNameError, fullNameGroup));
emailInput.addEventListener("input", () => clearError(emailError, emailGroup));
addressInput.addEventListener("input", () => clearError(addressError, addressGroup));
cityInput.addEventListener("input", () => clearError(cityError, cityGroup));
postalCodeInput.addEventListener("input", () => clearError(postalCodeError, postalCodeGroup));

// Form Submission
checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const isNameOk = validateField(fullNameInput, fullNameError, fullNameGroup, "Full name is required.");
  const isEmailOk = validateEmailField();
  const isAddressOk = validateField(addressInput, addressError, addressGroup, "Street address is required.");
  const isCityOk = validateField(cityInput, cityError, cityGroup, "City is required.");
  const isPostalOk = validateField(postalCodeInput, postalCodeError, postalCodeGroup, "Postal/ZIP code is required.");

  if (!isNameOk || !isEmailOk || !isAddressOk || !isCityOk || !isPostalOk) {
    checkoutAlert.textContent = "Please complete all required shipping fields.";
    checkoutAlert.className = "alert error";
    checkoutAlert.classList.remove("hidden");
    return;
  }

  // Generate simulated Order ID
  const randomOrderNum = "SW-" + Math.floor(10000 + Math.random() * 90000);

  // Fill Confirmation Modal
  modalOrderId.textContent = `Order #${randomOrderNum}`;
  modalCustomerName.textContent = fullNameInput.value.trim();
  modalCustomerEmail.textContent = emailInput.value.trim();

  // Clear Cart
  clearCart();

  // Show Modal
  modal.style.display = "flex";
});

// Initialize on DOM ready — fetch live product data first, then load summary
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts(
    () => { loadOrderSummary(); prefillUserInfo(); },   // ✅ Backend available
    () => { loadOrderSummary(); prefillUserInfo(); }    // ⚠️ Fallback to static data
  );
});
