// src/Research/Thanks.jsx
// src/Research/Thanks/index.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnonymousHeader from '../AnonymousHeader';
import Footer from '../../layout/Footer';
import { ThemeContext, ThemeProvider } from '../../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from '../../context/AnonymousStudentContext';
import { useI18n } from '../../utils/i18n';
import HeroSection from './HeroSection';
import AppreciationCard from './AppreciationCard';
import MetaInfoCard from './MetaInfoCard';
import LoadingScreen from './LoadingScreen';
import ErrorAlert from './ErrorAlert';
function ThanksInner() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = useStudent?.() || { student: null };

  useEffect(() => {
    try {
      const lock = localStorage.getItem("langLock");
      if (lock === "1") {
        localStorage.removeItem("langLock");
        window.dispatchEvent(new Event("lang-lock-change"));
        console.log("Language lock removed on this page");
      }
    } catch (e) {
      console.warn("Failed to clear langLock:", e);
    }
  }, []);

  const { t, dir, lang: langAttr, ready } = useI18n('thanks');
  const isRTL = dir === 'rtl';

  const anonId = location.state?.anonId || student?.anonId || '—';
  const initialGroup = (location.state?.group || '').toString().toUpperCase();
  const initialType = location.state?.groupType || (initialGroup === 'D' ? 'control' : initialGroup ? 'experimental' : '');

  const [group, setGroup] = useState(initialGroup);
  const [groupType, setGroupType] = useState(initialType);
  const [fetchErr, setFetchErr] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (group || !anonId || anonId === '—') return;
      try {
        const r = await fetch(`/api/trial/${anonId}`);
        if (!r.ok) throw new Error('Failed to load trial meta.');
        const tMeta = await r.json();
        if (ignore) return;
        const g = String(tMeta.group || '').toUpperCase();
        setGroup(g);
        setGroupType(tMeta.groupType || (g === 'D' ? 'control' : g ? 'experimental' : ''));
      } catch (e) {
        if (!ignore) setFetchErr(e.message || 'Load error');
      }
    })();
    return () => { ignore = true; };
  }, [anonId, group]);

  const hasSocratic = useMemo(() => !!group && group !== 'D', [group]);
  const aboutList = [t('about_1'), t('about_2'), t('about_3'), t('about_4')];

  const groupBadge = useMemo(() => {
    if (!group) return null;
    const isCtrl = group === 'D' || groupType === 'control';
    return {
      text: isCtrl ? t('ribbons_control') : t('ribbons_experimental'),
      tone: isCtrl
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    };
  }, [group, groupType, t]);

  if (!ready) {
    return <LoadingScreen isDark={isDark} dir={dir} langAttr={langAttr} />;
  }

  return (
    <div
      className={`flex flex-col min-h-screen w-screen ${
        isDark
          ? 'bg-slate-950'
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}
      dir={dir}
      lang={langAttr}
      style={{ fontFamily: langAttr === 'he' ? 'Heebo, Rubik, Arial, sans-serif' : 'inherit' }}
    >
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      <main className="flex-1 w-full px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <HeroSection 
            hasSocratic={hasSocratic}
            groupBadge={groupBadge}
            isDark={isDark}
            isRTL={isRTL}
            t={t}
          />

          <ErrorAlert error={fetchErr} isDark={isDark} />

          {/* Main Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <AppreciationCard 
              aboutList={aboutList}
              isDark={isDark}
              isRTL={isRTL}
              t={t}
            />

            <MetaInfoCard 
              anonId={anonId}
              hasSocratic={hasSocratic}
              isDark={isDark}
              isRTL={isRTL}
              navigate={navigate}
              t={t}
            />
          </div>
        </div>
      </main>

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}

export default function Thanks() {
  return (
    <ThemeProvider>
      <ThanksInner />
    </ThemeProvider>
  );
}