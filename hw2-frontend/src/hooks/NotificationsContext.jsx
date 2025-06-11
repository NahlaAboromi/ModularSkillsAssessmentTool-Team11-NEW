import { createContext, useContext, useEffect, useState } from 'react'; // Import required hooks and utilities
import { UserContext } from '../context/UserContext'; // Import UserContext for user data

/**
 * NotificationsContext manages notifications for the current user.
 * It provides functions to fetch, mark as read, and count notifications.
 */

// Create context for notifications
const NotificationsContext = createContext();

// NotificationsProvider wraps the app or part of it and provides notification state and actions
export const NotificationsProvider = ({ children }) => {
  // Get current user from context
  const { user } = useContext(UserContext);
  const userId = user?.id;

  // State for notifications and unread count
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notifications for the current user
  const fetchNotifications = async () => {
    if (!userId) return; // Skip if no user ID

    try {
      // Get notifications from backend
      const response = await fetch(`/api/notifications/teacher/${userId}`);
      const data = await response.json();
      setNotifications(data || []); // Update notifications state
      // Update unread count
      setNotificationCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    }
  };

  // Mark a single notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      // Send request to mark notification as read
      await fetch(`/api/notifications/mark-as-read/${notificationId}`, {
        method: 'PATCH',
      });
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error("❌ Failed to mark notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Send request to mark all notifications as read
      await fetch(`/api/notifications/mark-all-as-read/${userId}`, {
        method: 'PATCH',
      });
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error("❌ Failed to mark all notifications as read:", err);
    }
  };

  // Fetch notifications when user ID changes
  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  // Provide notifications, count, and actions to children via context
  return (
    <NotificationsContext.Provider value={{
      notifications,
      notificationCount,
      fetchNotifications,
      markNotificationAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Custom hook for easy access to notifications context
export const useNotifications = () => useContext(NotificationsContext);
