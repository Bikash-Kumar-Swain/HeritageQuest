import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

export async function findEmailByUsername(username) {
    if (!username) return null;
    const cleanLower = username.trim().toLowerCase();

    try {
        const usersCol = collection(db, "users");
        // 1. Query Firestore using usernameLower
        const q = query(usersCol, where("usernameLower", "==", cleanLower));
        const snap = await getDocs(q);
        if (!snap.empty) {
            return snap.docs[0].data().email || null;
        }

        // 2. Fallback check on username field for backward compatibility
        const qLegacy = query(usersCol, where("username", "==", username.trim()));
        const snapLegacy = await getDocs(qLegacy);
        if (!snapLegacy.empty) {
            return snapLegacy.docs[0].data().email || null;
        }
    } catch (e) {
        console.warn("Firestore findEmailByUsername query error:", e.message);
    }
    return null;
}

export async function registerGuestUser(username, password) {
    const cleanName = username.trim();
    const usernameLower = cleanName.toLowerCase();

    // Guest accounts still use Firebase Auth. The generated email is never
    // shown to the player; the Player ID is what the UI uses for login.
    const guestEmail = `guest_${usernameLower}@guest.geoquest.app`;

    const credential = await createUserWithEmailAndPassword(
        auth,
        guestEmail,
        password
    );

    const user = credential.user;

    try {
        await setDoc(doc(db, "users", user.uid), {
            username: cleanName,
            usernameLower,
            email: guestEmail,
            role: "Guest Explorer",
            isGuest: true,
            level: 1,
            xp: 0,
            nextLevelXp: 1000,
            title: "Novice Wayfarer",
            streak: 1,
            stats: {
                missionsCompleted: 0,
                relicsDiscovered: 0,
                countriesExplored: 0,
                totalDistanceKm: "0.0"
            },
            badges: [],
            completedMissions: [],
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
        });
    } catch (error) {
        // Avoid leaving an Auth account behind if the Firestore profile fails.
        try {
            await deleteUser(user);
        } catch (rollbackError) {
            console.warn("Guest Auth rollback failed:", rollbackError);
        }
        throw error;
    }

    return { user, email: guestEmail };
}

export async function registerUser(name, email, password) {
    // 1. Create Firebase Authentication account
    const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    const user = credential.user;
    const cleanName = name.trim();

    // 2. Create GeoQuest player profile in Firestore with usernameLower
    await setDoc(doc(db, "users", user.uid), {
        username: cleanName,
        usernameLower: cleanName.toLowerCase(),
        email: user.email,
        role: "Registered Explorer",
        isGuest: false,
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
        title: "Novice Cartographer",
        streak: 1,
        stats: {
            missionsCompleted: 0,
            relicsDiscovered: 0,
            countriesExplored: 0,
            totalDistanceKm: "0.0"
        },
        badges: [],
        completedMissions: [],
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
    });

    return user;
}

export async function loginUser(identifier, password) {
    const rawInput = identifier.trim();
    let emailToUse = rawInput;

    // If identifier is a Player ID / username (no '@')
    if (!rawInput.includes('@')) {
        const resolvedEmail = await findEmailByUsername(rawInput);
        if (!resolvedEmail) {
            const notFoundErr = new Error(`No account found for "${rawInput}"`);
            notFoundErr.code = 'auth/user-not-found';
            throw notFoundErr;
        }
        emailToUse = resolvedEmail;
    }

    // Let Firebase Auth handle the actual password authentication
    const credential = await signInWithEmailAndPassword(
        auth,
        emailToUse,
        password
    );

    const user = credential.user;
    const userRef = doc(db, "users", user.uid);
    let profile = null;

    try {
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
            profile = userSnapshot.data();
            await setDoc(
                userRef,
                {
                    lastLoginAt: serverTimestamp()
                },
                { merge: true }
            );
        }
    } catch (e) {
        console.warn("Firestore profile fetch error:", e);
    }

    if (!profile) {
        profile = {
            username: rawInput.includes('@') ? (rawInput.split('@')[0]) : rawInput,
            usernameLower: (rawInput.includes('@') ? (rawInput.split('@')[0]) : rawInput).toLowerCase(),
            email: user.email || emailToUse,
            role: "Registered Explorer",
            level: 1,
            xp: 0,
            nextLevelXp: 1000,
            title: "Novice Cartographer",
            streak: 1,
            stats: { missionsCompleted: 0, relicsDiscovered: 0, countriesExplored: 0, totalDistanceKm: "0.0" }
        };
    }

    return {
        user,
        profile
    };
}

export async function logoutUser() {
    await signOut(auth);
}

/**
 * Real-time Firestore Leaderboard Listener
 */
export function subscribeRealtimeLeaderboard(callback) {
    try {
        const usersCol = collection(db, "users");
        return onSnapshot(usersCol, (snapshot) => {
            const players = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                players.push({
                    uid: docSnap.id,
                    name: data.username || "Explorer",
                    level: data.level || 1,
                    xp: typeof data.xp === 'number' ? data.xp : (Number(data.xp) || 0),
                    title: data.title || "Novice Cartographer",
                    email: data.email || ""
                });
            });

            // Sort descending by XP
            players.sort((a, b) => (b.xp || 0) - (a.xp || 0));
            players.forEach((p, idx) => { p.rank = idx + 1; });

            if (callback) callback(players);
        }, (err) => {
            console.warn("Real-time leaderboard listener note:", err.message);
            fetchLeaderboardOnce(callback);
        });
    } catch (e) {
        console.warn("Leaderboard subscription error:", e);
        fetchLeaderboardOnce(callback);
        return () => {};
    }
}

/**
 * Fetch leaderboard snapshot once
 */
export async function fetchLeaderboardOnce(callback) {
    try {
        const usersCol = collection(db, "users");
        const snap = await getDocs(usersCol);
        const players = [];
        snap.forEach((docSnap) => {
            const data = docSnap.data();
            players.push({
                uid: docSnap.id,
                name: data.username || "Explorer",
                level: data.level || 1,
                xp: typeof data.xp === 'number' ? data.xp : 0,
                title: data.title || "Novice Cartographer",
                email: data.email || ""
            });
        });
        // Sort descending by XP
        players.sort((a, b) => b.xp - a.xp);
        players.forEach((p, idx) => { p.rank = idx + 1; });
        if (callback) callback(players);
    } catch (e) {
        console.warn("Fetch leaderboard error:", e);
    }
}

/**
 * Sync player XP, stats, badges, and missions to Firestore
 */
export async function updateUserProfileInFirestore(uid, player) {
    if (!uid || uid.startsWith('local_') || uid === 'guest') return;
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            xp: typeof player.xp === 'number' ? player.xp : 0,
            level: player.level || 1,
            nextLevelXp: player.nextLevelXp || 1000,
            title: player.title || "Explorer",
            streak: player.streak || 1,
            stats: player.stats || {},
            badges: (player.badges || []).map(b => ({
                id: b.id,
                name: b.name,
                unlocked: !!b.unlocked,
                unlockedAt: b.unlockedAt || null,
                progress: b.progress || ""
            })),
            completedMissions: player.completedMissions || [],
            lastActive: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn("Failed to sync player profile to Firestore:", e);
    }
}

export const updateUserXPInFirestore = updateUserProfileInFirestore;