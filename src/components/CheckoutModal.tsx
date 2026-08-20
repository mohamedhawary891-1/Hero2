import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Truck, 
  Lock, 
  CreditCard, 
  Smartphone, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileText,
  AlertCircle,
  MessageCircle,
  Sparkles,
  UserCheck,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { EGYPT_GOVERNORATES_LIST, MAX_PHYSICAL_BOOKS_PER_ORDER } from '../utils/shippingEngine';
import { Order } from '../types';
import { sanitizeInput, validateReceiptUpload } from '../utils/security';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    currentUser, 
    setIsAuthOpen,
    createOrder, 
    calculateShipping,
    physicalBooksCount,
    digitalBooksCount,
    subtotal,
    settings,
    setIsLibraryOpen,
    setIsInvoiceModalOpen,
    setActiveInvoiceOrder,
    setIsTrackingModalOpen,
    setActiveTrackingOrder
  } = useStore();

  // Form State - Pre-fill from logged-in user profile automatically
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    governorate: 'القاهرة',
    address: '',
    notes: '',
    paymentMethod: 'vodafone_cash' as 'vodafone_cash' | 'instapay' | 'cash_on_delivery',
    paymentSenderPhone: '',
    paymentSenderName: '',
    transactionScreenshot: '',
    transactionRef: '',
  });

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Auto-fill when modal opens or user changes
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone,
        email: currentUser.email || prev.email,
        governorate: currentUser.governorate || prev.governorate || 'القاهرة',
        address: currentUser.address || prev.address,
        paymentSenderPhone: currentUser.phone || prev.paymentSenderPhone,
        paymentSenderName: currentUser.name || prev.paymentSenderName,
      }));
    }
  }, [currentUser, isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  // STRICT LOGIN ENFORCEMENT: If not logged in, prompt user to log in before purchasing
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 text-slate-900 font-sans">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-center p-6 sm:p-8 space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-black text-slate-900 text-lg">تسجيل الدخول مطلوب للمتابعة</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              لحماية مشترياتك وإضافة الكتب الرقمية لمكتبتك المشفرة وتتبع شحنتك بدقة، يرجى تسجيل الدخول أو إنشاء حساب جديد أولاً.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setIsAuthOpen(true);
              }}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول / إنشاء حساب الآن</span>
            </button>

            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-bold transition"
            >
              العودة للمتجر
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Real-time calculated shipping & totals
  const { shippingCost, error: shippingError } = calculateShipping(formData.governorate);
  const finalShipping = physicalBooksCount > 0 ? shippingCost : 0;
  const grandTotal = subtotal + finalShipping;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(settings.vodafoneCashNumber || '01001332899');
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateReceiptUpload(file);
      if (!validation.isValid) {
        setErrorMessage(validation.error || 'ملف غير صالح');
        e.target.value = '';
        return;
      }
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormData(prev => ({
          ...prev,
          transactionScreenshot: uploadEvent.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || formData.name.length < 3) {
      setErrorMessage('يرجى إدخال الاسم الثلاثي كاملاً');
      return;
    }

    if (!formData.phone.trim() || !/^01[0125][0-9]{8}$/.test(formData.phone.replace(/\s+/g, ''))) {
      setErrorMessage('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صالح لاستلام تأكيد الطلب');
      return;
    }

    if (physicalBooksCount > 0 && !formData.address.trim()) {
      setErrorMessage('يرجى كتابة العنوان التفصيلي لشحن الكتب الورقية');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If Vodafone Cash, require sender phone, sender name and receipt screenshot
    if (formData.paymentMethod === 'vodafone_cash') {
      if (!formData.paymentSenderPhone.trim()) {
        setErrorMessage('يرجى كتابة رقم محفظة فودافون كاش التي قمت بالتحويل منها.');
        return;
      }
      if (!formData.paymentSenderName.trim()) {
        setErrorMessage('يرجى كتابة اسم صاحب المحفظة المُحوّل منها.');
        return;
      }
      if (!formData.transactionScreenshot) {
        setErrorMessage('يرجى رفع صورة إيصال أو سكرين شوت التحويل لتأكيد السداد.');
        return;
      }
    }

    // If InstaPay, require sender name, sender phone/handle and receipt screenshot
    if (formData.paymentMethod === 'instapay') {
      if (!formData.paymentSenderName.trim()) {
        setErrorMessage('يرجى كتابة الاسم المسجل في حساب إنستاباي المُحوّل منه.');
        return;
      }
      if (!formData.paymentSenderPhone.trim()) {
        setErrorMessage('يرجى كتابة رقم الهاتف أو عنوان الدفع اللحظي IPA المُحوّل منه.');
        return;
      }
      if (!formData.transactionScreenshot) {
        setErrorMessage('يرجى رفع صورة إيصال التحويل من تطبيق إنستاباي لتأكيد السداد.');
        return;
      }
    }

    setStep(3);
  };

  const handleFinalOrderSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await createOrder({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        governorate: formData.governorate,
        address: formData.address,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        paymentSenderPhone: formData.paymentSenderPhone,
        paymentSenderName: formData.paymentSenderName,
        transactionScreenshot: formData.transactionScreenshot,
        transactionRef: formData.transactionRef,
      });

      if (result.success && result.order) {
        setCreatedOrder(result.order);
        setStep(4);
        
        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }
      } else {
        setErrorMessage(result.error || 'حدث خطأ أثناء حفظ الطلب');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = createdOrder 
    ? `مرحباً هواري ستور، قمت بطلب أوردر جديد رقم: #${createdOrder.id} باسم: ${createdOrder.customerName} بقيمة إجمالية: ${createdOrder.totalAmount} جنيه.`
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-slate-900 font-sans animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Step Progress */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-white">إتمام طلب الشراء والدفع المعتمد</h2>
              <p className="text-xs text-orange-100">
                {step === 1 && 'الخطوة 1: بيانات المشتري والعنوان'}
                {step === 2 && 'الخطوة 2: وسيلة الدفع وإثبات التحويل'}
                {step === 3 && 'الخطوة 3: مراجعة تفاصيل الطلب وتأكيده'}
                {step === 4 && 'الخطوة 4: تم إرسال الطلب بنجاح!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* STEP 1: CUSTOMER INFO */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Physical Books Quantity Status Banner */}
              {physicalBooksCount > 0 && (
                <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                  physicalBooksCount > MAX_PHYSICAL_BOOKS_PER_ORDER
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-600" />
                    <span>عدد الكتب الورقية في هذا الطلب:</span>
                  </div>
                  <span className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full ${
                    physicalBooksCount > MAX_PHYSICAL_BOOKS_PER_ORDER
                      ? 'bg-rose-600 text-white'
                      : 'bg-orange-600 text-white'
                  }`}>
                    {physicalBooksCount} من {MAX_PHYSICAL_BOOKS_PER_ORDER} كتب (الحد الأقصى)
                  </span>
                </div>
              )}

              {physicalBooksCount === 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">طلب كتب رقمية فورية (PDF مشفر): </span>
                    <span>لا توجد مصاريف شحن، ويتم تفعيل الكتب مباشرة في حسابك فور اعتماد الدفع.</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">الاسم الثلاثي بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="محمد علي الهواري"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">رقم الهاتف (واتساب للتأكيد) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className={`grid grid-cols-1 ${physicalBooksCount > 0 ? 'sm:grid-cols-2' : ''} gap-4`}>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">البريد الإلكتروني المعتمد *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition font-mono"
                    dir="ltr"
                  />
                </div>

                {/* Governorate selection: ONLY show if order has physical books */}
                {physicalBooksCount > 0 && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">المحافظة (حساب الشحن الدقيق) *</label>
                    <select
                      value={formData.governorate}
                      onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition cursor-pointer"
                    >
                      {EGYPT_GOVERNORATES_LIST.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Physical Delivery Address: ONLY show if order has physical books */}
              {physicalBooksCount > 0 && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">العنوان التفصيلي للتوصيل *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="اسم الشارع، رقم العقار، الشقة، علامة مميزة بجوار..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">ملاحظات إضافية على الطلب (اختياري)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي تعليمات خاصة بالطلب..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
                />
              </div>

              {/* Dynamic Shipping Price Banner (Only for Physical Books) */}
              {physicalBooksCount > 0 && (
                <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-slate-800">
                      شحن محافظة {formData.governorate} ({physicalBooksCount} كتب):
                    </span>
                  </div>
                  <span className="font-black text-orange-600 text-sm font-mono">
                    {finalShipping} جنيه
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={physicalBooksCount > MAX_PHYSICAL_BOOKS_PER_ORDER}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
                >
                  <span>متابعة لطرق الدفع</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD & FORM */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* High-visibility Payment Action Banner */}
              <div className="bg-linear-to-r from-orange-600 to-amber-600 rounded-2xl p-4 text-white shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-black text-sm">خطوة السداد أولاً:</span>
                  </div>
                  <span className="bg-white text-orange-700 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                    المبلغ المطلوب: {grandTotal} ج.م
                  </span>
                </div>
                <p className="text-xs text-orange-100 leading-relaxed">
                  يرجى تحويل المبلغ بدقة إلى الرقم المعتمد أدناه عبر <span className="font-bold underline">فودافون كاش</span> أو <span className="font-bold underline">InstaPay</span>، ثم تعبئة بيانات التحويل وإرفاق الإيصال لإصدار الفاتورة واعتماد الطلب فوراً.
                </p>

                {/* Number Copy Box */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 bg-black/20 p-2.5 rounded-xl border border-white/20">
                  <div className="flex items-center gap-2 text-xs">
                    <Smartphone className="w-4 h-4 text-orange-200" />
                    <span>رقم التحويل المعتمد (فودافون كاش & إنستاباي):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base text-yellow-300 tracking-wider" dir="ltr">
                      {settings.vodafoneCashNumber || '01001332899'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className="px-3 py-1 bg-white hover:bg-orange-50 text-orange-700 font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1"
                    >
                      {copiedNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الرقم</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">اختر طريقة السداد التي قمت بالتحويل من خلالها:</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Vodafone Cash */}
                  <label className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                    formData.paymentMethod === 'vodafone_cash' 
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 ring-2 ring-orange-500/20' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vodafone_cash"
                      checked={formData.paymentMethod === 'vodafone_cash'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'vodafone_cash' })}
                      className="text-orange-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-xs">فودافون كاش (Vodafone Cash)</div>
                      <div className="text-[10px] text-slate-500 truncate">تحويل محفظة إلكترونية للرقم 01001332899</div>
                    </div>
                    <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded">Vodafone</span>
                  </label>

                  {/* InstaPay */}
                  <label className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                    formData.paymentMethod === 'instapay' 
                      ? 'border-purple-500 bg-purple-50/80 text-purple-950 ring-2 ring-purple-500/20' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="instapay"
                      checked={formData.paymentMethod === 'instapay'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'instapay' })}
                      className="text-purple-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-xs">تطبيق إنستاباي (InstaPay)</div>
                      <div className="text-[10px] text-slate-500 truncate">تحويل بنكي ولحظي للرقم 01001332899</div>
                    </div>
                    <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded">InstaPay</span>
                  </label>
                </div>

                {/* Cash on Delivery (only if physical books) */}
                {physicalBooksCount > 0 && digitalBooksCount === 0 && (
                  <label className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                    formData.paymentMethod === 'cash_on_delivery' 
                      ? 'border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-500/20' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cash_on_delivery' })}
                      className="text-orange-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs">الدفع نقداً عند الاستلام (COD)</div>
                      <div className="text-[10px] text-slate-500">سداد قيمة الكتب والشحن لمندوب شركة الشحن عند الاستلام</div>
                    </div>
                    <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded">عند الاستلام</span>
                  </label>
                )}
              </div>

              {/* Vodafone Cash Fields */}
              {formData.paymentMethod === 'vodafone_cash' && (
                <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 border-b border-orange-200 pb-2 text-orange-900 font-bold">
                    <Smartphone className="w-4 h-4 text-orange-600" />
                    <span>بيانات تحويل فودافون كاش:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">رقم المحفظة المُحوّل منها *</label>
                      <input
                        type="tel"
                        required
                        value={formData.paymentSenderPhone}
                        onChange={(e) => setFormData({ ...formData, paymentSenderPhone: e.target.value })}
                        placeholder="010XXXXXXXX"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:border-orange-500 focus:outline-none font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">اسم صاحب المحفظة المُحوّل منها *</label>
                      <input
                        type="text"
                        required
                        value={formData.paymentSenderName}
                        onChange={(e) => setFormData({ ...formData, paymentSenderName: e.target.value })}
                        placeholder="الاسم المسجل على خط فودافون كاش"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">إرفاق صورة إيصال / سكرين شوت التحويل *</label>
                    <input
                      type="file"
                      accept="image/*"
                      required={!formData.transactionScreenshot}
                      onChange={handleScreenshotUpload}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer"
                    />
                    {formData.transactionScreenshot && (
                      <div className="mt-2 p-2 bg-white rounded-xl border border-emerald-300 flex items-center gap-3">
                        <img src={formData.transactionScreenshot} alt="Receipt Preview" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                        <div>
                          <div className="text-xs font-black text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم إرفاق صورة الإيصال بنجاح</span>
                          </div>
                          <p className="text-[10px] text-slate-500">سيتم حفظ الإيصال لمراجعة الإدارة واعتماد الفاتورة فوراً</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">الرقم المرجعي أو كود العملية (اختياري)</label>
                    <input
                      type="text"
                      value={formData.transactionRef}
                      onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                      placeholder="كود العملية من رسالة فودافون كاش..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:border-orange-500 focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {/* InstaPay Fields */}
              {formData.paymentMethod === 'instapay' && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 border-b border-purple-200 pb-2 text-purple-900 font-bold">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span>بيانات تحويل إنستاباي (InstaPay):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">الاسم المسجل في حساب إنستاباي المُحوّل منه *</label>
                      <input
                        type="text"
                        required
                        value={formData.paymentSenderName}
                        onChange={(e) => setFormData({ ...formData, paymentSenderName: e.target.value })}
                        placeholder="اسمك في تطبيق إنستاباي"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">رقم الهاتف / معرّف IPA المُحوّل منه *</label>
                      <input
                        type="text"
                        required
                        value={formData.paymentSenderPhone}
                        onChange={(e) => setFormData({ ...formData, paymentSenderPhone: e.target.value })}
                        placeholder="010XXXXXXXX أو username@instapay"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:border-purple-500 focus:outline-none font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">إرفاق صورة إيصال تحويل إنستاباي *</label>
                    <input
                      type="file"
                      accept="image/*"
                      required={!formData.transactionScreenshot}
                      onChange={handleScreenshotUpload}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                    />
                    {formData.transactionScreenshot && (
                      <div className="mt-2 p-2 bg-white rounded-xl border border-emerald-300 flex items-center gap-3">
                        <img src={formData.transactionScreenshot} alt="Receipt Preview" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                        <div>
                          <div className="text-xs font-black text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم إرفاق صورة إيصال إنستاباي بنجاح</span>
                          </div>
                          <p className="text-[10px] text-slate-500">سيتم حفظ الإيصال لمراجعة الإدارة واعتماد الفاتورة فوراً</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">الرقم المرجعي للمعاملة البنكية (اختياري)</label>
                    <input
                      type="text"
                      value={formData.transactionRef}
                      onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                      placeholder="Transaction Reference Number..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:border-purple-500 focus:outline-none font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>الرجوع للبيانات</span>
                </button>

                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
                >
                  <span>مراجعة الطلب النهائية</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER SUMMARY & SUBMISSION */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                <h4 className="font-black text-sm text-slate-900 border-b border-slate-200 pb-2">
                  ملخص عناصر الطلب:
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {cart.map((item) => (
                    <div key={`${item.book.id}-${item.selectedFormat}`} className="flex justify-between items-center py-1">
                      <div className="truncate max-w-[280px]">
                        <span className="font-bold text-slate-800">{item.book.title}</span>
                        <span className="text-[10px] text-slate-500 mr-2">
                          ({item.selectedFormat === 'physical' ? 'ورقي' : 'رقمي مشفر'} × {item.quantity})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {(item.book.hasDiscount && item.book.discountPrice ? item.book.discountPrice : item.book.price) * item.quantity} ج.م
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-2 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>سعر الكتب مجمعة:</span>
                    <span className="font-mono font-bold">{subtotal} جنيه</span>
                  </div>
                  {physicalBooksCount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>مصاريف الشحن والتوصيل ({formData.governorate}):</span>
                      <span className="font-mono font-bold text-orange-600">{finalShipping} جنيه</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-orange-600 pt-1.5 border-t border-slate-300">
                    <span>الإجمالي النهائي المستحق:</span>
                    <span className="font-mono text-base">{grandTotal} جنيه مصري</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>طلبك محمي ومسجل تلقائياً في سيرفر هوستنجر وقاعدة بيانات Firebase.</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>تعديل طريقة الدفع</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalOrderSubmit}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-8 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
                >
                  {isSubmitting ? (
                    <span>جاري تأكيد وإرسال الطلب...</span>
                  ) : (
                    <>
                      <span>تأكيد وإتمام الطلب الآن ({grandTotal} ج.م)</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER SUCCESS */}
          {step === 4 && createdOrder && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">تهانينا! تم تسجيل طلبك بنجاح</h3>
                <p className="text-xs text-slate-500 mt-1">
                  رقم الطلب الخاص بك: <span className="font-mono font-bold text-orange-600">#{createdOrder.id}</span>
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-right space-y-1.5 max-w-md mx-auto">
                <div><span className="text-slate-500">اسم المشتري:</span> {createdOrder.customerName}</div>
                <div><span className="text-slate-500">رقم الهاتف:</span> {createdOrder.customerPhone}</div>
                <div><span className="text-slate-500">المحافظة:</span> {createdOrder.governorate}</div>
                <div><span className="text-slate-500">الإجمالي:</span> <span className="font-black text-orange-600">{createdOrder.totalAmount} جنيه</span></div>
                <div><span className="text-slate-500">حالة الطلب:</span> <span className="text-amber-600 font-bold">قيد المراجعة وتأكيد التحويل</span></div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setActiveInvoiceOrder(createdOrder);
                    setIsInvoiceModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span>معاينة وطباعة الفاتورة</span>
                </button>

                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setActiveTrackingOrder(createdOrder);
                    setIsTrackingModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Truck className="w-4 h-4" />
                  <span>تتبع الشحنة</span>
                </button>

                <a
                  href={`https://wa.me/${(settings.whatsappNumber || '+201001332899').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال إيصال الدفع عبر واتساب</span>
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
