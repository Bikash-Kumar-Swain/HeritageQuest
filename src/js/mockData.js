/* ==========================================================================
   GeoQuest Centralized Mock Data
   Modular, pure frontend store ready for future Firestore integration
   ========================================================================== */

export const mockPlayerData = {
  username: "Explorer",
  title: "Novice Cartographer",
  level: 1,
  xp: 0,
  nextLevelXp: 1000,
  streak: 1,
  profilePicture: null,
  stats: {
    missionsCompleted: 0,
    relicsDiscovered: 0,
    countriesExplored: 0,
    totalDistanceKm: "0.0"
  },
  badges: [
    {
      id: "b_first_explorer",
      number: 1,
      name: "First Explorer",
      icon: "🗺️",
      rarity: "Bronze",
      condition: "Complete your first mission",
      desc: "Your journey into history begins.",
      reward: "+100 XP",
      progress: "0 / 1 Completed",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_heritage_seeker",
      number: 2,
      name: "Heritage Seeker",
      icon: "🏛️",
      rarity: "Bronze",
      condition: "Discover 5 heritage locations",
      desc: "You've started uncovering India's heritage.",
      reward: "+250 XP",
      progress: "0 / 5 Locations",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_master_explorer",
      number: 3,
      name: "Master Explorer",
      icon: "🧭",
      rarity: "Gold",
      condition: "Discover 10/20 locations",
      desc: "No monument is beyond your curiosity.",
      reward: "+500 XP",
      progress: "0 / 10 Locations",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_history_keeper",
      number: 4,
      name: "History Keeper",
      icon: "📜",
      rarity: "Silver",
      condition: "Complete 5 history-based quizzes",
      desc: "You preserve history through knowledge.",
      reward: "+300 XP",
      progress: "0 / 5 Quizzes",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_heritage_scholar",
      number: 5,
      name: "Heritage Scholar",
      icon: "🧠",
      rarity: "Gold",
      condition: "Score 90%+ in 5 quizzes",
      desc: "Your knowledge rivals a historian.",
      reward: "+450 XP",
      progress: "0 / 5 Quizzes",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_quiz_champion",
      number: 6,
      name: "Quiz Champion",
      icon: "🏆",
      rarity: "Silver",
      condition: "Get a perfect score",
      desc: "Not a single question defeated you.",
      reward: "+250 XP",
      progress: "0 / 1 Perfect Score",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_artifact_hunter",
      number: 7,
      name: "Artifact Hunter",
      icon: "🔎",
      rarity: "Gold",
      condition: "Find 10 hidden artifacts",
      desc: "You have an eye for forgotten treasures.",
      reward: "+400 XP",
      progress: "0 / 10 Artifacts",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_ancient_discoverer",
      number: 8,
      name: "Ancient Discoverer",
      icon: "🏺",
      rarity: "Bronze",
      condition: "Discover your first ancient monument",
      desc: "You've stepped into the ancient world.",
      reward: "+150 XP",
      progress: "0 / 1 Discovered",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_sun_temple_explorer",
      number: 9,
      name: "Sun Temple Explorer",
      icon: "☀️",
      rarity: "Gold",
      condition: "Complete the Konark/Sun Temple mission",
      desc: "You uncovered the secrets of the Sun Temple.",
      reward: "+350 XP",
      progress: "0 / 1 Completed",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_temple_trailblazer",
      number: 10,
      name: "Temple Trailblazer",
      icon: "🛕",
      rarity: "Silver",
      condition: "Visit/discover 5 temples",
      desc: "Your heritage trail grows longer.",
      reward: "+300 XP",
      progress: "0 / 5 Temples",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_heritage_navigator",
      number: 11,
      name: "Heritage Navigator",
      icon: "🗺️",
      rarity: "Gold",
      condition: "Visit locations from 3 different regions",
      desc: "You've crossed cultural boundaries.",
      reward: "+400 XP",
      progress: "0 / 3 Regions",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_culture_enthusiast",
      number: 12,
      name: "Culture Enthusiast",
      icon: "📑",
      rarity: "Bronze",
      condition: "Read/view 10 heritage facts",
      desc: "Curiosity is your greatest tool.",
      reward: "+200 XP",
      progress: "0 / 10 Facts",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_streak_keeper",
      number: 13,
      name: "Streak Keeper",
      icon: "🔥",
      rarity: "Silver",
      condition: "Play 3 consecutive days",
      desc: "Your exploration never stops.",
      reward: "+250 XP",
      progress: "0 / 3 Days",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_dedicated_explorer",
      number: 14,
      name: "Dedicated Explorer",
      icon: "⚡",
      rarity: "Gold",
      condition: "Play 7 consecutive days",
      desc: "A week of discovering history.",
      reward: "+500 XP",
      progress: "0 / 7 Days",
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "b_legendary_explorer",
      number: 15,
      name: "Legendary Explorer",
      icon: "🌟",
      rarity: "Mythic",
      condition: "Unlock 20 badges",
      desc: "Your journey has become legendary.",
      reward: "+1,000 XP",
      progress: "0 / 15 Badges",
      unlocked: false,
      unlockedAt: null
    }
  ],
  completedMissions: []
};

export const mockLeaderboard = {
  topPlayers: [],
  currentUserRank: {
    rank: 1,
    name: "Explorer",
    level: 1,
    xp: 0,
    badge: "Novice Cartographer"
  }
};

export const mockMailboxMessages = [];
