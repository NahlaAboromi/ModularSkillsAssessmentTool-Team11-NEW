import React from 'react';

const StudentAnswerCard = ({ answer, isDark }) => {
  const { answerText, analysisResult, submittedAt } = answer;

    // Do not render the card if there's no analysis result
  if (!analysisResult) return null;


    /**
   * Returns a text color class based on the score value.
   * Green for high scores, red for low ones, with adjustments for dark mode.
   */
  const getScoreColor = (score) => {
    if (score >= 4.5) return isDark ? 'text-green-300' : 'text-green-600';
    if (score >= 3.5) return isDark ? 'text-blue-300' : 'text-blue-600';
    if (score >= 2.5) return isDark ? 'text-yellow-300' : 'text-yellow-600';
    return isDark ? 'text-red-300' : 'text-red-600';
  };

   /**
   * Returns a background color class for badges based on the score.
   * Used for the left border of category boxes and the overall score badge.
   */
  const getScoreBadgeColor = (score) => {
    if (score >= 4.5) return isDark ? 'bg-green-800' : 'bg-green-100';
    if (score >= 3.5) return isDark ? 'bg-blue-800' : 'bg-blue-100';
    if (score >= 2.5) return isDark ? 'bg-yellow-800' : 'bg-yellow-100';
    return isDark ? 'bg-red-800' : 'bg-red-100';
  };


  // Formats a date string into a readable format.
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  // Display names for CASEL categories
  const displayNames = {
    selfAwareness: 'Self-Awareness',
    selfManagement: 'Self-Management',
    socialAwareness: 'Social Awareness',
    relationshipSkills: 'Relationship Skills',
    responsibleDecisionMaking: 'Responsible Decision-Making',
  };

    // Icons representing each CASEL category
  const categoryIcons = {
    selfAwareness: '🌟',
    selfManagement: '🧘',
    socialAwareness: '👥',
    relationshipSkills: '🤝',
    responsibleDecisionMaking: '🧠',
  };

  return (
    <main className="flex-1 w-full px-4 py-6">
      <div className="bg-slate-100 text-black dark:bg-slate-800 dark:text-white p-6 rounded">
        <div className="bg-white dark:bg-slate-600 p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center">
          <div
            className={`px-3 py-1.5 rounded-full ${getScoreBadgeColor(
              analysisResult.overallScore
            )} ${getScoreColor(analysisResult.overallScore)} font-bold text-sm`}
          >
            Overall Score: {analysisResult.overallScore}
          </div>
          <div>
            {submittedAt && (
              <p className="text-sm mt-1">
                <span role="img" aria-label="time">
                  ⏱️
                </span>{' '}
                Submitted: {formatDate(submittedAt)}
              </p>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="p-4">
          {/* Answer */}
          <div className="mb-5">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <span role="img" aria-label="pencil">
                ✍️
              </span>{' '}
              Answer:
            </h4>
             <div className={`p-6 rounded-md bg-slate-100 text-black dark:bg-slate-800 dark:text-white`}>
              <p className="whitespace-pre-line">{answerText}</p>
            </div>
          </div>

          {/* CASEL categories */}
          <div className="mb-5">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span role="img" aria-label="analysis">
                📊
              </span>{' '}
              CASEL Analysis:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(analysisResult)
                .filter(([key]) =>
                  [
                    'selfAwareness',
                    'selfManagement',
                    'socialAwareness',
                    'relationshipSkills',
                    'responsibleDecisionMaking',
                  ].includes(key)
                )
                .map(([key, val]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-md  bg-slate-100 text-black dark:bg-slate-800 dark:text-white border-l-4 ${getScoreBadgeColor(val.score)}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span role="img" aria-label={key}>
                        {categoryIcons[key]}
                      </span>
                      <h5 className="font-bold">{displayNames[key]}</h5>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`text-lg font-bold ${getScoreColor(val.score)}`}>
                        {val.score}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            val.score >= 4.5
                              ? 'bg-green-600'
                              : val.score >= 3.5
                              ? 'bg-blue-600'
                              : val.score >= 2.5
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${(val.score / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm">{val.feedback}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Strengths and Areas for Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div
              className={`p-3 rounded-md  bg-green-200 text-black dark:bg-green-800 dark:text-white`}
            >
              <h4 
                className={`font-bold mb-2 flex items-center gap-2 text-green-800 dark:text-green-200`}
              >
                <span role="img" aria-label="strength">
                  💪
                </span>{' '}
                Strengths:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {analysisResult.observedStrengths?.map((strength, index) => (
                  <li key={index} className="text-sm">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`p-3 rounded-md  bg-yellow-200 text-black dark:bg-yellow-800 dark:text-white`}

            >
              <h4
                className={`font-bold mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-200`}
              >
                <span role="img" aria-label="improvement">
                  🔍
                </span>{' '}
                Areas for Improvement:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {analysisResult.areasForImprovement?.map((area, index) => (
                  <li key={index} className="text-sm">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Intervention */}
          <div
              className={`p-3 rounded-md  bg-blue-200 text-black dark:bg-blue-800 dark:text-white`}
          >
            <h4
                className={`font-bold mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-200`}
            >
              <span role="img" aria-label="lightbulb">
                💡
              </span>{' '}
              Suggested Intervention:
            </h4>
            <p className="text-sm">{analysisResult.suggestedIntervention}</p>
          </div>

          {/* Depth Level */}
          {analysisResult.estimatedDepthLevel && (
            <div className="text-right text-sm mt-2">
              <span className="opacity-75">Depth Level:</span>{' '}
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
