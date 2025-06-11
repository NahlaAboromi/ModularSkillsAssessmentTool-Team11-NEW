import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

/**
 * ClassCard component displays a summary card for a class,
 * including statistics and actions such as view, reports, and delete.
 */
const ClassCard = ({ classData }) => {
  // State for showing the delete confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  // State for indicating if the delete operation is in progress
  const [isDeleting, setIsDeleting] = useState(false);

  // Formats a date string to a readable format (e.g., June 2, 2025)
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Unknown';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Returns a Tailwind background color class based on the percentage
  const getGradeColorClass = (percent) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 60) return 'bg-blue-500';
    if (percent >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get the list of students (or empty array if missing)
  const students = classData.studentsTaken || [];

  // Filter only students who have a valid overallScore
  const studentsWithScores = students.filter(
    (student) => student.analysisResult && typeof student.analysisResult.overallScore === 'number'
  );

  // Count unique students by their studentId
  const uniqueStudentIds = new Set();
  students.forEach(student => {
    if (student.studentId) {
      uniqueStudentIds.add(student.studentId);
    }
  });
  const totalStudents = uniqueStudentIds.size;

  // Calculate the average SEL score (out of 5), rounded to one decimal place
  const averageScore = studentsWithScores.length > 0
    ? (
        studentsWithScores.reduce(
          (sum, student) => sum + student.analysisResult.overallScore,
          0
        ) / studentsWithScores.length
      ).toFixed(1)
    : "0.0";

  // Convert the average score to a percentage (0-100)
  const averageScorePercent = Math.round((parseFloat(averageScore) / 5) * 100);

  // Count the total number of simulation attempts across all students
  const totalAttempts = students.reduce((sum, student) => {
    if (Array.isArray(student.simulations)) {
      return sum + student.simulations.length;
    } else if (student.analysisResult && typeof student.analysisResult.overallScore === 'number') {
      return sum + 1;
    }
    return sum;
  }, 0);

  // Count unique students who have at least one attempt or a score
  const studentIdsWithAttempts = new Set();
  students.forEach(student => {
    const hasSimulations = Array.isArray(student.simulations) && student.simulations.length > 0;
    const hasScore = student.analysisResult && typeof student.analysisResult.overallScore === 'number';

    if (hasSimulations || hasScore) {
      if (student.studentId) {
        studentIdsWithAttempts.add(student.studentId);
      } else if (student._id) {
        studentIdsWithAttempts.add(student._id);
      } else {
        studentIdsWithAttempts.add(JSON.stringify(student));
      }
    }
  });
  const uniqueStudents = studentIdsWithAttempts.size;

  // Handles deleting the class: calls the API and reloads the page if successful
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/classes/delete/${classData.classCode}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setShowConfirm(false);
        window.location.reload();
      } else {
        alert("Error deleting class: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-700 rounded shadow class-card relative">
      {/* Header: class code, name, creation date, status */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {classData.classCode}: {classData.className}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created: {formatDate(classData.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 text-xs font-medium py-1 px-2 rounded">
            Active
          </span>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs font-medium py-1 px-2 rounded">
            {totalStudents} Students
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Show subject if exists */}
        {classData.subject && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100 text-xs font-medium py-1 px-2 rounded">
              {classData.subject}
            </span>
          </div>
        )}

        {/* Show message if there are no students */}
        {totalStudents === 0 && (
          <p className="text-sm text-gray-400 italic mb-4">
            No students in this class yet
          </p>
        )}

        {/* Statistics: attempts and average score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Attempts summary */}
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded">
            <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-2">
              Simulation Attempts Summary
            </h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {totalAttempts} Attempt{totalAttempts !== 1 && 's'}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              completed by {uniqueStudents} unique student{uniqueStudents !== 1 && 's'}
            </p>
          </div>

          {/* Average SEL score */}
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded">
            <h3 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-2">
              Average SEL Score
            </h3>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {averageScore} / 5
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                SEL Average
              </div>
            </div>
            {/* Progress bar for average score */}
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div
                className={`${getGradeColorClass(averageScorePercent)} h-3 rounded-full`}
                style={{ width: `${averageScorePercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to={`/teacher/class/${classData.classCode}`}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm">
              View Details
            </button>
          </Link>

          <Link to={`/teacher/class/${classData.classCode}/reports`}>
            <button className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded text-sm">
              Student Reports
            </button>
          </Link>

          <button
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
            onClick={() => setShowConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Confirmation modal for deletion */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Class"
        description="Are you sure you want to delete this class? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isProcessing={isDeleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ClassCard;
