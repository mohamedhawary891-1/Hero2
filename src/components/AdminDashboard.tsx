import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Save, 
  Search, 
  FileText, 
  BookOpen, 
  ShieldCheck, 
  Server, 
  Database, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Copy, 
  ExternalLink,
  MessageSquare,
  Lock,
  LockKeyhole,
  FileCheck,
  RefreshCw,
  Clock,
  Sparkles,
  Layers,
  Settings,
  Phone,
  Image as ImageIcon,
  Palette,
  Sliders,
  Megaphone,
  FolderPlus,
  Send,
  Download,
  Bell,
  Package,
  PackageSearch,
  Check,
  Printer,
  Star,
  Flame,
  Edit,
  Loader2,
  MessageCircle,
  Undo2,
  CheckSquare,
  XCircle,
  Info
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Book, Order, OrderStatus, UserProfile, HeroSlide, GovernorateRate, SiteNotification } from '../types';
import { HawariLogo } from './HawariLogo';
import { EGYPT_GOVERNORATES_LIST } from '../utils/shippingEngine';
import { AdminCustomersTab } from './admin/AdminCustomersTab';
import { 
  uploadBookCoverFile, 
  uploadBookPdfFile, 
  validateCoverImageFile, 
  validatePdfBookFile 
} from '../services/firebase';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    books, 
    orders, 
    allUsers,
    notifications,
    currentUser, 
    isAdmin, 
    addBook, 
    updateBook, 
    deleteBook, 
    updateOrderStatus, 
    updateOrderTracking,
    approveDigitalAccess, 
    revokeDigitalAccess,
    sendNotification,
    settings, 
    saveSettings, 
    updateShippingRate, 
    updateHeroSlides, 
    updateCategories,
    loginUser,
    setActiveReadingBook,
    setIsInvoiceModalOpen,
    setActiveInvoiceOrder,
    setIsTrackingModalOpen,
    setActiveTrackingOrder
  } = useStore();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'physical_books' | 'digital_books' | 'curation' | 'users' | 'orders' | 'orders_physical' | 'orders_digital' | 'banners' | 'notifications' | 'shipping' | 'categories' | 'design' | 'payments' | 'server'
  >('overview');

  // Homepage Curation State (6 books + 7th spotlight book)
  const [curatedFeaturedIds, setCuratedFeaturedIds] = useState<string[]>(
    settings.featuredBookIds && settings.featuredBookIds.length > 0
      ? settings.featuredBookIds
      : books.slice(0, 6).map(b => b.id)
  );
  const [curatedSpotlightId, setCuratedSpotlightId] = useState<string>(
    settings.spotlightBookId || books[0]?.id || ''
  );
  const [curatedSpotlightTitle, setCuratedSpotlightTitle] = useState<string>(
    settings.spotlightBookCustomTitle || ''
  );
  const [curatedSpotlightBadge, setCuratedSpotlightBadge] = useState<string>(
    settings.spotlightBookBadge || 'الكتاب المميز للأسبوع 🔥'
  );
  const [curatedSpotlightSubtitle, setCuratedSpotlightSubtitle] = useState<string>(
    settings.spotlightBookSubtitle || ''
  );
  const [curationSavedSuccess, setCurationSavedSuccess] = useState(false);

  // Category Edit State
  const [editingCategoryOldName, setEditingCategoryOldName] = useState<string | null>(null);
  const [editingCategoryNewName, setEditingCategoryNewName] = useState<string>('');

  // Secure Admin Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  // Book Form State (Physical & Digital)
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookCategory, setBookCategory] = useState(settings.categories[1] || 'روايات');
  const [bookFormat, setBookFormat] = useState<'physical' | 'digital' | 'both'>('both');
  const [bookPrice, setBookPrice] = useState(120);
  const [bookHasDiscount, setBookHasDiscount] = useState(false);
  const [bookDiscountPrice, setBookDiscountPrice] = useState(95);
  const [bookDescription, setBookDescription] = useState('');
  const [bookCoverImage, setBookCoverImage] = useState('');
  const [bookPdfFileName, setBookPdfFileName] = useState('');
  const [bookPdfDataUrl, setBookPdfDataUrl] = useState('');
  const [bookFileSize, setBookFileSize] = useState('');
  const [bookPages, setBookPages] = useState(250);
  const [bookSamplePagesCount, setBookSamplePagesCount] = useState(5);
  const [bookStock, setBookStock] = useState(50);
  const [bookFeatured, setBookFeatured] = useState(false);
  const [bookIsbn, setBookIsbn] = useState('');
  const [bookPdfContent, setBookPdfContent] = useState<string>('');

  // Firebase Storage & Upload Progress States
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const [isCoverDragOver, setIsCoverDragOver] = useState(false);
  const [isPdfDragOver, setIsPdfDragOver] = useState(false);

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [coverUploadError, setCoverUploadError] = useState('');
  const [coverUploadSuccess, setCoverUploadSuccess] = useState('');

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [pdfUploadError, setPdfUploadError] = useState('');
  const [pdfUploadSuccess, setPdfUploadSuccess] = useState('');

  const [isSavingBook, setIsSavingBook] = useState(false);
  const [bookFormError, setBookFormError] = useState('');
  const [bookSaveToast, setBookSaveToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter in Books
  const [searchBookTerm, setSearchBookTerm] = useState('');
  const [filterBookCategory, setFilterBookCategory] = useState('الكل');

  // Orders Management State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [physicalOrderStatusFilter, setPhysicalOrderStatusFilter] = useState<string>('all');
  const [digitalOrderActivationFilter, setDigitalOrderActivationFilter] = useState<'all' | 'unactivated' | 'activated'>('all');
  const [searchOrderTerm, setSearchOrderTerm] = useState('');
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);

  // Tracking Modal State inside Dashboard
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackingCarrierInput, setTrackingCarrierInput] = useState('شركة بوسطة للشحن (Bosta)');
  const [trackingUrlInput, setTrackingUrlInput] = useState('');
  const [trackingStatusInput, setTrackingStatusInput] = useState<OrderStatus>('in_transit');

  // Banner Slides Editor State
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideImage, setNewSlideImage] = useState('https://images.unsplash.com/photo-1507842229450-7907e4d5da99?auto=format&fit=crop&q=80&w=1200');
  const [newSlideBadge, setNewSlideBadge] = useState('عروض حصرية');
  const [newSlideCtaText, setNewSlideCtaText] = useState('تصفح الآن');
  const [newSlideCategory, setNewSlideCategory] = useState('الكل');

  // Notifications State
  const [notifTarget, setNotifTarget] = useState<'all' | 'user'>('all');
  const [notifTargetEmail, setNotifTargetEmail] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'general' | 'promo' | 'order' | 'alert'>('general');
  const [notifSentSuccess, setNotifSentSuccess] = useState(false);

  // Category Editor State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Shipping Rates Editor State
  const [selectedGovForEdit, setSelectedGovForEdit] = useState(EGYPT_GOVERNORATES_LIST[0]);
  const [editTier1to3, setEditTier1to3] = useState(77);
  const [editTier4to6, setEditTier4to6] = useState(90);
  const [editTier7to10, setEditTier7to10] = useState(125);
  const [shippingSaveSuccess, setShippingSaveSuccess] = useState(false);

  // Branding & Settings State
  const [brandStoreName, setBrandStoreName] = useState(settings.storeName);
  const [brandTagline, setBrandTagline] = useState(settings.tagline);
  const [brandAnnouncement, setBrandAnnouncement] = useState(settings.announcementText);
  const [brandAnnouncementEnabled, setBrandAnnouncementEnabled] = useState(settings.announcementEnabled);
  const [brandBestsellersTitle, setBrandBestsellersTitle] = useState(settings.bestsellersTitle);
  const [brandVodafoneNumber, setBrandVodafoneNumber] = useState(settings.vodafoneCashNumber);
  const [brandInstapayUser, setBrandInstapayUser] = useState(settings.instapayUsername);
  const [brandWhatsappNumber, setBrandWhatsappNumber] = useState(settings.whatsappNumber);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  if (!isAdminOpen) return null;

  // SECURE AUTHENTICATION GATE
  if (!isAdmin) {
    const handleAdminLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAdminAuthError('');
      setAdminAuthLoading(true);

      const result = await loginUser(adminEmail, adminPassword);
      setAdminAuthLoading(false);

      if (!result.success) {
        setAdminAuthError('البريد الإلكتروني أو كلمة المرور غير مطابقة لحساب المدير المعتمد.');
      }
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-orange-600/20 text-orange-500 border border-orange-500/30 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">بوابة المشرفين الآمنة | Hawari Store</h3>
            <p className="text-xs text-slate-400">
              هذه اللوحة مخصصة لإدارة متجر هواري فقط ومحمية بتشفير Firebase.
            </p>
          </div>

          {adminAuthError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{adminAuthError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-right">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">البريد الإلكتروني للمشرف</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="name@hawaristore.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                dir="ltr"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">كلمة المرور المشفرة</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={adminAuthLoading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition shadow-lg flex items-center justify-center gap-2"
            >
              {adminAuthLoading ? 'جاري التحقق...' : 'دخول لوحة التحكم المعتمدة'}
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- STATS CALCULATIONS ---
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0);
  const totalPhysicalOrders = orders.filter(o => o.physicalBooksCount > 0).length;
  const totalDigitalOrders = orders.filter(o => o.digitalBooksCount > 0).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  // Robust File Processors for Cover and PDF (Files, Drops, Clipboard Pastes)
  const processCoverFile = async (file: File) => {
    if (!file) return;

    setCoverUploadError('');
    setCoverUploadSuccess('');

    const validation = validateCoverImageFile(file);
    if (!validation.valid) {
      setCoverUploadError(validation.error || 'نوع الملف أو حجمه غير مطابق للمواصفات.');
      return;
    }

    setIsUploadingCover(true);
    setCoverUploadProgress(20);

    try {
      const result = await uploadBookCoverFile(file, (percent) => {
        setCoverUploadProgress(percent);
      });

      setBookCoverImage(result.url);
      setCoverUploadSuccess(
        result.source === 'storage'
          ? 'تم رفع صورة الغلاف بنجاح إلى خادم Firebase Storage ✓'
          : 'تم تجهيز وحفظ صورة الغلاف بنجاح ✓'
      );
    } catch (err: any) {
      setCoverUploadError(err?.message || 'حدث خطأ أثناء رفع صورة الغلاف.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const processPdfFile = async (file: File) => {
    if (!file) return;

    setPdfUploadError('');
    setPdfUploadSuccess('');

    const validation = validatePdfBookFile(file);
    if (!validation.valid) {
      setPdfUploadError(validation.error || 'نوع الملف أو حجمه غير مطابق للمواصفات.');
      return;
    }

    setIsUploadingPdf(true);
    setPdfUploadProgress(20);
    setBookPdfFileName(file.name);
    setBookFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    try {
      const result = await uploadBookPdfFile(file, (percent) => {
        setPdfUploadProgress(percent);
      });

      setBookPdfDataUrl(result.url);
      setPdfUploadSuccess(
        result.source === 'storage'
          ? `تم رفع وتشفير ملف الكتاب (${file.name}) إلى Firebase Storage بنجاح ✓`
          : `تم تجهيز ملف الكتاب (${file.name}) بنجاح ✓`
      );
    } catch (err: any) {
      setPdfUploadError(err?.message || 'حدث خطأ أثناء رفع ملف الـ PDF.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCoverFile(file);
    }
    e.target.value = '';
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPdfFile(file);
    }
    e.target.value = '';
  };

  const handleModalPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processCoverFile(file);
          break;
        }
      }
    }
  };

  const handleHeroSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewSlideImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Book Form for Editing or New
  const openNewBookForm = (formatDefault: 'physical' | 'digital') => {
    setEditingBookId(null);
    setBookTitle('');
    setBookAuthor('');
    setBookCategory(settings.categories[1] || 'روايات');
    setBookFormat(formatDefault);
    setBookPrice(120);
    setBookHasDiscount(false);
    setBookDiscountPrice(95);
    setBookDescription('');
    setBookCoverImage('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400');
    setBookPdfFileName('');
    setBookPdfDataUrl('');
    setBookFileSize('');
    setBookPages(250);
    setBookSamplePagesCount(5);
    setBookStock(50);
    setBookFeatured(false);
    setBookIsbn('');
    setBookPdfContent('');
    
    // Clear validation & upload states
    setCoverUploadError('');
    setCoverUploadSuccess('');
    setPdfUploadError('');
    setPdfUploadSuccess('');
    setBookFormError('');
    setCoverUploadProgress(0);
    setPdfUploadProgress(0);
    
    setIsBookFormOpen(true);
  };

  const handleEditBookClick = (book: Book) => {
    setEditingBookId(book.id);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookCategory(book.category);
    setBookFormat(book.format);
    setBookPrice(book.price);
    setBookHasDiscount(book.hasDiscount);
    setBookDiscountPrice(book.discountPrice || Math.round(book.price * 0.8));
    setBookDescription(book.description);
    setBookCoverImage(book.coverImage);
    setBookPdfFileName(book.pdfFileName || '');
    setBookPdfDataUrl(book.pdfDataUrl || '');
    setBookFileSize(book.fileSize || '');
    setBookPages(book.pages);
    setBookSamplePagesCount(book.samplePagesCount || 5);
    setBookStock(book.stock);
    setBookFeatured(book.featured || false);
    setBookIsbn(book.isbn || '');
    setBookPdfContent(book.pdfContent?.join('\n\n--- صفحة جديدة ---\n\n') || '');

    // Clear validation & upload states
    setCoverUploadError('');
    setCoverUploadSuccess('');
    setPdfUploadError('');
    setPdfUploadSuccess('');
    setBookFormError('');
    setCoverUploadProgress(0);
    setPdfUploadProgress(0);

    setIsBookFormOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookFormError('');

    if (!bookTitle.trim()) {
      setBookFormError('يرجى إدخال عنوان الكتاب.');
      return;
    }
    if (!bookAuthor.trim()) {
      setBookFormError('يرجى إدخال اسم المؤلف أو دار النشر.');
      return;
    }
    if (isUploadingCover || isUploadingPdf) {
      setBookFormError('يرجى الانتظار حتى اكتمال رفع الملفات الحالية إلى Firebase Storage.');
      return;
    }

    setIsSavingBook(true);

    try {
      const pdfPagesArray = bookPdfContent.trim()
        ? bookPdfContent.split('--- صفحة جديدة ---').map(p => p.trim())
        : undefined;

      const bookPayload = {
        title: bookTitle.trim(),
        author: bookAuthor.trim(),
        category: bookCategory,
        format: bookFormat,
        price: Number(bookPrice),
        hasDiscount: bookHasDiscount,
        discountPrice: bookHasDiscount ? Number(bookDiscountPrice) : undefined,
        description: bookDescription.trim(),
        coverImage: bookCoverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        pdfFileName: bookPdfFileName,
        pdfDataUrl: bookPdfDataUrl,
        fileSize: bookFileSize,
        pages: Number(bookPages),
        samplePagesCount: Number(bookSamplePagesCount),
        stock: Number(bookStock),
        featured: bookFeatured,
        isbn: bookIsbn.trim() || undefined,
        pdfContent: pdfPagesArray
      };

      if (editingBookId) {
        await updateBook({
          ...bookPayload,
          id: editingBookId,
          createdAt: books.find(b => b.id === editingBookId)?.createdAt || new Date().toISOString()
        });
        setBookSaveToast({
          title: 'تم تحديث الكتاب',
          message: `تم حفظ وتحديث بيانات كتاب "${bookTitle}" بنجاح في قاعدة بيانات Firestore.`,
          type: 'success'
        });
      } else {
        await addBook(bookPayload);
        setBookSaveToast({
          title: 'تم إضافة الكتاب',
          message: `تم إنشاء وإدراج كتاب "${bookTitle}" بنجاح في قاعدة بيانات Firestore.`,
          type: 'success'
        });
      }

      setIsBookFormOpen(false);
      setTimeout(() => setBookSaveToast(null), 4500);
    } catch (err: any) {
      setBookFormError(err?.message || 'حدث خطأ أثناء حفظ الكتاب.');
    } finally {
      setIsSavingBook(false);
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!window.confirm(`هل تريد حذف كتاب "${book.title}" نهائيًا؟`)) return;
    try {
      await deleteBook(book.id);
      setBookSaveToast({
        title: 'تم حذف الكتاب',
        message: `تم حذف "${book.title}" من Firebase بنجاح.`,
        type: 'success'
      });
      setTimeout(() => setBookSaveToast(null), 4500);
    } catch (error: any) {
      setBookSaveToast({
        title: 'تعذر الحذف',
        message: error?.message || 'تعذر حذف الكتاب من Firebase.',
        type: 'error'
      });
    }
  };

  // Tracking Modal Save
  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalOrder) return;

    updateOrderTracking(trackingModalOrder.id, {
      trackingNumber: trackingNumberInput.trim(),
      trackingCarrier: trackingCarrierInput.trim(),
      trackingUrl: trackingUrlInput.trim(),
      status: trackingStatusInput
    });

    // Also send a notification to the customer
    sendNotification({
      title: `تحديث شحنة الطلب #${trackingModalOrder.id}`,
      message: `تم تحديث حالة الشحنة إلى (${trackingStatusInput === 'delivered' ? 'تم التسليم' : 'جاري الشحن والتوصيل'}) مع شركة ${trackingCarrierInput}. رقم البوليصة: ${trackingNumberInput}.`,
      type: 'order',
      target: 'user',
      targetUserEmail: trackingModalOrder.customerEmail,
      targetUserId: trackingModalOrder.userId
    });

    setTrackingModalOrder(null);
  };

  // Notifications Dispatch
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    sendNotification({
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: notifType,
      target: notifTarget,
      targetUserEmail: notifTarget === 'user' ? notifTargetEmail : undefined,
    });

    setNotifTitle('');
    setNotifMessage('');
    setNotifSentSuccess(true);
    setTimeout(() => setNotifSentSuccess(false), 3000);
  };

  // Save Settings & Branding
  const handleSaveAllSettings = () => {
    const updated = {
      ...settings,
      storeName: brandStoreName,
      tagline: brandTagline,
      announcementText: brandAnnouncement,
      announcementEnabled: brandAnnouncementEnabled,
      bestsellersTitle: brandBestsellersTitle,
      vodafoneCashNumber: brandVodafoneNumber,
      instapayUsername: brandInstapayUser,
      whatsappNumber: brandWhatsappNumber
    };
    saveSettings(updated);
    setSettingsSavedSuccess(true);
    setTimeout(() => setSettingsSavedSuccess(false), 3000);
  };

  // Filtered Books Lists
  const physicalBooksList = books.filter(b => b.format === 'physical' || b.format === 'both');
  const digitalBooksList = books.filter(b => b.format === 'digital' || b.format === 'both');

  // Separated Order Lists
  const physicalOrdersList = orders.filter(o => o.physicalBooksCount > 0 || o.items.some(i => i.format === 'physical'));
  const pendingPhysicalOrdersCount = physicalOrdersList.filter(o => o.status === 'pending').length;

  const digitalOrdersList = orders.filter(o => o.digitalBooksCount > 0 || o.items.some(i => i.format === 'digital'));
  const pendingDigitalActivationCount = digitalOrdersList.filter(o => !o.digitalAccessGranted).length;

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (searchOrderTerm) {
      const term = searchOrderTerm.toLowerCase();
      return (
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerPhone.includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        o.governorate.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const filteredPhysicalOrders = physicalOrdersList.filter(o => {
    if (physicalOrderStatusFilter !== 'all' && o.status !== physicalOrderStatusFilter) return false;
    if (searchOrderTerm) {
      const term = searchOrderTerm.toLowerCase();
      return (
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerPhone.includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        o.governorate.toLowerCase().includes(term) ||
        (o.paymentSenderName && o.paymentSenderName.toLowerCase().includes(term)) ||
        (o.paymentSenderPhone && o.paymentSenderPhone.includes(term))
      );
    }
    return true;
  });

  const filteredDigitalOrders = digitalOrdersList.filter(o => {
    if (digitalOrderActivationFilter === 'unactivated' && o.digitalAccessGranted) return false;
    if (digitalOrderActivationFilter === 'activated' && !o.digitalAccessGranted) return false;
    if (searchOrderTerm) {
      const term = searchOrderTerm.toLowerCase();
      return (
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerPhone.includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        (o.paymentSenderName && o.paymentSenderName.toLowerCase().includes(term)) ||
        (o.paymentSenderPhone && o.paymentSenderPhone.includes(term))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-md flex flex-col font-sans text-slate-100">
      
      {/* 1. TOP CONTROL BAR */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <HawariLogo variant="emblem" size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-white text-base">لوحة القيادة والتحكم الشامل | Hawari CMS</h2>
              <span className="text-[10px] bg-orange-600 text-white font-black px-2 py-0.5 rounded-md">
                Admin Super Suite
              </span>
            </div>
            <p className="text-[11px] text-slate-400">إدارة الكتب الورقية، الخزينة الرقمية، الشحنات، السلايدر، والإشعارات</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span>معاينة المتجر المباشر</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toast Notification for Book Saves & Actions */}
      {bookSaveToast && (
        <div className={`px-6 py-3 border-b flex items-center justify-between text-xs font-bold transition-all ${
          bookSaveToast.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
            : 'bg-rose-950/80 border-rose-800/80 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {bookSaveToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-black ml-2 text-white">{bookSaveToast.title}:</span>
              <span>{bookSaveToast.message}</span>
            </div>
          </div>
          <button 
            onClick={() => setBookSaveToast(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. MAIN WORKSPACE WITH SIDEBAR NAVIGATION */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800 p-3 space-y-1 overflow-y-auto shrink-0">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'overview' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>الإحصائيات والمبيعات</span>
          </button>

          <div className="pt-2 pb-1 px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            إدارة المخزون والمحتوى
          </div>

          <button
            onClick={() => setActiveTab('physical_books')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'physical_books' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>الكتب الورقية والمخزون</span>
          </button>

          <button
            onClick={() => setActiveTab('digital_books')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'digital_books' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LockKeyhole className="w-4 h-4 text-emerald-400" />
            <span>الكتب الرقمية والـ PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('curation')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'curation' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>تخصيص الـ 6 كتب والكتاب السابع</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'users' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>حسابات العملاء والمشرفين</span>
          </button>

          <div className="pt-2 pb-1 px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            أقسام إدارة الطلبات والتفعيل
          </div>

          {/* Physical Orders Tab */}
          <button
            onClick={() => setActiveTab('orders_physical')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'orders_physical' || activeTab === 'orders' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>طلبات الكتب الورقية والشحن</span>
            </div>
            {pendingPhysicalOrdersCount > 0 && (
              <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full" title="طلبات ورقية جديدة قيد المراجعة">
                {pendingPhysicalOrdersCount}
              </span>
            )}
          </button>

          {/* Digital Orders & Activation Tab */}
          <button
            onClick={() => setActiveTab('orders_digital')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'orders_digital' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LockKeyhole className="w-4 h-4 text-emerald-400" />
              <span>طلبات وتفعيل الكتب الرقمية</span>
            </div>
            {pendingDigitalActivationCount > 0 && (
              <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full animate-pulse" title="كتب رقمية بانتظار تفعيل الإدارة">
                {pendingDigitalActivationCount}
              </span>
            )}
          </button>

          <div className="pt-2 pb-1 px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            المظهر والشاشة والتواصل
          </div>

          <button
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'banners' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>الشاشة المتحركة (السلايدر)</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'notifications' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>إرسال الإشعارات للعملاء</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'shipping' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>أسعار شحن الـ 27 محافظة</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'categories' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>أقسام وتصنيفات الكتب</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'design' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>الهوية والنصوص والشريط</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'payments' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>فودافون كاش وإنستاباي</span>
          </button>

          <button
            onClick={() => setActiveTab('server')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right ${
              activeTab === 'server' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>الخادم والنسخ الاحتياطي</span>
          </button>

        </div>

        {/* Dynamic Tab Workspace View */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h3 className="text-xl font-black text-white">مركز القيادة والإحصائيات الحية</h3>
                <p className="text-xs text-slate-400">متابعة شاملة للمبيعات، شحنات الكتب الورقية، وتراخيص القراءة الرقمية</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                  <div className="p-3.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">إجمالي المبيعات</div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">{totalSales} ج.م</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                  <div className="p-3.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">الكتب الورقية بالمخزن</div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">{physicalBooksList.length} كتاب</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                  <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <LockKeyhole className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">الكتب الرقمية المشفرة</div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">{digitalBooksList.length} PDF</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                  <div className="p-3.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">العملاء المسجلين</div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">{allUsers.length} عميل</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-white">إجراءات سريعة ومباشرة:</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('physical_books');
                      openNewBookForm('physical');
                    }}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة كتاب ورقي جديد</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('digital_books');
                      openNewBookForm('digital');
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>رفع ملف PDF ورقمي مشفر</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('banners')}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>تعديل السلايدر المتحرك</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>إرسال إشعار للعملاء</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHYSICAL BOOKS */}
          {activeTab === 'physical_books' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-500" />
                    <span>إدارة الكتب الورقية والمخزون والشحن</span>
                  </h3>
                  <p className="text-xs text-slate-400">إدارة الكتب المطبوعة، المخزون، والأسعار</p>
                </div>
                <button
                  onClick={() => openNewBookForm('physical')}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة كتاب ورقي جديد</span>
                </button>
              </div>

              {/* Physical Books Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">الغلاف والمعلومات</th>
                      <th className="p-3.5">القسم</th>
                      <th className="p-3.5">السعر</th>
                      <th className="p-3.5 text-center">المخزون المتاح</th>
                      <th className="p-3.5 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {physicalBooksList.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 flex items-center gap-3">
                          <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded-lg shrink-0 border border-slate-700" />
                          <div>
                            <div className="font-bold text-white text-sm">{book.title}</div>
                            <div className="text-slate-400">{book.author}</div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-bold">
                            {book.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-orange-400">
                          {book.hasDiscount && book.discountPrice ? (
                            <div>
                              <span>{book.discountPrice} ج.م</span>
                              <span className="line-through text-slate-500 text-[10px] mr-1">{book.price}</span>
                            </div>
                          ) : (
                            <span>{book.price} ج.م</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-bold font-mono text-xs ${
                            book.stock > 10 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {book.stock} نسخة
                          </span>
                        </td>
                        <td className="p-3.5 text-left space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEditBookClick(book)}
                            className="p-2 bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white rounded-lg transition"
                            title="تعديل الكتاب"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book)}
                            className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition"
                            title="حذف الكتاب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DIGITAL BOOKS & PDF */}
          {activeTab === 'digital_books' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <LockKeyhole className="w-5 h-5 text-emerald-400" />
                    <span>إدارة الكتب الرقمية وقارئ PDF المشفر (DRM Vault)</span>
                  </h3>
                  <p className="text-xs text-slate-400">رفع الملفات الرقمية، تحديد صفحات العينة المجانية، وتأمين المحتوى ضد القرصنة</p>
                </div>
                <button
                  onClick={() => openNewBookForm('digital')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع كتاب رقمي PDF جديد</span>
                </button>
              </div>

              {/* Digital Books Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">الغلاف والمعلومات</th>
                      <th className="p-3.5">القسم</th>
                      <th className="p-3.5">السعر الرقمي</th>
                      <th className="p-3.5 text-center">صفحات العينة المجانية</th>
                      <th className="p-3.5 text-center">حالة التشفير والحماية</th>
                      <th className="p-3.5 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {digitalBooksList.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 flex items-center gap-3">
                          <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded-lg shrink-0 border border-slate-700" />
                          <div>
                            <div className="font-bold text-white text-sm">{book.title}</div>
                            <div className="text-slate-400">{book.author}</div>
                            {book.fileSize && (
                              <div className="text-[10px] text-slate-500 font-mono">حجم الملف: {book.fileSize}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-bold">
                            {book.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          {book.hasDiscount && book.discountPrice ? `${book.discountPrice} ج.م` : `${book.price} ج.م`}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-amber-400">
                          {book.samplePagesCount || 5} صفحات
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>DRM مشفر ضد التحميل</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-left space-x-2 space-x-reverse">
                          <button
                            onClick={() => {
                              setActiveReadingBook(book);
                              setIsAdminOpen(false);
                            }}
                            className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition"
                            title="معاينة في القارئ المشفر"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditBookClick(book)}
                            className="p-2 bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white rounded-lg transition"
                            title="تعديل الكتاب"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book)}
                            className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition"
                            title="حذف الكتاب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMER ACCOUNTS & DIGITAL PERMISSIONS */}
          {activeTab === 'users' && (
            <div className="max-w-6xl mx-auto">
              <AdminCustomersTab />
            </div>
          )}

          {/* TAB 4-A: PHYSICAL ORDERS & SHIPPING (قسم طلبات الكتب الورقية والشحن) */}
          {(activeTab === 'orders_physical' || activeTab === 'orders') && (
            <div className="space-y-6 max-w-6xl mx-auto">
              
              {/* Header & Sub-Tabs Navigation */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <Truck className="w-5 h-5 text-amber-500" />
                      <span>قسم طلبات الكتب الورقية وإدارة الشحن للمحافظات</span>
                    </h3>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                      شحن ورقي ({physicalOrdersList.length})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    مراجعة بيانات الشحن، تغيير حالة الطلبات، إصدار بوالص التتبع، والتواصل مع العميل
                  </p>
                </div>

                {/* Sub-Tabs Switcher */}
                <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
                  <button
                    onClick={() => setActiveTab('orders_physical')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-orange-600 text-white shadow-sm flex items-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>الطلبات الورقية ({physicalOrdersList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders_digital')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
                  >
                    <LockKeyhole className="w-3.5 h-3.5 text-emerald-400" />
                    <span>الكتب الرقمية وتفعيلها ({digitalOrdersList.length})</span>
                    {pendingDigitalActivationCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </button>
                </div>
              </div>

              {/* Physical Orders Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold">إجمالي الطلبات الورقية</span>
                  <div className="text-lg font-black text-white font-mono">{physicalOrdersList.length}</div>
                </div>
                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl space-y-1">
                  <span className="text-[11px] text-amber-300 font-bold">⏳ قيد المراجعة والشحن</span>
                  <div className="text-lg font-black text-amber-400 font-mono">
                    {physicalOrdersList.filter(o => o.status === 'pending').length}
                  </div>
                </div>
                <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl space-y-1">
                  <span className="text-[11px] text-blue-300 font-bold">🚚 جاري التوصيل</span>
                  <div className="text-lg font-black text-blue-400 font-mono">
                    {physicalOrdersList.filter(o => o.status === 'in_transit').length}
                  </div>
                </div>
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-1">
                  <span className="text-[11px] text-emerald-300 font-bold">🟢 تم التسليم بنجاح</span>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {physicalOrdersList.filter(o => o.status === 'delivered').length}
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchOrderTerm}
                    onChange={(e) => setSearchOrderTerm(e.target.value)}
                    placeholder="ابحث برقم الطلب، العميل، الهاتف، المحافظة..."
                    className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs text-slate-400 shrink-0">تصفية الحالة:</span>
                  <select
                    value={physicalOrderStatusFilter}
                    onChange={(e) => setPhysicalOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all">جميع الحالات ({physicalOrdersList.length})</option>
                    <option value="pending">⏳ قيد المراجعة</option>
                    <option value="approved">🔵 معتمد</option>
                    <option value="in_transit">🚚 جاري الشحن</option>
                    <option value="delivered">🟢 تم التسليم</option>
                    <option value="cancelled">🔴 ملغي</option>
                  </select>
                </div>
              </div>

              {/* Physical Orders Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                      <tr>
                        <th className="p-3.5">الطلب والعميل والشحن</th>
                        <th className="p-3.5">الكتب الورقية المطلوبة</th>
                        <th className="p-3.5">بيانات التحويل والدفع</th>
                        <th className="p-3.5">حساب الشحن والإجمالي</th>
                        <th className="p-3.5 text-center">تغيير حالة الطلب</th>
                        <th className="p-3.5 text-left">إجراءات والتواصل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredPhysicalOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">
                            لا توجد طلبات ورقية مطابقة لمعايير البحث الحالية.
                          </td>
                        </tr>
                      ) : (
                        filteredPhysicalOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-800/40 transition">
                            {/* Order & Customer Info */}
                            <td className="p-3.5 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-orange-400 text-sm">#{order.id}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                                </span>
                              </div>
                              <div className="font-bold text-white text-xs">{order.customerName}</div>
                              <div className="text-[11px] text-slate-300 font-mono" dir="ltr">{order.customerPhone}</div>
                              <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                                <Truck className="w-3 h-3 text-amber-400" />
                                <span>{order.governorate}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 max-w-[180px] truncate" title={order.address}>
                                📍 {order.address}
                              </div>
                              {order.notes && (
                                <div className="text-[10px] text-slate-500 italic truncate max-w-[180px]" title={order.notes}>
                                  ملاحظة: {order.notes}
                                </div>
                              )}
                            </td>

                            {/* Physical Items */}
                            <td className="p-3.5 space-y-1.5">
                              {order.items.filter(i => i.format === 'physical').map((item, i) => (
                                <div key={i} className="text-xs text-slate-200 bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-0.5">
                                  <div className="font-bold text-slate-100 truncate max-w-[190px]">📖 {item.title}</div>
                                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                                    <span>الكمية: <strong className="text-orange-400">{item.quantity}</strong></span>
                                    <span className="font-mono">{item.price * item.quantity} ج.م</span>
                                  </div>
                                </div>
                              ))}
                              <div className="text-[10px] text-slate-400 font-bold">
                                عدد الكتب الورقية: <span className="text-white font-mono">{order.physicalBooksCount} كتاب</span>
                              </div>
                            </td>

                            {/* Payment details */}
                            <td className="p-3.5 space-y-1.5">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black ${
                                order.paymentMethod === 'vodafone_cash' ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30' :
                                order.paymentMethod === 'instapay' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' :
                                'bg-slate-800 text-slate-300'
                              }`}>
                                {order.paymentMethod === 'vodafone_cash' ? '📱 فودافون كاش' : order.paymentMethod === 'instapay' ? '⚡ InstaPay' : '💵 عند الاستلام'}
                              </span>
                              
                              {order.paymentSenderName && (
                                <div className="text-[11px] text-white">
                                  صاحب الحساب: <span className="text-amber-300 font-bold">{order.paymentSenderName}</span>
                                </div>
                              )}

                              {order.paymentSenderPhone && (
                                <div className="text-[11px] text-slate-300 font-mono" dir="ltr">
                                  هاتف التحويل: <span className="text-amber-400 font-bold">{order.paymentSenderPhone}</span>
                                </div>
                              )}

                              {order.transactionRef && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  المرجع: {order.transactionRef}
                                </div>
                              )}

                              {order.transactionScreenshot && (
                                <div className="pt-1 flex items-center gap-2">
                                  <img 
                                    src={order.transactionScreenshot} 
                                    alt="Receipt" 
                                    onClick={() => setSelectedReceiptImage(order.transactionScreenshot || null)}
                                    className="w-9 h-9 object-cover rounded-lg border border-slate-700 hover:border-orange-500 cursor-pointer hover:scale-105 transition shrink-0" 
                                    title="اضغط لتكبير صورة إيصال التحويل"
                                  />
                                  <button
                                    onClick={() => setSelectedReceiptImage(order.transactionScreenshot || null)}
                                    className="text-[10px] text-orange-400 hover:underline flex items-center gap-1 font-bold"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>معاينة الإيصال</span>
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Total & Shipping Calculation */}
                            <td className="p-3.5 space-y-1">
                              <div className="text-[11px] text-slate-400">
                                الشحن ({order.governorate}): <span className="text-slate-200 font-mono">{order.shippingCost} ج.م</span>
                              </div>
                              <div className="font-mono font-black text-orange-400 text-sm">
                                الإجمالي: {order.totalAmount} ج.م
                              </div>
                            </td>

                            {/* Interactive Status Changer */}
                            <td className="p-3.5 text-center space-y-2">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-black text-center cursor-pointer border transition focus:outline-none ${
                                  order.status === 'delivered' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50' :
                                  order.status === 'in_transit' ? 'bg-blue-950/80 text-blue-300 border-blue-600/50' :
                                  order.status === 'approved' ? 'bg-amber-950/80 text-amber-300 border-amber-600/50' :
                                  order.status === 'cancelled' ? 'bg-rose-950/80 text-rose-300 border-rose-600/50' :
                                  'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                <option value="pending">⏳ قيد المراجعة</option>
                                <option value="approved">🔵 معتمد</option>
                                <option value="in_transit">🚚 جاري الشحن والتوصيل</option>
                                <option value="delivered">🟢 تم التسليم بنجاح</option>
                                <option value="cancelled">🔴 ملغي</option>
                              </select>

                              {order.trackingNumber && (
                                <div className="text-[10px] text-blue-400 font-mono truncate" title={`تتبع: ${order.trackingNumber}`}>
                                  📦 {order.trackingNumber}
                                </div>
                              )}
                            </td>

                            {/* Actions & WhatsApp Contact */}
                            <td className="p-3.5 text-left">
                              <div className="flex flex-col gap-1.5 items-end">
                                {/* Direct WhatsApp to Customer */}
                                <a
                                  href={`https://wa.me/20${order.customerPhone.replace(/[^0-9]/g, '').replace(/^0+/, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${order.customerName}، نتواصل معك من متجر هواري للكتب بخصوص طلب الشحن الورقي رقم #${order.id} المتجه إلى محافظة ${order.governorate}.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                                  title="مراسلة العميل مباشرة على واتساب"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>واتساب العميل</span>
                                </a>

                                {/* Tracking button */}
                                <button
                                  onClick={() => {
                                    setTrackingModalOrder(order);
                                    setTrackingNumberInput(order.trackingNumber || `HW-TRK-${order.id.slice(-5)}`);
                                    setTrackingCarrierInput(order.trackingCarrier || 'شركة بوسطة للشحن (Bosta)');
                                    setTrackingUrlInput(order.trackingUrl || `https://bosta.co/tracking-shipment/?track_number=HW-${order.id.slice(-5)}`);
                                    setTrackingStatusInput(order.status === 'pending' ? 'in_transit' : order.status);
                                  }}
                                  className="w-full px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>بيانات الشحنة</span>
                                </button>

                                {/* Print invoice */}
                                <button
                                  onClick={() => {
                                    setActiveInvoiceOrder(order);
                                    setIsInvoiceModalOpen(true);
                                  }}
                                  className="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                >
                                  <FileText className="w-3.5 h-3.5 text-orange-400" />
                                  <span>فاتورة الشحن</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4-B: DIGITAL ORDERS & MANUAL ACTIVATION (قسم طلبات وتفعيل الكتب الرقمية) */}
          {activeTab === 'orders_digital' && (
            <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in">
              
              {/* Header & Sub-Tabs Navigation */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <LockKeyhole className="w-5 h-5 text-emerald-400" />
                      <span>قسم طلبات وتفعيل الكتب الرقمية المشفرة (PDF DRM)</span>
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                      طلبات رقمية ({digitalOrdersList.length})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    مراجعة إيصال التحويل، تفعيل الكتاب الرقمي يدوياً ليظهر فوراً في مكتبة العميل، أو سحب الصلاحية
                  </p>
                </div>

                {/* Sub-Tabs Switcher */}
                <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
                  <button
                    onClick={() => setActiveTab('orders_physical')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>الطلبات الورقية ({physicalOrdersList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders_digital')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1.5"
                  >
                    <LockKeyhole className="w-3.5 h-3.5" />
                    <span>الكتب الرقمية وتفعيلها ({digitalOrdersList.length})</span>
                    {pendingDigitalActivationCount > 0 && (
                      <span className="text-[10px] bg-white text-emerald-950 font-black px-1.5 py-0.2 rounded-full">
                        {pendingDigitalActivationCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Digital Orders Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold">إجمالي طلبات الكتب الرقمية</span>
                  <div className="text-lg font-black text-white font-mono">{digitalOrdersList.length}</div>
                </div>

                <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-300 font-bold">⏳ بانتظار تفعيل الإدارة</span>
                    {pendingDigitalActivationCount > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <div className="text-lg font-black text-amber-400 font-mono">
                    {pendingDigitalActivationCount} طلب بانتظار التفعيل
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl space-y-1">
                  <span className="text-[11px] text-emerald-300 font-bold">🟢 كتب رقمية مفعلة في مكتبات العملاء</span>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {digitalOrdersList.filter(o => o.digitalAccessGranted).length} مفعل
                  </div>
                </div>
              </div>

              {/* Notice Banner explaining the Activation Rule */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs text-slate-300 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>قاعدة الأمان المعتمدة:</strong> الكتب الرقمية لا تظهر إطلاقاً في مكتبة العميل إلا بعد أن تقوم بالضغط على زر <strong>"تفعيل الكتاب للعميل"</strong> بعد التأكد من إيصال الدفع. بمجرد التفعيل، يُفتح الكتاب فوراً للعميل في قارئه المشفر ويصله إشعار مباشر.
                </span>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchOrderTerm}
                    onChange={(e) => setSearchOrderTerm(e.target.value)}
                    placeholder="ابحث برقم الطلب، العميل، البريد، الهاتف..."
                    className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs text-slate-400 shrink-0">تصفية التفعيل:</span>
                  <select
                    value={digitalOrderActivationFilter}
                    onChange={(e) => setDigitalOrderActivationFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all">جميع الطلبات الرقمية ({digitalOrdersList.length})</option>
                    <option value="unactivated">⏳ بانتظار التفعيل فقط ({pendingDigitalActivationCount})</option>
                    <option value="activated">🟢 المفعلة في المكتبة ({digitalOrdersList.filter(o => o.digitalAccessGranted).length})</option>
                  </select>
                </div>
              </div>

              {/* Digital Orders Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                      <tr>
                        <th className="p-3.5">الطلب والعميل</th>
                        <th className="p-3.5">الكتب الرقمية المطلوبة</th>
                        <th className="p-3.5">بيانات التحويل والإيصال</th>
                        <th className="p-3.5">الإجمالي</th>
                        <th className="p-3.5 text-center">حالة الصلاحية والتفعيل</th>
                        <th className="p-3.5 text-left">زر تفعيل الكتاب والتواصل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredDigitalOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">
                            لا توجد طلبات كتب رقمية مطابقة لمعايير البحث.
                          </td>
                        </tr>
                      ) : (
                        filteredDigitalOrders.map((order) => (
                          <tr key={order.id} className={`hover:bg-slate-800/40 transition ${
                            !order.digitalAccessGranted ? 'bg-amber-950/10' : ''
                          }`}>
                            {/* Customer Info */}
                            <td className="p-3.5 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-emerald-400 text-sm">#{order.id}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                                </span>
                              </div>
                              <div className="font-bold text-white text-xs">{order.customerName}</div>
                              <div className="text-[11px] text-slate-300 font-mono" dir="ltr">{order.customerPhone}</div>
                              {order.customerEmail && (
                                <div className="text-[10px] text-slate-400 font-mono">{order.customerEmail}</div>
                              )}
                            </td>

                            {/* Digital Book Items */}
                            <td className="p-3.5 space-y-2">
                              {order.items.filter(i => i.format === 'digital').map((item, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                                  <div className="w-8 h-11 bg-slate-800 rounded overflow-hidden shrink-0">
                                    <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-100 truncate max-w-[170px]">{item.title}</div>
                                    <div className="text-[10px] text-emerald-400 font-mono">{item.price} ج.م</div>
                                  </div>
                                </div>
                              ))}
                            </td>

                            {/* Payment info & Receipt */}
                            <td className="p-3.5 space-y-1.5">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black ${
                                order.paymentMethod === 'vodafone_cash' ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30' :
                                order.paymentMethod === 'instapay' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' :
                                'bg-slate-800 text-slate-300'
                              }`}>
                                {order.paymentMethod === 'vodafone_cash' ? '📱 فودافون كاش' : order.paymentMethod === 'instapay' ? '⚡ InstaPay' : 'دفع مباشر'}
                              </span>
                              
                              {order.paymentSenderName && (
                                <div className="text-[11px] text-white">
                                  صاحب الحساب: <span className="text-amber-300 font-bold">{order.paymentSenderName}</span>
                                </div>
                              )}

                              {order.paymentSenderPhone && (
                                <div className="text-[11px] text-slate-300 font-mono" dir="ltr">
                                  هاتف التحويل: <span className="text-amber-400 font-bold">{order.paymentSenderPhone}</span>
                                </div>
                              )}

                              {order.transactionScreenshot && (
                                <div className="pt-1 flex items-center gap-2">
                                  <img 
                                    src={order.transactionScreenshot} 
                                    alt="Receipt" 
                                    onClick={() => setSelectedReceiptImage(order.transactionScreenshot || null)}
                                    className="w-9 h-9 object-cover rounded-lg border border-slate-700 hover:border-emerald-500 cursor-pointer hover:scale-105 transition shrink-0" 
                                    title="اضغط لتكبير صورة إيصال التحويل"
                                  />
                                  <button
                                    onClick={() => setSelectedReceiptImage(order.transactionScreenshot || null)}
                                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>معاينة الإيصال</span>
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Total Amount (No shipping for digital) */}
                            <td className="p-3.5 space-y-1">
                              <div className="font-mono font-black text-emerald-400 text-sm">
                                {order.totalAmount} ج.م
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold">
                                (بدون مصاريف شحن)
                              </div>
                            </td>

                            {/* Activation Status */}
                            <td className="p-3.5 text-center">
                              {order.digitalAccessGranted ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>مفعل في المكتبة ✓</span>
                                  </span>
                                  <p className="text-[10px] text-slate-400">متاح للقراءة لدى العميل</p>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>بانتظار تفعيلك اليدوي</span>
                                  </span>
                                  <p className="text-[10px] text-amber-400/80">المحتوى محجوب حالياً</p>
                                </div>
                              )}
                            </td>

                            {/* Activation Action Button & WhatsApp */}
                            <td className="p-3.5 text-left">
                              <div className="flex flex-col gap-1.5 items-end">
                                
                                {/* PRIMARY ACTIVATION BUTTON */}
                                {!order.digitalAccessGranted ? (
                                  <button
                                    onClick={() => {
                                      approveDigitalAccess(order.id);
                                      setBookSaveToast({
                                        title: 'تم تفعيل الكتاب الرقمي بنجاح',
                                        message: `تم إضافة الكتب الرقمية للطلب #${order.id} إلى مكتبة العميل "${order.customerName}" وإرسال إشعار فوري له.`,
                                        type: 'success'
                                      });
                                    }}
                                    className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 hover:scale-[1.02]"
                                  >
                                    <CheckSquare className="w-4 h-4" />
                                    <span>تفعيل الكتاب للعميل الآن</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      revokeDigitalAccess(order.id);
                                      setBookSaveToast({
                                        title: 'تم سحب وإلغاء التفعيل',
                                        message: `تم حجب الكتب الرقمية للطلب #${order.id} من مكتبة العميل.`,
                                        type: 'error'
                                      });
                                    }}
                                    className="w-full px-3 py-1.5 bg-slate-800 hover:bg-rose-900/80 text-rose-300 hover:text-white rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 border border-slate-700 hover:border-rose-600"
                                    title="سحب الصلاحية من مكتبة العميل"
                                  >
                                    <Undo2 className="w-3 h-3" />
                                    <span>سحب / إلغاء التفعيل</span>
                                  </button>
                                )}

                                {/* Direct WhatsApp to Customer */}
                                <a
                                  href={`https://wa.me/20${order.customerPhone.replace(/[^0-9]/g, '').replace(/^0+/, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${order.customerName}، تم استلام طلبك للكتب الرقمية رقم #${order.id} من متجر هواري. ${order.digitalAccessGranted ? 'تم تفعيل كتبك الرقمية ويمكنك فتحها وقراءتها الآن من قسم "مكتبتي".' : 'جاري مراجعة إيصال التحويل لتفعيل الكتاب لك فوراً.'}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full px-3 py-1.5 bg-slate-800 hover:bg-emerald-700 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                  title="مراسلة العميل على واتساب"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>واتساب العميل</span>
                                </a>

                                {/* Print Invoice */}
                                <button
                                  onClick={() => {
                                    setActiveInvoiceOrder(order);
                                    setIsInvoiceModalOpen(true);
                                  }}
                                  className="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1"
                                >
                                  <FileText className="w-3 h-3 text-orange-400" />
                                  <span>الفاتورة الرقمية</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HERO CAROUSEL CONTROLLER ("الشاشة المتحركة الي في النص") */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-orange-500" />
                  <span>التحكم الكامل في الشاشة المتحركة (Hero Carousel Slider)</span>
                </h3>
                <p className="text-xs text-slate-400">إضافة وتعديل وحذف الشرائح المتحركة في صدر الصفحة الرئيسية مع معاينة فورية</p>
              </div>

              {/* Add New Slide Form */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-white">إضافة شريحة إعلانية متحركة جديدة:</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">عنوان البانر الرئيسي *</label>
                    <input
                      type="text"
                      value={newSlideTitle}
                      onChange={(e) => setNewSlideTitle(e.target.value)}
                      placeholder="عالم الروايات العالمية والمترجمة"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">نص البادج الترويجي</label>
                    <input
                      type="text"
                      value={newSlideBadge}
                      onChange={(e) => setNewSlideBadge(e.target.value)}
                      placeholder="خصم يصل إلى 30%"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">الوصف الترويجي للشريحة *</label>
                  <textarea
                    rows={2}
                    value={newSlideSubtitle}
                    onChange={(e) => setNewSlideSubtitle(e.target.value)}
                    placeholder="استمتع بأشهر الروايات الكلاسيكية والحديثة بصيغ ورقية فاخرة ونسخ رقمية فورية..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">نص زر الإجراء (CTA)</label>
                    <input
                      type="text"
                      value={newSlideCtaText}
                      onChange={(e) => setNewSlideCtaText(e.target.value)}
                      placeholder="تصفح أحدث الكتب"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">القسم المرتبط</label>
                    <select
                      value={newSlideCategory}
                      onChange={(e) => setNewSlideCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                    >
                      {settings.categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">رفع صورة خلفية البانر</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroSlideImageUpload}
                      className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (!newSlideTitle.trim()) return;
                      const newSlide: HeroSlide = {
                        id: `slide-${Date.now()}`,
                        title: newSlideTitle.trim(),
                        subtitle: newSlideSubtitle.trim() || 'أفضل الكتب بأعلى جودة وتوصيل سريع',
                        image: newSlideImage || 'https://images.unsplash.com/photo-1507842229450-7907e4d5da99?auto=format&fit=crop&q=80&w=1200',
                        badge: newSlideBadge.trim() || 'عروض مميزة',
                        ctaText: newSlideCtaText.trim() || 'استكشف الآن',
                        category: newSlideCategory
                      };
                      updateHeroSlides([...(settings.heroSlides || []), newSlide]);
                      setNewSlideTitle('');
                      setNewSlideSubtitle('');
                    }}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة الشريحة إلى السلايدر</span>
                  </button>
                </div>
              </div>

              {/* Existing Slides List */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-white">الشرائح الحالية المفعلة بالسلايدر:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.heroSlides?.map((slide, idx) => (
                    <div key={slide.id} className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group">
                      <div 
                        className="h-40 bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${slide.image})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-4 flex flex-col justify-between">
                          <span className="self-start text-[10px] font-black bg-orange-600 text-white px-2 py-0.5 rounded-full">
                            {slide.badge}
                          </span>
                          <div>
                            <h5 className="font-black text-white text-sm truncate">{slide.title}</h5>
                            <p className="text-[11px] text-slate-300 line-clamp-1">{slide.subtitle}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900 flex items-center justify-between text-xs">
                        <span className="text-slate-400">القسم: {slide.category}</span>
                        <button
                          onClick={() => {
                            const updated = settings.heroSlides.filter(s => s.id !== slide.id);
                            updateHeroSlides(updated);
                          }}
                          className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف الشريحة</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: NOTIFICATIONS ENGINE */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <span>مركز إرسال الإشعارات والتنبيهات المباشرة</span>
                </h3>
                <p className="text-xs text-slate-400">إرسال إشعارات جماعية لكافة زوار وعملاء الموقع أو إشعار مخصص لعميل بعينه</p>
              </div>

              {notifSentSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>تم إرسال الإشعار ونشره بنجاح لجميع المستهدفين!</span>
                </div>
              )}

              {/* Compose Notification */}
              <form onSubmit={handleSendNotification} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-white">إنشاء إشعار جديد:</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">الهدف (المستلمون) *</label>
                    <select
                      value={notifTarget}
                      onChange={(e) => setNotifTarget(e.target.value as 'all' | 'user')}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                    >
                      <option value="all">جميع عملاء وزوار الموقع (عام)</option>
                      <option value="user">عميل محدد (مستهدف بالبريد)</option>
                    </select>
                  </div>

                  {notifTarget === 'user' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">اختر أو اكتب بريد العميل *</label>
                      <input
                        type="email"
                        required
                        value={notifTargetEmail}
                        onChange={(e) => setNotifTargetEmail(e.target.value)}
                        placeholder="client@example.com"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">نوع الإشعار</label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                    >
                      <option value="general">عام / ترحيبي</option>
                      <option value="promo">عرض وتخفيضات</option>
                      <option value="order">تحديث طلب وشحنة</option>
                      <option value="alert">تنبيه هام</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">عنوان الإشعار *</label>
                  <input
                    type="text"
                    required
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="🔥 خصم 20% لفترة محدودة على الروايات العالمية"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">نص الرسالة *</label>
                  <textarea
                    rows={3}
                    required
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder="اكتب تفاصيل الإشعار هنا..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال وتعميم الإشعار الآن</span>
                  </button>
                </div>
              </form>

              {/* History Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-white">سجل الإشعارات المرسلة:</h4>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                      <tr>
                        <th className="p-3">العنوان والرسالة</th>
                        <th className="p-3">المستهدف</th>
                        <th className="p-3">النوع</th>
                        <th className="p-3 font-mono">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {notifications.map((notif) => (
                        <tr key={notif.id} className="hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="font-bold text-white">{notif.title}</div>
                            <div className="text-slate-400 text-[11px] line-clamp-1">{notif.message}</div>
                          </td>
                          <td className="p-3">
                            {notif.target === 'all' ? (
                              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">جميع العملاء</span>
                            ) : (
                              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold">{notif.targetUserEmail}</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">{notif.type}</span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[10px]">
                            {new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: SHIPPING RATES (27 GOVERNORATES) */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-500" />
                  <span>تعديل وحساب أسعار الشحن لـ 27 محافظة</span>
                </h3>
                <p className="text-xs text-slate-400">تعديل تكاليف الشرائح الثلاث (1-3 كتب، 4-6 كتب، 7-10 كتب) بدقة متناهية</p>
              </div>

              {shippingSaveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>تم حفظ تسعيرة الشحن للمحافظة بنجاح!</span>
                </div>
              )}

              {/* Single Governorate Editor Form */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-white">تعديل أسعار محافظة معينة:</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">المحافظة</label>
                    <select
                      value={selectedGovForEdit}
                      onChange={(e) => {
                        const gov = e.target.value;
                        setSelectedGovForEdit(gov);
                        const r = settings.shippingRates?.[gov] || { tier1to3: 77, tier4to6: 90, tier7to10: 125 };
                        setEditTier1to3(r.tier1to3);
                        setEditTier4to6(r.tier4to6);
                        setEditTier7to10(r.tier7to10);
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                    >
                      {EGYPT_GOVERNORATES_LIST.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">شريحة (1 - 3 كتب)</label>
                    <input
                      type="number"
                      value={editTier1to3}
                      onChange={(e) => setEditTier1to3(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">شريحة (4 - 6 كتب)</label>
                    <input
                      type="number"
                      value={editTier4to6}
                      onChange={(e) => setEditTier4to6(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">شريحة (7 - 10 كتب)</label>
                    <input
                      type="number"
                      value={editTier7to10}
                      onChange={(e) => setEditTier7to10(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      updateShippingRate(selectedGovForEdit, {
                        name: selectedGovForEdit,
                        nameEn: selectedGovForEdit,
                        tier1to3: editTier1to3,
                        tier4to6: editTier4to6,
                        tier7to10: editTier7to10
                      });
                      setShippingSaveSuccess(true);
                      setTimeout(() => setShippingSaveSuccess(false), 2500);
                    }}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ أسعار محافظة ({selectedGovForEdit})</span>
                  </button>
                </div>
              </div>

              {/* All Governorates Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                    <tr>
                      <th className="p-3">المحافظة</th>
                      <th className="p-3 text-center">1 - 3 كتب</th>
                      <th className="p-3 text-center">4 - 6 كتب</th>
                      <th className="p-3 text-center">7 - 10 كتب</th>
                      <th className="p-3 text-left">تعديل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {EGYPT_GOVERNORATES_LIST.map((gov) => {
                      const r = settings.shippingRates?.[gov] || { tier1to3: 77, tier4to6: 90, tier7to10: 125 };
                      return (
                        <tr key={gov} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{gov}</td>
                          <td className="p-3 text-center font-mono font-bold text-orange-400">{r.tier1to3} ج.م</td>
                          <td className="p-3 text-center font-mono font-bold text-amber-400">{r.tier4to6} ج.م</td>
                          <td className="p-3 text-center font-mono font-bold text-rose-400">{r.tier7to10} ج.م</td>
                          <td className="p-3 text-left">
                            <button
                              onClick={() => {
                                setSelectedGovForEdit(gov);
                                setEditTier1to3(r.tier1to3);
                                setEditTier4to6(r.tier4to6);
                                setEditTier7to10(r.tier7to10);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-orange-400 hover:text-orange-300 text-xs font-bold"
                            >
                              تعديل
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: HOMEPAGE CURATION (6 Books + 7th Spotlight Book) */}
          {activeTab === 'curation' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span>تخصيص الـ 6 كتب بالرئيسية والكتاب السابع المميز</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    تحكم بالكتب المعروضة في صدر واجهة المتجر بدون التأثير على كامل كتالوج المنصة
                  </p>
                </div>

                <button
                  onClick={() => {
                    saveSettings({
                      ...settings,
                      featuredBookIds: curatedFeaturedIds,
                      spotlightBookId: curatedSpotlightId,
                      spotlightBookCustomTitle: curatedSpotlightTitle,
                      spotlightBookBadge: curatedSpotlightBadge,
                      spotlightBookSubtitle: curatedSpotlightSubtitle,
                    });
                    setCurationSavedSuccess(true);
                    setTimeout(() => setCurationSavedSuccess(false), 3000);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التخصيص للصفحة الرئيسية</span>
                </button>
              </div>

              {curationSavedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تم حفظ وتطبيق تخصيص الـ 6 كتب والكتاب السابع على الصفحة الرئيسية بنجاح!</span>
                </div>
              )}

              {/* 1. THE 7TH SPOTLIGHT BOOK CONTROLS */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <h4 className="text-base font-black text-white">إعدادات الكتاب السابع المميز (Spotlight Hero Book)</h4>
                    <p className="text-xs text-slate-400">يظهر في موقع بارز أعلى الصفحة الرئيسية مع ميزات الترويج والعينة وقفل الأمان</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Book */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">اختر الكتاب السابع من الكتب المتاحة *</label>
                    <select
                      value={curatedSpotlightId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setCuratedSpotlightId(newId);
                        const b = books.find(item => item.id === newId);
                        if (b && !curatedSpotlightTitle) {
                          setCuratedSpotlightTitle(b.title);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                    >
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} — ({b.author}) [{b.category}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Badge */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">الشارة الترويجية (Badge)</label>
                    <input
                      type="text"
                      value={curatedSpotlightBadge}
                      onChange={(e) => setCuratedSpotlightBadge(e.target.value)}
                      placeholder="الكتاب المميز للأسبوع 🔥"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Custom Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">الاسم المخصص للكتاب السابع (يمكنك إطلاق أي اسم عليه)</label>
                    <input
                      type="text"
                      value={curatedSpotlightTitle}
                      onChange={(e) => setCuratedSpotlightTitle(e.target.value)}
                      placeholder="الإصدار الذهبي المختار | العادات الذرية"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Custom Subtitle */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">الوصف الترويجي المختصر</label>
                    <input
                      type="text"
                      value={curatedSpotlightSubtitle}
                      onChange={(e) => setCuratedSpotlightSubtitle(e.target.value)}
                      placeholder="تغييرات صغيرة، نتائج مبهرة - الإطار العملي المثبت لبناء عادات إيجابية"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Spotlight Live Mini Preview */}
                {(() => {
                  const sBook = books.find(b => b.id === curatedSpotlightId) || books[0];
                  if (!sBook) return null;
                  return (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                      <img 
                        src={sBook.coverImage} 
                        alt={sBook.title} 
                        className="w-14 h-20 object-cover rounded-xl border border-slate-700 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] bg-orange-600/30 text-orange-400 font-bold px-2 py-0.5 rounded-md">
                          {curatedSpotlightBadge || "مميز"}
                        </span>
                        <div className="text-sm font-black text-white">{curatedSpotlightTitle || sBook.title}</div>
                        <div className="text-xs text-slate-400">{curatedSpotlightSubtitle || sBook.description.slice(0, 90)}...</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 2. THE 6 CURATED HOMEPAGE BOOKS CONTROLS */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="text-base font-black text-white">الـ 6 كتب المعروضة بالصفحة الرئيسية</h4>
                      <p className="text-xs text-slate-400">حدد بالضبط 6 كتب من مكتبة الموقع للظهور في الصفحة الرئيسية</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-black font-mono ${
                      curatedFeaturedIds.length === 6
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      تم اختيار: {curatedFeaturedIds.length} من 6
                    </span>
                    {curatedFeaturedIds.length > 0 && (
                      <button
                        onClick={() => setCuratedFeaturedIds([])}
                        className="text-xs text-rose-400 hover:underline font-bold"
                      >
                        إلغاء التحديد
                      </button>
                    )}
                  </div>
                </div>

                {/* Selected 6 Books Strip */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">الكتب المختارة الحالية بالترتيب:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[0, 1, 2, 3, 4, 5].map((slotIndex) => {
                      const bookId = curatedFeaturedIds[slotIndex];
                      const book = bookId ? books.find(b => b.id === bookId) : null;
                      return (
                        <div 
                          key={slotIndex}
                          className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center min-h-[140px] transition ${
                            book 
                              ? 'bg-slate-950 border-orange-500/40 relative group' 
                              : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-600'
                          }`}
                        >
                          {book ? (
                            <>
                              <button
                                onClick={() => {
                                  setCuratedFeaturedIds(prev => prev.filter(id => id !== book.id));
                                }}
                                className="absolute -top-1.5 -left-1.5 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition shadow-md"
                                title="إزالة من الـ 6 كتب"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <img 
                                src={book.coverImage} 
                                alt={book.title} 
                                className="w-12 h-16 object-cover rounded-lg mb-1 border border-slate-700 shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[11px] font-bold text-white line-clamp-1">{book.title}</span>
                              <span className="text-[9px] text-orange-400 font-mono">الكتاب #{slotIndex + 1}</span>
                            </>
                          ) : (
                            <span className="text-xs font-bold">خانة #{slotIndex + 1} فارغة</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Search & Pick from All Books */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">انقر على أي كتاب لإضافته أو إزالته من الـ 6:</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1 custom-scrollbar">
                    {books.map((b) => {
                      const isSelected = curatedFeaturedIds.includes(b.id);
                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            if (isSelected) {
                              setCuratedFeaturedIds(prev => prev.filter(id => id !== b.id));
                            } else {
                              if (curatedFeaturedIds.length >= 6) {
                                alert("لقد اخترت 6 كتب بالفعل! يرجى إزالة كتاب أولاً لاختيار كتاب بديل.");
                                return;
                              }
                              setCuratedFeaturedIds(prev => [...prev, b.id]);
                            }
                          }}
                          className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-orange-950/30 border-orange-500 shadow-md ring-2 ring-orange-500/20'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="relative">
                            <img 
                              src={b.coverImage} 
                              alt={b.title} 
                              className="w-full h-24 object-cover rounded-xl mb-2"
                              referrerPolicy="no-referrer"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-orange-600 text-white rounded-full p-1 shadow-md">
                                <Check className="w-3 h-3 font-black" />
                              </div>
                            )}
                          </div>
                          <div className="text-xs font-bold text-white line-clamp-1">{b.title}</div>
                          <div className="text-[10px] text-slate-400">{b.author}</div>
                          <div className="text-[10px] text-orange-400 font-mono mt-1 font-bold">{b.price} ج.م</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: CATEGORIES MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-500" />
                  <span>إدارة وتعديل أقسام وتصنيفات الكتب (Categories)</span>
                </h3>
                <p className="text-xs text-slate-400">إضافة أقسام جديدة، تعديل وإعادة تسمية الأقسام الحالية، أو حذفها من المتجر</p>
              </div>

              {/* Add Category Form */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex gap-3 items-center">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="اسم القسم الجديد (مثال: برمجة وذكاء اصطناعي)..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!newCategoryName.trim()) return;
                    if (settings.categories.includes(newCategoryName.trim())) return;
                    updateCategories([...settings.categories, newCategoryName.trim()]);
                    setNewCategoryName('');
                  }}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة القسم</span>
                </button>
              </div>

              {/* Inline Edit Modal / Form */}
              {editingCategoryOldName && (
                <div className="p-6 rounded-3xl bg-orange-950/20 border border-orange-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
                    <Edit className="w-4 h-4" />
                    <span>تعديل اسم القسم: ({editingCategoryOldName})</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={editingCategoryNewName}
                      onChange={(e) => setEditingCategoryNewName(e.target.value)}
                      placeholder="الاسم الجديد للقسم..."
                      className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      onClick={async () => {
                        if (!editingCategoryNewName.trim()) return;
                        const oldName = editingCategoryOldName;
                        const newName = editingCategoryNewName.trim();
                        const updated = settings.categories.map(c => c === oldName ? newName : c);
                        updateCategories(updated);
                        
                        // Also update category on all books that had this category
                        try {
                          await Promise.all(books
                            .filter(book => book.category === oldName)
                            .map(book => updateBook({ ...book, category: newName })));
                        } catch (error: any) {
                          alert(error?.message || 'تعذر تحديث كتب هذا القسم في Firebase.');
                          return;
                        }

                        setEditingCategoryOldName(null);
                        setEditingCategoryNewName('');
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>حفظ التعديل</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategoryOldName(null);
                        setEditingCategoryNewName('');
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Categories Pills & Controls */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-white">الأقسام الحالية المعتمدة بالمتجر:</h4>
                <div className="flex flex-wrap gap-2.5">
                  {settings.categories.map((cat) => (
                    <div key={cat} className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-3.5 py-2 rounded-xl text-xs">
                      <span className="font-bold text-white">{cat}</span>
                      {cat !== 'الكل' && (
                        <div className="flex items-center gap-1.5 mr-1.5 border-r border-slate-800 pr-1.5">
                          <button
                            onClick={() => {
                              setEditingCategoryOldName(cat);
                              setEditingCategoryNewName(cat);
                            }}
                            className="text-slate-400 hover:text-amber-400 transition"
                            title="تعديل اسم القسم"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف قسم "${cat}"؟`)) {
                                const updated = settings.categories.filter(c => c !== cat);
                                updateCategories(updated);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-400 transition"
                            title="حذف القسم"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: DESIGN & BRANDING */}
          {activeTab === 'design' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-orange-500" />
                  <span>الهوية البصرية والنصوص الترويجية والشريط العلوي</span>
                </h3>
                <p className="text-xs text-slate-400">تخصيص نصوص المتجر، الشريط الإعلاني، وأرقام التواصل</p>
              </div>

              {settingsSavedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>تم حفظ الإعدادات بنجاح!</span>
                </div>
              )}

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">اسم المتجر الرسمي *</label>
                    <input
                      type="text"
                      value={brandStoreName}
                      onChange={(e) => setBrandStoreName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">الشعار اللفظي (Slogan)</label>
                    <input
                      type="text"
                      value={brandTagline}
                      onChange={(e) => setBrandTagline(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">نص الشريط الإعلاني العلوي (Top Announcement)</label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-orange-400">
                      <input
                        type="checkbox"
                        checked={brandAnnouncementEnabled}
                        onChange={(e) => setBrandAnnouncementEnabled(e.target.checked)}
                        className="rounded"
                      />
                      <span>تفعيل الشريط</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={brandAnnouncement}
                    onChange={(e) => setBrandAnnouncement(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveAllSettings}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ التعديلات العامة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                  <span>إدارة بوابات الدفع (فودافون كاش وإنستاباي)</span>
                </h3>
                <p className="text-xs text-slate-400">تحديث أرقام التحويل ومعرفات الدفع المعتمدة للمتجر</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">رقم محفظة فودافون كاش الرسمية *</label>
                    <input
                      type="text"
                      value={brandVodafoneNumber}
                      onChange={(e) => setBrandVodafoneNumber(e.target.value)}
                      placeholder="01001332899"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">معرف أو رقم InstaPay المعتمد *</label>
                    <input
                      type="text"
                      value={brandInstapayUser}
                      onChange={(e) => setBrandInstapayUser(e.target.value)}
                      placeholder="01001332899"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">رقم الواتساب لاستقبال إيصالات الدفع *</label>
                  <input
                    type="text"
                    value={brandWhatsappNumber}
                    onChange={(e) => setBrandWhatsappNumber(e.target.value)}
                    placeholder="+201001332899"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveAllSettings}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ بيانات بوابات الدفع</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SERVER & FIREBASE INTEGRATION */}
          {activeTab === 'server' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-orange-500" />
                    <span>خادم Firebase السحابي واستضافة Hostinger</span>
                  </h3>
                  <p className="text-xs text-slate-400">حالة الاتصال المباشر بقواعد بيانات Firebase ومشروع hawari-store</p>
                </div>

                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>الخادم متصل وجاهز للعمل</span>
                </span>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-300">Firebase Firestore</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-lg font-black text-white">متصل ونشط</div>
                  <div className="text-[11px] text-slate-400 font-mono">hawari-store (Firestore DB)</div>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-300">Firebase Auth</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-lg font-black text-white">تأمين الحسابات</div>
                  <div className="text-[11px] text-slate-400 font-mono">hawari-store.firebaseapp.com</div>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-300">Realtime Database</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-lg font-black text-white">أوروبا الغربية</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">europe-west1.firebasedatabase.app</div>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-300">Google Analytics</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-lg font-black text-white">مفعل للتحليلات</div>
                  <div className="text-[11px] text-slate-400 font-mono">ID: G-RLJ3WBWRX6</div>
                </div>
              </div>

              {/* Exact Config Viewer */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-500" />
                    <h4 className="font-bold text-sm text-white">بيانات اتصال خادم Firebase المهيأة حالياً</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Project ID: hawari-store</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto" dir="ltr">
                  <pre>{`const firebaseConfig = {
  apiKey: "AIzaSyATmowMf-TY1-5Bqds0ABfo813Zl6VDZ4Q",
  authDomain: "hawari-store.firebaseapp.com",
  databaseURL: "https://hawari-store-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hawari-store",
  storageBucket: "hawari-store.firebasestorage.app",
  messagingSenderId: "1045177725390",
  appId: "1:1045177725390:web:d348e94c3c8c205efabb9f",
  measurementId: "G-RLJ3WBWRX6"
};`}</pre>
                </div>
              </div>

              {/* Export Full JSON Backup */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white">تصدير نسخة احتياطية كاملة (JSON Export)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">تنزيل ملف يحتوي على كافة الكتب، والعملاء، والطلبات، والإعدادات</p>
                </div>
                <button
                  onClick={() => {
                    const fullData = {
                      books,
                      allUsers,
                      orders,
                      settings,
                      notifications,
                      exportedAt: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `hawari-store-backup-${Date.now()}.json`;
                    a.click();
                  }}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل النسخة الاحتياطية</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* --- MODAL 1: ADD/EDIT BOOK MODAL WITH DIRECT FILE UPLOAD --- */}
      {isBookFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 text-slate-900 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col my-8">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-600/20 text-orange-500 border border-orange-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingBookId ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد للمتجر'}
                  </h3>
                  <p className="text-xs text-slate-400">رفع الغلاف وملف الـ PDF وتحديد الأسعار وصفحات العينة المجانية</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookFormOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 overflow-y-auto space-y-4 max-h-[75vh]">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">عنوان الكتاب *</label>
                  <input
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="مثال: الخيميائي"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">اسم المؤلف *</label>
                  <input
                    type="text"
                    required
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="باولو كويلو"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">القسم والتصنيف *</label>
                  <select
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none cursor-pointer"
                  >
                    {settings.categories.filter(c => c !== 'الكل').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">السعر الأساسي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={bookPrice}
                    onChange={(e) => setBookPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Enhanced Format Classification Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>تصنيف ونوع الكتاب في المتجر *</span>
                    <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-bold border border-orange-200">
                      يتحكم في الشحن والفاتورة
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBookFormat('both')}
                    className={`p-3 rounded-xl border text-right transition flex flex-col justify-between ${
                      bookFormat === 'both'
                        ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20 text-orange-950'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs">كلاهما (ورقي + رقمي)</span>
                      <span className="text-sm">⚡</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      يتيح للعميل الاختيار بين طلب شحن ورقي أو شراء النسخة الرقمية PDF
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookFormat('physical')}
                    className={`p-3 rounded-xl border text-right transition flex flex-col justify-between ${
                      bookFormat === 'physical'
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 text-amber-950'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs">ورقي مطبوع فقط</span>
                      <span className="text-sm">📦</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      يُطبق عليه شحن المحافظات (27 محافظة) والحد الأقصى 10 كتب
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookFormat('digital')}
                    className={`p-3 rounded-xl border text-right transition flex flex-col justify-between ${
                      bookFormat === 'digital'
                        ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20 text-indigo-950'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs">رقمي PDF فقط</span>
                      <span className="text-sm">🔒</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      بدون شحن نهائياً (0 ج.م) ويخفي حقول الشحن في الفاتورة والطلب
                    </p>
                  </button>
                </div>
              </div>

              {/* Discount settings */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900">
                    <input
                      type="checkbox"
                      checked={bookHasDiscount}
                      onChange={(e) => setBookHasDiscount(e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span>تفعيل خصم أو عرض خاص على الكتاب</span>
                  </label>
                </div>

                {bookHasDiscount && (
                  <div className="w-full sm:w-1/2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">سعر البيع بعد الخصم (ج.م) *</label>
                    <input
                      type="number"
                      required={bookHasDiscount}
                      value={bookDiscountPrice}
                      onChange={(e) => setBookDiscountPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Form Validation Error Banner */}
              {bookFormError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{bookFormError}</span>
                </div>
              )}

              {/* Direct Cover Image Upload via Firebase Storage */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsCoverDragOver(true); }}
                onDragLeave={() => setIsCoverDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsCoverDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processCoverFile(file);
                }}
                className={`space-y-3 p-4 rounded-2xl border transition-all ${
                  isCoverDragOver 
                    ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-bold text-slate-800">
                      صورة غلاف الكتاب (Cover Image File) *
                    </label>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      ضغط وتحسين تلقائي
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">JPG, PNG, WEBP (سحب أو لصق Ctrl+V)</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    type="button"
                    disabled={isUploadingCover || isSavingBook}
                    onClick={() => coverFileInputRef.current?.click()}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                      isUploadingCover 
                        ? 'bg-slate-400 text-white cursor-not-allowed' 
                        : 'bg-orange-600 hover:bg-orange-500 text-white active:scale-95'
                    }`}
                  >
                    {isUploadingCover ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري معالجة ورفع الغلاف ({coverUploadProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{bookCoverImage ? 'تغيير صورة الغلاف من جهازك' : 'اختيار ورفع الغلاف من جهازك'}</span>
                      </>
                    )}
                  </button>

                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    disabled={isUploadingCover || isSavingBook}
                    onChange={handleCoverUpload}
                    className="hidden"
                  />

                  {/* Direct Image URL input as optional manual alternative */}
                  <div className="flex-1 w-full">
                    <input
                      type="url"
                      value={bookCoverImage}
                      onChange={(e) => {
                        setBookCoverImage(e.target.value);
                        setCoverUploadError('');
                      }}
                      placeholder="أو الصق رابط صورة الغلاف مباشرة (URL)..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-orange-500 focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Quick Presets Gallery for Testing & Convenience */}
                <div className="pt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-600">أو اختر غلاف جاهز سريع:</span>
                  {[
                    { label: 'أدبي', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400' },
                    { label: 'فكري', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b29?auto=format&fit=crop&q=80&w=400' },
                    { label: 'روايات', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400' },
                    { label: 'تطوير ذات', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setBookCoverImage(preset.url);
                        setCoverUploadSuccess(`تم اختيار غلاف ${preset.label} بنجاح ✓`);
                        setCoverUploadError('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-orange-50 border border-slate-200 text-slate-700 text-[11px] font-bold transition hover:border-orange-300"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Cover Upload Progress Bar */}
                {isUploadingCover && (
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${coverUploadProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>جاري المعالجة والرفع...</span>
                      <span>{coverUploadProgress}%</span>
                    </div>
                  </div>
                )}

                {/* Cover Success Badge */}
                {coverUploadSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{coverUploadSuccess}</span>
                  </div>
                )}

                {/* Cover Error Badge */}
                {coverUploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{coverUploadError}</span>
                  </div>
                )}

                {/* Cover Preview Card */}
                {bookCoverImage && (
                  <div className="mt-2 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-3">
                      <img 
                        src={bookCoverImage} 
                        alt="Cover Preview" 
                        className="w-12 h-16 object-cover rounded-lg border border-slate-300 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';
                        }}
                      />
                      <div className="text-xs">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>معاينة غلاف الكتاب المعتمد</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">جاهز</span>
                        </div>
                        <div className="text-slate-500 text-[11px] font-mono truncate max-w-xs sm:max-w-md" dir="ltr">{bookCoverImage}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setBookCoverImage('');
                        setCoverUploadSuccess('');
                        setCoverUploadError('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="مسح الغلاف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Direct PDF File Upload via Firebase Storage */}
              {(bookFormat === 'digital' || bookFormat === 'both') && (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsPdfDragOver(true); }}
                  onDragLeave={() => setIsPdfDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsPdfDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processPdfFile(file);
                  }}
                  className={`space-y-3 p-4 rounded-2xl border transition-all ${
                    isPdfDragOver 
                      ? 'bg-emerald-100/70 border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                      <LockKeyhole className="w-4 h-4 text-emerald-600" />
                      <span>ملف الكتاب الرقمي (PDF / Digital Document to Storage)</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-mono">PDF, DOCX (حتى 50MB)</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <button
                      type="button"
                      disabled={isUploadingPdf || isSavingBook}
                      onClick={() => pdfFileInputRef.current?.click()}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                        isUploadingPdf 
                          ? 'bg-slate-400 text-white cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                      }`}
                    >
                      {isUploadingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري تشفير ورفع الـ PDF ({pdfUploadProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>{bookPdfFileName ? 'استبدال ملف الـ PDF من جهازك' : 'اختيار ورفع ملف الـ PDF من جهازك'}</span>
                        </>
                      )}
                    </button>

                    <input
                      ref={pdfFileInputRef}
                      type="file"
                      accept=".pdf,application/pdf,.doc,.docx,.txt"
                      disabled={isUploadingPdf || isSavingBook}
                      onChange={handlePdfUpload}
                      className="hidden"
                    />

                    {bookPdfFileName && (
                      <div className="flex-1 w-full bg-white p-2 rounded-xl border border-emerald-300 flex items-center justify-between text-xs text-emerald-900 font-mono">
                        <span className="truncate max-w-[200px] sm:max-w-xs">{bookPdfFileName}</span>
                        <span className="shrink-0 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">{bookFileSize}</span>
                      </div>
                    )}
                  </div>

                  {/* PDF Upload Progress Bar */}
                  {isUploadingPdf && (
                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pdfUploadProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-emerald-800 font-mono">
                        <span>جاري رفع وتأمين ملف الـ PDF...</span>
                        <span>{pdfUploadProgress}%</span>
                      </div>
                    </div>
                  )}

                  {/* PDF Success Badge */}
                  {pdfUploadSuccess && (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pdfUploadSuccess}</span>
                    </div>
                  )}

                  {/* PDF Error Badge */}
                  {pdfUploadError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{pdfUploadError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">عدد صفحات العينة المجانية للقارئ *</label>
                      <input
                        type="number"
                        value={bookSamplePagesCount}
                        onChange={(e) => setBookSamplePagesCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">إجمالي صفحات الكتاب *</label>
                      <input
                        type="number"
                        value={bookPages}
                        onChange={(e) => setBookPages(Number(e.target.value))}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stock for Physical */}
              {(bookFormat === 'physical' || bookFormat === 'both') && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">المخزون المتاح للنسخة الورقية (Stock) *</label>
                  <input
                    type="number"
                    value={bookStock}
                    onChange={(e) => setBookStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">وصف وملخص الكتاب *</label>
                <textarea
                  rows={3}
                  required
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="اكتب نبذة شيقة عن الكتاب وموضوعاته..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isSavingBook || isUploadingCover || isUploadingPdf}
                  onClick={() => setIsBookFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingBook || isUploadingCover || isUploadingPdf}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm text-white ${
                    isSavingBook || isUploadingCover || isUploadingPdf
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-500 active:scale-95'
                  }`}
                >
                  {isSavingBook ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ في Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingBookId ? 'حفظ وتحديث بيانات الكتاب' : 'إضافة وحفظ الكتاب في Firestore'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: SHIPMENT TRACKING UPDATE MODAL --- */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-slate-900 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  تحديث حالة الشحن والتتبع للطلب #{trackingModalOrder.id}
                </h3>
              </div>
              <button onClick={() => setTrackingModalOrder(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">شركة الشحن أو المندوب *</label>
                <input
                  type="text"
                  required
                  value={trackingCarrierInput}
                  onChange={(e) => setTrackingCarrierInput(e.target.value)}
                  placeholder="مثال: شركة بوسطة للشحن (Bosta)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">رقم البوليصة / كود التتبع *</label>
                <input
                  type="text"
                  required
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="HW-TRK-789456"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">رابط تتبع الشحنة المباشر (Tracking URL) *</label>
                <input
                  type="url"
                  required
                  value={trackingUrlInput}
                  onChange={(e) => setTrackingUrlInput(e.target.value)}
                  placeholder="https://bosta.co/tracking-shipment/?track_number=..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">حالة الطلب الحالية *</label>
                <select
                  value={trackingStatusInput}
                  onChange={(e) => setTrackingStatusInput(e.target.value as OrderStatus)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="pending">قيد المراجعة</option>
                  <option value="approved">تم الاعتماد والتجهيز</option>
                  <option value="in_transit">جاري الشحن والتوصيل مع المندوب</option>
                  <option value="delivered">تم التسليم بنجاح</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-sm"
                >
                  حفظ وإرسال إشعار للعميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: RECEIPT ZOOM MODAL --- */}
      {selectedReceiptImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-xl w-full bg-slate-900 rounded-3xl p-4 border border-slate-800 text-center space-y-4">
            <button
              onClick={() => setSelectedReceiptImage(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-white font-bold text-sm">صورة إيصال التحويل / سكرين شوت الدفع</h4>
            <img src={selectedReceiptImage} alt="Payment Receipt" className="w-full max-h-[70vh] object-contain rounded-2xl border border-slate-700 mx-auto" />
          </div>
        </div>
      )}

    </div>
  );
};
