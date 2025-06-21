import { createContext, useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';

const StudentNotificationsContext = createContext();

export const StudentNotificationsProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const userId = user?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notifications from server for current user
  const fetchNotifications = async () => {
    if (!userId) return; // No user ID, skip
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/studentNotifications/student/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        console.warn(`Request failed with status ${response.status}`);
        return;
      }
      setNotifications(data);
      setNotificationCount(data.filter(n => !n.read).length);
    } catch (err) {
    setError(err.message);
    }
    finally {
    setIsLoading(false);
    }
  };

  // Mark single notification as read and refresh list
  const markNotificationAsRead = async (notificationId) => {
    
    setIsLoading(true);
    setError(null);
    try {
      await fetch(`/api/studentNotifications/mark-as-read/${notificationId}`, {
        method: 'PATCH',
      });
      await fetchNotifications();
    } catch (err) {
    setError(err.message);
    }
    finally {
    setIsLoading(false);
    }
  };

  // Mark all notifications as read and refresh list
  const markAllNotificationsAsRead = async () => {
    if (!userId) return; // safety check
    
    setIsLoading(true);
    setError(null);
    try {
      await fetch(`/api/studentNotifications/mark-all-as-read/${userId}`, {
        method: 'PATCH',
      });
      await fetchNotifications();
    } catch (err) {
    setError(err.message);
    }
    finally {
    setIsLoading(false);
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
      isLoading,
      error,
      fetchNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead
    }}>
      {children}
    </StudentNotificationsContext.Provider>
  );
};

export const useStudentNotification = () => useContext(StudentNotificationsContext);
