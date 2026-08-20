import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  CreditCard,
  Package
} from 'lucide-react';
import { HawariLogo } from './HawariLogo';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

export const InvoiceModal: React.FC = () => {
  const { isInvoiceModalOpen, setIsInvoiceModalOpen, activeInvoiceOrder, settings } = useStore();

  if (!isInvoiceModalOpen || !activeInvoiceOrder) return null;

  const order = activeInvoiceOrder;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans">
      
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        
        {/* Action Header (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-sm">فاتورة شراء معتمدة | {settings.storeName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة</span>
            </button>
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE BODY */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-800 bg-white" id="printable-invoice">
          
          {/* Header Brand + Meta */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <HawariLogo variant="horizontal" size="md" />
              <p className="text-xs text-slate-500 mt-1">
                المنصة المعتمدة لتجارة الكتب الورقية والرقمية المشفرة
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                السجل التجاري والضريبي: 78942-HW-EG
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left sm:text-right space-y-1 min-w-[200px]">
              <div className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                فاتورة ضريبية رسمية
              </div>
              <div className="font-mono font-black text-slate-900 text-base">
                {order.invoiceNumber || `INV-${order.id}`}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                رقم الطلب: #{order.id}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div className="space-y-1.5">
              <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs text-orange-600">
                <User className="w-3.5 h-3.5" />
                بيانات العميل والمستلم:
              </span>
              <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
              <div className="text-slate-600 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span dir="ltr">{order.customerPhone}</span>
              </div>
              <div className="text-slate-600">{order.customerEmail}</div>
            </div>

            <div className="space-y-1.5">
              {order.items.some(i => i.format === 'physical') ? (
                <>
                  <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs text-orange-600">
                    <MapPin className="w-3.5 h-3.5" />
                    عنوان الشحن والتوصيل:
                  </span>
                  <div className="font-bold text-slate-900">محافظة {order.governorate}</div>
                  <div className="text-slate-600">{order.address || 'العنوان الرئيسي'}</div>
                </>
              ) : (
                <>
                  <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    طريقة التسليم:
                  </span>
                  <div className="font-bold text-slate-900">تسليم رقمي فوري ومحمي</div>
                  <div className="text-slate-600">متاحة في تبويب (مكتبتي الرقمية) مع قارئ ذكي</div>
                </>
              )}
              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CreditCard className="w-3 h-3" />
                <span>
                  طريقة الدفع:{' '}
                  {order.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : order.paymentMethod === 'instapay' ? 'تطبيق InstaPay' : 'الدفع عند الاستلام'}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">اسم الكتاب والمؤلف</th>
                  <th className="p-3 text-center">النوع</th>
                  <th className="p-3 text-center">الكمية</th>
                  <th className="p-3 text-left">سعر الوحدة</th>
                  <th className="p-3 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.author}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.format === 'physical' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.format === 'physical' ? 'ورقي مطبوع' : 'رقمي مشفر PDF'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold font-mono">{item.quantity}</td>
                    <td className="p-3 text-left font-mono">{item.unitPrice} ج.م</td>
                    <td className="p-3 text-left font-mono font-bold text-slate-900">{item.totalPrice} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Calculations */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            
            {/* Seal & Status */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-orange-500/50 flex flex-col items-center justify-center text-center p-1 text-[9px] font-black text-orange-600 rotate-[-8deg] bg-orange-50/50">
                <span>HAWARI</span>
                <span>معتمد</span>
                <span>OFFICIAL</span>
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>حالة الطلب: {order.status === 'delivered' ? 'تم التسليم' : order.status === 'in_transit' ? 'جاري الشحن' : order.status === 'approved' ? 'تم الاعتماد' : 'قيد المراجعة'}</span>
                </div>
                {order.trackingNumber && (
                  <div className="text-[11px] text-slate-600">
                    رقم بوليصة الشحن: <span className="font-mono font-bold text-slate-900">{order.trackingNumber}</span> ({order.trackingCarrier || 'مندوب هواري'})
                  </div>
                )}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>سعر الكتب مجمعة:</span>
                <span className="font-mono font-bold">{order.booksSubtotal} ج.م</span>
              </div>
              {order.shippingCost > 0 && order.items.some(i => i.format === 'physical') && (
                <div className="flex justify-between text-slate-600">
                  <span>سعر الشحن ({order.governorate}):</span>
                  <span className="font-mono font-bold">{order.shippingCost} ج.م</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>الإجمالي المستحق:</span>
                <span className="font-mono text-orange-600 text-base">{order.totalAmount} ج.م</span>
              </div>
            </div>

          </div>

          {/* Footer Notice */}
          <div className="border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400 space-y-1">
            <p>شكراً لتعاملك مع متجر هواري ستور. الكتب الرقمية متاحة فور اعتماد الطلب من خلال تبويب (مكتبتي الرقمية).</p>
            <p>لأي استفسار بخصوص هذه الفاتورة أو الشحنة، تواصل معنا عبر الواتساب: {settings.whatsappNumber || '+201001332899'}</p>
          </div>

        </div>

      </div>

    </div>
  );
};
