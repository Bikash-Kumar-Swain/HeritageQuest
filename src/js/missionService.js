import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase.js";


/**
 * Get the Konark mission definition
 */
export async function getKonarkMission() {
    const missionRef = doc(
        db,
        "missions",
        "konark_mission_01"
    );

    const snapshot = await getDoc(missionRef);

    if (!snapshot.exists()) {
        throw new Error("KONARK_MISSION_NOT_FOUND");
    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };
}


/**
 * Get the current user's Konark mission progress
 */
export async function getKonarkMissionProgress(uid) {
    const progressRef = doc(
        db,
        "users",
        uid,
        "missions",
        "konark_mission_01"
    );

    const snapshot = await getDoc(progressRef);

    if (!snapshot.exists()) {
        return {
            completed: false,
            xpEarned: 0,
            completedAt: null
        };
    }

    return snapshot.data();
}


/**
 * Save Konark mission completion
 */
export async function completeKonarkMission(uid, xpReward) {
    const progressRef = doc(
        db,
        "users",
        uid,
        "missions",
        "konark_mission_01"
    );

    await setDoc(progressRef, {
        completed: true,
        xpEarned: xpReward,
        completedAt: serverTimestamp()
    });

    return true;
}

export async function testKonarkMission() {
    try {
        const mission = await getKonarkMission();

        console.log("✅ Konark mission loaded from Firestore:");
        console.log(mission);

        return mission;
    } catch (error) {
        console.error("❌ Failed to load Konark mission:", error);
        throw error;
    }
}