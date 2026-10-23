/* ==========================================================================
   script.js - Sign In Page Logic & Form Validation
   Handles empty field validation, password toggle, demo login, and redirect.
   ========================================================================== */

// DOM Elements
const form = document.getElementById("signInForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailGroup = document.getElementById("emailGroup");
const passwordGroup = document.getElementById("passwordGroup");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const alertBox = document.getElementById("alertBox");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const eyeIcon = document.getElementById("eyeIcon");
const eyeSlashIcon = document.getElementById("eyeSlashIcon");
const demoFillBtn = document.getElementById("demoFillBtn");

// UI Feedback Helpers
function setError(input, errorElement, groupElement, message) {
  groupElement.classList.add("has-error");
  groupElement.classList.remove("has-success");
  errorElement.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function setSuccess(input, errorElement, groupElement) {
  groupElement.classList.remove("has-error");
  groupElement.classList.add("has-success");
  errorElement.textContent = "";
  input.setAttribute("aria-invalid", "false");
}

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
  alertBox.classList.remove("hidden");
}

function hideAlert() {
  alertBox.textContent = "";
  alertBox.className = "alert hidden";
}

// Field Validations (checks for empty fields and formatting)
function validateEmail() {
  const value = emailInput.value.trim();

  if (value === "") {
    setError(emailInput, emailError, emailGroup, "Email address is required.");
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    setError(emailInput, emailError, emailGroup, "Please enter a valid email format (e.g. user@example.com).");
    return false;
  }

  setSuccess(emailInput, emailError, emailGroup);
  return true;
}

function validatePassword() {
  const value = passwordInput.value;

  if (value === "") {
    setError(passwordInput, passwordError, passwordGroup, "Password is required.");
    return false;
  }

  if (value.length < 6) {
    setError(passwordInput, passwordError, passwordGroup, "Password must be at least 6 characters.");
    return false;
  }

  setSuccess(passwordInput, passwordError, passwordGroup);
  return true;
}

// Real-time input listeners
emailInput.addEventListener("blur", validateEmail);
emailInput.addEventListener("input", () => {
  if (emailGroup.classList.contains("has-error")) {
    validateEmail();
  }
});

passwordInput.addEventListener("blur", validatePassword);
passwordInput.addEventListener("input", () => {
  if (passwordGroup.classList.contains("has-error")) {
    validatePassword();
  }
});

// Password visibility toggle
togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordInput.getAttribute("type") === "password";
  if (isPassword) {
    passwordInput.setAttribute("type", "text");
    eyeIcon.classList.add("hidden");
    eyeSlashIcon.classList.remove("hidden");
    togglePasswordBtn.setAttribute("aria-label", "Hide password");
  } else {
    passwordInput.setAttribute("type", "password");
    eyeIcon.classList.remove("hidden");
    eyeSlashIcon.classList.add("hidden");
    togglePasswordBtn.setAttribute("aria-label", "Show password");
  }
});

// Demo Fill button for quick testing
if (demoFillBtn) {
  demoFillBtn.addEventListener("click", () => {
    emailInput.value = "demo.user@shopwave.com";
    passwordInput.value = "demoPass123";
    validateEmail();
    validatePassword();
    hideAlert();
  });
}

// Form Submission Handler
form.addEventListener("submit", (e) => {
  e.preventDefault();
  hideAlert();

  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  // If any field is empty / invalid
  if (!isEmailValid || !isPasswordValid) {
    showAlert("Please fill in all required fields properly.", "error");
    if (!isEmailValid) {
      emailInput.focus();
    } else {
      passwordInput.focus();
    }
    return;
  }

  // Demo sign-in success
  const emailVal = emailInput.value.trim();
  const rawName = emailVal.split("@")[0].replace(/[._]/g, " ");
  const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // Save session to localStorage
  if (typeof setCurrentUser === "function") {
    setCurrentUser({
      name: formattedName || "Shopper",
      email: emailVal
    });
  }

  showAlert("✓ Sign in successful! Redirecting to the store...", "success");

  // Disable button to prevent double-submit
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.disabled = true;

  // Navigate to store page
  setTimeout(() => {
    window.location.href = "store.html";
  }, 900);
});
