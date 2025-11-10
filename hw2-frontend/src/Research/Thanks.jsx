// src/Research/Thanks.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import { ThemeContext, ThemeProvider } from '../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';

// ✅ i18n
import { LanguageContext } from '../context/LanguageContext';
import { translateUI } from '../utils/translateUI';

// ---- טקסטים באנגלית (מתורגמים דינמית לעברית) ----
const SOURCE = {
  heroTitle_has: 'Thank you for participating! 🎉',
  heroTitle_no:  'Thank you for participating! 🙌',
  heroSubtitle_has: 'You completed the simulation, the Socratic reflection chat, and the validated questionnaire.',
  heroSubtitle_no:  'You completed the simulation and the validated questionnaire.',
  ribbons_completed: 'All steps completed',
  ribbons_control: 'Control group',
  ribbons_experimental: 'Experimental group',
  ribbons_reflective: 'Socratic reflection',
  ribbons_anonymous: 'Anonymous & secure',
  aboutTitle: 'A note of appreciation',
  about_1: 'Thank you for dedicating your time and sharing your honest reflections.',
  about_2: 'All responses are stored securely and remain fully anonymous — no personal information is ever collected.',
  about_3: 'Your participation contributes meaningfully to our study on learning and self-reflection among students.',
  about_4: "You're all set! You can safely close this page; no further action is required.",
  metaTitle: 'Technical recap',
  meta_anon: 'Anonymous ID',
  meta_phase: 'Final phase',
  meta_phase_post: 'POST',
  meta_notes_exp: 'Timestamps recorded for simulation and Socratic chat (research only)',
  meta_notes_ctrl:'Timestamps recorded for simulation (research only)',
  meta_group: 'Assigned group',
  meta_type: 'Condition',
  ready: 'Ready',
  notes: 'Notes',
  exit: 'Exit',
};

function ThanksInner() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = useStudent?.() || { student: null };

  // ✅ שפה וכיוון
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  // ✅ טבלת תרגום
  const [T, setT] = useState(SOURCE);
  const t = (k) => T[k] ?? k;

  useEffect(() => {
    let cancelled = false;
    async function loadT() {
      if (lang === 'he') {
        try {
          const keys = Object.keys(SOURCE);
          const vals = Object.values(SOURCE);
          const tr = await translateUI({ sourceLang: 'EN', targetLang: 'HE', texts: vals });
          if (!cancelled) {
            const map = {};
            keys.forEach((k, i) => (map[k] = tr[i]));
            setT(map);
          }
        } catch {
          if (!cancelled) setT(SOURCE);
        }
      } else {
        setT(SOURCE);
      }
    }
    loadT();
    return () => { cancelled = true; };
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const anonId = location.state?.anonId || student?.anonId || '—';
  const initialGroup = (location.state?.group || '').toString().toUpperCase();
  const initialType =
    location.state?.groupType || (initialGroup === 'D' ? 'control' : initialGroup ? 'experimental' : '');

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

  const aboutList = [
    t('about_1'),
    t('about_2'),
    t('about_3'),
    t('about_4'),
  ];

  const groupBadge = useMemo(() => {
    if (!group) return null;
    const isCtrl = group === 'D' || groupType === 'control';
    return {
      text: isCtrl ? t('ribbons_control') : t('ribbons_experimental'),
      tone: isCtrl
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    };
  }, [group, groupType, T]);

  return (
    <div
      className={`flex flex-col min-h-screen w-screen transition-colors duration-200 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800'
      }`}
      dir={dir}
      lang={lang}
      style={{ fontFamily: lang === 'he' ? 'Heebo, Rubik, Arial, sans-serif' : 'inherit' }}
    >
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      <main className="flex-1 w-full px-4 md:px-8 lg:px-12 py-6">
        <section className={`${isDark ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg`}>
          <div
            className={`rounded-2xl shadow-xl p-8 md:p-10 border-2 max-w-6xl mx-auto transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 text-white shadow-slate-900/50' 
                : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 text-slate-800 shadow-slate-300/50'
            }`}
          >
            {/* Hero Section */}
            <div className={`flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <h1
                  className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2 text-center md:text-start`}
                >
                  {hasSocratic ? t('heroTitle_has') : t('heroTitle_no')}
                </h1>
                <p className={`text-base md:text-lg leading-[1.9] ${isDark ? 'text-slate-300' : 'text-slate-600'} text-center md:text-start`}>
                  {hasSocratic ? t('heroSubtitle_has') : t('heroSubtitle_no')}
                </p>
              </div>

              {/* Ribbons */}
              <div
                className={`flex flex-wrap items-center gap-2 ${
                  isRTL ? 'flex-row-reverse md:justify-start' : 'md:justify-end'
                }`}
              >
                <span
                  className={`text-xs font-bold rounded-full px-4 py-2 shadow-sm transition-all hover:scale-105 ${
                    isDark ? 'bg-slate-600 text-slate-100 border border-slate-500' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  } ${isRTL ? '' : 'uppercase tracking-wider'}`}
                >
                  ✓ {t('ribbons_completed')}
                </span>

                {groupBadge && (
                  <span
                    className={`text-xs font-bold rounded-full px-4 py-2 shadow-sm transition-all hover:scale-105 ${groupBadge.tone} ${
                      isRTL ? '' : 'uppercase tracking-wider'
                    }`}
                  >
                    {groupBadge.text}
                  </span>
                )}

                <span
                  className={`text-xs font-bold rounded-full px-4 py-2 shadow-sm transition-all hover:scale-105 ${
                    isDark ? 'bg-slate-600 text-slate-100 border border-slate-500' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  } ${isRTL ? '' : 'uppercase tracking-wider'}`}
                >
                  🔒 {t('ribbons_anonymous')}
                </span>

                {hasSocratic && (
                  <span
                    className={`text-xs font-bold rounded-full px-4 py-2 shadow-sm transition-all hover:scale-105 ${
                      isDark ? 'bg-blue-900/30 text-blue-300 border border-blue-800' : 'bg-blue-100 text-blue-800 border border-blue-200'
                    } ${isRTL ? '' : 'uppercase tracking-wider'}`}
                  >
                    💭 {t('ribbons_reflective')}
                  </span>
                )}
              </div>
            </div>

            {fetchErr && (
              <div className={`mb-6 rounded-xl border-2 p-4 ${
                isDark ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-red-50 border-red-300 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="text-sm font-medium">{fetchErr}</span>
                </div>
              </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Appreciation Card */}
                <div
                  className={`rounded-xl border-2 shadow-md transition-all duration-300 hover:shadow-lg ${
                    isDark 
                      ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600' 
                      : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
                  }`}
                >
                  <div className="p-6 md:p-7" dir="ltr">


<div
  className={`flex items-center gap-3 mb-4 ${
    lang === 'he' ? 'flex-row-reverse text-right' : 'flex-row text-left'
  }`}
  dir={lang === 'he' ? 'ltr' : 'ltr'}
>
  {lang === 'he' ? (
    <>
      <span className="text-3xl">🙏</span>
      <h2 className="text-2xl font-bold">{t('aboutTitle')}</h2>
    </>
  ) : (
    <>
      <h2 className="text-2xl font-bold">{t('aboutTitle')}</h2>
      <span className="text-3xl">🙏</span>
    </>
  )}
</div>

<ul className="space-y-3 text-left pl-6 md:pl-7" dir="ltr" role="list">



{aboutList.map((b, i) => (
<li
  key={i}
  className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
>


      <span
        className={`mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}
      ></span>
<span
  dir={isRTL ? 'rtl' : 'ltr'}
  className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
>
  {b}
</span>

    </li>
  ))}
</ul>
                  </div>
                </div>
              </div>

              {/* Right Column - Meta Info */}
              <aside
                className={`rounded-xl border-2 shadow-md h-fit transition-all duration-300 hover:shadow-lg ${
                  isDark 
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600' 
                    : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
                }`}
              >
                <div className="p-6 md:p-7" dir={isRTL ? 'rtl' : 'ltr'}>

                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-bold">{t('metaTitle')}</h4>
                    <span className="text-xs font-bold rounded-full px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                      ✓ {t('ready')}
                    </span>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {t('meta_anon')}
                        </span>
                        <code
                          dir="ltr"
                          className={`${isDark ? 'bg-slate-900 text-blue-300' : 'bg-white text-blue-600'} border rounded-lg px-3 py-1.5 text-xs font-mono font-semibold shadow-sm text-left`}
                        >
                          {anonId}
                        </code>
                      </div>
                    </div>

                    {/* מוסתר בכוונה – כמו אצלך */}
                    {group && (
                      <>
                        <div aria-hidden="true" className={`hidden p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'}`}>
                          <div className="flex items-center justify-between gap-3">
                            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium`}>
                              {t('meta_group')}
                            </span>
                            <span className="font-bold text-lg">Group {group}</span>
                          </div>
                        </div>
                        <div aria-hidden="true" className={`hidden p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'}`}>
                          <div className="flex items-center justify-between gap-3">
                            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium`}>
                              {t('meta_type')}
                            </span>
                            <span className="font-bold">
                              {group === 'D' ? 'Control' : 'Experimental'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {t('meta_phase')}
                        </span>
                        <span className="font-bold">{t('meta_phase_post')}</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'}`}>
                      <div className="flex flex-col gap-2">
                        <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {t('notes')}
                        </span>
                        <span className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {hasSocratic ? t('meta_notes_exp') : t('meta_notes_ctrl')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Exit Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => navigate('/')}
                      className={`w-full px-6 py-3.5 rounded-xl font-bold text-base shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                        isDark
                          ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-500 hover:to-slate-600 border border-slate-500'
                          : 'bg-gradient-to-r from-white to-slate-50 text-slate-700 border-2 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {t('exit')}
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
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
