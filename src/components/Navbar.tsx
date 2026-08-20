import React, { useState } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  ShieldCheck, 
  BookOpen, 
  ChevronDown, 
  Phone, 
  HelpCircle, 
  Truck, 
  Tag, 
  Menu, 
  X,
  LogOut,
  Flame,
  Bell,
  PackageSearch
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HawariLogo } from './HawariLogo';

export const Navbar: React.FC = () => {
  const { 
    cart,
    setIsCartOpen, 
    setIsAuthOpen, 
    setIsAdminOpen, 
    setIsLibraryOpen, 
    setIsTrackingModalOpen,
    setIsNotificationDrawerOpen,
    notifications,
    currentUser, 
    logoutUser,
    searchQuery, 
    setSearchQuery,
    selectedCategory, 
    setSelectedCategory,
    settings,
    isAdmin
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'categories' | 'offers' | 'bestsellers' | 'new' | 'about'>('home');

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Unread notifications for this user or all
  const unreadNotifsCount = notifications.filter(n => {
    if (n.read) return false;
    if (n.target === 'all') return true;
    if (currentUser && (n.targetUserId === currentUser.uid || n.targetUserEmail?.toLowerCase() === currentUser.email.toLowerCase())) {
      return true;
    }
    return false;
  }).length;

  const handleNavClick = (section: typeof activeNav, categoryFilter?: string) => {
    setActiveNav(section);
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    }
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
  };

  const categories = settings.categories || ["الكل", "روايات", "إدارة وأعمال", "تنمية بشرية", "تاريخ", "دينية", "أطفال", "علوم", "فلسفة", "تقنية"];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-100 font-sans">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      {settings.announcementEnabled !== false && (
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white text-xs font-bold py-1.5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Right Side: Fast Delivery & Custom Announcement */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-orange-200" />
                <span>توصيل سريع لجميع المحافظات الـ 27</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-orange-100">
                <span>•</span>
                <Tag className="w-3.5 h-3.5 text-amber-300" />
                <span>{settings.announcementText || "خصومات حصرية على باقات الكتب"}</span>
              </div>
            </div>

            {/* Left Side: Order Tracking, WhatsApp Help */}
            <div className="flex items-center gap-3 sm:gap-5 text-[11px] text-orange-100">
              <button 
                onClick={() => setIsTrackingModalOpen(true)} 
                className="hover:text-white transition flex items-center gap-1 font-bold text-amber-200"
              >
                <PackageSearch className="w-3.5 h-3.5" />
                <span>تتبع الشحنة</span>
              </button>
              <span>|</span>
              <a 
                href={`https://wa.me/${(settings.whatsappNumber || '+201001332899').replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>خدمة العملاء: {settings.contactPhone || "01001332899"}</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* 2. MAIN HEADER (Logo, Search with Dropdown, Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <HawariLogo variant="horizontal" size="md" />
        </div>

        {/* Central Search Bar with Categories Select */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-6 items-center">
          <div className="w-full flex items-center bg-slate-50 border border-slate-300 rounded-2xl overflow-hidden shadow-inner focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition">
            
            {/* Category Dropdown inside Search */}
            <div className="relative border-l border-slate-200 bg-slate-100/80">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-transparent py-2.5 pr-3 pl-8 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="الكل">جميع الأقسام</option>
                {categories.filter(c => c !== 'الكل').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم كتاب، مؤلف، أو موضوع..."
              className="flex-1 px-4 py-2.5 text-xs text-slate-900 bg-transparent focus:outline-none placeholder-slate-400"
            />

            {/* Search Orange Button */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-orange-600 hover:bg-orange-500 text-white p-3 transition flex items-center justify-center shrink-0"
              title="بحث"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Actions Bar (Notifications, Tracking, Account, Cart) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="p-2.5 rounded-xl text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition relative"
            title="الإشعارات والتنبيهات"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Quick Shipment Tracking */}
          <button
            onClick={() => setIsTrackingModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition text-xs font-bold"
            title="تتبع شحنتك"
          >
            <Truck className="w-4 h-4 text-slate-500 hover:text-orange-600" />
            <span>تتبع شحنتي</span>
          </button>

          {/* User Account Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold hover:bg-orange-100 transition"
              >
                <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="max-w-[85px] truncate">{currentUser.name}</span>
                {isAdmin && (
                  <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                    مدير
                  </span>
                )}
              </button>

              {/* Secure Admin Dashboard Link ONLY if authorized admin */}
              {isAdmin && (
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-orange-600 text-amber-400 hover:text-white transition shadow-sm"
                  title="فتح لوحة تحكم الإدارة"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition text-xs font-bold border border-slate-200"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>تسجيل الدخول</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-orange-600 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm relative group hover:scale-[1.02] active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-orange-400 group-hover:rotate-6 transition-transform" />
            <span className="hidden sm:inline">السلة</span>
            {cartTotalItems > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center -mr-1 animate-bounce shadow-sm">
                {cartTotalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* 3. NAVIGATION LINKS ROW */}
      <div className="hidden md:block border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          
          <nav className="flex items-center gap-1 sm:gap-2 text-xs font-bold text-slate-700">
            
            {/* الرئيسية */}
            <button
              onClick={() => handleNavClick('home', 'الكل')}
              className={`py-3 px-3.5 transition flex items-center gap-1 relative ${
                activeNav === 'home' && selectedCategory === 'الكل'
                  ? 'text-orange-600 border-b-2 border-orange-600 font-black' 
                  : 'hover:text-orange-600'
              }`}
            >
              <span>الرئيسية</span>
            </button>

            {/* الأقسام Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="py-3 px-3.5 hover:text-orange-600 transition flex items-center gap-1"
              >
                <span>الأقسام</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600" />
              </button>

              <div className="hidden group-hover:block absolute top-full right-0 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 z-50">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleNavClick('categories', cat)}
                    className={`w-full text-right px-3 py-2 text-xs rounded-xl transition ${
                      selectedCategory === cat ? 'bg-orange-50 text-orange-600 font-black' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* العروض */}
            <button
              onClick={() => handleNavClick('offers', 'الكل')}
              className="py-3 px-3.5 hover:text-orange-600 transition flex items-center gap-1"
            >
              <span>العروض والتخفيضات</span>
              <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                خصم 30%
              </span>
            </button>

            {/* الأكثر مبيعاً */}
            <button
              onClick={() => {
                setActiveNav('bestsellers');
                const el = document.getElementById('bestsellers-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-3 px-3.5 hover:text-orange-600 transition flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>الأكثر مبيعاً</span>
            </button>

            {/* جديد الكتب */}
            <button
              onClick={() => handleNavClick('new', 'الكل')}
              className="py-3 px-3.5 hover:text-orange-600 transition"
            >
              <span>جديد الكتب</span>
            </button>

          </nav>

          {/* Left Action Buttons: My Library & Admin Panel */}
          <div className="flex items-center gap-2">
            
            {/* My Digital Library */}
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-orange-600 py-1.5 px-3 rounded-xl hover:bg-orange-50 transition font-bold border border-slate-200/60"
            >
              <BookOpen className="w-4 h-4 text-orange-600" />
              <span>مكتبتي الرقمية</span>
            </button>

            {/* Admin Dashboard: ONLY VISIBLE IF ADMIN */}
            {isAdmin && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-orange-600 text-amber-400 hover:text-white py-1.5 px-3 rounded-xl transition font-bold shadow-sm"
                title="لوحة تحكم الإدارة"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>لوحة الإدارة</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* 4. MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 p-4 space-y-3 shadow-lg">
          
          {/* Mobile Search */}
          <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن كتاب أو مؤلف..."
              className="flex-1 px-3 py-2 text-xs bg-transparent focus:outline-none"
            />
            <button 
              onClick={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
                setIsMobileMenuOpen(false);
              }}
              className="bg-orange-600 text-white p-2.5"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button 
              onClick={() => handleNavClick('home', 'الكل')} 
              className="p-2.5 rounded-xl bg-orange-50 text-orange-700 text-right"
            >
              الرئيسية
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                const el = document.getElementById('bestsellers-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="p-2.5 rounded-xl bg-slate-50 text-slate-700 text-right"
            >
              الأكثر مبيعاً
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsTrackingModalOpen(true);
              }} 
              className="p-2.5 rounded-xl bg-slate-50 text-slate-700 text-right flex items-center justify-between"
            >
              <span>تتبع الشحنة</span>
              <Truck className="w-3.5 h-3.5 text-orange-600" />
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLibraryOpen(true);
              }} 
              className="p-2.5 rounded-xl bg-slate-50 text-slate-700 text-right flex items-center justify-between"
            >
              <span>مكتبتي الرقمية</span>
              <BookOpen className="w-3.5 h-3.5 text-orange-600" />
            </button>
          </div>

        </div>
      )}

    </header>
  );
};
