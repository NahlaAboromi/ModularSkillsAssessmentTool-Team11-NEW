import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

const defaultAvatar = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const StudentCard = ({ student }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const { t, dir, lang } = useI18n('studentCard');
  const { lang: currentLang } = useContext(LanguageContext) || { lang: 'he' };
  const isRTL = currentLang === 'he';

  const {
    id,
    username = 'Unknown Student',
    profilePic,
    averageScore = 0,
    uniqueSimulations = 0,
    totalAttempts = 0,
    latestActivity,
    overallScore
  } = student;

  useEffect(() => {
    console.log('📌 StudentCard received student:', student);
  }, [student]);

  const studentState = {
    id,
    username,
    profilePic,
    averageScore,
    uniqueSimulations,
    totalAttempts,
    overallScore
  };

  return (
    <div
      dir={dir}
      lang={lang}
      className={`rounded-lg shadow-md p-6 w-full sm:w-[300px] ${
        isDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-800'
      }`}
    >
      {/* תמונת סטודנט וכותרת */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <img
            src={profilePic && profilePic !== 'default_empty_profile_pic' ? profilePic : defaultAvatar}
            alt={t('profileAlt')}
            className={`w-12 h-12 rounded-full object-cover border ${
              isDark ? 'border-gray-600' : 'border-gray-300'
            }`}
            onError={(e) => {
              e.target.src = defaultAvatar;
              e.target.onerror = null;
            }}
          />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate max-w-[160px]" title={username}>
              {username}
            </h3>
            <p className="text-xs text-gray-500">
              {t('studentId')}: {id}
            </p>
          </div>
        </div>
        <div className="text-lg font-bold text-yellow-600 whitespace-nowrap">
          {averageScore}/5
        </div>
      </div>

      {/* סטטיסטיקות */}
      <div className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        <p>
          {t('uniqueSimulations')}: <strong>{uniqueSimulations}</strong>
        </p>
        <p>
          {t('totalAttempts')}: <strong>{totalAttempts}</strong>
        </p>
        <p>
          {t('latestActivity')}:{" "}
          <strong>
            {latestActivity ? new Date(latestActivity).toLocaleString() : t('noActivity')}
          </strong>
        </p>
      </div>

      {/* מעבר לפרטי הסטודנט */}
      <Link
        to={`/progress-of-chosen-student/${id}`}
        state={{ student: studentState }}
        onClick={() => {
          console.log('🚀 Navigating to student details with state:', studentState);
        }}
        className="block bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded mt-4 font-semibold"
      >
        {t('viewDetails')}
      </Link>
    </div>
  );
};

export default StudentCard;
