// src/Research/SocraticReflectionFeedback.jsx
import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { useNavigate } from 'react-router-dom';
import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';

// ✅ i18n
import { useI18n } from '../utils/i18n';

export default function SocraticReflectionEnd() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { student } = useStudent?.() || { student: null };
  const anonId = student?.anonId || null;
  const navigate = useNavigate();

  // ---- i18n ----
  const { t, dir, lang: langAttr, ready } = useI18n('socraticReflectionFeedback');

  const [answers, setAnswers] = useState({ insight: '', usefulness: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = (e) =>
    setAnswers({ ...answers, [e.target.name]: e.target.value });

  // Save final reflection to DB, then navigate to /thanks
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setErr('');
      if (!anonId) throw new Error('missing_anonId');

      const res = await fetch('/api/trial/final-reflection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonId,
          insight: answers.insight,
          usefulness: answers.usefulness
        })
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'save_failed');
      }

      navigate('/thanks');
    } catch (e) {
      setErr(
        e.message === 'missing_anonId'
          ? t('errMissing')
          : t('errSave')
      );
    } finally {
      setSaving(false);
    }
  };

  // מונע הבהוב לפני טעינת המילון
  if (!ready) return null;

  // helper קצר להזחה לוגית לפי כיוון
  const offsetClass = dir === 'rtl' ? 'pr-11' : 'pl-11';

  return (
    <div
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
      }`}
      dir={dir}
      lang={langAttr}
    >
      {/* HEADER */}
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      {/* BODY */}
      <main className="flex-1 w-full px-3 md:px-5 lg:px-6 py-6">
        <section
          className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 md:p-7 rounded`}
        >
          <div
            className={`rounded-lg shadow-md p-6 md:p-8 ${
              isDark ? 'bg-slate-600' : 'bg-white'
            } max-w-6xl mx-auto`}
          >
            {/* Card header */}
            <div className="mb-6 text-center">
              <div className="inline-block mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                    isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'
                  }`}
                >
                  💬
                </div>
              </div>
              <h1
                className={`text-2xl md:text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}
              >
                {t('cardTitle')}
              </h1>
              <p className={`${isDark ? 'text-emerald-200' : 'text-emerald-800'} mt-2`}>
                {t('cardSub')}
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {/* Question 1 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 justify-between">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isDark
                        ? 'bg-emerald-900/50 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    1
                  </div>
                  <label
                    className={`flex-1 font-semibold text-lg pt-1 ${
                      isDark ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {t('q1')}
                  </label>
                </div>
                <div className={offsetClass}>
                  <textarea
                    name="insight"
                    value={answers.insight}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full rounded-lg border px-4 py-3 text-base transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      isDark
                        ? 'bg-slate-700 border-slate-500 text-white placeholder-slate-400'
                        : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                    }`}
                    placeholder={t('ph1')}
                  />
                  <p
                    className={`text-xs mt-2 ${
                      isDark ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {answers.insight.length} {t('chars')}
                  </p>
                </div>
              </div>

              <div className={`border-t ${isDark ? 'border-slate-500' : 'border-slate-200'}`} />

              {/* Question 2 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 justify-between">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isDark
                        ? 'bg-teal-900/50 text-teal-300'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    2
                  </div>
                  <label
                    className={`flex-1 font-semibold text-lg pt-1 ${
                      isDark ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {t('q2')}
                  </label>
                </div>
                <div className={offsetClass}>
                  <textarea
                    name="usefulness"
                    value={answers.usefulness}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full rounded-lg border px-4 py-3 text-base transition-all focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      isDark
                        ? 'bg-slate-700 border-slate-500 text-white placeholder-slate-400'
                        : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                    }`}
                    placeholder={t('ph2')}
                  />
                  <p
                    className={`text-xs mt-2 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                  >
                    {answers.usefulness.length} {t('chars')}
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 text-center">
                <button
                  onClick={handleSubmit}
                  disabled={
                    saving ||
                    !answers.insight.trim() ||
                    !answers.usefulness.trim()
                  }
                  className={`px-8 py-3 rounded-lg font-semibold shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {saving ? t('saving') : t('finishContinue')}
                </button>

                {(!answers.insight.trim() || !answers.usefulness.trim()) && (
                  <p className={`text-sm mt-3 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                    {t('mustAnswer')}
                  </p>
                )}

                {err && (
                  <p className="text-sm mt-3 text-red-400">
                    {err}
                  </p>
                )}
              </div>

              {/* Bottom note */}
              <p className={`text-center text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {t('thanksNote')}
              </p>
            </div>
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
