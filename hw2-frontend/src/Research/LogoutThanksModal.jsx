import React, { useEffect, useRef, useContext, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n'; // ✅ מילון מקומי ומהיר

export default function LogoutThanksModal({
  open,
  onClose,
  onConfirm,
  summary,
  closeOnBackdrop = false,
  closeOnEsc = false,
}) {
  if (!open) return null;

  // שפה וכיוון
  const { lang } = useContext(LanguageContext);
  const isHe = lang === 'he';
  const { t, dir } = useI18n('logoutThanksModal');

  const dialogRef = useRef(null);

  // ESC לסגור (אם הוגדר closeOnEsc)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (closeOnEsc) onClose?.();
      }
    };
    document.addEventListener('keydown', onKey, true);
    dialogRef.current?.querySelector('[data-primary]')?.focus?.();
    return () => document.removeEventListener('keydown', onKey, true);
  }, [closeOnEsc, onClose]);

  // סיכום זמנים
  const { createdAt, lastSeenAt, createdAtLocal, lastSeenAtLocal, sessionDurationSec } = summary || {};

  const parseISO = (s) => { const d = new Date(s); return Number.isNaN(d.getTime()) ? null : d; };
  let durationSec = null;
  const sISO = createdAt ? parseISO(createdAt) : null;
  const eISO = lastSeenAt ? parseISO(lastSeenAt) : null;
  if (sISO && eISO) durationSec = Math.max(0, Math.round((eISO - sISO) / 1000));
  else if (typeof sessionDurationSec === 'number') durationSec = Math.max(0, Math.round(sessionDurationSec));

  const formatDuration = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return [h ? `${h}h` : null, (m || h) ? `${m}m` : null, `${r}s`].filter(Boolean).join(' ');
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog" dir={dir}>
      {/* רקע */}
      <div className="absolute inset-0 bg-black/40" onClick={closeOnBackdrop ? onClose : undefined} />
      <div
        ref={dialogRef}
        onClick={stop}
        className="relative bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl p-6 w-[min(520px,90vw)] border border-slate-200 dark:border-slate-700"
      >
        <h2 className={`text-xl font-bold mb-2 ${isHe ? 'text-right' : 'text-left'}`}>{t('title')}</h2>
        <p className={`text-sm opacity-80 mb-4 ${isHe ? 'text-right' : 'text-left'}`}>{t('desc')}</p>

        {/* בלוק הנתונים — לא מתהפך */}
        <div className="rounded-lg border dark:border-slate-600 p-4 mb-4 text-sm">
          <div className="flex justify-between py-1">
            <span className="font-medium">{t('startTime')}</span>
            <span dir="ltr" className="font-mono tabular-nums">{createdAtLocal || '—'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-medium">{t('endTime')}</span>
            <span dir="ltr" className="font-mono tabular-nums">{lastSeenAtLocal || '—'}</span>
          </div>
          {typeof durationSec === 'number' && !Number.isNaN(durationSec) && (
            <div className="flex justify-between py-1">
              <span className="font-medium">{t('duration')}</span>
              <span dir="ltr" className="font-mono tabular-nums">{formatDuration(durationSec)}</span>
            </div>
          )}
        </div>

        {/* כפתור בצד ההגיוני */}
        <div className={`flex ${isHe ? 'justify-start' : 'justify-end'}`}>
          <button
            data-primary
            onClick={onConfirm ?? onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {t('closeAndContinue')}
          </button>
        </div>
      </div>
    </div>
  );
}
