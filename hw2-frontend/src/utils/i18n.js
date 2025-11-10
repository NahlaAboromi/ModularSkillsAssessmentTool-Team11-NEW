// utils/i18n.js
const cache = {};

export async function loadDict(ns, lang) {
  const key = `${ns}:${lang}`;
  if (cache[key]) return cache[key];
  let mod;
  switch (ns) {
    case 'anonymousHeader':
      mod = lang === 'he'
        ? await import('../i18n/anonymousHeader.he.json')
        : await import('../i18n/anonymousHeader.en.json');
      break;
    case 'homepage':
      mod = lang === 'he'
        ? await import('../i18n/homepage.he.json')
        : await import('../i18n/homepage.en.json');
      break;
    case 'anonymousStart':
      mod = lang === 'he'
        ? await import('../i18n/anonymousStart.he.json')
        : await import('../i18n/anonymousStart.en.json');
      break;
    case 'questionnaireIntro':
  mod = lang === 'he'
    ? await import('../i18n/questionnaireIntro.he.json')
    : await import('../i18n/questionnaireIntro.en.json');
  break;
case 'resultsView':
  mod = lang === 'he'
    ? await import('../i18n/resultsView.he.json')
    : await import('../i18n/resultsView.en.json');
  break;
case 'assessment':
  mod = lang === 'he'
    ? await import('../i18n/assessment.he.json')
    : await import('../i18n/assessment.en.json');
  break;
case 'logoutThanksModal':
  mod = lang === 'he'
    ? await import('../i18n/logoutThanksModal.he.json')
    : await import('../i18n/logoutThanksModal.en.json');
  break;
case 'progressBar':
  mod = lang === 'he'
    ? await import('../i18n/progressBar.he.json')
    : await import('../i18n/progressBar.en.json');
  break;
  case 'studentAnswerCard':
  mod = lang === 'he'
    ? await import('../i18n/studentAnswerCard.he.json')
    : await import('../i18n/studentAnswerCard.en.json');
  break;
  case 'socraticReflectionFeedback':
  mod = lang === 'he'
    ? await import('../i18n/socraticReflectionFeedback.he.json')
    : await import('../i18n/socraticReflectionFeedback.en.json');
  break;
  case 'thanks':
  mod = lang === 'he'
    ? await import('../i18n/thanks.he.json')
    : await import('../i18n/thanks.en.json');
  break;
  // בתוך switch (ns)
case 'socraticCoach':
  mod = lang === 'he'
    ? await import('../i18n/socraticCoach.he.json')
    : await import('../i18n/socraticCoach.en.json');
  break;

  // בתוך loadDict(...)
case 'simulation':
  mod = lang === 'he'
    ? await import('../i18n/simulation.he.json')
    : await import('../i18n/simulation.en.json');
  break;
case 'finalSummary':
  mod = lang === 'he'
    ? await import('../i18n/finalSummary.he.json')
    : await import('../i18n/finalSummary.en.json');
  break;
case 'anonymousSimulationResult':
  mod = lang === 'he'
    ? await import('../i18n/anonymousSimulationResult.he.json')
    : await import('../i18n/anonymousSimulationResult.en.json');
  break;
    case 'assignmentConfirm':   // ✅ הוספת שפה למסך AssignConfirm
      mod = lang === 'he'
        ? await import('../i18n/assignmentConfirm.he.json')
        : await import('../i18n/assignmentConfirm.en.json');
      break;
    default:
      mod = { default: {} };
  }
  cache[key] = mod?.default ?? {};
  return cache[key];
}

import { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export function useI18n(ns) {
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const key = `${ns}:${lang}`;
  const initial = cache[key] || null;

  const [dict, setDict] = useState(initial);
  const [ready, setReady] = useState(!!initial);

  useEffect(() => {
    let cancelled = false;

    // אם במטמון – נטען מייד
    if (cache[key]) {
      setDict(cache[key]);
      setReady(true);
      return;
    }

    loadDict(ns, lang)
      .then((d) => {
        if (!cancelled) {
          setDict(d);
          setReady(true);
        }
      })
      .catch((e) => {
        console.error('[i18n] failed loading dict', ns, lang, e);
        if (!cancelled) {
          setDict({});
          setReady(true); // שלא נתקע על null
        }
      });

    return () => { cancelled = true; };
  }, [ns, lang]);

  const t = (k, fallback = '') => (dict && k in dict ? dict[k] : fallback || k);
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const langAttr = lang === 'he' ? 'he' : 'en';
  return { t, dir, lang: langAttr, ready };
}
