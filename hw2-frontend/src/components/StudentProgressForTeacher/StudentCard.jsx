import React, { useState, useEffect } from 'react';

/**
 * StudentCard
 * A presentational card component that displays summary information about a student,
 * including their profile image, name, ID, average score, simulation stats, and an action button.
 * The card adapts to dark/light mode and handles fallback for missing/broken images.
 */
const StudentCard = ({
  student,
  onClick,
  getStudentDisplayName,
  formatDate,
  getScoreColor,
  isDark
}) => {
  // Local state to track if the profile image failed to load
  const [imageError, setImageError] = useState(false);

  // Reset image error state if the student or their picture changes
  useEffect(() => {
    setImageError(false);
  }, [student?.profilePic, student?.studentId]);

  /**
   * Returns the correct profile image URL for the student.
   * Falls back to a default SVG if missing, flagged, or failed to load.
   * Adds cache-busting for external URLs.
   */
  const getProfileImage = () => {
    const needsDefaultImage =
      student.useDefaultProfilePic ||
      !student.profilePic ||
      student.profilePic === "default_empty_profile_pic" ||
      imageError;

    if (needsDefaultImage) {
      // Return a default SVG avatar if needed
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    }

    // For non-data URLs, add cache-busting query param
    if (!student.profilePic.startsWith("data:")) {
      try {
        if (
          student.profilePic.startsWith("http://") ||
          student.profilePic.startsWith("https://")
        ) {
          new URL(student.profilePic);
        }
        const separator = student.profilePic.includes("?") ? "&" : "?";
        return `${student.profilePic}${separator}t=${new Date().getTime()}`;
      } catch (error) {
        console.warn("Invalid URL for profile image:", student.profilePic);
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
      }
    }

    // Return the provided profilePic if it is a valid data URI
    return student.profilePic;
  };

  // --- Render section ---
  return (
    <div className={`${isDark ? 'bg-slate-600' : 'bg-white'} p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow`}>
      {/* Header: Profile image, name, ID, and average score */}
      <div className="flex items-center mb-4">
        {/* Student profile image */}
        <div className="w-12 h-12 mr-4">
          <img
            src={getProfileImage()}
            alt={getStudentDisplayName(student)}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
            onError={() => setImageError(true)}
          />
        </div>

        {/* Student name and ID */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {getStudentDisplayName(student)}
          </h3>
          <p className="text-sm text-gray-500">
            Student ID: {student.studentId}
          </p>
        </div>

        {/* Average score, color-coded */}
        <span className={`text-xl font-bold ${getScoreColor(student.averageScore)}`}>
          {student.averageScore}/5
        </span>
      </div>

      {/* Stats section: unique simulations, attempts, latest activity */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Unique Simulations:</span>
          <span className="font-semibold">{student.uniqueSimulations}</span>
        </div>
        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Attempts:</span>
          <span className="font-semibold">{student.totalSubmissions}</span>
        </div>
        <div className="flex justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Latest Activity:</span>
          <span className="text-sm">{formatDate(student.latestSubmission)}</span>
        </div>
      </div>

      {/* Action button: triggers parent handler to view details */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick(student);
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
      >
        View Details
      </button>
    </div>
  );
};

export default StudentCard;
