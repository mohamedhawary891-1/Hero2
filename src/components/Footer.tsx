import React from 'react';
import { 
  Headphones, 
  RotateCcw, 
  ShieldCheck, 
  Truck, 
  Phone, 
  MessageCircle, 
  CheckCircle2,
  PackageSearch
} from 'lucide-react';
import { HawariLogo } from './HawariLogo';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings, setIsAdminOpen, setIsLibraryOpen, isAdmin } = useStore();

  return (
    <footer className="mt-16 bg-white border-t border-slate-200 font-sans">
      
      {/* 1. FOUR VALUE PROPOSITIONS BAR */}
      <div className="border-b border-slate-100 py-6 px-4 sm:px-8 bg-slate-50/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Box 1: Customer Support */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">دعم العملاء</h4>
              <p className="text-xs text-slate-500 mt-0.5">خدمة عملاء على مدار الساعة</p>
            </div>
          </div>

          {/* Box 2: Easy Return */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">استرجاع سهل</h4>
              <p className="text-xs text-slate-500 mt-0.5">استرجاع للكتب الورقية خلال 14 يوم</p>
            </div>
          </div>

          {/* Box 3: Secure Payment */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">دفع ومعاملات آمنة</h4>
              <p className="text-xs text-slate-500 mt-0.5">فودافون كاش، إنستاباي، ودفع عند الاستلام</p>
            </div>
          </div>

          {/* Box 4: Fast Delivery */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">شحن لكافة المحافظات</h4>
              <p className="text-xs text-slate-500 mt-0.5">توصيل سريع لجميع محافظات مصر الـ 27</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Brand Info & Official Emblem */}
          <div className="space-y-4">
            <HawariLogo variant="horizontal" size="md" />
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              {settings.tagline || "متجر هواري ستور المتخصص في بيع وشحن الكتب الورقية وتوفير النسخ الرقمية المشفرة مع قارئ محمي."}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl border border-emerald-200 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>متجر موثق ومعتمد</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-r-2 border-orange-500 pr-2">روابط سريعة</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-orange-600 transition">
                  الصفحة الرئيسية
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const el = document.getElementById('bestsellers-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-orange-600 transition"
                >
                  الكتب الأكثر مبيعاً
                </button>
              </li>
              <li>
                <button onClick={() => setIsLibraryOpen(true)} className="hover:text-orange-600 transition">
                  مكتبتي الرقمية
                </button>
              </li>
              {isAdmin && (
                <li>
                  <button onClick={() => setIsAdminOpen(true)} className="text-orange-600 font-bold hover:underline transition flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>لوحة تحكم الإدارة</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: WhatsApp Customer Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm border-r-2 border-orange-500 pr-2">خدمة العملاء والمساعدة</h4>
            <div className="space-y-3 text-xs">
              <p className="text-slate-500 leading-relaxed">
                فريق خدمة عملاء هواري ستور جاهز للرد على استفساراتكم ومتابعة شحناتكم وطلباتكم مباشرة عبر الواتساب.
              </p>

              <a 
                href={`https://wa.me/${(settings.whatsappNumber || '+201001332899').replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>محادثة فورية عبر واتساب ({settings.whatsappNumber || "+201001332899"})</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payments */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} <span className="font-bold text-slate-800">{settings.storeName || "متجر هواري (Hawari Store)"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px]">
              فودافون كاش
            </span>
            <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px]">
              InstaPay إنستاباي
            </span>
            <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px]">
              الدفع عند الاستلام
            </span>
          </div>
        </div>

      </div>

    </footer>
  );
};
