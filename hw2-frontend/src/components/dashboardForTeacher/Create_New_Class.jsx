// File: src/pages/Create_New_Class.jsx
import React, { useContext,useRef,useEffect,useState } from 'react';
import ClassForm from '../ClassForm';
import TeacherHeader from '../../layout/TeacherHeader';
import Footer from '../../layout/Footer';
import { ThemeProvider, ThemeContext } from '../../DarkLightMood/ThemeContext';
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';

/*
   Create_new_calss component
    The component allows a teacher to create a new class.
*/


const CreateClassContent = () => {
  const { theme } = useContext(ThemeContext); // Get current theme
  const { user } = useContext(UserContext);   // Get current user (teacher)
  const isDark = theme === 'dark';            // Boolean for dark mode
  const [showInfo, setShowInfo] = useState(false);


  return (
    // Main container with theme-based background and text color
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
      {/* Header for teachers */}
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>

      {/* Main content area */}
      <main className="flex-1 w-full px-4 py-6">
        {/* Card for class creation instructions and form */}
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
          <div className="flex items-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded">

          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>
            Create a New Class
          </h1>
          {/* כפתור אינפו קטן ליד הכותרת */}
            <button
              onClick={() => setShowInfo(true)}
              className="ml-2 p-1 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-blue-200 dark:hover:bg-slate-500 transition"
              aria-label="How it works info"
              title="How it works"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
              </svg>
            </button>
          </div>


          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
            Create a class with AI-generated situational questions that analyze student responses using the CASEL 5 framework
          </p>
          {/* The actual class creation form */}
          <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
            <ClassForm />
          </div>
        </div>
      </main>
      {/* הפופאפ של "How it works" */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-10/12 max-w-xl text-slate-800 dark:text-white">
            <h3 className="font-medium text-blue-800 dark:text-blue-300">How it works:</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              After entering class details, our AI will generate a short scenario with a question.
              You'll be able to review and regenerate if needed before creating the class.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
              <li>AI generates a short situational scenario (about 50 words)</li>
              <li>It creates an open-ended question for students</li>
              <li>Student responses will be analyzed using the CASEL 5 framework</li>
              <li>You'll receive detailed reports on each student's social-emotional competencies</li>
            </ul>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Floating AI Chat button for teachers */}
      {user?.id && <AIChat teacherId={user.id} />}

      {/* Footer at the bottom */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const Create_New_Class = () => {
  // Wrap the content with ThemeProvider to enable theme context
  return (
    <ThemeProvider>
      <CreateClassContent />
    </ThemeProvider>
  );
};

export default Create_New_Class;
