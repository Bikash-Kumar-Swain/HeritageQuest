/* ==========================================================================
   GeoQuest — India Heritage Map Screen
   Interactive Zoom & Pan (Pinch, Wheel, Drag, Controls, Double-Tap)
   ========================================================================== */

import { appState } from '../state.js';
import { sound } from '../audio.js';
import { HERITAGE_SITES } from '../heritageSites.js';

export function renderMapScreen() {
  const root = document.createElement('div');
  root.className = 'screen-view map-screen-view anim-fade-in';
  root.id = 'map-screen';

  root.innerHTML = `
    <!-- ════════════════════════════════════════════════
         ZOOMABLE & PANNABLE MAP CONTAINER
    ═════════════════════════════════════════════════ -->
    <div class="map-viewport-wrapper" id="map-viewport-wrapper">
      <div class="map-zoom-stage" id="map-zoom-stage">

        <!-- Vivid Map Image Background -->
        <div class="map-backdrop-img" aria-hidden="true"></div>

        <!-- Interactive Heritage Site Hotspots -->
        <div class="map-hotspots-layer" id="map-hotspots">

          <!-- 1. Taj Mahal (Purple) -->
          <div class="map-hotspot-pin theme-purple"
               id="hotspot-taj_mahal"
               data-site-id="taj_mahal"
               style="left: 40.5%; top: 32.5%;"
               role="button"
               tabindex="0"
               aria-label="Taj Mahal in Agra, Uttar Pradesh">
            <div class="hotspot-radar" aria-hidden="true"></div>
            <div class="hotspot-halo" aria-hidden="true"></div>
            <div class="hotspot-click-target"></div>
          </div>

          <!-- 2. Ajanta & Ellora Caves (Gold) -->
          <div class="map-hotspot-pin theme-gold"
               id="hotspot-ajanta_ellora"
               data-site-id="ajanta_ellora"
               style="left: 28.2%; top: 51.5%;"
               role="button"
               tabindex="0"
               aria-label="Ajanta and Ellora Caves in Maharashtra">
            <div class="hotspot-radar" aria-hidden="true"></div>
            <div class="hotspot-halo" aria-hidden="true"></div>
            <div class="hotspot-click-target"></div>
          </div>

          <!-- 3. Sun Temple (Orange/Gold) -->
          <div class="map-hotspot-pin theme-orange"
               id="hotspot-sun_temple"
               data-site-id="sun_temple"
               style="left: 66.0%; top: 51.0%;"
               role="button"
               tabindex="0"
               aria-label="Sun Temple in Konark, Odisha">
            <div class="hotspot-radar" aria-hidden="true"></div>
            <div class="hotspot-halo" aria-hidden="true"></div>
            <div class="hotspot-click-target"></div>
          </div>

          <!-- 4. Kaziranga National Park (Green) -->
          <div class="map-hotspot-pin theme-green"
               id="hotspot-kaziranga"
               data-site-id="kaziranga"
               style="left: 77.0%; top: 34.2%;"
               role="button"
               tabindex="0"
               aria-label="Kaziranga National Park in Assam">
            <div class="hotspot-radar" aria-hidden="true"></div>
            <div class="hotspot-halo" aria-hidden="true"></div>
            <div class="hotspot-click-target"></div>
          </div>

        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════
         TOP APP BAR / BACK BUTTON (Fixed Overlay)
    ═════════════════════════════════════════════════ -->
    <div class="map-top-nav">
      <!-- Back to Home Floating Pill -->
      <button class="map-nav-back-pill" id="map-btn-back" type="button" aria-label="Back to Home Screen">
        <span class="back-pill-chevron">‹</span>
        <span class="back-pill-text">Home</span>
      </button>

      <!-- Subtitle Hint / Zoom Level -->
      <div class="map-nav-hint" id="map-zoom-status">
        <span>Pinch or scroll to zoom</span>
      </div>

      <!-- Active Sites Badge -->
      <div class="map-nav-badge" aria-label="4 Heritage Sites Available">
        <span class="badge-dot"></span>
        <span class="badge-count">4 SITES</span>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════
         FLOATING ZOOM CONTROLS (Bottom Right)
    ═════════════════════════════════════════════════ -->
    <aside class="map-zoom-controls" role="toolbar" aria-label="Map Zoom Controls">
      <!-- Zoom In (+) -->
      <button class="zoom-btn" id="btn-zoom-in" type="button" aria-label="Zoom in on map" title="Zoom In">
        <span class="zoom-icon">+</span>
      </button>

      <!-- Zoom Level / Reset Center -->
      <button class="zoom-btn zoom-btn-reset" id="btn-zoom-reset" type="button" aria-label="Reset map view" title="Reset View">
        <span class="zoom-reset-text" id="zoom-level-text">100%</span>
      </button>

      <!-- Zoom Out (−) -->
      <button class="zoom-btn" id="btn-zoom-out" type="button" aria-label="Zoom out on map" title="Zoom Out">
        <span class="zoom-icon">−</span>
      </button>
    </aside>

    <!-- ════════════════════════════════════════════════
         SITE QUICK-EXPLORE BOTTOM SHEET MODAL
    ═════════════════════════════════════════════════ -->
    <div class="map-modal-backdrop" id="map-modal-backdrop" aria-hidden="true">
      <div class="map-modal-sheet" id="map-modal-sheet">
        <div class="map-modal-handle" aria-hidden="true"></div>

        <div class="map-modal-content" id="map-modal-content">
          <!-- Injected dynamically on pin tap -->
        </div>
      </div>
    </div>
  `;

  /* ─── Stylesheet Scoped to Map Screen ─── */
  const style = document.createElement('style');
  style.textContent = `
    /* Root View Container */
    .map-screen-view {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #021a38;
      display: flex;
      flex-direction: column;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }

    /* ─── Zoomable Viewport & Stage ─── */
    .map-viewport-wrapper {
      position: absolute;
      inset: 0;
      overflow: hidden;
      cursor: grab;
      z-index: 1;
    }
    .map-viewport-wrapper.is-dragging {
      cursor: grabbing;
    }

    .map-zoom-stage {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      transform-origin: 50% 50%;
      will-change: transform;
      transition: transform 0.08s ease-out;
    }
    .map-zoom-stage.smooth-animate {
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* ─── Vivid Map Background ─── */
    .map-backdrop-img {
      position: absolute;
      inset: 0;
      background-image: url('./src/assets/india_map.jpg');
      background-size: 100% 100%;
      background-position: center center;
      background-repeat: no-repeat;
      z-index: 0;
      pointer-events: none;
    }

    /* ─── Top Navigation Bar ─── */
    .map-top-nav {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 25;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: calc(var(--safe-top, 14px) + 38px) 14px 6px 14px;
      pointer-events: none;
    }
    .map-top-nav > * {
      pointer-events: auto;
    }

    /* Back Floating Pill */
    .map-nav-back-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(10, 18, 32, 0.88);
      border: 1.5px solid rgba(212, 175, 55, 0.5);
      border-radius: 12px;
      padding: 5px 12px 5px 8px;
      color: #fae4a8;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.55);
      transition: all 0.16s ease;
    }
    .map-nav-back-pill:hover {
      border-color: #d4af37;
      background: rgba(20, 32, 54, 0.95);
      color: #fff;
      transform: translateY(-1px);
    }
    .map-nav-back-pill:active {
      transform: scale(0.95);
    }
    .back-pill-chevron {
      font-size: 19px;
      line-height: 1;
      color: #d4af37;
    }
    .back-pill-text {
      font-size: 11px;
      letter-spacing: 0.3px;
    }

    /* Top Hint */
    .map-nav-hint {
      font-size: 9.5px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(4, 18, 40, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 20px;
      padding: 4px 10px;
      backdrop-filter: blur(8px);
      letter-spacing: 0.2px;
      transition: all 0.2s ease;
    }

    /* Active Badge */
    .map-nav-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.45);
      border-radius: 12px;
      padding: 5px 9px;
      font-size: 9px;
      font-weight: 800;
      color: #34d399;
      backdrop-filter: blur(8px);
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: badgeDotPulse 2s ease-in-out infinite;
    }
    @keyframes badgeDotPulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50%      { transform: scale(1.3); opacity: 1; }
    }

    /* ─── Floating Zoom Controls ─── */
    .map-zoom-controls {
      position: absolute;
      right: 14px;
      bottom: calc(var(--safe-bottom, 0px) + 20px);
      z-index: 25;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: rgba(6, 18, 38, 0.88);
      border: 1.5px solid rgba(212, 175, 55, 0.4);
      border-radius: 16px;
      padding: 6px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.65);
    }

    .zoom-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(15, 28, 54, 0.8);
      border: 1px solid rgba(212, 175, 55, 0.25);
      color: #fae4a8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline: none;
      transition: all 0.16s ease;
    }
    .zoom-btn:hover {
      border-color: #d4af37;
      background: rgba(28, 48, 86, 0.95);
      color: #ffffff;
      transform: scale(1.06);
    }
    .zoom-btn:active {
      transform: scale(0.92);
      background: rgba(212, 175, 55, 0.2);
    }
    .zoom-icon {
      font-size: 20px;
      font-weight: 700;
      line-height: 1;
    }
    .zoom-btn-reset {
      height: 28px;
    }
    .zoom-reset-text {
      font-size: 9px;
      font-weight: 800;
      color: #cbd5e1;
      letter-spacing: 0.3px;
    }
    .zoom-btn-reset:hover .zoom-reset-text {
      color: #fae4a8;
    }

    /* ─── Map Hotspots Layer ─── */
    .map-hotspots-layer {
      position: absolute;
      inset: 0;
      z-index: 10;
      pointer-events: none;
    }

    .map-hotspot-pin {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      cursor: pointer;
      outline: none;
      border-radius: 50%;
    }

    /* Click Target */
    .hotspot-click-target {
      position: absolute;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: transparent;
      z-index: 4;
      transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .map-hotspot-pin:hover .hotspot-click-target {
      transform: scale(1.15);
    }
    .map-hotspot-pin:active .hotspot-click-target {
      transform: scale(0.92);
    }

    /* Radar Pulse Animation */
    .hotspot-radar {
      position: absolute;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 1;
      animation: hotspotRadarPulse 2.8s cubic-bezier(0.25, 1, 0.5, 1) infinite;
    }
    @keyframes hotspotRadarPulse {
      0%   { transform: scale(0.7); opacity: 0.85; }
      100% { transform: scale(2.4); opacity: 0; }
    }

    /* Soft Halo */
    .hotspot-halo {
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 2;
      opacity: 0.35;
      animation: hotspotHaloBreathe 2s ease-in-out infinite alternate;
    }
    @keyframes hotspotHaloBreathe {
      0%   { transform: scale(0.9); opacity: 0.25; }
      100% { transform: scale(1.2); opacity: 0.65; }
    }

    /* Color themes for glow effects */
    .theme-purple .hotspot-radar { border: 2px solid #a855f7; }
    .theme-purple .hotspot-halo  { background: radial-gradient(circle, #a855f7 0%, transparent 70%); }

    .theme-gold .hotspot-radar   { border: 2px solid #fbbf24; }
    .theme-gold .hotspot-halo    { background: radial-gradient(circle, #fbbf24 0%, transparent 70%); }

    .theme-orange .hotspot-radar { border: 2px solid #f97316; }
    .theme-orange .hotspot-halo  { background: radial-gradient(circle, #f97316 0%, transparent 70%); }

    .theme-green .hotspot-radar  { border: 2px solid #4ade80; }
    .theme-green .hotspot-halo   { background: radial-gradient(circle, #4ade80 0%, transparent 70%); }

    /* ─── Modal Bottom Sheet ─── */
    .map-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(2, 6, 15, 0.75);
      z-index: 100;
      backdrop-filter: blur(8px);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .map-modal-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
    .map-modal-sheet {
      width: 100%;
      background: linear-gradient(180deg, #181410 0%, #0d0a07 100%);
      border-top: 1.5px solid rgba(212, 175, 55, 0.45);
      border-radius: 22px 22px 0 0;
      padding: 12px 18px calc(var(--safe-bottom, 0px) + 18px) 18px;
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(212, 175, 55, 0.15);
      transform: translateY(100%);
      transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .map-modal-backdrop.open .map-modal-sheet {
      transform: translateY(0);
    }
    .map-modal-handle {
      width: 38px;
      height: 4px;
      border-radius: 2px;
      background: rgba(212, 175, 55, 0.4);
      margin: 0 auto 14px auto;
    }

    /* Modal Content Elements */
    .ms-modal-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .ms-modal-avatar-wrap {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      background: #1c1917;
      border: 2px solid var(--gold-500, #d4af37);
      box-shadow: 0 0 16px rgba(212, 175, 55, 0.35);
      flex-shrink: 0;
    }
    .ms-modal-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .ms-modal-title {
      font-family: var(--font-serif, 'Cinzel', serif);
      font-size: 17px;
      font-weight: 800;
      color: #fae4a8;
      margin: 0;
      line-height: 1.2;
    }
    .ms-modal-location {
      font-size: 11px;
      color: #94a3b8;
      margin: 0;
    }
    .ms-modal-pill-row {
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }
    .ms-modal-tag {
      font-size: 8.5px;
      font-weight: 800;
      color: #d4af37;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.35);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .ms-modal-desc {
      font-size: 11px;
      line-height: 1.5;
      color: #d1d5db;
      margin: 12px 0;
    }
    .ms-modal-facts {
      list-style: none;
      padding: 0;
      margin: 0 0 16px 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ms-modal-facts li {
      font-size: 10px;
      color: #9ca3af;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ms-modal-facts li::before {
      content: '✦';
      color: #d4af37;
      font-size: 7px;
    }
    .ms-modal-btn-explore {
      width: 100%;
      height: 50px;
      background: linear-gradient(135deg, #f0d588 0%, #d4af37 40%, #b89025 80%, #9a7315 100%);
      color: #161205;
      border: 1px solid rgba(255, 235, 170, 0.7);
      border-radius: 12px;
      font-family: var(--font-sans);
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 1.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 6px 24px rgba(212, 175, 55, 0.45);
      transition: all 0.16s ease;
    }
    .ms-modal-btn-explore:hover {
      background: linear-gradient(135deg, #fae4a8 0%, #e0bd49 40%, #c59d30 80%, #a87f1c 100%);
      transform: translateY(-1px);
    }
    .ms-modal-btn-explore:active {
      transform: scale(0.97);
    }
  `;
  root.appendChild(style);

  /* ─── Modal Sheet Helper ─── */
  const modalBackdrop = root.querySelector('#map-modal-backdrop');
  const modalContent = root.querySelector('#map-modal-content');

  function openSiteModal(site) {
    sound.playTap();
    modalContent.innerHTML = `
      <div class="ms-modal-header">
        <div class="ms-modal-avatar-wrap">
          <span>${site.icon}</span>
        </div>
        <div class="ms-modal-meta">
          <h2 class="ms-modal-title">${site.name}</h2>
          <p class="ms-modal-location">📍 ${site.location}</p>
          <div class="ms-modal-pill-row">
            <span class="ms-modal-tag">${site.type}</span>
            <span class="ms-modal-tag">⚔️ ${site.difficulty}</span>
            <span class="ms-modal-tag">⭐ ${site.xpReward} XP</span>
          </div>
        </div>
      </div>

      <p class="ms-modal-desc">${site.description}</p>

      <ul class="ms-modal-facts">
        ${site.facts.map(f => `<li>${f}</li>`).join('')}
      </ul>

      <button class="ms-modal-btn-explore" id="modal-btn-begin" type="button">
        <span>⚔️</span>
        <span>SELECT SITE & CHOOSE MODE</span>
      </button>
    `;

    // Wire explore button inside modal
    root.querySelector('#modal-btn-begin')?.addEventListener('click', () => {
      sound.playChime();
      appState.selectedHeritageSite = site;
      modalBackdrop.classList.remove('open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
      appState.navigate('gameMode');
    });

    modalBackdrop.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => modalBackdrop.classList.add('open'));
  }

  function closeSiteModal() {
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }

  /* ════════════════════════════════════════════════
     ZOOM & PAN CONTROLLER ENGINE
  ═════════════════════════════════════════════════ */
  const viewport = root.querySelector('#map-viewport-wrapper');
  const stage = root.querySelector('#map-zoom-stage');
  const zoomLevelText = root.querySelector('#zoom-level-text');
  const zoomStatus = root.querySelector('#map-zoom-status');

  const MIN_ZOOM = 1.0;
  const MAX_ZOOM = 3.5;
  const ZOOM_STEP = 0.4;

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialTranslateX = 0;
  let initialTranslateY = 0;
  let hasMoved = false;

  // Touch pinch tracking
  let initialDistance = 0;
  let initialScale = 1.0;
  let touchCenterX = 0;
  let touchCenterY = 0;

  // Update transform on stage
  function updateTransform(smooth = false) {
    if (smooth) {
      stage.classList.add('smooth-animate');
      setTimeout(() => stage.classList.remove('smooth-animate'), 300);
    } else {
      stage.classList.remove('smooth-animate');
    }

    // Clamp panning boundaries based on zoom scale
    const viewportRect = viewport.getBoundingClientRect();
    const maxTranslateX = (viewportRect.width * (scale - 1)) / 2;
    const maxTranslateY = (viewportRect.height * (scale - 1)) / 2;

    if (scale <= 1.0) {
      translateX = 0;
      translateY = 0;
    } else {
      translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
      translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));
    }

    stage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;

    // Update zoom status indicator
    if (zoomLevelText) {
      zoomLevelText.textContent = `${Math.round(scale * 100)}%`;
    }
    if (zoomStatus) {
      if (scale > 1.05) {
        zoomStatus.innerHTML = `<span>Zoom: ${Math.round(scale * 100)}% • Drag to pan</span>`;
      } else {
        zoomStatus.innerHTML = `<span>Pinch or scroll to zoom</span>`;
      }
    }
  }

  // Zoom to a target scale
  function setZoom(newScale, smooth = true) {
    scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));
    updateTransform(smooth);
  }

  // Zoom In button
  root.querySelector('#btn-zoom-in')?.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playTap();
    setZoom(scale + ZOOM_STEP, true);
  });

  // Zoom Out button
  root.querySelector('#btn-zoom-out')?.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playTap();
    setZoom(scale - ZOOM_STEP, true);
  });

  // Reset View button
  root.querySelector('#btn-zoom-reset')?.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playTap();
    translateX = 0;
    translateY = 0;
    setZoom(1.0, true);
  });

  // Mouse Wheel Zoom
  viewport?.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setZoom(scale + delta, false);
  }, { passive: false });

  // Mouse Drag / Pan
  viewport?.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only left click
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    initialTranslateX = translateX;
    initialTranslateY = translateY;
    viewport.classList.add('is-dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved = true;
    }
    if (scale > 1.0) {
      translateX = initialTranslateX + dx;
      translateY = initialTranslateY + dy;
      updateTransform(false);
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      viewport?.classList.remove('is-dragging');
    }
  });

  // Double Click / Double Tap to Zoom
  let lastTapTime = 0;
  viewport?.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      e.preventDefault();
      sound.playTap();
      if (scale > 1.2) {
        translateX = 0;
        translateY = 0;
        setZoom(1.0, true);
      } else {
        setZoom(2.0, true);
      }
    }
    lastTapTime = currentTime;
  });

  // Touch Events (Pinch-to-zoom & 1-finger pan)
  viewport?.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      hasMoved = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      initialTranslateX = translateX;
      initialTranslateY = translateY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialScale = scale;
    }
  }, { passive: true });

  viewport?.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging && scale > 1.0) {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
      }
      translateX = initialTranslateX + dx;
      translateY = initialTranslateY + dy;
      updateTransform(false);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (initialDistance > 0) {
        const factor = dist / initialDistance;
        setZoom(initialScale * factor, false);
      }
    }
  }, { passive: true });

  viewport?.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialDistance = 0;
    }
    if (e.touches.length === 0) {
      isDragging = false;
    }
  }, { passive: true });

  /* ─── Event Wiring for Navigation & Pins ─── */

  // 1. Back button -> Home
  root.querySelector('#map-btn-back')?.addEventListener('click', () => {
    sound.playTap();
    appState.navigate('home');
  });

  // 2. Map Hotspots (Opens modal if not dragging)
  HERITAGE_SITES.forEach(site => {
    const pinEl = root.querySelector(`#hotspot-${site.id}`);
    pinEl?.addEventListener('click', (e) => {
      if (hasMoved) return; // Prevent click if user was panning
      e.stopPropagation();
      openSiteModal(site);
    });
    pinEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSiteModal(site);
      }
    });
  });

  // 3. Modal backdrop dismiss
  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeSiteModal();
    }
  });

  return root;
}
