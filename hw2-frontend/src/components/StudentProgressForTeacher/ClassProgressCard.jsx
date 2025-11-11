import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { useI18n } from '../../utils/i18n';

const ClassProgressCard = ({ classData, isDark }) => {
  const { t, dir, lang } = useI18n('classProgress');
  const mutedText = isDark ? 'text-gray-300' : 'text-gray-600';

  const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const toFixedSafe = (v, d = 1) => toNum(v).toFixed(d);

  const progressData = (classData?.attempts || []).map((attempt, index) => {
    const dt = attempt?.submittedAt ? new Date(attempt.submittedAt) : null;
    return {
      attempt: `${t('attempt')} ${index + 1}`,
      score: toNum(attempt?.analysisResult?.overallScore),
      date: dt
        ? `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : '—',
    };
  });

  const attempts = Array.isArray(classData?.attempts) ? classData.attempts : [];
  const latestAttempt = attempts.at(-1) || null;
  const firstAttempt  = attempts[0] || null;

  const latestScore = toNum(latestAttempt?.analysisResult?.overallScore);
  const firstScore  = toNum(firstAttempt?.analysisResult?.overallScore);
  const improvement = attempts.length > 1 ? (latestScore - firstScore) : 0;

  const subj = (classData?.subject || '').replace('-', ' ');

  // ✅ חץ וכיוון מוצגים נכון לפי שפה
  const arrow = lang === 'he' ? '←' : '→';
  const LRM = '\u200E';
  const fmt = (n) => (lang === 'he' ? `${LRM}${toFixedSafe(n, 1)}${LRM}` : toFixedSafe(n, 1));
  const firstLastLine =
    lang === 'he'
      ? `${fmt(latestScore)} ${arrow} ${fmt(firstScore)}`
      : `${fmt(firstScore)} ${arrow} ${fmt(latestScore)}`;

  return (
    <div dir={dir} lang={lang} className={`${isDark ? 'bg-slate-700' : 'bg-white'} p-6 rounded-lg shadow-md`}>
      {/* כותרת הקורס */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} text-xl`}>📘</div>
          <div>
            <h2 className="text-xl font-semibold">{classData?.className || '—'}</h2>
            <p className={`text-sm capitalize ${mutedText}`}>
              {subj || '—'}
            </p>
          </div>
        </div>

        <div className={`${dir === 'rtl' ? 'text-left' : 'text-right'} text-sm`}>
<div className="text-sm font-semibold text-blue-600 mb-1">
  {lang === 'he' ? 'ציון ראשון ← אחרון' : t('firstToLast')}
</div>          <div className="text-lg text-blue-700 font-bold">
            {firstLastLine}
          </div>
          {attempts.length > 1 && improvement !== 0 && (
            <div className={`text-sm mt-1 ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement > 0 ? '+' : ''}{toFixedSafe(improvement, 1)} {t('improvement')}
            </div>
          )}
        </div>
      </div>

      {/* גרף התקדמות או טקסט אם יש רק ניסיון אחד */}
      {attempts.length > 1 ? (
        <div className="mb-4">
          <h3 className={`text-md font-medium mb-2 flex items-center ${mutedText}`}>
            <span className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}>📈</span>
            {t('progressOverTime')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mb-4 flex justify-center">
          <span className="px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800">
            📘 {t('noChart')}
          </span>
        </div>
      )}

      {/* תיאור מובהק */}
      <div className="mb-2 mt-1 text-center text-xs italic text-gray-400">
        {t('basedOnLatest')}
      </div>

      {/* תצוגת CASEL */}
      <div className="grid grid-cols-5 gap-4 text-center text-sm">
        {[
          { label: t('selfAwareness'),           color: 'blue-600',   key: 'selfAwareness' },
          { label: t('selfManagement'),          color: 'green-600',  key: 'selfManagement' },
          { label: t('socialAwareness'),         color: 'purple-600', key: 'socialAwareness' },
          { label: t('relationshipSkills'),      color: 'orange-600', key: 'relationshipSkills' },
          { label: t('decisionMakingShort'),     color: 'red-600',    key: 'responsibleDecisionMaking' },
        ].map(({ label, color, key }) => (
          <div key={key}>
            <div className={`text-lg font-semibold text-${color}`}>
              {toFixedSafe(latestAttempt?.analysisResult?.[key]?.score, 1)}
            </div>
            <div className={mutedText}>{label}</div>
          </div>
        ))}
      </div>

      {/* רמת עומק ותאריך */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse' : ''} space-x-4`}>
          {(() => {
            const level = latestAttempt?.analysisResult?.estimatedDepthLevel || t('unknown');
            const cls =
              String(level).includes('Advanced') ? 'bg-green-100 text-green-800' :
              String(level).includes('Intermediate') ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800';
            return <span className={`px-3 py-1 rounded-full text-sm ${cls}`}>{level}</span>;
          })()}
          <span className={`text-sm flex items-center ${mutedText}`}>
            <span className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'}`}>📅</span>
            {latestAttempt?.submittedAt
              ? new Date(latestAttempt.submittedAt).toLocaleString([], {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })
              : '—'}
          </span>
        </div>

        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium ml-4">
          {attempts.length} {attempts.length > 1 ? t('attemptsMany') : t('attemptsOne')}
        </span>
      </div>
    </div>
  );
};

export default ClassProgressCard;
