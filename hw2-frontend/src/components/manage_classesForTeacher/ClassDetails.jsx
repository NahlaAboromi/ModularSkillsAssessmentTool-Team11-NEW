import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeProvider, ThemeContext } from '../../DarkLightMood/ThemeContext';
import SimulationBox from './SimulationBox';
import StudentAnswerCard from './StudentAnswerCard';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';


 //ClassDetailsContent  component displays all the details for a specific class:
 

const ClassDetailsContent = () => {
  // Get theme from ThemeContext (dark/light)
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  // Get classCode from URL params
  const { classCode } = useParams();

  // Holds the class info fetched from the backend
  const [classInfo, setClassInfo] = useState(null);
  // Holds the AI-generated insight for the class
  const [classInsight, setClassInsight] = useState('');
  // Get the logged-in user from UserContext
  const { user } = useContext(UserContext);

  // Fetch class info when component mounts or classCode changes
  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const res = await fetch(`/api/classes/get-class-by-code?classCode=${classCode}`);
        const data = await res.json();
        setClassInfo(data);
      } catch (error) {
        console.error("❌ Failed to fetch class data:", error);
      }
    };

    fetchClassInfo();
  }, [classCode]);

  // Fetches AI insight for the class when requested
  const getClassInsightFromAI = async () => {
    try {
      const res = await fetch('/api/classes/ai-class-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode })
      });

      const data = await res.json();
      if (res.ok) {
        setClassInsight(data.insight);
      } else {
        setClassInsight(`⚠️ ${data.message}`);
      }
    } catch (error) {
      console.error('❌ Error getting AI class insight:', error);
      setClassInsight('❌ Server error while requesting class insight.');
    }
  };

  return (
    // Main page wrapper with dynamic background/text color based on theme
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
      {/* Header */}
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>

      {/* Main content */}
      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded mb-6`}>
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span role="img" aria-label="book">📘</span> Class Details
          </h1>
          <p className="text-lg">
            Class Code: <span className="bg-gray-100 dark:bg-slate-600 px-3 py-1 rounded font-mono">{classCode}</span>
          </p>
        </div>

        {classInfo ? (
          <>
            {/* Simulation scenario and button to get AI insight */}
            <SimulationBox
              simulationText={classInfo.question}
              situation={classInfo.situation}
              onGetClassInsight={getClassInsightFromAI}
            />

            {/* AI insight section, if available */}
            {classInsight && (
              <div className="mt-4 mb-6 p-4 rounded bg-yellow-100 text-yellow-900 shadow">
                <h3 className="text-lg font-semibold mb-2">🧠 AI Insight for the Class:</h3>
                <p>{classInsight}</p>
              </div>
            )}

            {/* Always show all student answer cards */}
            {classInfo.students.map((student) => (
              <StudentAnswerCard key={student._id} answer={student} isDark={isDark} />
            ))}
          </>
        ) : (
          <p>Loading class information...</p>
        )}
      </main>
      {user?.id && <AIChat teacherId={user.id} />}

      {/* Footer */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

// Page wrapper that provides ThemeProvider to all content
const ViewClassDetails = () => {
  return (
    <ThemeProvider>
      <ClassDetailsContent />
    </ThemeProvider>
  );
};

export default ViewClassDetails;
