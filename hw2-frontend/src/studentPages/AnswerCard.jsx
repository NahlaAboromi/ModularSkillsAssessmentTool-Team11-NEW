import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { translateUI } from '../utils/translateUI';

const StudentAnswerCard = ({ answer, isDark }) => {
  const { answerText, analysisResult, submittedAt } = answer || {};
  const { lang } = useContext(LanguageContext); // 'he' | 'en'
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  if (!analysisResult) return null;

  // ------- i18n -------
  const SOURCE = {
    overallScore: 'Overall Score',
    submitted: 'Submitted',
    answer: 'Answer',
    caselAnalysis: 'CASEL Analysis',
    strengths: 'Strengths',
    areasForImprovement: 'Areas for Improvement',
    suggestedIntervention: 'Suggested Intervention',
    depthLevel: 'Depth Level',

    selfAwareness: 'Self-Awareness',
    selfManagement: 'Self-Management',
    socialAwareness: 'Social Awareness',
    relationshipSkills: 'Relationship Skills',
    responsibleDecisionMaking: 'Responsible Decision-Making',
  };

  const [T, setT] = useState(SOURCE);
  const t = (k) => T[k] ?? k;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (lang === 'he') {
        try {
          const keys = Object.keys(SOURCE);
          const vals = Object.values(SOURCE);
          const tr = await translateUI({ sourceLang: 'EN', targetLang: 'HE', texts: vals });
          if (!cancelled) {
            const m = {};
            keys.forEach((k, i) => (m[k] = tr[i]));
            setT(m);
          }
        } catch {
          if (!cancelled) setT(SOURCE);
        }
      } else {
        setT(SOURCE);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [lang]);

  // ------- UI helpers -------
  const getScoreColor = (score = 0) => {
    if (score >= 4.5) return isDark ? 'text-green-300' : 'text-green-600';
    if (score >= 3.5) return isDark ? 'text-blue-300' : 'text-blue-600';
    if (score >= 2.5) return isDark ? 'text-yellow-300' : 'text-yellow-600';
    return isDark ? 'text-red-300' : 'text-red-600';
  };

  const getScoreBadgeColor = (score = 0) => {
    if (score >= 4.5) return isDark ? 'bg-green-800' : 'bg-green-100';
    if (score >= 3.5) return isDark ? 'bg-blue-800' : 'bg-blue-100';
    if (score >= 2.5) return isDark ? 'bg-yellow-800' : 'bg-yellow-100';
    return isDark ? 'bg-red-800' : 'bg-red-100';
  };

  const barColor = (score = 0) =>
    score >= 4.5 ? 'bg-green-600' : score >= 3.5 ? 'bg-blue-600' : score >= 2.5 ? 'bg-yellow-600' : 'bg-red-600';

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString(lang === 'he' ? 'he-IL' : 'en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });

  const CATEGORIES = [
    'selfAwareness',
    'selfManagement',
    'socialAwareness',
    'relationshipSkills',
    'responsibleDecisionMaking',
  ];

  const categoryIcons = {
    selfAwareness: '🌟',
    selfManagement: '🧘',
    socialAwareness: '👥',
    relationshipSkills: '🤝',
    responsibleDecisionMaking: '🧠',
  };

  return (
    <main className="flex-1 w-full px-4 py-6">
      <div dir={dir} className="bg-slate-100 text-black dark:bg-slate-800 dark:text-white p-6 rounded">
        <div className="bg-white dark:bg-slate-600 p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center gap-3">
            <div
              className={`px-3 py-1.5 rounded-full ${getScoreBadgeColor(analysisResult.overallScore)} ${getScoreColor(analysisResult.overallScore)} font-bold text-sm`}
            >
              {t('overallScore')}: {analysisResult.overallScore}
            </div>

            {submittedAt && (
              <p className="text-sm mt-1 shrink-0">
                <span role="img" aria-label="time">⏱️</span>{' '}
                {t('submitted')}: {formatDate(submittedAt)}
              </p>
            )}
          </div>

          {/* Main content */}
          <div className="p-4">
            {/* Answer */}
            <div className="mb-5">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <span role="img" aria-label="pencil">✍️</span> {t('answer')}:
              </h4>
              <div className="p-6 rounded-md bg-slate-100 text-black dark:bg-slate-800 dark:text-white">
                <p className="whitespace-pre-line">{answerText}</p>
              </div>
            </div>

            {/* CASEL categories */}
            <div className="mb-5">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <span role="img" aria-label="analysis">📊</span> {t('caselAnalysis')}:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(analysisResult)
                  .filter(([key]) => CATEGORIES.includes(key))
                  .map(([key, val]) => {
                    const score = Number(val?.score ?? 0);
                    const feedback = val?.feedback ?? '';
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-md bg-slate-100 text-black dark:bg-slate-800 dark:text-white ${dir === 'rtl' ? 'border-r-4' : 'border-l-4'} ${getScoreBadgeColor(score)}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span role="img" aria-label={key}>{categoryIcons[key]}</span>
                          <h5 className="font-bold">{t(key)}</h5>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</div>
                          <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${barColor(score)}`}
                              style={{ width: `${Math.max(0, Math.min(100, (score / 5) * 100))}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-sm">{feedback}</p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Strengths & Areas for Improvement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="p-3 rounded-md bg-green-200 text-black dark:bg-green-800 dark:text-white">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-green-800 dark:text-green-200">
                  <span role="img" aria-label="strength">💪</span> {t('strengths')}:
                </h4>
                <ul
  className={`list-disc list-inside ${dir === 'rtl' ? 'text-right' : 'text-left'} space-y-1 break-words leading-relaxed`}
>

                  {analysisResult.observedStrengths?.map((s, i) => (
                    <li key={i} className="text-sm">{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-md bg-yellow-200 text-black dark:bg-yellow-800 dark:text-white">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <span role="img" aria-label="improvement">🔍</span> {t('areasForImprovement')}:
                </h4>
                <ul
  className={`list-disc list-inside ${dir === 'rtl' ? 'text-right' : 'text-left'} space-y-1 break-words leading-relaxed`}
>

                  {analysisResult.areasForImprovement?.map((a, i) => (
                    <li key={i} className="text-sm">{a}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggested Intervention */}
            <div className="p-3 rounded-md bg-blue-200 text-black dark:bg-blue-800 dark:text-white">
              <h4 className="font-bold mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <span role="img" aria-label="lightbulb">💡</span> {t('suggestedIntervention')}:
              </h4>
              <p className="text-sm">{analysisResult.suggestedIntervention}</p>
            </div>

            {/* Depth Level */}
            {analysisResult.estimatedDepthLevel && (
              <div className={`${dir === 'rtl' ? 'text-left' : 'text-right'} text-sm mt-2`}>
                <span className="opacity-75">{t('depthLevel')}:</span>{' '}
                <span className="font-semibold">{analysisResult.estimatedDepthLevel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentAnswerCard;
