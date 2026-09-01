/* ==========================================================================
   GeoQuest Screen 2: Login Screen
   Header + Email/Password + Forgot Password + Login CTA + OR + Google + Guest + SignUp
   ========================================================================== */

import { SVG_ICONS } from '../assets.js';
import { appState } from '../state.js';
import { Validator } from '../validator.js';
import { sound } from '../audio.js';
import { loginUser } from '../authService.js';

export function renderLoginScreen() {
  const container = document.createElement('div');
  container.className = 'screen-view login-screen anim-fade-in';
  container.id = 'login-screen';

  let showPassword = false;

  container.innerHTML = `
    <div class="screen-content">
      <!-- Header Section -->
      <div class="login-header">
        <div class="header-logo-icon anim-pulse-logo">
          ${SVG_ICONS.logoHero}
        </div>
        <h2 class="geoquest-brand">HERITAGE QUEST</h2>
        <p class="geoquest-subtitle">Explore • Discover • Learn</p>
        <p class="geoquest-welcome">Welcome, Explorer!</p>
      </div>

      <!-- Login Form Form-Card -->
      <form id="login-form" class="login-form" novalidate>
        <!-- Email or Player ID Input -->
        <div class="form-group">
          <div class="input-container" id="email-container">
            <span class="input-icon-lead">${SVG_ICONS.user}</span>
            <input 
              type="text" 
              id="login-email" 
              class="input-field" 
              placeholder="Email or Player ID" 
              autocomplete="username"
              autocapitalize="none"
              spellcheck="false"
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
              id="login-password" 
              class="input-field" 
              placeholder="Password" 
              autocomplete="current-password"
              required
            />
            <button type="button" class="input-toggle-btn" id="toggle-password-btn" aria-label="Toggle password visibility">
              ${SVG_ICONS.eye}
            </button>
          </div>
          <span class="input-error-msg" id="password-error"></span>
        </div>

        <!-- Forgot Password Link -->
        <div class="forgot-password-wrap">
          <button type="button" class="forgot-password-link" id="forgot-password-btn">
            Forgot Password?
          </button>
        </div>

        <!-- Primary Login Action -->
        <button type="submit" class="btn btn-gold" id="btn-login-submit">
          <span>LOGIN</span>
        </button>
      </form>

      <!-- OR Divider -->
      <div class="divider-or">
        <span>OR</span>
      </div>

      <!-- Social & Guest Options -->
      <div class="alt-auth-group">
        <!-- Continue with Google -->
        <button type="button" class="btn btn-google" id="btn-google-login">
          <span class="google-icon">${SVG_ICONS.google}</span>
          <span>Continue with Google</span>
        </button>

        <!-- Play as Guest -->
        <button type="button" class="btn btn-guest" id="btn-guest-login">
          <span class="input-icon-lead" style="margin:0; width:18px;">${SVG_ICONS.user}</span>
          <span>Play as Guest</span>
        </button>
      </div>

      <!-- Bottom Create Account Link -->
      <div class="auth-footer-text">
        <span>New to Heritage Quest?</span>
        <button type="button" class="auth-footer-link" id="btn-goto-signup">
          Create Account
        </button>
      </div>
    </div>
  `;

  // Apply Scoped Screen Styles
  const style = document.createElement('style');
  style.textContent = `
    .screen-view {
      width: 100%;
      min-height: 100%;
      padding: calc(var(--safe-top) + 20px) 24px calc(var(--safe-bottom) + 24px) 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      z-index: 10;
    }

    .screen-content {
      width: 100%;
      max-width: 360px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .login-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 24px;
    }

    .header-logo-icon {
      width: 72px;
      height: 72px;
      margin-bottom: 2px;
    }

    .login-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alt-auth-group {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `;
  container.appendChild(style);

  // Setup Element References & Event Handlers
  const emailInput = container.querySelector('#login-email');
  const emailContainer = container.querySelector('#email-container');
  const emailError = container.querySelector('#email-error');

  const passwordInput = container.querySelector('#login-password');
  const passwordContainer = container.querySelector('#password-container');
  const passwordError = container.querySelector('#password-error');

  const togglePasswordBtn = container.querySelector('#toggle-password-btn');
  const forgotPasswordBtn = container.querySelector('#forgot-password-btn');
  const loginForm = container.querySelector('#login-form');
  const googleBtn = container.querySelector('#btn-google-login');
  const guestBtn = container.querySelector('#btn-guest-login');
  const signupLinkBtn = container.querySelector('#btn-goto-signup');

  // 1. Password Visibility Toggle
  togglePasswordBtn.addEventListener('click', () => {
    sound.playTap();
    showPassword = !showPassword;
    passwordInput.type = showPassword ? 'text' : 'password';
    togglePasswordBtn.innerHTML = showPassword ? SVG_ICONS.eyeOff : SVG_ICONS.eye;
  });

  // 2. Real-time Clear Errors on Input
  emailInput.addEventListener('input', () => {
    emailContainer.classList.remove('error');
    emailError.classList.remove('visible');
    emailError.textContent = '';
  });

  passwordInput.addEventListener('input', () => {
    passwordContainer.classList.remove('error');
    passwordError.classList.remove('visible');
    passwordError.textContent = '';
  });

  // 3. Form Submission (Client-Side Validation Only)
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    sound.playTap();

    let hasError = false;

    // Validate Email or Player ID
    const emailRes = Validator.validateEmailOrPlayerId(emailInput.value);
    if (!emailRes.isValid) {
      emailContainer.classList.add('error');
      emailContainer.classList.add('anim-shake');
      setTimeout(() => emailContainer.classList.remove('anim-shake'), 400);
      emailError.textContent = emailRes.message;
      emailError.classList.add('visible');
      hasError = true;
    }

    // Validate Password
    const passRes = Validator.validatePassword(passwordInput.value);
    if (!passRes.isValid) {
      passwordContainer.classList.add('error');
      passwordContainer.classList.add('anim-shake');
      setTimeout(() => passwordContainer.classList.remove('anim-shake'), 400);
      passwordError.textContent = passRes.message;
      passwordError.classList.add('visible');
      hasError = true;
    }

    if (hasError) {
      sound.playError();
      return;
    }

    // Authentication (Email or Player ID)
    const rawInput = emailInput.value.trim();
    const isEmail = rawInput.includes('@');
    const passwordVal = passwordInput.value;

    try {
      const { user: firebaseUser, profile } = await loginUser(
        rawInput,
        passwordVal
      );

      const displayName = profile?.username || (isEmail ? rawInput.split('@')[0] : rawInput);
      const cleanUsername = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      const resolvedEmail = profile?.email || (isEmail ? rawInput : firebaseUser.email);

      appState.setUser({
        uid: firebaseUser.uid,
        username: cleanUsername,
        email: resolvedEmail,
        role: profile?.role || "Registered Explorer",
        level: profile?.level || 1,
        xp: typeof profile?.xp === 'number' ? profile.xp : 0,
        nextLevelXp: profile?.nextLevelXp || 1000,
        title: profile?.title || "Novice Cartographer",
        streak: profile?.streak || 1,
        stats: profile?.stats || { missionsCompleted: 0, relicsDiscovered: 0, countriesExplored: 0, totalDistanceKm: "0.0" },
        badges: profile?.badges || [],
        completedMissions: profile?.completedMissions || [],
        isGuest: !!profile?.isGuest
      });

      sound.playChime();
      appState.showToast(`Welcome back, ${cleanUsername}!`, 'success', 3000);
      appState.navigate('home');

    } catch (error) {
      console.warn('Firebase login attempt error:', error);

      let message = `No account found for "${rawInput}". Please create an account first.`;

      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Incorrect Email/Player ID or password.';
      } else if (error.code === 'auth/user-not-found') {
        message = `No account found for "${rawInput}". Please check your details or create an account.`;
      } else if (error.code === 'auth/user-disabled') {
        message = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      }

      sound.playError();
      appState.showToast(message, 'error', 4500);

      emailContainer.classList.add('error', 'anim-shake');
      setTimeout(() => emailContainer.classList.remove('anim-shake'), 400);
      emailError.textContent = message;
      emailError.classList.add('visible');
    }
  });

  // 4. Forgot Password Click -> Modal
  forgotPasswordBtn.addEventListener('click', () => {
    appState.openModal('forgot_password');
  });

  // 5. Google Sign-In Click -> Notice
  googleBtn.addEventListener('click', () => {
    sound.playTap();
    googleBtn.style.transform = 'scale(0.96)';
    setTimeout(() => googleBtn.style.transform = '', 150);
    appState.showToast('Google Sign-In will be available soon.', 'info');
  });

  // 6. Play as Guest Click -> Open Guest Setup Modal
  guestBtn.addEventListener('click', () => {
    appState.openModal('guest_setup');
  });

  // 7. Create Account Navigation Link
  signupLinkBtn.addEventListener('click', () => {
    appState.navigate('signup');
  });

  return container;
}
