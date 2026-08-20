import React, { useState } from 'react';
import { MessageCircle, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();
  const [showAttentionBubble, setShowAttentionBubble] = useState(true);

  const phone = (settings.whatsappNumber || '01001332899').replace(/[^0-9]/g, '');
  const cleanPhone = phone.startsWith('2') ? phone : `20${phone.replace(/^0+/, '')}`;
  const message = 'مرحباً، أود الاستفسار بخصوص طلب الكتب في متجر هواري.';

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none select-none">
      
      {/* Floating Attention Speech Bubble (Tooltip) */}
      <AnimatePresence>
        {showAttentionBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto relative bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-500/40 text-xs font-bold flex items-center gap-2 max-w-[240px] animate-float-gentle group"
          >
            {/* Pulsing Green Online Status Dot */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>

            <div className="flex-1 text-[11px] leading-tight">
              <span className="text-emerald-400 block font-black">خدمة العملاء متصلة ⚡</span>
              <span className="text-slate-300">مساعدة سريعة أو استفسار؟</span>
            </div>

            {/* Close tooltip button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAttentionBubble(false);
              }}
              className="text-slate-500 hover:text-slate-300 p-0.5 rounded-full transition"
              title="إغلاق"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Speech Bubble Arrow */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 border-b border-r border-emerald-500/40 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Animated WhatsApp Button */}
      <div className="relative pointer-events-auto animate-float-subtle">
        
        {/* Animated Radar Pulse Rings */}
        <div className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-pulse-ring pointer-events-none" />
        <div className="absolute -inset-2.5 rounded-full bg-emerald-500/15 animate-pulse-ring delay-700 pointer-events-none" />

        <motion.a
          id="floating-whatsapp-btn"
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل معنا عبر واتساب"
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.94 }}
          className="relative flex items-center gap-2.5 px-4 sm:px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.45)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.6)] transition-all duration-200 group border-2 border-white/30 backdrop-blur-sm"
        >
          {/* WhatsApp Icon with gentle bounce */}
          <div className="relative">
            <MessageCircle className="w-6 h-6 fill-white text-emerald-600 transition-transform duration-300 group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full" />
          </div>

          <div className="flex flex-col text-right">
            <span className="font-black text-xs hidden sm:inline-block leading-tight text-white tracking-wide">
              تواصل عبر واتساب
            </span>
            <span className="font-mono text-[10px] text-emerald-100 hidden md:inline-block font-bold" dir="ltr">
              01001332899
            </span>
          </div>

          {/* Sparkle Icon */}
          <Sparkles className="w-3.5 h-3.5 text-emerald-200 hidden sm:inline-block animate-pulse" />
        </motion.a>
      </div>
    </div>
  );
};
