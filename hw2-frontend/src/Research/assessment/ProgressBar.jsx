// src/Research/assessment/ProgressBar.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { LanguageContext } from '../../context/LanguageContext';
import { translateUI } from '../../utils/translateUI';

export default function ProgressBar({
  progress,
  quickMode,
  current,
  total,
  answered,
  isDark: isDarkProp,
}) {
  // theme
  const { theme } = useContext(ThemeContext) || {};
  const isDarkCtx = theme === 'dark';
  const isDark = typeof isDarkProp === 'boolean' ? isDarkProp : isDarkCtx;

  // language
  const { lang } = useContext(LanguageContext);

  // ---- i18n (בלי עברית בקוד) ----
  const SOURCE = {
    question: 'Question',
    of: 'of',
    quickMode: 'Quick Mode',
    completeSuffix: 'Complete',
    answered: 'answered',
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

  // ---- classes ----
  const wrapperCls = isDark
    ? 'bg-white/10 border-white/20 text-white'
    : 'bg-slate-900/5 border-slate-300/60 text-slate-800';

  const trackCls = isDark ? 'bg-white/20' : 'bg-slate-900/15';

  const leftTextCls = isDark ? 'text-white/90' : 'text-slate-800';
  const rightTextCls = isDark ? 'text-white' : 'text-slate-900';

  // RTL: הופך סדר אייקון/טקסט בצ׳יפ של Quick Mode
  const chipDirCls = lang === 'he' ? 'flex-row-reverse' : 'flex-row';

  // פורמט “שאלה X מתוך Y” / “Question X of Y”
  const qLabel =
    typeof total === 'number' && typeof current === 'number'
      ? lang === 'he'
        ? // בעברית: "שאלה X מתוך Y" (התרגום של Question/of מגיע מהשרת)
          `${t('question')} ${current} ${t('of')} ${total}`
        : `${t('question')} ${current} ${t('of')} ${total}`
      : '';

  // “NN% Complete” → התרגום של "Complete" מגיע מהשרת
  const pctLabel = `${Math.round(progress)}% ${t('completeSuffix')}`;

  return (
    <div
      className={`mb-8 rounded-2xl p-6 border backdrop-blur-md ${wrapperCls}`}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          {qLabel && (
            <span className={`text-sm font-semibold ${leftTextCls}`}>
              {qLabel}
            </span>
          )}

          {/* אם תרצי להחזיר את מונה התשובות, בטלי את ההערה וסיימי עם t('answered') */}
          {/*
          {typeof answered === 'number' && typeof total === 'number' && (
            <span className={isDark ? 'text-xs text-white/70' : 'text-xs text-slate-600'}>
              ({answered} {t('answered')})
            </span>
          )}
          */}

          {quickMode && (
            <span
              className={`text-xs bg-purple-500/80 text-white px-3 py-1 rounded-full font-bold flex ${chipDirCls} items-center gap-1.5 backdrop-blur-sm`}
              title={t('quickMode')}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t('quickMode')}</span>
            </span>
          )}
        </div>

        <span className={`text-sm font-bold ${rightTextCls}`}>{pctLabel}</span>
      </div>

      <div className={`relative w-full ${trackCls} rounded-full h-3 overflow-hidden`}>
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500 transition-all ease-out shadow-lg"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
