import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  ShoppingBag, 
  Flame, 
  Star, 
  ShieldCheck, 
  Check, 
  FileText, 
  ArrowLeft,
  Lock,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Book } from '../types';

export const SpotlightBookSection: React.FC = () => {
  const { 
    books, 
    settings, 
    addToCart, 
    setIsCartOpen, 
    setSelectedBookDetail, 
    setActiveReadingBook,
    setIsCheckoutOpen,
    currentUser,
    setIsAuthOpen
  } = useStore();

  // Find the designated 7th spotlight book
  const spotlightBook: Book | undefined = books.find(b => b.id === settings.spotlightBookId) || books[0];

  if (!spotlightBook) return null;

  const customTitle = settings.spotlightBookCustomTitle || spotlightBook.title;
  const customBadge = settings.spotlightBookBadge || "الكتاب المميز للأسبوع 🔥";
  const customSubtitle = settings.spotlightBookSubtitle || spotlightBook.description;

  const price = spotlightBook.hasDiscount && spotlightBook.discountPrice 
    ? spotlightBook.discountPrice 
    : spotlightBook.price;

  const handleBuyNow = (format: 'physical' | 'digital') => {
    addToCart(spotlightBook, format, 1);
    setIsCartOpen(true);
  };

  const handleDirectDigitalBuy = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    addToCart(spotlightBook, 'digital', 1);
    setIsCheckoutOpen(true);
  };

  return (
    <motion.section 
      id="spotlight-book-section" 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl p-5 sm:p-8 lg:p-10"
    >
      
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
        
        {/* Book Cover Showcase */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <motion.div 
            className="relative group cursor-pointer animate-float-gentle" 
            onClick={() => setSelectedBookDetail(spotlightBook)}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            
            {/* Top Badge */}
            <div className="absolute -top-3 right-4 z-20">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-amber-300/40">
                <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950 animate-bounce" />
                <span>{customBadge}</span>
              </span>
            </div>

            {/* Cover Image */}
            <div className="relative w-44 sm:w-52 lg:w-56 h-64 sm:h-76 lg:h-80 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:shadow-orange-500/20 transition-all duration-300 bg-slate-800">
              <img 
                src={spotlightBook.coverImage} 
                alt={spotlightBook.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>

            {/* Quick Preview Hover Overlay */}
            <div className="absolute bottom-3 inset-x-3 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                <span>انقر للتفاصيل وقراءة العينة</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Book Information & Interactive Actions */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5 text-right">
          
          {/* Header Badges & Rating */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold px-3 py-1 rounded-xl">
                {spotlightBook.category}
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>متاح ورقي + قارئ PDF محمي</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-mono">4.9</span>
              <span className="text-slate-400 text-[10px]">(أعلى تقييم بالمتجر)</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-1">
              الكتاب السابع المميز | اختيار الإدارة
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
              {customTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              بقلم الكاتب / <span className="text-slate-200 font-bold">{spotlightBook.author}</span>
            </p>
          </div>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl line-clamp-3">
            {customSubtitle}
          </p>

          {/* Pricing Box */}
          <div className="flex flex-wrap items-center gap-4 py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
                {price}
              </span>
              <span className="text-xs font-bold text-slate-300">جنيه مصري</span>
              
              {spotlightBook.hasDiscount && spotlightBook.discountPrice && (
                <span className="text-xs sm:text-sm text-slate-500 line-through font-mono mr-2">
                  {spotlightBook.price} ج.م
                </span>
              )}
            </div>

            {spotlightBook.hasDiscount && (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                وفر {spotlightBook.price - (spotlightBook.discountPrice || spotlightBook.price)} ج.م
              </span>
            )}
          </div>

          {/* Call to Actions Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            
            {/* Direct Digital Buy Form Trigger */}
            <motion.button
              onClick={handleDirectDigitalBuy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 sm:px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>طلب النسخة الرقمية (PDF محمي)</span>
            </motion.button>

            {/* Physical Delivery Buy */}
            <motion.button
              onClick={() => handleBuyNow('physical')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span>طلب نسخة ورقية فاخرة</span>
            </motion.button>

            {/* Read Sample PDF */}
            <motion.button
              onClick={() => setActiveReadingBook(spotlightBook)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
              title="قراءة عينة من أول صفحات الكتاب"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>تصفح أول 5 صفحات مجاناً</span>
            </motion.button>

          </div>

        </div>

      </div>

    </motion.section>
  );
};
