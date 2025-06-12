// DashboardPage.jsx -----NEW
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import DashboardOverview from './DashboardOverview';
import QuickActions from './QuickActions';

const DashboardPage = () => {
  const { user } = useContext(UserContext);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/teacher/${user?.id}/summary`);
        const data = await res.json();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchSummary();
    }
  }, [user?.id]);

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-300">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* כותרת + מידע כללי */}
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Welcome back, Dr. {user?.name} 👋
      </h1>
      <p className="text-gray-600 dark:text-gray-300">Here's your dashboard overview:</p>

      {/* סיכום סטטיסטיקות */}
      <DashboardOverview summary={summary} />

      {/* פעולות מהירות */}
      <div>
        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  );
};

export default DashboardPage;