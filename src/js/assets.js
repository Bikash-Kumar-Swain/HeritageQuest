/* ==========================================================================
   GeoQuest Vector Assets & Icons
   Theme: Ancient Heritage & Precision Golden Adventure Cartography
   ========================================================================== */

export const SVG_ICONS = {
  // GeoQuest Hero Emblem: Dual Sun-Rays, 8-Pointed Star Compass & Adventure Pin
  logoHero: `
    <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gold Gradient 1 -->
        <linearGradient id="goldGradHero" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fae4a8"/>
          <stop offset="30%" stop-color="#e2bf57"/>
          <stop offset="70%" stop-color="#b89025"/>
          <stop offset="100%" stop-color="#735411"/>
        </linearGradient>
        <!-- Intense Radial Glow -->
        <radialGradient id="sunGlowHero" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ebd07b" stop-opacity="0.6"/>
          <stop offset="50%" stop-color="#d4af37" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#12100d" stop-opacity="0"/>
        </radialGradient>
        <!-- Inner Core Gradient -->
        <linearGradient id="innerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="40%" stop-color="#f5d77f"/>
          <stop offset="100%" stop-color="#c59d30"/>
        </linearGradient>
      </defs>

      <!-- Background Ambient Glow -->
      <circle cx="100" cy="100" r="92" fill="url(#sunGlowHero)"/>

      <!-- Outer Runic Ring -->
      <circle cx="100" cy="100" r="88" stroke="url(#goldGradHero)" stroke-width="2.5" stroke-dasharray="8 4 2 4" opacity="0.85"/>
      <circle cx="100" cy="100" r="80" stroke="url(#goldGradHero)" stroke-width="1" opacity="0.6"/>

      <!-- Cardinal Compass Sun Rays (North, South, East, West) -->
      <!-- North Pointer (Extended) -->
      <polygon points="100,12 108,82 100,72 92,82" fill="url(#goldGradHero)"/>
      <polygon points="100,12 108,82 100,72" fill="#fff" opacity="0.3"/>
      <!-- South Pointer -->
      <polygon points="100,188 108,118 100,128 92,118" fill="url(#goldGradHero)"/>
      <polygon points="100,188 92,118 100,128" fill="#59410d" opacity="0.5"/>
      <!-- East Pointer -->
      <polygon points="188,100 118,108 128,100 118,92" fill="url(#goldGradHero)"/>
      <polygon points="188,100 118,108 128,100" fill="#fff" opacity="0.25"/>
      <!-- West Pointer -->
      <polygon points="12,100 82,108 72,100 82,92" fill="url(#goldGradHero)"/>
      <polygon points="12,100 82,92 72,100" fill="#59410d" opacity="0.5"/>

      <!-- Diagonal Corner Rays (NE, NW, SE, SW) -->
      <polygon points="162,38 114,86 122,82 118,74" fill="url(#goldGradHero)" opacity="0.9"/>
      <polygon points="38,38 86,86 78,82 82,74" fill="url(#goldGradHero)" opacity="0.9"/>
      <polygon points="162,162 114,114 122,118 118,126" fill="url(#goldGradHero)" opacity="0.9"/>
      <polygon points="38,162 86,114 78,118 82,126" fill="url(#goldGradHero)" opacity="0.9"/>

      <!-- Middle Geometric Ring -->
      <circle cx="100" cy="100" r="54" stroke="url(#goldGradHero)" stroke-width="2.5"/>
      <circle cx="100" cy="100" r="48" stroke="url(#goldGradHero)" stroke-width="1" stroke-dasharray="3 3"/>

      <!-- Exploration Map Pin / Diamond Core -->
      <path d="M100 48 C82 48 68 62 68 80 C68 102 100 138 100 138 C100 138 132 102 132 80 C132 62 118 48 100 48 Z" 
            fill="url(#goldGradHero)" stroke="#fff" stroke-width="1.5"/>

      <!-- Pin Inner Jewel / Compass Rose Core -->
      <circle cx="100" cy="80" r="16" fill="#17130e" stroke="url(#goldGradHero)" stroke-width="2"/>
      <polygon points="100,68 104,78 114,80 104,82 100,92 96,82 86,80 96,78" fill="url(#innerGlow)"/>
      <circle cx="100" cy="80" r="3.5" fill="#ffffff"/>
    </svg>
  `,

  // Email Icon
  email: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  `,

  // Password / Lock Icon
  lock: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  `,

  // User / Explorer Icon
  user: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  `,

  // Eye (Show Password)
  eye: `
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  `,

  // Eye Off (Hide Password)
  eyeOff: `
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  `,

  // Official Google Logo
  google: `
    <svg viewBox="0 0 24 24" width="19" height="19" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  `,

  // Arrow Back
  back: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  `,

  // Close X
  close: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  `,

  // Compass Rose / Adventure Pin
  compass: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="var(--gold-500)" stroke="none"/>
    </svg>
  `,

  // Shield / Relic
  shield: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  `,

  // Checkmark
  check: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  `,

  // Sparkles / Treasure
  sparkle: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  `,

  // Mailbox / Envelope
  mail: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  `,

  // Leaderboard / Trophy
  trophy: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  `,

  // AI Assistant / Robot
  bot: `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  `,

  // Settings Gear
  settings: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  `,

  // World Map
  map: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  `,

  // Play / Start Arrow
  play: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  `,

  // Flame / Streak
  flame: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  `,

  // Volume High
  volume: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  `,

  // Logout Door
  logout: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  `
};
