import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Moon, 
  BookOpen, 
  ShoppingBag, 
  EyeOff, 
  Maximize, 
  Minimize,
  AlertTriangle,
  Fingerprint,
  FileKey
} from 'lucide-react';
import { motion } from 'motion/react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';
import { generateSecureWatermark, isProtectedKeyEvent } from '../utils/security';

export const SecurePdfReaderModal: React.FC = () => {
  const { 
    activeReadingBook, 
    setActiveReadingBook, 
    currentUser, 
    addToCart, 
    setIsCartOpen 
  } = useStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [themeMode, setThemeMode] = useState<'light' | 'sepia' | 'dark'>('light');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isBlurredDueToSecurity, setIsBlurredDueToSecurity] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  const book = activeReadingBook;
  const isPurchased = currentUser?.purchasedBooks?.includes(book?.id || '');
  const isAdmin = currentUser?.role === 'admin';
  const hasFullAccess = isPurchased || isAdmin;

  const watermarkData = generateSecureWatermark(currentUser);

  // Pages array from book or generated placeholder pages
  const bookPages: string[] = book?.pdfContent || [
    "الصفحة 1: الغلاف والمقدمة التمهيدية لمحتوى الكتاب...",
    "الصفحة 2: الفهرس والموضوعات الرئيسية...",
    "الصفحة 3: الفصل الأول: البدايات والمنطلقات الأساسية...",
    "الصفحة 4: الفصل الثاني: التحليل التطبيقي والاستراتيجيات...",
    "الصفحة 5: الفصل الثالث: الخلاصة والنتائج...",
  ];

  const totalAllowedPages = hasFullAccess ? (book?.pages || bookPages.length) : (book?.samplePagesCount || 5);
  const isLockedPage = !hasFullAccess && currentPage > (book?.samplePagesCount || 5);

  // Anti-Screenshot and Tab-Switch Deterrent
  useEffect(() => {
    if (!activeReadingBook) return;

    const handleWindowBlur = () => {
      setIsBlurredDueToSecurity(true);
      setSecurityWarning("تم تفعيل وضع الحماية وتعتيم المحتوى للحد من تصوير الشاشة.");
    };

    const handleWindowFocus = () => {
      setIsBlurredDueToSecurity(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const check = isProtectedKeyEvent(e);
      if (check.isBlocked) {
        e.preventDefault();
        e.stopPropagation();
        setSecurityWarning(check.reason || "تم حجب هذا الإجراء لحماية حقوق الملكية الفكرية.");
        setTimeout(() => setSecurityWarning(null), 3500);
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setSecurityWarning("تم تعطيل النسخ لحماية المحتوى الرقمي لهواري ستور.");
      setTimeout(() => setSecurityWarning(null), 3000);
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('copy', handleCopy);
    };
  }, [activeReadingBook]);

  if (!book) return null;

  const handleNextPage = () => {
    if (currentPage < totalAllowedPages) {
      setCurrentPage(prev => prev + 1);
    } else if (!hasFullAccess) {
      setCurrentPage(prev => prev + 1); // trigger lock screen
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleUnlockFullBook = () => {
    addToCart(book, 'digital', 1);
    setActiveReadingBook(null);
    setIsCartOpen(true);
  };

  const themeClasses = {
    light: 'bg-amber-50/40 text-slate-900 border-amber-200/60',
    sepia: 'bg-[#f4ecd8] text-[#5b4636] border-[#d8cbbb]',
    dark: 'bg-slate-900 text-slate-100 border-slate-800'
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none protected-reader-container"
      onContextMenu={(e) => e.preventDefault()}
      ref={readerContainerRef}
    >
      {/* Top Reader Controls Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-3 text-white flex items-center justify-between gap-4 z-20 shadow-md">
        
        {/* Book Title & Badges */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-100 truncate">
                {book.title}
              </h2>
              {hasFullAccess ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  نسخة مشتراة كاملة
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <Lock className="w-3 h-3 text-amber-400" />
                  عينة قراءة مجانية ({book.samplePagesCount} صفحات)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
              <span>المؤلف: {book.author}</span>
              <span>•</span>
              <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-mono">
                <FileKey className="w-3 h-3" />
                DRM 256-bit
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition"
              title="تصغير"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-slate-300">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition"
              title="تكبير"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Mode Toggle */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setThemeMode('light')}
              className={`p-1.5 rounded-lg transition ${themeMode === 'light' ? 'bg-amber-100 text-slate-900' : 'text-slate-400 hover:text-white'}`}
              title="الوضع النهاري"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('sepia')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${themeMode === 'sepia' ? 'bg-[#ebd8b7] text-[#4a3b2c]' : 'text-slate-400 hover:text-white'}`}
              title="وضع القراءة الهادئ"
            >
              دافئ
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`p-1.5 rounded-lg transition ${themeMode === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="الوضع الليلي"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close Reader */}
          <button
            onClick={() => setActiveReadingBook(null)}
            className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition shadow"
            title="إغلاق القارئ"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Security Warning Notification Banner if triggered */}
      {securityWarning && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-center gap-2 z-30 shadow animate-pulse">
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{securityWarning}</span>
        </div>
      )}

      {/* Main Document Reading Canvas Stage */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center relative">
        
        {/* Anti-Screen Capture Blur Mask (if user leaves tab) */}
        {isBlurredDueToSecurity && (
          <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/40">
              <EyeOff className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">المحتوى محمي ومشفر بنظام DRM</h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed">
              تم حجب محتوى المستند تلقائياً أثناء الخروج من نافذة المتصفح لضمان حماية حقوق النشر والطبع لمتجر هواري. انقر هنا للاستمرار في القراءة.
            </p>
          </div>
        )}

        {/* The Document Page Container */}
        <div 
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className={`relative w-full max-w-3xl min-h-[580px] sm:min-h-[680px] rounded-2xl shadow-2xl p-6 sm:p-12 border transition-all duration-200 flex flex-col justify-between ${themeClasses[themeMode]}`}
        >
          {/* Multi-angle Security Watermark Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10 flex flex-col justify-around opacity-15 select-none rotate-[-18deg] scale-110">
            <div className="text-xs sm:text-sm font-black text-slate-700 tracking-wider text-center">
              {watermarkData.primaryText}
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-700 tracking-wider text-center">
              {watermarkData.secondaryText}
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-700 tracking-wider text-center">
              🔒 رمز الترخيص: {watermarkData.securityHash} • {watermarkData.timestamp}
            </div>
          </div>

          {/* Dynamic Floating Forensic Micro-Watermark that Drifts diagonally */}
          <motion.div
            animate={{
              x: [0, 40, -40, 0],
              y: [0, -30, 30, 0],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/3 left-1/4 pointer-events-none z-10 opacity-20 select-none text-[10px] font-mono text-slate-600 bg-white/40 px-2 py-0.5 rounded border border-slate-300 backdrop-blur-2xs"
          >
            {watermarkData.userFingerprint}
          </motion.div>

          {/* Page Content */}
          {isLockedPage ? (
            /* Locked Page Barrier */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-500 flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                لقد انتهت صفحات العينة المجانية
              </h3>
              <p className="text-slate-600 text-sm max-w-md leading-relaxed">
                لقراءة باقي صفحات الكتاب كاملة ({book.pages} صفحة)، يرجى إتمام شراء النسخة الرقمية لتفتح لك فوراً في مكتبتك الرقمية المشفرة.
              </p>
              
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-right w-full max-w-md">
                <div className="text-xs text-slate-500">سعر النسخة الرقمية:</div>
                <div className="text-xl font-black text-emerald-700">
                  {book.hasDiscount && book.discountPrice ? book.discountPrice : book.price} ج.م
                </div>
              </div>

              <button
                onClick={handleUnlockFullBook}
                className="w-full max-w-md py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-base shadow-xl flex items-center justify-center gap-2 transition"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>شراء النسخة الكاملة والفتح الفوري</span>
              </button>
            </div>
          ) : (
            /* Active Page Text View */
            <div className="flex-1 flex flex-col justify-between relative z-0">
              
              {/* Header of page */}
              <div className="flex items-center justify-between pb-4 border-b border-current/10 text-xs opacity-60">
                <span>{book.title}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Fingerprint className="w-3 h-3 text-emerald-600" />
                  قارئ متجر هواري المشفر
                </span>
              </div>

              {/* Body text of page */}
              <div className="py-6 space-y-4 leading-relaxed text-base sm:text-lg whitespace-pre-line font-medium">
                {bookPages[currentPage - 1] || `الصفحة ${currentPage}\n\n[محتوى الصفحة الرقمية المحمي - كتاب ${book.title}]`}
              </div>

              {/* Footer of page */}
              <div className="pt-4 border-t border-current/10 flex items-center justify-between text-xs opacity-60">
                <span>صفحة {currentPage} من {book.pages}</span>
                <span dir="ltr">ISBN: {book.isbn || 'HAWARI-STORE-DIGITAL'}</span>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Bottom Page Navigation Bar */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-3 text-white flex items-center justify-between gap-4 z-20 shadow-lg">
        
        {/* Previous page button */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm font-bold transition"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الصفحة السابقة</span>
        </button>

        {/* Page counter and indicator */}
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-bold text-amber-300">صفحة {currentPage}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300">{hasFullAccess ? book.pages : `${book.samplePagesCount} (عينة)`}</span>
        </div>

        {/* Next page button */}
        <button
          onClick={handleNextPage}
          disabled={hasFullAccess && currentPage >= book.pages}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold transition shadow"
        >
          <span>الصفحة التالية</span>
          <ChevronLeft className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
