import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Banner } from './components/Banner';
import { SpotlightBookSection } from './components/SpotlightBookSection';
import { FullCatalogModal } from './components/FullCatalogModal';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { SecurePdfReaderModal } from './components/SecurePdfReaderModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { MyLibraryModal } from './components/MyLibraryModal';
import { AdminDashboard } from './components/AdminDashboard';
import { NotificationsModal } from './components/NotificationsModal';
import { ShipmentTrackingModal } from './components/ShipmentTrackingModal';
import { InvoiceModal } from './components/InvoiceModal';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { BookOpen, SearchX, Sparkles, Filter, ChevronLeft, Flame, ArrowLeft, LayoutGrid, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const StoreMain: React.FC = () => {
  const { 
    books, 
    settings,
    selectedCategory, 
    searchQuery, 
    selectedFormatFilter, 
    setSelectedCategory,
    setSearchQuery,
    setSelectedFormatFilter,
    setIsFullCatalogOpen
  } = useStore();

  // 6 Curated Books for the Homepage Grid (managed from Dashboard)
  const curatedBookIds = settings.featuredBookIds && settings.featuredBookIds.length > 0
    ? settings.featuredBookIds
    : books.slice(0, 6).map(b => b.id);

  // Match IDs to book objects, fallback if any deleted
  const curatedBooks = curatedBookIds
    .map(id => books.find(b => b.id === id))
    .filter((b): b is typeof books[0] => Boolean(b))
    .slice(0, 6);

  // If fewer than 6, fill with other available books to keep a solid 6-book grid
  const finalSixBooks = curatedBooks.length >= 6 
    ? curatedBooks 
    : [...curatedBooks, ...books.filter(b => !curatedBooks.some(cb => cb.id === b.id))].slice(0, 6);

  // Filter books according to category, search query, and format
  const filteredBooks = books.filter(book => {
    // Category match
    const matchesCategory = selectedCategory === "الكل" || book.category === selectedCategory;
    
    // Search match
    const cleanSearch = searchQuery.toLowerCase().trim();
    const matchesSearch = !cleanSearch || 
      book.title.toLowerCase().includes(cleanSearch) || 
      book.author.toLowerCase().includes(cleanSearch) ||
      book.category.toLowerCase().includes(cleanSearch) ||
      book.description.toLowerCase().includes(cleanSearch);

    // Format match
    let matchesFormat = true;
    if (selectedFormatFilter === 'physical') {
      matchesFormat = book.format === 'physical' || book.format === 'both';
    } else if (selectedFormatFilter === 'digital') {
      matchesFormat = book.format === 'digital' || book.format === 'both';
    }

    return matchesCategory && matchesSearch && matchesFormat;
  });

  const isFiltering = searchQuery || selectedCategory !== "الكل" || selectedFormatFilter !== "all";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-8">
        
        {/* Banner & Hero Showcase & Category Pills */}
        <Banner />

        {/* SECTION 1: 7th SPOTLIGHT BOOK (Visible on Homepage default) */}
        {!isFiltering && (
          <SpotlightBookSection />
        )}

        {/* SECTION 2: 6 HOMEPAGE CURATED BOOKS (Visible on Homepage default) */}
        {!isFiltering && (
          <motion.section 
            id="curated-books-section" 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 pt-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-orange-600 rounded-full shrink-0" />
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {settings.bestsellersTitle || "مختارات الصفحة الرئيسية"}
                  </h2>
                  <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-600 shrink-0" />
                    <span>6 كتب مختارة بعناية</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsFullCatalogOpen(true)}
                className="text-xs font-bold bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-xs hover:scale-105"
              >
                <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                <span>تصفح جميع كتب المنصة ({books.length})</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {finalSixBooks.map((book) => (
                <BookCard key={`home-curated-${book.id}`} book={book} />
              ))}
            </div>
          </motion.section>
        )}

        {/* SECTION 3: FILTERED CATALOG SECTION (When user searches, selects category, or filters format) */}
        {isFiltering && (
          <motion.section 
            id="catalog-section" 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 pt-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-orange-600 rounded-full shrink-0" />
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {selectedCategory === "الكل" ? "نتائج البحث في الكتالوج" : `كتب قسم: ${selectedCategory}`}
                    </h2>
                    <span className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {filteredBooks.length} كتاب
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  اختر كتبك المفضلة بصيغ ورقية مع شحن سريع لكافة المحافظات أو رقمية PDF مع قارئ فوري مؤمن
                </p>
              </div>

              {/* Active Filter Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">الفلاتر النشطة:</span>
                {searchQuery && (
                  <span className="bg-white border border-slate-300 text-slate-800 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 shadow-xs">
                    بحث: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-rose-600 mr-1 font-mono">✕</button>
                  </span>
                )}
                {selectedCategory !== "الكل" && (
                  <span className="bg-orange-50 border border-orange-200 text-orange-800 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 shadow-xs">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("الكل")} className="hover:text-rose-600 mr-1 font-mono">✕</button>
                  </span>
                )}
                {selectedFormatFilter !== "all" && (
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 shadow-xs">
                    {selectedFormatFilter === 'physical' ? '📦 ورقي' : '🔒 رقمي PDF'}
                    <button onClick={() => setSelectedFormatFilter("all")} className="hover:text-rose-600 mr-1 font-mono">✕</button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("الكل");
                    setSelectedFormatFilter("all");
                  }}
                  className="text-xs text-rose-600 hover:underline font-bold mr-2"
                >
                  مسح الفلاتر
                </button>
              </div>
            </div>

            {/* Books Grid */}
            {filteredBooks.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <SearchX className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">لم يتم العثور على نتائج تطابق بحثك</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    جرب البحث بكلمات أخرى أو قم بإلغاء الفلاتر المحددة لعرض جميع كتب المتجر.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("الكل");
                    setSelectedFormatFilter("all");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-sm"
                >
                  إعادة ضبط الفلاتر وعرض الكل
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </motion.section>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Contact Button */}
      <FloatingWhatsApp />

      {/* Global Interactive Modals */}
      <BookDetailModal />
      <SecurePdfReaderModal />
      <CartDrawer />
      <CheckoutModal />
      <AuthModal />
      <MyLibraryModal />
      <AdminDashboard />
      <NotificationsModal />
      <ShipmentTrackingModal />
      <InvoiceModal />
      <FullCatalogModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreMain />
    </StoreProvider>
  );
}
