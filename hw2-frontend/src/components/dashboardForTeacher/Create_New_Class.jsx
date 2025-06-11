// File: src/pages/Create_New_Class.jsx
import React, { useContext } from 'react';
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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>
            Create a New Class
          </h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
            Create a class with AI-generated situational questions that analyze student responses using the CASEL 5 framework
          </p>

          {/* The actual class creation form */}
          <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
            <ClassForm />
          </div>
        </div>
      </main>

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
