import React, { useContext, useMemo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';

// 🔹 i18n חדש (מקומי)
import { LanguageContext } from '../context/LanguageContext';
import { useI18n } from '../utils/i18n'; // ⬅️ במקום translateUI

function AssignmentConfirmContent() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const { lang } = useContext(LanguageContext);
  const isRTL = lang === 'he';
  const { t } = useI18n('assignmentConfirm'); // ✅ שימוש בתרגום מקומי

  const locationAsg = useLocation().state?.assignment;
  const { student, setStudent } =
    (typeof useStudent === 'function' ? useStudent() : { student: null, setStudent: () => {} });

  const lsAsg = (() => {
    try { return JSON.parse(localStorage.getItem('assignment') || 'null'); } catch { return null; }
  })();
  const assignment = locationAsg || student?.assignment || lsAsg || null;

  // בוחרים את גרסת הסנריו לפי השפה (he/en)
  const selectedScenario = useMemo(() => {
    const sc = assignment?.scenarios;
    if (!sc) return null;
    return lang === 'he' ? (sc.he || sc.en) : (sc.en || sc.he);
  }, [assignment, lang]);

  useEffect(() => {
    if (assignment) {
      const enriched = { ...assignment, scenario: selectedScenario };
      try { localStorage.setItem('assignment', JSON.stringify(enriched)); } catch {}
      const prev = student?.assignment;
      const changed =
        !prev ||
        prev.scenarioId !== enriched.scenarioId ||
        (prev.scenario?.version !== enriched.scenario?.version) ||
        (prev.scenario?.title !== enriched.scenario?.title);
      if (changed) {
        setStudent?.((s) => ({ ...(s || {}), assignment: enriched }));
      }
    }
  }, [assignment, setStudent, student, selectedScenario]);

  // ✅ שומרים על אותו מבנה עיצובי ולוגי
  const anonBadge = useMemo(
    () => (
      <div
        className={`mt-2 inline-flex items-center gap-2 text-xs px-2 py-1 rounded
        ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}`}
      >
        <span>anonId:</span>
        <code className={`${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
          {student?.anonId || '—'}
        </code>
      </div>
    ),
    [student?.anonId, isDark]
  );

  const Num = ({ n, accent = 'emerald' }) => (
    <div
      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold
      ${isDark ? `bg-${accent}-700 text-white` : `bg-${accent}-600 text-white`}`}
    >
      {n}
    </div>
  );

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
    >
      {/* HEADER */}
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      {/* BODY */}
      <main className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
        <section className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 md:p-7 rounded`}>
          {/* card */}
          <div
            className={`rounded-lg shadow-md p-6 md:p-8 ${
              isDark ? 'bg-slate-600 border border-slate-500 text-white' : 'bg-white border border-slate-200 text-slate-800'
            } max-w-7xl mx-auto`}
          >
            {anonBadge}

            {!assignment ? (
              <>
                <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-2">{t('noAssignmentTitle')}</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
                  {t('noAssignmentBody')}
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className={`px-6 py-3 rounded-xl font-semibold border text-sm
                    ${isDark
                      ? 'border-slate-400 text-white bg-slate-700 hover:shadow'
                      : 'border-slate-300 text-slate-700 bg-white hover:shadow'}`}
                >
                  {t('back')}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mt-3 mb-3">{t('summaryTitle')}</h2>

                <div
                  className={`rounded-xl border p-6 mb-8 text-sm md:text-base
                    ${
                      assignment.groupType === 'control'
                        ? (isDark ? 'bg-slate-900/20 border-slate-600' : 'bg-slate-50 border-slate-200')
                        : (isDark ? 'bg-emerald-900/20 border-emerald-600' : 'bg-emerald-50 border-emerald-200')
                    }`}
                >
                  <div className="text-xl font-bold mb-4">{t('journeyTitle')}</div>

                  {assignment.groupType !== 'control' ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div className="flex gap-3" key={n}>
                          <Num n={n} accent="emerald" />
                          <div>
                            <div className="font-semibold mb-1">{t(`step${n}_title_exp`)}</div>
                            <div className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                              {t(`step${n}_body_exp`)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((n) => (
                        <div className="flex gap-3" key={n}>
                          <Num n={n} accent="slate" />
                          <div>
                            <div className="font-semibold mb-1">{t(`step${n}_title_ctrl`)}</div>
                            <div className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                              {t(`step${n}_body_ctrl`)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={`mt-5 pt-4 border-t text-sm ${isDark ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-600'}`}>
                    <b>{t('importantLead')}</b> {t('importantBody')}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className={`w-full sm:w-auto px-6 py-2 rounded-xl font-semibold border text-sm
                      ${isDark ? 'border-slate-400 text-white bg-slate-700 hover:shadow'
                               : 'border-slate-300 text-slate-700 bg-white hover:shadow'}`}
                  >
                    {t('back')}
                  </button>

                  <button
                    onClick={() => {
                      const enriched = { ...assignment, scenario: selectedScenario };
                      setStudent?.((s) => ({ ...(s || {}), assignment: enriched }));
                      try { localStorage.setItem('assignment', JSON.stringify(enriched)); } catch {}
                      navigate('/validated-questionnaire', { state: { phase: 'pre', fromAssignment: true } });
                    }}
                    className="w-full sm:w-auto px-6 py-2 rounded-xl font-semibold text-white bg-emerald-600 hover:shadow text-sm"
                  >
                    {t('confirmContinue')}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}

export default function AssignmentConfirm() {
  const outer = useContext(ThemeContext);
  return (
    <ThemeContext.Provider value={outer}>
      <AssignmentConfirmContent />
    </ThemeContext.Provider>
  );
}
