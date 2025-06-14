import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { exportElementAsPDF } from './pdfExporter';

import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeProvider, ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';

import StudentOverviewHeader from '../../components/StudentProgressForTeacher/StudentOverviewHeader';
import ClassProgressCard from '../../components/StudentProgressForTeacher/ClassProgressCard';

const ProgressOfChosenStudentContent = () => {
  const { studentId } = useParams();
  const location = useLocation();
  const passedStudent = location.state?.student || null;

  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const isDark = theme === 'dark';

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const exportRef = useRef(); // 🔵 רפרנס לייצוא PDF
const handleExportPDF = () => {
  exportElementAsPDF(exportRef.current, `student-${studentId}-progress.pdf`);
};
  useEffect(() => {
    async function fetchStudentData() {
      try {
        const res = await fetch(`/api/teacher/${user.id}/student/${studentId}/progress`);
        if (!res.ok) throw new Error('Failed to fetch student progress data');
        const data = await res.json();
        setStudentData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudentData();
  }, [studentId]);

  const baseClasses = `flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`;

  if (loading) {
    return (
      <div className={baseClasses}>
        <div className="px-4 mt-4"><TeacherHeader /></div>
        <main className="flex-1 w-full px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading student data...</span>
          </div>
        </main>
        <div className="px-4 pb-4"><Footer /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={baseClasses}>
        <div className="px-4 mt-4"><TeacherHeader /></div>
        <main className="flex-1 w-full px-4 py-6">
          <div className="p-6 text-center text-red-600">
            Error: {error}
          </div>
        </main>
        <div className="px-4 pb-4"><Footer /></div>
      </div>
    );
  }

  if (!studentData) return null;

  return (
    <div className={baseClasses}>
      <div className="px-4 mt-4"><TeacherHeader /></div>

      <main className="flex-1 w-full px-4 py-6">

<div className="w-full flex justify-end mb-4 pr-4">
  <button
    onClick={handleExportPDF}
    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-all"
  >
    Export PDF
  </button>
</div>



        {/* 🔵 תוכן לייצוא */}
        <div ref={exportRef} className="space-y-6">
          <StudentOverviewHeader
            student={{
              id: studentId,
              username: passedStudent?.username || studentData.username,
              profilePic: passedStudent?.profilePic || studentData.profilePic,
              classes: studentData.classes,
              totalAttempts: passedStudent?.totalAttempts || studentData.totalAttempts,
              uniqueSimulations: passedStudent?.uniqueSimulations || studentData.uniqueSimulations,
              averageScore: passedStudent?.averageScore || studentData.averageScore
            }}
            isDark={isDark}
          />

          {studentData.classes.map((classData, index) => (
            <ClassProgressCard
              key={index}
              classData={classData}
              isDark={isDark}
            />
          ))}
        </div>
      </main>

      {user?.id && <AIChat teacherId={user.id} />}

      <div className="px-4 pb-4"><Footer /></div>
    </div>
  );
};

const ProgressOfChosenStudent = () => (
  <ThemeProvider>
    <ProgressOfChosenStudentContent />
  </ThemeProvider>
);

export default ProgressOfChosenStudent;
