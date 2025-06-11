import React from 'react';

/**
 * StudentHeader
 * Displays the student's profile picture, name, ID, and the number of completed simulations.
 * Used as a header section in student report cards or similar views.
 */
const StudentHeader = ({ 
  profilePic, 
  onImageError, 
  username, 
  studentId, 
  simulationCount, 
  isDark 
}) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Student profile image, with fallback on error */}
      <img
        src={profilePic}
        onError={onImageError}
        alt="Profile"
        className={`w-12 h-12 rounded-full border-2 object-cover ${
          isDark ? 'border-slate-500' : 'border-gray-300'
        }`}
      />
      <div>
        {/* Student's name or 'Unknown Student' if missing */}
        <p className="text-base font-semibold">
          {username || 'Unknown Student'}
        </p>
        {/* Student ID, styled according to theme */}
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Student ID: {studentId}
        </p>
        {/* Number of completed simulations, with pluralization */}
        <p className="text-sm">
          📊 <strong>{simulationCount}</strong> Simulation{simulationCount > 1 ? 's' : ''} Completed
        </p>
      </div>
    </div>
  );
};

export default StudentHeader;
