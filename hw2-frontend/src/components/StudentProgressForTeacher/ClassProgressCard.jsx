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

const ClassProgressCard = ({ classData, isDark }) => {
  const mutedText = isDark ? 'text-gray-300' : 'text-gray-600';

  const progressData = classData.attempts.map((attempt, index) => ({
    attempt: `Attempt ${index + 1}`,
    score: attempt.analysisResult.overallScore,
    date: new Date(attempt.submittedAt).toLocaleDateString(),
  }));

  const latestAttempt = classData.attempts.at(-1);
  const firstAttempt = classData.attempts[0];
  const improvement =
    classData.attempts.length > 1
      ? latestAttempt.analysisResult.overallScore - firstAttempt.analysisResult.overallScore
      : 0;

  return (
    <div className={`${isDark ? 'bg-slate-700' : 'bg-white'} p-6 rounded-lg shadow-md`}>
      {/* כותרת הקורס */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="mr-2 text-xl">📘</div>
          <div>
            <h2 className="text-xl font-semibold">{classData.className}</h2>
            <p className={`text-sm capitalize ${mutedText}`}>
              {classData.subject.replace('-', ' ')}
            </p>
          </div>
        </div>

        <div className="text-right text-sm">
          <div className="text-sm font-semibold text-blue-600 mb-1">First → Last Score</div>
          <div className="text-lg text-blue-700 font-bold">
            {firstAttempt.analysisResult.overallScore.toFixed(1)} → {latestAttempt.analysisResult.overallScore.toFixed(1)}
          </div>
          {improvement !== 0 && (
            <div className={`text-sm mt-1 ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement > 0 ? '+' : ''}{improvement.toFixed(1)} improvement
            </div>
          )}
        </div>
      </div>

      {/* גרף התקדמות או טקסט אם יש רק ניסיון אחד */}
      {classData.attempts.length > 1 ? (
        <div className="mb-4">
          <h3 className={`text-md font-medium mb-2 flex items-center ${mutedText}`}>
            <span className="mr-2">📈</span>
            Progress Over Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attempt" />
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
            📘 No progress chart available – only one attempt was submitted
          </span>
        </div>
      )}

      {/* תיאור מובהק */}
      <div className="mb-2 mt-1 text-center text-xs italic text-gray-400">
        Based on the latest simulation attempt
      </div>

      {/* תצוגת CASEL */}
      <div className="grid grid-cols-5 gap-4 text-center text-sm">
        {[
          { label: 'Self Awareness', color: 'blue-600', key: 'selfAwareness' },
          { label: 'Self Management', color: 'green-600', key: 'selfManagement' },
          { label: 'Social Awareness', color: 'purple-600', key: 'socialAwareness' },
          { label: 'Relationship Skills', color: 'orange-600', key: 'relationshipSkills' },
          { label: 'Decision Making', color: 'red-600', key: 'responsibleDecisionMaking' },
        ].map(({ label, color, key }) => (
          <div key={key}>
            <div className={`text-lg font-semibold text-${color}`}>
              {latestAttempt.analysisResult[key].score}
            </div>
            <div className={mutedText}>{label}</div>
          </div>
        ))}
      </div>

      {/* רמת עומק ותאריך */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            latestAttempt.analysisResult.estimatedDepthLevel === 'Advanced' ? 'bg-green-100 text-green-800' :
            latestAttempt.analysisResult.estimatedDepthLevel.includes('Intermediate') ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {latestAttempt.analysisResult.estimatedDepthLevel}
          </span>
          <span className={`text-sm flex items-center ${mutedText}`}>
            <span className="mr-1">📅</span>
            {new Date(latestAttempt.submittedAt).toLocaleDateString()}
          </span>
        </div>
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium ml-4">
          {classData.attempts.length} attempt{classData.attempts.length > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default ClassProgressCard;
