import { createContext, useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';

const StudentNotificationsContext = createContext();

export const StudentNotificationsProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const userId = user?.id;

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notifications from server for current user
  const fetchNotifications = async () => {
    if (!userId) return; // No user ID, skip

    try {
      const response = await fetch(`/api/studentNotifications/student/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        console.warn(`Request failed with status ${response.status}`);
        return;
      }

      console.log("📦 Notifications fetched:", data);

      setNotifications(data);
      setNotificationCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
    }
  };

  // Mark single notification as read and refresh list
  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`/api/studentNotifications/mark-as-read/${notificationId}`, {
        method: 'PATCH',
      });
      await fetchNotifications();
    } catch (err) {
      console.error("❌ Failed to mark notification as read:", err);
    }
  };

  // Mark all notifications as read and refresh list
  const markAllNotificationsAsRead = async () => {
    if (!userId) return; // safety check
    try {
      await fetch(`/api/studentNotifications/mark-all-as-read/${userId}`, {
        method: 'PATCH',
      });
      await fetchNotifications();
    } catch (err) {
      console.error("❌ Failed to mark all notifications as read:", err);
    }
  };

  // Fetch notifications once userId is available and whenever it changes
  useEffect(() => {
    if (userId) {
      console.log("✅ userId ready, fetching notifications:", userId);
      fetchNotifications();
    } else {
      console.log("⏳ userId not ready yet");
    }
  }, [userId]);

  return (
    <StudentNotificationsContext.Provider value={{
      notifications,
      notificationCount,
      fetchNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead
    }}>
      {children}
    </StudentNotificationsContext.Provider>
  );
};

export const useStudentNotification = () => useContext(StudentNotificationsContext);
