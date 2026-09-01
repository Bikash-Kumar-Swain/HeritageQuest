/* ==========================================================================
   HeritageQuest — RAG Engine
   Ported from heritagequest_bot/src/utils/ragEngine.ts
   Provides: detectLanguage, classifyTopic, retrieveKnowledgeChunks,
             synthesizeLocalRAGAnswer
   ========================================================================== */

import { KNOWLEDGE_CHUNKS } from './heritageKnowledge.js';

/**
 * Detect whether input is English, Hindi (Devanagari), or Hinglish (Romanized Hindi)
 * @param {string} text
 * @param {string} [override]  'en' | 'hi' | 'hinglish' | 'auto'
 * @returns {'en'|'hi'|'hinglish'}
 */
export function detectLanguage(text, override) {
  if (override && override !== 'auto') {
    return override;
  }

  const trimmed = (text || '').trim();
  if (!trimmed) return 'en';

  // Check for Devanagari script Unicode range (\u0900-\u097F)
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return 'hi';
  }

  // Hinglish vocabulary & grammar indicators in Roman script
  const hinglishTokens = [
    'kya', 'hai', 'hain', 'kahan', 'kaha', 'kaise', 'batao', 'kab', 'kyu', 'kyun',
    'kisne', 'banwaya', 'tha', 'thi', 'the', 'mein', 'me', 'ka', 'ki', 'ke', 'ko',
    'kisko', 'kiska', 'bhi', 'aur', 'gufa', 'gufayein', 'mandir', 'genda', 'janwar',
    'dekhne', 'layak', 'samay', 'aap', 'tum', 'kaun', 'ho', 'hume', 'mujhe', 'khel',
    'bachao', 'bachana', 'shuru', 'chahiye', 'kuchh', 'kitna', 'kitne', 'yeh', 'woh',
    'pe', 'par', 'bana', 'banao', 'kare', 'karein', 'hoga', 'hogi', 'jaise', 'yahan',
    'wahan', 'kaunsi', 'kaunsa', 'shikhar', 'ghode', 'rath', 'surya', 'pathar', 'ajuba'
  ];

  const lower = trimmed.toLowerCase();
  const words = lower.split(/[\s,?.!;:()/'"\\-]+/).filter(Boolean);

  let hinglishCount = 0;
  for (const word of words) {
    if (hinglishTokens.includes(word)) hinglishCount++;
  }

  // If 2 or more Hinglish tokens or ratio is significant
  if (hinglishCount >= 2 || (words.length <= 4 && hinglishCount >= 1)) {
    return 'hinglish';
  }

  return 'en';
}

/**
 * Classify query into one of the 4 heritage sites, general game, or unrelated
 * @param {string} text
 * @returns {'konark'|'taj-mahal'|'ajanta-ellora'|'kaziranga'|'general_game'|'unrelated'}
 */
export function classifyTopic(text) {
  const lower = (text || '').toLowerCase();

  // Konark Sun Temple
  if (
    lower.includes('konark') ||
    lower.includes('कोणार्क') ||
    (lower.includes('sun temple') && !lower.includes('martand')) ||
    lower.includes('सूर्य मंदिर') ||
    lower.includes('surya mandir') ||
    lower.includes('narasimhadeva') ||
    lower.includes('black pagoda') ||
    lower.includes('ब्लैक पैगोडा') ||
    lower.includes('24 wheels') ||
    lower.includes('24 पहिए') ||
    lower.includes('7 horses') ||
    (lower.includes('chariot') && (lower.includes('temple') || lower.includes('sun') || lower.includes('rath')))
  ) {
    return 'konark';
  }

  // Taj Mahal
  if (
    lower.includes('taj mahal') ||
    lower.includes('tajmahal') ||
    lower.includes('ताजमहल') ||
    (lower.includes('taj') && (lower.includes('mahal') || lower.includes('agra') || lower.includes('shah jahan') || lower.includes('mumtaz'))) ||
    lower.includes('shah jahan') ||
    lower.includes('shahjahan') ||
    lower.includes('शाहजहाँ') ||
    lower.includes('mumtaz mahal') ||
    lower.includes('मुमताज़') ||
    lower.includes('pietra dura') ||
    lower.includes('makrana')
  ) {
    return 'taj-mahal';
  }

  // Ajanta & Ellora Caves
  if (
    lower.includes('ajanta') ||
    lower.includes('अजंता') ||
    lower.includes('ellora') ||
    lower.includes('एलोरा') ||
    lower.includes('kailasa') ||
    lower.includes('kailash temple') ||
    lower.includes('कैलाश मंदिर') ||
    lower.includes('padmapani') ||
    lower.includes('पद्मपाणि') ||
    ((lower.includes('cave') || lower.includes('gufa') || lower.includes('गुफा')) &&
      (lower.includes('mural') || lower.includes('fresco') || lower.includes('buddhist') || lower.includes('rock cut') || lower.includes('monolith') || lower.includes('dekhne')))
  ) {
    return 'ajanta-ellora';
  }

  // Kaziranga National Park
  if (
    lower.includes('kaziranga') ||
    lower.includes('काजीरंगा') ||
    lower.includes('rhino') ||
    lower.includes('rhinoceros') ||
    lower.includes('genda') ||
    lower.includes('गैंडा') ||
    lower.includes('one-horned') ||
    lower.includes('one horned') ||
    lower.includes('एक सींग') ||
    (lower.includes('assam') && (lower.includes('park') || lower.includes('national park') || lower.includes('safari') || lower.includes('wildlife'))) ||
    lower.includes('big five') ||
    lower.includes('बिग फाइव')
  ) {
    return 'kaziranga';
  }

  // General game queries
  if (
    lower.includes('save') ||
    lower.includes('load') ||
    lower.includes('settings') ||
    lower.includes('menu') ||
    lower.includes('who are you') ||
    lower.includes('who r u') ||
    lower.includes('aap kaun') ||
    lower.includes('आप कौन') ||
    lower.includes('tum kaun') ||
    lower.includes('khel') ||
    lower.includes('game') ||
    lower.includes('help')
  ) {
    return 'general_game';
  }

  return 'unrelated';
}

/**
 * Retrieve relevant knowledge chunks based on query & topic classification
 * @param {string} query
 * @param {number} [topK=2]
 * @returns {Array}
 */
export function retrieveKnowledgeChunks(query, topK = 2) {
  const lower = (query || '').toLowerCase();
  const tokens = lower.split(/[\s,?.!;:()/'"\\-]+/).filter(w => w.length > 2);
  const topic = classifyTopic(query);

  const scored = KNOWLEDGE_CHUNKS.map(chunk => {
    let score = 0;

    // Direct site match bonus
    if (topic === chunk.siteId) {
      score += 10;
    }

    // Keyword matching
    for (const kw of chunk.keywords) {
      if (lower.includes(kw)) {
        score += 5;
      }
    }

    // Token frequency in chunk contents
    for (const token of tokens) {
      if (chunk.contentEn.toLowerCase().includes(token)) score += 2;
      if (chunk.contentHi.toLowerCase().includes(token)) score += 2;
      if (chunk.contentHinglish.toLowerCase().includes(token)) score += 2;
      if (chunk.title.toLowerCase().includes(token)) score += 3;
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0).slice(0, topK).map(s => s.chunk);
}

/**
 * Deterministic local RAG synthesis — 100% offline & fallback ready
 * @param {string} query
 * @param {'en'|'hi'|'hinglish'} lang
 * @param {string} topic
 * @param {Array} chunks
 * @returns {string}
 */
export function synthesizeLocalRAGAnswer(query, lang, topic, chunks) {
  const lower = (query || '').toLowerCase();

  // 1. Off-topic & General game handling
  if (topic === 'unrelated' || topic === 'general_game') {
    const isSaveQuery = lower.includes('save') || lower.includes('bachana') || lower.includes('khel save');
    const isWhoQuery = lower.includes('who are you') || lower.includes('who r u') || lower.includes('आप कौन') || lower.includes('tum kaun') || lower.includes('aap kaun');

    if (lang === 'en') {
      if (isSaveQuery) return "I'm here to guide you about heritage sites like Konark Sun Temple, Taj Mahal, Ajanta and Ellora Caves, and Kaziranga National Park. For game-saving instructions, please check the in-game help menu or settings.";
      if (isWhoQuery) return "I am your HeritageQuest AI Companion — an advanced guide for exploring four UNESCO World Heritage sites: Konark Sun Temple, Taj Mahal, Ajanta & Ellora Caves, and Kaziranga National Park.";
      return "I'm here to guide you about heritage sites like Konark Sun Temple, Taj Mahal, Ajanta and Ellora Caves, and Kaziranga National Park. Feel free to ask any question regarding their history, architecture, or wildlife.";
    } else if (lang === 'hi') {
      if (isSaveQuery) return "मैं आपको कोणार्क सूर्य मंदिर, ताजमहल, अजंता और एलोरा की गुफाओं तथा काजीरंगा राष्ट्रीय उद्यान जैसे धरोहर स्थलों की जानकारी देने के लिए यहाँ हूँ। गेम सेव करने के निर्देशों के लिए कृपया इन-गेम हेल्प मेनू या सेटिंग्स देखें।";
      if (isWhoQuery) return "मैं आपका HeritageQuest AI साथी हूँ, जो चार प्रमुख UNESCO धरोहर स्थलों पर आपकी मदद करता हूँ।";
      return "मैं यहाँ चार प्रमुख यूनेस्को धरोहर स्थलों—कोणार्क सूर्य मंदिर, ताजमहल, अजंता और एलोरा गुफाएं, तथा काजीरंगा राष्ट्रीय उद्यान पर आपका मार्गदर्शन करने के लिए उपस्थित हूँ।";
    } else {
      if (isSaveQuery) return "Main aapko Konark Sun Temple, Taj Mahal, Ajanta aur Ellora Caves, aur Kaziranga National Park jaise heritage sites ke baare me guide karne ke liye hoon. Game save karne ke liye please in-game help menu ya settings check karein.";
      if (isWhoQuery) return "Main aapka HeritageQuest AI assistant hoon, jo aapko 4 UNESCO heritage sites ke bare me accurate answers deta hoon.";
      return "Main yahan 4 UNESCO heritage sites—Konark Sun Temple, Taj Mahal, Ajanta & Ellora Caves, aur Kaziranga National Park ke baare me guide karne ke liye ready hoon!";
    }
  }

  // 2. Specific matching for Konark queries
  if (topic === 'konark') {
    // When / who built / date
    if (lower.includes('when') || lower.includes('kab') || lower.includes('date') || lower.includes('century') || (lower.includes('who') && (lower.includes('built') || lower.includes('banwaya') || lower.includes('king')))) {
      if (lang === 'en') return "The Konark Sun Temple was built in the 13th century, around 1250 CE, by King Narasimhadeva I of the Eastern Ganga dynasty in Konark, Odisha.";
      if (lang === 'hi') return "कोणार्क सूर्य मंदिर का निर्माण 13वीं शताब्दी में, लगभग 1250 ईस्वी में, पूर्वी गंगा राजवंश के राजा नरसिंहदेव प्रथम द्वारा करवाया गया था।";
      return "Konark Sun Temple 13th century me, lagbhag 1250 CE me, Eastern Ganga dynasty ke King Narasimhadeva I ne banwaya tha.";
    }

    // Why famous / significance / what is special
    if (lower.includes('famous') || lower.includes('prasiddh') || lower.includes('special') || lower.includes('black pagoda') || lower.includes('unesco') || lower.includes('why')) {
      if (lang === 'en') return "The Konark Sun Temple is famous for its monumental 13th-century chariot architecture with 24 carved stone sundial wheels pulled by 7 horses, and its UNESCO World Heritage status (historically known as the 'Black Pagoda').";
      if (lang === 'hi') return "कोणार्क सूर्य मंदिर अपने 24 नक्काशीदार पहियों वाले विशाल रथ वास्तुकला, 7 पत्थरों के घोड़ों और यूनेस्को विश्व धरोहर (ब्लैक पैगोडा) के रूप में दुनिया भर में प्रसिद्ध है।";
      return "Konark Sun Temple apne 24 intricately carved stone sundial wheels, 7 horses wale chariot architecture aur UNESCO World Heritage status (Black Pagoda) ke liye famous hai.";
    }
  }

  // 3. Taj Mahal — why famous / builder
  if (topic === 'taj-mahal') {
    if (lower.includes('why') || lower.includes('famous') || lower.includes('prasiddh') || lower.includes('symbol')) {
      if (lang === 'en') return "The Taj Mahal is famous for its stunning white Makrana marble architecture and stands as a timeless symbol of love, built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal.";
      if (lang === 'hi') return "ताजमहल अपनी शानदार वास्तुकला और प्रेम की निशानी के रूप में प्रसिद्ध है, जिसे मुगल सम्राट शाहजहाँ ने अपनी पत्नी मुमताज़ महल की याद में बनवाया था।";
      return "Taj Mahal apni stunning architecture aur symbol of love ke roop me famous hai, jise Mughal Emperor Shah Jahan ne apni wife Mumtaz Mahal ki memory me banwaya tha.";
    }
  }

  // 4. Ajanta & Ellora
  if (topic === 'ajanta-ellora') {
    if (lower.includes('dekhne') || lower.includes('what to see') || lower.includes('see') || lower.includes('murals') || lower.includes('kya hai')) {
      if (lang === 'en') return "In the Ajanta Caves, you can see 30 rock-cut Buddhist caves featuring ancient murals, frescoes, and sculptures depicting the life of Buddha and Jataka tales.";
      if (lang === 'hi') return "अजंता की गुफाओं में आप 30 बौद्ध गुफाएं, विश्वप्रसिद्ध भित्तिचित्र (म्यूरल्स) और प्राचीन मूर्तियां देख सकते हैं जो भगवान बुद्ध के जीवन को दर्शाती हैं।";
      return "Ajanta caves me aap buddhist murals aur ancient sculptures dekh sakte hai jo unke samay ki kala ko dikhate hain.";
    }
  }

  // 5. Synthesize from best retrieved chunks
  if (chunks.length > 0) {
    const primary = chunks[0];
    if (lang === 'hi') return primary.contentHi;
    if (lang === 'hinglish') return primary.contentHinglish;
    return primary.contentEn;
  }

  // Ultimate fallback
  if (lang === 'hi') return "यह इन चार प्रमुख यूनेस्को धरोहर स्थलों से संबंधित एक महत्वपूर्ण ऐतिहासिक स्थल है।";
  if (lang === 'hinglish') return "Ye in four UNESCO heritage sites me se ek important historical landmark hai.";
  return "This is one of the four prominent UNESCO World Heritage sites included in our expedition.";
}
