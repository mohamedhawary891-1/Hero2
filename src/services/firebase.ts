import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from "firebase/storage";
import { Book, Order, UserProfile, StoreSettings, SiteNotification } from "../types";
import { INITIAL_BOOKS, CATEGORIES_LIST } from "../data/initialBooks";
import { GOVERNORATES_RATES } from "../utils/shippingEngine";

// Provided Firebase web app configuration
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

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Keep the Firebase session after a browser refresh.  The previous app only
// stored a pretend login in localStorage, so Firestore correctly rejected all
// admin writes despite the dashboard showing a success message.
export async function enablePersistentAuth() {
  await setPersistence(auth, browserLocalPersistence);
}

// Safe Analytics initialization
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics fallback
  });
}

// ----------------------------------------------------
// FIREBASE STORAGE & FIRESTORE BOOK UPLOAD HANDLERS
// ----------------------------------------------------

/**
 * Validate Cover Image File (Format & Size <= 25MB)
 */
export function validateCoverImageFile(file: File): { valid: boolean; error?: string } {
  const isImageType = !file.type || file.type.startsWith('image/');
  const hasImageExt = Boolean(file.name && file.name.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|avif|heic|jfif)$/i));
  if (!isImageType && !hasImageExt) {
    return {
      valid: false,
      error: 'يرجى اختيار ملف صورة صالح للغلاف (JPG, PNG, WEBP, GIF, SVG).'
    };
  }
  const maxBytes = 25 * 1024 * 1024; // 25MB
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `حجم صورة الغلاف (${(file.size / (1024 * 1024)).toFixed(1)} MB) يتجاوز الحد الأقصى (25 ميجابايت).`
    };
  }
  return { valid: true };
}

/**
 * Validate PDF / Digital Book File (Format & Size <= 50MB)
 */
export function validatePdfBookFile(file: File): { valid: boolean; error?: string } {
  const isPdf = file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));
  const isDoc = file.name && file.name.match(/\.(pdf|doc|docx|epub|txt)$/i);
  if (!isPdf && !isDoc) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. يرجى اختيار ملف PDF صالح للكتاب الإلكتروني.'
    };
  }
  const maxBytes = 50 * 1024 * 1024; // 50MB
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `حجم ملف الكتاب (${(file.size / (1024 * 1024)).toFixed(1)} MB) يتجاوز الحد المسموح به (50 ميجابايت).`
    };
  }
  return { valid: true };
}

/**
 * Convert file to Base64 data URL as immediate fallback
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Compress & Auto-Optimize Image for Fast Loading & Zero Storage Lag
 */
export async function compressAndOptimizeImage(
  file: File | Blob, 
  maxWidth = 1400, 
  maxHeight = 1800, 
  quality = 0.88
): Promise<{ dataUrl: string; blob?: Blob }> {
  try {
    const dataUrl = await fileToDataUrl(file);
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ dataUrl });
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob((blob) => {
          resolve({ 
            dataUrl: optimizedUrl, 
            blob: blob || undefined 
          });
        }, 'image/jpeg', quality);
      };
      img.onerror = () => {
        resolve({ dataUrl });
      };
      img.src = dataUrl;
    });
  } catch (e) {
    const fallbackUrl = await fileToDataUrl(file);
    return { dataUrl: fallbackUrl };
  }
}

/**
 * Upload Cover Image to Firebase Storage: /covers/{timestamp}_{filename}
 */
export async function uploadBookCoverFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; error?: string; source: 'storage' | 'base64' }> {
  const validation = validateCoverImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Pre-optimize image to guarantee smooth performance
  if (onProgress) onProgress(20);
  const optimized = await compressAndOptimizeImage(file);
  if (onProgress) onProgress(45);

  const cleanName = (file.name || 'cover').replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `covers/${Date.now()}_${cleanName}`;
  const storageReference = ref(storage, storagePath);

  try {
    const blobToUpload = optimized.blob || file;
    const uploadTask = uploadBytesResumable(storageReference, blobToUpload);

    return await new Promise((resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = 45 + (snapshot.bytesTransferred / (snapshot.totalBytes || 1)) * 50;
          if (onProgress) onProgress(Math.min(95, Math.round(progress)));
        },
        async (storageError) => {
          console.warn("Storage upload notice (using optimized image data):", storageError);
          if (onProgress) onProgress(100);
          resolve({ url: optimized.dataUrl, source: 'base64' });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({ url: downloadUrl, source: 'storage' });
          } catch (urlError) {
            if (onProgress) onProgress(100);
            resolve({ url: optimized.dataUrl, source: 'base64' });
          }
        }
      );
    });
  } catch (err: any) {
    if (onProgress) onProgress(100);
    return { url: optimized.dataUrl, source: 'base64', error: err?.message };
  }
}

/**
 * Upload PDF / Digital Book to Firebase Storage: /books/{timestamp}_{filename}
 */
export async function uploadBookPdfFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; fileName: string; fileSize: string; error?: string; source: 'storage' | 'base64' }> {
  const validation = validatePdfBookFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `books/${Date.now()}_${cleanName}`;
  const storageReference = ref(storage, storagePath);

  try {
    const uploadTask = uploadBytesResumable(storageReference, file);

    return await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        async (storageError) => {
          console.warn("PDF Storage upload fallback to DataURL:", storageError);
          try {
            const dataUrl = await fileToDataUrl(file);
            resolve({ url: dataUrl, fileName: file.name, fileSize, source: 'base64' });
          } catch (e) {
            reject(new Error("تعذر قراءة ملف الـ PDF"));
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({ url: downloadUrl, fileName: file.name, fileSize, source: 'storage' });
          } catch (urlError) {
            const dataUrl = await fileToDataUrl(file);
            resolve({ url: dataUrl, fileName: file.name, fileSize, source: 'base64' });
          }
        }
      );
    });
  } catch (err: any) {
    const dataUrl = await fileToDataUrl(file);
    return { url: dataUrl, fileName: file.name, fileSize, source: 'base64', error: err?.message };
  }
}

/**
 * Save / Update Book directly in Firestore 'books' collection
 */
export async function saveBookToFirestore(book: Book): Promise<{ success: boolean; error?: string }> {
  try {
    const bookDocRef = doc(db, "books", book.id);
    await setDoc(bookDocRef, {
      ...book,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.warn("Firestore save book warning (fallback to local):", error);
    return { success: false, error: error?.message || 'تعذر الحفظ السحابي في Firestore' };
  }
}

/** Subscribe to the catalog so all open devices receive edits immediately. */
export function subscribeToBooks(
  onBooks: (books: Book[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, "books"),
    (snapshot) => {
      const books = snapshot.docs
        .map((docSnap) => ({ ...docSnap.data(), id: docSnap.id } as Book))
        .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
      onBooks(books);
    },
    (error) => onError?.(error)
  );
}

export async function signInStoreUser(email: string, password: string): Promise<UserProfile> {
  await enablePersistentAuth();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profileRef = doc(db, "users", credential.user.uid);
  const profileSnapshot = await getDoc(profileRef);
  const existing = profileSnapshot.exists() ? profileSnapshot.data() as Partial<UserProfile> : {};
  const profile: UserProfile = {
    uid: credential.user.uid,
    name: existing.name || credential.user.displayName || email.split('@')[0],
    email: credential.user.email || email.trim().toLowerCase(),
    phone: existing.phone || '',
    governorate: existing.governorate || 'القاهرة',
    address: existing.address || '',
    // The role is not trusted by Firestore rules; rules independently verify admins.
    role: isUserAdmin(credential.user.email) ? 'admin' : 'customer',
    purchasedBooks: existing.purchasedBooks || [],
    createdAt: existing.createdAt || new Date().toISOString(),
    isBlocked: existing.isBlocked || false,
    // Firestore rejects fields whose value is `undefined`. Keep notes only
    // when the existing profile actually has a value.
    ...(existing.notes ? { notes: existing.notes } : {})
  };
  await setDoc(profileRef, profile, { merge: true });
  return profile;
}

export async function registerStoreUser(data: {
  name: string;
  email: string;
  phone: string;
  governorate: string;
  address: string;
  password: string;
}): Promise<UserProfile> {
  await enablePersistentAuth();
  const credential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
  const profile: UserProfile = {
    uid: credential.user.uid,
    name: data.name.trim(),
    email: credential.user.email || data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    governorate: data.governorate,
    address: data.address.trim(),
    role: isUserAdmin(credential.user.email) ? 'admin' : 'customer',
    purchasedBooks: [],
    createdAt: new Date().toISOString(),
    isBlocked: false
  };
  await setDoc(doc(db, "users", credential.user.uid), profile);
  return profile;
}

export async function signOutStoreUser() {
  await signOut(auth);
}

/**
 * Delete Book directly from Firestore 'books' collection
 */
export async function deleteBookFromFirestore(bookId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const bookDocRef = doc(db, "books", bookId);
    await deleteDoc(bookDocRef);
    return { success: true };
  } catch (error: any) {
    console.warn("Firestore delete book warning:", error);
    return { success: false, error: error?.message };
  }
}

/**
 * Fetch all books from Firestore 'books' collection
 */
export async function fetchBooksFromFirestore(): Promise<Book[] | null> {
  try {
    const booksColRef = collection(db, "books");
    const snapshot = await getDocs(booksColRef);
    if (!snapshot.empty) {
      const remoteBooks: Book[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Book;
        remoteBooks.push({ ...data, id: docSnap.id });
      });
      return remoteBooks;
    }
  } catch (e) {
    console.warn("Firestore fetch books notice (using cached/initial):", e);
  }
  return null;
}

// Local persistence cache keys for instant UI response & offline fallback
const STORAGE_KEYS = {
  BOOKS: "hawari_store_books_v3",
  ORDERS: "hawari_store_orders_v3",
  USERS: "hawari_store_users_v3",
  CURRENT_USER: "hawari_store_current_user_v3",
  SETTINGS: "hawari_store_settings_v3",
  NOTIFICATIONS: "hawari_store_notifications_v3",
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "متجر هواري | Hawari Store",
  tagline: "أفضل الكتب الورقية والرقمية المشفرة في مصر والوطن العربي",
  themeColor: "orange",
  
  // Announcement Bar
  announcementEnabled: true,
  announcementText: "🔥 خصم خاص 20% على باقات الكتب الأكثر مبيعاً + شحن سريع لجميع محافظات مصر!",
  announcementLink: "#catalog-section",

  // Sections
  bestsellersEnabled: true,
  bestsellersTitle: "الأكثر مبيعاً",
  bestsellersBadge: "الأعلى طلباً",
  catalogTitle: "كتالوج الكتب المعروضة",

  // Hero Carousel Slides (Animated in Middle)
  heroSlides: [
    {
      id: "slide-1",
      title: "متجر هواري للكتب الورقية والرقمية",
      subtitle: "أضخم تشكيلة من أحدث الروايات والكتب الفكرية مع شحن سريع وقارئ PDF محمي ضد القرصنة",
      image: "https://images.unsplash.com/photo-1507842229450-7907e4d5da99?auto=format&fit=crop&q=80&w=1200",
      badge: "خصم يصل إلى 30%",
      ctaText: "تصفح أحدث الكتب",
      category: "الكل"
    },
    {
      id: "slide-2",
      title: "عالم الروايات العالمية والمترجمة",
      subtitle: "استمتع بأشهر الروايات الكلاسيكية والحديثة بصيغ ورقية فاخرة ونسخ رقمية فورية",
      image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=1200",
      badge: "الأكثر طلباً",
      ctaText: "استكشف الروايات",
      category: "روايات"
    },
    {
      id: "slide-3",
      title: "تطوير الذات وبناء العادات",
      subtitle: "كتب التنمية البشرية وعلم النفس التي غيرت حياة الملايين حول العالم بين يديك",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200",
      badge: "توصيل فوري",
      ctaText: "تطوير الذات",
      category: "تنمية بشرية"
    }
  ],

  // Categories list
  categories: CATEGORIES_LIST,

  // 6 Homepage Curated Books & 7th Spotlight Book
  featuredBookIds: ["book-1", "book-2", "book-3", "book-4", "book-5", "book-6"],
  spotlightBookId: "book-1",
  spotlightBookCustomTitle: "الإصدار الذهبي المختار | العادات الذرية",
  spotlightBookBadge: "الكتاب المميز للأسبوع 🔥",
  spotlightBookSubtitle: "تغييرات صغيرة، نتائج مبهرة - الإطار العملي المثبت لبناء عادات إيجابية والتخلص من السلبيات",

  // Payment Gateways
  vodafoneCashEnabled: true,
  vodafoneCashNumber: "01001332899",
  instapayEnabled: true,
  instapayUsername: "01001332899",
  cashOnDeliveryEnabled: true,
  paymentInstructions: "يرجى تحويل المبلغ بدقة مع إرفاق صورة إيصال التحويل لتسريع اعتماد الطلب وتفعيل القارئ الرقمي فورياً.",

  // Contact & Social
  whatsappNumber: "+201001332899",
  contactPhone: "01001332899",
  contactEmail: "contact@hawaristore.com",
  facebookUrl: "https://facebook.com/HawariStoreOfficial",
  instagramUrl: "https://instagram.com/HawariStore",
  tiktokUrl: "https://tiktok.com/@HawariStore",
  workingHours: "طوال أيام الأسبوع على مدار 24 ساعة",
  storeAddress: "جمهورية مصر العربية",

  // Dynamic Shipping Rates per Governorate
  shippingRates: GOVERNORATES_RATES,
};

// Initial Sample Users
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: "usr-admin-1",
    name: "محمد الهواري (المدير العام)",
    email: "mohamedhawary891@gmail.com",
    phone: "01001332899",
    governorate: "القاهرة",
    address: "المقر الرئيسي - مدينة نصر",
    role: "admin",
    purchasedBooks: ["book-1", "book-2", "book-3", "book-4", "book-5", "book-6"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isBlocked: false,
    notes: "مدير المتجر ومسؤول العمليات وقواعد البيانات"
  },
  {
    uid: "usr-client-1",
    name: "أحمد محمود سالم",
    email: "ahmed.salem@example.com",
    phone: "01098765432",
    governorate: "الإسكندرية",
    address: "سموحة، شارع فوزي معاذ",
    role: "customer",
    purchasedBooks: ["book-1", "book-3"],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isBlocked: false,
    notes: "عميل مميز للكتب الرقمية والروايات"
  },
  {
    uid: "usr-client-2",
    name: "سارة عبد الرحمن",
    email: "sara.abdelrahman@example.com",
    phone: "01123456789",
    governorate: "الجيزة",
    address: "الدقي، شارع مصدق",
    role: "customer",
    purchasedBooks: ["book-2", "book-5"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isBlocked: false,
    notes: "طلبت كتب ورقية وشحن سريع"
  }
];

// Initial Notifications
export const INITIAL_NOTIFICATIONS: SiteNotification[] = [
  {
    id: "notif-1",
    title: "مرحباً بك في متجر هواري!",
    message: "استكشف أحدث الكتب الورقية والرقمية المحمية مع خدمة الشحن السريع لكافة المحافظات.",
    type: "general",
    target: "all",
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: "notif-2",
    title: "عروض الأسبوع على الروايات العالمية",
    message: "تخفيضات حصرية تصل إلى 30% على أفضل الروايات والكتب الفكرية المترجمة.",
    type: "promo",
    target: "all",
    createdAt: new Date().toISOString(),
    read: false
  }
];

// Initial Books Hydration
export function getStoredBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Using initial books fallback", e);
  }
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  return INITIAL_BOOKS;
}

export function saveStoredBooks(books: Book[]) {
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
}

// Initial Orders Hydration
export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Using empty orders array", e);
  }
  return [];
}

export function saveStoredOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

// Initial Users
export function getStoredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Error reading users", e);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
}

export function saveStoredUsers(users: UserProfile[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Notifications
export function getStoredNotifications(): SiteNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Notifications error", e);
  }
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs: SiteNotification[]) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
}

// Settings
export function getStoreSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn("Settings error", e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoreSettings(settings: StoreSettings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Current User State
export function getCurrentUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Current user error", e);
  }
  return null;
}

export function setCurrentUserProfile(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Check if user is admin
export const ADMIN_EMAILS = [
  "mohamedhawary891@gmail.com",
  "admin@hawaristore.com",
  "hawary@hawaristore.com"
];

export function isUserAdmin(email?: string | null, role?: string): boolean {
  if (role === 'admin') return true;
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
