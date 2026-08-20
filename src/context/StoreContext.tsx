import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Book, 
  CartItem, 
  Order, 
  OrderStatus, 
  UserProfile, 
  StoreSettings, 
  GovernorateRate, 
  HeroSlide, 
  SiteNotification 
} from '../types';
import { 
  getStoredBooks, 
  saveStoredBooks, 
  getStoredOrders, 
  saveStoredOrders, 
  getStoredUsers, 
  saveStoredUsers, 
  getCurrentUserProfile, 
  setCurrentUserProfile, 
  getStoreSettings, 
  saveStoreSettings,
  getStoredNotifications,
  saveStoredNotifications,
  isUserAdmin,
  INITIAL_USERS,
  saveBookToFirestore,
  deleteBookFromFirestore,
  subscribeToBooks,
  signInStoreUser,
  registerStoreUser,
  signOutStoreUser,
  auth
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { MAX_PHYSICAL_BOOKS_PER_ORDER, calculateShippingCost } from '../utils/shippingEngine';

interface StoreContextType {
  books: Book[];
  cart: CartItem[];
  orders: Order[];
  allUsers: UserProfile[];
  notifications: SiteNotification[];
  currentUser: UserProfile | null;
  settings: StoreSettings;
  isAdmin: boolean;
  
  // Cart Actions
  addToCart: (book: Book, format?: 'physical' | 'digital', quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (bookId: string, format: 'physical' | 'digital') => void;
  updateQuantity: (bookId: string, format: 'physical' | 'digital', delta: number) => { success: boolean; message?: string };
  clearCart: () => void;
  physicalBooksCount: number;
  digitalBooksCount: number;
  subtotal: number;
  calculateShipping: (governorate: string) => { shippingCost: number; error?: string };

  // Book Admin Actions
  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => Promise<void>;
  updateBook: (book: Book) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;

  // Customer Management Admin Actions
  updateUser: (userId: string, data: Partial<UserProfile>) => void;
  deleteUser: (userId: string) => void;
  addUser: (userData: Omit<UserProfile, 'uid' | 'createdAt'>) => void;
  grantBookAccessToUser: (userId: string, bookId: string) => void;
  revokeBookAccessFromUser: (userId: string, bookId: string) => void;
  toggleUserBlock: (userId: string) => void;

  // Order Actions
  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    governorate: string;
    address: string;
    notes?: string;
    paymentMethod: 'vodafone_cash' | 'instapay' | 'cash_on_delivery';
    paymentSenderPhone?: string;
    paymentSenderName?: string;
    transactionScreenshot?: string;
    transactionRef?: string;
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderTracking: (orderId: string, data: { trackingNumber: string; trackingCarrier: string; trackingUrl: string; status?: OrderStatus }) => void;
  approveDigitalAccess: (orderId: string) => void;
  revokeDigitalAccess: (orderId: string) => void;

  // Notifications Actions
  sendNotification: (data: Omit<SiteNotification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notifId: string) => void;

  // User Auth Actions
  registerUser: (data: {
    name: string;
    email: string;
    phone: string;
    governorate: string;
    address: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  saveSettings: (newSettings: StoreSettings) => void;

  // Settings helpers
  updateShippingRate: (governorate: string, rate: GovernorateRate) => void;
  updateHeroSlides: (slides: HeroSlide[]) => void;
  updateCategories: (categories: string[]) => void;

  // UI state
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isLibraryOpen: boolean;
  setIsLibraryOpen: (open: boolean) => void;
  isFullCatalogOpen: boolean;
  setIsFullCatalogOpen: (open: boolean) => void;
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  activeInvoiceOrder: Order | null;
  setActiveInvoiceOrder: (order: Order | null) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  activeReadingBook: Book | null;
  setActiveReadingBook: (book: Book | null) => void;
  selectedBookDetail: Book | null;
  setSelectedBookDetail: (book: Book | null) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFormatFilter: 'all' | 'physical' | 'digital';
  setSelectedFormatFilter: (filter: 'all' | 'physical' | 'digital') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<SiteNotification[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(() => getStoreSettings());

  // UI modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isFullCatalogOpen, setIsFullCatalogOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [selectedBookDetail, setSelectedBookDetail] = useState<Book | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<'all' | 'physical' | 'digital'>('all');

  // Hydrate on mount
  useEffect(() => {
    const loadedBooks = getStoredBooks();
    setBooks(loadedBooks);

    // Firestore is the source of truth.  A live subscription also prevents a
    // stale browser cache from replacing a freshly edited catalog on refresh.
    const unsubscribeBooks = subscribeToBooks((remoteBooks) => {
      if (remoteBooks.length > 0) {
        setBooks(remoteBooks);
        saveStoredBooks(remoteBooks);
      }
    }, (err) => {
      console.warn("Firestore catalog subscription failed; using local cache:", err);
    });

    // Restore only a real Firebase session.  A localStorage role is never an
    // authorization credential and must not be treated as one.
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setCurrentUserProfile(null);
      }
    });

    const loadedOrders = getStoredOrders();
    setOrders(loadedOrders);

    const loadedUsers = getStoredUsers();
    setAllUsers(loadedUsers.length > 0 ? loadedUsers : INITIAL_USERS);

    const loadedUser = getCurrentUserProfile();
    setCurrentUser(loadedUser);

    const loadedSettings = getStoreSettings();
    setSettings(loadedSettings);

    const loadedNotifs = getStoredNotifications();
    setNotifications(loadedNotifs);

    // Load saved cart if any
    try {
      const savedCart = localStorage.getItem('hawari_store_cart_v3');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.warn("Cart load error", e);
    }
    return () => {
      unsubscribeBooks();
      unsubscribeAuth();
    };
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem('hawari_store_cart_v3', JSON.stringify(cart));
  }, [cart]);

  const isAdmin = currentUser ? isUserAdmin(currentUser.email, currentUser.role) : false;

  // Helper to reliably check if a cart item is physical or digital based on item format and book format
  const isItemPhysical = (item: CartItem): boolean => {
    if (item.selectedFormat === 'physical') return true;
    if (item.selectedFormat === 'digital') return false;
    // Fallback: if not explicitly marked digital, count as physical
    return item.book?.format !== 'digital';
  };

  const isItemDigital = (item: CartItem): boolean => {
    if (item.selectedFormat === 'digital') return true;
    if (item.selectedFormat === 'physical') return false;
    return item.book?.format === 'digital';
  };

  // Cart Calculations
  const physicalBooksCount = cart
    .filter(isItemPhysical)
    .reduce((sum, item) => sum + item.quantity, 0);

  const digitalBooksCount = cart
    .filter(isItemDigital)
    .reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.book.hasDiscount && item.book.discountPrice 
      ? item.book.discountPrice 
      : item.book.price;
    return sum + (unitPrice * item.quantity);
  }, 0);

  const calculateShipping = (governorate: string): { shippingCost: number; error?: string } => {
    return calculateShippingCost(
      governorate, 
      physicalBooksCount, 
      settings.shippingRates
    );
  };

  // Cart Handlers
  const addToCart = (book: Book, format?: 'physical' | 'digital', quantity = 1): { success: boolean; message?: string } => {
    // Resolve effective format accurately:
    // If format is explicitly specified, use it.
    // If not specified, derive from book format:
    //   'digital' => 'digital'
    //   'physical' or 'both' => 'physical'
    const effectiveFormat: 'physical' | 'digital' = format 
      ? format 
      : (book.format === 'digital' ? 'digital' : 'physical');

    if (effectiveFormat === 'physical') {
      const currentPhysicalTotal = physicalBooksCount;
      if (currentPhysicalTotal + quantity > MAX_PHYSICAL_BOOKS_PER_ORDER) {
        return {
          success: false,
          message: `عذراً، أقصى حد للكتب الورقية في نفس الطلب هو ${MAX_PHYSICAL_BOOKS_PER_ORDER} كتب.`
        };
      }
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.book.id === book.id && item.selectedFormat === effectiveFormat);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      } else {
        return [...prev, { book, quantity, selectedFormat: effectiveFormat }];
      }
    });

    return { success: true };
  };

  const removeFromCart = (bookId: string, format: 'physical' | 'digital') => {
    setCart(prev => prev.filter(item => !(item.book.id === bookId && item.selectedFormat === format)));
  };

  const updateQuantity = (bookId: string, format: 'physical' | 'digital', delta: number): { success: boolean; message?: string } => {
    const existing = cart.find(item => item.book.id === bookId && item.selectedFormat === format);
    if (!existing) return { success: false };

    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(bookId, format);
      return { success: true };
    }

    if (format === 'physical' && delta > 0) {
      if (physicalBooksCount + delta > MAX_PHYSICAL_BOOKS_PER_ORDER) {
        return {
          success: false,
          message: `أقصى عدد للكتب الورقية في الطلب هو ${MAX_PHYSICAL_BOOKS_PER_ORDER} كتب.`
        };
      }
    }

    setCart(prev => prev.map(item => {
      if (item.book.id === bookId && item.selectedFormat === format) {
        return { ...item, quantity: newQty };
      }
      return item;
    }));

    return { success: true };
  };

  const clearCart = () => {
    setCart([]);
  };

  // Book Admin Actions
  const addBook = async (bookData: Omit<Book, 'id' | 'createdAt'>) => {
    const newBook: Book = {
      ...bookData,
      id: `book-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const result = await saveBookToFirestore(newBook);
    if (!result.success) throw new Error(result.error || 'تعذر حفظ الكتاب في Firebase.');
    setBooks(prev => {
      const updated = [newBook, ...prev.filter(book => book.id !== newBook.id)];
      saveStoredBooks(updated);
      return updated;
    });
  };

  const updateBook = async (updatedBook: Book) => {
    const result = await saveBookToFirestore(updatedBook);
    if (!result.success) throw new Error(result.error || 'تعذر تحديث الكتاب في Firebase.');
    setBooks(prev => {
      const updated = prev.map(b => b.id === updatedBook.id ? updatedBook : b);
      saveStoredBooks(updated);
      return updated;
    });
  };

  const deleteBook = async (bookId: string) => {
    const result = await deleteBookFromFirestore(bookId);
    if (!result.success) throw new Error(result.error || 'تعذر حذف الكتاب من Firebase.');
    setBooks(prev => {
      const updated = prev.filter(b => b.id !== bookId);
      saveStoredBooks(updated);
      return updated;
    });
  };

  // Customer Management Admin Actions
  const updateUser = (userId: string, data: Partial<UserProfile>) => {
    const updated = allUsers.map(u => {
      if (u.uid === userId) {
        return { ...u, ...data };
      }
      return u;
    });
    setAllUsers(updated);
    saveStoredUsers(updated);

    if (currentUser?.uid === userId) {
      const updatedSelf = { ...currentUser, ...data };
      setCurrentUser(updatedSelf);
      setCurrentUserProfile(updatedSelf);
    }
  };

  const deleteUser = (userId: string) => {
    const updated = allUsers.filter(u => u.uid !== userId);
    setAllUsers(updated);
    saveStoredUsers(updated);
  };

  const addUser = (userData: Omit<UserProfile, 'uid' | 'createdAt'>) => {
    const newUser: UserProfile = {
      ...userData,
      uid: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      purchasedBooks: userData.purchasedBooks || []
    };
    const updated = [newUser, ...allUsers];
    setAllUsers(updated);
    saveStoredUsers(updated);
  };

  const grantBookAccessToUser = (userId: string, bookId: string) => {
    const targetUser = allUsers.find(u => u.uid === userId);
    if (!targetUser) return;
    const currentBooks = targetUser.purchasedBooks || [];
    if (!currentBooks.includes(bookId)) {
      const updatedPurchased = [...currentBooks, bookId];
      updateUser(userId, { purchasedBooks: updatedPurchased });

      // Target notification
      const bookObj = books.find(b => b.id === bookId);
      sendNotification({
        title: "تمت إضافة كتاب جديد إلى مكتبتك!",
        message: `قام مدير المتجر بتفعيل كتاب "${bookObj?.title || 'كتاب رقمي'}" في مكتبتك الرقمية المشفرة.`,
        type: "order",
        target: "user",
        targetUserId: userId,
        targetUserEmail: targetUser.email
      });
    }
  };

  const revokeBookAccessFromUser = (userId: string, bookId: string) => {
    const targetUser = allUsers.find(u => u.uid === userId);
    if (!targetUser) return;
    const currentBooks = targetUser.purchasedBooks || [];
    const updatedPurchased = currentBooks.filter(id => id !== bookId);
    updateUser(userId, { purchasedBooks: updatedPurchased });
  };

  const toggleUserBlock = (userId: string) => {
    const targetUser = allUsers.find(u => u.uid === userId);
    if (!targetUser) return;
    updateUser(userId, { isBlocked: !targetUser.isBlocked });
  };

  // Orders Actions
  const createOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    governorate: string;
    address: string;
    notes?: string;
    paymentMethod: 'vodafone_cash' | 'instapay' | 'cash_on_delivery';
    paymentSenderPhone?: string;
    paymentSenderName?: string;
    transactionScreenshot?: string;
    transactionRef?: string;
  }): Promise<{ success: boolean; order?: Order; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: 'سلة المشتريات فارغة' };
    }

    const { shippingCost, error: shippingErr } = calculateShipping(orderData.governorate);
    if (shippingErr) {
      return { success: false, error: shippingErr };
    }

    const orderItems = cart.map(item => {
      const unitPrice = item.book.hasDiscount && item.book.discountPrice 
        ? item.book.discountPrice 
        : item.book.price;
      return {
        bookId: item.book.id,
        title: item.book.title,
        author: item.book.author,
        quantity: item.quantity,
        format: item.selectedFormat,
        unitPrice: unitPrice,
        totalPrice: unitPrice * item.quantity,
        coverImage: item.book.coverImage
      };
    });

    const orderNum = `HW-${Date.now().toString().slice(-6)}`;

    const newOrder: Order = {
      id: orderNum,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      governorate: orderData.governorate,
      address: orderData.address,
      notes: orderData.notes,
      items: orderItems,
      physicalBooksCount: physicalBooksCount,
      digitalBooksCount: digitalBooksCount,
      booksSubtotal: subtotal,
      shippingCost: physicalBooksCount > 0 ? shippingCost : 0,
      totalAmount: subtotal + (physicalBooksCount > 0 ? shippingCost : 0),
      paymentMethod: orderData.paymentMethod,
      paymentSenderPhone: orderData.paymentSenderPhone,
      paymentSenderName: orderData.paymentSenderName,
      transactionScreenshot: orderData.transactionScreenshot,
      transactionRef: orderData.transactionRef,
      status: 'pending',
      createdAt: new Date().toISOString(),
      digitalAccessGranted: false,
      userId: currentUser?.uid,
      invoiceNumber: `INV-${orderNum}`
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);

    // Send notifications based on order format types
    if (newOrder.physicalBooksCount > 0) {
      sendNotification({
        title: "📦 طلب شحن ورقي جديد",
        message: `طلب رقم #${orderNum} من العميل "${orderData.customerName}" (${orderData.governorate}) - عدد الكتب: ${physicalBooksCount} - القيمة: ${newOrder.totalAmount} ج.م`,
        type: "order",
        target: "all"
      });
    }

    if (newOrder.digitalBooksCount > 0) {
      sendNotification({
        title: "🔒 طلب كتاب رقمي PDF بانتظار التفعيل",
        message: `طلب رقم #${orderNum} من العميل "${orderData.customerName}" يتضمن كتباً رقمية بقيمة ${newOrder.totalAmount} ج.م بانتظار مراجعتك وتفعيلك اليدوي للكتب في مكتبته.`,
        type: "order",
        target: "all"
      });
    }

    // Clear cart after checkout
    clearCart();

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status };
      }
      return o;
    });
    setOrders(updated);
    saveStoredOrders(updated);

    if (targetOrder) {
      const statusLabels: Record<OrderStatus, string> = {
        pending: 'قيد المراجعة والتدقيق',
        approved: 'تم تأكيد واعتماد الطلب',
        in_transit: 'تم تسليم الشحنة لشركة الشحن وجاري التوصيل',
        delivered: 'تم تسليم الطلب بنجاح',
        cancelled: 'تم إلغاء الطلب'
      };

      sendNotification({
        title: `تحديث حالة طلبك #${orderId}`,
        message: `أصبحت حالة طلبك الآن: "${statusLabels[status] || status}".`,
        type: "order",
        target: "user",
        targetUserEmail: targetOrder.customerEmail,
        targetUserId: targetOrder.userId
      });
    }
  };

  const updateOrderTracking = (orderId: string, data: { trackingNumber: string; trackingCarrier: string; trackingUrl: string; status?: OrderStatus }) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          trackingNumber: data.trackingNumber,
          trackingCarrier: data.trackingCarrier,
          trackingUrl: data.trackingUrl,
          status: data.status || o.status
        };
      }
      return o;
    });
    setOrders(updated);
    saveStoredOrders(updated);

    if (targetOrder) {
      sendNotification({
        title: `🚚 تم إصدار بيانات تتبع شحنتك #${orderId}`,
        message: `الناقل: ${data.trackingCarrier} | رقم التتبع: ${data.trackingNumber}. يمكنك متابعة مسار الشحنة الآن.`,
        type: "order",
        target: "user",
        targetUserEmail: targetOrder.customerEmail,
        targetUserId: targetOrder.userId
      });
    }
  };

  const approveDigitalAccess = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    // Grant access in order
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, digitalAccessGranted: true, status: 'approved' as OrderStatus };
      }
      return o;
    });
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);

    // Also add digital books to user profile if user exists
    const digitalBookIds = targetOrder.items
      .filter(i => i.format === 'digital')
      .map(i => i.bookId);

    const digitalTitles = targetOrder.items
      .filter(i => i.format === 'digital')
      .map(i => i.title)
      .join('، ');

    if (digitalBookIds.length > 0) {
      const allStoredUsers = getStoredUsers();
      const updatedUsers = allStoredUsers.map(u => {
        if (
          (targetOrder.customerEmail && u.email.toLowerCase() === targetOrder.customerEmail.toLowerCase()) || 
          (targetOrder.userId && u.uid === targetOrder.userId)
        ) {
          const combinedPurchases = Array.from(new Set([...(u.purchasedBooks || []), ...digitalBookIds]));
          return { ...u, purchasedBooks: combinedPurchases };
        }
        return u;
      });
      setAllUsers(updatedUsers);
      saveStoredUsers(updatedUsers);

      // If current user is the buyer, update active user state
      if (
        currentUser && 
        ((targetOrder.customerEmail && currentUser.email.toLowerCase() === targetOrder.customerEmail.toLowerCase()) || 
         (targetOrder.userId && currentUser.uid === targetOrder.userId))
      ) {
        const updatedSelf = {
          ...currentUser,
          purchasedBooks: Array.from(new Set([...(currentUser.purchasedBooks || []), ...digitalBookIds]))
        };
        setCurrentUser(updatedSelf);
        setCurrentUserProfile(updatedSelf);
      }

      // Notify the customer
      sendNotification({
        title: "🎉 تم تفعيل كتابك الرقمي للقراءة بنجاح!",
        message: `تم اعتماد طلبك #${targetOrder.id} وتفعيل كتبك الرقمية (${digitalTitles}) في مكتبتك المشفرة. يمكنك القراءة الآن!`,
        type: "order",
        target: "user",
        targetUserEmail: targetOrder.customerEmail,
        targetUserId: targetOrder.userId
      });
    }
  };

  const revokeDigitalAccess = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    // Revoke access in order
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, digitalAccessGranted: false };
      }
      return o;
    });
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);

    const digitalBookIds = targetOrder.items
      .filter(i => i.format === 'digital')
      .map(i => i.bookId);

    if (digitalBookIds.length > 0) {
      const allStoredUsers = getStoredUsers();
      const updatedUsers = allStoredUsers.map(u => {
        if (
          (targetOrder.customerEmail && u.email.toLowerCase() === targetOrder.customerEmail.toLowerCase()) || 
          (targetOrder.userId && u.uid === targetOrder.userId)
        ) {
          const filtered = (u.purchasedBooks || []).filter(id => !digitalBookIds.includes(id));
          return { ...u, purchasedBooks: filtered };
        }
        return u;
      });
      setAllUsers(updatedUsers);
      saveStoredUsers(updatedUsers);

      if (
        currentUser && 
        ((targetOrder.customerEmail && currentUser.email.toLowerCase() === targetOrder.customerEmail.toLowerCase()) || 
         (targetOrder.userId && currentUser.uid === targetOrder.userId))
      ) {
        const updatedSelf = {
          ...currentUser,
          purchasedBooks: (currentUser.purchasedBooks || []).filter(id => !digitalBookIds.includes(id))
        };
        setCurrentUser(updatedSelf);
        setCurrentUserProfile(updatedSelf);
      }

      sendNotification({
        title: "⚠️ تم تعليق صلاحية الكتاب الرقمي",
        message: `تم إلغاء تفعيل صلاحية الكتب الرقمية للطلب #${targetOrder.id} من قبل إدارة المتجر.`,
        type: "alert",
        target: "user",
        targetUserEmail: targetOrder.customerEmail,
        targetUserId: targetOrder.userId
      });
    }
  };

  // Notifications Handlers
  const sendNotification = (data: Omit<SiteNotification, 'id' | 'createdAt'>) => {
    const newNotif: SiteNotification = {
      ...data,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const markNotificationAsRead = (notifId: string) => {
    const updated = notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  // Auth Handlers
  const registerUser = async (data: {
    name: string;
    email: string;
    phone: string;
    governorate: string;
    address: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!data.password) return { success: false, error: 'يرجى إدخال كلمة المرور.' };
    try {
      const newUser = await registerStoreUser({ ...data, password: data.password });
      setAllUsers(prev => [...prev.filter(user => user.uid !== newUser.uid), newUser]);
      setCurrentUser(newUser);
      setCurrentUserProfile(newUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'تعذر إنشاء الحساب في Firebase.' };
    }
  };

  const loginUser = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!password) return { success: false, error: 'يرجى إدخال كلمة المرور.' };
    try {
      const user = await signInStoreUser(email, password);
      if (user.isBlocked) {
        await signOutStoreUser();
        return { success: false, error: 'تم إيقاف هذا الحساب من قِبل إدارة المتجر. يرجى التواصل مع الدعم.' };
      }
      setAllUsers(prev => [...prev.filter(profile => profile.uid !== user.uid), user]);
      setCurrentUser(user);
      setCurrentUserProfile(user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }
  };

  const logoutUser = () => {
    signOutStoreUser().catch((error) => console.warn('Firebase logout failed:', error));
    setCurrentUser(null);
    setCurrentUserProfile(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setCurrentUserProfile(updated);

    const allStoredUsers = getStoredUsers();
    const updatedAll = allStoredUsers.map(u => u.uid === currentUser.uid ? updated : u);
    setAllUsers(updatedAll);
    saveStoredUsers(updatedAll);
  };

  const saveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveStoreSettings(newSettings);
  };

  const updateShippingRate = (governorate: string, rate: GovernorateRate) => {
    const updatedRates = {
      ...settings.shippingRates,
      [governorate]: rate
    };
    const updated = { ...settings, shippingRates: updatedRates };
    saveSettings(updated);
  };

  const updateHeroSlides = (slides: HeroSlide[]) => {
    const updated = { ...settings, heroSlides: slides };
    saveSettings(updated);
  };

  const updateCategories = (categories: string[]) => {
    const updated = { ...settings, categories };
    saveSettings(updated);
  };

  return (
    <StoreContext.Provider
      value={{
        books,
        cart,
        orders,
        allUsers,
        notifications,
        currentUser,
        settings,
        isAdmin,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        physicalBooksCount,
        digitalBooksCount,
        subtotal,
        calculateShipping,
        addBook,
        updateBook,
        deleteBook,
        updateUser,
        deleteUser,
        addUser,
        grantBookAccessToUser,
        revokeBookAccessFromUser,
        toggleUserBlock,
        createOrder,
        updateOrderStatus,
        updateOrderTracking,
        approveDigitalAccess,
        revokeDigitalAccess,
        sendNotification,
        markNotificationAsRead,
        registerUser,
        loginUser,
        logoutUser,
        updateProfile,
        saveSettings,
        updateShippingRate,
        updateHeroSlides,
        updateCategories,
        isCartOpen,
        setIsCartOpen,
        isAuthOpen,
        setIsAuthOpen,
        isAdminOpen,
        setIsAdminOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isLibraryOpen,
        setIsLibraryOpen,
        isFullCatalogOpen,
        setIsFullCatalogOpen,
        isTrackingModalOpen,
        setIsTrackingModalOpen,
        activeTrackingOrder,
        setActiveTrackingOrder,
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        activeInvoiceOrder,
        setActiveInvoiceOrder,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        activeReadingBook,
        setActiveReadingBook,
        selectedBookDetail,
        setSelectedBookDetail,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedFormatFilter,
        setSelectedFormatFilter,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
