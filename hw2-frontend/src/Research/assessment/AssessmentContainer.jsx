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
import { useI18n } from '../../utils/i18n';

export default function AssessmentContainer({ onFinish, phase: propPhase }) {
  const navigate = useNavigate();
  const location = useLocation();
  const phase = location.state?.phase || propPhase || 'pre';

  // language + theme
  const { lang } = useContext(LanguageContext); // 'he' | 'en'
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const isRTL = lang === 'he';
  const { t, dir } = useI18n('assessment');

  // --- Context + Assignment ---
  const { student, setStudent, questionnaire: ctxQuestionnaire, loadQuestionnaire } = useStudent();

  // Pull assignment (do not assign here)
  const lsAsg = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('assignment') || 'null'); } catch { return null; }
  }, []);
  const assignment = useMemo(() => student?.assignment || lsAsg || null, [student, lsAsg]);

  // --- Phase status guard ---
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
        // allow proceeding; server enforces on save
      } finally {
        if (!cancelled) setStatusChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [student?.anonId, phase, t]);

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
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [startTime, setStart] = useState(null);
  const [endTime, setEnd] = useState(null);

  // phase flags
const isQuestionPhase = !showIntro && !isComplete && !alreadyDone && !showFinishModal; 
  const total = QUESTIONS.length;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = useMemo(() => (answeredCount / Math.max(1, total)) * 100, [answeredCount, total]);
  const currentDisplay = Math.min(current + 1, Math.max(1, total));

  // ---------- Anti-spam/locks ----------
  const inputLockRef = React.useRef(false);
  const lastKeyAtRef = React.useRef(0);
  const advanceTmoRef = React.useRef(null);
  const hintTmoRef = React.useRef(null);
  const justCompletedAtRef = React.useRef(0);

  // אחרי סיום: מגן קצר + Focus trap
  const [shieldOn, setShieldOn] = useState(false);
  const resultsFocusTrapRef = React.useRef(null);

  // שמירה אידמפוטנטית
  const saveOnceRef = React.useRef(false);
  const [saveErr, setSaveErr] = useState('');

  const MIN_KEY_GAP_MS = 220;
  const TRANSITION_LOCK_MS = 260;

  // polite hint
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

  // --- Keyboard handler: ONLY during questions ---
  useEffect(() => {
    if (!isQuestionPhase) return;

    const onKey = (e) => {
      const key = (e.key || '').toLowerCase();
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;

      // block refresh/nav keys during questions
      if ((e.ctrlKey || e.metaKey) && key === 'r') { e.preventDefault(); return; }
      if (key === 'f5') { e.preventDefault(); return; }
      if (e.altKey && (key === 'arrowleft' || key === 'arrowright')) { e.preventDefault(); return; }
      if (key === 'backspace' && !inInput) { e.preventDefault(); return; }
      if (key === 'enter' || key === ' ') { e.preventDefault(); }

      if (e.repeat) { nudge(); return; }
      if (inputLockRef.current) { nudge(); return; }

      const now = Date.now();
      if (now - lastKeyAtRef.current < MIN_KEY_GAP_MS) { nudge(); return; }
      lastKeyAtRef.current = now;

      const valid = (options || []).map(o => String(o.value));

      if (valid.includes(e.key)) {
        e.preventDefault();
        handleAnswer(parseInt(e.key, 10));
        return;
      }

      if (e.key === 'ArrowLeft' && current > 0) {
        e.preventDefault();
        inputLockRef.current = true;
        setCanNext(true);
        setCurrent(c => c - 1);
        window.clearTimeout(advanceTmoRef.current);
        advanceTmoRef.current = window.setTimeout(() => {
          inputLockRef.current = false;
        }, TRANSITION_LOCK_MS);
      }

      if (e.key === 'ArrowRight' && canNext && current < QUESTIONS.length - 1) {
        e.preventDefault();
        inputLockRef.current = true;
        setCanNext(false);
        setCurrent(c => c + 1);
        window.clearTimeout(advanceTmoRef.current);
        advanceTmoRef.current = window.setTimeout(() => {
          inputLockRef.current = false;
        }, TRANSITION_LOCK_MS);
      }
    };

    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isQuestionPhase, current, QUESTIONS.length, options, canNext]);

  // --- Short shield after finishing (prevents spillover) ---
  useEffect(() => {
    if (!shieldOn) return;

    const stopKeys = (e) => {
      const k = (e.key || '').toLowerCase();
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;

      if (
        k === 'f5' ||
        ((e.ctrlKey || e.metaKey) && k === 'r') ||
        (e.altKey && (k === 'arrowleft' || k === 'arrowright')) ||
        k === 'enter' || k === ' ' ||
        (k === 'backspace' && !inInput)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const stopClick = (e) => { e.preventDefault(); e.stopPropagation(); };

    window.addEventListener('keydown', stopKeys, true);
    window.addEventListener('keyup', stopKeys, true);
    window.addEventListener('click', stopClick, true);

    const t = setTimeout(() => setShieldOn(false), 2000);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', stopKeys, true);
      window.removeEventListener('keyup', stopKeys, true);
      window.removeEventListener('click', stopClick, true);
    };
  }, [shieldOn]);

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
      justCompletedAtRef.current = Date.now();
      try { document.activeElement?.blur?.(); } catch {}
    advanceTmoRef.current = window.setTimeout(() => {
      setShowFinishModal(true);
      // נשאיר את הנעילה פעילה עד שהמשתמש ילחץ במודל
   }, delay);
    }
  };

  // --- Results aggregation ---
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

  // --- Save on complete (idempotent) ---
  useEffect(() => {
    if (!isComplete) return;
    if (!questionnaire?._id) return;
    if (saveOnceRef.current) return;

    const anonId = student?.anonId;
    if (!anonId || !Array.isArray(QUESTIONS) || QUESTIONS.length === 0) return;

    const startedAt = startTime ?? Date.now();
    const endedAt   = endTime   ?? Date.now();
    const idemKey = `${anonId}|${phase}|${questionnaire._id}|v${questionnaire.version}`;

    saveOnceRef.current = true;
    setSaveErr('');

    const ctrl = new AbortController();

    (async () => {
      try {
        const payload = {
          anonId,
          questionnaireId: questionnaire._id,
          version: questionnaire.version,
          lang: questionnaire.lang,
          phase,
          startedAt,
          endedAt,
          answers: QUESTIONS.map((item, idx) => ({
            questionKey: item.key,
            value: answers[idx] ?? null,
          })),
        };

        const resp = await fetch('/api/assessments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idemKey,
          },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
        });

        if (resp.status === 409) {
          setAlreadyDone(true);
          setDoneNotice(phase === 'pre' ? t('preAlready') : t('postAlready'));
          return;
        }

        if (resp.status === 400) {
          let msg = 'Bad Request';
          try { const j = await resp.json(); msg = j?.error || msg; } catch {}
          setSaveErr(msg);
          console.error('[assessment] 400:', msg);
          return;
        }

        if (!resp.ok) {
          let msg = `Save failed (${resp.status})`;
          try { const j = await resp.json(); msg = j?.error || msg; } catch {}
          setSaveErr(msg);
          console.error('[assessment] save error:', msg);
          return;
        }

        try { localStorage.setItem('lastAssessmentPhase', String(phase || 'pre')); } catch {}
      } catch (e) {
        if (e?.name !== 'AbortError') {
          setSaveErr(e?.message || 'Save error');
          console.error('[assessment] exception:', e);
        }
      }
    })();

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, questionnaire?._id]);

  // cleanup
  useEffect(() => {
    return () => {
      window.clearTimeout(advanceTmoRef.current);
      window.clearTimeout(hintTmoRef.current);
      inputLockRef.current = false;
    };
  }, []);

  // Focus trap on results/AlreadyDone (prevents Enter/Space hitting the main button)
  useEffect(() => {
    if (isComplete || alreadyDone) {
      try { resultsFocusTrapRef.current?.focus?.(); } catch {}
    }
  }, [isComplete, alreadyDone]);
// --- חוסם קלט (מקלדת/עכבר/גלילה/מגע) כשחלון הסיום פתוח ---
useEffect(() => {
  if (!showFinishModal) return;
  const stop = (e) => {
    // לא לחסום קליקים בתוך המודל
    if (e.type === 'click' || e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'touchstart' || e.type === 'touchmove') {
      const inside = (e.target && typeof e.target.closest === 'function')
        ? e.target.closest('#finishModalRoot')
        : null;
      if (inside) return; // לא חוסמים בתוך המודל
    }
    e.preventDefault();
    e.stopPropagation();
  };  const opts = { capture: true, passive: false };
  window.addEventListener('keydown', stop, opts);
  window.addEventListener('keyup', stop, opts);
  window.addEventListener('keypress', stop, opts);
  window.addEventListener('click', stop, opts);
  window.addEventListener('mousedown', stop, opts);
  window.addEventListener('mouseup', stop, opts);
  window.addEventListener('wheel', stop, opts);
  window.addEventListener('touchstart', stop, opts);
  window.addEventListener('touchmove', stop, opts);
  window.addEventListener('contextmenu', stop, opts);
  return () => {
    window.removeEventListener('keydown', stop, opts);
    window.removeEventListener('keyup', stop, opts);
    window.removeEventListener('keypress', stop, opts);
    window.removeEventListener('click', stop, opts);
    window.removeEventListener('mousedown', stop, opts);
    window.removeEventListener('mouseup', stop, opts);
    window.removeEventListener('wheel', stop, opts);
    window.removeEventListener('touchstart', stop, opts);
    window.removeEventListener('touchmove', stop, opts);
    window.removeEventListener('contextmenu', stop, opts);
  };
}, [showFinishModal]);

  // ----------------------------
  // Render guard based on status
  // ----------------------------

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

  // Already completed screen
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
          <div tabIndex={-1} ref={resultsFocusTrapRef}
               style={{ position: 'fixed', opacity: 0, pointerEvents: 'none' }} />
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

            <div className={`my-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}></div>

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
      <>
        <div tabIndex={-1} ref={resultsFocusTrapRef}
             style={{ position: 'fixed', opacity: 0, pointerEvents: 'none' }} />
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
            saveOnceRef.current = false; // allow new save
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
      </>
    );
  }

  // Main questionnaire view
  return (
    <div className="min-h-screen bg-transparent px-4 md:px-8 lg:px-12 py-6" dir={dir}>
    {/* Finish Modal */}
      {showFinishModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* שכבת כיסוי */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          {/* תוכן החלון */}
            <div id="finishModalRoot"
       className={`relative z-[101] w-full max-w-lg rounded-2xl p-6 border shadow-2xl
                           ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center
                               ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">
              {t('finishModal.title') /* למשל: "סיימת את השאלון!" */}
            </h3>
            <p className={`text-center mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {(t('finishModal.body', { count: total }) || t('finishModal.body'))
                .replace(/\{\{\s*count\s*\}\}/g, String(total))}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  // סגירת המודל והצגת התוצאות (החסימות יוסרו באפקט)
                  setShowFinishModal(false);
                  setIsComplete(true);
                  // שחרור נעילה אם נותרה
                  inputLockRef.current = false;
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
              >
                {t('finishModal.cta') /* למשל: "צפייה בתוצאות" */}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* polite hint */}


      <div className="w-full max-w-[96vw] mx-auto">
        {/* optional: show save error if exists */}
        {saveErr && (
          <div className={`mb-3 rounded-lg px-4 py-2 border text-sm
                           ${isDark ? 'bg-red-900/30 border-red-700 text-red-200'
                                    : 'bg-red-50 border-red-300 text-red-800'}`}>
            {t('saveFailed') || 'Save failed'}: {saveErr}
          </div>
        )}

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

        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        
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
{showHint && (
  <div className="mt-6 w-full text-center" role="status" aria-live="polite">
    <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
      {t('tooFast')}
    </span>
  </div>
)}
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
