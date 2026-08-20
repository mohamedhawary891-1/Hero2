import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { EGYPT_GOVERNORATES_LIST } from '../utils/shippingEngine';
import { HawariLogo } from './HawariLogo';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, currentUser, loginUser, registerUser, logoutUser } = useStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGovernorate, setRegGovernorate] = useState('القاهرة');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  if (!isAuthOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const result = await loginUser(loginEmail, loginPassword);
      if (result.success) {
        setIsAuthOpen(false);
      } else {
        setLoginError(result.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    // Validations
    if (!regName.trim() || regName.trim().length < 3) {
      setRegError('يرجى كتابة الاسم الثلاثي كاملاً');
      return;
    }

    if (!regPhone.trim() || !/^01[0125][0-9]{8}$/.test(regPhone.replace(/\s+/g, ''))) {
      setRegError('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('يرجى إدخال بريد إلكتروني صالح');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');
      return;
    }

    if (!regAddress.trim()) {
      setRegError('يرجى كتابة العنوان التفصيلي للشحن');
      return;
    }

    setRegLoading(true);

    try {
      const res = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        governorate: regGovernorate,
        address: regAddress.trim(),
        password: regPassword,
      });

      if (res.success) {
        setRegSuccess('تم إنشاء الحساب بنجاح! سيتم ملء بياناتك تلقائياً عند الشراء.');
        setTimeout(() => {
          setIsAuthOpen(false);
        }, 1200);
      } else {
        setRegError(res.error || 'فشل إنشاء الحساب، قد يكون البريد مسجلاً مسبقاً.');
      }
    } catch (err: any) {
      setRegError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-6 text-white text-right relative shrink-0">
          <button
            onClick={() => setIsAuthOpen(false)}
            className="absolute left-4 top-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black">
                {currentUser ? 'الملف الشخصي والحساب' : 'بوابة حسابات هواري ستور'}
              </h2>
              <p className="text-xs text-orange-100 mt-0.5">
                تأمين حسابك والوصول لمكتبتك الرقمية وتتبع الطلبات
              </p>
            </div>
          </div>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                {currentUser.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{currentUser.name}</h3>
                  {currentUser.role === 'admin' && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-md">
                      مدير النظام (Admin)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
                <p className="text-xs text-slate-600">{currentUser.phone} • {currentUser.governorate}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-2">معلومات الشحن المحفوظة تلقائياً:</div>
              <div><span className="text-slate-500">المحافظة:</span> {currentUser.governorate}</div>
              <div><span className="text-slate-500">العنوان التفصيلي:</span> {currentUser.address || 'لم يحدد'}</div>
              <div><span className="text-slate-500">تاريخ الانضمام:</span> {currentUser.createdAt || '2026-02-18'}</div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  logoutUser();
                  setIsAuthOpen(false);
                }}
                className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 border border-rose-200"
              >
                <LogIn className="w-4 h-4 rotate-180" />
                <span>تسجيل الخروج</span>
              </button>
              <button
                onClick={() => setIsAuthOpen(false)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition text-xs"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Tabs (تسجيل الدخول / إنشاء حساب جديد) */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setTab('login'); setLoginError(''); setRegError(''); }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  tab === 'login' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>

              <button
                type="button"
                onClick={() => { setTab('register'); setLoginError(''); setRegError(''); }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  tab === 'register' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>إنشاء حساب جديد</span>
              </button>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {tab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
                      dir="ltr"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
                      dir="ltr"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <span>جاري التحقق والاتصال...</span>
                  ) : (
                    <>
                      <span>دخول الحساب</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: REGISTRATION FORM */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {regError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    الاسم بالكامل (الثلاثي) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="محمد علي الهواري"
                      className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Phone & Governorate (2 Cols) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      رقم الهاتف (واتساب) *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="01012345678"
                        className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
                        dir="ltr"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      المحافظة *
                    </label>
                    <div className="relative">
                      <select
                        value={regGovernorate}
                        onChange={(e) => setRegGovernorate(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition appearance-none cursor-pointer"
                      >
                        {EGYPT_GOVERNORATES_LIST.map((gov) => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                      <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
                      dir="ltr"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    العنوان التفصيلي للشحن *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="الشارع، رقم العمارة، الشقة، علامة مميزة"
                      className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="6 أحرف أو أرقام على الأقل"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-orange-500 focus:outline-none transition"
                      dir="ltr"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
                  >
                    {regLoading ? (
                      <span>جاري إنشاء الحساب والتأمين...</span>
                    ) : (
                      <>
                        <span>إنشاء الحساب وحفظ البيانات</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
