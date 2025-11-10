// src/Research/assessment/AssessmentContainer.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { CATEGORIES, SCALE, CATEGORIES_HE, SCALE_HE } from './CASEL.constants';
import QuestionnaireIntro from './QuestionnaireIntro';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import ScaleButtons from './ScaleButtons';
import ResultsView from './ResultsView';
import { useAnonymousStudent as useStudent } from '../../context/AnonymousStudentContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import { translateUI } from '../../utils/translateUI';

export default function AssessmentContainer({ onFinish, phase: propPhase }) {
  const navigate = useNavigate();
  const location = useLocation();
  const phase = location.state?.phase || propPhase || 'pre';

  // language + theme
  const { lang } = useContext(LanguageContext); // 'he' | 'en'
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  // ---- i18n (מקור באנגלית בלבד) ----
  const SOURCE = {
    checkingStatus: 'Checking status…',
    preAlready: 'You have already completed the PRE questionnaire. No need to fill it again.',
    postAlready: 'You have already completed the POST questionnaire. Thank you for your participation!',
    preCompleteTitle: 'PRE Assessment Complete',
    postCompleteTitle: 'POST Assessment Complete',
    continueToSimulation: 'Continue to Simulation',
    backToHome: 'Back to Home',
    goToFinalReflection: 'Go to Final Reflection',
    goToSummary: 'Go to Summary',
    savedSecurely: 'Your responses have been securely saved.',
    loadingQuestionnaire: 'Loading questionnaire…',
    couldntLoad: "Couldn't load the questionnaire",
    noItemsFound: 'No items found.',
    retry: 'Retry',
    previous: 'Previous',
    next: 'Next',
    tooFast: 'You\'re going too fast — please slow down 🙂',     // NEW
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
    return () => { cancelled = true; };
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Context + Assignment ---
  const { student, setStudent, questionnaire: ctxQuestionnaire, loadQuestionnaire } = useStudent();

  // Pull assignment (do not assign here)
  const lsAsg = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('assignment') || 'null'); } catch { return null; }
  }, []);
  const assignment = useMemo(() => student?.assignment || lsAsg || null, [student, lsAsg]);

  // --- Phase status guard (PRE/POST already completed?) ---
  const [statusChecked, setStatusChecked] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [doneNotice, setDoneNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!student?.anonId) { setStatusChecked(true); return; }
      try {
        const r = await fetch(
          `/api/assessments/status?anonId=${encodeURIComponent(student.anonId)}&phase=${encodeURIComponent(phase)}`
        );
        const s = r.ok ? await r.json() : { completed: false };
        if (cancelled) return;
        if (s.completed) {
          setAlreadyDone(true);
          setDoneNotice(phase === 'pre' ? t('preAlready') : t('postAlready'));
        }
      } catch {
        // If status check fails, we allow proceeding; server will still enforce on save.
      } finally {
        if (!cancelled) setStatusChecked(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.anonId, phase, lang, T]);

  // --- Questionnaire state ---
  const [loading, setLoading] = useState(!(ctxQuestionnaire?.items?.length));
  const [loadErr, setLoadErr] = useState('');
  const [questionnaire, setQuestionnaire] = useState(ctxQuestionnaire || null);
  const QUESTIONS = questionnaire?.items || [];

  const CAT = useMemo(
    () => (questionnaire?.lang === 'he' || lang === 'he') ? CATEGORIES_HE : CATEGORIES,
    [questionnaire?.lang, lang]
  );

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [canNext, setCanNext] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [startTime, setStart] = useState(null);
  const [endTime, setEnd] = useState(null);

  const total = QUESTIONS.length;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = useMemo(() => (answeredCount / Math.max(1, total)) * 100, [answeredCount, total]);
  const currentDisplay = Math.min(current + 1, Math.max(1, total));

  // ---------- Anti-spam/lock refs ----------
  const inputLockRef = React.useRef(false);
  const lastKeyAtRef = React.useRef(0);
  const advanceTmoRef = React.useRef(null);
  const hintTmoRef = React.useRef(null);

  // טווחים מומלצים (אפשר לכוון לפי UX)
  const MIN_KEY_GAP_MS = 220;
  const TRANSITION_LOCK_MS = 260;

  // הודעת נימוס כשמתעלמים מקלט מהיר
  const [showHint, setShowHint] = useState(false);
  const nudge = () => {
    setShowHint(true);
    window.clearTimeout(hintTmoRef.current);
    hintTmoRef.current = window.setTimeout(() => setShowHint(false), 1200);
  };

  // --- Load questionnaire (prefer context) ---
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setLoadErr('');
        const hasCtx = !!(ctxQuestionnaire?.items?.length);
        const sameLang = ctxQuestionnaire?.lang === lang;

        if (hasCtx && sameLang) {
          if (!canceled) {
            setQuestionnaire(ctxQuestionnaire);
            setLoading(false);
          }
          return;
        }

        setLoading(true);
        const data = await loadQuestionnaire({ lang });
        if (!canceled) setQuestionnaire(data);
      } catch (e) {
        if (!canceled) setLoadErr(e.message || 'Load error');
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => { canceled = true; };
  }, [ctxQuestionnaire, loadQuestionnaire, lang]);

  // --- Timers ---
  useEffect(() => { if (!showIntro && !startTime) setStart(Date.now()); }, [showIntro, startTime]);
  useEffect(() => {
    setFadeIn(false);
    const tmo = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(tmo);
  }, [current]);

  // --- Answer logic ---
  const q = QUESTIONS[current];
  const options = q?.options?.length
    ? q.options
    : ((questionnaire?.lang === 'he' || lang === 'he') ? SCALE_HE : SCALE);

  // Key handler with debouncing/locking
  useEffect(() => {
    const onKey = (e) => {
      if (showIntro || isComplete) return;

      if (e.repeat) { nudge(); return; }                 // מתעלמים ממקש שמוחזק
      if (inputLockRef.current) { nudge(); return; }     // בתקופת מעבר
      const now = Date.now();
      if (now - lastKeyAtRef.current < MIN_KEY_GAP_MS) { nudge(); return; }
      lastKeyAtRef.current = now;

      const valid = (options || []).map(o => String(o.value));

      if (valid.includes(e.key)) {
        handleAnswer(parseInt(e.key, 10));
        return;
      }

      if (e.key === 'ArrowLeft' && current > 0) {
        inputLockRef.current = true;
        setCanNext(true);
        setCurrent(c => c - 1);
        window.clearTimeout(advanceTmoRef.current);
        advanceTmoRef.current = window.setTimeout(() => {
          inputLockRef.current = false;
        }, TRANSITION_LOCK_MS);
      }

      if (e.key === 'ArrowRight' && canNext && current < QUESTIONS.length - 1) {
        inputLockRef.current = true;
        setCanNext(false);
        setCurrent(c => c + 1);
        window.clearTimeout(advanceTmoRef.current);
        advanceTmoRef.current = window.setTimeout(() => {
          inputLockRef.current = false;
        }, TRANSITION_LOCK_MS);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showIntro, isComplete, current, QUESTIONS.length, options, canNext]);

  const handleAnswer = (val) => {
    if (inputLockRef.current) { nudge(); return; }
    inputLockRef.current = true;
    window.clearTimeout(advanceTmoRef.current);

    setAnswers(prev => ({ ...prev, [current]: val }));
    setCanNext(false);

    const delay = quickMode ? 200 : 350;

    if (current < QUESTIONS.length - 1) {
      advanceTmoRef.current = window.setTimeout(() => {
        setCurrent(c => c + 1);
        window.setTimeout(() => { inputLockRef.current = false; }, TRANSITION_LOCK_MS);
      }, delay);
    } else {
      setEnd(Date.now());
      advanceTmoRef.current = window.setTimeout(() => {
        setIsComplete(true);
        window.setTimeout(() => { inputLockRef.current = false; }, TRANSITION_LOCK_MS);
      }, delay);
    }
  };

  // --- Results ---
  const calcResults = () => {
    const bucket = {};
    QUESTIONS.forEach((qi, i) => {
      const v = answers[i];
      if (!bucket[qi.category]) bucket[qi.category] = { total: 0, count: 0, max: 0 };
      const localMax = (Array.isArray(qi.options) && qi.options.length)
        ? Math.max(...qi.options.map(o => Number(o.value)))
        : 4;
      bucket[qi.category].max = Math.max(bucket[qi.category].max, localMax);
      if (v != null) {
        bucket[qi.category].total += Number(v);
        bucket[qi.category].count += 1;
      }
    });
    return Object.entries(bucket).map(([category, { total, count, max }]) => ({
      category,
      score: count ? (total / (count * (max || 4))) * 100 : 0,
      average: count ? (total / count).toFixed(1) : 0,
    }));
  };

  // --- Save on complete (handles 409 gracefully) ---
  useEffect(() => {
    if (!isComplete || !questionnaire?._id) return;
    (async () => {
      try {
        const resp = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            anonId: student?.anonId,
            questionnaireId: questionnaire._id,
            version: questionnaire.version,
            lang: questionnaire.lang,
            phase,
            startedAt: startTime,
            endedAt: endTime,
            answers: QUESTIONS.map((item, idx) => ({
              questionKey: item.key,
              value: answers[idx] ?? null,
            })),
          }),
        });

        if (resp.status === 409) {
          setAlreadyDone(true);
          setDoneNotice(phase === 'pre' ? t('preAlready') : t('postAlready'));
          return;
        }

        if (!resp.ok) throw new Error('Save failed');

        try { localStorage.setItem('lastAssessmentPhase', String(phase || 'pre')); } catch {}
      } catch (e) {
        console.error('Save assessment failed:', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, lang, T]);

  // ניקוי טיימרים ביציאה
  useEffect(() => {
    return () => {
      window.clearTimeout(advanceTmoRef.current);
      window.clearTimeout(hintTmoRef.current);
      inputLockRef.current = false;
    };
  }, []);

  // ----------------------------
  // Render guard based on status
  // ----------------------------

  // Wait until status check finished
  if (!statusChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        dir={dir}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">{t('checkingStatus')}</p>
        </div>
      </div>
    );
  }

  // If already completed, show an enhanced friendly message
  if (alreadyDone) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
        }`}
        dir={dir}
      >
        <div className="w-full max-w-2xl">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
              }`}
            >
              <svg
                className={`w-10 h-10 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {phase === 'pre' ? t('preCompleteTitle') : t('postCompleteTitle')}
            </h2>
          </div>

          {/* Message Card */}
          <div
            className={`rounded-2xl shadow-2xl p-8 border-2 transition-all ${
              isDark
                ? 'bg-slate-800 border-emerald-500/30 shadow-emerald-500/10'
                : 'bg-white border-emerald-200 shadow-emerald-100'
            }`}
          >
            <div className={`text-center mb-6 ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
              <p className="text-lg leading-relaxed font-medium">{doneNotice}</p>
            </div>

            {/* Divider */}
            <div className={`my-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}></div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {phase === 'pre' ? (
                assignment?.scenarioId ? (
                  <button
                    onClick={() =>
                      navigate(`/simulation/${assignment.scenarioId}`, {
                        state: {
                          group: assignment.group,
                          groupType: assignment.groupType,
                          scenario: assignment.scenario,
                        },
                      })
                    }
                    className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>{t('continueToSimulation')}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/')}
                    className={`px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ${
                      isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    {t('backToHome')}
                  </button>
                )
              ) : (
                <button
                  onClick={() => {
                    const group = assignment?.group?.toUpperCase?.();
                    if (['A', 'B', 'C'].includes(group)) {
                      navigate('/reflection-end');
                    } else {
                      navigate('/thanks');
                    }
                  }}
                  className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>
                    {['A', 'B', 'C'].includes(assignment?.group?.toUpperCase?.())
                      ? t('goToFinalReflection')
                      : t('goToSummary')}
                  </span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>

            {/* Additional Info */}
            <div className={`mt-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <p>{t('savedSecurely')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------
  // Normal questionnaire rendering
  // ----------------------------

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        dir={dir}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">{t('loadingQuestionnaire')}</p>
        </div>
      </div>
    );
  }

  if (loadErr || !questionnaire || QUESTIONS.length === 0) {
    return (
      <div className="min-h-[40vh] grid place-items-center" dir={dir}>
        <div className={`rounded-xl p-6 border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
          <div className="font-bold mb-2">{t('couldntLoad')}</div>
          <div className="text-sm mb-4">{loadErr || t('noItemsFound')}</div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-slate-800 text-white">
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  // Intro screen
  if (showIntro) {
    return (
      <div className={`min-h-screen p-8 ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'}`} dir={dir}>
        <div className="max-w-3xl mx-auto">
          <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
            <QuestionnaireIntro
              CATEGORIES={CAT}
              quickMode={quickMode}
              setQuickMode={setQuickMode}
              onStart={() => setShowIntro(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isComplete) {
    const results = calcResults();
    const secs = startTime && endTime ? Math.round((endTime - startTime) / 1000) : null;
    const completionTime = secs ? (secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`) : null;

    return (
      <ResultsView
        results={results}
        completionTime={completionTime}
        onRestart={() => {
          setCurrent(0);
          setAnswers({});
          setIsComplete(false);
          setShowIntro(true);
          setStart(null);
          setEnd(null);
        }}
        onFinish={async () => {
          setStudent(s => ({ ...(s || {}), assessmentStatus: 'submitted' }));
          if (phase === 'pre' && assignment?.scenarioId) {
            navigate(`/simulation/${assignment.scenarioId}`, {
              state: {
                group: assignment.group,
                groupType: assignment.groupType,
                scenario: assignment.scenario,
              },
            });
          } else if (typeof onFinish === 'function') {
            onFinish();
          }
        }}
      />
    );
  }

  // Main questionnaire view
  return (
<div className="min-h-screen bg-transparent px-4 md:px-8 lg:px-12 py-6" dir={dir}>    {/* polite hint */}
{showHint && (
  <div
    className={`pointer-events-none absolute bottom-6 ${lang === 'he' ? 'left-24' : 'right-24'}
                rounded-lg px-4 py-2 shadow border z-40
                ${isDark ? 'bg-slate-700 text-slate-100 border-slate-600'
                         : 'bg-white text-slate-800 border-slate-200'}`}
    dir={dir}
    role="status"
    aria-live="polite"
  >
    {t('tooFast')}
  </div>
)}


      <div className="w-full max-w-[96vw] mx-auto">
        <ProgressBar
          progress={progress}
          quickMode={quickMode}
          current={currentDisplay}
          total={total}
          answered={answeredCount}
          isDark={isDark}
        />

        <div
          className={`rounded-xl shadow-md p-8 md:p-10 mb-6 border
          ${isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
        >
          <QuestionCard question={q} CATEGORIES={CAT} />
          <ScaleButtons options={options} selected={answers[current]} onSelect={handleAnswer} />
        </div>

        <div className={`flex justify-between items-center ${lang === 'he' ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => {
              if (inputLockRef.current) { nudge(); return; }
              inputLockRef.current = true;
              setCanNext(true);
              setCurrent(c => Math.max(0, c - 1));
              window.clearTimeout(advanceTmoRef.current);
              advanceTmoRef.current = window.setTimeout(() => {
                inputLockRef.current = false;
              }, TRANSITION_LOCK_MS);
            }}
            disabled={current === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium hover:shadow disabled:opacity-40
              ${isDark ? 'bg-slate-700 border border-slate-500 text-white' : 'bg-white border border-slate-300 text-slate-700'}`}
          >
            {t('previous')}
          </button>

          {canNext && current < QUESTIONS.length - 1 && (
            <button
              onClick={() => {
                if (inputLockRef.current) { nudge(); return; }
                inputLockRef.current = true;
                setCanNext(false);
                setCurrent(c => c + 1);
                window.clearTimeout(advanceTmoRef.current);
                advanceTmoRef.current = window.setTimeout(() => {
                  inputLockRef.current = false;
                }, TRANSITION_LOCK_MS);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 text-white font-semibold hover:shadow"
            >
              {t('next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
