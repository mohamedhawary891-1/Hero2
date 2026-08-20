import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Search, 
  MapPin, 
  Phone, 
  FileText, 
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';

export const ShipmentTrackingModal: React.FC = () => {
  const { 
    isTrackingModalOpen, 
    setIsTrackingModalOpen, 
    activeTrackingOrder, 
    setActiveTrackingOrder,
    orders,
    setIsInvoiceModalOpen,
    setActiveInvoiceOrder,
    settings
  } = useStore();

  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchError, setSearchError] = useState('');

  if (!isTrackingModalOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const cleanId = searchOrderId.trim().toUpperCase().replace('#', '');
    const found = orders.find(o => o.id.toUpperCase() === cleanId || (o.trackingNumber && o.trackingNumber.toUpperCase() === cleanId));
    if (found) {
      setActiveTrackingOrder(found);
    } else {
      setSearchError('لم يتم العثور على طلب بهذا الرقم، تأكد من كتابة كود الطلب بشكل صحيح (مثال: HW-123456)');
    }
  };

  const order = activeTrackingOrder;

  const getStepIndex = (status?: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'approved': return 1;
      case 'in_transit': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(order?.status);

  const steps = [
    { title: "تم استلام الطلب", desc: "تم تسجيل طلبك وبانتظار مراجعة المدفوعات", time: order ? new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : "" },
    { title: "تم الاعتماد والتجهيز", desc: "تم فحص وتغليف الكتب بعناية فائقة", time: "تم التأكيد" },
    { title: "قيد الشحن والتوصيل", desc: order?.trackingCarrier ? `تم التسليم لـ (${order.trackingCarrier}) وبوليصة رقم ${order.trackingNumber || ''}` : "الشحنة مع مندوب التوصيل", time: "في الطريق" },
    { title: "تم التسليم بنجاح", desc: "تم استلام الشحنة وإتمام العملية بنجاح", time: "مكتمل" }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans">
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-500">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">تتبع الشحنة والطلبات | هواري ستور</h3>
              <p className="text-xs text-slate-400">تتبع مباشر لحالة الشحن والتوصيل لكافة المحافظات</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsTrackingModalOpen(false);
              setActiveTrackingOrder(null);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Order Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="اكتب رقم الطلب (مثال: HW-594832) أو رقم البوليصة..."
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shrink-0"
            >
              بحث
            </button>
          </form>

          {searchError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {order ? (
            <div className="space-y-6">
              
              {/* Order Quick Overview Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 text-base">#{order.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'approved' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {order.status === 'delivered' ? 'تم التسليم' :
                       order.status === 'in_transit' ? 'جاري الشحن والتوصيل' :
                       order.status === 'approved' ? 'تم الاعتماد والتجهيز' : 'قيد المراجعة'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>التوصيل إلى: {order.customerName} - {order.governorate} ({order.address})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => {
                      setActiveInvoiceOrder(order);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="px-3 py-2 bg-white border border-slate-200 hover:border-orange-500 text-slate-700 hover:text-orange-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-orange-600" />
                    <span>عرض الفاتورة</span>
                  </button>
                </div>
              </div>

              {/* Carrier Tracking Banner (if available) */}
              {order.trackingNumber && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-orange-600" />
                      <span>بيانات شركة الشحن: {order.trackingCarrier || 'مندوب متجر هواري ستور'}</span>
                    </div>
                    <div className="text-xs text-orange-800 mt-0.5">
                      رقم البوليصة / التتبع: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-orange-300">{order.trackingNumber}</span>
                    </div>
                  </div>

                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>تتبع الشحنة المباشر</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Progress Timeline */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs mb-6 border-r-2 border-orange-500 pr-2">
                  مراحل معالجة وشحن الطلب
                </h4>

                <div className="relative pr-6 space-y-8 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {steps.map((step, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;

                    return (
                      <div key={idx} className="relative flex items-start justify-between gap-4">
                        {/* Step Marker */}
                        <div className={`absolute -right-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone 
                            ? 'bg-orange-600 border-orange-600 text-white' 
                            : 'bg-white border-slate-300 text-transparent'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                        </div>

                        {/* Step Details */}
                        <div className="space-y-0.5">
                          <div className={`text-xs font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.title} {isCurrent && <span className="mr-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-normal">المرحلة الحالية</span>}
                          </div>
                          <div className="text-[11px] text-slate-500">{step.desc}</div>
                        </div>

                        {/* Step Time / Badge */}
                        <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {step.time}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in this Order */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700">محتويات الشحنة:</div>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200/80">
                      <img src={item.coverImage} alt={item.title} className="w-10 h-14 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.author}</div>
                        <div className="text-[10px] text-orange-600 font-bold mt-0.5">
                          {item.format === 'physical' ? 'نسخة ورقية مطبوعة' : 'نسخة رقمية PDF'} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help contact */}
              <div className="text-center pt-2">
                <a
                  href={`https://wa.me/${(settings.whatsappNumber || '+201001332899').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن شحنة الطلب رقم ${order.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تواصل مع مندوب خدمة العملاء عبر واتساب</span>
                </a>
              </div>

            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">أدخل رقم الطلب لعرض تفاصيل الشحن والتوصيل</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                يمكنك العثور على رقم الطلب في رسالة التأكيد أو الفاتورة المرسلة إليك.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
