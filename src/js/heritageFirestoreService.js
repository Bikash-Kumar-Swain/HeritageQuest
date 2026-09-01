/* ==========================================================================
   GeoQuest — Firestore Grounded Heritage Knowledge & Quiz Service
   ========================================================================== */

import { doc, getDoc, setDoc, getDocs, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { HERITAGE_SITES } from "./heritageSites.js";

/**
 * Seed Heritage Sites to Firestore if not already present
 */
export async function seedHeritageSitesToFirestore() {
  try {
    for (const site of HERITAGE_SITES) {
      const ref = doc(db, "heritage_sites", site.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          id: site.id,
          name: site.name,
          shortName: site.shortName,
          location: site.location,
          state: site.state,
          era: site.era,
          type: site.type,
          description: site.description,
          facts: site.facts || [],
          xpReward: site.xpReward || 250,
          difficulty: site.difficulty || "Moderate",
          lat: site.lat,
          lng: site.lng,
          verifiedSource: site.verifiedSource || "UNESCO World Heritage Centre / ASI",
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (e) {
    console.warn("Firestore heritage sites seed note:", e.message);
  }
}

/**
 * Fetch verified heritage site details from Firestore with instant local fallback
 */
export async function getVerifiedHeritageSite(siteId) {
  try {
    const ref = doc(db, "heritage_sites", siteId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (e) {}
  return HERITAGE_SITES.find(s => s.id === siteId) || HERITAGE_SITES[0];
}

// Background seed
setTimeout(() => seedHeritageSitesToFirestore(), 3000);
