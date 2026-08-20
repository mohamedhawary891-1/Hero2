import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  BookOpen, 
  Sparkles, 
  SearchX, 
  Layers, 
  LayoutGrid,
  Lock,
  Package
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BookCard } from './BookCard';

export const FullCatalogModal: React.FC = () => {
  const { 
    isFullCatalogOpen, 
    setIsFullCatalogOpen, 
    books, 
    settings 
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('الكل');
  const [formatFilter, setFormatFilter] = useState<'all' | 'physical' | 'digital'>('all');

  if (!isFullCatalogOpen) return null;

  const categories = settings.categories || ["الكل", "روايات", "إدارة وأعمال", "تنمية بشرية", "تاريخ", "دينية", "أطفال", "علوم", "فلسفة", "تقنية"];

  const filtered = books.filter(book => {
    // Category
    const matchesCategory = selectedCat === "الكل" || book.category === selectedCat;
    
    // Search
    const term = search.toLowerCase().trim();
    const matchesSearch = !term ||
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.category.toLowerCase().includes(term) ||
      book.description.toLowerCase().includes(term);

    // Format
    let matchesFormat = true;
    if (formatFilter === 'physical') {
      matchesFormat = book.format === 'physical' || book.format === 'both';
    } else if (formatFilter === 'digital') {
      matchesFormat = book.format === 'digital' || book.format === 'both';
    }

    return matchesCategory && matchesSearch && matchesFormat;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 text-slate-900 font-sans animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white">
                  مكتبة وكتالوج جميع كتب المنصة ({books.length} كتاب)
                </h2>
              </div>
              <p className="text-xs text-orange-100">
                تصفح كامل مؤلفات المتجر الورقية والرقمية مع إمكانية البحث والتصفية الفورية
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFullCatalogOpen(false)}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
            title="إغلاق الكتالوج"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم الكتاب، اسم المؤلف، أو نبذة..."
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none shadow-xs transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Format Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300 shrink-0">
              <button
                onClick={() => setFormatFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  formatFilter === 'all' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFormatFilter('physical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  formatFilter === 'physical' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>ورقي</span>
              </button>
              <button
                onClick={() => setFormatFilter('digital')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  formatFilter === 'digital' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>رقمي PDF</span>
              </button>
            </div>

          </div>

          {/* Clean Category Chips (Without book count numbers) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5 text-orange-600" />
              <span>القسم:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCat === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid View */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">لا توجد نتائج مطابقة لبحثك</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                جرب تغيير كلمات البحث أو اختيار قسم آخر لعرض الكتب
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCat('الكل');
                  setFormatFilter('all');
                }}
                className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-orange-500 transition"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filtered.map((book) => (
                <BookCard key={`catalog-${book.id}`} book={book} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>يتم عرض <strong>{filtered.length}</strong> من أصل <strong>{books.length}</strong> كتاب في الكتالوج</span>
          <button
            onClick={() => setIsFullCatalogOpen(false)}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
