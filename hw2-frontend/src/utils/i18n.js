const cache = {}; // ns:lang => dict

// ... אותו cache ו-loadDict כמו קודם
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
  const [dict, setDict] = useState({});

  useEffect(() => {
    let cancelled = false;
    loadDict(ns, lang).then(d => { if (!cancelled) setDict(d); });
    return () => { cancelled = true; };
  }, [ns, lang]);

  const t = (key, fallback) => (dict[key] ?? fallback ?? key);
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const langAttr = lang === 'he' ? 'he' : 'en';
  return { t, dir, lang: langAttr };
}
