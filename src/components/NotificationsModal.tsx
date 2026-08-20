import React from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Sparkles, 
  Tag, 
  Package, 
  AlertCircle,
  BookOpen,
  Calendar
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SiteNotification } from '../types';

export const NotificationsModal: React.FC = () => {
  const { 
    isNotificationDrawerOpen, 
    setIsNotificationDrawerOpen, 
    notifications, 
    markNotificationAsRead,
    currentUser,
    setIsLibraryOpen
  } = useStore();

  if (!isNotificationDrawerOpen) return null;

  // Filter notifications relevant to current user: all target OR specific to this user email/uid
  const userNotifications = notifications.filter(n => {
    if (n.target === 'all') return true;
    if (currentUser && (n.targetUserId === currentUser.uid || n.targetUserEmail?.toLowerCase() === currentUser.email.toLowerCase())) {
      return true;
    }
    return false;
  });

  const getIcon = (type: SiteNotification['type']) => {
    switch (type) {
      case 'promo': return <Tag className="w-4 h-4 text-amber-500" />;
      case 'order': return <Package className="w-4 h-4 text-blue-500" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return <Sparkles className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans">
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-500 border border-orange-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">مركز الإشعارات والتنبيهات</h3>
              <p className="text-[11px] text-slate-400">آخر المستجدات وتأكيدات الطلبات والعروض</p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationDrawerOpen(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 max-h-[480px] overflow-y-auto space-y-3">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">لا توجد إشعارات جديدة حالياً.</p>
            </div>
          ) : (
            userNotifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markNotificationAsRead(notif.id);
                  if (notif.type === 'order') {
                    setIsNotificationDrawerOpen(false);
                    setIsLibraryOpen(true);
                  }
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                  notif.read 
                    ? 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/60' 
                    : 'bg-orange-50/30 border-orange-200 hover:bg-orange-50/50'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-4 left-4 w-2 h-2 rounded-full bg-orange-600" />
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80 shrink-0 shadow-xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{notif.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notif.type === 'order' && (
                        <span className="text-orange-600 font-bold flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>فتح مكتبتي الرقمية</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>يتم تحديث الإشعارات تلقائياً</span>
          <button
            onClick={() => {
              userNotifications.forEach(n => markNotificationAsRead(n.id));
            }}
            className="text-orange-600 font-bold hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>تحديد الكل كمقروء</span>
          </button>
        </div>

      </div>

    </div>
  );
};
