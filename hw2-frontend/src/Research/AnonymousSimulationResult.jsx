// src/Research/AnonymousSimulationResult.jsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import { ThemeContext, ThemeProvider } from '../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';
import { useLocation, useNavigate } from 'react-router-dom';
import AnswerCard from '../studentPages/AnswerCard';
import SocraticCoach from './SocraticCoach';
import ValidatedQuestionnaireButton from './ValidatedQuestionnaireButton';
import { LanguageContext } from '../context/LanguageContext';
import { translateUI } from '../utils/translateUI';

// Helper
const isExperimental = (g = '') => ['A', 'B', 'C'].includes(String(g).toUpperCase());

const SOURCE = {
  title: 'Simulation Completed Successfully!',
  preparing: 'Preparing your results…',
  back: 'Back',
  groupMetaControl: 'Control',
  groupMetaExp: 'Experimental',
  vqBtn: 'Continue to Validated Questionnaire',
  chatTitle: 'Conversation with Casely 🤖',
  chatLead:
    "Now you’ll begin a short reflection chat with Casely — our Socratic AI coach. Casely will ask you a few gentle questions to help you think about your decisions and emotions during the simulation. There are no right or wrong answers — just be honest and reflective.\n\nWhen you finish your chat, Casely will give you a short personalized summary paragraph. After that, you’ll automatically continue to the validated questionnaire (Post stage).",
  finishToContinue: 'Finish the conversation to continue.',
  missingAnon: 'Missing anonId.',
  failAnalysis: 'Failed to fetch analysis.',
  failTrialMeta: 'Failed to fetch trial meta.',
  couldntLoad: 'Couldn’t load the results',
};

function AnonymousSimulationResultInner() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { lang } = useContext(LanguageContext); // 'he' | 'en'
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const { student } = useStudent?.() || { student: null };
  const navigate = useNavigate();
  const location = useLocation();

  const navShowSocratic = location.state?.showSocratic; // true/false/undefined
  const anonId = location.state?.anonId || student?.anonId || null;

  const [answer, setAnswer] = useState(null);
  const [group, setGroup] = useState('');          // 'A'|'B'|'C'|'D'
  const [groupType, setGroupType] = useState('');  // 'experimental'|'control'
  const [chatCompleted, setChatCompleted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // i18n
  const [T, setT] = useState(SOURCE);
  const t = (k) => T[k] ?? SOURCE[k] ?? k;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (lang !== 'he') {
        if (!cancelled) setT(SOURCE);
        return;
      }
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
    })();
    return () => { cancelled = true; };
  }, [lang]);

  useEffect(() => {
    (async () => {
      try {
        if (!anonId) {
          setErr(t('missingAnon'));
          setLoading(false);
          return;
        }

        // 1) Load latest answer + AI analysis
        const res = await fetch(`/api/latest/${anonId}`);
        if (!res.ok) throw new Error(t('failAnalysis'));
        const data = await res.json();

        const lastAnswerText =
          Array.isArray(data.answers) && data.answers.length
            ? data.answers[data.answers.length - 1]
            : '';

        setAnswer({
          studentId: `Anonymous-${(anonId || '').slice(-4)}`,
          answerText: lastAnswerText,
          analysisResult: data.aiAnalysisJson || {},
          submittedAt: data.endedAt || new Date().toISOString(),
        });

        // 2) Load trial meta (group) — מבקשים לפי שפה
        const resTrial = await fetch(`/api/trial/${anonId}?lang=${encodeURIComponent(lang || 'en')}`);
        if (!resTrial.ok) throw new Error(t('failTrialMeta'));
        const tMeta = await resTrial.json();
        const g = String(tMeta.group || '').toUpperCase();
        setGroup(g);
        setGroupType(tMeta.groupType || (g === 'D' ? 'control' : 'experimental'));
      } catch (e) {
        setErr(e.message || 'Load error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anonId, lang]);

  // Final decision: should we show the Socratic chat?
  const showSocratic = typeof navShowSocratic === 'boolean'
    ? !!navShowSocratic
    : isExperimental(group);

  return (
    <div
      className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
      dir={dir}
    >
      {/* Header */}
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      {/* Main */}
      <main className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
        <section className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 md:p-7 rounded`}>
          <div className={`rounded-lg shadow-md p-6 md:p-8 ${isDark ? 'bg-slate-600 border border-slate-500 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
            <h2 className="text-2xl font-bold mb-2 text-center">{t('title')}</h2>

            {/* קו מידע קבוצה (מוסתר לעת עתה) */}
            <p aria-hidden="true" className="hidden text-center text-sm opacity-80 mb-6">
              Group <b>{group || '—'}</b> · {groupType === 'control' ? t('groupMetaControl') : t('groupMetaExp')}
            </p>

            {loading && (
              <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
                <div
                  className={`w-10 h-10 border-4 rounded-full animate-spin
                    ${isDark ? 'border-white/30 border-t-white' : 'border-slate-300 border-t-blue-600'}`}
                  aria-label="Loading"
                />
                <p className="mt-3 text-sm opacity-80">{t('preparing')}</p>
              </div>
            )}

            {err && (
              <div className={`text-center mb-4 p-4 rounded ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                <div className="mb-3 font-medium text-red-600 dark:text-red-300">{t('couldntLoad')}</div>
                <div className="text-sm opacity-80">{err}</div>
                <button onClick={() => navigate('/study/home')} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">
                  {t('back')}
                </button>
              </div>
            )}

            {/* Analysis card */}
            {!loading && !err && answer && (
              <div className="w-full">
                <AnswerCard answer={answer} isDark={isDark} />
              </div>
            )}

            {/* CONTROL (D): Button only */}
            {!loading && !err && !showSocratic && (
              <div className="mt-6">
                <ValidatedQuestionnaireButton
                  anonId={anonId}
                  label={t('vqBtn')}
                />
              </div>
            )}

            {/* EXPERIMENTAL (A/B/C): Socratic chat → then button */}
            {!loading && !err && showSocratic && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">{t('chatTitle')}</h3>
                <p className="text-sm opacity-80 mb-4 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                  {t('chatLead')}
                </p>

                <SocraticCoach
                  anonId={anonId}
                  situation={answer?.analysisResult?.situation || location.state?.situation}
                  question={answer?.analysisResult?.question || location.state?.question}
                  analysisText={answer?.analysisResult ? JSON.stringify(answer.analysisResult) : ''}
                  onComplete={() => setChatCompleted(true)}
                />

                {chatCompleted && (
                  <ValidatedQuestionnaireButton
                    anonId={anonId}
                    label={t('vqBtn')}
                    extraState={{ chatCompleted: true }}
                  />
                )}

                {!chatCompleted && (
                  <p className="mt-2 text-xs opacity-70">
                    {t('finishToContinue')}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}

export default function AnonymousSimulationResult() {
  return (
    <ThemeProvider>
      <AnonymousSimulationResultInner />
    </ThemeProvider>
  );
}
