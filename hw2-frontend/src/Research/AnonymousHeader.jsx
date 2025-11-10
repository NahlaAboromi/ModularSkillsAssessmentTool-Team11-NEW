import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import ThemeToggle from '../DarkLightMood/ThemeToggle';
import { useAnonymousStudent as useStudent } from "../context/AnonymousStudentContext";
import SessionTimer from './SessionTimer';
import LogoutThanksModal from './LogoutThanksModal';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n';

const StudentHeader = () => {
  const navigate = useNavigate();

  // Student context (stop timer on logout, clear student)
  const { student, stopSessionTimer, clearStudent } = useStudent();

  // Modal + logout state
  const [showModal, setShowModal] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Theme + Language
  const { theme } = useContext(ThemeContext);
  const { lang } = useContext(LanguageContext);
  const isDark = theme === 'dark';
  const isRTL = lang === 'he';

  // ✅ i18n מקומי ומהיר
  const { t, dir } = useI18n('anonymousHeader');

  useEffect(() => {
    console.log('[AnonymousHeader DEBUG] render/update', {
      theme,
      loggingOut,
      showModal,
      studentSnapshot: {
        hasStudent: !!student,
        anonId: student?.anonId,
        username: student?.username,
      },
      hasStopSessionTimerFn: typeof stopSessionTimer === 'function',
    });
  }, [theme, loggingOut, showModal, student, stopSessionTimer]);

  // 🔒 מעקב אחרי נעילת מחליף השפה (כשמתחיל שאלון)
  const readLangLock = () => {
    try { return localStorage.getItem('langLock') === '1'; } catch { return false; }
  };
  const [isLangLocked, setIsLangLocked] = useState(readLangLock());
  useEffect(() => {
    const onChange = () => setIsLangLocked(readLangLock());
    window.addEventListener('lang-lock-change', onChange);
    window.addEventListener('storage', onChange); // טאבים נוספים
    return () => {
      window.removeEventListener('lang-lock-change', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  // Logout flow
  const handleLogout = async () => {
    if (!student?.anonId || loggingOut) return;
    try {
      setLoggingOut(true);
      try { await stopSessionTimer(student.anonId); } catch (e) { console.error(e); }
      let data = null;
      try {
        const res = await fetch(`/api/anonymous/${student.anonId}/session-summary`);
        if (res.ok) data = await res.json().catch(() => null);
      } catch (e) {
        console.error('[Logout] fetch summary failed', e);
      }
      setSessionSummary(data);
    } finally {
      setShowModal(true);
      setLoggingOut(false);
    }
  };

  // Modal handlers
  const closeModalOnly = () => setShowModal(false);
  const confirmAndExit = () => {
    setShowModal(false);
    try { clearStudent?.(); } catch (e) { console.error(e); }
    navigate('/');
  };

  // Profile image (fallback)
  const getProfileImage = () => {
    if (!student?.profilePic || student.profilePic === 'default_empty_profile_pic' || !student?.username) {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      );
    }
    return (
      <img
        src={student.profilePic}
        alt={student?.username || t('anonymousStudent')}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/default-profile.png';
        }}
      />
    );
  };

  return (
    <>
      <header
        dir={dir}                // ← נקי ומדויק
        lang={isRTL ? 'he' : 'en'}
        className={`p-4 ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'}
                    flex justify-between items-center rounded shadow-md`}
      >
        {/* Left side: tiny title only (no nav links) */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-base">{t('headerTitle')}</span>

          {/* DEBUG badge – רוחב קבוע למניעת קפיצות */}
          <span className="text-xs px-2 py-0.5 rounded bg-slate-900/20 inline-flex items-center justify-center min-w-24">
            id:{student?.anonId ? String(student.anonId).slice(0, 8) : '—'}
          </span>
        </div>

        {/* Right side: theme, language, timer, profile, logout */}
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <LanguageSwitcher
            disabled={isLangLocked}
            title={isLangLocked ? (isRTL ? t('langLockedHe') : t('langLockedEn')) : undefined}
          />
          <SessionTimer />

          {/* Student profile - גבול/ריווח מתהפך לפי שפה */}
          <div
            className={`flex items-center gap-3 ${isRTL ? 'pl-4 border-l' : 'pr-4 border-r'} border-slate-500`}
          >
            <div className={`flex flex-col ${isRTL ? 'items-start text-start' : 'items-end text-end'}`}>
              <span className="font-medium dark:text-gray-200">
                {student?.username ? student.username : t('anonymousStudent')}
              </span>
              <span className="text-xs dark:text-gray-300">
                {student?.username ? t('registered') : t('guest')}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400 flex items-center justify-center bg-white">
              {getProfileImage()}
            </div>
          </div>

          {/* Logout */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-1 px-3 rounded transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                   className="lucide lucide-log-out">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              <span>{loggingOut ? t('working') : t('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      <LogoutThanksModal
        open={showModal}
        onClose={closeModalOnly}
        onConfirm={confirmAndExit}
        summary={sessionSummary}
        closeOnBackdrop={true}
        closeOnEsc={true}
      />
    </>
  );
};

export default StudentHeader;
