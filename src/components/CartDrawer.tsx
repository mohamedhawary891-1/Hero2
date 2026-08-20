import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  Lock, 
  ArrowLeft, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MAX_PHYSICAL_BOOKS_PER_ORDER, EGYPT_GOVERNORATES_LIST, calculateShippingCost } from '../utils/shippingEngine';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    subtotal,
    physicalBooksCount,
    digitalBooksCount,
    setIsCheckoutOpen,
    setIsAuthOpen,
    currentUser,
    settings
  } = useStore();

  const [quantityWarning, setQuantityWarning] = useState<string | null>(null);
  const [selectedGov, setSelectedGov] = useState<string>(currentUser?.governorate || 'الشرقية');

  if (!isCartOpen) return null;

  const handleQtyChange = (bookId: string, format: 'physical' | 'digital', delta: number) => {
    setQuantityWarning(null);
    const res = updateQuantity(bookId, format, delta);
    if (!res.success && res.message) {
      setQuantityWarning(res.message);
      setTimeout(() => setQuantityWarning(null), 3500);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const shippingData = calculateShippingCost(selectedGov, physicalBooksCount, settings.shippingRates);
  const calculatedShippingCost = physicalBooksCount > 0 ? shippingData.shippingCost : 0;
  const grandTotal = subtotal + calculatedShippingCost;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-r border-slate-200 text-slate-900 animate-in slide-in-from-left duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-600 text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base text-white">سلة المشتريات</h2>
                <p className="text-xs text-slate-300">
                  {cart.length === 0 ? 'السلة فارغة' : `${cart.reduce((s, i) => s + i.quantity, 0)} كتب في السلة`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-400 p-2 transition-colors rounded-xl bg-slate-800"
                  title="إفراغ السلة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Warning banner for physical book limits */}
          {quantityWarning && (
            <div className="bg-amber-50 border-y border-amber-200 p-3 text-xs font-bold text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{quantityWarning}</span>
            </div>
          )}

          {/* Cart Item List */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">سلتك لا تزال فارغة!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  تصفح تشكيلة الكتب الورقية والرقمية الأكثر طلباً وأضف ما يعجبك.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-sm"
                >
                  تصفح الكتب الآن
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const book = item.book;
                const unitPrice = book.hasDiscount && book.discountPrice ? book.discountPrice : book.price;
                const isPhysical = item.selectedFormat === 'physical';

                return (
                  <div 
                    key={`${item.book.id}-${item.selectedFormat}`}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex gap-3 items-center"
                  >
                    {/* Cover Thumbnail */}
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isPhysical 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {isPhysical ? <Truck className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                          {isPhysical ? 'ورقي 📦' : 'رقمي PDF 🔒'}
                        </span>
                        <span className="font-black text-xs text-orange-600">
                          {unitPrice * item.quantity} ج.م
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex flex-col items-end justify-between self-stretch">
                      <button
                        onClick={() => removeFromCart(book.id, item.selectedFormat)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          onClick={() => handleQtyChange(book.id, item.selectedFormat, -1)}
                          className="px-2 py-0.5 text-slate-600 hover:text-orange-600 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(book.id, item.selectedFormat, 1)}
                          className="px-2 py-0.5 text-slate-600 hover:text-orange-600 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              
              {/* Summary Calculation Box */}
              {physicalBooksCount > 0 ? (
                /* PHYSICAL BOOKS BREAKDOWN */
                <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>الكتب الورقية بالطلب:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {physicalBooksCount} / {MAX_PHYSICAL_BOOKS_PER_ORDER} كتب (الحد الأقصى)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span>سعر الكتب مجمعة:</span>
                    <span className="font-bold font-mono text-slate-900">{subtotal} ج.م</span>
                  </div>

                  {/* Immediate Governorate Selector */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-slate-700 font-bold shrink-0 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-orange-600" />
                      <span>محافظة التوصيل:</span>
                    </span>
                    <select
                      value={selectedGov}
                      onChange={(e) => setSelectedGov(e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {EGYPT_GOVERNORATES_LIST.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span>سعر الشحن ({selectedGov}):</span>
                    <span className="font-bold font-mono text-orange-600">{calculatedShippingCost} ج.م</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
                    <span>الإجمالي شامل الشحن:</span>
                    <span className="font-mono text-orange-600 text-base">{grandTotal} ج.م</span>
                  </div>
                </div>
              ) : (
                /* DIGITAL ONLY BOOKS BREAKDOWN */
                <div className="space-y-2 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-xs">
                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>نوع الطلب:</span>
                    </span>
                    <span>كتب رقمية مشفرة PDF ({digitalBooksCount} كتب)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>إجمالي سعر الكتب:</span>
                    <span className="font-bold font-mono text-slate-900">{subtotal} ج.م</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-sm font-black text-slate-900">
                    <span>الإجمالي المستحق للدفع:</span>
                    <span className="font-mono text-emerald-700 text-base">{subtotal} ج.م</span>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <span>متابعة إتمام الطلب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
