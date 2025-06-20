import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';

const defaultAvatar = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

const StudentCard = ({ student }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const {
    id,
    username = 'Unknown Student',
    profilePic,
    averageScore = 0,
    uniqueSimulations = 0,
    totalAttempts = 0,
    latestActivity,
    overallScore // במקרה שזה קיים
  } = student;

  // 🔎 הדפסה מיידית של הנתונים שמגיעים ל-StudentCard
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
    <div className={`rounded-lg shadow-md p-6 w-full sm:w-[300px] 
      ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-800'}`}>

      {/* תמונת סטודנט וכותרת */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <img
            src={profilePic && profilePic !== 'default_empty_profile_pic' ? profilePic : defaultAvatar}
            alt="Profile"
            className={`w-12 h-12 rounded-full object-cover border
              ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
            onError={(e) => {
              e.target.src = defaultAvatar;
              e.target.onerror = null;
            }}
          />
          <div className="min-w-0">
            <h3
              className="text-sm font-semibold truncate max-w-[160px]"
              title={username}
            >
              {username}
            </h3>
            <p className="text-xs text-gray-500">Student ID: {id}</p>
          </div>
        </div>
        <div className="text-lg font-bold text-yellow-600 whitespace-nowrap">
          {averageScore}/5
        </div>
      </div>

      {/* סטטיסטיקות */}
      <div className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        <p>Unique Simulations: <strong>{uniqueSimulations}</strong></p>
        <p>Total Attempts: <strong>{totalAttempts}</strong></p>
        <p>
          Latest Activity:{' '}
          <strong>
            {latestActivity
              ? new Date(latestActivity).toLocaleString()
              : 'N/A'}
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
        View Details
      </Link>
    </div>
  );
};

export default StudentCard;
