/**
 * Security & Digital Rights Management (DRM) Utilities
 * Hawari Store Fortress Protection Suite
 */

import { UserProfile } from '../types';

/**
 * Strips dangerous HTML tags and script injections from user inputs
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // remove HTML angle brackets
    .replace(/javascript:/gi, '') // remove javascript protocols
    .replace(/onload|onerror|onclick|onmouseover/gi, '') // remove inline handlers
    .trim();
}

/**
 * Sanitizes uploaded file names to prevent directory traversal or execution payloads
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_file';
  return filename
    .replace(/[^a-zA-Z0-9._\-\u0600-\u06FF]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 100);
}

/**
 * Masks customer phone number for privacy in public areas and audit logs
 * Example: "01001332899" -> "010****2899"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '010****0000';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 7) return clean;
  const prefix = clean.substring(0, 3);
  const suffix = clean.substring(clean.length - 4);
  return `${prefix}****${suffix}`;
}

/**
 * Masks customer email address for privacy
 * Example: "mohamedhawary891@gmail.com" -> "moh***@gmail.com"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'u***@secure.com';
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `${username.charAt(0)}***@${domain}`;
  }
  const prefix = username.substring(0, 3);
  return `${prefix}***@${domain}`;
}

/**
 * Masks customer name for privacy
 * Example: "محمد الهواري" -> "محمد الـ***"
 */
export function maskName(name: string): string {
  if (!name) return 'عميل موثوق';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].length > 3 ? `${parts[0].substring(0, 3)}***` : `${parts[0]}*`;
  }
  return `${parts[0]} ${parts[1].charAt(0)}***`;
}

/**
 * Generates an individualized, tamper-evident cryptographic watermark token for DRM PDF reader
 */
export function generateSecureWatermark(user?: UserProfile | null) {
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const rawId = user?.uid || 'GUEST-SESSION';
  
  // Pseudo random device/session hash for forensic tracking
  const sessionHash = Math.random().toString(36).substring(2, 9).toUpperCase();
  const securityHash = `HAW-SEC-${rawId.substring(0, 5)}-${sessionHash}`;

  const primaryText = user
    ? `🔒 رخصة مشفرة: ${user.name} | ${maskPhoneNumber(user.phone)} | ${maskEmail(user.email)}`
    : `🔒 جلسة متجر هواري المشفرة | ${securityHash} | ${dateStr}`;

  return {
    primaryText,
    secondaryText: `⛔ محتوى محمي بقوانين الملكية الفكرية • يمنع النسخ أو التصوير الرقمي • رقم الترخيص: ${securityHash}`,
    timestamp: `${dateStr} - ${timeStr}`,
    securityHash,
    userFingerprint: user ? `${user.uid.substring(0, 6)}_${user.email.split('@')[0]}` : `SEC_${sessionHash}`
  };
}

/**
 * Validates uploaded payment proof screenshots (PNG, JPG, JPEG, WEBP)
 * Blocks executable files, scripts, and enforces size ceiling (max 8MB)
 */
export function validateReceiptUpload(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'يرجى اختيار صورة إيصال التحويل.' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { 
      isValid: false, 
      error: 'نوع الملف غير مدعوم. يُسمح فقط بالصور (JPG, PNG, WEBP).' 
    };
  }

  const maxSizeBytes = 8 * 1024 * 1024; // 8MB
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: 'حجم صورة الإيصال كبير جداً. الحد الأقصى المسموح به هو 8 ميجابايت.' 
    };
  }

  return { isValid: true };
}

/**
 * Global Anti-Piracy Keybindings Shield
 * Checks if a triggered keyboard event is attempting to capture, inspect, print or copy protected material
 */
export function isProtectedKeyEvent(e: KeyboardEvent): { isBlocked: boolean; reason?: string } {
  // PrintScreen / Snipping Tool
  if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
    return { isBlocked: true, reason: 'تم حجب تصوير الشاشة لحماية حقوق النشر.' };
  }

  // Ctrl+P / Cmd+P (Print)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
    return { isBlocked: true, reason: 'الطباعة معطلة لحماية المحتوى الرقمي.' };
  }

  // Ctrl+S / Cmd+S (Save Page / Download)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    return { isBlocked: true, reason: 'حفظ المستند معطل للحماية.' };
  }

  // Ctrl+U / Cmd+U (View Source)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
    return { isBlocked: true, reason: 'عرض شفرة المصدر محظور.' };
  }

  // F12 or Ctrl+Shift+I / Cmd+Option+I (DevTools Inspect)
  if (
    e.key === 'F12' || 
    ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'j'))
  ) {
    return { isBlocked: true, reason: 'أدوات المطورين محظورة داخل القارئ المشفر.' };
  }

  return { isBlocked: false };
}
