import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';

/*
  DashboardOverview Component
  This component displays a summary of the teacher's dashboard, including:
  - Number of active classes
  - Total students
  - Most frequent topic
  Data is fetched from the backend based on the logged-in teacher's ID.
  The component shows loading state, error handling (in console), and uses icons for each stat.
*/

const DashboardOverview = () => {
  const { user } = useContext(UserContext); // Get current user (teacher) from context

  // State for summary stats
  const [summary, setSummary] = useState({
    activeClasses: 0,
    totalStudents: 0,
    mostCommonTopic: 'N/A'
  });

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard summary from backend
    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/teacher/${user?.id}/summary`);
        const data = await res.json();
        setSummary(data); // Update summary state with fetched data
      } catch (error) {
        console.error('Error fetching dashboard summary:', error); // Log error to console
      } finally {
        setLoading(false); // Hide loading indicator
      }
    };

    if (user?.id) {
      fetchSummary(); // Fetch summary only if user is logged in
    }
  }, [user?.id]);

  // Array of stats to display in the dashboard
  const stats = [
    {
      label: "Active Classes",
      value: summary.activeClasses,
      icon: (
        // Icon for active classes
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-indigo-600 dark:text-indigo-400">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      )
    },
    {
      label: "Total Students",
      value: summary.totalStudents,
      icon: (
        // Icon for total students
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-teal-600 dark:text-teal-400">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      label: "Most Frequent Topic",
      value: summary.mostCommonTopic || "N/A",
      icon: (
        // Icon for most frequent topic
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-yellow-600 dark:text-yellow-400">
          <path d="M4 4h16v2H4zM4 10h16v2H4zM4 16h16v2H4z"></path>
        </svg>
      )
    }
  ];

  // Show loading indicator while fetching data
  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-300">Loading summary...</div>;
  }

  return (
    // Grid layout for stats cards
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        // Card for each stat
        <div key={index} className="bg-white dark:bg-slate-600 dark:text-white rounded-md shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className="text-lg">{stat.icon}</div> {/* Stat icon */}
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{stat.label}</div> {/* Stat label */}
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</div> {/* Stat value */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardOverview;
