// src/Research/Simulation.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';
import { useI18n } from '../utils/i18n'; // ✅ i18n מקומי ומהיר

// 🔹 פונקציה שמתחילה trial ושומרת זמן התחלה בלוקאל
async function startTrial(anonId) {
  try {
    const res = await fetch('/api/trial/start', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonId }),
    });
    const data = await res.json().catch(() => ({}));
    localStorage.setItem('simStartAtISO', (data?.startedAt) || new Date().toISOString());
  } catch (e) {
    console.warn('[startTrial] failed, fallback to now:', e);
    localStorage.setItem('simStartAtISO', new Date().toISOString());
  }
}

// 🧩 helpers
function readLS(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

// בוחר וריאנט לפי שפה מתוך אובייקט assignment ששמור בלוקאל
function pickScenarioFromAssignment(asg, lang) {
  if (!asg) return null;
  const code = (lang === 'he') ? 'he' : 'en';
  const v = asg?.scenarios?.[code];
  if (!v) return null;
  return {
    scenarioId: asg.scenarioId || v.scenarioId,
    assignedGroupType: v.assignedGroupType ?? asg.groupType,
    selTags: Array.isArray(v.selTags) ? v.selTags : (asg.selTags || []),
    title: v.title ?? asg.title,
    text: v.text ?? asg.text,
    reflection: Array.isArray(v.reflection) ? v.reflection : (asg.reflection || []),
    version: v.version || asg.version || 'v1',
    scenarios: asg.scenarios, 
  };
}

// בוחר גרסת תרחיש לפי שפה, עם נפילה חכמה למקור
function pickScenarioByLang(scn, lang) {
  if (!scn) return scn;
  const code = (lang === 'he') ? 'he' : 'en';
  const variant = scn?.scenarios?.[code];
  if (variant) {
    return {
      scenarioId: scn.scenarioId || variant.scenarioId,
      assignedGroupType: variant.assignedGroupType ?? scn.assignedGroupType,
      selTags: variant.selTags ?? scn.selTags,
      title: variant.title ?? scn.title,
      text: variant.text ?? scn.text,
      reflection: Array.isArray(variant.reflection) ? variant.reflection : scn.reflection || [],
      version: scn.version || variant.version || 'v1',
      scenarios: scn.scenarios,
    };
  }
  return scn;
}

function SimulationContent() {
  const navigate = useNavigate();
  const { scenarioId: paramScenarioId } = useParams();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { student } = useStudent?.() || { student: null };
  const navState = useLocation().state;

  // ✅ i18n
  const { t, dir, lang } = useI18n('simulation');

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [trial, setTrial] = useState(null);
  const [freeAnswer, setFreeAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewStartAt, setViewStartAt] = useState(null);

  // 🔹 טיימר
  function useElapsedTimer(startedAt) {
    const [elapsed, setElapsed] = React.useState(0);
    React.useEffect(() => {
      if (!startedAt) return;
      const startTime = new Date(startedAt).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const diffSec = Math.max(0, Math.floor((now - startTime) / 1000));
        setElapsed(diffSec);
      }, 1000);
      return () => clearInterval(interval);
    }, [startedAt]);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    return { mm, ss };
  }
  const { mm, ss } = useElapsedTimer(viewStartAt);

  // 🔹 התחלת trial עם כניסה למסך (פעם אחת בלבד לכל anonId)
  useEffect(() => {
    if (!student?.anonId) return;
    const startedKey = `trialStartedFor:${student.anonId}`;
    if (localStorage.getItem(startedKey) === '1') return;
    localStorage.setItem(startedKey, '1');
    startTrial(student.anonId);
  }, [student?.anonId]);

  // ✅ על שינוי שפה – מחליף וריאנט מתוך localStorage.assignment (ללא fetch)
// ✅ כשהשפה משתנה: קודם בודקים אם ל-trial.scenario יש מפה פנימית של תרחישים,
// אם כן - מחליפים משם. אחרת מנסים מ-localStorage.assignment. אין fetch כאן.
useEffect(() => {
  if (!trial) return;

  // 1) החלפה מתוך המפה הפנימית אם קיימת
  const repicked = pickScenarioByLang(trial.scenario, lang);
  const changed =
    !trial.scenario ||
    repicked?.title !== trial.scenario?.title ||
    repicked?.text !== trial.scenario?.text;

  if (repicked && changed) {
    setTrial(prev => (prev ? { ...prev, scenario: repicked } : prev));
    return;
  }

  // 2) fallback ל־localStorage.assignment
  const lsAsg = readLS('assignment', null);
  if (lsAsg) {
    const variant = pickScenarioFromAssignment(lsAsg, lang);
    if (variant) {
      setTrial(prev => (prev ? { ...prev, scenario: { ...variant, scenarios: lsAsg.scenarios } } : prev));
    }
  }
}, [lang]); // eslint-disable-line react-hooks/exhaustive-deps
// eslint-disable-line react-hooks/exhaustive-deps
// eslint-disable-line react-hooks/exhaustive-deps

  // 🔹 אתחול טיימר תצוגה
  useEffect(() => {
    const isoNow = new Date().toISOString();
    setViewStartAt(isoNow);
    try { localStorage.setItem('simViewStartAtISO', isoNow); } catch {}
  }, []);

  // 🔹 אתחול נתונים (כולל טעינה לפי lang)
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        setLoading(true);
        setErr('');

        // 1) ניווט עם state מוכן
        if (navState?.group && navState?.scenario) {
          const tTrial = {
            group: navState.group,
            groupType: navState.groupType,
            scenarioId: navState.scenarioId || paramScenarioId,
 scenario: {
   ...pickScenarioByLang(navState.scenario, lang),
   
   scenarios: navState.scenario?.scenarios,     // ✅ שמירה על המפה
 },            startedAt: navState.startedAt,
          };
          if (!cancelled) {
            setTrial(tTrial);
            setFreeAnswer('');
            setLoading(false);
          }
          return;
        }

        // 2) ניסיון מלוקאל (assignment כולל he/en)
        const lsAsg = readLS('assignment', null);
        if (lsAsg) {
          const variant = pickScenarioFromAssignment(lsAsg, lang);
          if (variant) {
            const tTrial = {
              group: lsAsg.group,
              groupType: lsAsg.groupType || lsAsg.assignedGroupType || 'control',
              scenarioId: lsAsg.scenarioId,
 scenario: { ...variant, scenarios: lsAsg.scenarios },
               startedAt: readLS('simStartAtISO', null) || null,
            };
            if (!cancelled) {
              setTrial(tTrial);
              setFreeAnswer('');
              setLoading(false);
            }
            return; // 💡 אין צורך ב-fetch אם נמצא ב-LS
          }
        }

        // 3) טעינה מהשרת (שולחים שפה כדי לקבל וריאנט מתאים)
        if (!student?.anonId) {
          throw new Error('Missing anonId. Please restart the study flow.');
        }
        const res = await fetch(`/api/trial/${student.anonId}?lang=${encodeURIComponent(lang || 'en')}`);
        if (!res.ok) throw new Error('Failed to load trial');
        const data = await res.json();
const picked = pickScenarioByLang(data.scenario, lang);
        if (!cancelled) {
          const tTrial = {
            group: data.group,
            groupType: data.groupType,
            scenarioId: data.scenarioId,
             scenario: {
   ...picked,
   scenarios: data.scenario?.scenarios || picked.scenarios, // ✅ שמירה על המפה
},
            startedAt: data.startedAt,
          };
          setTrial(tTrial);
          setFreeAnswer('');
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || 'Init error');
          setLoading(false);
        }
      }
    }
    init();
    return () => { cancelled = true; };
  }, [student?.anonId, paramScenarioId, navState, lang]);

  // 🔹 fallback אם אין startedAt — נשתמש בזמן מלוקאל
  useEffect(() => {
    if (!trial) return;
    if (!trial.startedAt) {
      const lsStart = localStorage.getItem('simStartAtISO');
      const iso = lsStart || new Date().toISOString();
      setTrial(prev => prev ? { ...prev, startedAt: iso } : prev);
    }
  }, [trial]);

  const anonBadge = useMemo(() => (
    <div className={`mt-2 inline-flex items-center gap-2 text-xs px-2 py-1 rounded
      ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
      <span>anonId:</span>
      <code className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>
        {student?.anonId || '—'}
      </code>
    </div>
  ), [student?.anonId, isDark]);

  if (loading) {
    return (
      <div className={`min-h-screen w-screen ${isDark?'bg-slate-800 text-white':'bg-slate-100 text-slate-800'}`} dir={dir}>
        <div className="px-4 pt-4"><AnonymousHeader /></div>
        <div className="p-8 text-center">{t('loading')}</div>
        <div className="px-4 pb-4"><Footer /></div>
      </div>
    );
  }

  if (err || !trial) {
    return (
      <div className={`min-h-screen w-screen ${isDark?'bg-slate-800 text-white':'bg-slate-100 text-slate-800'}`} dir={dir}>
        <div className="px-4 pt-4"><AnonymousHeader /></div>
        <div className="p-8">
          <div className={`max-w-3xl mx-auto rounded p-6 ${isDark?'bg-red-900/20':'bg-red-50'} border ${isDark?'border-red-800':'border-red-200'}`}>
            <div className="font-semibold mb-2">{t('loadFailTitle')}</div>
            <div className="text-sm opacity-80">{err || 'Unknown error'}</div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`mt-4 px-5 py-2 rounded border transition-colors
                ${isDark
                  ? 'bg-slate-700 text-slate-100 border-slate-500 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500'}`}
            >
              {t('loadFailBack')}
            </button>
          </div>
        </div>
        <div className="px-4 pb-4"><Footer /></div>
      </div>
    );
  }

  const { group, groupType, scenario } = trial;
  const reflections = Array.isArray(scenario?.reflection) ? scenario.reflection : [];

  const onSubmit = async () => {
    try {
      if (!student?.anonId) {
        alert('Missing student ID.');
        return;
      }
      setSubmitting(true);

      const payload = { answers: [freeAnswer?.trim() || ''] };

      // שלב 1: ניתוח AI
      const response1 = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId: student.anonId,
          situation: scenario?.text || '',
          question: reflections.join(' ') || '',
          answerText: freeAnswer?.trim() || '',
        }),
      });

      const data1 = await response1.json();
      if (!response1.ok) {
        throw new Error(data1?.message || 'AI analysis failed');
      }
      console.log('✅ AI analysis result:', data1.analysisResult);

      // שלב 2: סימון סיום ניסוי
      await fetch('/api/trial/finish', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId: student.anonId,
          answers: payload.answers,
        }),
      });

      const g = String(trial?.group || '').toUpperCase();
      const showSocratic = ['A', 'B', 'C'].includes(g);

      navigate('/simulation/analysis', {
        state: { anonId: student.anonId, showSocratic },
      });
    } catch (err) {
      console.error('finish error', err);
      alert('Failed to submit simulation.');
    } finally {
      setSubmitting(false);
    }
  };

  const isContinueDisabled = submitting || freeAnswer.trim().length === 0;

  return (
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`} dir={dir}>
      <div className="px-4 mt-4"><AnonymousHeader /></div>

      <main className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
        <section className={`${isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-800'} p-6 md:p-7 rounded`}>
          <div className="text-sm opacity-80 hidden">
            {/* שמור לשימוש עתידי: group / groupType */}
            {t('groupLabel')} <b>{group}</b> · {groupType === 'control' ? t('control') : t('experimental')}
          </div>

          <div className={`rounded-lg shadow-md p-6 md:p-8 ${isDark ? 'bg-slate-600 border border-slate-500 text-white' : 'bg-white border border-slate-200 text-slate-800'} max-w-5xl mx-auto`}>
            {/* anonId badge */}
            {anonBadge}

            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold">{t('headerTitle')}</h2>
              </div>

              {viewStartAt && (
                <div className={`text-sm font-semibold px-3 py-1 rounded shadow
                    ${isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-800'}`}>
                  ⏱ {mm}:{ss}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="text-lg font-semibold mb-1">{scenario?.title || t('scenarioFallback')}</div>
              <p className={`${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{scenario?.text}</p>
            </div>

            {reflections.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{t('reflectionsTitle')}</h3>
                <ul className={`list-disc ${dir === 'rtl' ? 'me-5' : 'ms-5'} space-y-1 text-sm opacity-90`}>
                  {reflections.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {reflections.length > 0 ? t('writeCombined') : t('yourResponse')}
              </label>
              <textarea
                className={`w-full min-h-[160px] rounded-lg border p-3 text-sm ${
                  isDark ? 'bg-slate-700 border-slate-500' : 'bg-white border-slate-300'
                }`}
                value={freeAnswer}
                onChange={(e) => setFreeAnswer(e.target.value)}
                placeholder={reflections.length > 0 ? t('placeholderCombined') : t('placeholderSingle')}
              />
            </div>

            <div className={`mt-6 flex gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`px-5 py-2 rounded border transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                  ${isDark
                    ? 'bg-slate-700 text-slate-100 border-slate-500 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500'}`}
                disabled={submitting}
              >
                {t('back')}
              </button>

              <button
                onClick={onSubmit}
                className="px-6 py-2 rounded text-white bg-emerald-600 hover:shadow disabled:opacity-60 flex items-center gap-2"
                disabled={isContinueDisabled}
                aria-busy={submitting ? 'true' : 'false'}
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      role="status"
                      aria-label="Loading"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {t('processing')}
                  </>
                ) : (
                  t('continue')
                )}
              </button>
            </div>
          </div>
        </section>
      </main>

      <div className="px-4 pb-4"><Footer /></div>
    </div>
  );
}

export default function Simulation() {
  const outer = useContext(ThemeContext);
  return (
    <ThemeContext.Provider value={outer}>
      <SimulationContent />
    </ThemeContext.Provider>
  );
}
