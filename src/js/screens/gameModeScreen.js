/* ==========================================================================
   Heritage Quest — Game Mode Selection Screen
   Virtual Mode with 4 Options: View 3D, Mission, Quiz, Arrange + AI Assistant
   ========================================================================== */

import { SVG_ICONS } from '../assets.js';
import { appState } from '../state.js';
import { sound } from '../audio.js';
import { HERITAGE_SITES } from '../heritageSites.js';
import { verifyProximity, setSimulatedLocation, clearSimulatedLocation, isSimulatingLocation } from '../location.js';
import { askHeritageAI, verifyHeritagePhoto } from '../geminiService.js';

export function renderGameModeScreen(passedSite) {
  const site = passedSite || appState.selectedHeritageSite || HERITAGE_SITES[0];
  const root = document.createElement('div');
  root.className = 'screen-view gms anim-fade-in';
  root.id = 'game-mode-screen';

  // Complete 6-Question Serial Quiz Dataset
  const siteQuizzes = {
    taj_mahal: [
      {
        question: "Who commissioned the construction of the Taj Mahal?",
        options: ["Shah Jahan", "Akbar the Great", "Aurangzeb", "Babur"],
        correct: 0,
        fact: "Shah Jahan built the Taj Mahal in 1632 in memory of his favorite wife, Mumtaz Mahal."
      },
      {
        question: "The Taj Mahal is built primarily from which material?",
        options: ["White Makrana Marble", "Red Sandstone", "Black Granite", "Limestone"],
        correct: 0,
        fact: "The Taj Mahal is clad entirely in white Makrana marble from Rajasthan."
      },
      {
        question: "How long did the construction of the Taj Mahal take?",
        options: ["22 Years", "10 Years", "40 Years", "5 Years"],
        correct: 0,
        fact: "Over 20,000 artisans worked for 22 years (1632–1653) to complete the Taj Mahal."
      }
    ],
    ajanta_ellora: [
      {
        question: "What is the famous Kailasa Temple at Ellora notable for?",
        options: [
          "World's largest monolithic rock excavation",
          "Built entirely of white marble",
          "Tallest wooden pagoda in Asia",
          "Underground river waterway"
        ],
        correct: 0,
        fact: "Kailasa Temple (Cave 16) was carved top-down from a single massive basalt rock cliff!"
      },
      {
        question: "How many caves are there in the Ajanta complex?",
        options: ["30 Caves", "12 Caves", "50 Caves", "18 Caves"],
        correct: 0,
        fact: "There are 30 rock-cut caves at Ajanta featuring Buddhist murals and sculptures."
      },
      {
        question: "The Ajanta cave paintings depict stories from which religion?",
        options: ["Buddhism", "Hinduism", "Jainism", "Zoroastrianism"],
        correct: 0,
        fact: "The Ajanta murals primarily depict Jataka tales of Buddha's past lives."
      }
    ],
    sun_temple: [
      // Q1: General Trivia
      {
        question: "How many carved stone wheels act as sundials on the Konark Sun Temple?",
        options: ["24 Wheels", "12 Wheels", "8 Wheels", "36 Wheels"],
        correct: 0,
        fact: "The 24 wheels represent the 24 hours of a day and accurately calculate solar time!"
      },
      // Q2: Dynasty
      {
        question: "Which dynasty built the Konark Sun Temple?",
        options: ["Eastern Ganga Dynasty", "Maurya Empire", "Chola Dynasty", "Gupta Empire"],
        correct: 0,
        fact: "King Narasimhadeva I of the Eastern Ganga Dynasty commissioned the Sun Temple around 1250 CE."
      },
      // Q3: Monument Shape
      {
        question: "What animal forms the massive pulling chariot of the Konark Sun Temple?",
        options: ["Seven Horses", "Royal Elephants", "Golden Lions", "Sacred Oxen"],
        correct: 0,
        fact: "Seven galloping horses pull the chariot of the Sun God Surya, representing the days of the week."
      },
      // Q4: Odia Heritage Task 1 (Spokes)
      {
        question: "How many major spokes does each Konark sundial wheel have to calculate the 'Prahars' of the day?",
        localLanguageTerm: "ରଥ ଚକ (Ratha Chaka)",
        options: ["8 Major Spokes", "4 Major Spokes", "12 Major Spokes", "24 Major Spokes"],
        correct: 0,
        fact: "Each wheel has 8 major spokes dividing the day into 8 Prahars (3-hour intervals) with sub-spokes measuring minutes!",
        verifiedSource: "ASI Architectural Survey",
        sourceUrl: "https://asi.nic.in"
      },
      // Q5: Odia Heritage Task 2 (Natya Mandapa / Odissi)
      {
        question: "Which classical dance form's authentic poses and mudras are intricately carved across the Natya Mandapa?",
        localLanguageTerm: "ନାଟ୍ୟ ମଣ୍ଡପ (Natya Mandapa)",
        options: ["Odissi", "Bharatanatyam", "Kathak", "Kathakali"],
        correct: 0,
        fact: "The Natya Mandapa features 128 celestial dancers and musicians playing Mardala drums, forming the core of classical Odissi.",
        verifiedSource: "UNESCO World Heritage Ref #246",
        sourceUrl: "https://whc.unesco.org/en/list/246"
      },
      // Q6: Odia Heritage Task 3 (Gajasimha Sculpture)
      {
        question: "What philosophical meaning does the Gajasimha (Lion atop Elephant) sculpture at the entrance symbolize?",
        localLanguageTerm: "ଗଜସିଂହ (Gajasimha)",
        options: ["Power & Wisdom overcoming Pride/Ignorance", "Imperial Victory & Conquest", "Solar and Lunar Eclipse", "Harvest & Monsoon Blessings"],
        correct: 0,
        fact: "The Lion represents spiritual wisdom and strength subduing the Elephant of ego and ignorance.",
        verifiedSource: "UNESCO World Heritage Inventory #246",
        sourceUrl: "https://whc.unesco.org/en/list/246"
      }
    ],
    kaziranga: [
      {
        question: "Kaziranga National Park hosts two-thirds of the world's population of which animal?",
        options: ["Great One-Horned Rhinoceros", "Bengal Tiger", "Asian Elephant", "Snow Leopard"],
        correct: 0,
        fact: "Kaziranga is home to over 2,600 Great Indian One-Horned Rhinoceroses!"
      },
      {
        question: "In which Indian state is Kaziranga National Park located?",
        options: ["Assam", "West Bengal", "Meghalaya", "Arunachal Pradesh"],
        correct: 0,
        fact: "Kaziranga lies along the floodplains of the Brahmaputra River in Assam."
      },
      {
        question: "When was Kaziranga declared a UNESCO World Heritage Site?",
        options: ["1985", "1974", "2000", "1992"],
        correct: 0,
        fact: "Kaziranga was inscribed as a UNESCO World Heritage Site in 1985."
      }
    ]
  };

  const siteQuizList = siteQuizzes[site.id] || siteQuizzes.sun_temple;
  let currentQuizIndex = 0;
  let currentQuiz = siteQuizList[currentQuizIndex];

  // Arrange timeline milestones
  const siteArrangeData = {
    taj_mahal: [
      { id: '1', title: "Foundation & Wells", icon: "🧱" },
      { id: '2', title: "Main Mausoleum & Dome", icon: "🕌" },
      { id: '3', title: "Four Minarets & Gardens", icon: "🌳" },
      { id: '4', title: "UNESCO World Heritage", icon: "🏛️" }
    ],
    ajanta_ellora: [
      { id: '1', title: "Early Hinayana Caves", icon: "🪨" },
      { id: '2', title: "Mahayana Buddhist Murals", icon: "🎨" },
      { id: '3', title: "Kailasa Monolithic Temple", icon: "🏛️" },
      { id: '4', title: "UNESCO Inscription", icon: "📜" }
    ],
    sun_temple: [
      { id: '1', title: "Eastern Ganga Dynasty Rule", icon: "👑" },
      { id: '2', title: "24-Wheel Chariot Carving", icon: "☀️" },
      { id: '3', title: "European Mariners 'Black Pagoda'", icon: "⛵" },
      { id: '4', title: "Archaeological Restoration", icon: "⚒️" }
    ],
    kaziranga: [
      { id: '1', title: "Proposed Reserve Forest", icon: "🌿" },
      { id: '2', title: "Designated Game Sanctuary", icon: "🐾" },
      { id: '3', title: "Declared National Park", icon: "🦏" },
      { id: '4', title: "Tiger Reserve Status", icon: "🐅" }
    ]
  };

  // Curated Archaeological Knowledge Dossier (Unified Study Text)
    // ── DETAILED HERITAGE KNOWLEDGE ──
  // The information is maintained centrally in heritageSites.js
  // so all four heritage sites use the same structure.

  const siteKnowledgeData = {
    taj_mahal: {
      headline: 'The Monumental Mausoleum of the Mughal Era',
      period: '17th Century • Mughal Empire',
      summary: site.id === 'taj_mahal'
        ? site.overview
        : HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.overview || '',
      sections: [
        {
          heading: '📜 History',
          text: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.history || ''
        },
        {
          heading: '🏛️ Architecture',
          text: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.architecture || ''
        },
        {
          heading: '🎨 Decorative Art',
          text: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.decorativeArt || ''
        },
        {
          heading: '🌳 Garden & Symmetry',
          text: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.gardenAndSymmetry || ''
        },
        {
          heading: '🌍 Cultural Significance',
          text: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.culturalSignificance || ''
        },
        {
          heading: '🏆 UNESCO World Heritage',
          text: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.unescoSignificance || ''
        },
        {
          heading: '🛡️ Conservation',
          text: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.conservation || ''
        }
      ],
      timeline: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.timeline || [],
      keyFeatures: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.keyFeatures || [],
      didYouKnow: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.didYouKnow || [],
      sources: HERITAGE_SITES.find(s => s.id === 'taj_mahal')?.sources || []
    },

    ajanta_ellora: {
      headline: 'The Rock-Cut Heritage of Maharashtra',
      period: '2nd Century BCE – 10th Century CE',
      summary: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.overview || '',
      sections: [
        {
          heading: '📜 History',
          text: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.history || ''
        },
        {
          heading: '🏛️ Rock-Cut Architecture',
          text: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.architecture || ''
        },
        {
          heading: '🎨 Paintings & Sculpture',
          text: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.paintingsAndSculpture || ''
        },
        {
          heading: '⛰️ Kailasa Temple',
          text: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.kailasaTemple || ''
        },
        {
          heading: '🌍 Cultural Significance',
          text: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.culturalSignificance || ''
        },
        {
          heading: '🏆 UNESCO World Heritage',
          text: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.unescoSignificance || ''
        },
        {
          heading: '🛡️ Conservation',
          text: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.conservation || ''
        }
      ],
      timeline: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.timeline || [],
      keyFeatures: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.keyFeatures || [],
      didYouKnow: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.didYouKnow || [],
      sources: HERITAGE_SITES.find(s => s.id === 'ajanta_ellora')?.sources || []
    },

    sun_temple: {
      headline: 'The Colossal Solar Chariot of Kalinga',
      period: '13th Century • Eastern Ganga Dynasty',
      summary: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.overview || '',
      sections: [
        {
          heading: '📜 History',
          text: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.history || ''
        },
        {
          heading: '🏛️ Kalinga Architecture',
          text: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.architecture || ''
        },
        {
          heading: '☀️ Wheels & Solar Symbolism',
          text: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.wheelsAndSymbolism || ''
        },
        {
          heading: '🎨 Sculpture & Art',
          text: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.sculptureAndArt || ''
        },
        {
          heading: '🌍 Cultural Significance',
          text: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.culturalSignificance || ''
        },
        {
          heading: '🏆 UNESCO World Heritage',
          text: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.unescoSignificance || ''
        },
        {
          heading: '🛡️ Conservation',
          text: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.conservation || ''
        }
      ],
      timeline: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.timeline || [],
      keyFeatures: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.keyFeatures || [],
      didYouKnow: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.didYouKnow || [],
      sources: HERITAGE_SITES.find(s => s.id === 'sun_temple')?.sources || []
    },

    kaziranga: {
      headline: 'The Living Heritage of the Brahmaputra Floodplain',
      period: '20th Century to Present • Natural Heritage',
      summary: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.overview || '',
      sections: [
        {
          heading: '📜 Conservation History',
          text: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.history || ''
        },
        {
          heading: '🌿 Ecosystem',
          text: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.ecosystem || ''
        },
        {
          heading: '🦏 Wildlife',
          text: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.wildlife || ''
        },
        {
          heading: '🛡️ Conservation Challenges',
          text: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.conservationAndChallenges || ''
        },
        {
          heading: '🌍 Cultural & Natural Significance',
          text: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.culturalSignificance || ''
        },
        {
          heading: '🏆 UNESCO World Heritage',
          text: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.unescoSignificance || ''
        },
        {
          heading: '🌱 Long-Term Conservation',
          text: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.conservation || ''
        }
      ],
      timeline: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.timeline || [],
      keyFeatures: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.keyFeatures || [],
      didYouKnow: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.didYouKnow || [],
      sources: HERITAGE_SITES.find(s => s.id === 'kaziranga')?.sources || []
    }
  };

  // ── HISTORICAL CHRONICLES & LEGENDS DATASET ──
  const siteChroniclesData = {
    taj_mahal: {
      siteTitle: "Taj Mahal Chronicles",
      chapters: [
        {
          id: 'tm_ch1',
          title: "The Eternal Vow on the Yamuna",
          era: "1631 CE • Imperial Court of Agra",
          icon: "👑",
          quote: "“Let the earth weep tears of marble, that love may never be forgotten.”",
          story: "In the sweltering summer of 1631, deep in the Deccan camp of Burhanpur, Mumtaz Mahal whispered her final wishes to Emperor Shah Jahan. Shattered by grief, the Emperor secluded himself for eight days, emerging with silver hair and an unbreakable resolve. He commissioned the finest artisans across Persia, the Ottoman Empire, and the Indian subcontinent to construct a paradise garden mausoleum (*Rauza-i-Munawwara*) on the southern bend of the sacred Yamuna River.",
          highlights: [
            "Shah Jahan chose the site for its dramatic reflection across the river.",
            "Over 20,000 artisans laboured continuously under chief architect Ustad Ahmad Lahori."
          ],
          takeaway: "The Taj Mahal was envisioned not merely as a tomb, but as an architectural replica of the celestial gardens of Paradise (*Jannat*)."
        },
        {
          id: 'tm_ch2',
          title: "The Caravan of 1,000 Elephants & Pietra Dura",
          era: "1635–1648 CE • Rajasthan to Agra",
          icon: "🐘",
          quote: "“Stone carved so delicately it breathes with the twilight glow.”",
          story: "Flawless white translucent marble was quarried from Makrana in Rajasthan, transported across more than 300 kilometres by a legendary caravan of 1,000 royal elephants. Master inlayers (*parchin-kars*) sliced precious lapis lazuli from Badakhshan, turquoise from Tibet, carnelian from Arabia, and jade from China into microscopic floral petals, seamlessly cementing them into solid marble with no visible joints.",
          highlights: [
            "Translucent Makrana marble changes color with the sun: soft pink at dawn, brilliant white at noon, and golden bronze under the moon.",
            "Pietra dura florals contain up to 50 individual inlaid gems within a single single-inch flower."
          ],
          takeaway: "The pietra dura technique represents the pinnacle of Indo-Islamic gemstone lapidary craft."
        },
        {
          id: 'tm_ch3',
          title: "The Optical Mirage & The Outward Minarets",
          era: "1648 CE • Engineering Enigma",
          icon: "📐",
          quote: "“True perfection lies in the subtle mastery of sight and earth.”",
          story: "Chief architect Lahori employed astonishing optical and seismic engineering. The four 40-metre minarets surrounding the central dome were intentionally constructed with a slight outward inclination of two degrees. To an observer standing in the forecourt, the columns appear impeccably upright, but if struck by a major earthquake, they would tumble outward into the gardens rather than collapsing inward onto the sacred dome.",
          highlights: [
            "Bilateral symmetry is maintained across every millimeter, with the sole exception of Shah Jahan’s tomb placed beside Mumtaz Mahal.",
            "The Yamuna River was reinforced with deep brick-and-mortar wells acting as seismic shock absorbers."
          ],
          takeaway: "The Taj Mahal's foundation rests on a submerged timber-and-well grid kept strong by the river's moisture."
        }
      ]
    },
    ajanta_ellora: {
      siteTitle: "Ajanta & Ellora Chronicles",
      chapters: [
        {
          id: 'ae_ch1',
          title: "The Mountain Carved from the Sky: Kailasa",
          era: "8th Century CE • Rashtrakuta Empire",
          icon: "⛰️",
          quote: "“O how could I have made it? It must have descended from heaven itself!”",
          story: "In the 8th century, King Krishna I commissioned an excavation unprecedented in human history. Rather than quarrying stones and stacking them upward, hundreds of master sculptors climbed to the top of a volcanic basalt cliff in the Sahyadri mountains and chiseled downwards. Over 200,000 tons of live rock were painstakingly excavated from Cave 16 to reveal the magnificent multi-storey Kailasa Temple, complete with life-sized fighting elephants, soaring gopurams, and intricate Ramayana friezes.",
          highlights: [
            "Excavated entirely top-to-bottom with simple chisels, hammers, and wooden levers.",
            "World's largest monolithic rock-cut monument, twice the area of the Parthenon in Athens."
          ],
          takeaway: "Cave 16 at Ellora stands as humanity's most ambitious top-down monolithic rock excavation."
        },
        {
          id: 'ae_ch2',
          title: "The Mirror-Lit Hermits of the Waghora Gorge",
          era: "2nd Century BCE – 5th Century CE • Vakataka Dynasty",
          icon: "🎨",
          quote: "“In the dim silence of basalt caves, colors of compassion glow forever.”",
          story: "Deep inside the crescent-shaped ravine of the Waghora river, Buddhist monks lived in secluded viharas. In pitch-black chambers, they mounted large brass plates and polished bronze mirrors at cave entrances to reflect soft natural sunlight onto plastered rock walls. Using lapis lazuli from Afghanistan, terra verde, and ochre, they painted the famous Jataka murals depicting the past lives of Gautama Buddha, expressing divine compassion, courtly grace, and universal peace.",
          highlights: [
            "Paintings used natural mineral binders that have survived vibrant for over 1,500 years.",
            "The murals depict the celebrated Bodhisattva Padmapani and Bodhisattva Vajrapani."
          ],
          takeaway: "Ajanta's frescoes are the crowning achievement of ancient classical Asian painting."
        },
        {
          id: 'ae_ch3',
          title: "The Confluence of Three Sacred Paths",
          era: "6th–10th Century CE • Deccan Trade Crossroads",
          icon: "🕊️",
          quote: "“Three distinct faiths, one shared mountain of stone.”",
          story: "Along the ancient *Dakshinapatha* trade route connecting northern kingdoms with southern ports, Ellora became a world-renowned haven of religious harmony. Side by side along a single two-kilometer basalt escarpment, Buddhist monks carved 12 monastic viharas, Hindu devotees sculpted 17 monumental shrines to Shiva and Vishnu, and Digambara Jain ascetics excavated 5 serene cave temples (such as the Indra Sabha).",
          highlights: [
            "Merchants, pilgrims, and artisans of all 3 traditions shared water cisterns and halls.",
            "Shows centuries of peaceful cultural exchange, philosophical debates, and artistic competition."
          ],
          takeaway: "Ellora exemplifies the deep-rooted Indian tradition of religious coexistence and shared craftsmanship."
        }
      ]
    },
    sun_temple: {
      siteTitle: "Konark Sun Temple Chronicles",
      chapters: [
        {
          id: 'st_ch1',
          title: "The Boy Genius Dharmapada & The 1,200 Artisans",
          era: "1250 CE • Legend of Eastern Ganga Dynasty",
          icon: "👦",
          quote: "“One life given, that twelve hundred master sculptors may live.”",
          story: "King Narasimhadeva I decreed that the colossal Sun Temple must be completed within 12 years by 1,200 master craftsmen under Chief Architect Bisu Maharana. The grand structure stood finished, but the heavy magnetic crowning stone (*Dadhinauti*) could not be balanced atop the sanctum spire. Facing the king's execution deadline at dawn, Bisu Maharana’s 12-year-old son, Dharmapada, who had never visited the site before, arrived with deep mathematical knowledge of ancient Shilpa Shastras. He climbed the spire at midnight and perfectly locked the crowning stone in place! To protect his father and the 1,200 artisans from accusations of incompetence, Dharmapada heroically leaped from the temple spire into the churning waves of Chandrabhaga.",
          highlights: [
            "Dharmapada is revered across Odisha as an immortal symbol of filial love, brilliance, and sacrifice.",
            "The legend is commemorated in Odia folklore and classical theatrical literature."
          ],
          takeaway: "The Dharmapada saga immortalizes the extraordinary courage and architectural genius of medieval Odia builders."
        },
        {
          id: 'st_ch2',
          title: "The Floating Idol & The Myth of the Black Pagoda",
          era: "13th–17th Century CE • Maritime Chronicles",
          icon: "⚓",
          quote: "“The Black Pagoda that pulled iron needles from the mariners' compasses.”",
          story: "Ancient chronicles recount that the main sanctum incorporated a colossal 52-ton magnetic lodestone (*Kumbha Pathara*) at the peak and iron plates embedded within the masonry. This electromagnetic balance caused the central iron-core idol of the Sun God Surya to levitate suspended in mid-air in the temple sanctum! When Portuguese and European merchant vessels sailed across the Bay of Bengal, the magnetic spire allegedly pulled ship hulls and disrupted compass needles, prompting sailors to steer far away and nickname the dark khondalite spire the 'Black Pagoda'.",
          highlights: [
            "European mariners used Konark and the white spire of Jagannath Puri as prime maritime landmarks.",
            "Iron clamps and dowels were indeed used by Eastern Ganga engineers to join massive stones without mortar."
          ],
          takeaway: "The magnetic lodestone lore highlights the advanced metallurgical engineering of medieval Kalinga."
        },
        {
          id: 'st_ch3',
          title: "The Seven Galloping Steeds of Solar Dawn",
          era: "1250 CE • Solar Cosmological Lore",
          icon: "🐎",
          quote: "“Seven horses pulling the chariot of time across the boundless cosmic sky.”",
          story: "Conceived as the cosmic war chariot of Lord Surya, Konark faces directly towards the eastern Bay of Bengal where the first morning rays strike the sanctum doorway. The chariot is propelled by seven rearing stone horses: Gayatri, Brihati, Ushnik, Jagati, Trishtubha, Anushtubha, and Pankti—symbolizing the seven meters of Vedic rhythm, the seven colors of visible sunlight, and the seven days of the week.",
          highlights: [
            "The 24 wheels function as precision astronomical dials calculating local solar time down to minutes.",
            "At sunrise, the sun god’s idol in the sanctum was illuminated directly through the Natya Mandapa."
          ],
          takeaway: "Konark is a mathematical, astronomical, and philosophical monument to time and cosmic order."
        }
      ]
    },
    kaziranga: {
      siteTitle: "Kaziranga Chronicles",
      chapters: [
        {
          id: 'kz_ch1',
          title: "The Folk Legend of Kazi and Ranga",
          era: "Ancient Assamese Lore • Karbi Hills",
          icon: "🌿",
          quote: "“Where true love dissolved into emerald marshes and sacred elephant grass.”",
          story: "According to Karbi folklore, in the fertile valleys beside the Brahmaputra, a young girl named Ranga from a nearby village fell deeply in love with a Karbi youth named Kazi. When their families opposed their union, the lovers retreated together into the dense wild wilderness of tall elephant grass and wetlands. They were never seen again, but the villagers blessed the lush paradise, uniting their names forever as 'Kaziranga'—the sanctuary of eternal harmony between nature and spirit.",
          highlights: [
            "The Karbi and Mishing indigenous tribes have preserved the oral folklore for generations.",
            "Celebrates the timeless bond between indigenous communities and the wild landscape."
          ],
          takeaway: "Kaziranga's name honors an ancient folk tale of love and communion with the wilderness."
        },
        {
          id: 'kz_ch2',
          title: "Lady Curzon & The Quest for the One-Horned Giant",
          era: "1904–1908 CE • Birth of Wildlife Conservation",
          icon: "🦏",
          quote: "“Not a single rhino remained in sight—until a decree saved them from extinction.”",
          story: "In 1904, Mary Curzon, wife of the Viceroy of India Lord Curzon, journeyed into the Assam floodplains specifically to witness the legendary Great Indian One-Horned Rhinoceros. After days of trekking through marshes, she could not spot a single animal—poaching had reduced the entire population to fewer than twenty survivors! Deeply moved, she urged her husband to act immediately. In 1905, the British administration declared Kaziranga a Proposed Reserve Forest, initiating one of the greatest wildlife recovery stories on planet Earth.",
          highlights: [
            "From fewer than 20 rhinos in 1905, the population has rebounded to over 2,600 rhinos today.",
            "Represented the earliest institutional conservation reserve established in Northeast India."
          ],
          takeaway: "Kaziranga's protection in 1905 transformed it into the world's greatest rhinoceros sanctuary."
        },
        {
          id: 'kz_ch3',
          title: "The Great Monsoon Migration & The Ranger Sentinels",
          era: "Present Day • Living Natural Sagas",
          icon: "🌊",
          quote: "“When the Brahmaputra rises, courage and wild instinct unite on the highlands.”",
          story: "Every monsoon season, the mighty Brahmaputra river overflows, inundating nearly 80% of Kaziranga's lowlands. In a dramatic annual survival migration, herds of elephants, rhinos, swamp deer, and tigers swim across flooded channels and cross the national highway to reach the safety of the elevated Karbi Anglong hills. Day and night, heroic forest guards patrol in boats through perilous currents and confront poachers to safeguard the fleeing animals.",
          highlights: [
            "Floods deposit rich alluvial silt that regenerates the lush elephant grass and wetland ecosystem.",
            "Artificial highland mounds (*chapories*) have been built to give animals refuge during peak floods."
          ],
          takeaway: "The seasonal flood cycle is the lifeblood of Kaziranga, rejuvenating its vibrant biodiversity."
        }
      ]
    }
  };

  const currentKnowledge =
    siteKnowledgeData[site.id] || siteKnowledgeData.sun_temple;

  const arrangeItems = siteArrangeData[site.id] || siteArrangeData.sun_temple;
  const knowledgeData = siteKnowledgeData[site.id] || siteKnowledgeData.sun_temple;
  const chroniclesData = siteChroniclesData[site.id] || siteChroniclesData.sun_temple;

  root.innerHTML = `
    <!-- Animated dark backdrop with particles -->
    <div class="gms-bg" aria-hidden="true"></div>
    <div class="gms-bg-glow" aria-hidden="true"></div>
    <div class="gms-particles" aria-hidden="true">
      ${Array.from({length:14},(_,i)=>`<span class="gp gp${i+1}"></span>`).join('')}
    </div>

    <!-- VIEW 1: MODE SELECTION (Virtual vs Physical) -->
    <div class="gms-view-container" id="view-mode-selection">
      <!-- Back Button -->
      <button class="gms-back-btn" id="gms-back-to-map" type="button" aria-label="Back to map">
        <span class="gms-back-ico" aria-hidden="true">${SVG_ICONS.back}</span>
        <span>Back to Map</span>
      </button>

      <!-- Site Identity Header -->
      <div class="gms-site-header">
        <div class="gms-site-icon-wrap">
          <span class="gms-site-icon">${site.icon}</span>
          <div class="gms-site-icon-ring" aria-hidden="true"></div>
        </div>
        <div class="gms-site-meta">
          <h1 class="gms-site-name">${site.name}</h1>
          <p class="gms-site-loc">📍 ${site.location}</p>
          <span class="gms-site-type-pill">${site.type}</span>
        </div>
      </div>

      <!-- Divider Question -->
      <div class="gms-question-wrap">
        <div class="gms-divider-line" aria-hidden="true"></div>
        <h2 class="gms-question">Choose Exploration Mode</h2>
        <div class="gms-divider-line" aria-hidden="true"></div>
      </div>

      <!-- Mode Cards -->
      <div class="gms-modes">

        <!-- VIRTUAL MODE CARD -->
        <button class="gms-mode-card gms-virtual" id="gms-btn-virtual-mode" type="button" aria-label="Choose Virtual Mode">
          <div class="gms-mode-bg-virtual" aria-hidden="true"></div>
          <div class="gms-mode-shimmer" aria-hidden="true"></div>

          <div class="gms-mode-icon-wrap">
            <span class="gms-mode-emoji" aria-hidden="true">🌐</span>
            <div class="gms-mode-icon-glow gms-virtual-glow" aria-hidden="true"></div>
          </div>

          <div class="gms-mode-content">
            <div class="gms-badge-row">
              <span class="gms-mode-badge gms-badge-virtual">VIRTUAL REALM</span>
              <span class="gms-pill-options-count">5 Options</span>
            </div>
            <h3 class="gms-mode-title">Virtual Mode</h3>
            <p class="gms-mode-desc">Explore 3D models, virtual tours, study dossiers, quizzes, and artifact puzzles from anywhere.</p>
            <ul class="gms-mode-features">
              <li><span aria-hidden="true">🧊</span> View 3D &nbsp;•&nbsp; 🏛️ Virtual Tour</li>
              <li><span aria-hidden="true">📚</span> Knowledge &nbsp;•&nbsp; ❓ Quiz &nbsp;•&nbsp; 🧩 Arrange</li>
            </ul>
          </div>

          <div class="gms-mode-xp-tag">
            <span>⭐ +${site.xpReward} XP</span>
          </div>

          <div class="gms-mode-arrow" aria-hidden="true">›</div>
        </button>

        <!-- PHYSICAL MODE CARD -->
        <button class="gms-mode-card gms-physical" id="gms-btn-physical-mode" type="button" aria-label="Choose Physical Mode">
          <div class="gms-mode-bg-physical" aria-hidden="true"></div>
          <div class="gms-mode-shimmer" aria-hidden="true"></div>

          <div class="gms-mode-icon-wrap">
            <span class="gms-mode-emoji" aria-hidden="true">📍</span>
            <div class="gms-mode-icon-glow gms-physical-glow" aria-hidden="true"></div>
          </div>

          <div class="gms-mode-content">
            <span class="gms-mode-badge gms-badge-physical">PHYSICAL GPS</span>
            <h3 class="gms-mode-title">Physical Mode</h3>
            <p class="gms-mode-desc">Visit the actual site in the real world and unlock on-site geolocation AR treasures.</p>
            <ul class="gms-mode-features">
              <li><span aria-hidden="true">🗺️</span> Real-world GPS navigation</li>
              <li><span aria-hidden="true">🏅</span> 1.5x Bonus XP rewards</li>
            </ul>
          </div>

          <div class="gms-mode-xp-tag gms-physical-xp">
            <span>⭐ +${Math.round(site.xpReward * 1.5)} XP</span>
          </div>

          <div class="gms-mode-arrow" aria-hidden="true">›</div>
        </button>

      </div>

      <!-- Difficulty & Era Footer -->
      <div class="gms-footer-info">
        <div class="gms-info-chip">
          <span>⚔️</span>
          <span>${site.difficulty}</span>
        </div>
        <div class="gms-info-chip">
          <span>🏛️</span>
          <span>${site.era}</span>
        </div>
      </div>
    </div>

    <!-- VIEW 2: VIRTUAL MODE 5 OPTIONS (View 3D, Knowledge, Chronicles, Quiz, Arrange) -->
    <div class="gms-view-container gms-view-hidden" id="view-virtual-hub">
      <!-- Back Button to Modes -->
      <button class="gms-back-btn" id="gms-back-to-modes" type="button" aria-label="Back to Mode Selection">
        <span class="gms-back-ico" aria-hidden="true">${SVG_ICONS.back}</span>
        <span>Back to Modes</span>
      </button>

      <!-- Virtual Hub Header -->
      <div class="gms-virtual-header">
        <div class="gms-vh-meta">
          <div class="gms-vh-badge">🌐 VIRTUAL EXPLORATION</div>
          <h2 class="gms-vh-title">${site.name}</h2>
          <p class="gms-vh-sub">Choose an activity to begin your virtual expedition:</p>
        </div>
        <div class="gms-vh-icon">${site.icon}</div>
      </div>

      <!-- 5 OPTIONS GRID -->
      <div class="gms-voptions-grid">

        <!-- 1. VIEW 3D -->
        <button class="gms-vopt-card gms-vopt-3d" id="btn-opt-3d" type="button">
          <div class="vopt-glow" aria-hidden="true"></div>
          <div class="vopt-top">
            <div class="vopt-ico-box">🧊</div>
            <span class="vopt-pill">3D REALM</span>
          </div>
          <div class="vopt-main">
            <h3 class="vopt-title">View 3D</h3>
            <p class="vopt-desc">Interactive 360° monument exploration and architectural inspection.</p>
          </div>
          <div class="vopt-foot">
            <span class="vopt-xp">⭐ +150 XP</span>
            <span class="vopt-action-arrow">Explore ›</span>
          </div>
        </button>

        <!-- 2. KNOWLEDGE (CURATED STUDY DOSSIER) -->
        <button class="gms-vopt-card gms-vopt-knowledge" id="btn-opt-knowledge" type="button">
          <div class="vopt-glow" aria-hidden="true"></div>
          <div class="vopt-top">
            <div class="vopt-ico-box">📚</div>
            <span class="vopt-pill vopt-pill-gold">STUDY LORE</span>
          </div>
          <div class="vopt-main">
            <h3 class="vopt-title">Knowledge</h3>
            <p class="vopt-desc">Read architectural secrets & clues to master the Quiz and Timeline puzzles.</p>
          </div>
          <div class="vopt-foot">
            <span class="vopt-xp">⭐ +200 XP</span>
            <span class="vopt-action-arrow">Study ›</span>
          </div>
        </button>

        <!-- 3. VIRTUAL TOUR -->
        <button class="gms-vopt-card gms-vopt-chronicles" id="btn-opt-chronicles" type="button">
          <div class="vopt-glow" aria-hidden="true"></div>
          <div class="vopt-top">
            <div class="vopt-ico-box">🏛️</div>
            <span class="vopt-pill vopt-pill-purple">VIRTUAL TOUR</span>
          </div>
          <div class="vopt-main">
            <h3 class="vopt-title">Virtual Tour</h3>
            <p class="vopt-desc">Immerse in monument expeditions, cinematic archives, and narrated historical lore.</p>
          </div>
          <div class="vopt-foot">
            <span class="vopt-xp">⭐ +250 XP</span>
            <span class="vopt-action-arrow">Tour ›</span>
          </div>
        </button>

        <!-- 4. QUIZ (6 SERIAL QUESTIONS) -->
        <button class="gms-vopt-card gms-vopt-quiz" id="btn-opt-quiz" type="button">
          <div class="vopt-glow" aria-hidden="true"></div>
          <div class="vopt-top">
            <div class="vopt-ico-box">❓</div>
            <span class="vopt-pill vopt-pill-amber">6 QUESTIONS</span>
          </div>
          <div class="vopt-main">
            <h3 class="vopt-title">Quiz</h3>
            <p class="vopt-desc">Test your historical knowledge, construction secrets, and Odia terms.</p>
          </div>
          <div class="vopt-foot">
            <span class="vopt-xp">⭐ +300 XP</span>
            <span class="vopt-action-arrow">Play ›</span>
          </div>
        </button>

        <!-- 5. ARRANGE -->
        <button class="gms-vopt-card gms-vopt-arrange" id="btn-opt-arrange" type="button">
          <div class="vopt-glow" aria-hidden="true"></div>
          <div class="vopt-top">
            <div class="vopt-ico-box">🧩</div>
            <span class="vopt-pill vopt-pill-emerald">PUZZLE</span>
          </div>
          <div class="vopt-main">
            <h3 class="vopt-title">Arrange</h3>
            <p class="vopt-desc">Reconstruct historical timeline relics & architectural layers in order.</p>
          </div>
          <div class="vopt-foot">
            <span class="vopt-xp">⭐ +250 XP</span>
            <span class="vopt-action-arrow">Solve ›</span>
          </div>
        </button>

      </div>

      <!-- Floating AI Button on Virtual Hub -->
      <button type="button" class="gms-ai-fab" id="btn-ai-hub" aria-label="Ask AI">
        <span class="gms-ai-fab-icon">🤖</span>
        <span class="gms-ai-fab-label">AI</span>
      </button>
    </div>

    <!-- VIEW 3: PHYSICAL MODE 3 OPTIONS (Camera Lens, Quiz, Arrange) -->
    <div class="gms-view-container gms-view-hidden" id="view-physical-hub">
      <!-- Back Button to Modes -->
      <button class="gms-back-btn" id="gms-back-to-modes-phys" type="button" aria-label="Back to Mode Selection">
        <span class="gms-back-ico" aria-hidden="true">${SVG_ICONS.back}</span>
        <span>Back to Modes</span>
      </button>

      <!-- Physical Hub Header -->
      <div class="gms-virtual-header" style="background:linear-gradient(135deg, rgba(34,197,94,0.18), rgba(14,11,8,0.92)); border-color:rgba(34,197,94,0.45);">
        <div class="gms-vh-meta">
          <div class="gms-vh-badge" style="background:#22c55e; color:#000;">📍 ON-SITE EXPEDITION</div>
          <h2 class="gms-vh-title">${site.name}</h2>
          <p class="gms-vh-sub">GPS Verified! Complete 3 on-site field challenges:</p>
        </div>
        <div class="gms-vh-icon">🏛️</div>
      </div>

      <!-- 3 PHYSICAL OPTIONS GRID -->
      <div class="gms-voptions-grid">

        <!-- 1. AI CAMERA VERIFY -->
        <button class="gms-vopt-card gms-vopt-camera" id="btn-opt-phys-camera" type="button" style="border-color:rgba(34,197,94,0.55); box-shadow:0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(34,197,94,0.2);">
          <div class="vopt-glow" style="background:rgba(34,197,94,0.15);" aria-hidden="true"></div>
          <div class="vopt-top">
            <div class="vopt-ico-box" style="background:rgba(34,197,94,0.25); border-color:rgba(34,197,94,0.5);">📸</div>
            <span class="vopt-pill" style="background:#22c55e; color:#000; font-weight:800;">AI VISION VERIFY</span>
          </div>
          <div class="vopt-main">
            <h3 class="vopt-title">AI Heritage Lens</h3>
            <p class="vopt-desc">Capture a live photo of the monument. AI Vision will verify authentic architectural features.</p>
          </div>
          <div class="vopt-foot">
            <span class="vopt-xp" style="color:#4ade80;">⭐ +500 XP</span>
            <span class="vopt-action-arrow">Scan ›</span>
          </div>
        </button>

        <!-- 2. FIELD QUIZ -->
        <button class="gms-vopt-card gms-vopt-quiz" id="btn-opt-phys-quiz" type="button">
          <div class="vopt-glow" aria-hidden="true"></div>
          <div class="vopt-top">
            <div class="vopt-ico-box">❓</div>
            <span class="vopt-pill vopt-pill-amber">ON-SITE QUIZ</span>
          </div>
          <div class="vopt-main">
            <h3 class="vopt-title">Field Quiz</h3>
            <p class="vopt-desc">Test your archaeological knowledge directly standing in the field.</p>
          </div>
          <div class="vopt-foot">
            <span class="vopt-xp">⭐ +300 XP</span>
            <span class="vopt-action-arrow">Play ›</span>
          </div>
        </button>

        <!-- 3. RELIC ARRANGE -->
        <button class="gms-vopt-card gms-vopt-arrange" id="btn-opt-phys-arrange" type="button">
          <div class="vopt-glow" aria-hidden="true"></div>
          <div class="vopt-top">
            <div class="vopt-ico-box">🧩</div>
            <span class="vopt-pill vopt-pill-emerald">ON-SITE PUZZLE</span>
          </div>
          <div class="vopt-main">
            <h3 class="vopt-title">Relic Reconstruction</h3>
            <p class="vopt-desc">Reconstruct historical timeline relics & architectural layers in order.</p>
          </div>
          <div class="vopt-foot">
            <span class="vopt-xp">⭐ +250 XP</span>
            <span class="vopt-action-arrow">Solve ›</span>
          </div>
        </button>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════
         MODALS FOR THE 4 OPTIONS
    ═══════════════════════════════════════════════════ -->

    <!-- MODAL 1: VIEW 3D -->
    <div class="vmodal-backdrop" id="modal-opt-3d" aria-hidden="true">
      <div class="vmodal-sheet">
        <div class="vmodal-handle"></div>
        <div class="vmodal-header">
          <div class="vmodal-htitle-wrap">
            <span style="font-size:22px;">🧊</span>
            <div>
              <h3 class="vmodal-title">${site.name} — 3D Viewer</h3>
              <p class="vmodal-sub">Drag to rotate 360° • Inspect architecture</p>
            </div>
          </div>
          <button type="button" class="vmodal-close-btn" data-close="modal-opt-3d">✕</button>
        </div>

        <!-- 3D Viewer Stage: explicit height so model-viewer canvas is never 0px -->
        <div id="vmodal-3d-stage-container"
             style="position:relative; width:100%; height:320px; min-height:320px;
                    border-radius:12px; overflow:hidden;
                    background:radial-gradient(circle at 50% 50%, #1c1813 0%, #0a0806 100%);
                    border:1px solid rgba(212,175,55,.35); margin-bottom:10px; cursor: pointer;">

          ${(site.id === 'konark' || site.id === 'sun_temple' || site.id === 'taj_mahal') ? `
            <model-viewer
  id="heritage-3d-model"
  src="${site.id === 'taj_mahal'
    ? '/src/assets/models/taj_mahal.glb'
    : '/src/assets/models/konark_sun_temple.glb'}"
  alt="${site.id === 'taj_mahal' ? 'Taj Mahal 3D Model' : 'Konark Sun Temple 3D Model'}"
  camera-controls
  auto-rotate
  auto-rotate-delay="1000"
  rotation-per-second="15deg"
  shadow-intensity="1"
  exposure="1"
  camera-orbit="0deg 70deg 105%"
  style="width:100%; height:320px; display:block; --poster-color:transparent;"
>
              <!-- Loading poster slot -->
              <div slot="poster"
                   style="display:flex; flex-direction:column; align-items:center; justify-content:center;
                          width:100%; height:100%; color:#ffd700; gap:12px; background:transparent;">
                <span style="font-size:44px; animation:iconBob 2s ease-in-out infinite;">🏛️</span>
                <span id="heritage-3d-loading-text"
                      style="font-size:12px; font-weight:bold; letter-spacing:0.5px;">
                  Loading 3D ${site.name}…
                </span>
                <div style="width:150px; height:4px; background:rgba(255,255,255,0.12);
                            border-radius:2px; overflow:hidden;">
                  <div id="heritage-3d-progress-bar"
                       style="width:0%; height:100%;
                              background:linear-gradient(90deg,#d4af37,#f59e0b);
                              transition:width 0.3s ease;">
                  </div>
                </div>
              </div>
            </model-viewer>
          ` : `
            <!-- Fallback animated icon for other sites -->
            <div class="vmodal-3d-pedestal">
              <div class="vmodal-3d-monument-icon">${site.icon}</div>
              <div class="vmodal-3d-rune-ring"></div>
              <div class="vmodal-3d-base"></div>
            </div>
          `}

          <!-- Controls hint overlay -->
          <div class="vmodal-3d-controls-hint">
            <span>🔄 Drag to Orbit • Tap to Open Temple</span>
          </div>
        </div>

        <div class="vmodal-3d-specs">
          <div class="vspec-chip">
            <span class="vspec-lbl">Architectural Era</span>
            <span class="vspec-val">${site.era}</span>
          </div>
          <div class="vspec-chip">
            <span class="vspec-lbl">Heritage Type</span>
            <span class="vspec-val">${site.type}</span>
          </div>
        </div>

        <button type="button" class="btn btn-gold" id="btn-complete-3d" style="height:46px; margin-top:10px; width:100%; border-radius:10px; background:linear-gradient(135deg,#d4af37,#f59e0b); font-weight:bold; cursor:pointer; color:#000;">
          CLAIM 150 XP & FINISH TOUR
        </button>
      </div>
    </div>

    <!-- MODAL 2: ARCHAEOLOGICAL KNOWLEDGE DOSSIER -->
    <div class="vmodal-backdrop" id="modal-opt-knowledge" aria-hidden="true">
      <div class="vmodal-sheet" style="max-height: 88vh; overflow-y: auto; padding-bottom: 20px;">
        <div class="vmodal-handle"></div>
        <div class="vmodal-header">
          <div class="vmodal-htitle-wrap">
            <span style="font-size:22px;">📚</span>
            <div>
              <h3 class="vmodal-title">${site.name}</h3>
              <p class="vmodal-sub">${knowledgeData.period}</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button type="button" class="vmodal-ai-btn" data-context="mission" aria-label="Ask AI">🤖 AI</button>
            <button type="button" class="vmodal-close-btn" data-close="modal-opt-knowledge">✕</button>
          </div>
        </div>

        <div class="knowledge-unified-container" style="display:flex; flex-direction:column; gap:12px; padding:4px 0;">
          <!-- Article Header & Summary -->
          <div style="background:linear-gradient(135deg, rgba(212,175,55,0.12), rgba(0,0,0,0.5)); border:1px solid rgba(212,175,55,0.35); border-radius:12px; padding:12px 14px;">
            <div style="color:#ffd700; font-size:14px; font-weight:800; font-family:serif; margin-bottom:4px;">
              ${knowledgeData.headline}
            </div>
            <p style="color:#e2d5b0; font-size:12px; line-height:1.45; margin:0; font-style:italic;">
              ${knowledgeData.summary}
            </p>
          </div>

          <!-- Comprehensive Sections -->
          ${knowledgeData.sections.map(sec => `
            <div style="background:rgba(255,255,255,0.03); border-left:3px solid #d4af37; border-radius:0 10px 10px 0; padding:10px 12px;">
              <h4 style="color:#ffd700; margin:0 0 4px 0; font-size:12.5px; font-weight:700;">${sec.heading}</h4>
              <p style="color:#d1d5db; font-size:11.8px; line-height:1.5; margin:0;">
                ${sec.text}
              </p>
            </div>
          `).join('')}
                  <div style="margin-top:18px;">
          <h4 style="margin:0 0 10px;">⭐ Key Features</h4>

          <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
            gap:8px;
          ">
            ${knowledgeData.keyFeatures.map(feature => `
              <div style="
                padding:10px;
                border:1px solid rgba(255,255,255,.12);
                border-radius:10px;
                background:rgba(255,255,255,.04);
                font-size:12px;
              ">
                ◆ ${feature}
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-top:20px;">
          <h4 style="margin:0 0 10px;">🕰 Historical Timeline</h4>

          <div>
            ${knowledgeData.timeline.map(item => `
              <div style="
                display:flex;
                gap:12px;
                padding:9px 0;
                border-bottom:1px solid rgba(255,255,255,.08);
              ">
                <strong style="min-width:90px;">
                  ${item.year}
                </strong>

                <span style="opacity:.88;">
                  ${item.event}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-top:20px;">
          <h4 style="margin:0 0 10px;">💡 Did You Know?</h4>

          <div>
            ${knowledgeData.didYouKnow.map((fact, index) => `
              <div style="
                padding:9px 0;
                font-size:12px;
                border-bottom:1px solid rgba(255,255,255,.07);
              ">
                <strong>${String(index + 1).padStart(2, '0')}</strong>
                &nbsp; ${fact}
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-top:20px;">
          <h4 style="margin:0 0 10px;">📚 Sources & References</h4>

          ${knowledgeData.sources.map(source => `
            <div style="
              padding:6px 0;
              font-size:11px;
              opacity:.8;
            ">
              • ${source}
            </div>
          `).join('')}
        </div>
        </div>

        <button type="button" class="btn btn-gold" id="btn-complete-knowledge" style="height:46px; margin-top:12px; width:100%; border-radius:10px; background:linear-gradient(135deg,#d4af37,#f59e0b); font-weight:bold; cursor:pointer; color:#000; font-size:13px; letter-spacing:0.5px;">
          COMPLETE STUDY & CLAIM 200 XP
        </button>
      </div>
    </div>

    <!-- MODAL 3: 6-PART SERIAL QUIZ -->
    <div class="vmodal-backdrop" id="modal-opt-quiz" aria-hidden="true">
      <div class="vmodal-sheet">
        <div class="vmodal-handle"></div>
        <div class="vmodal-header">
          <div class="vmodal-htitle-wrap">
            <span style="font-size:22px;">❓</span>
            <div>
              <h3 class="vmodal-title">${site.name} — Heritage Quiz</h3>
              <p class="vmodal-sub">6 Serial Questions • Earn 50 XP per question</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button type="button" class="vmodal-ai-btn" data-context="quiz" aria-label="Ask AI">🤖 AI</button>
            <button type="button" class="vmodal-close-btn" data-close="modal-opt-quiz">✕</button>
          </div>
        </div>

        <div class="quiz-container">
          <div class="quiz-question-box">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span class="quiz-badge" id="quiz-counter">QUESTION 1 OF ${siteQuizList.length}</span>
              <span id="quiz-score-badge" style="font-size:10px; color:#ffd700; font-weight:bold;">XP: 0</span>
            </div>
            <div id="quiz-odia-wrap" style="display:none; margin: 4px 0 8px 0; background:rgba(255,152,0,0.12); border-left:3px solid #ff9800; padding:4px 8px; border-radius:0 6px 6px 0;">
              <span style="color:#ffb74d; font-size:11px; font-weight:bold;">🏛️ Local Heritage Term:</span>
              <span id="quiz-odia-text" style="color:#fff; font-size:12px; font-weight:bold; margin-left:4px;"></span>
            </div>
            <p class="quiz-qtext" id="quiz-qtext">${currentQuiz.question}</p>
          </div>

          <div class="quiz-options-list" id="quiz-options-wrap">
            ${currentQuiz.options.map((opt, idx) => `
              <button type="button" class="quiz-opt-btn" data-idx="${idx}">
                <span class="qopt-letter">${String.fromCharCode(65 + idx)}</span>
                <span class="qopt-text">${opt}</span>
              </button>
            `).join('')}
          </div>

          <div class="quiz-feedback-box" id="quiz-feedback" style="display:none;"></div>

          <button type="button" class="btn btn-gold" id="quiz-next-btn" style="height:42px; margin-top:10px; display:none; width:100%; border-radius:10px; background:linear-gradient(135deg,#d4af37,#f59e0b); font-weight:bold; cursor:pointer; color:#000;">
            <span id="quiz-next-label">NEXT QUESTION →</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 4: ARRANGE -->
    <div class="vmodal-backdrop" id="modal-opt-arrange" aria-hidden="true">
      <div class="vmodal-sheet">
        <div class="vmodal-handle"></div>
        <div class="vmodal-header">
          <div class="vmodal-htitle-wrap">
            <span style="font-size:22px;">🧩</span>
            <div>
              <h3 class="vmodal-title">${site.name} — Arrange Timeline</h3>
              <p class="vmodal-sub">Tap tiles to sort milestones from earliest to latest</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button type="button" class="vmodal-ai-btn" data-context="arrange" aria-label="Ask AI">🤖 AI</button>
            <button type="button" class="vmodal-close-btn" data-close="modal-opt-arrange">✕</button>
          </div>
        </div>

        <div class="arrange-container">
          <p class="arrange-hint">Tap any two tiles to swap their positions into correct chronological sequence:</p>
          
          <div class="arrange-list" id="arrange-list">
            ${arrangeItems.map((item, idx) => `
              <div class="arrange-item" data-id="${item.id}" data-idx="${idx}">
                <span class="arrange-item-icon">${item.icon}</span>
                <div class="arrange-item-meta">
                  <span class="arrange-item-title">${item.title}</span>
                </div>
                <span class="arrange-swap-handle">⇅ Swap</span>
              </div>
            `).join('')}
          </div>

          <button type="button" class="btn btn-gold" id="btn-verify-arrange" style="height:46px; margin-top:12px; width:100%; border-radius:10px; background:linear-gradient(135deg,#d4af37,#f59e0b); font-weight:bold; cursor:pointer; color:#000;">
            VERIFY ARRANGEMENT (+250 XP)
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 5: VIRTUAL TOUR -->
    <div class="vmodal-backdrop" id="modal-opt-chronicles" aria-hidden="true">
      <div class="vmodal-sheet" style="max-height: 88vh; overflow-y: auto; padding-bottom: 20px;">
        <div class="vmodal-handle"></div>
        <div class="vmodal-header">
          <div class="vmodal-htitle-wrap">
            <span style="font-size:22px;">🏛️</span>
            <div>
              <h3 class="vmodal-title">${site.name} — Virtual Tour</h3>
              <p class="vmodal-sub">${(site.id === 'sun_temple' || site.id === 'konark') ? 'Cinematic Monument Tour & Archives' : 'Audio-Guided Monument Expedition & Historical Lore'}</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${(site.id !== 'sun_temple' && site.id !== 'konark') ? `
              <button type="button" class="vmodal-ai-btn" data-context="chronicles" aria-label="Ask AI">🤖 AI</button>
            ` : ''}
            <button type="button" class="vmodal-close-btn" data-close="modal-opt-chronicles">✕</button>
          </div>
        </div>

        ${(site.id === 'sun_temple' || site.id === 'konark') ? `
          <!-- Konark Sun Temple Step 1: Video View -->
          <div id="konark-chronicles-video-view">
            <div class="konark-video-container" style="position:relative; width:100%; border-radius:14px; overflow:hidden; background:#000; border:1.5px solid rgba(212,175,55,0.4); box-shadow:0 6px 24px rgba(0,0,0,0.85); margin-bottom:12px;">
              <video 
                id="konark-chronicles-video" 
                controls 
                playsinline
                preload="metadata"
                style="width:100%; display:block; max-height:360px; object-fit:contain; background:#000;"
                src="/src/assets/konark_chronicles.mp4"
              >
                <source src="/src/assets/konark_chronicles.mp4" type="video/mp4">
                <source src="/src/assets/WhatsApp%20Video%202026-09-02%20at%2000.40.56.mp4" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>

            <!-- NEXT BUTTON (Replaces Claim button on video screen) -->
            <button type="button" class="btn btn-gold" id="btn-konark-chronicles-next" style="height:46px; margin-top:6px; width:100%; border-radius:10px; background:linear-gradient(135deg,#d4af37,#f59e0b); font-weight:bold; cursor:pointer; color:#000; font-size:13px; letter-spacing:0.5px; border:none; box-shadow:0 4px 16px rgba(212,175,55,0.35); display:flex; align-items:center; justify-content:center; gap:8px;">
              <span>NEXT</span>
              <span>➔</span>
            </button>
          </div>

          <!-- Konark Sun Temple Step 2: Pictures Gallery View -->
          <div id="konark-chronicles-gallery-view" style="display:none; flex-direction:column; gap:10px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2px;">
              <span class="chronicle-header-badge">VISUAL ARCHIVES &bull; KONARK</span>
              <button type="button" id="btn-konark-chronicles-back" style="background:rgba(255,255,255,0.08); border:1px solid rgba(212,175,55,0.3); color:#fae4a8; border-radius:6px; padding:4px 10px; font-size:10.5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                ⟵ Back to Video
              </button>
            </div>

            <div style="font-size:9.5px; color:#d4af37; display:flex; align-items:center; justify-content:space-between; padding:0 2px;">
              <span>📜 <em>5 Full Historical Archive Photographs</em></span>
              <span style="color:#94a3b8; font-size:9px;">↕ Scroll to view all</span>
            </div>

            <!-- Dynamic Full Pictures Scroll Container -->
            <div id="konark-chronicles-pics-container" class="konark-pics-scroll-box" style="display:flex; flex-direction:column; gap:14px; max-height:56vh; overflow-y:auto; overflow-x:hidden; scroll-behavior:smooth; padding-right:4px; padding-bottom:6px;"></div>

            <!-- Claim Virtual Tour XP Button at the end of gallery -->
            <button type="button" class="btn btn-gold" id="btn-complete-chronicles" style="height:46px; margin-top:4px; width:100%; border-radius:10px; background:linear-gradient(135deg,#d4af37,#f59e0b); font-weight:bold; cursor:pointer; color:#000; font-size:13px; letter-spacing:0.5px; border:none; box-shadow:0 4px 16px rgba(212,175,55,0.35);">
              CLAIM 250 XP & FINISH VIRTUAL TOUR
            </button>
          </div>
        ` : `
          <!-- Clean Virtual Tour for other sites -->
          <div style="display:flex; flex-direction:column; gap:14px; padding:24px 12px; text-align:center;">
            <div style="font-size:44px; margin-bottom:4px;">🏛️</div>
            <h3 style="color:#ffd700; font-family:var(--font-serif); font-size:16px; margin:0 0 6px 0;">Virtual Tour — ${site.name}</h3>
            <p style="color:#94a3b8; font-size:11.5px; line-height:1.5; margin:0 0 10px 0;">
              Visual exploration and media tour for ${site.name}.
            </p>
            <div style="background:rgba(212,175,55,0.08); border:1px dashed rgba(212,175,55,0.3); border-radius:10px; padding:18px 12px; font-size:11px; color:#cbd5e1;">
              🎬 Virtual tour and visual archive for ${site.name}.
            </div>
            <button type="button" class="btn btn-gold" id="btn-complete-chronicles" style="height:46px; margin-top:10px; width:100%; border-radius:10px; background:linear-gradient(135deg,#d4af37,#f59e0b); font-weight:bold; cursor:pointer; color:#000; font-size:13px; letter-spacing:0.5px; border:none; box-shadow:0 4px 16px rgba(212,175,55,0.35);">
              CLAIM 250 XP & FINISH VIRTUAL TOUR
            </button>
          </div>
        `}
      </div>
    </div>

    <!-- SHARED AI DRAWER MODAL -->
    <div class="vmodal-backdrop" id="modal-ai-drawer" aria-hidden="true">
      <div class="vmodal-sheet vmodal-ai-sheet">
        <div class="vmodal-handle"></div>
        <div class="vmodal-header">
          <div class="vmodal-htitle-wrap">
            <span style="font-size:20px;">🤖</span>
            <div>
              <h3 class="vmodal-title">Heritage AI Guide</h3>
              <p class="vmodal-sub" id="ai-drawer-sub">Your AI companion for ${site.name}</p>
            </div>
          </div>
          <button type="button" class="vmodal-close-btn" data-close="modal-ai-drawer">✕</button>
        </div>

        <div class="ai-chat-messages" id="ai-chat-messages"></div>

        <div class="ai-prompts-section">
          <span class="ai-prompts-lbl">SUGGESTED QUESTIONS</span>
          <div class="ai-drawer-chips" id="ai-drawer-chips"></div>
        </div>

        <form class="ai-input-bar" id="ai-chat-form" onsubmit="return false;">
          <input 
            type="text" 
            id="ai-chat-input" 
            class="ai-chat-input" 
            placeholder="Ask AI about ${site.name}..." 
            autocomplete="off"
            maxlength="200"
          />
          <button type="submit" id="ai-chat-send" class="ai-chat-send" aria-label="Send message">
            <span>➤</span>
          </button>
        </form>
      </div>
    </div>

    <!-- PHYSICAL MODE GEOFENCE VERIFICATION MODAL -->
    <div class="vmodal-backdrop" id="modal-opt-physical-geofence" aria-hidden="true">
      <div class="vmodal-sheet vmodal-physical-sheet" style="padding:18px 16px;">
        <div class="vmodal-handle"></div>
        <div class="vmodal-header" style="margin-bottom:12px;">
          <div class="vmodal-htitle-wrap">
            <span style="font-size:22px;">📍</span>
            <div>
              <h3 class="vmodal-title">GPS Field Expedition</h3>
              <p class="vmodal-sub">${site.name} &bull; Geofence Lock</p>
            </div>
          </div>
          <button type="button" class="vmodal-close-btn" data-close="modal-opt-physical-geofence">✕</button>
        </div>

        <div id="geofence-status-container">
          <!-- Populated during live GPS scan -->
        </div>
      </div>
    </div>

    <!-- MODAL: IN-GAME LIVE CAMERA & AI VISION VERIFIER -->
    <div class="vmodal-backdrop" id="modal-opt-camera" aria-hidden="true">
      <div class="vmodal-sheet" style="max-height:92vh; overflow-y:auto; padding-bottom:16px;">
        <div class="vmodal-handle"></div>
        <div class="vmodal-header" style="margin-bottom:10px;">
          <div class="vmodal-htitle-wrap">
            <span style="font-size:22px;">📸</span>
            <div>
              <h3 class="vmodal-title">${site.name} — AI Lens</h3>
              <p class="vmodal-sub">Live Monument Vision Verification</p>
            </div>
          </div>
          <button type="button" class="vmodal-close-btn" data-close="modal-opt-camera" id="btn-close-camera">✕</button>
        </div>

        <!-- Camera Viewfinder Stage -->
        <div style="position:relative; width:100%; height:250px; background:#050505; border-radius:14px; overflow:hidden; border:2px solid rgba(34,197,94,0.45); display:flex; align-items:center; justify-content:center; margin-bottom:10px; box-shadow:0 6px 24px rgba(0,0,0,0.8);">
          <video id="camera-video-stream" autoplay playsinline muted style="width:100%; height:100%; object-fit:cover; display:none;"></video>
          <img id="camera-photo-preview" style="width:100%; height:100%; object-fit:contain; display:none;" alt="Captured Photo" />
          
          <div id="camera-placeholder-msg" style="text-align:center; padding:16px; color:#9ca3af;">
            <div style="font-size:36px; margin-bottom:6px;">📷</div>
            <div style="color:#fff; font-weight:bold; font-size:13px; margin-bottom:4px;">Camera Inactive</div>
            <div style="font-size:11px; color:#a1a1aa;">Tap 'Start Camera' or choose a photo from files</div>
          </div>

          <!-- AR Reticle Overlay -->
          <div id="camera-reticle" style="display:none; position:absolute; inset:16px; border:2px dashed rgba(34,197,94,0.7); border-radius:12px; pointer-events:none; box-shadow:inset 0 0 20px rgba(34,197,94,0.2);">
            <div style="position:absolute; top:8px; left:8px; background:rgba(0,0,0,0.65); color:#4ade80; font-size:9.5px; font-weight:bold; padding:2px 6px; border-radius:4px; border:1px solid rgba(34,197,94,0.4);">
              🎯 TARGET: ${site.name.toUpperCase()}
            </div>
          </div>
        </div>

        <!-- Hidden Canvas for frame snapshot -->
        <canvas id="camera-snapshot-canvas" style="display:none;"></canvas>

        <!-- Single Click Photo & Verify Shutter Button -->
        <button type="button" id="btn-camera-capture-verify" style="width:100%; height:48px; background:linear-gradient(135deg, #22c55e, #16a34a); color:#fff; border:none; border-radius:12px; font-size:13.5px; font-weight:800; letter-spacing:0.5px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:10px; box-shadow:0 4px 16px rgba(34,197,94,0.35);">
          <span>📸 CLICK PHOTO & AI VERIFY (+500 XP)</span>
        </button>

        <!-- AI Verification Result Output Box -->
        <div id="camera-result-box" style="display:none; background:rgba(0,0,0,0.4); border:1px solid rgba(212,175,55,0.3); border-radius:10px; padding:12px;">
          <!-- Dynamically populated with AI match status -->
        </div>
      </div>
    </div>

  `;

  /* ─── Styles ─── */
  const style = document.createElement('style');
  style.textContent = `
  .gms {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: calc(var(--safe-top,24px) + 12px) 14px calc(var(--safe-bottom,24px) + 16px) 14px;
    gap: 10px;
    box-sizing: border-box;
  }

  .vmodal-sheet { scrollbar-width: none; -ms-overflow-style: none; }
  .vmodal-sheet::-webkit-scrollbar { display: none; }

  .gms-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(30,24,16,.98) 0%, #090705 100%);
    z-index: 0;
  }
  .gms-bg-glow {
    position: absolute;
    top: -60px; left: 50%;
    transform: translateX(-50%);
    width: 280px; height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, ${site.glowColor || 'rgba(212,175,55,0.4)'} 0%, transparent 70%);
    z-index: 1;
    animation: gmsBgGlow 3s ease-in-out infinite alternate;
  }
  @keyframes gmsBgGlow {
    from { opacity: .5; transform: translateX(-50%) scale(.9); }
    to   { opacity: 1;  transform: translateX(-50%) scale(1.1); }
  }

  .gms-particles { position:absolute; inset:0; z-index:2; pointer-events:none; }
  .gp {
    position: absolute;
    border-radius: 50%;
    background: ${site.glowColor || '#d4af37'};
    opacity: 0;
    animation: gpFloat linear infinite;
  }
  @keyframes gpFloat {
    0%   { opacity:0;   transform:translateY(0) scale(1); }
    10%  { opacity:.75; }
    90%  { opacity:.4; }
    100% { opacity:0;   transform:translateY(-75vh) scale(.3); }
  }
  .gp1  { width:4px; height:4px; left:8%;  bottom:15%; animation-duration:6s; }
  .gp2  { width:3px; height:3px; left:25%; bottom:10%; animation-duration:8s; }
  .gp3  { width:5px; height:5px; left:45%; bottom:20%; animation-duration:7s; }
  .gp4  { width:3px; height:3px; left:65%; bottom:18%; animation-duration:9s; }
  .gp5  { width:4px; height:4px; left:85%; bottom:12%; animation-duration:6.5s; }

  /* Views container */
  .gms-view-container {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    height: 100%;
    justify-content: flex-start;
    transition: opacity .25s ease, transform .25s ease;
  }
  .gms-view-hidden {
    display: none !important;
  }

  /* Back Button */
  .gms-back-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    background: rgba(18,14,10,.85);
    border: 1px solid rgba(212,175,55,.3);
    border-radius: 8px;
    color: #ffd700;
    font-size: 11.5px;
    font-weight: 700;
    cursor: pointer;
    align-self: flex-start;
    transition: all .16s ease;
    backdrop-filter: blur(8px);
  }
  .gms-back-btn:hover {
    border-color: #ffd700;
    background: rgba(26,20,14,.95);
  }
  .gms-back-ico { display:flex; width:14px; height:14px; }

  /* Site Header */
  .gms-site-header {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(14,11,8,.85);
    border: 1.5px solid rgba(212,175,55,.3);
    border-radius: 14px;
    padding: 12px 14px;
    box-shadow: 0 6px 24px rgba(0,0,0,.7), inset 0 1px 0 rgba(212,175,55,.15);
    backdrop-filter: blur(12px);
  }
  .gms-site-icon-wrap {
    position: relative;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .gms-site-icon { font-size: 26px; line-height: 1; z-index: 2; }
  .gms-site-icon-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid ${site.glowColor || '#d4af37'};
    box-shadow: 0 0 14px ${site.glowColor || 'rgba(212,175,55,0.4)'};
  }
  .gms-site-meta { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .gms-site-name {
    font-family: var(--font-serif);
    font-size: 16px;
    font-weight: 900;
    color: #ffd700;
    line-height: 1.1;
    margin: 0;
  }
  .gms-site-loc { font-size: 10px; color: #a0aec0; margin:0; }
  .gms-site-type-pill {
    display: inline-block;
    font-size: 7.5px;
    font-weight: 800;
    letter-spacing: .8px;
    text-transform: uppercase;
    color: #ffd700;
    background: rgba(0,0,0,.4);
    border: 1px solid rgba(212,175,55,.4);
    border-radius: 4px;
    padding: 1px 5px;
    align-self: flex-start;
  }

  /* Question Divider */
  .gms-question-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .gms-divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,.35), transparent);
  }
  .gms-question {
    font-family: var(--font-serif);
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #a0aec0;
    white-space: nowrap;
    margin: 0;
  }

  /* Mode Cards Container */
  .gms-modes {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .gms-mode-card {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1.5px solid transparent;
    cursor: pointer;
    overflow: hidden;
    text-align: left;
    transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
  }
  .gms-mode-card:hover {
    transform: scale(1.01) translateY(-2px);
  }
  .gms-virtual {
    border-color: rgba(99,179,237,.45);
    box-shadow: 0 8px 32px rgba(0,0,0,.75), 0 0 24px rgba(99,179,237,.15);
  }
  .gms-virtual:hover {
    border-color: rgba(99,179,237,.85);
    box-shadow: 0 12px 40px rgba(0,0,0,.8), 0 0 32px rgba(99,179,237,.3);
  }
  .gms-mode-bg-virtual {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(10,15,35,.96) 0%, rgba(20,30,55,.94) 50%, rgba(8,12,28,.98) 100%);
    border-radius: 14px;
  }
  .gms-physical {
    border-color: rgba(212,175,55,.45);
    box-shadow: 0 8px 32px rgba(0,0,0,.75), 0 0 24px rgba(212,175,55,.12);
  }
  .gms-mode-bg-physical {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(20,14,4,.96) 0%, rgba(35,24,8,.94) 50%, rgba(16,10,3,.98) 100%);
    border-radius: 14px;
  }
  .gms-mode-shimmer {
    position: absolute;
    top: 0; left: 0;
    width: 45%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.05), transparent);
    animation: shimmerSweep 4s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes shimmerSweep {
    0%   { transform:translateX(-100%) skewX(-15deg); }
    50%,100% { transform:translateX(280%) skewX(-15deg); }
  }
  .gms-mode-icon-wrap {
    position: relative;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  .gms-mode-emoji { font-size: 24px; line-height: 1; }
  .gms-mode-icon-glow { position: absolute; inset: -4px; border-radius: 50%; }
  .gms-virtual-glow  { background: radial-gradient(circle, rgba(99,179,237,.35) 0%, transparent 70%); }
  .gms-physical-glow { background: radial-gradient(circle, rgba(212,175,55,.35) 0%, transparent 70%); }

  .gms-mode-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 2;
    min-width: 0;
  }
  .gms-badge-row { display:flex; align-items:center; gap:6px; margin-bottom:2px; }
  .gms-mode-badge {
    display: inline-block;
    font-size: 7px;
    font-weight: 900;
    letter-spacing: 1px;
    border-radius: 3px;
    padding: 1px 4px;
  }
  .gms-badge-virtual  { background: rgba(99,179,237,.2); color: #90cdf4; border: 1px solid rgba(99,179,237,.5); }
  .gms-badge-physical { background: rgba(212,175,55,.2);  color: #ebd07b; border: 1px solid rgba(212,175,55,.5); }
  .gms-pill-options-count {
    font-size: 7.5px;
    font-weight: 800;
    color: #6ee7b7;
    background: rgba(16,185,129,.15);
    border: 1px solid rgba(16,185,129,.4);
    border-radius: 3px;
    padding: 1px 4px;
  }
  .gms-mode-title {
    font-family: var(--font-serif);
    font-size: 14px;
    font-weight: 900;
    color: #f5f0e6;
    margin: 0;
  }
  .gms-mode-desc { font-size: 9px; color: #a0aec0; line-height: 1.35; margin: 0; }
  .gms-mode-features {
    list-style: none;
    padding: 0;
    margin: 3px 0 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .gms-mode-features li { font-size: 8.5px; color: #a0aec0; }
  .gms-mode-xp-tag {
    display: inline-flex;
    align-items: center;
    font-size: 9px;
    font-weight: 800;
    color: #fae4a8;
    background: rgba(212,175,55,.18);
    border: 1px solid rgba(212,175,55,.4);
    border-radius: 4px;
    padding: 2px 7px;
    white-space: nowrap;
    flex-shrink: 0;
    z-index: 2;
  }
  .gms-mode-arrow {
    font-size: 20px;
    color: rgba(255,255,255,.35);
    line-height: 1;
    flex-shrink: 0;
    z-index: 2;
  }

  .gms-footer-info {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 4px;
  }
  .gms-info-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(14,11,8,.75);
    border: 1px solid rgba(212,175,55,.22);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 8.5px;
    font-weight: 700;
    color: #a0aec0;
  }

  /* ═══════════════════════════════════════════════════
     VIEW 2: VIRTUAL EXPLORATION 4 OPTIONS HUB
  ═══════════════════════════════════════════════════ */
  .gms-virtual-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, rgba(16,24,48,.92) 0%, rgba(10,14,30,.95) 100%);
    border: 1.5px solid rgba(99,179,237,.35);
    border-radius: 12px;
    padding: 10px 12px;
    box-shadow: 0 4px 18px rgba(0,0,0,.6);
  }
  .gms-vh-badge {
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #90cdf4;
  }
  .gms-vh-title {
    font-family: var(--font-serif);
    font-size: 15px;
    font-weight: 900;
    color: #f5f0e6;
    margin: 2px 0;
  }
  .gms-vh-sub {
    font-size: 9.5px;
    color: #a0aec0;
    margin: 0;
  }
  .gms-vh-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  /* 4 Options Grid */
  .gms-voptions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
  }
  .gms-vopt-card {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 140px;
    padding: 12px;
    background: rgba(18, 14, 10, 0.9);
    border: 1.5px solid rgba(212,175,55,.28);
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: all .18s cubic-bezier(.34,1.56,.64,1);
    overflow: hidden;
  }
  .gms-vopt-card:hover {
    transform: translateY(-3px) scale(1.02);
    border-color: rgba(212,175,55,.7);
    box-shadow: 0 8px 24px rgba(0,0,0,.8), 0 0 16px rgba(212,175,55,.25);
  }
  .gms-vopt-card:active { transform: scale(.97); }

  .vopt-glow {
    position: absolute;
    top: -20px; right: -20px;
    width: 70px; height: 70px;
    border-radius: 50%;
    pointer-events: none;
  }
  .gms-vopt-3d .vopt-glow         { background: radial-gradient(circle, rgba(99,179,237,.3) 0%, transparent 70%); }
  .gms-vopt-knowledge .vopt-glow  { background: radial-gradient(circle, rgba(212,175,55,.35) 0%, transparent 70%); }
  .gms-vopt-chronicles .vopt-glow { background: radial-gradient(circle, rgba(192,132,252,.35) 0%, transparent 70%); }
  .gms-vopt-quiz .vopt-glow       { background: radial-gradient(circle, rgba(249,115,22,.3) 0%, transparent 70%); }
  .gms-vopt-arrange .vopt-glow    { background: radial-gradient(circle, rgba(74,222,128,.3) 0%, transparent 70%); }

  .vopt-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 6px;
    position: relative;
    z-index: 2;
  }
  .vopt-ico-box {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,.45);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 8px;
    font-size: 16px;
  }
  .vopt-pill {
    font-size: 7.5px;
    font-weight: 800;
    letter-spacing: .8px;
    color: #90cdf4;
    background: rgba(99,179,237,.15);
    border: 1px solid rgba(99,179,237,.4);
    border-radius: 3px;
    padding: 1px 4px;
  }
  .vopt-pill-gold { color:#fae4a8; background:rgba(212,175,55,.15); border-color:rgba(212,175,55,.4); }
  .vopt-pill-purple { color:#e9d5ff; background:rgba(168,85,247,.18); border-color:rgba(168,85,247,.45); }
  .vopt-pill-amber { color:#fbd38d; background:rgba(249,115,22,.15); border-color:rgba(249,115,22,.4); }
  .vopt-pill-emerald { color:#6ee7b7; background:rgba(74,222,128,.15); border-color:rgba(74,222,128,.4); }

  .vopt-main {
    display: flex;
    flex-direction: column;
    gap: 3px;
    position: relative;
    z-index: 2;
  }
  .vopt-title {
    font-family: var(--font-serif);
    font-size: 13px;
    font-weight: 900;
    color: #fae4a8;
    margin: 0;
  }
  .vopt-desc {
    font-size: 8.5px;
    color: #a09080;
    line-height: 1.35;
    margin: 0;
  }
  .vopt-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,.07);
    position: relative;
    z-index: 2;
  }
  .vopt-xp {
    font-size: 8px;
    font-weight: 800;
    color: #d4af37;
  }
  .vopt-action-arrow {
    font-size: 9px;
    font-weight: 800;
    color: #fae4a8;
  }

  /* ═══════════════════════════════════════════════════
     OPTION MODALS & DRAWERS
  ═══════════════════════════════════════════════════ */
  .vmodal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(2, 4, 10, 0.95);
    z-index: 100;
    backdrop-filter: blur(8px);
    display: none;
    align-items: flex-end;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity .25s ease;
  }
  .vmodal-backdrop.open {
    display: flex;
    opacity: 1;
    pointer-events: auto;
  }
  .vmodal-sheet {
    width: 100%;
    max-width: 430px;
    max-height: 92vh;
    overflow-y: auto;
    background: linear-gradient(180deg, #181410 0%, #0d0a07 100%);
    border-top: 1.5px solid rgba(212, 175, 55, 0.45);
    border-radius: 20px 20px 0 0;
    padding: 12px 16px calc(var(--safe-bottom, 24px) + 14px) 16px;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(212, 175, 55, 0.15);
    transform: translateY(100%);
    transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .vmodal-backdrop.open .vmodal-sheet {
    transform: translateY(0);
  }
  .vmodal-handle {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: rgba(212, 175, 55, 0.4);
    margin: 0 auto 12px auto;
  }
  .vmodal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .vmodal-htitle-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .vmodal-title {
    font-family: var(--font-serif);
    font-size: 14px;
    font-weight: 800;
    color: #fae4a8;
    margin: 0;
  }
  .vmodal-sub {
    font-size: 9px;
    color: #94a3b8;
    margin: 1px 0 0;
  }
  .vmodal-close-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid rgba(212,175,55,.3);
    background: rgba(255,255,255,.05);
    color: #e2e8f0;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── 3D Stage in Modal ─────────────────────────── */
  .vmodal-3d-stage {
    position: relative;
    width: 100%;
    height: 320px;
    min-height: 320px;
    background: radial-gradient(circle at 50% 50%, #1c1813 0%, #0a0806 100%);
    border: 1px solid rgba(212,175,55,.3);
    border-radius: 12px;
    overflow: hidden;
    display: block;
    margin-bottom: 10px;
  }
  /* Ensure model-viewer always fills the stage and its canvas is visible */
  .vmodal-3d-stage model-viewer,
#vmodal-3d-stage-container model-viewer,
#heritage-3d-model {
    width: 100% !important;
    height: 320px !important;
    display: block !important;
    --poster-color: transparent !important;
  }
  .vmodal-3d-pedestal {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .vmodal-3d-monument-icon {
    font-size: 64px;
    line-height: 1;
    animation: iconBob 3s ease-in-out infinite;
    filter: drop-shadow(0 0 16px rgba(212,175,55,.6));
    z-index: 2;
  }
  .vmodal-3d-rune-ring {
    width: 110px;
    height: 30px;
    border-radius: 50%;
    border: 1.5px dashed #d4af37;
    margin-top: -12px;
    animation: runeRingSpin 10s linear infinite;
  }
  @keyframes runeRingSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .vmodal-3d-base {
    width: 130px;
    height: 16px;
    background: linear-gradient(180deg, #2a2015, #14100b);
    border-radius: 50%;
    box-shadow: 0 0 16px rgba(212,175,55,.35);
    margin-top: -14px;
  }
  .vmodal-3d-controls-hint {
    position: absolute;
    bottom: 8px;
    background: rgba(0,0,0,.6);
    border: 1px solid rgba(212,175,55,.3);
    border-radius: 20px;
    padding: 2px 10px;
    font-size: 8.5px;
    color: #fae4a8;
  }
  .vmodal-3d-specs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }
  .vspec-chip {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(212,175,55,.2);
    border-radius: 8px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .vspec-lbl { font-size: 8px; color: #8a7a68; text-transform: uppercase; font-weight: 800; }
  .vspec-val { font-size: 10px; color: #fae4a8; font-weight: 700; }

  /* Mission Modal Styles */
  .mission-brief-card {
    background: rgba(212,175,55,.08);
    border: 1px solid rgba(212,175,55,.25);
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 10px;
  }
  .mission-brief-text { font-size: 10px; color: #cbd5e1; line-height: 1.45; margin:0; }
  .mission-steps-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
  .mstep-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 8px;
    padding: 8px 10px;
  }
  .mstep-item.active {
    background: rgba(212,175,55,.08);
    border-color: rgba(212,175,55,.4);
  }
  .mstep-num {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: #2a2217;
    border: 1px solid #d4af37;
    color: #fae4a8;
    font-size: 9.5px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .mstep-info { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .mstep-title { font-size: 10px; font-weight: 700; color: #fae4a8; }
  .mstep-desc { font-size: 8.5px; color: #94a3b8; }
  .mstep-status {
    font-size: 7.5px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(82,183,136,.15);
    color: #6ee7b7;
    border: 1px solid rgba(82,183,136,.4);
  }
  .mstep-status.in-progress { background: rgba(212,175,55,.15); color: #fae4a8; border-color: rgba(212,175,55,.4); }
  .mstep-status.locked { background: rgba(255,255,255,.05); color: #64748b; border-color: rgba(255,255,255,.1); }

  /* Quiz Modal Styles */
  .quiz-container { display: flex; flex-direction: column; gap: 10px; }
  .quiz-question-box {
    background: rgba(212,175,55,.08);
    border: 1px solid rgba(212,175,55,.3);
    border-radius: 10px;
    padding: 10px 12px;
  }
  .quiz-badge { font-size: 8px; font-weight: 800; letter-spacing: 1px; color: #d4af37; }
  .quiz-qtext { font-size: 11.5px; font-weight: 700; color: #f5f0e6; margin: 4px 0 0; line-height: 1.4; }
  .quiz-options-list { display: flex; flex-direction: column; gap: 6px; }
  .quiz-opt-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(26,20,14,.85);
    border: 1px solid rgba(212,175,55,.25);
    border-radius: 8px;
    padding: 8px 12px;
    color: #e2e8f0;
    font-size: 10.5px;
    text-align: left;
    cursor: pointer;
    transition: all .15s ease;
  }
  .quiz-opt-btn:hover {
    border-color: #d4af37;
    background: rgba(40,30,20,.95);
    transform: translateX(3px);
  }
  .quiz-opt-btn.correct {
    background: rgba(16,185,129,.2);
    border-color: #10b981;
    color: #6ee7b7;
  }
  .quiz-opt-btn.wrong {
    background: rgba(239,68,68,.2);
    border-color: #ef4444;
    color: #fca5a5;
  }
  .qopt-letter {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: rgba(212,175,55,.15);
    border: 1px solid rgba(212,175,55,.4);
    color: #fae4a8;
    font-size: 9px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .quiz-feedback-box {
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 9.5px;
    line-height: 1.4;
  }

  /* Arrange Modal Styles */
  .arrange-container { display: flex; flex-direction: column; gap: 8px; }
  .arrange-hint { font-size: 9.5px; color: #94a3b8; margin: 0; }
  .arrange-list { display: flex; flex-direction: column; gap: 6px; }
  .arrange-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(26,20,14,.9);
    border: 1px solid rgba(212,175,55,.28);
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all .15s ease;
  }
  .arrange-item.selected {
    border-color: #f59e0b;
    background: rgba(245,158,11,.15);
    transform: scale(1.02);
  }
  .arrange-item-icon { font-size: 18px; }
  .arrange-item-meta { flex: 1; display: flex; flex-direction: column; gap: 1px; }
  .arrange-item-title { font-size: 10.5px; font-weight: 700; color: #fae4a8; }
  .arrange-item-year { font-size: 8.5px; color: #94a3b8; }
  .arrange-swap-handle { font-size: 8px; font-weight: 800; color: #d4af37; background: rgba(212,175,55,.1); border: 1px solid rgba(212,175,55,.3); border-radius: 4px; padding: 2px 6px; }

  /* Chronicles Modal Styles */
  .chronicles-container { display: flex; flex-direction: column; gap: 10px; }
  .chronicles-tabs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
  }
  .chronicles-tabs::-webkit-scrollbar { display: none; }
  .chronicle-tab-btn {
    flex: 1;
    min-width: 80px;
    padding: 8px 6px;
    background: rgba(26,20,14,.9);
    border: 1px solid rgba(212,175,55,.25);
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    text-align: center;
    white-space: nowrap;
    transition: all .16s ease;
  }
  .chronicle-tab-btn:hover {
    border-color: #c084fc;
    color: #f3e8ff;
  }
  .chronicle-tab-btn.active {
    background: linear-gradient(135deg, rgba(168,85,247,0.25) 0%, rgba(192,132,252,0.15) 100%);
    border-color: #c084fc;
    color: #f3e8ff;
    box-shadow: 0 0 12px rgba(168,85,247,0.3);
  }
  .chronicles-audio-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(168,85,247,0.1);
    border: 1px solid rgba(168,85,247,0.3);
    border-radius: 10px;
    padding: 6px 10px;
  }
  .chronicles-audio-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
    border: none;
    border-radius: 6px;
    color: #fff;
    padding: 5px 10px;
    font-size: 10.5px;
    font-weight: 800;
    cursor: pointer;
    transition: transform .12s ease, opacity .12s ease;
  }
  .chronicles-audio-btn:active { transform: scale(0.95); }
  .chronicles-audio-hint {
    font-size: 9.5px;
    color: #d8b4fe;
    font-style: italic;
  }
  .chronicles-story-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(212,175,55,0.25);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .chronicle-header-badge {
    display: inline-block;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.8px;
    color: #d8b4fe;
    background: rgba(168,85,247,0.15);
    border: 1px solid rgba(168,85,247,0.35);
    border-radius: 4px;
    padding: 2px 6px;
    align-self: flex-start;
  }
  .chronicle-title {
    font-family: var(--font-serif);
    color: #ffd700;
    font-size: 14px;
    font-weight: 900;
    margin: 0;
    line-height: 1.3;
  }
  .chronicle-quote {
    font-style: italic;
    color: #fae4a8;
    font-size: 11px;
    line-height: 1.45;
    padding: 6px 10px;
    border-left: 3px solid #c084fc;
    background: rgba(168,85,247,0.08);
    border-radius: 0 8px 8px 0;
    margin: 2px 0;
  }
  .chronicle-body {
    color: #e2e8f0;
    font-size: 11.5px;
    line-height: 1.55;
    margin: 0;
  }
  .chronicle-highlights-box {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 8px 10px;
  }
  .chronicle-highlights-title {
    font-size: 9.5px;
    color: #ffd700;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .chronicle-highlights-list {
    margin: 0;
    padding-left: 16px;
    font-size: 10px;
    color: #cbd5e1;
    line-height: 1.45;
  }
  .chronicle-takeaway {
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.3);
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 10.5px;
    color: #86efac;
    line-height: 1.4;
  }
  .konark-pics-scroll-box {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    max-height: 60vh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(212,175,55,0.6) rgba(0,0,0,0.3);
    padding-right: 4px;
    padding-bottom: 8px;
  }
  .konark-pics-scroll-box::-webkit-scrollbar {
    width: 6px;
  }
  .konark-pics-scroll-box::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.3);
    border-radius: 4px;
  }
  .konark-pics-scroll-box::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #d4af37, #f59e0b);
    border-radius: 4px;
  }
  .konark-pic-card {
    flex-shrink: 0 !important;
    width: 100% !important;
    background: rgba(18,14,10,0.95);
    border: 1.5px solid rgba(212,175,55,0.35);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(0,0,0,0.85);
  }
  .konark-pic-card img {
    width: 100% !important;
    height: auto !important;
    object-fit: contain !important;
    display: block !important;
    min-height: 180px;
  }


  /* ═══════════════════════════════════════════════════
     AI FAB BUTTON (floating on Virtual Hub)
  ═══════════════════════════════════════════════════ */
  .gms-ai-fab {
    position: absolute;
    bottom: 18px;
    right: 14px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 13px 7px 10px;
    background: linear-gradient(135deg, rgba(30,20,5,.95) 0%, rgba(18,12,3,.98) 100%);
    border: 1.5px solid rgba(212,175,55,.6);
    border-radius: 24px;
    color: #fae4a8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .5px;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(0,0,0,.7), 0 0 14px rgba(212,175,55,.25);
    transition: all .18s ease;
  }
  .gms-ai-fab:hover {
    transform: translateY(-2px) scale(1.04);
    border-color: #d4af37;
    box-shadow: 0 6px 24px rgba(0,0,0,.8), 0 0 20px rgba(212,175,55,.4);
  }
  .gms-ai-fab:active { transform: scale(.96); }
  .gms-ai-fab-icon { font-size: 15px; }
  .gms-ai-fab-label { font-size: 10px; font-weight: 900; letter-spacing: 1px; }

  /* AI button inside modal headers */
  .vmodal-ai-btn {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 4px 9px;
    background: rgba(212,175,55,.12);
    border: 1px solid rgba(212,175,55,.45);
    border-radius: 12px;
    color: #fae4a8;
    font-size: 9.5px;
    font-weight: 800;
    cursor: pointer;
    white-space: nowrap;
    transition: all .15s ease;
  }
  .vmodal-ai-btn:hover {
    background: rgba(212,175,55,.22);
    border-color: #d4af37;
  }

  /* AI Drawer Sheet */
  .vmodal-ai-sheet {
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-bottom: calc(var(--safe-bottom, 24px) + 12px);
  }

  /* Chat Messages Container */
  .ai-chat-messages {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 220px;
    min-height: 120px;
    overflow-y: auto;
    padding: 6px 2px;
    scrollbar-width: none;
  }
  .ai-chat-messages::-webkit-scrollbar { display: none; }

  .ai-msg {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    animation: msgIn .2s ease-out;
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ai-msg-user {
    flex-direction: row-reverse;
  }
  .ai-msg-bubble {
    max-width: 82%;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 10.5px;
    line-height: 1.45;
  }
  .ai-msg-bot .ai-msg-bubble {
    background: rgba(26,20,14,.92);
    border: 1px solid rgba(212,175,55,.28);
    color: #f1e7d0;
    border-top-left-radius: 3px;
  }
  .ai-msg-user .ai-msg-bubble {
    background: linear-gradient(135deg, rgba(212,175,55,.3) 0%, rgba(245,158,11,.2) 100%);
    border: 1px solid rgba(212,175,55,.6);
    color: #fff9ea;
    border-top-right-radius: 3px;
  }
  .ai-msg-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
    background: rgba(0,0,0,.45);
    border: 1px solid rgba(212,175,55,.35);
  }

  /* Typing animation */
  .ai-typing-dots {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 4px;
  }
  .ai-typing-dots span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #d4af37;
    animation: typingBlink 1.2s infinite ease-in-out;
  }
  .ai-typing-dots span:nth-child(2) { animation-delay: .2s; }
  .ai-typing-dots span:nth-child(3) { animation-delay: .4s; }
  @keyframes typingBlink {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40%           { transform: scale(1.2); opacity: 1; }
  }

  /* Suggested Prompts Section */
  .ai-prompts-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .ai-prompts-lbl {
    font-size: 7.5px;
    font-weight: 800;
    letter-spacing: .8px;
    color: #94a3b8;
  }
  .ai-drawer-chips {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 3px;
    scrollbar-width: none;
  }
  .ai-drawer-chips::-webkit-scrollbar { display: none; }
  .ai-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 9px;
    background: rgba(18,14,10,.85);
    border: 1px solid rgba(212,175,55,.25);
    border-radius: 14px;
    color: #e2d5b0;
    font-size: 9px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all .15s ease;
  }
  .ai-chip:hover {
    border-color: #d4af37;
    background: rgba(212,175,55,.15);
    color: #fae4a8;
  }
  .ai-chip-ico { font-size: 11px; }

  /* Input Slot / Bar */
  .ai-input-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(14,11,8,.95);
    border: 1.5px solid rgba(212,175,55,.45);
    border-radius: 12px;
    padding: 4px 6px 4px 12px;
    margin-top: 2px;
    transition: border-color .18s ease, box-shadow .18s ease;
  }
  .ai-input-bar:focus-within {
    border-color: #d4af37;
    box-shadow: 0 0 12px rgba(212,175,55,.3);
  }
  .ai-chat-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #fff9ea;
    font-size: 11px;
    font-family: inherit;
    padding: 6px 0;
  }
  .ai-chat-send {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
    color: #120e09;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform .14s ease, opacity .14s ease;
    flex-shrink: 0;
  }
  .ai-chat-send:active {
    transform: scale(0.92);
  }
  `;
  root.appendChild(style);

  /* ─── DOM References & Logic ─── */
  const viewModeSelection = root.querySelector('#view-mode-selection');
  const viewVirtualHub = root.querySelector('#view-virtual-hub');
  const viewPhysicalHub = root.querySelector('#view-physical-hub');

  const stopAllMedia = () => {
    const vid = root.querySelector('#konark-chronicles-video');
    if (vid) {
      vid.pause();
      vid.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Ensure video is strictly paused on screen mount
  stopAllMedia();

  // Navigation: Back to Map
  root.querySelector('#gms-back-to-map')?.addEventListener('click', () => {
    sound.playTap();
    stopAllMedia();
    appState.navigate('map');
  });

  // Navigation: Back from Virtual Hub to Mode Selection
  root.querySelector('#gms-back-to-modes')?.addEventListener('click', () => {
    sound.playTap();
    stopAllMedia();
    viewVirtualHub.classList.add('gms-view-hidden');
    viewModeSelection.classList.remove('gms-view-hidden');
  });

  // Navigation: Back from Physical Hub to Mode Selection
  root.querySelector('#gms-back-to-modes-phys')?.addEventListener('click', () => {
    sound.playTap();
    stopAllMedia();
    viewPhysicalHub.classList.add('gms-view-hidden');
    viewModeSelection.classList.remove('gms-view-hidden');
  });

  // Clicking VIRTUAL MODE card -> opens Virtual Hub with 4 options!
  root.querySelector('#gms-btn-virtual-mode')?.addEventListener('click', () => {
    sound.playChime();
    viewModeSelection.classList.add('gms-view-hidden');
    viewVirtualHub.classList.remove('gms-view-hidden');
  });

  // Clicking PHYSICAL MODE card -> perform live GPS Geofencing Check!
  const runGeofenceCheck = async () => {
    const container = root.querySelector('#geofence-status-container');
    if (!container) return;

    openOptionModal('modal-opt-physical-geofence');

    container.innerHTML = `
      <div style="text-align:center; padding: 20px 10px;">
        <div style="font-size:36px; animation: gmsBgGlow 1.2s infinite alternate;">📡</div>
        <h4 style="color:#ffd700; margin:10px 0 4px 0; font-size:15px;">Scanning Satellite GPS...</h4>
        <p style="color:#9ca3af; font-size:11px; margin:0;">Triangulating device distance to ${site.name}</p>
      </div>
    `;

    try {
      const targetLat = site.lat || 19.8876;
      const targetLng = site.lng || 86.0945;
      const radius = site.radiusMeters || 500;

      const res = await verifyProximity(targetLat, targetLng, radius);

      if (res.isInside) {
        sound.playChime();
        container.innerHTML = `
          <div style="text-align:center;">
            <div style="font-size:40px; margin-bottom:6px;">🎉</div>
            <span style="background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid #22c55e; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:bold;">
              ✓ GEOFENCE VERIFIED: ON-SITE (${res.formattedDistance})
            </span>
            <h3 style="color:#fff; margin:12px 0 4px 0; font-size:17px;">Welcome to ${site.name}!</h3>
            <p style="color:#e2d5b0; font-size:12px; line-height:1.4; margin:0 0 14px 0;">
              GPS confirms you are standing within the verified heritage perimeter!
            </p>

            <div style="background:rgba(0,0,0,0.35); border:1px solid rgba(212,175,55,0.3); border-radius:10px; padding:12px; margin-bottom:14px; text-align:left;">
              <div style="font-size:11px; color:#ffd700; font-weight:bold; margin-bottom:6px;">🎒 3 Physical Challenges Unlocked:</div>
              <ul style="margin:0; padding-left:16px; font-size:11px; color:#d1d5db; line-height:1.6;">
                <li>📸 <strong>AI Heritage Lens:</strong> Live monument camera photo verification</li>
                <li>❓ <strong>Field Quiz:</strong> 6 on-site architectural questions</li>
                <li>🧩 <strong>Relic Reconstruction:</strong> On-site timeline arrange puzzle</li>
              </ul>
            </div>

            <button type="button" id="btn-start-field-expedition" style="width:100%; background:linear-gradient(135deg, #22c55e, #16a34a); color:#fff; border:none; padding:12px; border-radius:10px; font-weight:bold; font-size:13px; cursor:pointer;">
              🚀 ENTER FIELD EXPEDITION HUB
            </button>
          </div>
        `;

        container.querySelector('#btn-start-field-expedition')?.addEventListener('click', () => {
          sound.playChime();
          closeOptionModal('modal-opt-physical-geofence');
          viewModeSelection.classList.add('gms-view-hidden');
          viewPhysicalHub.classList.remove('gms-view-hidden');
        });

      } else {
        sound.playTap();
        container.innerHTML = `
          <div style="text-align:center;">
            <div style="font-size:36px; margin-bottom:4px;">📍⚠️</div>
            <span style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid #ef4444; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:bold;">
              OUT OF GEOFENCE RANGE
            </span>
            <h3 style="color:#fff; margin:10px 0 4px 0; font-size:16px;">You are ${res.formattedDistance} away</h3>
            <p style="color:#d1d5db; font-size:12px; line-height:1.4; margin:0 0 14px 0;">
              Physical exploration requires you to be physically present at <strong>${site.name}</strong> (within ${radius}m).
            </p>

            <div style="display:flex; flex-direction:column; gap:8px;">
              <button type="button" id="btn-geofence-switch-virtual" style="width:100%; background:linear-gradient(135deg, #d4af37, #f59e0b); color:#000; border:none; padding:12px; border-radius:10px; font-weight:bold; font-size:12px; cursor:pointer;">
                🌐 SWITCH TO VIRTUAL EXPLORATION
              </button>
            </div>
          </div>
        `;

        container.querySelector('#btn-geofence-switch-virtual')?.addEventListener('click', () => {
          sound.playChime();
          closeOptionModal('modal-opt-physical-geofence');
          viewModeSelection.classList.add('gms-view-hidden');
          viewVirtualHub.classList.remove('gms-view-hidden');
        });

      }
    } catch (err) {
      container.innerHTML = `
        <div style="text-align:center; padding:12px;">
          <div style="font-size:32px; margin-bottom:6px;">📡❌</div>
          <h4 style="color:#ef4444; margin:0 0 6px 0;">GPS Signal Unavailable</h4>
          <p style="color:#d1d5db; font-size:12px; margin:0 0 12px 0;">${err.message || 'Unable to retrieve location.'}</p>
          <button type="button" id="btn-geofence-switch-virtual-err" style="width:100%; background:linear-gradient(135deg, #d4af37, #f59e0b); color:#000; border:none; padding:12px; border-radius:10px; font-weight:bold; font-size:12px; cursor:pointer;">
            🌐 SWITCH TO VIRTUAL EXPLORATION
          </button>
        </div>
      `;
      container.querySelector('#btn-geofence-switch-virtual-err')?.addEventListener('click', () => {
        sound.playChime();
        closeOptionModal('modal-opt-physical-geofence');
        viewModeSelection.classList.add('gms-view-hidden');
        viewVirtualHub.classList.remove('gms-view-hidden');
      });
    }
  };

  root.querySelector('#gms-btn-physical-mode')?.addEventListener('click', () => {
    sound.playTap();
    runGeofenceCheck();
  });

  // Modal helpers
  const openOptionModal = (modalId) => {
    sound.playTap();
    const modal = root.querySelector(`#${modalId}`);
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => {
        modal.classList.add('open');
      });
      if (modalId === 'modal-opt-3d') {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          const mv = modal.querySelector('model-viewer');
          if (mv && !mv._has3DListeners) {
            mv._has3DListeners = true;
            
            // 💡 NEW LOGIC: Tapping (not dragging) changes the model — fires only once!
            let _pointerMoved = false;
            mv.addEventListener('pointerdown', () => { _pointerMoved = false; });
            mv.addEventListener('pointermove', () => { _pointerMoved = true; });
            mv.addEventListener('click', () => {
                // Ignore clicks that were actually drag rotations
                if (_pointerMoved) return;
                // Only show the toast and swap model the first time
                if (!mv._modelUnlocked) {
    mv._modelUnlocked = true;

    // Only Konark has the second "actual temple" model.
    if (site.id === 'konark' || site.id === 'sun_temple') {
        mv.src = '/src/assets/models/actual_temple.glb';

        if (appState && appState.showToast) {
            appState.showToast(
                "Actual Konark Temple Model Unlocked! 🏛️",
                "success"
            );
        }
    } else if (site.id === 'taj_mahal') {
        if (appState && appState.showToast) {
            appState.showToast(
                "Taj Mahal 3D Model Opened! 🕌",
                "success"
            );
        }
    }
}
            });

            const pBar = modal.querySelector('#heritage-3d-progress-bar');
            const pText = modal.querySelector('#heritage-3d-loading-text');
            mv.addEventListener('progress', (e) => {
              const pct = Math.round((e.detail.totalProgress || 0) * 100);
              if (pBar) pBar.style.width = `${pct}%`;
              if (pText) pText.textContent = `Loading 3D Model: ${pct}%`;
            });
            mv.addEventListener('load', () => {
              console.log('✓ Konark Sun Temple 3D GLB model loaded successfully');
              if (pText) pText.textContent = 'Model Loaded!';
              if (typeof mv.dismissPoster === 'function') {
                mv.dismissPoster();
              }
            });
            mv.addEventListener('error', (err) => {
              console.error('3D Model failed to load:', err);
              if (pText) pText.textContent = 'Unable to load 3D model. Please try again.';
              if (pBar) pBar.style.background = '#ef4444';
            });
          }
        }, 80);
      }
    }
  };

  const closeOptionModal = (modalId) => {
    if (modalId === 'modal-opt-chronicles') {
      const vid = root.querySelector('#konark-chronicles-video');
      if (vid) {
        vid.pause();
        vid.currentTime = 0;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    const modal = root.querySelector(`#${modalId}`);
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        if (!modal.classList.contains('open')) {
          modal.style.display = 'none';
        }
      }, 280);
    }
  };

  // Wire close buttons & backdrop click
  root.querySelectorAll('.vmodal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playTap();
      closeOptionModal(btn.dataset.close);
    });
  });

  root.querySelectorAll('.vmodal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeOptionModal(modal.id);
      }
    });
  });

  // Wire 5 Virtual Option Cards
  root.querySelector('#btn-opt-3d')?.addEventListener('click', () => openOptionModal('modal-opt-3d'));
  root.querySelector('#btn-opt-knowledge')?.addEventListener('click', () => openOptionModal('modal-opt-knowledge'));
  root.querySelector('#btn-opt-chronicles')?.addEventListener('click', () => {
    if (site.id === 'sun_temple' || site.id === 'konark') {
      const vidView = root.querySelector('#konark-chronicles-video-view');
      const galView = root.querySelector('#konark-chronicles-gallery-view');
      if (vidView) vidView.style.display = 'block';
      if (galView) galView.style.display = 'none';
      openOptionModal('modal-opt-chronicles');
      const vid = root.querySelector('#konark-chronicles-video');
      if (vid) {
        vid.currentTime = 0;
        vid.pause();
      }
    } else {
      openOptionModal('modal-opt-chronicles');
    }
  });
  root.querySelector('#btn-opt-arrange')?.addEventListener('click', () => openOptionModal('modal-opt-arrange'));

  // Wire 3 Physical Option Cards (camera auto-start is wired below in camera section)
  root.querySelector('#btn-opt-phys-quiz')?.addEventListener('click', () => {
    currentQuizIndex = 0;
    quizScore = 0;
    renderQuizQuestion();
    openOptionModal('modal-opt-quiz');
  });
  root.querySelector('#btn-opt-phys-arrange')?.addEventListener('click', () => openOptionModal('modal-opt-arrange'));

  // Option 1: View 3D finish
  const btn3d = root.querySelector('#btn-complete-3d');
  if (btn3d) {
    const mid3d = `3d_tour_${site.id}`;
    if (appState.hasMissionCompleted(mid3d)) {
      btn3d.textContent = '✅ XP Already Claimed';
      btn3d.disabled = true;
      btn3d.style.opacity = '0.55';
      btn3d.style.cursor = 'not-allowed';
    }
    btn3d.addEventListener('click', () => {
      sound.playChime();
      closeOptionModal('modal-opt-3d');
      const claimed = appState.recordMissionCompletion(mid3d, 150, site);
      if (claimed) {
        btn3d.textContent = '✅ XP Already Claimed';
        btn3d.disabled = true;
        btn3d.style.opacity = '0.55';
        btn3d.style.cursor = 'not-allowed';
      }
    });
  }

  // Option 2: Knowledge Study complete
  const btnKnowledge = root.querySelector('#btn-complete-knowledge');
  if (btnKnowledge) {
    const midKnowledge = `knowledge_${site.id}`;
    if (appState.hasMissionCompleted(midKnowledge)) {
      btnKnowledge.textContent = '✅ XP Already Claimed';
      btnKnowledge.disabled = true;
      btnKnowledge.style.opacity = '0.55';
      btnKnowledge.style.cursor = 'not-allowed';
    }
    btnKnowledge.addEventListener('click', () => {
      sound.playChime();
      closeOptionModal('modal-opt-knowledge');
      const claimed = appState.recordMissionCompletion(midKnowledge, 200, site);
      if (claimed) {
        btnKnowledge.textContent = '✅ XP Already Claimed';
        btnKnowledge.disabled = true;
        btnKnowledge.style.opacity = '0.55';
        btnKnowledge.style.cursor = 'not-allowed';
      }
    });
  }

  // Option 3: Chronicles (Interactive Audio & Story Saga)
  let activeChronicleIdx = 0;
  let isSpeaking = false;

  const currentChronicles = siteChroniclesData[site.id] || siteChroniclesData.sun_temple;
  const chroniclesTabsBar = root.querySelector('#chronicles-tabs-bar');
  const chroniclesStoryBox = root.querySelector('#chronicles-story-box');
  const speakBtn = root.querySelector('#btn-chronicles-speak');
  const speakIcon = root.querySelector('#chronicles-speak-icon');
  const speakText = root.querySelector('#chronicles-speak-text');
  const speakStatus = root.querySelector('#chronicles-audio-status');

  const stopAudioNarration = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    if (speakIcon) speakIcon.textContent = '🔊';
    if (speakText) speakText.textContent = 'Listen Narration';
    if (speakStatus) speakStatus.textContent = 'Narration Paused';
  };

  const startAudioNarration = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      appState.showToast("Audio speech narration not supported on this browser.", "info");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => {
      isSpeaking = true;
      if (speakIcon) speakIcon.textContent = '⏹';
      if (speakText) speakText.textContent = 'Stop Narration';
      if (speakStatus) speakStatus.textContent = '🎙️ Narrating Story...';
    };
    utterance.onend = () => {
      isSpeaking = false;
      if (speakIcon) speakIcon.textContent = '🔊';
      if (speakText) speakText.textContent = 'Listen Narration';
      if (speakStatus) speakStatus.textContent = '✓ Narration Finished';
    };
    utterance.onerror = () => {
      isSpeaking = false;
      if (speakIcon) speakIcon.textContent = '🔊';
      if (speakText) speakText.textContent = 'Listen Narration';
      if (speakStatus) speakStatus.textContent = 'AI Narrator Ready';
    };
    window.speechSynthesis.speak(utterance);
  };

  const renderChronicleStory = (idx) => {
    activeChronicleIdx = idx;
    stopAudioNarration();
    const ch = currentChronicles.chapters[idx];
    if (!ch || !chroniclesStoryBox) return;

    // Update tab active styling
    chroniclesTabsBar?.querySelectorAll('.chronicle-tab-btn').forEach((b, i) => {
      if (i === idx) b.classList.add('active');
      else b.classList.remove('active');
    });

    chroniclesStoryBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="chronicle-header-badge">EPISODE 0${idx + 1} &bull; ${ch.era}</span>
        <span style="font-size:20px;">${ch.icon}</span>
      </div>
      <h3 class="chronicle-title">${ch.title}</h3>
      <div class="chronicle-quote">${ch.quote}</div>
      <p class="chronicle-body">${ch.story}</p>
      <div class="chronicle-highlights-box">
        <div class="chronicle-highlights-title">⭐ Historical Highlights:</div>
        <ul class="chronicle-highlights-list">
          ${ch.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </div>
      <div class="chronicle-takeaway">
        <strong>📜 Key Takeaway:</strong> ${ch.takeaway}
      </div>
    `;

    if (speakStatus) speakStatus.textContent = `Episode 0${idx + 1} Ready`;
  };

  // Wire Chronicle Chapter Tabs
  if (chroniclesTabsBar && currentChronicles?.chapters) {
    chroniclesTabsBar.innerHTML = currentChronicles.chapters.map((ch, i) => `
      <button type="button" class="chronicle-tab-btn ${i === 0 ? 'active' : ''}" data-idx="${i}">
        <span>${ch.icon} Ep 0${i + 1}</span>
      </button>
    `).join('');

    chroniclesTabsBar.querySelectorAll('.chronicle-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playTap();
        const idx = parseInt(btn.dataset.idx, 10);
        renderChronicleStory(idx);
      });
    });
  }

  // Wire speech button
  speakBtn?.addEventListener('click', () => {
    sound.playTap();
    if (isSpeaking) {
      stopAudioNarration();
    } else {
      const ch = currentChronicles.chapters[activeChronicleIdx];
      if (ch) {
        const fullNarrative = `${ch.title}. ${ch.quote}. ${ch.story}. Key Takeaway: ${ch.takeaway}`;
        startAudioNarration(fullNarrative);
      }
    }
  });

  // Wire complete chronicles button
  const btnChronicles = root.querySelector('#btn-complete-chronicles');
  if (btnChronicles) {
    const midChronicles = `chronicles_${site.id}`;
    if (appState.hasMissionCompleted(midChronicles)) {
      btnChronicles.textContent = '✅ XP Already Claimed';
      btnChronicles.disabled = true;
      btnChronicles.style.opacity = '0.55';
      btnChronicles.style.cursor = 'not-allowed';
    }
    btnChronicles.addEventListener('click', () => {
      sound.playChime();
      stopAudioNarration();
      closeOptionModal('modal-opt-chronicles');
      const claimed = appState.recordMissionCompletion(midChronicles, 250, site);
      if (claimed) {
        btnChronicles.textContent = '✅ XP Already Claimed';
        btnChronicles.disabled = true;
        btnChronicles.style.opacity = '0.55';
        btnChronicles.style.cursor = 'not-allowed';
      }
    });
  }

  // ── Konark Chronicles Next / Back / Pictures Gallery Wiring ──
  const konarkVideoView = root.querySelector('#konark-chronicles-video-view');
  const konarkGalleryView = root.querySelector('#konark-chronicles-gallery-view');
  const konarkNextBtn = root.querySelector('#btn-konark-chronicles-next');
  const konarkBackBtn = root.querySelector('#btn-konark-chronicles-back');
  const konarkPicsContainer = root.querySelector('#konark-chronicles-pics-container');

  // Array to hold user's pictures for Konark Chronicles
  const konarkChroniclesImages = [
    { src: '/src/assets/1.jpeg', caption: 'Konark Sun Temple • Historical Archive I' },
    { src: '/src/assets/2.jpeg', caption: 'Konark Sun Temple • Historical Archive II' },
    { src: '/src/assets/3.jpeg', caption: 'Konark Sun Temple • Historical Archive III' },
    { src: '/src/assets/4.jpeg', caption: 'Konark Sun Temple • Historical Archive IV' },
    { src: '/src/assets/5.jpeg', caption: 'Konark Sun Temple • Historical Archive V' }
  ];

  const renderKonarkPics = () => {
    if (!konarkPicsContainer) return;
    const imagesToRender = window._konarkChroniclesImages || konarkChroniclesImages;
    if (!imagesToRender || imagesToRender.length === 0) {
      konarkPicsContainer.innerHTML = `
        <div style="text-align:center; padding:32px 16px; background:rgba(0,0,0,0.35); border:1.5px dashed rgba(212,175,55,0.3); border-radius:12px;">
          <div style="font-size:36px; margin-bottom:8px;">🖼️</div>
          <h4 style="color:#ffd700; margin:0 0 6px 0; font-size:14px;">Historical Visual Archive</h4>
          <p style="color:#94a3b8; font-size:11px; margin:0; line-height:1.4;">
            Photo gallery is ready for your pictures.
          </p>
        </div>
      `;
    } else {
      konarkPicsContainer.innerHTML = imagesToRender.map((img, i) => {
        const src = typeof img === 'string' ? img : img.src;
        const caption = typeof img === 'object' && img.caption ? img.caption : `Konark Sun Temple Archive #${i + 1}`;
        return `
          <div class="konark-pic-card" style="flex-shrink:0; width:100%; margin-bottom:4px; background:rgba(18,14,10,0.95); border:1.5px solid rgba(212,175,55,0.35); border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.85);">
            <div style="padding:8px 12px; font-size:10.5px; font-weight:800; color:#fae4a8; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(212,175,55,0.2);">
              <span>${caption}</span>
              <span style="font-size:9px; color:#d4af37; background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.35); padding:2px 6px; border-radius:3px;">PHOTO 0${i + 1} / 0${imagesToRender.length}</span>
            </div>
            <div style="width:100%; background:#000; display:block;">
              <img 
                src="${src}" 
                alt="${caption}" 
                loading="lazy"
                style="width:100%; height:auto; display:block; object-fit:contain;" 
              />
            </div>
          </div>
        `;
      }).join('');
    }
  };

  konarkNextBtn?.addEventListener('click', () => {
    sound.playTap();
    const vid = root.querySelector('#konark-chronicles-video');
    if (vid) vid.pause();
    if (konarkVideoView) konarkVideoView.style.display = 'none';
    if (konarkGalleryView) {
      konarkGalleryView.style.display = 'flex';
      renderKonarkPics();
    }
  });

  konarkBackBtn?.addEventListener('click', () => {
    sound.playTap();
    if (konarkGalleryView) konarkGalleryView.style.display = 'none';
    if (konarkVideoView) {
      konarkVideoView.style.display = 'block';
      const vid = root.querySelector('#konark-chronicles-video');
      if (vid) vid.play().catch(() => {});
    }
  });

  // ══════════════════════════════════════════════════════════
  // IN-GAME CAMERA STREAM & AI VISION VERIFICATION
  // ══════════════════════════════════════════════════════════
  let cameraStream = null;

  const videoEl = root.querySelector('#camera-video-stream');
  const previewImg = root.querySelector('#camera-photo-preview');
  const placeholderEl = root.querySelector('#camera-placeholder-msg');
  const reticleEl = root.querySelector('#camera-reticle');
  const canvasEl = root.querySelector('#camera-snapshot-canvas');
  const captureVerifyBtn = root.querySelector('#btn-camera-capture-verify');
  const resultBox = root.querySelector('#camera-result-box');

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    if (videoEl) videoEl.style.display = 'none';
    if (reticleEl) reticleEl.style.display = 'none';
  };

  // Auto-start camera when modal opens
  const startCameraStream = async () => {
    if (previewImg) previewImg.style.display = 'none';
    if (resultBox) resultBox.style.display = 'none';
    if (placeholderEl) {
      placeholderEl.style.display = 'block';
      placeholderEl.innerHTML = `
        <div style="font-size:30px; margin-bottom:6px; animation:gmsBgGlow 1s infinite alternate;">📡</div>
        <div style="color:#ffd700; font-weight:bold; font-size:12px; margin-bottom:4px;">Activating Camera...</div>
        <div style="font-size:10.5px; color:#a1a1aa;">Please allow camera permission</div>
      `;
    }
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
        if (videoEl) {
          videoEl.srcObject = cameraStream;
          videoEl.style.display = 'block';
        }
        if (placeholderEl) placeholderEl.style.display = 'none';
        if (reticleEl) reticleEl.style.display = 'block';
        appState.showToast("🎥 Camera ready! Aim at the monument and click photo.", "info");
      } else {
        throw new Error("Camera not supported.");
      }
    } catch (err) {
      console.warn("Camera stream error:", err);
      if (placeholderEl) {
        placeholderEl.style.display = 'block';
        placeholderEl.innerHTML = `
          <div style="font-size:32px; margin-bottom:4px;">⚠️</div>
          <div style="color:#f87171; font-weight:bold; font-size:12px;">Camera unavailable or permission denied</div>
          <div style="font-size:10.5px; color:#a1a1aa; margin-top:4px;">Enable camera access in your browser settings and reopen this.</div>
        `;
      }
    }
  };

  // Close camera modal → stop stream
  root.querySelector('#btn-close-camera')?.addEventListener('click', stopCameraStream);

  // Open camera modal → auto-start stream
  root.querySelector('#btn-opt-phys-camera')?.addEventListener('click', () => {
    openOptionModal('modal-opt-camera');
    setTimeout(() => startCameraStream(), 300);
  });

  // Capture frame from video & run AI verification
  captureVerifyBtn?.addEventListener('click', async () => {
    sound.playTap();

    let imageToVerify = null;

    // Capture live video snapshot to canvas
    if (cameraStream && videoEl && videoEl.videoWidth) {
      if (canvasEl) {
        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        const ctx = canvasEl.getContext('2d');
        ctx.drawImage(videoEl, 0, 0);
        imageToVerify = canvasEl.toDataURL('image/jpeg', 0.85);

        // Freeze frame preview
        stopCameraStream();
        if (previewImg) {
          previewImg.src = imageToVerify;
          previewImg.style.display = 'block';
        }
      }
    }

    if (!imageToVerify) {
      appState.showToast("⚠️ Camera not ready! Please wait for camera to load.", "error");
      return;
    }

    if (!resultBox) return;
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div style="text-align:center; padding:8px 0;">
        <div style="font-size:28px; animation:gmsBgGlow 0.9s infinite alternate;">🔍</div>
        <div style="color:#ffd700; font-weight:bold; font-size:13px; margin:6px 0 2px 0;">AI Vision Analyzing Architectural Geometry...</div>
        <div style="font-size:10.5px; color:#9ca3af;">Checking structural features against verified ${site.name} archives</div>
      </div>
    `;

    try {
      const result = await verifyHeritagePhoto({
        imageBase64: imageToVerify,
        siteId: site.id,
        siteName: site.name
      });

      if (result.isMatch) {
        sound.playChime();
        resultBox.innerHTML = `
          <div style="text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="background:rgba(34,197,94,0.2); color:#4ade80; border:1px solid #22c55e; padding:3px 9px; border-radius:12px; font-size:11px; font-weight:800;">
                ✓ HERITAGE SITE VERIFIED (${result.confidence}% Match)
              </span>
              <span style="color:#ffd700; font-size:11px; font-weight:bold;">⭐ +500 XP</span>
            </div>
            <p style="color:#e2d5b0; font-size:12px; line-height:1.45; margin:0 0 8px 0;">
              ${result.feedback}
            </p>
            ${result.detectedFeatures && result.detectedFeatures.length ? `
              <div style="font-size:10px; color:#9ca3af; line-height:1.4;">
                <strong>Identified Features:</strong> ${result.detectedFeatures.join(' • ')}
              </div>
            ` : ''}
          </div>
        `;
        appState.recordMissionCompletion(`photo_${site.id}`, 500, site);
      } else {
        sound.playError();
        resultBox.innerHTML = `
          <div style="text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="background:rgba(239,68,68,0.2); color:#f87171; border:1px solid #ef4444; padding:3px 9px; border-radius:12px; font-size:11px; font-weight:800;">
                ⚠️ MONUMENT NOT CONFIRMED (${result.confidence}% Match)
              </span>
            </div>
            <p style="color:#d1d5db; font-size:11.8px; line-height:1.4; margin:0;">
              ${result.feedback}
            </p>
            <div style="font-size:10px; color:#9ca3af; margin-top:6px;">
              Tip: Position the camera directly facing the main facade or prominent stone carvings.
            </div>
          </div>
        `;
      }
    } catch (err) {
      resultBox.innerHTML = `
        <div style="color:#f87171; font-size:11.5px; text-align:center;">
          Verification service error: ${err.message || 'Please try again.'}
        </div>
      `;
    }
  });

  // ══════════════════════════════════════════════════════════
  // QUIZ LOGIC (6 Multi-questions)
  // ══════════════════════════════════════════════════════════
  let quizScore = 0;
  const quizFeedback = root.querySelector('#quiz-feedback');
  const quizCounter = root.querySelector('#quiz-counter');
  const quizScoreBadge = root.querySelector('#quiz-score-badge');
  const quizOdiaWrap = root.querySelector('#quiz-odia-wrap');
  const quizOdiaText = root.querySelector('#quiz-odia-text');
  const quizQtext = root.querySelector('#quiz-qtext');
  const quizOptWrap = root.querySelector('#quiz-options-wrap');
  const quizNextBtn = root.querySelector('#quiz-next-btn');
  const quizNextLbl = root.querySelector('#quiz-next-label');

  const renderQuizQuestion = () => {
    currentQuiz = siteQuizList[currentQuizIndex];
    quizCounter.textContent = `QUESTION ${currentQuizIndex + 1} OF ${siteQuizList.length}`;
    if (quizScoreBadge) quizScoreBadge.textContent = `XP: +${quizScore}`;
    quizQtext.textContent = currentQuiz.question;

    if (currentQuiz.localLanguageTerm) {
      quizOdiaWrap.style.display = 'block';
      quizOdiaText.textContent = currentQuiz.localLanguageTerm;
    } else {
      quizOdiaWrap.style.display = 'none';
    }

    quizOptWrap.innerHTML = currentQuiz.options.map((opt, idx) => `
      <button type="button" class="quiz-opt-btn" data-idx="${idx}">
        <span class="qopt-letter">${String.fromCharCode(65 + idx)}</span>
        <span class="qopt-text">${opt}</span>
      </button>
    `).join('');

    quizFeedback.style.display = 'none';
    quizNextBtn.style.display = 'none';

    quizOptWrap.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedIdx = parseInt(btn.dataset.idx, 10);
        const isCorrect = selectedIdx === currentQuiz.correct;

        quizOptWrap.querySelectorAll('.quiz-opt-btn').forEach(b => {
          b.disabled = true;
          const idx = parseInt(b.dataset.idx, 10);
          if (idx === currentQuiz.correct) b.classList.add('correct');
          else if (b === btn && !isCorrect) b.classList.add('wrong');
        });

        const citationHtml = currentQuiz.sourceUrl ? `
          <div style="margin-top:6px; font-size:9.5px; color:#888; border-top:1px solid rgba(255,255,255,0.1); padding-top:4px;">
            📜 <em>Verified Source:</em> <strong>${currentQuiz.verifiedSource || 'ASI / UNESCO'}</strong>
            <a href="${currentQuiz.sourceUrl}" target="_blank" style="color:#38bdf8; margin-left:4px; text-decoration:underline;">[View Source]</a>
          </div>
        ` : '';

        if (isCorrect) {
          sound.playChime();
          quizScore += 50;
          if (quizScoreBadge) quizScoreBadge.textContent = `XP: +${quizScore}`;
          quizFeedback.style.display = 'block';
          quizFeedback.style.background = 'rgba(16,185,129,.15)';
          quizFeedback.style.border = '1px solid rgba(16,185,129,.4)';
          quizFeedback.style.color = '#6ee7b7';
          quizFeedback.innerHTML = `<strong>✨ Correct! (+50 XP)</strong><br>${currentQuiz.fact}${citationHtml}`;
        } else {
          sound.playTap();
          quizFeedback.style.display = 'block';
          quizFeedback.style.background = 'rgba(239,68,68,.15)';
          quizFeedback.style.border = '1px solid rgba(239,68,68,.4)';
          quizFeedback.style.color = '#fca5a5';
          quizFeedback.innerHTML = `<strong>❌ Not quite!</strong><br>${currentQuiz.fact}${citationHtml}`;
        }

        quizNextBtn.style.display = 'block';
        const isLast = currentQuizIndex >= siteQuizList.length - 1;
        quizNextLbl.textContent = isLast ? `FINISH 6-QUESTION QUIZ (+${quizScore} XP)` : 'NEXT QUESTION →';
      });
    });
  };

  quizNextBtn?.addEventListener('click', () => {
    sound.playTap();
    const isLast = currentQuizIndex >= siteQuizList.length - 1;
    if (isLast) {
      const midQuiz = `quiz_${site.id}`;
      closeOptionModal('modal-opt-quiz');
      // Guard: only award XP on first completion
      if (!appState.hasMissionCompleted(midQuiz)) {
        appState.recordMissionCompletion(midQuiz, quizScore, site);
      } else {
        appState.showToast('✅ Quiz already completed! No extra XP awarded.', 'info', 3000);
      }
      currentQuizIndex = 0;
      quizScore = 0;
    } else {
      currentQuizIndex++;
      renderQuizQuestion();
    }
  });

  root.querySelector('#btn-opt-quiz')?.addEventListener('click', () => {
    currentQuizIndex = 0;
    quizScore = 0;
    renderQuizQuestion();
    openOptionModal('modal-opt-quiz');
  });

  // Option 4: Arrange Swap Logic
  let selectedTile = null;

  root.querySelectorAll('.arrange-item').forEach(item => {
    item.addEventListener('click', () => {
      sound.playTap();
      if (!selectedTile) {
        selectedTile = item;
        item.classList.add('selected');
      } else if (selectedTile === item) {
        selectedTile.classList.remove('selected');
        selectedTile = null;
      } else {
        const tempHTML = selectedTile.innerHTML;
        const tempId = selectedTile.dataset.id;
        
        selectedTile.innerHTML = item.innerHTML;
        selectedTile.dataset.id = item.dataset.id;
        
        item.innerHTML = tempHTML;
        item.dataset.id = tempId;

        selectedTile.classList.remove('selected');
        selectedTile = null;
      }
    });
  });

  const btnArrange = root.querySelector('#btn-verify-arrange');
  if (btnArrange) {
    const midArrange = `arrange_${site.id}`;
    if (appState.hasMissionCompleted(midArrange)) {
      btnArrange.textContent = '✅ XP Already Claimed';
      btnArrange.disabled = true;
      btnArrange.style.opacity = '0.55';
      btnArrange.style.cursor = 'not-allowed';
    }
    btnArrange.addEventListener('click', () => {
      sound.playChime();
      closeOptionModal('modal-opt-arrange');
      const claimed = appState.recordMissionCompletion(midArrange, 250, site);
      if (claimed) {
        btnArrange.textContent = '✅ XP Already Claimed';
        btnArrange.disabled = true;
        btnArrange.style.opacity = '0.55';
        btnArrange.style.cursor = 'not-allowed';
      }
    });
  }

  // ── AI PROMPTS DATA ──
  const aiPrompts = {
    hub: [
      { ico: '🏛️', text: `What is the history of ${site.name}?` },
      { ico: '🎨', text: `Describe the architecture of ${site.name}` },
      { ico: '📖', text: `What is the cultural significance of ${site.name}?` },
      { ico: '🌍', text: `Why was ${site.name} named a UNESCO site?` },
    ],
    mission: [
      { ico: '🗺️', text: `Give me a hint for surveying the outer perimeter of ${site.name}` },
      { ico: '🔍', text: `What kind of inscriptions exist at ${site.name}?` },
      { ico: '📜', text: `Tell me about the builder of ${site.name}` },
    ],
    chronicles: [
      { ico: '📜', text: `Tell me the legendary builder folklore of ${site.name}` },
      { ico: '👑', text: `What heroic legends are associated with ${site.name}?` },
      { ico: '✨', text: `Narrate the ancient historical saga of ${site.name}` },
    ],
    quiz: [
      { ico: '💡', text: `Give me a clue about the 8 major spokes` },
      { ico: '📚', text: `What does the Gajasimha lion represent?` },
      { ico: '🏆', text: `What makes Konark wheels tell exact time?` },
    ],
    arrange: [
      { ico: '⏳', text: `Explain the timeline of construction of ${site.name}` },
      { ico: '🧱', text: `What were the major phases of ${site.name}'s history?` },
      { ico: '📅', text: `Which era is most important in ${site.name}'s story?` },
    ],
  };

  // ── AI KNOWLEDGE BASE FOR DYNAMIC CONVERSATION ──
  const getAIResponse = (query, currentContext) => {
    const q = query.toLowerCase().trim();

    // ── TAJ MAHAL ──────────────────────────────────────────────────────────
    if (site.id === 'taj_mahal') {
      if (q.includes('who') || q.includes('built') || q.includes('shah jahan') || q.includes('commission') || q.includes('builder')) {
        return `The Taj Mahal was commissioned by the Mughal Emperor **Shah Jahan** in 1632 in memory of his beloved wife **Mumtaz Mahal**. Over 20,000 artisans contributed to its construction over 22 years!`;
      }
      if (q.includes('material') || q.includes('marble') || q.includes('stone') || q.includes('makrana')) {
        return `It is crafted from translucent **white Makrana marble** brought from Rajasthan, intricately inlaid with semi-precious stones (pietra dura) such as lapis lazuli, jade, and crystal.`;
      }
      if (q.includes('architecture') || q.includes('dome') || q.includes('minaret') || q.includes('design') || q.includes('structure')) {
        return `The Taj Mahal features symmetrical Mughal architecture with a massive central onion dome (35m tall), four tilting minarets designed to fall outward in earthquakes, and Persian charbagh gardens!`;
      }
      if (q.includes('garden') || q.includes('charbagh') || q.includes('symmetry')) {
        return `The **Charbagh garden** (four-fold Persian garden) leads up to the mausoleum with water channels creating perfect symmetry. The Taj sits at the far north end beside the Yamuna — not at the garden centre.`;
      }
      if (q.includes('pietra dura') || q.includes('inlay') || q.includes('decoration') || q.includes('artwork')) {
        return `The Taj Mahal uses **Pietra Dura** — the art of inlaying semi-precious stones (jade, lapis lazuli, turquoise, crystal) into white marble in intricate floral and geometric patterns, brought by Persian master artisans.`;
      }
      if (q.includes('year') || q.includes('when') || q.includes('1632') || q.includes('1653') || q.includes('built')) {
        return `Construction began in **1632** and the main mausoleum was completed by **1648**. The entire complex (mosque, guest house, gardens) was finished around **1653**, taking 22 years!`;
      }
      if (q.includes('unesco') || q.includes('world heritage') || q.includes('why')) {
        return `The Taj Mahal was inscribed as a **UNESCO World Heritage Site in 1983**, recognized for its outstanding Mughal architecture, exceptional aesthetic qualities, bilateral symmetry, and extraordinary craftsmanship.`;
      }
    }

    // ── KONARK SUN TEMPLE ──────────────────────────────────────────────────
    else if (site.id === 'sun_temple') {
      // Builder/Dynasty
      if (q.includes('who') || q.includes('built') || q.includes('narasimha') || q.includes('king') || q.includes('dynasty') || q.includes('builder') || q.includes('commission')) {
        return `The Konark Sun Temple was built around **1250 CE** by **King Narasimhadeva I** of the **Eastern Ganga Dynasty** of Odisha, as a grand offering to the Sun God **Surya**. It took an estimated 12 years and thousands of skilled artisans.`;
      }
      // Wheels / Sundial / Time
      if (q.includes('wheel') || q.includes('sundial') || q.includes('time') || q.includes('chaka') || q.includes('spoke') || q.includes('24') || q.includes('clock')) {
        return `The temple has **24 intricately carved stone wheels** arranged in 12 pairs. Each wheel functions as a **precise sundial** — the 8 major spokes divide the day into 8 Prahars (3-hour watches), and the 16 sub-spokes indicate minutes, allowing you to tell time accurate to within 3 minutes!`;
      }
      // Horses
      if (q.includes('horse') || q.includes('seven') || q.includes('7 horse') || q.includes('chariot horse')) {
        return `**Seven spirited stone horses** pull the temple chariot, representing the **7 days of the week** (Ravi, Soma, Mangal, Budha, Guru, Shukra, Shani). They gallop eastward toward the rising sun, symbolizing Surya's daily journey across the sky.`;
      }
      // Black Pagoda / Sailors
      if (q.includes('black pagoda') || q.includes('sailor') || q.includes('navigation') || q.includes('magnet') || q.includes('lodestone')) {
        return `European sailors called the Konark temple **"The Black Pagoda"** because the dark oxidized iron-rich stones made it appear black from sea, and it served as a **navigation landmark** along the Odisha coast. Some accounts claim a powerful **lodestone** magnet at the apex attracted iron nails from ships!`;
      }
      // Natya Mandapa / Dance / Odissi
      if (q.includes('dance') || q.includes('natya') || q.includes('mandapa') || q.includes('odissi') || q.includes('dancer') || q.includes('music')) {
        return `The **Natya Mandapa (ନାଟ୍ୟ ମଣ୍ଡପ — Dance Hall)** at Konark is carved with **128 celestial dancers** (Apsaras) and musicians playing Mardala drums and flutes, depicting the pure origins of classical **Odissi dance**. This hall was used for sacred ritual performances.`;
      }
      // Gajasimha / Lion / Elephant
      if (q.includes('gajasimha') || q.includes('lion') || q.includes('elephant') || q.includes('gaja') || q.includes('simha')) {
        return `The **Gajasimha (ଗଜସିଂହ — Lion-Elephant)** motif portrays a fierce lion crushing an elephant, symbolizing **spiritual wisdom and divine power subduing ego, desire, and worldly ignorance**. These guardians flank the temple entrance.`;
      }
      // Surya / Sun God
      if (q.includes('surya') || q.includes('sun god') || q.includes('deity') || q.includes('dedicated') || q.includes('worship')) {
        return `The temple is dedicated to **Surya (ସୂର୍ଯ୍ୟ — the Sun God)**, the life-giver of the universe. Three primary sculptures of Surya — facing east (dawn), south (noon), and west (dusk) — are positioned so that the first light of the sun illuminates each image at its specific time of day!`;
      }
      // Architecture / Chariot / Kalinga / Deul
      if (q.includes('architecture') || q.includes('chariot') || q.includes('kalinga') || q.includes('deul') || q.includes('jagamohana') || q.includes('structure') || q.includes('design')) {
        return `The temple follows **Kalinga architecture** and is designed as a massive **stone chariot (Ratha)** with 12 pairs of wheels and 7 horses. It has a **Deul (main tower/sanctum)**, **Jagamohana (assembly hall)**, **Natya Mandapa (dance hall)**, and **Bhog Mandapa (offering hall)**. The Deul collapsed centuries ago.`;
      }
      // UNESCO
      if (q.includes('unesco') || q.includes('world heritage') || q.includes('why') || q.includes('recognized') || q.includes('1984')) {
        return `The Sun Temple was inscribed as a **UNESCO World Heritage Site in 1984**, recognized for its outstanding **Kalinga temple architecture**, exceptional sculptural programme, and extraordinary solar symbolism as a colossal stone chariot dedicated to Surya.`;
      }
      // Sculpture / Art / Carvings
      if (q.includes('sculpture') || q.includes('carving') || q.includes('art') || q.includes('statue') || q.includes('erotic') || q.includes('mithuna')) {
        return `The temple is covered in an extraordinary sculptural programme — **Mithuna (erotic couples)**, celestial damsels, musicians, war scenes, animals, and deities. The **erotic sculptures** are thought to represent the cycles of life and Tantric philosophy of that era.`;
      }
      // Dharmapada / Legend / Folklore
      if (q.includes('dharmapada') || q.includes('legend') || q.includes('folklore') || q.includes('story') || q.includes('myth') || q.includes('boy')) {
        return `A famous legend tells of **Dharmapada**, the 12-year-old son of the chief architect **Bisu Maharana**, who solved the engineering problem of placing the massive capstone that the 1,200 senior artisans had failed to solve — and then sacrificed himself by leaping from the temple so the mystery of his genius would not dishonor his father.`;
      }
      // Sand inside / engineering
      if (q.includes('sand') || q.includes('fill') || q.includes('inside') || q.includes('engineer') || q.includes('construction') || q.includes('build')) {
        return `One of Konark's greatest engineering feats: the interior of the temple tower was completely **filled with sand** during construction to support the massive stone blocks during assembly. The sand was gradually removed once construction was complete — a technique that allowed the ancient architects to build to extraordinary heights without modern scaffolding!`;
      }
      // Era / When / Year
      if (q.includes('year') || q.includes('when') || q.includes('1250') || q.includes('century') || q.includes('13th') || q.includes('era')) {
        return `The Konark Sun Temple was constructed in the **13th century, around 1250 CE**, during the reign of **King Narasimhadeva I** of the Eastern Ganga Dynasty. It was part of a golden era of Odishan temple architecture.`;
      }
      // Location / Where
      if (q.includes('location') || q.includes('where') || q.includes('odisha') || q.includes('puri') || q.includes('coast') || q.includes('place')) {
        return `The Sun Temple is located at **Konark, Puri district, Odisha**, along India's eastern coast near the Bay of Bengal, approximately 35 km from Puri city. Konark means **"corner of the sun" (Kona = corner, Arka = sun)** in Sanskrit.`;
      }
      // Konark festival
      if (q.includes('festival') || q.includes('dance festival') || q.includes('event')) {
        return `The **Konark Dance Festival** is held every year in December against the backdrop of the illuminated temple. Classical Indian dance forms — Odissi, Bharatanatyam, Kathak, Kuchipudi — are performed on an open-air stage with the ancient temple as a backdrop.`;
      }
    }

    // ── AJANTA & ELLORA ───────────────────────────────────────────────────
    else if (site.id === 'ajanta_ellora') {
      if (q.includes('kailasa') || q.includes('cave 16') || q.includes('monolith') || q.includes('rock')) {
        return `**Kailasa Temple (Cave 16)** at Ellora is the world's largest monolithic rock-cut structure! Carved **top-to-bottom** from a single basalt cliff face by Rashtrakuta artisans under King Krishna I, without using any building materials — 200,000 tonnes of rock were removed.`;
      }
      if (q.includes('ajanta') || q.includes('painting') || q.includes('mural') || q.includes('buddhis') || q.includes('fresco')) {
        return `Ajanta has **30 Buddhist rock-cut caves** famous for vivid fresco-style murals illustrating the **Jataka tales** (previous lives of Gautama Buddha) dating back to the 2nd century BCE. The pigments were made from minerals and are 2,000 years old!`;
      }
      if (q.includes('ellora') || q.includes('hindu') || q.includes('jain') || q.includes('religion') || q.includes('three')) {
        return `Ellora is unique because it contains **34 caves** representing **three religions side by side** — **Buddhist (1–12)**, **Hindu (13–29)**, and **Jain (30–34)** — demonstrating remarkable religious tolerance and coexistence in ancient India.`;
      }
      if (q.includes('who') || q.includes('built') || q.includes('dynasty') || q.includes('commission') || q.includes('builder')) {
        return `Ajanta was patronized mainly by the **Vakataka dynasty** (5th–6th century CE). Ellora was developed over centuries under the **Rashtrakuta dynasty** (Hindu caves), **Chalukyas**, and early Buddhist patrons. The Kailasa Temple was built under King **Krishna I of the Rashtrakutas** around 760 CE.`;
      }
    }

    // ── KAZIRANGA ─────────────────────────────────────────────────────────
    else if (site.id === 'kaziranga') {
      if (q.includes('rhino') || q.includes('animal') || q.includes('wildlife') || q.includes('species') || q.includes('rhinoceros')) {
        return `Kaziranga houses over **2,600 Greater Indian One-Horned Rhinoceroses** — more than **two-thirds of the world's total population**! It also hosts Bengal tigers, wild water buffaloes, Asian elephants, and 478 bird species.`;
      }
      if (q.includes('location') || q.includes('assam') || q.includes('river') || q.includes('where') || q.includes('brahmaputra')) {
        return `Kaziranga is located in the **Golaghat and Nagaon districts of Assam**, alongside the floodplains of the mighty **Brahmaputra River**. The seasonal floods are essential to the ecosystem, replenishing nutrients and maintaining the grasslands.`;
      }
      if (q.includes('history') || q.includes('when') || q.includes('established') || q.includes('founded') || q.includes('curzon')) {
        return `In **1904**, Viceroy Lord Curzon's wife **Lady Curzon** visited Assam and found no rhinos despite searching. Her advocacy led to formal protection. The area became a **National Park in 1974** and a **UNESCO World Heritage Site in 1985**.`;
      }
      if (q.includes('tiger') || q.includes('elephant') || q.includes('buffalo') || q.includes('birds')) {
        return `Kaziranga has one of the **highest densities of Bengal tigers** in the world! It hosts **1,000+ Asian elephants**, **1,500+ wild water buffaloes**, swamp deer, and is an **Important Bird Area (IBA)** with 478 recorded bird species including migratory pelicans and cranes.`;
      }
    }

    // ── UNIVERSAL FALLBACKS ───────────────────────────────────────────────
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('greet')) {
      return `Greetings Explorer! I am your AI Heritage Guide for **${site.name}**. Ask me about the history, architecture, legends, mission tips, or quiz clues!`;
    }
    if (q.includes('hint') || q.includes('clue') || q.includes('help me') || q.includes('stuck')) {
      return `Hint for ${site.name}: ${site.hint}`;
    }
    if (q.includes('quiz') || q.includes('question') || q.includes('test')) {
      return `Quiz challenge for ${site.name}: ${site.quiz}`;
    }

    return null; // no local match — let the API handle it
  };

  // ── Interactive Chat State & UI ──
  const chatMessages = root.querySelector('#ai-chat-messages');
  const chatInput = root.querySelector('#ai-chat-input');
  const chatForm = root.querySelector('#ai-chat-form');
  const chipsWrap = root.querySelector('#ai-drawer-chips');

  const appendChatMessage = (sender, htmlContent) => {
    if (!chatMessages) return;
    const msgEl = document.createElement('div');
    msgEl.className = `ai-msg ${sender === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`;
    msgEl.innerHTML = `
      <div class="ai-msg-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
      <div class="ai-msg-bubble">${htmlContent}</div>
    `;
    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const showTypingIndicator = () => {
    const typingEl = document.createElement('div');
    typingEl.id = 'ai-typing-indicator';
    typingEl.className = 'ai-msg ai-msg-bot';
    typingEl.innerHTML = `
      <div class="ai-msg-avatar">🤖</div>
      <div class="ai-msg-bubble"><span class="ai-typing-dots"><span></span><span></span><span></span></span></div>
    `;
    chatMessages.appendChild(typingEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingEl;
  };

  const handleUserSend = async (text, context = 'hub') => {
    const userText = text.trim();
    if (!userText) return;

    sound.playTap();
    appendChatMessage('user', userText);

    if (chatInput) chatInput.value = '';

    const typingIndicator = showTypingIndicator();

    try {
      const mode = context === 'quiz' ? 'Quiz' : (context === 'mission' ? 'Hint' : (context === 'arrange' ? 'Explain' : 'Ask'));
      const response = await askHeritageAI({
        query: userText,
        siteId: site.id,
        mode: mode,
        language: 'English'
      });

      typingIndicator.remove();
      sound.playChime();

      // First try local smart knowledge base — gives rich site-specific answers
      const localSmartAnswer = getAIResponse(userText, context);
      const finalText = localSmartAnswer || response.text;

      let replyHtml = finalText.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (!localSmartAnswer && response.source && !replyHtml.includes('Source:')) {
        replyHtml += `<div style="font-size:8.5px; color:#9ca3af; margin-top:4px;">📜 <em>Verified by: ${response.source}</em></div>`;
      }
      appendChatMessage('bot', replyHtml);
    } catch (err) {
      typingIndicator.remove();
      // Try local smart knowledge base on failure
      const localSmartAnswer = getAIResponse(userText, context);
      if (localSmartAnswer) {
        sound.playChime();
        const html = localSmartAnswer.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        appendChatMessage('bot', html);
      } else {
        appendChatMessage('bot', `Fascinating question! **${site.name}** (${site.location}) is an architectural and historical treasure. Try asking about its wheels, horses, sundial, builder, architecture, sculptures, legend, or location!`);
      }
    }
  };

  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatInput && chatInput.value.trim()) {
      handleUserSend(chatInput.value);
    }
  });

  root.querySelector('#ai-chat-send')?.addEventListener('click', () => {
    if (chatInput && chatInput.value.trim()) {
      handleUserSend(chatInput.value);
    }
  });

  const openAIDrawer = (context = 'hub') => {
    sound.playTap();

    const prompts = aiPrompts[context] || aiPrompts.hub;
    if (chipsWrap) {
      chipsWrap.innerHTML = prompts.map(p => `
        <button type="button" class="ai-chip" data-prompt="${p.text}">
          <span class="ai-chip-ico">${p.ico}</span>
          <span>${p.text}</span>
        </button>
      `).join('');

      chipsWrap.querySelectorAll('.ai-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const promptText = chip.dataset.prompt;
          handleUserSend(promptText, context);
        });
      });
    }

    if (chatMessages && chatMessages.children.length === 0) {
      appendChatMessage('bot', `Greetings Explorer! I am your AI Heritage Guide for **${site.name}**. Ask me any question, request clues for your activity, or tap a prompt! ✨`);
    }

    openOptionModal('modal-ai-drawer');

    setTimeout(() => {
      chatInput?.focus();
    }, 300);
  };

  root.querySelector('#btn-ai-hub')?.addEventListener('click', () => openAIDrawer('hub'));

  root.querySelectorAll('.vmodal-ai-btn').forEach(btn => {
    btn.addEventListener('click', () => openAIDrawer(btn.dataset.context || 'hub'));
  });

  root.querySelectorAll('[data-close="modal-ai-drawer"]').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playTap();
      closeOptionModal('modal-ai-drawer');
    });
  });

  return root;
}