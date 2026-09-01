/* ==========================================================================
   GeoQuest Main Application Bootstrap
   ========================================================================== */

import { renderKonarkVirtualScreen } from './screens/konarkVirtualScreen.js';   
import { testKonarkMission } from "./missionService.js";
import { ParticleSystem } from './particles.js';
import { appState } from './state.js';
import { getCurrentLocation, calculateDistance } from './location.js';
import { sound } from './audio.js';
import { renderSplashScreen } from './screens/splash.js';
import { renderLoginScreen } from './screens/login.js';
import { renderSignupScreen } from './screens/signup.js';
import { renderHomeScreen } from './screens/home.js';
import { renderModalContainer } from './screens/guestModal.js';
import { renderMapScreen } from './screens/mapScreen.js';
import { renderGameModeScreen } from './screens/gameModeScreen.js';

class GeoQuestApp {
  constructor() {
    this.screenContainer = document.getElementById('screen-container');
    this.modalRoot = document.getElementById('modal-container');
    this.phoneViewport = document.getElementById('phone-viewport');
    this.particles = null;
    this.init();
  }

  init() {
    // 1. Initialize floating golden embers particle system
    this.particles = new ParticleSystem('particles-canvas');

    // 2. Initialize modal container
    if (this.modalRoot) {
      this.modalRoot.appendChild(renderModalContainer());
    }

    // 3. Setup status bar clock
    this.startStatusBarClock();

    // 4. Listen to state changes
    appState.subscribe((event, data) => {
      if (event === 'navigation') {
        this.renderScreen(data.to);
      }
    });

    // 5. Initial screen render (Splash)
    this.renderScreen(appState.currentScreen);

    // 6. Test Firestore Konark mission
    testKonarkMission();
  }

  renderScreen(screenName) {
    if (!this.screenContainer) return;

    if (this.phoneViewport) {
      this.phoneViewport.dataset.screen = screenName;
    }

    // Remove existing screen elements
    this.screenContainer.innerHTML = '';

    let screenElement = null;
    switch (screenName) {
      case 'splash':
        screenElement = renderSplashScreen();
        break;
      case 'login':
        screenElement = renderLoginScreen();
        break;
      case 'signup':
        screenElement = renderSignupScreen();
        break;
      case 'home':
        screenElement = renderHomeScreen();
        break;
      case 'map':
        screenElement = renderMapScreen();
        break;
      case 'gameMode':
        screenElement = renderGameModeScreen(appState.selectedHeritageSite);
        break;
      case 'konarkVirtual':
        screenElement = renderKonarkVirtualScreen();
        break;  
      default:
        screenElement = renderLoginScreen();
        break;
    }

    if (screenElement) {
      this.screenContainer.appendChild(screenElement);
      this.screenContainer.scrollTop = 0;
    }
  }

  async checkMyLocation() {
    try {
      console.log('Getting your location...');
      const location = await getCurrentLocation();
      console.log('📍 GeoQuest Location:', location);
      return location;
    } catch (error) {
      console.error('❌ Location error:', error.message);
    }
  }

  async checkTargetLocation() {
    const target = {
      latitude: 20.4933935,
      longitude: 86.4211535,
      radius: 100
    };

    try {
      const current = await getCurrentLocation();
      const distance = calculateDistance(
        current.latitude,
        current.longitude,
        target.latitude,
        target.longitude
      );

      console.log('🎯 Target Location Distance:', Math.round(distance), 'meters');
      return distance <= target.radius;
    } catch (error) {
      console.error('❌ Location check failed:', error.message);
      return false;
    }
  }

  startStatusBarClock() {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const timeElements = document.querySelectorAll('.status-time');
      timeElements.forEach(el => el.textContent = `${hours}:${mins}`);
    };
    updateTime();
    setInterval(updateTime, 10000);
  }
}

// Bootstrap on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.geoQuestApp = new GeoQuestApp();
});