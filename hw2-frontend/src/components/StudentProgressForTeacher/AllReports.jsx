import React, { useContext, useEffect, useState } from 'react';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeProvider, ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';
import StudentCard from '../../components/StudentProgressForTeacher/StudentCard';



const AllReportsContent = () => {
  const { theme } = useContext(ThemeContext); // Get current theme
  const { user } = useContext(UserContext);   // Get current user (teacher)
  const isDark = theme === 'dark';            // Boolean for dark mode
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/student-progress/${user.id}`);
        const data = await response.json(); 
        console.log("Fetched students data:", data);
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch student progress:", error);
      }
    };

    fetchStudents();
  }, [user]);

  return (
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>
            All Students Progress
          </h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
            View progress of all students who participated in your classes
          </p>

<div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
  {students.length === 0 ? (
    <p className={`text-center text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
      It looks like no students have joined your classes yet.
    </p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  )}
</div>

        </div>
      </main>

      {user?.id && <AIChat teacherId={user.id} />}

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const AllReports = () => {
  return (
    <ThemeProvider>
      <AllReportsContent />
    </ThemeProvider>
  );
};

export default AllReports;