import React, { useState, useEffect, useContext, useRef } from 'react';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import StudentSearchBox from "./StudentSearchBox";
import StudentList from "./StudentList";
import StudentDetails from "./StudentDetails";
import ErrorMessage from "./ErrorMessage";
import AIChat from '../../AI/AIChat';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider } from '../../DarkLightMood/ThemeContext';
import { UserProvider } from '../../context/UserContext';
/**
 * AllStudentsProgressContent component
 * Main dashboard for viewing all students' progress across all classes.
 * Supports search, student details view, and SEL analysis chart.
 */
const AllStudentsProgressContent = ({ studentIdFromRoute }) => {
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext);
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  /**
   * Returns display name for a student object.
   */
  const getStudentDisplayName = (student) =>
    student.username || student.studentId || 'Unknown Student';
  /**
   * Returns profile picture URL or default if missing.
   */
  const getStudentProfilePic = (student) =>
    student.profilePic && student.profilePic !== 'default_empty_profile_pic'
      ? student.profilePic
      : '/default-avatar.png';
  /**
   * Handles image loading error, fallback to default avatar.
   */
  const handleImageError = (e) => {
    e.target.src = '/default-avatar.png';
    e.target.onerror = null;
  };

  /**
   * Fetches student details (usernames, profile pics) from the server.
   * @param {Array} studentIds - Array of student IDs to fetch details for.
   */
  const fetchStudentDetails = async (studentIds) => {
    try {
      const response = await fetch('/api/students/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds }),
      });
      if (response.ok) return await response.json();
      return [];
    } catch {
      return [];
    }
  };

  /**
   * Fetches all students' progress data for the teacher.
   * Aggregates simulation attempts, calculates averages, and merges student details.
   */
  useEffect(() => {
    const fetchAllStudentsProgress = async () => {
      try {
        // Abort if no user ID available
        if (!user?.id) {
          setError('No user ID found.');
          setLoading(false);
          return;
        }

        // Fetch all classes for this teacher
        const response = await fetch(
          `/api/classes/teacher/${user.id}`
        );
        const classes = await response.json();
        if (!response.ok) {
          setError(classes.message || 'Failed to fetch classes.');
          setLoading(false);
          return;
        }
        // Map to aggregate each student's data across all classes
        const studentsMap = new Map();
        // Set to collect all unique student IDs
        const uniqueStudentIds = new Set();
        // Iterate over all classes
        classes.forEach((classData) => {
          // Only process classes with students
          if (classData.students && classData.students.length > 0) {
            // Iterate over all students in the class
            classData.students.forEach((student) => {
              const studentId = student.studentId;
              uniqueStudentIds.add(studentId);

              // If this student hasn't been seen yet, initialize their data
              if (!studentsMap.has(studentId)) {
                studentsMap.set(studentId, {
                  studentId,
                  totalSubmissions: 0,
                  simulations: new Map(),
                  latestSubmission: null,
                  averageScore: 0,
                  totalScore: 0,
                  username: '',
                  profilePic: 'default_empty_profile_pic',
                });
              }

              // Get the student's info object
              const studentInfo = studentsMap.get(studentId);
              // Use a unique key for each simulation (by class and subject)
              const simulationKey = `${classData.name || classData.className}-${classData.subject}`;
              // Initialize simulation array if needed
              if (!studentInfo.simulations.has(simulationKey)) {
                studentInfo.simulations.set(simulationKey, []);
              }

              // Add this simulation attempt to the student's simulations
              studentInfo.simulations.get(simulationKey).push({
                classCode: classData.id || classData.classCode,
                className: classData.name || classData.className,
                subject: classData.subject,
                submission: student,
                attemptNumber: studentInfo.simulations.get(simulationKey).length + 1,
              });

              // Update total submissions count
              studentInfo.totalSubmissions++;
              // Update latest submission date if this is newer
              if (
                !studentInfo.latestSubmission ||
                new Date(student.submittedAt) > new Date(studentInfo.latestSubmission)
              ) {
                studentInfo.latestSubmission = student.submittedAt;
              }

              // Add to total score if analysisResult exists
              if (student.analysisResult?.overallScore) {
                studentInfo.totalScore += student.analysisResult.overallScore;
              }
            });
          }
        });

        // --- Fetch student details from server ---
        const studentIds = Array.from(uniqueStudentIds);
        const studentsDetails = await fetchStudentDetails(studentIds);
        const studentsDetailsMap = new Map();
        studentsDetails.forEach((student) => {
          studentsDetailsMap.set(student.id, student);
        });

        // Process and aggregate student data for rendering //
        const studentsArray = Array.from(studentsMap.values()).map((student) => {
          const studentDetails = studentsDetailsMap.get(student.studentId);
          if (studentDetails) {
            student.username = studentDetails.username || '';
            student.profilePic = studentDetails.profilePic || 'default_empty_profile_pic';
          }

          // Prepare simulation attempts list
          const simulationsList = [];
          student.simulations.forEach((attempts, simulationKey) => {
            // Sort attempts by submission date
            attempts.sort(
              (a, b) => new Date(a.submission.submittedAt) - new Date(b.submission.submittedAt)
            );
            simulationsList.push({
              simulationKey,
              attempts,
              firstScore: attempts[0]?.submission?.analysisResult?.overallScore || 0,
              lastScore:
                attempts[attempts.length - 1]?.submission?.analysisResult?.overallScore || 0,
              improvement:
                attempts.length > 1
                  ? (attempts[attempts.length - 1]?.submission?.analysisResult?.overallScore || 0) -
                    (attempts[0]?.submission?.analysisResult?.overallScore || 0)
                  : 0,
              totalAttempts: attempts.length,
            });
          });

          return {
            ...student,
            simulations: simulationsList,
            uniqueSimulations: simulationsList.length,
            averageScore:
              student.totalSubmissions > 0
                ? (student.totalScore / student.totalSubmissions).toFixed(1)
                : 0,
          };
        });

        // Sort students by latest submission date (descending)
        studentsArray.sort(
          (a, b) => new Date(b.latestSubmission) - new Date(a.latestSubmission)
        );

        setStudentsData(studentsArray);

      } catch (err) {
        setError('Server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudentsProgress();
  }, [user, studentIdFromRoute]); // Refetch if user or route param changes

  /**
   * Selects a student if studentIdFromRoute is provided and students are loaded.
   */
  useEffect(() => {
    if (studentIdFromRoute && studentsData.length > 0) {
      const foundStudent = studentsData.find(
        (s) => s.studentId === studentIdFromRoute
      );
      if (foundStudent) {
        setSelectedStudent(foundStudent);
      } else {
        setSelectedStudent(null);
      }
      setInitializing(false);
    } else if (!studentIdFromRoute) {
      setSelectedStudent(null);
      setInitializing(false);
    }
  }, [studentIdFromRoute, studentsData]);

  /**
   * Filters students by search term (username or studentId).
   */
  const filteredStudents = studentsData.filter((student) => {
    const searchTermLower = searchTerm.toLowerCase();
    const studentName = getStudentDisplayName(student).toLowerCase();
    const studentId = student.studentId.toLowerCase();
    return (
      searchTerm === '' ||
      studentId.includes(searchTermLower) ||
      studentName.includes(searchTermLower)
    );
  });
  /**
   * Formats a date string to a readable format (Hebrew locale).
   */
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  /**
   * Returns a color class for a score value.
   */
  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };
  /**
   * Navigates to the details page for a specific student.
   */
  const handleViewStudentDetails = (student) => {
    navigate(`/all-reports/${student.studentId}`);
  };
  /**
   * Handles going back to the list of all students.
   */
  const handleBack = () => {
    setSelectedStudent(null);
    navigate('/all-reports');
  };
  /**
   * Renders a progress chart for a student's SEL analysis.
   * Used in StudentDetails.
   */
  const renderAnalysisChart = (analysis) => {
    if (!analysis) return null;
    const categories = [
      {
        key: 'selfAwareness',
        label: 'Self Awareness',
        color: 'from-blue-400 to-blue-600',
        solidColor: '#3B82F6',
      },
      {
        key: 'selfManagement',
        label: 'Self Management',
        color: 'from-green-400 to-green-600',
        solidColor: '#10B981',
      },
      {
        key: 'socialAwareness',
        label: 'Social Awareness',
        color: 'from-yellow-400 to-yellow-600',
        solidColor: '#F59E0B',
      },
      {
        key: 'relationshipSkills',
        label: 'Relationship Skills',
        color: 'from-purple-400 to-purple-600',
        solidColor: '#8B5CF6',
      },
      {
        key: 'responsibleDecisionMaking',
        label: 'Responsible Decision Making',
        color: 'from-red-400 to-red-600',
        solidColor: '#EF4444',
      },
    ];
    
    return (
      <div className="space-y-6">
        {/* Chart Container with ref for PDF export */}
        <div 
          className={`p-8 rounded-lg shadow-lg relative ${isDark ? 'bg-slate-800' : 'bg-white'}`}
          style={{ minHeight: '500px' }}
        >
          <h3 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Student Progress Analysis - {getStudentDisplayName(selectedStudent)}
          </h3>
          <div className="space-y-6">
            {categories.map((category) => {
              let score = 0;
              if (analysis[category.key]) {
                if (
                  typeof analysis[category.key] === 'object' &&
                  analysis[category.key].score
                ) {
                  score = analysis[category.key].score;
                } else if (typeof analysis[category.key] === 'number') {
                  score = analysis[category.key];
                }
              }
              score = Math.max(0, Math.min(5, score));
              const percentage = (score / 5) * 100;
              
              return (
                <div key={category.key} className="space-y-3">
                  <div className={`text-base font-semibold flex justify-between items-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    <span>{category.label}</span>
                    <span className="text-lg font-bold" style={{ color: category.solidColor }}>
                      {score.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-10 bg-gray-200 rounded-full relative overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000 ease-out rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: category.solidColor
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  // Show loading spinner and message while initializing or loading
  if (initializing || loading) {
    return (
      <div
        className={`flex flex-col min-h-screen w-screen ${
          isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
        }`}
      >
        <div className="px-4 mt-4">
          <TeacherHeader />
        </div>
        <main className="flex-1 w-full px-4 py-6 min-h-[650px] transition-all duration-300 ease-in-out">
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading students progress...</p>
          </div>
        </main>
        <div className="px-4 pb-4">
          <Footer />
        </div>
      </div>
    );
  }
  return (
    <div
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
      }`}
    >
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>
      <main className="flex-1 w-full px-4 py-6 min-h-[650px] transition-all duration-300 ease-in-out">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded transition-opacity duration-300 ease-in opacity-100`}>
          <div className="mb-6">
            {/* Header and search box, or back button and student name if a student is selected */}
            {!selectedStudent ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-2xl font-bold">👥 All Students Progress</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  View progress of all students who participated in your classes
                </p>
                <StudentSearchBox
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  isDark={isDark}
                />
              </>
            ) : (
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBack}
                    className="px-4 py-1.5 text-sm font-medium border border-blue-500 text-blue-500 rounded hover:bg-blue-100 transition"
                  >
                    ⬅️ Back to all students
                  </button>
                  <h1 className="text-2xl font-bold">
                    📄 Progress Report – {getStudentDisplayName(selectedStudent)}
                  </h1>
                </div>
              </div>
            </div>
            )}
          </div>
          {/* Error message if any */}
          {error && <ErrorMessage error={error} />}
          {/* Student list or student details */}
          {!selectedStudent ? (
            <StudentList
              students={filteredStudents}
              onClick={handleViewStudentDetails}
              getStudentDisplayName={getStudentDisplayName}
              getStudentProfilePic={getStudentProfilePic}
              handleImageError={handleImageError}
              formatDate={formatDate}
              getScoreColor={getScoreColor}
              isDark={isDark}
            />
          ) : (
            <StudentDetails
              student={selectedStudent}
              onBack={handleBack}
              renderAnalysisChart={renderAnalysisChart}
              isDark={isDark}
              getStudentDisplayName={getStudentDisplayName}
              getStudentProfilePic={getStudentProfilePic}
              handleImageError={handleImageError}
              formatDate={formatDate}
              getScoreColor={getScoreColor}
            />
          )}
        </div>
      </main>
      {/* AI Chat Floating Button */}
      {user?.id && <AIChat teacherId={user.id} />}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

/**
 * AllReports
 * 
 * Wrapper component to extract studentId from route and render AllStudentsProgressContent.
 */


const AllReports = () => {
  const { studentId } = useParams();

  return (
    <ThemeProvider>
      <UserProvider>
        <AllStudentsProgressContent studentIdFromRoute={studentId} />
      </UserProvider>
    </ThemeProvider>
  );
};

export default AllReports;
