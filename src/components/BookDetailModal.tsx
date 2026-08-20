import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  ShoppingBag, 
  Star, 
  Truck, 
  Lock, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  FileText,
  Bookmark,
  Share2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const BookDetailModal: React.FC = () => {
  const { 
    selectedBookDetail, 
    setSelectedBookDetail, 
    addToCart, 
    setIsCartOpen, 
    setActiveReadingBook,
    currentUser 
  } = useStore();

  const book = selectedBookDetail;
  const [selectedFormat, setSelectedFormat] = useState<'physical' | 'digital'>('physical');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!book) return null;

  const effectivePrice = book.hasDiscount && book.discountPrice ? book.discountPrice : book.price;
  const isPurchased = currentUser?.purchasedBooks?.includes(book.id);

  const handleAddToCart = () => {
    setErrorMessage(null);
    const chosenFormat = book.format === 'both' ? selectedFormat : (book.format === 'digital' ? 'digital' : 'physical');
    const result = addToCart(book, chosenFormat, quantity);
    if (result.success) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 1800);
    } else if (result.message) {
      setErrorMessage(result.message);
    }
  };

  const handleBuyNow = () => {
    const chosenFormat = book.format === 'both' ? selectedFormat : (book.format === 'digital' ? 'digital' : 'physical');
    const result = addToCart(book, chosenFormat, quantity);
    if (result.success) {
      setSelectedBookDetail(null);
      setIsCartOpen(true);
    } else if (result.message) {
      setErrorMessage(result.message);
    }
  };

  const handleOpenReader = () => {
    setSelectedBookDetail(null);
    setActiveReadingBook(book);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-900">
        
        {/* Top Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl">
              {book.category}
            </span>
          </div>

          <button
            onClick={() => setSelectedBookDetail(null)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Cover Column */}
          <div className="sm:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-[2/3] max-w-[220px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative mb-4 bg-slate-100">
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {book.hasDiscount && book.discountPrice && (
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow">
                  خصم {Math.round(((book.price - book.discountPrice) / book.price) * 100)}%
                </div>
              )}
            </div>

            {/* Read Sample CTA */}
            <button
              onClick={handleOpenReader}
              className="w-full max-w-[220px] py-2.5 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center gap-2 transition border border-orange-200"
            >
              <BookOpen className="w-4 h-4 text-orange-600" />
              <span>{isPurchased ? 'قراءة الكتاب كاملاً' : `معاينة العينة (${book.samplePagesCount} صفحات)`}</span>
            </button>
          </div>

          {/* Details Column */}
          <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-snug mb-1">
                {book.title}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mb-3">
                المؤلف: <span className="text-orange-600 font-bold">{book.author}</span>
              </p>

              {/* Badges row */}
              <div className="flex flex-wrap gap-2 text-[11px] mb-4">
                <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-500" />
                  {book.pages} صفحة
                </span>
                {book.isbn && (
                  <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-xl font-mono" dir="ltr">
                    ISBN: {book.isbn}
                  </span>
                )}
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  قارئ مشفر ضد التسريب
                </span>
              </div>

              {/* Description */}
              <div className="space-y-1 mb-4">
                <h4 className="text-xs font-bold text-slate-700">نبذة عن الكتاب:</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar">
                  {book.description}
                </p>
              </div>

              {/* Format selection if book offers both */}
              {book.format === 'both' && (
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-bold text-slate-700 block">اختر نوع النسخة:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFormat('physical')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        selectedFormat === 'physical'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>نسخة ورقية (شحن)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFormat('digital')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        selectedFormat === 'digital'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>نسخة رقمية PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
                {errorMessage}
              </div>
            )}

            {/* Price & Action Area */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">السعر الإجمالي:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-orange-600">
                      {effectivePrice * quantity} <span className="text-xs font-bold text-slate-500">جنيه</span>
                    </span>
                    {book.hasDiscount && book.discountPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {book.price * quantity} جنيه
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1 text-slate-600 hover:text-orange-600 font-bold"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold text-slate-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="px-3 py-1 text-slate-600 hover:text-orange-600 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleAddToCart}
                  className={`py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    addedNotice 
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {addedNotice ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>{addedNotice ? 'تمت الإضافة للسلة' : 'إضافة إلى السلة'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <span>شراء الآن والدفع</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
