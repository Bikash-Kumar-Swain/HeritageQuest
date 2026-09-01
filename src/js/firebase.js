import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-N3FqYxTFEZyXiy8PNipS7GeAPYx6KQY",
  authDomain: "geoquest-61475.firebaseapp.com",
  projectId: "geoquest-61475",
  storageBucket: "geoquest-61475.firebasestorage.app",
  messagingSenderId: "1094641510121",
  appId: "1:1094641510121:web:f739a9582956721fe6b278",
  measurementId: "G-TFG5BYGP16"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;