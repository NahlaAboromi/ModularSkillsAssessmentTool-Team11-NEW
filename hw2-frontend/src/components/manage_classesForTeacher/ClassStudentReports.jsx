import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeProvider, ThemeContext } from '../../DarkLightMood/ThemeContext';
import StudentReportCard from './StudentReportCard';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';


 //StudentReportsContent displays all student analysis reports for a specific class.


const StudentReportsContent = () => {
  // Get classCode from URL params
  const { classCode } = useParams();
  // Get current theme from ThemeContext
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  // Get the logged-in user from UserContext
  const { user } = useContext(UserContext);

  // Holds the fetched class information (object or null)
  const [classInfo, setClassInfo] = useState(null);

  // Fetch class data from backend when component mounts or classCode changes
  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`/api/classes/get-class-by-code?classCode=${classCode}`);
        const data = await res.json();
        setClassInfo(data);
      } catch (error) {
        console.error('❌ Error fetching class info:', error);
      }
    };

    fetchClass();
  }, [classCode]);

  /**
   * Groups student simulation attempts by studentId.
   * Only includes students with analysisResult.
   * Returns an array of arrays, each containing all attempts for a unique student.
   */
  const groupStudentsByStudentId = (students) => {
    const grouped = {};
    
    students
      .filter(student => student.analysisResult)
      .forEach(student => {
        const key = student.studentId || student._id;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(student);
      });

    return Object.values(grouped);
  };

  // Grouped student attempts for rendering
  const studentGroups = classInfo ? groupStudentsByStudentId(classInfo.students || []) : [];

  return (
    // Main page wrapper with dynamic background/text color based on theme
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
      {/* Header */}
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>

      {/* Main content area */}
      <main className="flex-1 w-full px-4 py-6">
        {/* Class info and summary */}
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded mb-6`}>
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span role="img" aria-label="chart">📊</span> Student Reports
          </h1>
          <p className="text-lg">
            Class Code: <span className="bg-gray-100 dark:bg-slate-600 px-3 py-1 rounded font-mono">{classCode}</span>
          </p>
          {/* Show number of unique students with analysis data */}
          {classInfo && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              📚 {studentGroups.length} unique student{studentGroups.length !== 1 ? 's' : ''} with analysis data
            </div>
          )}
        </div>

        {/* Main reports section */}
        {classInfo ? (
          studentGroups.length > 0 ? (
            // Render a StudentReportCard for each unique student group
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentGroups.map((studentGroup, index) => (
                <StudentReportCard 
                  key={`${studentGroup[0].studentId || studentGroup[0]._id}-${index}`} 
                  studentGroup={studentGroup} 
                />
              ))}
            </div>
          ) : (
            // Empty state if no analyzed students
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl text-gray-500 dark:text-gray-300 mb-2">
                No analyzed student data available
              </p>
              <p className="text-sm text-gray-400">
                Students need to complete simulations before reports can be generated.
              </p>
            </div>
          )
        ) : (
          // Loading state while fetching class data
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading class data...</p>
          </div>
        )}
      </main>
      
      {/* AIChat for teacher, only if logged in */}
      {user?.id && <AIChat teacherId={user.id} />}

      {/* Footer */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

/**
 * ClassStudentReports is a wrapper that provides ThemeProvider context to the reports page.
 */
const ClassStudentReports = () => {
  return (
    <ThemeProvider>
      <StudentReportsContent />
    </ThemeProvider>
  );
};

export default ClassStudentReports;
