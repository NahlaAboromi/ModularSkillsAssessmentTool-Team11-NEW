import React, { useContext } from 'react';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { useI18n } from '../../utils/i18n';

const defaultAvatar =
  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const StudentOverviewHeader = ({ student, isDark }) => {
  const { theme } = useContext(ThemeContext);
  const themeIsDark = isDark || theme === 'dark';
  const mutedText = themeIsDark ? 'text-gray-300' : 'text-gray-600';

  const { t, dir, lang } = useI18n('studentOverview');

  if (!student) return null;

  const {
    id,
    username = 'Unknown Student',
    profilePic,
    classes = [],
    totalAttempts = 0,
    uniqueSimulations = 0,
    averageScore = 0
  } = student;

  // ✅ בניית שורת "משובץ ב־X כיתות" בלי אינטרפולציה ב-t()
  const classWord = classes.length === 1 ? t('classOne') : t('classMany');
  const enrolledLine = `${t('enrolledIn')} ${classes.length} ${classWord}`;

  return (
    <div
      dir={dir}
      lang={lang}
      className={`rounded-lg shadow-md p-6 w-full mb-6 flex items-center gap-6 ${
        themeIsDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-800'
      }`}
    >
      {/* תמונת פרופיל */}
      <img
        src={
          profilePic && profilePic !== 'default_empty_profile_pic'
            ? profilePic
            : defaultAvatar
        }
        alt={t('profileAlt')}
        className={`w-16 h-16 rounded-full object-cover border ${
          themeIsDark ? 'border-gray-600' : 'border-gray-300'
        }`}
        onError={(e) => {
          e.target.src = defaultAvatar;
          e.target.onerror = null;
        }}
      />

      {/* מידע על הסטודנט */}
      <div className="flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-1">
          {username} — {t('detailedProgress')}
        </h2>
        <p className={`text-sm ${mutedText}`}>
          {t('studentId')}: {id}
        </p>
        <p className={`text-sm ${mutedText}`}>
          {enrolledLine}
        </p>
      </div>

      {/* סטטיסטיקות */}
      <div
        className={`ml-auto flex ${
          dir === 'rtl' ? 'space-x-reverse' : ''
        } space-x-8 text-center text-sm`}
      >
        <div>
          <div className="text-blue-600 font-bold text-lg">{totalAttempts}</div>
          <div className={mutedText}>{t('totalSubmissions')}</div>
        </div>
        <div>
          <div className="text-green-600 font-bold text-lg">{uniqueSimulations}</div>
          <div className={mutedText}>{t('uniqueSimulations')}</div>
        </div>
        <div>
          <div className="text-yellow-600 font-bold text-lg">{averageScore}/5</div>
          <div className={mutedText}>{t('averageScore')}</div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewHeader;
