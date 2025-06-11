import React from 'react';
import StudentCard from './StudentCard';

/**
 * StudentList
 *
 * Renders a grid of StudentCard components for each student in the list.
 * Handles the "no students found" state and passes all relevant props to each card.
 */
const StudentList = ({ 
  students, 
  onClick, 
  getStudentDisplayName, 
  getStudentProfilePic, 
  handleImageError, 
  formatDate, 
  getScoreColor, 
  isDark 
}) => {
  // If there are no students, show a message
  if (students.length === 0) {
    return (
      <div className={`${isDark ? 'bg-slate-600' : 'bg-white'} p-8 rounded-lg text-center`}>
        <p className="text-gray-500">No students found.</p>
      </div>
    );
  }

  // Render a grid of StudentCard components
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {students.map((student) => (
        <StudentCard
          key={student.studentId}
          student={student}
          onClick={onClick}
          getStudentDisplayName={getStudentDisplayName}
          getStudentProfilePic={getStudentProfilePic}
          handleImageError={handleImageError}
          formatDate={formatDate}
          getScoreColor={getScoreColor}
          isDark={isDark}
        />
      ))}
    </div>
  );
};

export default StudentList;
