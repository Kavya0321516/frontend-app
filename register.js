/* ==========================================================================
   register.js - Handles Registration Form Validation and Submission
   ========================================================================== */

const form = document.getElementById("registrationForm");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const fullNameGroup = document.getElementById("fullNameGroup");
const emailGroup = document.getElementById("emailGroup");
const passwordGroup = document.getElementById("passwordGroup");

const fullNameError = document.getElementById("fullNameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const alertBox = document.getElementById("alertBox");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const eyeIcon = document.getElementById("eyeIcon");
const eyeSlashIcon = document.getElementById("eyeSlashIcon");

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

function validateFullName() {
  const value = fullNameInput.value.trim();
  if (value === "") {
    setError(fullNameInput, fullNameError, fullNameGroup, "Full name is required.");
    return false;
  }
  if (value.length < 3) {
    setError(fullNameInput, fullNameError, fullNameGroup, "Full name must be at least 3 characters.");
    return false;
  }
  const namePattern = /^[a-zA-Z\s'-]+$/;
  if (!namePattern.test(value)) {
    setError(fullNameInput, fullNameError, fullNameGroup, "Name can only contain letters and spaces.");
    return false;
  }
  setSuccess(fullNameInput, fullNameError, fullNameGroup);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  if (value === "") {
    setError(emailInput, emailError, emailGroup, "Email address is required.");
    return false;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    setError(emailInput, emailError, emailGroup, "Please enter a valid email address.");
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
  if (value.length < 8) {
    setError(passwordInput, passwordError, passwordGroup, "Password must be at least 8 characters.");
    return false;
  }
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
    setError(passwordInput, passwordError, passwordGroup, "Password must contain both letters and numbers.");
    return false;
  }
  setSuccess(passwordInput, passwordError, passwordGroup);
  return true;
}

// Real-time input listeners
fullNameInput.addEventListener("blur", validateFullName);
fullNameInput.addEventListener("input", () => {
  if (fullNameGroup.classList.contains("has-error")) validateFullName();
});

emailInput.addEventListener("blur", validateEmail);
emailInput.addEventListener("input", () => {
  if (emailGroup.classList.contains("has-error")) validateEmail();
});

passwordInput.addEventListener("blur", validatePassword);
passwordInput.addEventListener("input", () => {
  if (passwordGroup.classList.contains("has-error")) validatePassword();
});

// Toggle password visibility
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

// Form submission handler
form.addEventListener("submit", (e) => {
  e.preventDefault();
  hideAlert();

  const isNameOk = validateFullName();
  const isEmailOk = validateEmail();
  const isPassOk = validatePassword();

  if (!isNameOk || !isEmailOk || !isPassOk) {
    showAlert("Please fix the errors in the form.", "error");
    if (!isNameOk) fullNameInput.focus();
    else if (!isEmailOk) emailInput.focus();
    else if (!isPassOk) passwordInput.focus();
    return;
  }

  const name = fullNameInput.value.trim();
  const email = emailInput.value.trim();

  // Save registered user
  if (typeof setCurrentUser === "function") {
    setCurrentUser({ name, email });
  }

  showAlert(`🎉 Registration successful! Welcome to ShopWave, ${name}! Redirecting to store...`, "success");

  setTimeout(() => {
    window.location.href = "store.html";
  }, 1200);
});
