import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

import { useEffect } from 'react';

/**
 * StudentDetails component displays a detailed report for a single student,
 * including statistics, simulation progress, PDF export, and AI analysis.
 */
const StudentDetails = ({
  student,
  renderAnalysisChart,
  isDark,
  getStudentDisplayName,
  formatDate,
  getScoreColor,
}) => {

  // Navigation hook 
  const navigate = useNavigate();

  // State to handle image loading errors 
  const [imageError, setImageError] = useState(false);

  // State to manage export loading indication
  const [isExporting, setIsExporting] = useState(false);

  // Ref for the section to export as PDF
  const exportRef = useRef();
  /**
   * Export the entire report as a PDF file.
   */
  const handleExportAllPDF = async () => {
    setIsExporting(true); // Start loading
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; 
      const pageHeight = 297; 
      const imgProps = { width: canvas.width, height: canvas.height };
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

      const pdfWidth = imgWidth;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let position = 0;
      let heightLeft = pdfHeight;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Add more pages if needed
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${student.studentId}_full_report.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
    } finally {
      setIsExporting(false); // End loading
    }
  };
  /**
   * Returns the student's profile picture URL.
   */
  const getStudentProfilePic = (student) => {
    const needsDefaultImage = student.useDefaultProfilePic ||
                             !student.profilePic ||
                             student.profilePic === "default_empty_profile_pic" ||
                             imageError;

    if (needsDefaultImage) {
      // Return a default SVG avatar as a data URL
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    }

    // For external images, add a timestamp to avoid browser caching issues
    if (!student.profilePic.startsWith('data:')) {
      try {
        if (student.profilePic.startsWith('http://') || student.profilePic.startsWith('https://')) {
          new URL(student.profilePic);
        }
        const separator = student.profilePic.includes('?') ? '&' : '?';
        return `${student.profilePic}${separator}t=${new Date().getTime()}`;
      } catch {
        // If the URL is invalid, fallback to default
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
      }
    }

    return student.profilePic;
  };

  // Handles image loading errors by switching to the default image
  const handleImageError = () => {
    setImageError(true);
  };

  // Show loading state if student data is not yet available
  if (!student) {
    return <div className="p-4 text-center">Loading student data...</div>;
  }

  return (
    <div>
      {/* Export PDF Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleExportAllPDF}
          disabled={isExporting}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md font-medium transition-colors ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isExporting ? (
            <>
              {/* Loading spinner during export */}
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              📄 Export Full Report
            </>
          )}
        </button>
      </div>

      <div ref={exportRef}>
        {/* Header Section: Student summary */}
        <div className={`${isDark ? 'bg-slate-600' : 'bg-white'} p-6 rounded-lg shadow-lg mb-6`}>
          <div className="flex items-center mb-4">
            <img
              src={getStudentProfilePic(student)}
              alt={getStudentDisplayName(student)}
              className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-300"
              onError={handleImageError}
            />
            <div>
              <h2 className="text-2xl font-bold">
                📈 {getStudentDisplayName(student)} - Detailed Progress
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Student ID: {student.studentId}
              </p>
            </div>
          </div>

          {/* Quick stats grid: submissions, unique simulations, average score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{student.totalSubmissions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{student.uniqueSimulations}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Unique Simulations</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(student.averageScore)}`}>
                {student.averageScore}/5
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Average Score</div>
            </div>
          </div>
        </div>

        {/* List of simulations, sorted by most recent attempt */}
        {student.simulations && student.simulations.length > 0 ? (
          student.simulations
            .sort((a, b) => new Date(b.attempts[b.attempts.length - 1].submission.submittedAt) - 
                         new Date(a.attempts[a.attempts.length - 1].submission.submittedAt))
            .map((simulation, index) => (
              <div
                key={`${simulation.simulationKey}-${index}`}
                className={`student-card-export ${isDark ? 'bg-slate-600' : 'bg-white'} p-6 rounded-lg shadow-lg mb-6`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold">🎮 {simulation.simulationKey}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {simulation.totalAttempts} attempts •
                      {simulation.improvement > 0 ? (
                        <span className="text-green-600 ml-1">+{simulation.improvement.toFixed(1)} improvement</span>
                      ) : simulation.improvement < 0 ? (
                        <span className="text-red-600 ml-1">{simulation.improvement.toFixed(1)} decline</span>
                      ) : (
                        <span className={`ml-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>No change</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* First and latest scores */}
                    <div className="text-center">
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>First</div>
                      <div className={`text-lg font-bold ${getScoreColor(simulation.firstScore)}`}>
                        {simulation.firstScore}/5
                      </div>
                    </div>
                    {simulation.totalAttempts > 1 && (
                      <>
                        <div className="text-gray-400">→</div>
                        <div className="text-center">
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Latest</div>
                          <div className={`text-lg font-bold ${getScoreColor(simulation.lastScore)}`}>
                            {simulation.lastScore}/5
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress timeline for multiple attempts */}
                {simulation.totalAttempts > 1 && (
                  <div className="mb-4">
                    <h5 className="font-semibold mb-2">📈 Progress Timeline:</h5>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {simulation.attempts.map((attempt, attemptIndex) => (
                        <div key={attemptIndex} className="flex-shrink-0 text-center">
                          <div className="text-xs text-gray-500 mb-1">#{attemptIndex + 1}</div>
                          <div
                            className={`px-3 py-2 rounded-full text-sm font-bold text-white ${
                              attempt.submission.analysisResult?.overallScore >= 4
                                ? 'bg-green-500'
                                : attempt.submission.analysisResult?.overallScore >= 2.5
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          >
                            {attempt.submission.analysisResult?.overallScore || 0}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDate(attempt.submission.submittedAt).split(',')[0]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest attempt details, including AI feedback and analysis */}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                  <h5 className="font-semibold mb-2">
                    📝 Latest Attempt ({formatDate(simulation.attempts[simulation.attempts.length - 1].submission.submittedAt)}):
                  </h5>

                  <div className="mb-4">
                    <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} p-3 rounded border-l-4 border-blue-500`}>
                      <p className="text-gray-700 dark:text-gray-300">
                        {simulation.attempts[simulation.attempts.length - 1].submission.answerText}
                      </p>
                    </div>
                  </div>

                  {simulation.attempts[simulation.attempts.length - 1].submission.analysisResult && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">Latest Score:</span>
                        <span
                          className={`text-xl font-bold ${getScoreColor(
                            simulation.attempts[simulation.attempts.length - 1].submission.analysisResult.overallScore
                          )}`}
                        >
                          {simulation.attempts[simulation.attempts.length - 1].submission.analysisResult.overallScore}/5
                        </span>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-2">SEL Analysis:</h5>
                        {renderAnalysisChart(
                          simulation.attempts[simulation.attempts.length - 1].submission.analysisResult
                        )}
                      </div>
                      {simulation.attempts[simulation.attempts.length - 1].submission.analysisResult.feedback && (
                        <div>
                          <h5 className="font-semibold mb-2">AI Feedback:</h5>
                          <div
                            className={`${
                              isDark ? 'bg-slate-700' : 'bg-gray-50'
                            } p-3 rounded border-l-4 border-green-500`}
                          >
                            <p className="text-gray-700 dark:text-gray-300">
                              {simulation.attempts[simulation.attempts.length - 1].submission.analysisResult.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
        ) : (
          // No simulations found for this student
          <div className={`${isDark ? 'bg-slate-600' : 'bg-white'} p-8 rounded-lg text-center`}>
            <p className="text-gray-500">No simulations found for this student.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
