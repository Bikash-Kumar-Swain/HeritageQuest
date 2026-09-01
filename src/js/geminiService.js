/* ==========================================================================
   GeoQuest — Gemini AI Heritage Companion Service
   Combines S35 Verified Heritage Knowledge Base, Multi-language Support,
   and Gemini Generative AI with zero-latency verified fallback.
   ========================================================================== */

import { HERITAGE_SITES } from './heritageSites.js';
import { getVerifiedHeritageSite } from './heritageFirestoreService.js';

/**
 * Normalizes text for smart keyword matching in the local knowledge base
 */
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\u0B00-\u0B7F\u0900-\u097F ]/g, ' ');
}

/**
 * S35 Verified Local Knowledge Base Matcher
 */
export function queryLocalKnowledgeBase(query, siteId = null, mode = 'Ask') {
  const qWords = new Set(norm(query).split(/\s+/).filter(w => w.length > 1));
  
  // Sites to search
  const candidates = siteId 
    ? HERITAGE_SITES.filter(s => s.id === siteId)
    : HERITAGE_SITES;

  let bestMatch = null;
  let highestScore = 0;

  for (const site of candidates) {
    const searchCorpus = [
      site.name,
      site.shortName,
      site.location,
      site.state,
      site.era,
      site.type,
      site.description,
      ...(site.facts || []),
      ...(site.keywords || [])
    ].join(' ');

    const corpusWords = new Set(norm(searchCorpus).split(/\s+/));
    let score = 0;
    for (const word of qWords) {
      if (corpusWords.has(word)) score += 1;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = site;
    }
  }

  if (!bestMatch || highestScore === 0) {
    if (siteId) {
      bestMatch = HERITAGE_SITES.find(s => s.id === siteId);
    }
  }

  if (!bestMatch) {
    return {
      text: "I do not have verified archaeological or historical documentation for this specific query in my current knowledge base.",
      source: "S35 Verified Heritage Rule — No guessing without evidence",
      site: null
    };
  }

  let answerText = bestMatch.description;

  if (mode === 'Hint') {
    answerText = bestMatch.hint || `Look closely at the architectural elements of ${bestMatch.name}.`;
  } else if (mode === 'Quiz') {
    answerText = bestMatch.quiz || `Quiz: What era does ${bestMatch.name} belong to? (${bestMatch.era})`;
  } else if (mode === 'Explain') {
    answerText = `In simple terms: ${bestMatch.description}\n\nKey Highlights:\n• ` + bestMatch.facts.join('\n• ');
  }

  return {
    text: answerText,
    source: bestMatch.verifiedSource || 'UNESCO World Heritage Centre / ASI',
    site: bestMatch
  };
}

/**
 * Ask Heritage AI Companion — NEW: Routes through /api/chat backend.
 * The Gemini API key is server-side only (GEMINI_API_KEY env variable).
 * This function never touches the API key or calls Gemini directly.
 *
 * Full pipeline on server:
 *   Language Detection → Topic Classification → RAG Knowledge Retrieval
 *   → Gemini (server-side) → Natural Language Answer
 *
 * Fallback chain:
 *   1. /api/chat (Gemini via server with RAG context)
 *   2. Local knowledge base (queryLocalKnowledgeBase — always available)
 */
export async function askHeritageAI({
  query,
  siteId = null,
  mode = 'Ask',
  language = 'English',
  onPartial = null
}) {
  // Map game's language hint to langCode for the server
  const langCode = language === 'Hindi' ? 'hi' : language === 'Hinglish' ? 'hinglish' : 'auto';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: query,
        languageOverride: langCode,
        siteId: siteId || undefined,
        mode: mode
      }),
      signal: AbortSignal.timeout(6000) // 6-second total timeout
    });

    if (!response.ok) {
      throw new Error(`/api/chat responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.answer) {
      throw new Error('Empty answer from /api/chat');
    }

    // Derive source from retrieved knowledge chunks metadata (NOT from Gemini output)
    // This prevents fabricated citations.
    let source = null;
    if (data.retrievedChunks && data.retrievedChunks.length > 0) {
      const siteIdFromChunk = data.retrievedChunks[0].siteId;
      const sourceMap = {
        'konark': 'UNESCO World Heritage Centre / ASI (Ref #246)',
        'taj-mahal': 'UNESCO World Heritage Centre / ASI (1983)',
        'ajanta-ellora': 'UNESCO World Heritage Centre / ASI (1983)',
        'kaziranga': 'UNESCO World Heritage Centre / ASI (1985)'
      };
      source = sourceMap[siteIdFromChunk] || 'UNESCO World Heritage Centre / ASI';
    }

    return {
      text: data.answer,
      source: source,
      isLiveAI: data.isAiGenerated || false,
      detectedLanguage: data.detectedLanguage,
      topicClassification: data.topicClassification
    };

  } catch (err) {
    // Network/backend unreachable — fall back to instant local knowledge base
    console.warn('[HeritageQuest] /api/chat unavailable, using local fallback:', err.message);
    const localAnswer = queryLocalKnowledgeBase(query, siteId, mode);

    let formattedText = localAnswer.text;
    if (mode !== 'Quiz' && mode !== 'Hint' && !formattedText.includes('Source:')) {
      formattedText += `\n\n**Source:** ${localAnswer.source}`;
    }

    return {
      text: formattedText,
      source: localAnswer.source,
      isLiveAI: false
    };
  }
}

/**
 * AI Vision Verifier for Real-World Heritage Photos (Server-Side Vision Proxy)
 */
export async function verifyHeritagePhoto({ imageBase64, siteId, siteName }) {
  // 1. Secure backend proxy endpoint
  if (imageBase64) {
    try {
      const backendRes = await fetch('/api/gemini/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          siteId,
          siteName
        })
      });
      if (backendRes.ok) {
        const backendData = await backendRes.json();
        if (backendData && typeof backendData.isMatch === 'boolean') {
          return backendData;
        }
      }
    } catch (err) {
      console.warn("Backend vision proxy note:", err.message);
    }
  }

  // 2. Offline Fallback: Real Pixel Content Checker (when backend proxy is unreachable)

  // ── Offline Fallback: Real Pixel Content Checker ────────────────────────
  // We analyse the actual image data to detect blank/black/featureless frames.
  // Only pass if the image has enough visual contrast and detail.
  await new Promise(r => setTimeout(r, 900));

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const binaryStr = atob(cleanBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

    // Draw into an offscreen canvas to sample pixels
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const bitmapUrl = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = bitmapUrl;
    });

    const offscreen = document.createElement('canvas');
    offscreen.width = 80;
    offscreen.height = 60;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(img, 0, 0, 80, 60);
    URL.revokeObjectURL(bitmapUrl);

    const pixelData = ctx.getImageData(0, 0, 80, 60).data;
    const totalPixels = 80 * 60;

    let sumR = 0, sumG = 0, sumB = 0;
    let darkPixels = 0;

    for (let i = 0; i < pixelData.length; i += 4) {
      const r = pixelData[i], g = pixelData[i + 1], b = pixelData[i + 2];
      sumR += r; sumG += g; sumB += b;
      const brightness = (r + g + b) / 3;
      if (brightness < 25) darkPixels++;
    }

    const avgBrightness = (sumR + sumG + sumB) / (totalPixels * 3);
    const darkRatio = darkPixels / totalPixels;

    // Reject if: image is too dark/blank (camera not capturing properly)
    if (avgBrightness < 20 || darkRatio > 0.85) {
      return {
        isMatch: false,
        confidence: 0,
        detectedFeatures: [],
        feedback: `📷 The camera captured a blank or very dark frame. Make sure you are pointing the camera at the actual monument in good lighting before clicking.`,
        isLiveAI: false
      };
    }

    // Compute variance to check if image has visual detail (not just a uniform colour)
    const meanBrightness = avgBrightness;
    let variance = 0;
    for (let i = 0; i < pixelData.length; i += 4) {
      const brightness = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3;
      variance += (brightness - meanBrightness) ** 2;
    }
    variance /= totalPixels;

    // Reject if image is nearly featureless (uniform colour / no stone/architectural texture)
    if (variance < 80) {
      return {
        isMatch: false,
        confidence: 8,
        detectedFeatures: [],
        feedback: `🔍 The image appears featureless or lacks architectural detail. Please photograph the main structure, stone carvings, or facade of ${siteName} clearly.`,
        isLiveAI: false
      };
    }

    // Image has real content — but we cannot confirm without AI Vision API.
    // Inform the user that a Gemini API key is needed for proper AI verification.
    return {
      isMatch: false,
      confidence: 0,
      detectedFeatures: [],
      feedback: `🔑 AI Vision requires a Gemini API key to authenticate the photo against ${siteName}. Add your free Gemini API key in Settings to enable real monument verification with +500 XP!`,
      isLiveAI: false
    };
  } catch (e) {
    // If pixel analysis fails, do not auto-pass
    return {
      isMatch: false,
      confidence: 0,
      detectedFeatures: [],
      feedback: `Could not analyse the image. Please ensure the camera is pointed at the monument and try again.`,
      isLiveAI: false
    };
  }
}
