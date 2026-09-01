/* ==========================================================================
   GeoQuest Screen 1: Cinematic Splash Screen
   Duration: strictly <= 2.0s (Target: ~1.85s)
   Visuals: Dark Ancient Heritage + Gold Compass Pin + Atmospheric Glow
   ========================================================================== */

import { SVG_ICONS } from '../assets.js';
import { appState } from '../state.js';
import { sound } from '../audio.js';

export function renderSplashScreen() {
  const container = document.createElement('div');
  container.className = 'splash-screen';
  container.id = 'splash-screen';

  container.innerHTML = `
    <div class="splash-inner">
      <!-- Ancient background rune aura -->
      <div class="splash-halo"></div>

      <!-- Glowing Compass Pin Logo -->
      <div class="splash-logo-wrap anim-pulse-logo">
        <div class="splash-logo-inner">
          ${SVG_ICONS.logoHero}
        </div>
      </div>

      <!-- Heritage Quest Title -->
      <div class="splash-title-wrap">
        <h1 class="splash-title">HERITAGE QUEST</h1>
        <div class="splash-title-underline"></div>
      </div>

      <!-- Tagline -->
      <p class="splash-tagline">EXPLORE • DISCOVER • CONQUER</p>

      <!-- Bottom Loading Sparkle Indicator -->
      <div class="splash-footer">
        <div class="splash-loader-bar">
          <div class="splash-loader-progress"></div>
        </div>
      </div>
    </div>
  `;

  // Apply custom CSS styles for cinematic splash inside the component or scoped
  const style = document.createElement('style');
  style.textContent = `
    .splash-screen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 45%, #18140e 0%, #0c0a07 60%, #030202 100%);
      z-index: 20;
      cursor: pointer;
      overflow: hidden;
    }

    .splash-inner {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0 30px;
      z-index: 5;
    }

    .splash-halo {
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.04) 55%, transparent 70%);
      pointer-events: none;
      animation: logoAuraPulse 3s ease-in-out infinite;
    }

    .splash-logo-wrap {
      width: 148px;
      height: 148px;
      margin-bottom: 24px;
      opacity: 0;
      transform: scale(0.85);
      animation: splashLogoReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards, breathingLogo 3s ease-in-out 0.9s infinite;
    }

    .splash-title-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 100%;
      opacity: 0;
      transform: translateY(14px);
      animation: splashTextReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
    }

    .splash-title {
      font-family: var(--font-serif);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 4px;
      line-height: 1.25;
      text-align: center;
      color: #ebd07b;
      text-transform: uppercase;
      background: linear-gradient(180deg, #fff2c4 0%, #d4af37 55%, #8f6c18 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 2px 14px rgba(212, 175, 55, 0.45));
    }

    .splash-title-underline {
      width: 80px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #ebd07b, transparent);
      margin-top: 8px;
    }

    .splash-tagline {
      font-family: var(--font-sans);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 3.5px;
      color: var(--text-secondary);
      text-transform: uppercase;
      margin-top: 14px;
      opacity: 0;
      transform: translateY(8px);
      animation: splashTextReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.65s forwards;
    }

    .splash-footer {
      position: absolute;
      bottom: calc(var(--safe-bottom) + 30px);
      width: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .splash-loader-bar {
      width: 100%;
      height: 3px;
      background: rgba(212, 175, 55, 0.15);
      border-radius: 3px;
      overflow: hidden;
    }

    .splash-loader-progress {
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #d4af37, #fae4a8);
      box-shadow: 0 0 10px rgba(245, 214, 125, 0.8);
      animation: splashLoadProgress 1.75s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }

    @keyframes splashLogoReveal {
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes splashTextReveal {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes splashLoadProgress {
      0% { width: 0%; }
      70% { width: 85%; }
      100% { width: 100%; }
    }
  `;
  container.appendChild(style);

  // Play subtle entrance sound
  setTimeout(() => sound.playSplashSwell(), 100);

  // Auto transition to login or home screen after 1.85 seconds
  let timeoutId = setTimeout(() => {
    transitionToNext();
  }, 1850);

  // Allow clicking anywhere to skip
  container.addEventListener('click', () => {
    clearTimeout(timeoutId);
    transitionToNext();
  });

  function transitionToNext() {
    container.style.transition = 'opacity 0.35s ease-out, transform 0.35s ease-out';
    container.style.opacity = '0';
    container.style.transform = 'scale(1.04)';
    setTimeout(() => {
      if (appState.userSession) {
        appState.navigate('home');
      } else {
        appState.navigate('login');
      }
    }, 320);
  }

  return container;
}
