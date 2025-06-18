import { createContext, useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/notifications/teacher/${userId}`);
      if (!response.ok) {
        console.error("❌ Fetch failed:", response.statusText);
        return;
      }
      const data = await response.json();
      setNotifications(data || []);
      setNotificationCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <NotificationsContext.Provider value={{
      notifications,
      notificationCount,
      fetchNotifications,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
