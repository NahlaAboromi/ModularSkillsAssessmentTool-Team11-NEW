import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/**
 * StudentHeader
 * Displays student's profile image, name, ID, and completed simulations count.
 */
const StudentHeader = ({
  profilePic,
  onImageError,
  username,
  studentId,
  simulationCount,
  isDark
}) => {
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('studentHeader');
  if (!ready) return null;

  const name = username || t('unknown');
  const simsText =
    simulationCount === 1
      ? t('simulationsOne')
      : (t('simulationsMany') || '').replace('{n}', String(simulationCount));

  return (
    <div className="flex items-center gap-4 mb-4" dir={dir} lang={lang}>
      {/* Student profile image */}
      <img
        src={profilePic}
        onError={onImageError}
        alt="Profile"
        className={`w-12 h-12 rounded-full border-2 object-cover ${
          isDark ? 'border-slate-500' : 'border-gray-300'
        }`}
      />

      <div>
        {/* Student's name */}
        <p className="text-base font-semibold">{name}</p>

        {/* Student ID */}
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {t('studentId')} {studentId}
        </p>

        {/* Completed simulations */}
        <p className="text-sm">{simsText}</p>
      </div>
    </div>
  );
};

export default StudentHeader;
