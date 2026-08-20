export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  format: 'physical' | 'digital' | 'both';
  price: number;
  hasDiscount: boolean;
  discountPrice?: number;
  description: string;
  coverImage: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfDataUrl?: string; // Stored base64/blob for uploaded PDF
  pdfContent?: string[]; // fallback page contents for secure reader
  pages: number;
  samplePagesCount: number; // number of pages allowed to read before purchase (e.g. 5)
  stock: number;
  featured?: boolean;
  rating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt?: string;
  isbn?: string;
  fileSize?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
  selectedFormat: 'physical' | 'digital';
}

export type OrderStatus = 'pending' | 'approved' | 'in_transit' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  governorate: string;
  address: string;
  notes?: string;
  items: {
    bookId: string;
    title: string;
    author: string;
    quantity: number;
    format: 'physical' | 'digital';
    unitPrice: number;
    totalPrice: number;
    coverImage: string;
  }[];
  physicalBooksCount: number;
  digitalBooksCount: number;
  booksSubtotal: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: 'vodafone_cash' | 'instapay' | 'cash_on_delivery';
  paymentSenderPhone?: string;
  paymentSenderName?: string;
  transactionScreenshot?: string;
  transactionRef?: string;
  status: OrderStatus;
  createdAt: string;
  digitalAccessGranted: boolean;
  userId?: string;
  // Shipment tracking & Invoicing
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
  invoiceNumber?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  governorate: string;
  address: string;
  role: 'admin' | 'customer';
  purchasedBooks: string[]; // IDs of books purchased digitally
  createdAt: string;
  isBlocked?: boolean;
  notes?: string;
}

export interface GovernorateRate {
  name: string;
  nameEn: string;
  tier1to3: number;
  tier4to6: number;
  tier7to10: number;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  ctaText: string;
  category: string;
}

export interface SiteNotification {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'promo' | 'order' | 'alert';
  target: 'all' | 'user';
  targetUserId?: string;
  targetUserEmail?: string;
  createdAt: string;
  read?: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  themeColor: string;
  
  // Announcement bar
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink?: string;

  // Bestsellers & Sections
  bestsellersEnabled: boolean;
  bestsellersTitle: string;
  bestsellersBadge: string;
  catalogTitle: string;

  // 6 Homepage Curated Books & 7th Spotlight Book
  featuredBookIds: string[]; // 6 custom selected books for homepage
  spotlightBookId: string; // The 7th highlighted book
  spotlightBookCustomTitle: string; // Custom headline or name given by admin
  spotlightBookBadge: string; // Custom badge e.g. "كتاب الشهر المختار"
  spotlightBookSubtitle?: string;

  // Hero Slides (Animated Carousel in Middle)
  heroSlides: HeroSlide[];

  // Categories list
  categories: string[];

  // Payment gateways
  vodafoneCashEnabled: boolean;
  vodafoneCashNumber: string;
  instapayEnabled: boolean;
  instapayUsername: string;
  cashOnDeliveryEnabled: boolean;
  paymentInstructions: string;

  // Social & Contact
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  workingHours: string;
  storeAddress: string;

  // Shipping Rates (dynamically editable per governorate)
  shippingRates: Record<string, GovernorateRate>;
}
