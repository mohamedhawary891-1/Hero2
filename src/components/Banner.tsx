import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Brain, 
  Landmark, 
  Moon, 
  Smile, 
  Atom, 
  Sparkles, 
  Laptop, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';

export const Banner: React.FC = () => {
  const { selectedCategory, setSelectedCategory, settings, setIsFullCatalogOpen } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = settings.heroSlides && settings.heroSlides.length > 0
    ? settings.heroSlides
    : [
        {
          id: "slide-1",
          title: "متجر هواري للكتب الورقية والرقمية",
          subtitle: "أضخم تشكيلة من أحدث الروايات والكتب الفكرية مع شحن سريع وقارئ PDF محمي ضد القرصنة",
          image: "https://images.unsplash.com/photo-1507842229450-7907e4d5da99?auto=format&fit=crop&q=80&w=1200",
          badge: "خصم يصل إلى 30%",
          ctaText: "تصفح أحدث الكتب",
          category: "الكل"
        }
      ];

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[currentSlide] || heroSlides[0];

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSlideCta = () => {
    if (activeSlide.category && activeSlide.category !== "الكل") {
      setSelectedCategory(activeSlide.category);
    }
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = settings.categories || ["الكل", "روايات", "إدارة وأعمال", "تنمية بشرية", "تاريخ", "دينية", "أطفال", "علوم", "فلسفة", "تقنية"];

  return (
    <div className="space-y-6">
      
      {/* 1. HERO BANNER CAROUSEL (Matching the user's design image) */}
      <div className="relative rounded-3xl overflow-hidden shadow-md bg-slate-950 text-white min-h-[260px] sm:min-h-[340px] flex items-center">
        
        {/* Background Image with Dark Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-100"
          style={{ backgroundImage: `url(${activeSlide.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-900/60" />
        </div>

        {/* Content Box with Motion Animation */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeSlide.id || currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 max-w-2xl px-6 sm:px-12 py-8 space-y-4 text-right"
          >
            
            {/* Badge */}
            {activeSlide.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/90 text-white text-xs font-black shadow-sm animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>{activeSlide.badge}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
              {activeSlide.title}
            </h1>

            {/* Subtitle / Description */}
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed max-w-xl">
              {activeSlide.subtitle}
            </p>

            {/* Action CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <motion.button
                onClick={handleSlideCta}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 sm:px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span>{activeSlide.ctaText || "استكشف الآن"}</span>
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              {/* Requested Browse All Books button */}
              <motion.button
                onClick={() => setIsFullCatalogOpen(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 sm:px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-xs transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-orange-400" />
                <span>تصفح جميع الكتب</span>
              </motion.button>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrows */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition hover:scale-110 active:scale-95"
              title="السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex gap-1 px-1">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === i ? 'w-6 bg-orange-500' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition hover:scale-110 active:scale-95"
              title="التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* 2. CATEGORY PILLS BAR (Matching user's design image) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap px-2 flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5 text-orange-600" />
            <span>الأقسام:</span>
          </span>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <motion.button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-orange-600 border border-slate-200/80'
                }`}
              >
                <span>{cat}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
