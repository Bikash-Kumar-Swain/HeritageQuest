/* ==========================================================================
   GeoQuest — Home Screen
   Pixel-perfect replica of the reference image.
   Fixed height, no scroll. Full-bleed background. Overlaid panels.
   ========================================================================== */

import { SVG_ICONS } from '../assets.js';
import { appState } from '../state.js';
import { sound } from '../audio.js';

export function renderHomeScreen() {
  const p = appState.player;
  const unread = appState.getUnreadMailCount();
  const xpPct = Math.min(100, Math.round((p.xp / p.nextLevelXp) * 100));

  // ── Build leaderboard list ──────────────────────────────────────────────
  const top = appState.leaderboard.topPlayers || [];
  const userXp = p.xp || 0;

  // User is always rank 1 if no other real players exist, otherwise compute position
  let userRank = 1;
  for (let i = 0; i < top.length; i++) {
    if (userXp >= top[i].xp) { userRank = i + 1; break; }
    userRank = i + 2;
  }

  // Sync state rank
  appState.leaderboard.currentUserRank = { rank: userRank, name: p.username, xp: userXp };

  // Build visible rows: always include user + any real players above them
  const lbEntries = [];
  let userInserted = false;
  for (let i = 0; i < top.length && lbEntries.length < 5; i++) {
    const rank = i + 1;
    if (!userInserted && userRank <= rank) {
      lbEntries.push({ rank: userRank, name: p.username, xp: userXp, isUser: true });
      userInserted = true;
      if (lbEntries.length >= 5) break;
    }
    if (top[i].name.toLowerCase() !== p.username.toLowerCase()) {
      lbEntries.push({ rank, name: top[i].name, xp: top[i].xp, isUser: false });
    }
  }
  if (!userInserted) {
    if (lbEntries.length >= 5) lbEntries[4] = { rank: userRank, name: p.username, xp: userXp, isUser: true };
    else lbEntries.push({ rank: userRank, name: p.username, xp: userXp, isUser: true });
  }

  const lbListHTML = lbEntries.length === 0
    ? `<li style="background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); border-radius:6px;">
        <span class="r" style="color:#ffd700;">🥇</span>
        <span class="n" style="color:#ffd700; font-weight:800;">${p.username} ⭐</span>
        <span class="x">${userXp.toLocaleString()} XP</span>
       </li>`
    : lbEntries.map(e => {
        const rankIcons = ['🥇','🥈','🥉'];
        const rankDisplay = e.rank <= 3 ? rankIcons[e.rank - 1] : e.rank;
        const userStyle = e.isUser ? 'background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); border-radius:6px; margin:1px 0;' : '';
        const nameStyle = e.isUser ? 'color:#ffd700; font-weight:800;' : '';
        const rankStyle = e.isUser ? 'color:#ffd700;' : '';
        return `<li style="${userStyle}">
          <span class="r" style="${rankStyle}">${rankDisplay}</span>
          <span class="n" style="${nameStyle}">${e.name}${e.isUser ? ' ⭐' : ''}</span>
          <span class="x">${e.xp.toLocaleString()} XP</span>
        </li>`;
      }).join('');
  // ── End leaderboard ─────────────────────────────────────────────────────

  /* ─── Root container ─── */
  const root = document.createElement('div');
  root.className = 'screen-view hs anim-fade-in';
  root.id = 'home-screen';

  root.innerHTML = `

    <!-- ─── Cinematic BG (fills entire phone, never scrolls) ─── -->
    <div class="hs-bg" aria-hidden="true"></div>
    <!-- Dark gradient overlay: heavier at top & bottom, clear in mid -->
    <div class="hs-grad" aria-hidden="true"></div>

    <!-- ─── Floating ember dust ─── -->
    <div class="hs-dust" aria-hidden="true">
      ${Array.from({length:12},(_,i)=>`<span class="dust d${i+1}"></span>`).join('')}
    </div>

    <!-- ════════════════════════════════════════════════
         ROW 1 — TOP HUD BAR
         [Profile Card] [XP Card] [Mailbox Card]
    ═════════════════════════════════════════════════ -->
    <header class="hs-row hs-topbar">

      <!-- Profile (left) -->
      <button class="hs-card hs-profile" id="hs-profile" type="button" aria-label="View profile">
        <div class="hs-av-wrap">
          <img src="./src/assets/avatar.jpg" alt="" class="hs-av-img"/>
          <span class="hs-av-dot" aria-hidden="true"></span>
        </div>
        <div class="hs-pinfo">
          <div class="hs-prow1">
            <span class="hs-pname">${p.username}</span>
            <span class="hs-plvl">LEVEL ${p.level}</span>
          </div>
          <div class="hs-prow2">
            <span class="hs-picon">🧭</span>
            <span class="hs-ptitle">${p.title}</span>
          </div>
        </div>
      </button>

      <!-- XP (centre) -->
      <div class="hs-card hs-xp" id="hs-xp" role="status" aria-label="Current Player XP: ${p.xp} out of ${p.nextLevelXp}">
        <div class="hs-xp-top">
          <span class="hs-xp-coin" aria-hidden="true">🪙</span>
          <span class="hs-xp-num">${p.xp.toLocaleString()} XP</span>
        </div>
        <div class="hs-xp-track">
          <div class="hs-xp-fill" style="width:${xpPct}%"></div>
          <div class="hs-xp-gleam" aria-hidden="true"></div>
        </div>
        <span class="hs-xp-sub">${p.xp.toLocaleString()} / ${p.nextLevelXp.toLocaleString()} XP</span>
      </div>

      <!-- Mailbox (right) -->
      <button class="hs-card hs-mail" id="hs-mail" type="button" aria-label="Open mailbox">
        ${unread > 0 ? `<span class="hs-badge" aria-label="${unread} unread">${unread}</span>` : ''}
        <span class="hs-mail-ico" aria-hidden="true">${SVG_ICONS.mail}</span>
        <span class="hs-mail-lbl">Mailbox</span>
      </button>

    </header>

    <!-- ════════════════════════════════════════════════
         ROW 2 — MIDDLE (3-column over background)
         [Leaderboard] [transparent] [Heritage AI]
    ═════════════════════════════════════════════════ -->
    <div class="hs-row hs-mid">

      <!-- LEFT: Leaderboard -->
      <section class="hs-card hs-lb" id="hs-lb" role="region" aria-label="Leaderboard">
        <div class="hs-lb-trophy" aria-hidden="true">🏆</div>
        <h2 class="hs-stitle">LEADERBOARD</h2>
        <p class="hs-ssub">Top Explorers</p>

        <ol class="hs-lb-list" aria-label="Top explorers">
          ${lbListHTML}
        </ol>

        <div class="hs-myrank">
          <span class="hs-myrank-lbl">YOUR RANK</span>
          <span class="hs-myrank-num">#${userRank}</span>
          <span class="hs-myrank-user">${p.username}</span>
          <span class="hs-myrank-xp">${userXp.toLocaleString()} XP</span>
        </div>
      </section>

      <!-- CENTRE: transparent pass-through -->
      <div class="hs-mid-gap" aria-hidden="true"></div>

      <!-- RIGHT: Heritage AI -->
      <section class="hs-card hs-ai" id="hs-ai" role="region" aria-label="Heritage AI">
        <div class="hs-ai-circle anim-pulse-logo" aria-hidden="true">
          <span class="hs-ai-face">🤖</span>
        </div>
        <h2 class="hs-stitle">HERITAGE AI</h2>
        <p class="hs-ssub hs-ai-teal">Your AI Guide</p>
        <p class="hs-ai-desc">
          Ask me about<br>heritage sites,<br>monuments,<br>history &amp; culture.
        </p>
        <button class="hs-btn-chat" id="hs-chat" type="button">
          CHAT NOW &rsaquo;
        </button>
      </section>

    </div>

    <!-- ════════════════════════════════════════════════
         ROW 3 — BOTTOM CONTROLS
         [Settings] … [EXPLORE]
    ═════════════════════════════════════════════════ -->
    <div class="hs-row hs-brow">

      <!-- Settings (bottom-left standalone square) -->
      <button class="hs-card hs-settings" id="hs-settings" type="button" aria-label="Settings">
        <span class="hs-set-ico" aria-hidden="true">${SVG_ICONS.settings}</span>
        <span class="hs-set-lbl">SETTINGS</span>
      </button>

      <!-- EXPLORE Button (bottom-right main action) -->
      <button class="hs-btn-explore-main" id="hs-btn-explore" type="button" aria-label="Explore India Heritage Map">
        <div class="hs-explore-icon-wrap anim-pulse-logo" aria-hidden="true">
          ${SVG_ICONS.logoHero}
        </div>
        <div class="hs-explore-txt">
          <span class="hs-explore-main">EXPLORE</span>
          <span class="hs-explore-sub">INDIA HERITAGE REALM</span>
        </div>
        <div class="hs-explore-sheen" aria-hidden="true"></div>
      </button>

    </div>

    <!-- ════════════════════════════════════════════════
         ROW 4 — BOTTOM NAV DOCK
    ═════════════════════════════════════════════════ -->
    <nav class="hs-nav" aria-label="Main navigation">
      <button class="hs-tab active" id="hs-tab-home"       type="button"><span class="hs-tab-ic">${SVG_ICONS.compass}</span><span class="hs-tab-lbl">HOME</span></button>
      <button class="hs-tab"        id="hs-tab-collection" type="button"><span class="hs-tab-ic" aria-hidden="true">📦</span><span class="hs-tab-lbl">COLLECTION</span></button>
    </nav>

  `;

  /* ─── Scoped styles ─── */
  const style = document.createElement('style');
  style.textContent = `

/* ═══════════════════════════════════════════════════
   ROOT — Fixed height, no scroll, flex column
═══════════════════════════════════════════════════ */
.hs {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;          /* ZERO scroll, ever */
  display: flex;
  flex-direction: column;
  background: #06050300;
}

/* ═══ Full-Bleed Background ═══ */
.hs-bg {
  position: absolute;
  inset: 0;
  background: url('./src/assets/explorer_bg.jpg') center 18% / cover no-repeat;
  animation: bgBreath 14s ease-in-out infinite alternate;
  z-index: 0;
}
@keyframes bgBreath {
  from { transform: scale(1);    }
  to   { transform: scale(1.05); }
}

.hs-grad {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg,
      rgba(5,4,3,.88) 0%,
      rgba(5,4,3,.30) 14%,
      rgba(5,4,3,.04) 32%,
      rgba(5,4,3,.04) 62%,
      rgba(5,4,3,.45) 80%,
      rgba(5,4,3,.94) 100%
    );
}

/* ═══ Ember Dust ═══ */
.hs-dust { position:absolute; inset:0; z-index:2; pointer-events:none; overflow:hidden; }
.dust {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #ffe566 0%, #ff9800 55%, transparent 100%);
  opacity: 0;
  animation: dustRise linear infinite;
}
@keyframes dustRise {
  0%   { opacity:0;   transform:translateY(0) scale(1); }
  8%   { opacity:.9; }
  92%  { opacity:.5; }
  100% { opacity:0;   transform:translateY(-85vh) scale(.3); }
}
.d1  { width:4px; height:4px; left:10%; bottom:22%; animation-duration:7s;  animation-delay:0s;    }
.d2  { width:3px; height:3px; left:22%; bottom:18%; animation-duration:9s;  animation-delay:1.1s;  }
.d3  { width:5px; height:5px; left:38%; bottom:26%; animation-duration:6s;  animation-delay:.4s;   }
.d4  { width:3px; height:3px; left:55%; bottom:30%; animation-duration:11s; animation-delay:2s;    }
.d5  { width:4px; height:4px; left:68%; bottom:20%; animation-duration:8s;  animation-delay:3.2s;  }
.d6  { width:2px; height:2px; left:80%; bottom:25%; animation-duration:10s; animation-delay:1.7s;  }
.d7  { width:4px; height:4px; left:7%;  bottom:42%; animation-duration:7.5s;animation-delay:4.5s;  }
.d8  { width:3px; height:3px; left:47%; bottom:18%; animation-duration:9.5s;animation-delay:.7s;   }
.d9  { width:5px; height:5px; left:30%; bottom:50%; animation-duration:13s; animation-delay:2.4s;  }
.d10 { width:2px; height:2px; left:72%; bottom:44%; animation-duration:8.5s;animation-delay:4.8s;  }
.d11 { width:3px; height:3px; left:90%; bottom:35%; animation-duration:6.5s;animation-delay:1.3s;  }
.d12 { width:4px; height:4px; left:15%; bottom:60%; animation-duration:12s; animation-delay:5.5s;  }

/* ═══ Layout rows ═══ */
.hs-row { position:relative; z-index:10; width:100%; }

/* ─ TOP BAR ─ */
.hs-topbar {
  display: flex;
  align-items: stretch;
  gap: 6px;
  padding: calc(var(--safe-top, 14px) + 6px) 8px 0 8px;
  flex-shrink: 0;
}

/* ─ MID (fills remaining space, panels sit at top) ─ */
.hs-mid {
  flex: 1 1 0;
  display: grid;
  grid-template-columns: minmax(0,1fr) minmax(0,.9fr) minmax(0,1fr);
  gap: 6px;
  padding: 6px 8px 0 8px;
  align-items: start;   /* panels only as tall as content */
  min-height: 0;
  overflow: hidden;
}

/* ─ BOTTOM ROW ─ */
.hs-brow {
  display: flex;
  align-items: stretch;
  gap: 6px;
  padding: 6px 8px 4px 8px;
  flex-shrink: 0;
}

/* ─ NAV ─ */
.hs-nav {
  position: relative;
  z-index: 15;
  display: flex;
  align-items: stretch;
  background: rgba(7,5,3,.94);
  border-top: 1.5px solid rgba(212,175,55,.25);
  padding: 4px 0 calc(var(--safe-bottom,0px) + 4px) 0;
  flex-shrink: 0;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* ═══════════════════════════════════════════════════
   SHARED CARD SURFACE
═══════════════════════════════════════════════════ */
.hs-card {
  background: rgba(10,8,6,.84);
  border: 1.5px solid rgba(212,175,55,.35);
  border-radius: 11px;
  box-shadow:
    0 4px 22px rgba(0,0,0,.75),
    inset 0 1px 0 rgba(212,175,55,.2);
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  transition: border-color .16s ease, transform .16s ease, box-shadow .16s ease;
  border: none; /* override below for button-only */
}
button.hs-card,
button.hs-card:focus-visible {
  border: 1.5px solid rgba(212,175,55,.35);
  outline: none;
  cursor: pointer;
}
button.hs-card:hover {
  border-color: rgba(212,175,55,.7);
  box-shadow: 0 6px 28px rgba(0,0,0,.8), 0 0 14px rgba(212,175,55,.12);
  transform: scale(1.025) translateY(-1px);
}
button.hs-card:active { transform: scale(.96); }
/* non-button cards keep border always */
.hs-xp, .hs-lb, .hs-ai {
  border: 1.5px solid rgba(212,175,55,.35);
}

/* ═══════════════════════════════════════════════════
   TOP BAR CARDS
═══════════════════════════════════════════════════ */

/* ─ PROFILE ─ */
.hs-profile {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 9px 7px 7px;
  flex: 0 0 auto;
}
.hs-av-wrap {
  position: relative;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
}
.hs-av-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d4af37;
  display: block;
  box-shadow: 0 0 10px rgba(212,175,55,.45);
}
.hs-av-dot {
  position: absolute;
  bottom: 1px;
  right: -1px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #52b788;
  border: 1.5px solid #0a0806;
  box-shadow: 0 0 5px #52b788;
  animation: dotPulse 2.5s ease-in-out infinite;
}
@keyframes dotPulse {
  0%,100% { box-shadow:0 0 4px #52b788; }
  50%      { box-shadow:0 0 10px #52b788,0 0 18px rgba(82,183,136,.4); }
}
.hs-pinfo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.hs-prow1 {
  display: flex;
  align-items: center;
  gap: 5px;
}
.hs-pname {
  font-family: var(--font-serif);
  font-size: 12.5px;
  font-weight: 800;
  color: #f5ecd4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
  line-height: 1;
}
.hs-plvl {
  font-size: 7px;
  font-weight: 800;
  letter-spacing: .5px;
  color: #d4af37;
  background: rgba(212,175,55,.14);
  border: 1px solid rgba(212,175,55,.42);
  border-radius: 3px;
  padding: 1px 4px;
  white-space: nowrap;
  line-height: 1.4;
}
.hs-prow2 {
  display: flex;
  align-items: center;
  gap: 3px;
}
.hs-picon { font-size: 9px; }
.hs-ptitle {
  font-size: 8.5px;
  color: #a09080;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

/* ─ XP CARD ─ */
.hs-xp {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 10px;
  flex: 1 1 0;
  min-width: 0;
  cursor: default;
}
.hs-xp:hover {
  transform: none;
}
.hs-xp-top {
  display: flex;
  align-items: center;
  gap: 5px;
  line-height: 1;
}
.hs-xp-coin {
  font-size: 18px;
  filter: drop-shadow(0 0 5px rgba(255,200,0,.8));
  animation: coinFlip 5s ease-in-out infinite;
}
@keyframes coinFlip {
  0%,42%,100% { transform:rotateY(0deg);   filter:drop-shadow(0 0 5px rgba(255,200,0,.7)); }
  46%,56%     { transform:rotateY(180deg); filter:drop-shadow(0 0 12px rgba(255,220,0,1)); }
  60%         { transform:rotateY(360deg); }
}
.hs-xp-num {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 900;
  color: #fae4a8;
  letter-spacing: .3px;
  line-height: 1;
  white-space: nowrap;
}
.hs-xp-track {
  position: relative;
  width: 100%;
  height: 5px;
  background: rgba(255,255,255,.1);
  border-radius: 3px;
  overflow: hidden;
}
.hs-xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #b89025, #d4af37, #fae4a8);
  border-radius: 3px;
  box-shadow: 0 0 7px rgba(212,175,55,.7);
  animation: xpGlow 2.2s ease-in-out infinite alternate;
}
@keyframes xpGlow {
  from { box-shadow:0 0 5px rgba(212,175,55,.5); }
  to   { box-shadow:0 0 14px rgba(245,214,125,.95); }
}
.hs-xp-gleam {
  position: absolute;
  top: 0; left: 0;
  width: 55%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
  border-radius: 3px;
  animation: gleamMove 2s linear infinite;
}
@keyframes gleamMove {
  from { transform:translateX(-100%); }
  to   { transform:translateX(280%); }
}
.hs-xp-sub {
  font-size: 8.5px;
  color: #7a6a58;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ─ MAILBOX ─ */
.hs-mail {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 7px 10px;
  flex: 0 0 auto;
  min-width: 58px;
}
.hs-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: #fff;
  font-size: 9px;
  font-weight: 900;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #0a0806;
  box-shadow: 0 0 7px rgba(231,76,60,.9);
  animation: badgePop .4s cubic-bezier(.17,.67,.83,.67) both;
}
@keyframes badgePop {
  0%   { transform:scale(0); }
  70%  { transform:scale(1.25); }
  100% { transform:scale(1); }
}
.hs-mail-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  width: 22px;
  height: 22px;
}
.hs-mail-lbl {
  font-size: 9px;
  font-weight: 700;
  color: #a09080;
  white-space: nowrap;
}

/* ═══════════════════════════════════════════════════
   MID SECTION
═══════════════════════════════════════════════════ */
.hs-mid-gap { /* transparent centre column */ }

/* ─ LEADERBOARD ─ */
.hs-lb {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 7px;
  overflow: hidden;
  animation: slideFromLeft .45s cubic-bezier(.16,1,.3,1) .1s both;
}
@keyframes slideFromLeft {
  from { opacity:0; transform:translateX(-16px); }
  to   { opacity:1; transform:translateX(0); }
}
.hs-lb-trophy {
  font-size: 24px;
  line-height: 1;
  margin-bottom: 2px;
  filter: drop-shadow(0 0 8px rgba(212,175,55,.7));
  animation: trophyFloat 3s ease-in-out infinite;
}
@keyframes trophyFloat {
  0%,100% { transform:translateY(0); }
  50%     { transform:translateY(-3px); }
}
.hs-stitle {
  font-family: var(--font-serif);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
  color: #ebd07b;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}
.hs-ssub {
  font-size: 8px;
  color: #8a7a68;
  text-align: center;
  margin: 0 0 4px;
  line-height: 1.2;
}
.hs-ai-teal { color: #6ee7b7 !important; }

.hs-lb-list {
  list-style: none;
  padding: 0;
  margin: 0 0 5px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.hs-lb-list li {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 2px;
  font-size: 8.5px;
  border-radius: 3px;
  transition: background .14s;
}
.hs-lb-list li:hover { background:rgba(212,175,55,.07); }
.hs-lb-list li.dots {
  justify-content: space-evenly;
  color: #5a4e44;
  font-size: 8px;
}
.hs-lb-list .r {
  font-weight: 800;
  color: #d4af37;
  min-width: 13px;
  font-size: 8px;
}
.hs-lb-list .n {
  flex: 1;
  color: #e8ddd0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 8.5px;
}
.hs-lb-list .x {
  font-weight: 700;
  color: #f0a830;
  font-size: 8px;
  white-space: nowrap;
}

.hs-myrank {
  width: 100%;
  background: rgba(6,5,3,.82);
  border: 1px solid rgba(212,175,55,.28);
  border-radius: 7px;
  padding: 5px 4px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-top: 5px;
}
.hs-myrank-lbl {
  font-size: 7px;
  font-weight: 800;
  letter-spacing: .8px;
  color: #d4af37;
  line-height: 1.4;
}
.hs-myrank-num {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 900;
  color: #fae4a8;
  line-height: 1.1;
}
.hs-myrank-user {
  font-size: 8.5px;
  font-weight: 700;
  color: #e8ddd0;
  line-height: 1.3;
}
.hs-myrank-xp {
  font-size: 8px;
  color: #d4af37;
  font-weight: 800;
  line-height: 1.3;
}

/* ─ HERITAGE AI ─ */
.hs-ai {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 7px;
  overflow: hidden;
  animation: slideFromRight .45s cubic-bezier(.16,1,.3,1) .2s both;
}
@keyframes slideFromRight {
  from { opacity:0; transform:translateX(16px); }
  to   { opacity:1; transform:translateX(0); }
}
.hs-ai-circle {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(55,65,80,.7);
  border: 2px solid rgba(120,140,160,.7);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 14px rgba(110,231,183,.25), inset 0 1px 1px rgba(255,255,255,.15);
  margin-bottom: 3px;
}
.hs-ai-face { font-size: 24px; display:block; }
.hs-ai-desc {
  font-size: 9px;
  line-height: 1.5;
  color: #9a8a7a;
  text-align: center;
  flex: 1;
  margin: 0 0 8px;
}
.hs-btn-chat {
  width: 100%;
  padding: 6px 4px;
  background: rgba(14,11,8,.9);
  border: 1.5px solid rgba(212,175,55,.4);
  border-radius: 7px;
  color: #d4af37;
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .8px;
  cursor: pointer;
  transition: all .16s ease;
  position: relative;
  overflow: hidden;
}
.hs-btn-chat::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,transparent,rgba(212,175,55,.1),transparent);
  transform: translateX(-100%);
  transition: transform .3s ease;
}
.hs-btn-chat:hover::after { transform:translateX(100%); }
.hs-btn-chat:hover {
  border-color: rgba(212,175,55,.8);
  box-shadow: 0 0 10px rgba(212,175,55,.25);
}
.hs-btn-chat:active { transform:scale(.96); }

/* ═══════════════════════════════════════════════════
   BOTTOM CONTROLS ROW
═══════════════════════════════════════════════════ */
.hs-brow {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 6px 10px 8px 10px;
  flex-shrink: 0;
}

/* ─ SETTINGS ─ */
.hs-settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 72px;
  height: 64px;
  flex-shrink: 0;
  padding: 8px;
  background: rgba(18,14,10,.88);
  border-radius: 12px;
}
.hs-set-ico {
  color: #d4af37;
  display: flex;
  width: 24px;
  height: 24px;
  transition: transform .16s ease;
}
.hs-settings:hover .hs-set-ico { animation: settingsSpin 1.5s linear infinite; }
@keyframes settingsSpin { to { transform:rotate(360deg); } }
.hs-set-lbl {
  font-family: var(--font-serif);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #8a7a68;
}

/* ─ EXPLORE MAIN ACTION BUTTON ─ */
.hs-btn-explore-main {
  flex: 1;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #3d2d12 0%, #1e1509 50%, #3d2d12 100%);
  border: 2px solid #d4af37;
  border-radius: 12px;
  box-shadow: 0 6px 28px rgba(212,175,55,.4), inset 0 1px 0 rgba(255,255,255,.25);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all .16s ease;
  padding: 0 16px;
}
.hs-btn-explore-main:hover {
  border-color: #fae4a8;
  background: linear-gradient(135deg, #4e3a18 0%, #271c0b 50%, #4e3a18 100%);
  box-shadow: 0 8px 36px rgba(212,175,55,.65), inset 0 1px 0 rgba(255,255,255,.35);
  transform: translateY(-1px);
}
.hs-btn-explore-main:active {
  transform: scale(.97);
}
.hs-explore-icon-wrap {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}
.hs-explore-txt {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.hs-explore-main {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 3px;
  color: #fae4a8;
  line-height: 1;
  text-shadow: 0 0 12px rgba(212,175,55,.5);
}
.hs-explore-sub {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.4px;
  color: #d4af37;
  margin-top: 2px;
}
.hs-explore-sheen {
  position: absolute;
  top: 0; left: 0;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,235,170,.3), transparent);
  animation: goldSheen 3.5s ease-in-out infinite;
  pointer-events: none;
  border-radius: 12px;
}

/* ═══════════════════════════════════════════════════
   BOTTOM NAV
═══════════════════════════════════════════════════ */
.hs-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: transparent;
  border: none;
  padding: 5px 4px;
  cursor: pointer;
  color: #4a3e34;
  transition: color .16s ease;
  border-radius: 6px;
  position: relative;
}
.hs-tab:hover { color: #d4af37; }
.hs-tab.active { color: #d4af37; }
.hs-tab-ic {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform .16s ease;
  line-height: 1;
}
.hs-tab.active .hs-tab-ic {
  transform: scale(1.1);
  filter: drop-shadow(0 0 6px rgba(212,175,55,.7));
}
.hs-tab-lbl {
  font-family: var(--font-serif);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: .8px;
  white-space: nowrap;
}
/* Active indicator bar at top of tab */
.hs-tab.active::before {
  content: '';
  position: absolute;
  top: 0; left: 25%; right: 25%;
  height: 2px;
  border-radius: 0 0 2px 2px;
  background: #d4af37;
  box-shadow: 0 0 8px rgba(212,175,55,.8);
  animation: barPop .25s ease both;
}
@keyframes barPop {
  from { transform:scaleX(0); opacity:0; }
  to   { transform:scaleX(1); opacity:1; }
}
  `;
  root.appendChild(style);

  /* ─── Event Wiring ─── */
  root.querySelector('#hs-profile')
    ?.addEventListener('click', () => { sound.playTap(); appState.openModal('profile'); });
  root.querySelector('#hs-xp')
    ?.addEventListener('click', () => {
      sound.playCoin();
    });
  root.querySelector('#hs-mail')
    ?.addEventListener('click', () => { sound.playTap(); appState.openModal('mailbox'); });
  root.querySelector('#hs-lb')
    ?.addEventListener('click', () => { sound.playTap(); appState.openModal('leaderboard'); });
  root.querySelector('#hs-ai')
    ?.addEventListener('click', () => { sound.playTap(); appState.openModal('heritage_ai'); });
  root.querySelector('#hs-chat')
    ?.addEventListener('click', e => { e.stopPropagation(); sound.playTap(); appState.openModal('heritage_ai'); });
  root.querySelector('#hs-settings')
    ?.addEventListener('click', () => { sound.playTap(); appState.openModal('settings'); });
  root.querySelector('#hs-btn-explore')
    ?.addEventListener('click', () => {
      sound.playChime();
      appState.navigate('map');
    });

  /* Nav tabs */
  const tabs = root.querySelectorAll('.hs-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sound.playTap();
      const id = tab.id;
      if (id === 'hs-tab-collection') {
        appState.openModal('collection');
      } else if (id === 'hs-tab-home') {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      }
    });
  });

  // Reactive DOM sync for real-time leaderboard and XP updates
  const updateLeaderboardDOM = () => {
    const listEl = root.querySelector('.hs-lb-list');
    const myRankNum = root.querySelector('.hs-myrank-num');
    const myRankXp = root.querySelector('.hs-myrank-xp');
    const myRankUser = root.querySelector('.hs-myrank-user');
    const headerXpVal = root.querySelector('.hs-gold-val');
    const headerLvlPill = root.querySelector('.hs-badge-pill');

    const currP = appState.player;
    const topP = appState.leaderboard.topPlayers || [];
    const currUserXp = currP.xp || 0;
    const currUserRank = appState.leaderboard.currentUserRank?.rank || 1;

    if (headerXpVal) headerXpVal.textContent = `${currUserXp.toLocaleString()} XP`;
    if (headerLvlPill) headerLvlPill.textContent = `LEVEL ${currP.level || 1}`;

    if (listEl) {
      const entries = [];
      let userPlaced = false;
      for (let i = 0; i < topP.length && entries.length < 5; i++) {
        const rank = i + 1;
        if (!userPlaced && currUserRank <= rank) {
          entries.push({ rank: currUserRank, name: currP.username, xp: currUserXp, isUser: true });
          userPlaced = true;
          if (entries.length >= 5) break;
        }
        if (topP[i].name.toLowerCase() !== currP.username.toLowerCase()) {
          entries.push({ rank, name: topP[i].name, xp: topP[i].xp, isUser: false });
        }
      }
      if (!userPlaced) {
        if (entries.length >= 5) entries[4] = { rank: currUserRank, name: currP.username, xp: currUserXp, isUser: true };
        else entries.push({ rank: currUserRank, name: currP.username, xp: currUserXp, isUser: true });
      }

      listEl.innerHTML = entries.map(e => {
        const rankIcons = ['🥇','🥈','🥉'];
        const rankDisplay = e.rank <= 3 ? rankIcons[e.rank - 1] : e.rank;
        const userStyle = e.isUser ? 'background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); border-radius:6px; margin:1px 0;' : '';
        const nameStyle = e.isUser ? 'color:#ffd700; font-weight:800;' : '';
        const rankStyle = e.isUser ? 'color:#ffd700;' : '';
        return `<li style="${userStyle}">
          <span class="r" style="${rankStyle}">${rankDisplay}</span>
          <span class="n" style="${nameStyle}">${e.name}${e.isUser ? ' ⭐' : ''}</span>
          <span class="x">${(e.xp || 0).toLocaleString()} XP</span>
        </li>`;
      }).join('');
    }

    if (myRankNum) myRankNum.textContent = `#${currUserRank}`;
    if (myRankXp) myRankXp.textContent = `${currUserXp.toLocaleString()} XP`;
    if (myRankUser) myRankUser.textContent = currP.username;
  };

  appState.subscribe((event) => {
    if (event === 'leaderboard_update' || event === 'user_change') {
      updateLeaderboardDOM();
    }
  });

  return root;
}
