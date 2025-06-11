import React from 'react'; 
import { useNotifications } from '../hooks/NotificationsContext'; 

// Main component to display recent unread activities
const RecentActivity = () => {
  // Get notifications from context
  const { notifications } = useNotifications();

  // Filter only unread notifications
  const unread = notifications.filter(n => !n.read);
  // Sort unread notifications by time (newest first)
  const sortedNotifications = [...unread]
  .sort((a, b) => new Date(b.time) - new Date(a.time))
  .slice(0, 3); // מציג רק שלוש אחרונות


  // Helper function: get background and text color by notification type
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

  // Helper function: get icon by notification type
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

  // If no unread notifications, show message
  if (!unread.length) {
    return <div className="text-center text-gray-500 dark:text-gray-300">No unread activities found.</div>;
  }

  // Render the list of unread notifications
  return (
    <div className="bg-white dark:bg-slate-600 dark:text-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
      <ul className="space-y-4">
        {/* Map through sorted notifications and render each */}
        {sortedNotifications.map((activity, index) => (
          <li key={index} className="border-b pb-2 border-gray-200 dark:border-gray-500 flex items-start gap-3">
            {/* Notification icon with type-specific style */}
            <div className={`flex-shrink-0 mt-1 w-8 h-8 ${getTypeStyle(activity.type)} rounded-full flex items-center justify-center`}>
              <span>{getTypeIcon(activity.type)}</span>
            </div>
            {/* Notification title and time */}
            <div>
              <div className="font-medium">{activity.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">{activity.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
