/* ==========================================================================
   GeoQuest Application State & Navigation Router
   Central reactive state store for Home Screen, Modals & Session
   ========================================================================== */

import { sound } from './audio.js';
import { mockPlayerData, mockLeaderboard, mockMailboxMessages } from './mockData.js';
import { subscribeRealtimeLeaderboard, updateUserXPInFirestore, logoutUser } from './authService.js';

class StateManager {
  constructor() {
    this.currentScreen = 'splash';
    this.previousScreen = null;
    this.userSession = this.loadPersistedSession();
    this.player = this.initPlayerData();
    this.leaderboard = JSON.parse(JSON.stringify(mockLeaderboard));
    this.mailbox = JSON.parse(JSON.stringify(mockMailboxMessages));
    this.listeners = [];
    this.activeModal = null;
    this.deviceMode = 'ios';
    this.selectedHeritageSite = null;
    this.selectedGameMode = null;
    this.evaluateBadgeUnlocks(true); // Automatically evaluate for existing user data on load
    this.initRealtimeLeaderboard();
  }

  initRealtimeLeaderboard() {
    try {
      subscribeRealtimeLeaderboard((players) => {
        if (Array.isArray(players) && players.length > 0) {
          this.leaderboard.topPlayers = players;
          this.updateLeaderboardRank(this.player);
          this.notify('leaderboard_update', this.leaderboard);
        }
      });
    } catch (e) {
      console.warn("Real-time leaderboard init note:", e);
    }
  }

  loadPersistedSession() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('geoquest_user_session');
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      // Local storage not available
    }
    return null;
  }

  getRegisteredAccounts() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return JSON.parse(window.localStorage.getItem('geoquest_registered_accounts') || '{}');
      }
    } catch (e) {}
    return {};
  }

  saveRegisteredAccount(account) {
    try {
      if (typeof window !== 'undefined' && window.localStorage && account) {
        const accounts = this.getRegisteredAccounts();
        const usernameKey = (account.username || 'Explorer').toLowerCase().trim();
        const existing = accounts[usernameKey] || {};
        const merged = { ...existing, ...account, lastLogin: new Date().toISOString() };
        accounts[usernameKey] = merged;
        if (account.email) {
          accounts[account.email.toLowerCase().trim()] = merged;
        }
        window.localStorage.setItem('geoquest_registered_accounts', JSON.stringify(accounts));
      }
    } catch (e) {}
  }

  calculatePlayerStats(completedMissions = [], baseStats = {}) {
    const uniqueSiteIds = new Set(
      completedMissions
        .filter(m => m.siteId)
        .map(m => m.siteId)
    );
    const uniqueRegions = new Set(
      completedMissions
        .filter(m => m.siteState)
        .map(m => m.siteState)
    );

    return {
      missionsCompleted: uniqueSiteIds.size || baseStats.missionsCompleted || 0,
      relicsDiscovered: completedMissions.length || baseStats.relicsDiscovered || 0,
      countriesExplored: uniqueRegions.size || baseStats.countriesExplored || 0,
      totalDistanceKm: baseStats.totalDistanceKm || "0.0"
    };
  }

  calculateRealStreak(lastLoginDateStr, currentStreak = 1) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastLoginDateStr) {
      return 1;
    }

    const lastLogin = new Date(lastLoginDateStr);
    lastLogin.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastLogin.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day login: retain current streak (min 1)
      return Math.max(currentStreak || 1, 1);
    } else if (diffDays === 1) {
      // Consecutive next day login: increment streak
      return (currentStreak || 1) + 1;
    } else {
      // Missed one or more days: reset to 1
      return 1;
    }
  }

  initPlayerData() {
    if (this.userSession && this.userSession.username) {
      const s = this.userSession;
      const completedMissions = s.completedMissions || [];
      const computedStats = this.calculatePlayerStats(completedMissions, s.stats || {});
      const reconciledBadges = this.reconcileBadges(s.badges || []);
      const realStreak = this.calculateRealStreak(s.lastActiveDate, s.streak || 1);

      return {
        ...mockPlayerData,
        ...s,
        username: s.username,
        level: s.level || 1,
        xp: s.xp || 0,
        nextLevelXp: s.nextLevelXp || 1000,
        title: s.title || 'Novice Cartographer',
        streak: realStreak,
        lastActiveDate: new Date().toISOString(),
        stats: computedStats,
        badges: reconciledBadges,
        completedMissions: completedMissions,
        isGuest: !!s.isGuest
      };
    }
    return JSON.parse(JSON.stringify(mockPlayerData));
  }

  generateUserMailbox(player) {
    const mails = [];

    // Add celebration mails only for genuinely unlocked badges
    (player.badges || []).filter(b => b.unlocked).forEach(b => {
      mails.push({
        id: `mail-badge-${b.id}`,
        type: "Badge Unlocked",
        icon: b.icon || "🏆",
        title: `Badge Unlocked: ${b.name}!`,
        time: b.unlockedAt || "Recent",
        preview: `You unlocked the ${b.name} badge! Reward: ${b.reward}`,
        content: `Congratulations Explorer! You have unlocked the **${b.name}** badge (${b.rarity}). "${b.desc}" Unlock condition: ${b.condition}. Your reward of ${b.reward} has been credited to your dossier.`,
        unread: false
      });
    });

    // If player has active real exploration streak > 1, add a streak mail
    if (player.streak && player.streak > 1) {
      mails.unshift({
        id: `mail-streak-${player.streak}`,
        type: "Exploration Streak",
        icon: "🔥",
        title: `${player.streak}-Day Exploration Streak Active!`,
        time: "Today",
        preview: `Keep exploring to maintain your ${player.streak}-day streak.`,
        content: `Your active exploration streak is now **${player.streak} days**. Continue discovering India's legendary monuments daily to earn bonus XP and unlock Streak Keeper badges!`,
        unread: false
      });
    }

    return mails;
  }

  updateLeaderboardRank(player) {
    const pXp = typeof player.xp === 'number' ? player.xp : 0;
    const pName = (player.username || '').toLowerCase().trim();
    const top = this.leaderboard.topPlayers || [];

    // Calculate real-time rank
    let userRank = 1;
    let foundInTop = false;

    for (let i = 0; i < top.length; i++) {
      if (top[i].name && top[i].name.toLowerCase().trim() === pName) {
        userRank = top[i].rank || (i + 1);
        foundInTop = true;
        break;
      }
    }

    if (!foundInTop) {
      userRank = 1;
      for (let i = 0; i < top.length; i++) {
        if (pXp >= top[i].xp) {
          userRank = i + 1;
          break;
        }
        userRank = i + 2;
      }
    }

    this.leaderboard.currentUserRank = {
      rank: userRank,
      name: player.username || "Explorer",
      level: player.level || 1,
      xp: pXp,
      badge: player.title || "Novice Cartographer"
    };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, data) {
    this.listeners.forEach(fn => fn(event, data, this));
  }

  navigate(screenName, options = {}) {
    if (this.currentScreen === screenName && !options.force) return;
    this.previousScreen = this.currentScreen;
    this.currentScreen = screenName;
    sound.playTap();
    this.notify('navigation', { from: this.previousScreen, to: this.currentScreen, ...options });
  }

  setUser(user, skipBadgeEval = false) {
    const rawBadges = user.badges || this.player?.badges || [];
    const reconciledBadges = this.reconcileBadges(rawBadges);
    const completedMissions = user.completedMissions || this.player?.completedMissions || [];
    const stats = this.calculatePlayerStats(completedMissions, user.stats || {});

    this.player = {
      ...this.initPlayerData(),
      ...user,
      username: user.username || 'Explorer',
      level: user.level || 1,
      xp: typeof user.xp === 'number' ? user.xp : 0,
      nextLevelXp: user.nextLevelXp || 1000,
      title: user.title || (user.level > 3 ? "Senior Relic Hunter" : "Novice Cartographer"),
      streak: user.streak || 1,
      stats: stats,
      badges: reconciledBadges,
      completedMissions: completedMissions,
      isGuest: !!user.isGuest
    };

    this.userSession = { ...this.player };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('geoquest_user_session', JSON.stringify(this.userSession));
      }
    } catch (e) {}

    this.mailbox = this.generateUserMailbox(this.player);
    this.updateLeaderboardRank(this.player);
    this.saveRegisteredAccount(this.player);
    
    // Sync to Firestore in real-time
    if (this.player.uid) {
      updateUserXPInFirestore(this.player.uid, this.player);
    }

    this.notify('user_change', this.player);

    if (!skipBadgeEval) {
      this.evaluateBadgeUnlocks(true);
    }
  }

  addXP(amount, reason = "") {
    this.player.xp = (this.player.xp || 0) + amount;
    
    // Level up calculation (Every 1000 XP)
    const newLevel = Math.floor(this.player.xp / 1000) + 1;
    if (newLevel > this.player.level) {
      this.player.level = newLevel;
      this.player.nextLevelXp = newLevel * 1000;
      this.player.title = newLevel >= 5 ? "Senior Relic Hunter" : (newLevel >= 3 ? "Master Cartographer" : "Explorer");
      sound.playChime();
      this.showToast(`🎉 LEVEL UP! You reached Level ${newLevel}!`, 'success', 4000);
    } else {
      this.showToast(`⭐ +${amount} XP earned! ${reason}`, 'success');
    }

    this.setUser(this.player);
    this.evaluateBadgeUnlocks(false);
  }

  reconcileBadges(existingBadges = []) {
    const defaultBadges = JSON.parse(JSON.stringify(mockPlayerData.badges));
    const map = new Map((existingBadges || []).map(b => [b.id, b]));

    return defaultBadges.map(def => {
      const existing = map.get(def.id);
      if (existing) {
        return {
          ...def,
          unlocked: !!existing.unlocked,
          unlockedAt: existing.unlockedAt || null,
          progress: existing.progress || def.progress
        };
      }
      return def;
    });
  }

  evaluateBadgeUnlocks(silent = false) {
    if (!this.player || !Array.isArray(this.player.badges)) return;

    const p = this.player;
    const missions = p.completedMissions || [];
    const stats = p.stats || {};
    const streak = p.streak || 1;

    // Derived counts
    const completedCount = missions.length; // all tasks
    const uniqueSites = new Set(missions.filter(m => m.siteId).map(m => m.siteId));
    const uniqueRegions = new Set(missions.filter(m => m.siteState).map(m => m.siteState));
    const quizCount = missions.filter(m => m.id && m.id.startsWith('quiz_')).length;
    const templeCount = missions.filter(m => m.siteId === 'sun_temple' || (m.id && m.id.includes('temple'))).length;
    const hasKonark = missions.some(m => m.siteId === 'sun_temple' || m.id === 'konark_mission_01' || (m.id && m.id.includes('sun_temple')));
    const factsCount = missions.filter(m => m.id && (m.id.startsWith('knowledge_') || m.id.startsWith('3d_tour_'))).length;

    let anyUnlocked = false;

    p.badges.forEach(b => {
      let shouldUnlock = false;

      switch (b.id) {
        case 'b_first_explorer':
          // Complete your first mission
          b.progress = `${Math.min(completedCount, 1)} / 1 Completed`;
          if (completedCount >= 1) shouldUnlock = true;
          break;

        case 'b_heritage_seeker':
          // Discover 5 heritage locations
          b.progress = `${Math.min(uniqueSites.size, 5)} / 5 Locations`;
          if (uniqueSites.size >= 5 || (uniqueSites.size >= 4 && uniqueSites.size > 0)) {
            // Note: dataset has 4 primary sites; if user finishes 4 or 5 locations
            if (uniqueSites.size >= 4) shouldUnlock = true;
          }
          break;

        case 'b_master_explorer':
          // Discover 10/20 locations / activities
          b.progress = `${Math.min(completedCount, 10)} / 10 Activities`;
          if (completedCount >= 10 || uniqueSites.size >= 4) shouldUnlock = true;
          break;

        case 'b_history_keeper':
          // Complete 5 history-based quizzes
          b.progress = `${Math.min(quizCount, 5)} / 5 Quizzes`;
          if (quizCount >= 1) { // Unlock if completed quizzes
            if (quizCount >= 4 || quizCount >= 5) shouldUnlock = true;
          }
          break;

        case 'b_heritage_scholar':
          // Score 90%+ in 5 quizzes (or any completed high score quiz)
          b.progress = `${Math.min(quizCount, 5)} / 5 Quizzes`;
          if (quizCount >= 2) shouldUnlock = true;
          break;

        case 'b_quiz_champion':
          // Get a perfect score in quiz
          b.progress = `${quizCount >= 1 ? 1 : 0} / 1 Perfect Score`;
          if (quizCount >= 1) shouldUnlock = true;
          break;

        case 'b_artifact_hunter':
          // Find 10 hidden artifacts / relic timelines
          const relicCount = stats.relicsDiscovered || completedCount;
          b.progress = `${Math.min(relicCount, 10)} / 10 Artifacts`;
          if (relicCount >= 5) shouldUnlock = true;
          break;

        case 'b_ancient_discoverer':
          // Discover your first ancient monument
          b.progress = `${Math.min(uniqueSites.size, 1)} / 1 Discovered`;
          if (uniqueSites.size >= 1) shouldUnlock = true;
          break;

        case 'b_sun_temple_explorer':
          // Complete the Konark/Sun Temple mission
          b.progress = `${hasKonark ? 1 : 0} / 1 Completed`;
          if (hasKonark) shouldUnlock = true;
          break;

        case 'b_temple_trailblazer':
          // Visit/discover 5 temples / activities
          b.progress = `${Math.min(templeCount, 5)} / 5 Activities`;
          if (templeCount >= 1) shouldUnlock = true;
          break;

        case 'b_heritage_navigator':
          // Visit locations from 3 different regions
          b.progress = `${Math.min(uniqueRegions.size, 3)} / 3 Regions`;
          if (uniqueRegions.size >= 3 || (uniqueRegions.size >= 2 && completedCount >= 4)) shouldUnlock = true;
          break;

        case 'b_culture_enthusiast':
          // Read/view 10 heritage facts / dossiers
          b.progress = `${Math.min(factsCount, 10)} / 10 Facts`;
          if (factsCount >= 1) shouldUnlock = true;
          break;

        case 'b_streak_keeper':
          // Play 3 consecutive days
          b.progress = `${Math.min(streak, 3)} / 3 Days`;
          if (streak >= 3) shouldUnlock = true;
          break;

        case 'b_dedicated_explorer':
          // Play 7 consecutive days
          b.progress = `${Math.min(streak, 7)} / 7 Days`;
          if (streak >= 7) shouldUnlock = true;
          break;

        case 'b_legendary_explorer':
          // Unlock 20 / all badges
          const otherUnlocked = p.badges.filter(x => x.id !== 'b_legendary_explorer' && x.unlocked).length;
          b.progress = `${otherUnlocked} / 14 Badges`;
          if (otherUnlocked >= 10) shouldUnlock = true;
          break;
      }

      if (shouldUnlock && !b.unlocked) {
        b.unlocked = true;
        b.unlockedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        anyUnlocked = true;

        // Add celebratory mailbox message
        this.addBadgeUnlockMail(b);

        if (!silent) {
          sound.playChime();
          this.showToast(`🏆 BADGE UNLOCKED: ${b.name}!`, 'success', 4000);
        }
      }
    });

    if (anyUnlocked) {
      this.setUser(this.player, true);
    }
  }

  addBadgeUnlockMail(badge) {
    if (!badge) return;
    const mailId = `mail-badge-unlock-${badge.id}`;
    
    // Check if mail already exists
    if (!this.mailbox.some(m => m.id === mailId)) {
      const newMail = {
        id: mailId,
        type: "Badge Unlocked",
        icon: badge.icon || "🏆",
        title: `Badge Unlocked: ${badge.name}!`,
        time: "Just now",
        preview: `You unlocked the ${badge.name} badge! Reward: ${badge.reward}`,
        content: `Congratulations Explorer! You have unlocked the **${badge.name}** badge (${badge.rarity}). "${badge.desc}" Unlock condition fulfilled: ${badge.condition}. Your reward of ${badge.reward} has been credited to your explorer dossier.`,
        unread: true
      };
      // Prepend to mailbox so it appears right at the top
      this.mailbox.unshift(newMail);
      this.notify('mailbox_change', this.mailbox);
    }
  }

  unlockBadge(badgeId) {
    const b = (this.player.badges || []).find(x => x.id === badgeId);
    if (b && !b.unlocked) {
      b.unlocked = true;
      b.unlockedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      this.addBadgeUnlockMail(b);
      sound.playChime();
      this.showToast(`🏆 BADGE UNLOCKED: ${b.name}!`, 'success', 4000);
      this.setUser(this.player);
    }
  }

  hasMissionCompleted(missionId) {
    return (this.player.completedMissions || []).some(m => m.id === missionId);
  }

  recordMissionCompletion(missionId, xpReward, site = null) {
    // ✅ Duplicate-claim guard — each mission can only be rewarded once
    if (this.hasMissionCompleted(missionId)) {
      this.showToast(`✅ Already claimed! You've completed this activity before.`, 'info', 3000);
      return false;
    }

    this.player.completedMissions.push({
      id: missionId,
      siteId: site ? site.id : null,
      siteState: site ? (site.state || site.location || '') : null,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      xpEarned: xpReward
    });

    // ── Recalculate all 3 stats from completedMissions ──────────────────
    this.player.stats = this.calculatePlayerStats(this.player.completedMissions, this.player.stats);
    // ────────────────────────────────────────────────────────────────────

    this.addXP(xpReward, "Mission Completed");
    return true;
  }

  async logout() {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Firebase logout error:", e);
    }

    this.userSession = null;
    this.player = JSON.parse(JSON.stringify(mockPlayerData));
    this.mailbox = JSON.parse(JSON.stringify(mockMailboxMessages));
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('geoquest_user_session');
      }
    } catch (e) {}
    this.navigate('login');
    this.showToast('You have returned to the expedition camp.', 'info');
  }

  openModal(modalName, data = {}) {
    this.activeModal = { name: modalName, data };
    sound.playTap();
    this.notify('modal_open', this.activeModal);
  }

  closeModal() {
    const closed = this.activeModal;
    this.activeModal = null;
    sound.playTap();
    this.notify('modal_close', closed);
  }

  setDeviceMode(mode) {
    this.deviceMode = mode;
    this.notify('device_change', mode);
  }

  setGameMode(mode) {
  this.selectedGameMode = mode;
  this.notify('game_mode_change', mode);
  }

  getUnreadMailCount() {
    return this.mailbox.filter(m => m.unread).length;
  }

  markMailAsRead(mailId) {
    const item = this.mailbox.find(m => m.id === mailId);
    if (item && item.unread) {
      item.unread = false;
      this.notify('mailbox_change', this.mailbox);
    }
  }

  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Remove any existing toast
    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `toast-bubble toast-${type}`;
    
    let icon = '📜';
    if (type === 'error') {
      icon = '⚠️';
      sound.playError();
    } else if (type === 'success') {
      icon = '✨';
      sound.playChime();
    } else {
      sound.playTap();
    }

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'toastSlideUpOut 0.25s forwards';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  }
}

export const appState = new StateManager();
