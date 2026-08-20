import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  BookOpen, 
  Trash2, 
  Edit3, 
  Ban, 
  CheckCircle2, 
  Send, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  X, 
  Save, 
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Lock,
  Unlock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserProfile, Book } from '../../types';
import { EGYPT_GOVERNORATES_LIST } from '../../utils/shippingEngine';

export const AdminCustomersTab: React.FC = () => {
  const { 
    allUsers, 
    books, 
    orders,
    updateUser, 
    deleteUser, 
    addUser, 
    grantBookAccessToUser, 
    revokeBookAccessFromUser, 
    toggleUserBlock,
    sendNotification,
    currentUser
  } = useStore();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin' | 'blocked'>('all');

  // Modal States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isLibraryManageOpen, setIsLibraryManageOpen] = useState(false);
  const [isSendDirectNotifOpen, setIsSendDirectNotifOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Add/Edit Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGovernorate, setFormGovernorate] = useState(EGYPT_GOVERNORATES_LIST[0]);
  const [formAddress, setFormAddress] = useState('');
  const [formRole, setFormRole] = useState<'customer' | 'admin'>('customer');
  const [formNotes, setFormNotes] = useState('');

  // Notification Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'general' | 'promo' | 'order' | 'alert'>('general');

  // Filter users
  const filteredUsers = allUsers.filter(user => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.includes(term) ||
      user.governorate.toLowerCase().includes(term);

    let matchesRole = true;
    if (roleFilter === 'customer') matchesRole = user.role === 'customer' && !user.isBlocked;
    if (roleFilter === 'admin') matchesRole = user.role === 'admin';
    if (roleFilter === 'blocked') matchesRole = !!user.isBlocked;

    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const totalUsersCount = allUsers.length;
  const adminUsersCount = allUsers.filter(u => u.role === 'admin').length;
  const activeCustomersCount = allUsers.filter(u => u.role === 'customer' && !u.isBlocked).length;
  const blockedUsersCount = allUsers.filter(u => u.isBlocked).length;
  const totalDigitalLicensesGranted = allUsers.reduce((sum, u) => sum + (u.purchasedBooks?.length || 0), 0);

  // Handlers
  const handleOpenAddUser = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormGovernorate(EGYPT_GOVERNORATES_LIST[0]);
    setFormAddress('');
    setFormRole('customer');
    setFormNotes('');
    setIsAddUserOpen(true);
  };

  const handleSaveAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    addUser({
      name: formName,
      email: formEmail,
      phone: formPhone,
      governorate: formGovernorate,
      address: formAddress,
      role: formRole,
      purchasedBooks: [],
      isBlocked: false,
      notes: formNotes
    });

    setIsAddUserOpen(false);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormGovernorate(user.governorate || EGYPT_GOVERNORATES_LIST[0]);
    setFormAddress(user.address || '');
    setFormRole(user.role);
    setFormNotes(user.notes || '');
    setIsEditUserOpen(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    updateUser(selectedUser.uid, {
      name: formName,
      email: formEmail,
      phone: formPhone,
      governorate: formGovernorate,
      address: formAddress,
      role: formRole,
      notes: formNotes
    });

    setIsEditUserOpen(false);
    setSelectedUser(null);
  };

  const handleOpenLibraryManage = (user: UserProfile) => {
    setSelectedUser(user);
    setIsLibraryManageOpen(true);
  };

  const handleOpenSendNotif = (user: UserProfile) => {
    setSelectedUser(user);
    setNotifTitle(`تنبيه خاص لـ ${user.name}`);
    setNotifMessage('');
    setNotifType('general');
    setIsSendDirectNotifOpen(true);
  };

  const handleSendDirectNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !notifTitle || !notifMessage) return;

    sendNotification({
      title: notifTitle,
      message: notifMessage,
      type: notifType,
      target: 'user',
      targetUserId: selectedUser.uid,
      targetUserEmail: selectedUser.email
    });

    setIsSendDirectNotifOpen(false);
    setSelectedUser(null);
  };

  const getUserOrdersCount = (user: UserProfile) => {
    return orders.filter(o => o.customerEmail.toLowerCase() === user.email.toLowerCase() || o.userId === user.uid).length;
  };

  const getUserTotalSpend = (user: UserProfile) => {
    return orders
      .filter(o => o.customerEmail.toLowerCase() === user.email.toLowerCase() || o.userId === user.uid)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Stats */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-600" />
              <span>إدارة حسابات العملاء والمشرفين والصلاحيات</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              تحكم كلي في حسابات المستخدمين، تفعيل القراءة للكتب الرقمية يدوياً، تعديل رتب المشرفين، وحظر أو حذف الحسابات
            </p>
          </div>

          <button
            onClick={handleOpenAddUser}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عميل / مشرف جديد</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="text-slate-500 text-xs font-medium">إجمالي الحسابات المسجلة</div>
            <div className="text-2xl font-black text-slate-900">{totalUsersCount}</div>
            <div className="text-[10px] text-slate-400">قاعدة بيانات المتجر</div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200/80 space-y-1">
            <div className="text-emerald-700 text-xs font-medium">العملاء النشطون</div>
            <div className="text-2xl font-black text-emerald-900">{activeCustomersCount}</div>
            <div className="text-[10px] text-emerald-600">حسابات نشطة ومفعلة</div>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 space-y-1">
            <div className="text-amber-700 text-xs font-medium">المشرفون والمدراء</div>
            <div className="text-2xl font-black text-amber-900">{adminUsersCount}</div>
            <div className="text-[10px] text-amber-600">صلاحيات تحكم كاملة</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200/80 space-y-1">
            <div className="text-purple-700 text-xs font-medium">تراخيص القراءة الرقمية</div>
            <div className="text-2xl font-black text-purple-900">{totalDigitalLicensesGranted}</div>
            <div className="text-[10px] text-purple-600">كتاب رقمي مفعل للعملاء</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، البريد، الهاتف، المحافظة..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-hidden focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              roleFilter === 'all' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            الكل ({allUsers.length})
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              roleFilter === 'customer' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            العملاء ({activeCustomersCount})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              roleFilter === 'admin' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            المدراء ({adminUsersCount})
          </button>
          <button
            onClick={() => setRoleFilter('blocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              roleFilter === 'blocked' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            المحظورون ({blockedUsersCount})
          </button>
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">لا توجد حسابات تطابق معايير البحث</div>
            <p className="text-xs text-slate-400">جرب كتابة بريد أو اسم آخر أو إعادة ضبط الفلتر.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="p-4">بيانات العميل</th>
                  <th className="p-4">بيانات التواصل والمدينة</th>
                  <th className="p-4">الصلاحية والحالة</th>
                  <th className="p-4">الطلبات والمشتريات</th>
                  <th className="p-4">المكتبة الرقمية</th>
                  <th className="p-4 text-center">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((user) => {
                  const userOrdersCount = getUserOrdersCount(user);
                  const userSpend = getUserTotalSpend(user);
                  const purchasedCount = user.purchasedBooks?.length || 0;
                  const isCurrent = currentUser?.uid === user.uid;

                  return (
                    <tr key={user.uid} className={`hover:bg-slate-50/80 transition ${user.isBlocked ? 'bg-rose-50/30' : ''}`}>
                      
                      {/* Name & ID */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                            user.role === 'admin' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : user.isBlocked
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {user.name.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-sm">حسابك</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{user.email}</div>
                            {user.notes && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-xs">{user.notes}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone || 'غير مسجل'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{user.governorate || 'غير محددة'}</span>
                        </div>
                      </td>

                      {/* Role & Status Badge */}
                      <td className="p-4 space-y-1.5">
                        <div>
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] border border-amber-200">
                              <ShieldCheck className="w-3 h-3 text-amber-600" />
                              <span>مشرف متجر (Admin)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                              <span>عميل عادي</span>
                            </span>
                          )}
                        </div>

                        <div>
                          {user.isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                              <Ban className="w-2.5 h-2.5" />
                              <span>محظور</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>نشط</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Orders & Spending */}
                      <td className="p-4 space-y-0.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-orange-600" />
                          <span>{userOrdersCount} طلبات</span>
                        </div>
                        <div className="text-[11px] font-bold text-emerald-700">
                          {userSpend.toLocaleString()} ج.م إجمالي
                        </div>
                      </td>

                      {/* Digital Library License */}
                      <td className="p-4">
                        <button
                          onClick={() => handleOpenLibraryManage(user)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                          title="عرض وتعديل الكتب الرقمية المفعلة لهذا العميل"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                          <span>{purchasedCount} كتب مفعلة</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          
                          {/* Send targeted notification */}
                          <button
                            onClick={() => handleOpenSendNotif(user)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 transition"
                            title="إرسال إشعار خاص للعميل"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit User Profile */}
                          <button
                            onClick={() => handleOpenEditUser(user)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            title="تعديل بيانات العميل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Role */}
                          <button
                            onClick={() => {
                              const newRole = user.role === 'admin' ? 'customer' : 'admin';
                              updateUser(user.uid, { role: newRole });
                            }}
                            className={`p-1.5 rounded-lg transition ${
                              user.role === 'admin'
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                            title={user.role === 'admin' ? 'تحويل إلى عميل عادي' : 'ترقية إلى مشرف'}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Block */}
                          <button
                            onClick={() => toggleUserBlock(user.uid)}
                            className={`p-1.5 rounded-lg transition ${
                              user.isBlocked
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700'
                            }`}
                            title={user.isBlocked ? 'إلغاء الحظر' : 'حظر الحساب'}
                          >
                            {user.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete User */}
                          {!isCurrent && (
                            <button
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من رغبتك في حذف حساب "${user.name}" نهائياً؟`)) {
                                  deleteUser(user.uid);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition"
                              title="حذف الحساب"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-600" />
                <span>إضافة عميل أو مشرف جديد</span>
              </h3>
              <button onClick={() => setIsAddUserOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: محمود علي عبد الله"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">المحافظة</label>
                  <select
                    value={formGovernorate}
                    onChange={(e) => setFormGovernorate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500 bg-white"
                  >
                    {EGYPT_GOVERNORATES_LIST.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الصلاحية</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as 'customer' | 'admin')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500 bg-white font-bold"
                  >
                    <option value="customer">عميل عادي (Customer)</option>
                    <option value="admin">مشرف متجر (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="الشارع، رقم المبنى، الحي..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">ملاحظات إدارية (اختياري)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="ملاحظات تظهر للمشرفين فقط..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-sm transition"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER MODAL */}
      {isEditUserOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-orange-600" />
                <span>تعديل بيانات الحساب: {selectedUser.name}</span>
              </h3>
              <button onClick={() => setIsEditUserOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">المحافظة</label>
                  <select
                    value={formGovernorate}
                    onChange={(e) => setFormGovernorate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500 bg-white"
                  >
                    {EGYPT_GOVERNORATES_LIST.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نوع الصلاحية</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as 'customer' | 'admin')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500 bg-white font-bold"
                  >
                    <option value="customer">عميل عادي (Customer)</option>
                    <option value="admin">مشرف متجر (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">ملاحظات إدارية</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-sm transition"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DIGITAL LIBRARY LICENSE MANAGER FOR SPECIFIC USER */}
      {isLibraryManageOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span>المكتبة الرقمية للعميل: {selectedUser.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{selectedUser.email}</p>
              </div>
              <button onClick={() => setIsLibraryManageOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 text-purple-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>إدارة تراخيص الكتب الرقمية وقارئ PDF المحمي</span>
                </div>
                <p className="text-[11px] text-purple-700">
                  يمكنك بضغطة زر منح العميل إمكانية قراءة أي كتاب في متجرك فوراً، أو إلغاء الوصول لأي كتاب سبق شراؤه.
                </p>
              </div>

              {/* All Books in Store with Toggle Status */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {books.map((book) => {
                  const isGranted = (selectedUser.purchasedBooks || []).includes(book.id);

                  return (
                    <div 
                      key={book.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isGranted ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-slate-900">{book.title}</div>
                          <div className="text-[11px] text-slate-500">{book.author} • {book.category}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {book.format === 'physical' ? '📦 كتاب ورقي' : book.format === 'digital' ? '🔒 رقمي PDF' : '📦+🔒 ورقي ورقمي'}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isGranted ? (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>مفعل للقراءة</span>
                            </span>
                            <button
                              onClick={() => {
                                revokeBookAccessFromUser(selectedUser.uid, book.id);
                                setSelectedUser({
                                  ...selectedUser,
                                  purchasedBooks: (selectedUser.purchasedBooks || []).filter(id => id !== book.id)
                                });
                              }}
                              className="px-2.5 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition"
                            >
                              إلغاء الوصول
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              grantBookAccessToUser(selectedUser.uid, book.id);
                              setSelectedUser({
                                ...selectedUser,
                                purchasedBooks: [...(selectedUser.purchasedBooks || []), book.id]
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>منح ترخيص القراءة</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLibraryManageOpen(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SEND TARGETED NOTIFICATION */}
      {isSendDirectNotifOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-orange-600" />
                <span>إرسال إشعار مباشر لـ: {selectedUser.name}</span>
              </h3>
              <button onClick={() => setIsSendDirectNotifOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendDirectNotif} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">عنوان الإشعار *</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">نوع الإشعار</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500 bg-white"
                >
                  <option value="general">تنبيه عام (General)</option>
                  <option value="order">حالة طلب / كتاب رقمي (Order)</option>
                  <option value="promo">عرض ترويجي خاص (Promo)</option>
                  <option value="alert">تنبيه أمني عاجل (Alert)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">نص الرسالة *</label>
                <textarea
                  rows={3}
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="اكتب رسالتك للعميل هنا..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSendDirectNotifOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال الإشعار فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
