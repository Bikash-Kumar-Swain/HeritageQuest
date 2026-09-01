/* ==========================================================================
   HeritageQuest — Integrated Server
   Express.js server combining:
   1. Original game API routes (XP validation, Gemini Vision proxy)
   2. NEW: RAG + Gemini AI chat routes (/api/chat, /api/rag/search, /api/health)
   3. Static file serving with range-request support for large 3D models
   ========================================================================== */

import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Load env variables (GEMINI_API_KEY) from .env file
const require = createRequire(import.meta.url);
try {
  const { default: dotenv } = await import('dotenv');
  dotenv.config();
} catch {
  // dotenv not critical if env vars are already set externally
}

// Lazy-load Gemini client (checks process.env.GEMINI_API_KEY or key passed from secure backend caller)
let _geminiClient = null;
async function getGeminiClient(customKey) {
  const keyToUse = (process.env.GEMINI_API_KEY || customKey || '').trim();
  if (!keyToUse) return null;
  try {
    const { GoogleGenAI } = await import('@google/genai');
    return new GoogleGenAI({
      apiKey: keyToUse,
      httpOptions: { headers: { 'User-Agent': 'heritagequest-game' } }
    });
  } catch (e) {
    console.warn('[HeritageQuest] Gemini client init failed:', e.message);
    return null;
  }
}

// Lazy-load RAG engine
let _ragEngine = null;
async function getRagEngine() {
  if (_ragEngine) return _ragEngine;
  try {
    _ragEngine = await import('./src/js/ai/ragEngine.js');
    return _ragEngine;
  } catch (e) {
    console.warn('[HeritageQuest] RAG engine load failed:', e.message);
    return null;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json'
};

// Server-side Mission XP Validation Catalog (unchanged from original)
const VALID_XP_REWARDS = {
  '3d_tour': 150,
  'knowledge_lore': 200,
  'quiz_complete': 300,
  'relic_arrange': 250,
  'photo_lens': 500,
  'konark_mission_01': 500
};

const app = express();
app.use(express.json({ limit: '10mb' }));

// ─────────────────────────────────────────────────────────────────────────────
// API 1 (PRESERVED): Secure Backend XP Rewards Validation
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/missions/validate-reward', (req, res) => {
  try {
    const { missionType, score, correctCount, totalQuestions } = req.body;
    let validatedXP = VALID_XP_REWARDS[missionType] || 100;

    if (missionType === 'quiz_complete' && typeof correctCount === 'number') {
      const total = totalQuestions || 6;
      validatedXP = Math.round((correctCount / total) * 300);
    }

    res.json({
      success: true,
      validatedXP,
      verifiedAt: new Date().toISOString()
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// API 2 (PRESERVED): Gemini Vision Proxy for Heritage Photo Verification
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/gemini/vision', async (req, res) => {
  try {
    const { imageBase64, siteName, apiKey } = req.body;
    const keyToUse = process.env.GEMINI_API_KEY || apiKey;

    if (!keyToUse) {
      return res.json({
        isMatch: false,
        confidence: 0,
        detectedFeatures: [],
        feedback: 'Backend Gemini API key not configured. Please provide an API key in settings.',
        isLiveAI: false
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const promptText = `Analyze this image and determine whether it shows the real-world Indian heritage site: "${siteName}".
Respond ONLY in valid JSON format:
{
  "isMatch": boolean,
  "confidence": number between 0 and 100,
  "detectedFeatures": string[],
  "feedback": "Short explanation of verified monument features"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            { inline_data: { mime_type: 'image/jpeg', data: cleanBase64 } }
          ]
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawJson);
      return res.json({
        isMatch: !!parsed.isMatch,
        confidence: parsed.confidence || (parsed.isMatch ? 92 : 30),
        detectedFeatures: parsed.detectedFeatures || [],
        feedback: parsed.feedback || (parsed.isMatch ? `✓ Verified authentic match for ${siteName}!` : `Does not appear to match ${siteName}.`),
        isLiveAI: true
      });
    } else {
      throw new Error('Gemini upstream status ' + response.status);
    }
  } catch (e) {
    return res.json({
      isMatch: false,
      confidence: 0,
      feedback: 'Vision analysis error: ' + e.message,
      isLiveAI: false
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// API 3 (NEW): Health Check
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    botName: 'HERITAGEQUEST',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    version: '2.0',
    features: ['RAG', 'Gemini', 'Language-Detection', 'EN/HI/Hinglish']
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// API 4 (NEW): RAG Search / Debug Endpoint
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/rag/search', async (req, res) => {
  const { query, topK } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required' });
  }

  const rag = await getRagEngine();
  if (!rag) {
    return res.status(500).json({ error: 'RAG engine unavailable' });
  }

  const detectedLanguage = rag.detectLanguage(query);
  const topicClassification = rag.classifyTopic(query);
  const chunks = rag.retrieveKnowledgeChunks(query, topK || 4);

  return res.json({ query, detectedLanguage, topicClassification, chunks });
});

// ─────────────────────────────────────────────────────────────────────────────
// API 5 (NEW): Main AI Chat — Language Detection + RAG + Gemini + Fallback
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  const { message, languageOverride, siteId, mode } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Load RAG engine
  const rag = await getRagEngine();
  if (!rag) {
    return res.json({
      answer: "My knowledge system is temporarily unavailable. Please try again.",
      detectedLanguage: 'en',
      topicClassification: 'unrelated',
      retrievedChunks: [],
      latencyMs: Date.now() - startTime,
      isAiGenerated: false
    });
  }

  // Step 1: Language & topic analysis
  const detectedLanguage = rag.detectLanguage(message, languageOverride);
  const topicClassification = rag.classifyTopic(message);

  // Step 2: Retrieve relevant knowledge chunks (top 3)
  const retrievedChunks = rag.retrieveKnowledgeChunks(message, 3);

  // Step 3: Build local deterministic fallback (always available)
  const fallbackAnswer = rag.synthesizeLocalRAGAnswer(message, detectedLanguage, topicClassification, retrievedChunks);

  // Step 4: Try Gemini (server-side key from process.env.GEMINI_API_KEY)
  const ai = await getGeminiClient();
  if (!ai) {
    // No API key or client init failed — use local fallback gracefully
    return res.json({
      answer: fallbackAnswer,
      detectedLanguage,
      topicClassification,
      retrievedChunks,
      latencyMs: Date.now() - startTime,
      isAiGenerated: false
    });
  }

  try {
    // Format RAG context for Gemini prompt
    const ragContextFormatted = retrievedChunks.map((c, i) =>
      `[Source Chunk ${i + 1}: ${c.title} (${c.siteId})]\nEnglish: ${c.contentEn}\nHindi: ${c.contentHi}\nHinglish: ${c.contentHinglish}`
    ).join('\n\n');

    const systemInstruction = `You are HeritageQuest AI, an instant, knowledgeable, and engaging game companion for 4 UNESCO World Heritage Sites:
1. Konark Sun Temple (Odisha) — built ~1250 CE by King Narasimhadeva I
2. Taj Mahal (Agra, UP) — built 1631-1653 by Shah Jahan for Mumtaz Mahal
3. Ajanta & Ellora Caves (Maharashtra) — Buddhist/Hindu/Jain rock-cut monuments
4. Kaziranga National Park (Assam) — home to 2/3 of world's one-horned rhinos

RULES:
1. LANGUAGE: If Hindi (Devanagari script), respond directly in natural fluent Hindi. If Hinglish (Roman script Hindi), respond in natural conversational Hinglish. If English, respond in crisp, clear English.
2. SPEED & CONCISENESS: Give direct, accurate, friendly answers in 2-4 sentences unless the user asks for deep details.
3. FACT ACCURACY: Ground your answer using the provided context facts. Do not invent facts.
4. SOURCES: Do NOT fabricate source citations. Do not say "Verified by UNESCO" unless directly supported by context.
5. GAME & GENERAL QUERIES: If the user asks about the game, controls, or greets you, reply warmly in character.`;

    const userPrompt = `Context Facts:\n${ragContextFormatted || 'None available.'}\n\nUser Question: "${message}"\nDetected Language: ${detectedLanguage}\nTopic: ${topicClassification}\n\nAnswer in ${detectedLanguage === 'hi' ? 'Hindi' : detectedLanguage === 'hinglish' ? 'Hinglish' : 'English'}:`;

    // Gemini call with model waterfall & timeout per model
    let aiAnswer = null;
    let modelUsed = null;

    async function tryGemini(modelName, timeoutMs) {
      return Promise.race([
        (async () => {
          try {
            const result = await ai.models.generateContent({
              model: modelName,
              contents: userPrompt,
              config: {
                systemInstruction,
                temperature: 0.2,
                maxOutputTokens: 350
              }
            });
            const text = result?.text?.trim();
            return (text && text.length > 5) ? text : null;
          } catch {
            return null;
          }
        })(),
        new Promise(resolve => setTimeout(() => resolve(null), timeoutMs))
      ]);
    }

    const modelsWaterfall = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
    for (const m of modelsWaterfall) {
      aiAnswer = await tryGemini(m, 3000);
      if (aiAnswer) {
        modelUsed = m;
        break;
      }
    }

    return res.json({
      answer: aiAnswer || fallbackAnswer,
      detectedLanguage,
      topicClassification,
      retrievedChunks,
      latencyMs: Date.now() - startTime,
      isAiGenerated: Boolean(aiAnswer),
      modelUsed: modelUsed || (aiAnswer ? 'gemini' : 'local-rag-fallback')
    });

  } catch (error) {
    console.warn('[HeritageQuest] Gemini chat error, using fallback:', error.message);
    return res.json({
      answer: fallbackAnswer,
      detectedLanguage,
      topicClassification,
      retrievedChunks,
      latencyMs: Date.now() - startTime,
      isAiGenerated: false
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Static File Serving with Range-Request Support (for large 3D .glb models)
// Using raw http.createServer to preserve streaming/range behavior exactly
// ─────────────────────────────────────────────────────────────────────────────
const staticHandler = (req, res) => {
  let reqUrl = req.url.split('?')[0];

  // Skip if already handled by Express (API routes)
  if (reqUrl.startsWith('/api/')) return;

  let filePath = path.join(__dirname, reqUrl === '/' ? 'index.html' : reqUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // SPA fallback — serve index.html for unknown routes
        fs.readFile(path.join(__dirname, 'index.html'), (err2, indexContent) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }

    const isCodeFile = ['.js', '.html', '.css', '.json'].includes(ext);
    const cacheControl = isCodeFile ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600';

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*'
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
};

// Create hybrid server: Express handles /api/* routes, static handler for everything else
const server = http.createServer((req, res) => {
  if (req.url.split('?')[0].startsWith('/api/')) {
    // Delegate to Express
    app(req, res);
  } else {
    staticHandler(req, res);
  }
});

server.listen(PORT, () => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  console.log(`\n🧭 HeritageQuest Game + AI Server running at http://localhost:${PORT}`);
  console.log(`   Gemini API Key: ${hasKey ? '✅ Loaded from environment' : '⚠️  Not set — AI will use local RAG fallback'}`);
  console.log(`   APIs available:`);
  console.log(`     GET  /api/health`);
  console.log(`     POST /api/chat           (RAG + Gemini AI)`);
  console.log(`     POST /api/rag/search     (RAG debug)`);
  console.log(`     POST /api/missions/validate-reward`);
  console.log(`     POST /api/gemini/vision  (Photo verification)\n`);
});
