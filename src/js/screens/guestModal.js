/* ==========================================================================
   GeoQuest Modals: Guest Account Setup & Forgot Password
   ========================================================================== */

import { SVG_ICONS } from '../assets.js';
import { appState } from '../state.js';
import { Validator } from '../validator.js';
import { registerGuestUser } from '../authService.js';
import { sound } from '../audio.js';
import { getHomeModalHTML, setupHomeModalEvents } from './homeModals.js';

export function renderModalContainer() {
  const modalWrap = document.createElement('div');
  modalWrap.id = 'modal-root';

  appState.subscribe((event, data) => {
    if (event === 'modal_open') {
      if (data.name === 'guest_setup') {
        modalWrap.innerHTML = createGuestModalHTML();
        setupGuestModalEvents(modalWrap);
      } else if (data.name === 'forgot_password') {
        modalWrap.innerHTML = createForgotPasswordModalHTML();
        setupForgotPasswordEvents(modalWrap);
      } else if (['profile', 'mailbox', 'leaderboard', 'heritage_ai', 'settings', 'collection'].includes(data.name)) {
        modalWrap.innerHTML = getHomeModalHTML(data.name, data.data);
        setupHomeModalEvents(modalWrap, data.name);
      }
    } else if (event === 'modal_close') {
      modalWrap.innerHTML = '';
    }
  });

  return modalWrap;
}

// ---------------------------------------------------------
// 1. Guest Setup Modal HTML
// ---------------------------------------------------------
function createGuestModalHTML() {
  return `
    <div class="modal-backdrop" id="guest-backdrop">
      <div class="modal-sheet" id="guest-sheet">
        <div class="modal-handle"></div>

        <!-- Header -->
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:var(--gold-400); display:flex;">${SVG_ICONS.user}</span>
            <h3 class="modal-title">Create Guest Account</h3>
          </div>
          <button type="button" class="modal-close-btn" id="guest-close-btn" aria-label="Close modal">
            ${SVG_ICONS.close}
          </button>
        </div>

        <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:16px;">
          Create a Guest Player ID and password. Your guest account is securely saved in Firebase so you can log back in later.
        </p>

        <form id="guest-form" novalidate style="display:flex; flex-direction:column; gap:12px;">
          <!-- Username Input -->
          <div class="form-group">
            <label style="font-size:11.5px; font-weight:600; color:var(--gold-400); text-transform:uppercase; letter-spacing:1px;">
              Explorer Codename
            </label>
            <div class="input-container" id="guest-user-container">
              <span class="input-icon-lead">${SVG_ICONS.user}</span>
              <input 
                type="text" 
                id="guest-username" 
                class="input-field" 
                placeholder="Choose a username" 
                autocomplete="username"
                maxlength="20"
                required
              />
            </div>
            <span class="input-error-msg" id="guest-user-error"></span>
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label style="font-size:11.5px; font-weight:600; color:var(--gold-400); text-transform:uppercase; letter-spacing:1px;">
              Camp Passcode
            </label>
            <div class="input-container" id="guest-pass-container">
              <span class="input-icon-lead">${SVG_ICONS.lock}</span>
              <input 
                type="password" 
                id="guest-password" 
                class="input-field" 
                placeholder="Create a password" 
                autocomplete="new-password"
                required
              />
              <button type="button" class="input-toggle-btn" id="guest-toggle-pass-1" aria-label="Toggle password">
                ${SVG_ICONS.eye}
              </button>
            </div>
            <span class="input-error-msg" id="guest-pass-error"></span>

            <!-- Strength Meter -->
            <div class="strength-meter-wrap" id="guest-strength-wrap" data-strength="0">
              <div class="strength-bars">
                <div class="strength-bar-seg seg-1"></div>
                <div class="strength-bar-seg seg-2"></div>
                <div class="strength-bar-seg seg-3"></div>
                <div class="strength-bar-seg seg-4"></div>
              </div>
              <div class="strength-info">
                <span>Rune Strength:</span>
                <span class="strength-text" id="guest-strength-label">None</span>
              </div>
            </div>
          </div>

          <!-- Confirm Password Input -->
          <div class="form-group">
            <label style="font-size:11.5px; font-weight:600; color:var(--gold-400); text-transform:uppercase; letter-spacing:1px;">
              Confirm Passcode
            </label>
            <div class="input-container" id="guest-cpass-container">
              <span class="input-icon-lead">${SVG_ICONS.lock}</span>
              <input 
                type="password" 
                id="guest-cpassword" 
                class="input-field" 
                placeholder="Confirm password" 
                autocomplete="new-password"
                required
              />
              <button type="button" class="input-toggle-btn" id="guest-toggle-pass-2" aria-label="Toggle confirm password">
                ${SVG_ICONS.eye}
              </button>
            </div>
            <span class="input-error-msg" id="guest-cpass-error"></span>
          </div>

          <!-- Submit Action -->
          <button type="submit" class="btn btn-gold" id="btn-create-guest" style="margin-top:6px;">
            <span>CREATE GUEST ACCOUNT</span>
          </button>

          <!-- Back Button -->
          <button type="button" class="btn btn-secondary" id="btn-guest-back" style="height:44px; font-size:13px;">
            <span>Back</span>
          </button>
        </form>
      </div>
    </div>
  `;
}

function setupGuestModalEvents(wrapper) {
  const backdrop = wrapper.querySelector('#guest-backdrop');
  const closeBtn = wrapper.querySelector('#guest-close-btn');
  const backBtn = wrapper.querySelector('#btn-guest-back');
  const form = wrapper.querySelector('#guest-form');

  const userInput = wrapper.querySelector('#guest-username');
  const userContainer = wrapper.querySelector('#guest-user-container');
  const userError = wrapper.querySelector('#guest-user-error');

  const passInput = wrapper.querySelector('#guest-password');
  const passContainer = wrapper.querySelector('#guest-pass-container');
  const passError = wrapper.querySelector('#guest-pass-error');

  const cpassInput = wrapper.querySelector('#guest-cpassword');
  const cpassContainer = wrapper.querySelector('#guest-cpass-container');
  const cpassError = wrapper.querySelector('#guest-cpass-error');

  const togglePass1 = wrapper.querySelector('#guest-toggle-pass-1');
  const togglePass2 = wrapper.querySelector('#guest-toggle-pass-2');

  const strengthWrap = wrapper.querySelector('#guest-strength-wrap');
  const strengthLabel = wrapper.querySelector('#guest-strength-label');

  let showPass1 = false;
  let showPass2 = false;

  // Toggle Visibility 1
  togglePass1.addEventListener('click', () => {
    sound.playTap();
    showPass1 = !showPass1;
    passInput.type = showPass1 ? 'text' : 'password';
    togglePass1.innerHTML = showPass1 ? SVG_ICONS.eyeOff : SVG_ICONS.eye;
  });

  // Toggle Visibility 2
  togglePass2.addEventListener('click', () => {
    sound.playTap();
    showPass2 = !showPass2;
    cpassInput.type = showPass2 ? 'text' : 'password';
    togglePass2.innerHTML = showPass2 ? SVG_ICONS.eyeOff : SVG_ICONS.eye;
  });

  // Strength Check
  passInput.addEventListener('input', () => {
    passContainer.classList.remove('error');
    passError.classList.remove('visible');
    const strength = Validator.calculateStrength(passInput.value);
    strengthWrap.setAttribute('data-strength', strength.score);
    strengthLabel.textContent = strength.label;
    strengthLabel.style = strength.textClass;
  });

  // Real-time username check
  userInput.addEventListener('input', () => {
    userContainer.classList.remove('error');
    userError.classList.remove('visible');
    userError.textContent = '';
  });

  cpassInput.addEventListener('input', () => {
    cpassContainer.classList.remove('error');
    cpassError.classList.remove('visible');
  });

  // Close actions
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) appState.closeModal();
  });
  closeBtn.addEventListener('click', () => appState.closeModal());
  backBtn.addEventListener('click', () => appState.closeModal());

  // Form Validation & Guest Creation
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    sound.playTap();

    let hasError = false;

    const userRes = Validator.validateUsername(userInput.value);
    if (!userRes.isValid) {
      userContainer.classList.add('error', 'anim-shake');
      setTimeout(() => userContainer.classList.remove('anim-shake'), 400);
      userError.textContent = userRes.message;
      userError.classList.add('visible');
      hasError = true;
    }

    const passRes = Validator.validatePassword(passInput.value, 6);
    if (!passRes.isValid) {
      passContainer.classList.add('error', 'anim-shake');
      setTimeout(() => passContainer.classList.remove('anim-shake'), 400);
      passError.textContent = passRes.message;
      passError.classList.add('visible');
      hasError = true;
    }

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

    const username = userInput.value.trim();
    const password = passInput.value;
    const submitBtn = wrapper.querySelector('#btn-create-guest');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'CREATING ACCOUNT...';

    try {
      const { user: firebaseUser } = await registerGuestUser(username, password);

      appState.setUser({
        uid: firebaseUser.uid,
        username,
        email: firebaseUser.email,
        role: 'Guest Explorer',
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
        title: 'Novice Wayfarer',
        streak: 1,
        stats: {
          missionsCompleted: 0,
          relicsDiscovered: 0,
          countriesExplored: 0,
          totalDistanceKm: "0.0"
        },
        badges: [],
        completedMissions: [],
        isGuest: true
      });

      appState.closeModal();
      sound.playChime();
      appState.showToast(`Welcome, ${username}! Your guest account is saved.`, 'success', 4000);
      appState.navigate('home');
    } catch (error) {
      console.error('Guest registration failed:', error);

      let message = 'Unable to create the guest account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'This Player ID already exists. Please choose another ID or log in with it.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Your password is too weak.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      }

      userContainer.classList.add('error', 'anim-shake');
      setTimeout(() => userContainer.classList.remove('anim-shake'), 400);
      userError.textContent = message;
      userError.classList.add('visible');
      sound.playError();

      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'CREATE GUEST ACCOUNT';
    }
  });;
}

// ---------------------------------------------------------
// 2. Forgot Password Modal HTML & Events
// ---------------------------------------------------------
function createForgotPasswordModalHTML() {
  return `
    <div class="modal-backdrop" id="forgot-backdrop">
      <div class="modal-sheet" style="text-align:center; padding-top:24px;">
        <div class="modal-handle"></div>

        <div style="width:54px; height:54px; margin:0 auto 14px auto; background:rgba(212,175,55,0.12); border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--gold-400); border:1px solid var(--gold-border);">
          ${SVG_ICONS.lock}
        </div>

        <h3 class="modal-title" style="margin-bottom:8px;">Password Recovery</h3>
        <p style="font-size:13.5px; color:var(--text-secondary); line-height:1.6; margin-bottom:20px; padding:0 10px;">
          Password recovery will be available soon in the upcoming expedition update. Please check back later!
        </p>

        <button type="button" class="btn btn-gold" id="btn-forgot-dismiss" style="height:48px;">
          <span>UNDERSTOOD</span>
        </button>
      </div>
    </div>
  `;
}

function setupForgotPasswordEvents(wrapper) {
  const backdrop = wrapper.querySelector('#forgot-backdrop');
  const dismissBtn = wrapper.querySelector('#btn-forgot-dismiss');

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) appState.closeModal();
  });
  dismissBtn.addEventListener('click', () => {
    sound.playTap();
    appState.closeModal();
  });
}
