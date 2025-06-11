import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ClassCard from './ClassCard';
import TeacherHeader from "../../layout/TeacherHeader";
import Footer from "../../layout/Footer";
import { ThemeProvider, ThemeContext } from "../../DarkLightMood/ThemeContext";
import { UserContext } from '../../context/UserContext';
import AIChat from '../../AI/AIChat';


 //This component is responsible for displaying and managing the teacher's classes.
 
const ClassManagerContent = () => {
  // Access theme from ThemeContext
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // Access current user from UserContext
  const { user } = useContext(UserContext);

  // State for classes, loading, errors, and filters
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [classCodeFilter, setClassCodeFilter] = useState('');

  /**
   * useEffect to fetch classes when the component mounts or when the user changes.
   * Fetches classes for the current teacher from the backend API.
   */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Check if user ID exists
        if (!user?.id) {
          setError('No user ID found.');
          setLoading(false);
          return;
        }

        // Fetch classes from API
        const response = await fetch(`/api/classes/teacher/${user.id}`);
        const data = await response.json();

        console.log("📦 Response from server:", data);

        if (response.ok) {
          // Format the data for the UI
          const formattedData = data.map((item) => ({
            _id: item._id || '',
            classCode: item.classCode || item.id || '',
            className: item.className || item.name || '',
            subject: item.subject || '',
            createdAt: item.createdAt || item.createdDate || '',
            studentsTaken: item.students || [],
          }));

          console.log("📚 Formatted classes:", formattedData);

          setClasses(formattedData);
          setError('');
        } else {
          setError(data.message || 'Failed to fetch classes.');
        }
      } catch (err) {
        console.error('❌ Error fetching classes:', err.message);
        setError('Server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  /**
   * Filter classes based on search term and class code filter.
   */
  const filteredClasses = classes.filter(classData => {
    const matchesSearch = searchTerm === '' ||
      classData.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classData.classCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClassCode = classCodeFilter === '' || classData.classCode.includes(classCodeFilter);
    return matchesSearch && matchesClassCode;
  });

  return (
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
      {/* Page Header */}
      <div className="px-4 mt-4">
        <TeacherHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
          <h1 className="text-2xl font-bold mb-1">Manage My Classes</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            View and manage all your classes and student progress in one place
          </p>

          {/* Search and Filter Section */}
          <div className="bg-white dark:bg-slate-600 p-4 rounded shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search classes..."
                  className="w-full py-2 px-4 pr-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Search Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute right-3 top-2.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {/* Class Code Filter Input */}
              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                <input
                  type="text"
                  placeholder="Class Code..."
                  className="py-2 px-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={classCodeFilter}
                  onChange={(e) => setClassCodeFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Classes List */}
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              // Loading State
              <div className="text-center py-10">Loading classes...</div>
            ) : error ? (
              // Error State
              <div className="bg-red-100 dark:bg-red-500 p-5 rounded text-center">
                <p>{error}</p>
              </div>
            ) : filteredClasses.length === 0 ? (
              // Empty State
              <div className="bg-white dark:bg-slate-600 p-5 rounded text-center">
                <p>No classes found.</p>
              </div>
            ) : (
              // Render Class Cards
              filteredClasses
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((classData) => {
                  console.log("🎯 Rendering ClassCard with:", classData);
                  return <ClassCard key={classData._id || classData.classCode} classData={classData} />;
                })
            )}
          </div>

          {/* Create New Class Button */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/teacher/Create_New_Class"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg shadow-md flex items-center gap-2 text-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Create New Class</span>
            </Link>
          </div>
        </div>
      </main>
      {/* AI Chat for Teacher Assistance */}
      {user?.id && <AIChat teacherId={user.id} />}

      {/* Page Footer */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

/**
 * ClassManager Component
 * 
 * Wraps ClassManagerContent with ThemeProvider to provide theme context.
 */
const ClassManager = () => (
  <ThemeProvider>
    <ClassManagerContent />
  </ThemeProvider>
);

export default ClassManager;
