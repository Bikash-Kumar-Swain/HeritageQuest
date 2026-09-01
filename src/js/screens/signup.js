/* ==========================================================================
   GeoQuest Screen 3: Create Account (Sign Up) Screen
   Name + Email + Password + Confirm Password + Strength Meter + Back to Login
   ========================================================================== */

import { SVG_ICONS } from '../assets.js';
import { appState } from '../state.js';
import { Validator } from '../validator.js';
import { sound } from '../audio.js';
import { registerUser } from '../authService.js';

export function renderSignupScreen() {
  const container = document.createElement('div');
  container.className = 'screen-view signup-screen anim-fade-in';
  container.id = 'signup-screen';

  let showPass1 = false;
  let showPass2 = false;

  container.innerHTML = `
    <div class="screen-content">
      <!-- Top Navigation Bar -->
      <div class="signup-top-nav">
        <button type="button" class="back-btn" id="btn-signup-back" aria-label="Back to Login">
          <span style="display:flex;">${SVG_ICONS.back}</span>
          <span>Back</span>
        </button>
      </div>

      <!-- Header Section -->
      <div class="signup-header">
        <div class="header-logo-icon anim-pulse-logo" style="width:56px; height:56px;">
          ${SVG_ICONS.logoHero}
        </div>
        <h2 class="geoquest-brand" style="font-size:22px; margin-top:6px;">JOIN THE GUILD</h2>
        <p class="geoquest-subtitle">Create Your Explorer Profile</p>
      </div>

      <!-- Sign Up Form -->
      <form id="signup-form" class="signup-form" novalidate>
        <!-- Full Name Input -->
        <div class="form-group">
          <div class="input-container" id="name-container">
            <span class="input-icon-lead">${SVG_ICONS.user}</span>
            <input 
              type="text" 
              id="signup-name" 
              class="input-field" 
              placeholder="Explorer Name" 
              autocomplete="name"
              required
            />
          </div>
          <span class="input-error-msg" id="name-error"></span>
        </div>

        <!-- Email Input -->
        <div class="form-group">
          <div class="input-container" id="email-container">
            <span class="input-icon-lead">${SVG_ICONS.email}</span>
            <input 
              type="email" 
              id="signup-email" 
              class="input-field" 
              placeholder="Email Address" 
              autocomplete="email"
              inputmode="email"
              required
            />
          </div>
          <span class="input-error-msg" id="email-error"></span>
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <div class="input-container" id="password-container">
            <span class="input-icon-lead">${SVG_ICONS.lock}</span>
            <input 
              type="password" 
              id="signup-password" 
              class="input-field" 
              placeholder="Password (min. 6 characters)" 
              autocomplete="new-password"
              required
            />
            <button type="button" class="input-toggle-btn" id="toggle-pass-1" aria-label="Toggle password visibility">
              ${SVG_ICONS.eye}
            </button>
          </div>
          <span class="input-error-msg" id="password-error"></span>

          <!-- Password Strength Meter -->
          <div class="strength-meter-wrap" id="signup-strength-wrap" data-strength="0">
            <div class="strength-bars">
              <div class="strength-bar-seg seg-1"></div>
              <div class="strength-bar-seg seg-2"></div>
              <div class="strength-bar-seg seg-3"></div>
              <div class="strength-bar-seg seg-4"></div>
            </div>
            <div class="strength-info">
              <span>Security Rating:</span>
              <span class="strength-text" id="signup-strength-label">None</span>
            </div>
          </div>
        </div>

        <!-- Confirm Password Input -->
        <div class="form-group">
          <div class="input-container" id="cpassword-container">
            <span class="input-icon-lead">${SVG_ICONS.lock}</span>
            <input 
              type="password" 
              id="signup-cpassword" 
              class="input-field" 
              placeholder="Confirm Password" 
              autocomplete="new-password"
              required
            />
            <button type="button" class="input-toggle-btn" id="toggle-pass-2" aria-label="Toggle confirm password">
              ${SVG_ICONS.eye}
            </button>
          </div>
          <span class="input-error-msg" id="cpassword-error"></span>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn btn-gold" id="btn-signup-submit" style="margin-top:6px;">
          <span>CREATE ACCOUNT</span>
        </button>
      </form>

      <!-- Back to Login Text -->
      <div class="auth-footer-text" style="margin-top:16px;">
        <span>Already registered?</span>
        <button type="button" class="auth-footer-link" id="btn-back-to-login">
          Log In
        </button>
      </div>
    </div>
  `;

  // Scoped styling
  const style = document.createElement('style');
  style.textContent = `
    .signup-top-nav {
      width: 100%;
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px 6px 6px;
      border-radius: var(--radius-full);
      color: var(--text-secondary);
      font-size: 13.5px;
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .back-btn:hover {
      color: var(--gold-400);
      background: rgba(212, 175, 55, 0.1);
    }

    .signup-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 20px;
    }

    .signup-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `;
  container.appendChild(style);

  // Setup Event Listeners
  const backBtn = container.querySelector('#btn-signup-back');
  const backLink = container.querySelector('#btn-back-to-login');
  const form = container.querySelector('#signup-form');

  const nameInput = container.querySelector('#signup-name');
  const nameContainer = container.querySelector('#name-container');
  const nameError = container.querySelector('#name-error');

  const emailInput = container.querySelector('#signup-email');
  const emailContainer = container.querySelector('#email-container');
  const emailError = container.querySelector('#email-error');

  const passInput = container.querySelector('#signup-password');
  const passContainer = container.querySelector('#password-container');
  const passError = container.querySelector('#password-error');

  const cpassInput = container.querySelector('#signup-cpassword');
  const cpassContainer = container.querySelector('#cpassword-container');
  const cpassError = container.querySelector('#cpassword-error');

  const togglePass1Btn = container.querySelector('#toggle-pass-1');
  const togglePass2Btn = container.querySelector('#toggle-pass-2');

  const strengthWrap = container.querySelector('#signup-strength-wrap');
  const strengthLabel = container.querySelector('#signup-strength-label');

  // Navigation handlers
  backBtn.addEventListener('click', () => appState.navigate('login'));
  backLink.addEventListener('click', () => appState.navigate('login'));

  // Toggle Visibility
  togglePass1Btn.addEventListener('click', () => {
    sound.playTap();
    showPass1 = !showPass1;
    passInput.type = showPass1 ? 'text' : 'password';
    togglePass1Btn.innerHTML = showPass1 ? SVG_ICONS.eyeOff : SVG_ICONS.eye;
  });

  togglePass2Btn.addEventListener('click', () => {
    sound.playTap();
    showPass2 = !showPass2;
    cpassInput.type = showPass2 ? 'text' : 'password';
    togglePass2Btn.innerHTML = showPass2 ? SVG_ICONS.eyeOff : SVG_ICONS.eye;
  });

  // Dynamic Password Strength Meter
  passInput.addEventListener('input', () => {
    passContainer.classList.remove('error');
    passError.classList.remove('visible');
    const strength = Validator.calculateStrength(passInput.value);
    strengthWrap.setAttribute('data-strength', strength.score);
    strengthLabel.textContent = strength.label;
    strengthLabel.style = strength.textClass;
  });

  // Clear errors on input
  nameInput.addEventListener('input', () => {
    nameContainer.classList.remove('error');
    nameError.classList.remove('visible');
  });

  emailInput.addEventListener('input', () => {
    emailContainer.classList.remove('error');
    emailError.classList.remove('visible');
  });

  cpassInput.addEventListener('input', () => {
    cpassContainer.classList.remove('error');
    cpassError.classList.remove('visible');
  });

  // Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    sound.playTap();

    let hasError = false;

    // Validate Name
    if (!nameInput.value || !nameInput.value.trim()) {
      nameContainer.classList.add('error', 'anim-shake');
      setTimeout(() => nameContainer.classList.remove('anim-shake'), 400);
      nameError.textContent = 'Explorer name is required.';
      nameError.classList.add('visible');
      hasError = true;
    }

    // Validate Email
    const emailRes = Validator.validateEmail(emailInput.value);
    if (!emailRes.isValid) {
      emailContainer.classList.add('error', 'anim-shake');
      setTimeout(() => emailContainer.classList.remove('anim-shake'), 400);
      emailError.textContent = emailRes.message;
      emailError.classList.add('visible');
      hasError = true;
    }

    // Validate Password
    const passRes = Validator.validatePassword(passInput.value, 6);
    if (!passRes.isValid) {
      passContainer.classList.add('error', 'anim-shake');
      setTimeout(() => passContainer.classList.remove('anim-shake'), 400);
      passError.textContent = passRes.message;
      passError.classList.add('visible');
      hasError = true;
    }

    // Validate Confirm Password
    const cpassRes = Validator.validateConfirmPassword(passInput.value, cpassInput.value);
    if (!cpassRes.isValid) {
      cpassContainer.classList.add('error', 'anim-shake');
      setTimeout(() => cpassContainer.classList.remove('anim-shake'), 400);
      cpassError.textContent = cpassRes.message;
      cpassError.classList.add('visible');
      hasError = true;
    }

    if (hasError) {
      sound.playError();
      return;
    }

    // Firebase Registration
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value;

    try {
    console.log("1. Signup handler reached");

    console.log("2. Calling registerUser with:", email);

    const firebaseUser = await registerUser(
        name,
        email,
        password
    );

    console.log("3. Firebase user created:", firebaseUser.uid);

    // Keep the existing GeoQuest app state/session with clean user initialization
    appState.setUser({
        uid: firebaseUser.uid,
        username: name,
        email: email,
        role: 'Registered Explorer',
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
        title: 'Novice Cartographer',
        streak: 1,
        stats: {
          missionsCompleted: 0,
          relicsDiscovered: 0,
          countriesExplored: 0,
          totalDistanceKm: "0.0"
        },
        isGuest: false
    });

    sound.playChime();

    appState.showToast(
        `Welcome to GeoQuest, ${name}!`,
        'success',
        3500
    );

    appState.navigate('home');

  } catch (error) {
    console.error('Firebase registration failed:', error);

    let message = 'Unable to create your account. Please try again.';

    if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
    } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
        message = 'Your password is too weak.';
    } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
    }

    sound.playError();

    appState.showToast(
        message,
        'error',
        4000
    );
} });

  return container;
}