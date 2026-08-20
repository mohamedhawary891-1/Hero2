/**
 * firebase.js (Root Config — متجر هواري)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * هذا الملف يُعرِّف إعدادات Firebase الكاملة لمشروع متجر هواري.
 * الكود الرئيسي للتطبيق يستورد من: src/services/firebase.ts
 * 
 * Firebase Project: hawari-store
 * Console: https://console.firebase.google.com/project/hawari-store
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// ─── إعدادات مشروع Firebase ────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: "AIzaSyATmowMf-TY1-5Bqds0ABfo813Zl6VDZ4Q",
  authDomain: "hawari-store.firebaseapp.com",
  databaseURL: "https://hawari-store-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hawari-store",
  storageBucket: "hawari-store.firebasestorage.app",
  messagingSenderId: "1045177725390",
  appId: "1:1045177725390:web:d348e94c3c8c205efabb9f",
  measurementId: "G-RLJ3WBWRX6"
};

// ─── تهيئة Firebase (آمن ضد الإعادة المزدوجة) ──────────────────────────────
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ─── تهيئة الخدمات وتصديرها ─────────────────────────────────────────────────
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const storage = getStorage(app);

// Analytics (مع تعامل آمن مع بيئات بدون دعم)
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (_e) {
    // Analytics غير مدعوم في هذه البيئة
  }
}

export { app, analytics, auth, db, realtimeDb, storage };

// ─── NOTE ──────────────────────────────────────────────────────────────────
// المصدر الرئيسي للاستيراد في كود التطبيق:
//   import { db, auth, storage, ... } from './src/services/firebase';
// ──────────────────────────────────────────────────────────────────────────