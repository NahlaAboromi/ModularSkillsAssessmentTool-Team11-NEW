import React, { useEffect } from 'react';
import { useNotifications } from '../context/NotificationsContext';
import { useLocation } from 'react-router-dom';

const RecentActivity = () => {
  const { notifications, fetchNotifications } = useNotifications();
  const location = useLocation();

  useEffect(() => {
    console.log('🔄 useEffect triggered, location:', location.pathname);
    fetchNotifications();
    console.log('📤 Called fetchNotifications (initial)');

    const interval = setInterval(() => {
      console.log('⏰ Interval fetchNotifications called');
      fetchNotifications();
    }, 5000);

    return () => {
      console.log('🛑 Cleaning up interval');
      clearInterval(interval);
    };
  }, [fetchNotifications, location.pathname]);

  console.log('📦 Current notifications:', notifications);

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  console.log('📋 Sorted notifications:', sortedNotifications);

  const recentNotifications = sortedNotifications.slice(0, 3);
  console.log('✨ Recent notifications (top 3):', recentNotifications);

  const getTypeStyle = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'exam': return 'bg-yellow-400 text-black';
      case 'message': return 'bg-blue-400 text-white';
      case 'schedule': return 'bg-purple-500 text-white';
      case 'warning': return 'bg-red-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return '✔️';
      case 'exam': return '📝';
      case 'message': return '💬';
      case 'schedule': return '📅';
      case 'warning': return '⚠️';
      default: return '🔔';
    }
  };

  if (!notifications.length) {
    console.log('⚠️ No notifications to display');
    return (
      <div className="text-center text-gray-500 dark:text-gray-300">
        No activities found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-600 dark:text-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
      <ul className="space-y-4">
        {recentNotifications.map((activity, index) => (
          <li
            key={activity._id || activity.createdAt || index}
            className="border-b pb-2 border-gray-200 dark:border-gray-500 flex items-start gap-3"
          >
            <div
              className={`flex-shrink-0 mt-1 w-8 h-8 ${getTypeStyle(activity.type)} rounded-full flex items-center justify-center`}
            >
              <span>{getTypeIcon(activity.type)}</span>
            </div>
            <div>
              <div className="font-medium">{activity.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'No date'}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
