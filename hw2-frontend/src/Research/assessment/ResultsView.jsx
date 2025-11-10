// src/Research/assessment/ResultsView.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { LanguageContext } from '../../context/LanguageContext';
import { translateUI } from '../../utils/translateUI';

export default function ResultsView({ results, completionTime, onFinish }) {
  const { lang } = useContext(LanguageContext);

  // ---- i18n (מקור באנגלית בלבד) ----
  const SOURCE = {
    title: 'Questionnaire Complete',
    completedIn: 'Completed in',
    avg: 'Avg',
    useResults:
      'Use these results to identify growth opportunities and leverage your strengths.',
    finish: 'Finish',
  };

  const [T, setT] = useState(SOURCE);
  const t = (k) => T[k] ?? k;

  useEffect(() => {
    let cancelled = false;
    async function loadT() {
      if (lang === 'he') {
        try {
          const keys = Object.keys(SOURCE);
          const vals = Object.values(SOURCE);
          const tr = await translateUI({
            sourceLang: 'EN',
            targetLang: 'HE',
            texts: vals,
          });
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
    return () => {
      cancelled = true;
    };
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- RTL helpers ----
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const spaceDir = lang === 'he' ? 'space-x-reverse' : '';

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8" dir={dir}>
      <div className="w-full max-w-7xl mx-auto rounded-lg shadow-md p-6 md:p-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {/* HEADER */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-xl mb-6 shadow"
            style={{ background: '#059669' }}
          >
            <Award className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {t('title')}
          </h2>

          {completionTime && (
            <div
              className={`inline-flex items-center space-x-3 ${spaceDir} bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700 px-5 py-2.5 rounded-full mb-2`}
            >
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                {t('completedIn')} {completionTime}
              </span>
            </div>
          )}
        </div>

        {/* RESULTS LIST */}
        <div className="space-y-5 mb-10">
          {results.map(({ category, score, average }) => (
            <div
              key={category}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                  {category}{' '}
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    ({t('avg')} {average} / 4.0)
                  </span>
                </h3>
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {Math.round(score)}%
                </div>
              </div>
              <div className="relative w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-1000 ease-out"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* TIP BOX */}
        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 rounded-xl p-6 mb-8">
          <p className="text-blue-800 dark:text-blue-200">{t('useResults')}</p>
        </div>

        {/* CTA */}
        <div className="grid gap-3 md:grid-cols-1">
 <button
   onClick={() => {
     try { localStorage.removeItem('langLock'); } catch {}
     window.dispatchEvent(new Event('lang-lock-change'));
     onFinish?.();
   }}
            className="w-full bg-emerald-600 dark:bg-emerald-500 text-white py-4 rounded-xl font-semibold hover:shadow"
          >
            {t('finish')}
          </button>
        </div>
      </div>
    </div>
  );
}
