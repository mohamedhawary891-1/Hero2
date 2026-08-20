import React from 'react';
import { 
  X, 
  Library, 
  BookOpen, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MyLibraryModal: React.FC = () => {
  const { 
    isLibraryOpen, 
    setIsLibraryOpen, 
    currentUser, 
    books, 
    orders,
    setActiveReadingBook,
    setIsAuthOpen,
    setSelectedFormatFilter
  } = useStore();

  if (!isLibraryOpen) return null;

  // Filter books specifically activated and granted to this user
  const userPurchasedBookIds = currentUser?.purchasedBooks || [];
  const ownedBooks = books.filter(b => userPurchasedBookIds.includes(b.id));

  // Find any digital orders placed by this user that are still pending activation
  const pendingDigitalOrders = currentUser ? orders.filter(o => 
    ((o.userId && o.userId === currentUser.uid) || (o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase())) &&
    o.items.some(i => i.format === 'digital') &&
    !o.digitalAccessGranted
  ) : [];

  const handleReadBook = (book: typeof books[0]) => {
    setIsLibraryOpen(false);
    setActiveReadingBook(book);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-slate-900 font-sans animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-white">مكتبتي الرقمية المشفرة</h2>
              <p className="text-xs text-slate-300">
                {currentUser ? `مرحباً ${currentUser.name} | قراءة محمية بدون تحميل` : 'يرجى تسجيل الدخول لمزامنة مكتبتك'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLibraryOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {!currentUser ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-200">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">سجل الدخول لعرض مكتبتك الرقمية</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                تتيح لك المكتبة قراءة جميع الكتب الرقمية المشتراة بعد تفعيلها من الإدارة في أي وقت ومن أي جهاز داخل القارئ الآمن لمتجر هواري.
              </p>
              <button
                onClick={() => {
                  setIsLibraryOpen(false);
                  setIsAuthOpen(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition"
              >
                تسجيل الدخول / إنشاء حساب
              </button>
            </div>
          ) : (
            <>
              {/* Pending Digital Orders Notice (if any) */}
              {pendingDigitalOrders.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>طلبات كتب رقمية قيد المراجعة والتفعيل من الإدارة:</span>
                  </div>
                  <div className="space-y-2">
                    {pendingDigitalOrders.map((order) => (
                      <div key={order.id} className="p-3 bg-white rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-orange-700">طلب #{order.id}</span>
                          <div className="text-slate-600">
                            {order.items.filter(i => i.format === 'digital').map(i => i.title).join('، ')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px]">
                            ⏳ بانتظار تفعيل المشرف
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    💡 بمجرد قيام إدارة المتجر بتأكيد استلام التحويل وتفعيل الطلب، ستظهر هذه الكتب فوراً في قسم "الكتب المتاحة للقراءة" بالأسفل.
                  </p>
                </div>
              )}

              {/* Owned & Activated Books */}
              {ownedBooks.length === 0 ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">لا توجد كتب رقمية مفعلة في مكتبتك حالياً</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    عند شراء أي كتاب بصيغة رقمية واعتماد التفعيل من الإدارة، سيظهر هنا فوراً للقراءة المحمية الكاملة.
                  </p>
                  <button
                    onClick={() => {
                      setIsLibraryOpen(false);
                      setSelectedFormatFilter('digital');
                      const el = document.getElementById('catalog-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition"
                  >
                    تصفح الكتب الرقمية في المتجر
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>الكتب الرقمية المفعلة والمتاحة للقراءة ({ownedBooks.length})</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {ownedBooks.map((book) => (
                      <div 
                        key={book.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 hover:border-orange-300 transition shadow-xs"
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-24 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                            <img 
                              src={book.coverImage} 
                              alt={book.title} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                              مفعل للقراءة الكاملة ✓
                            </span>
                            <h4 className="font-bold text-xs text-slate-900 truncate mt-1">{book.title}</h4>
                            <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{book.pages} صفحة</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleReadBook(book)}
                          className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>فتح القارئ الآمن الآن</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
