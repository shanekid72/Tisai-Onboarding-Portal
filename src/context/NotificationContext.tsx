import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import websocketService, { RealTimeNotification } from '../services/websocketService';
import { useAdminAuth } from './AdminAuthContext';

// Notification Context Type
interface NotificationContextType {
  notifications: RealTimeNotification[];
  unreadCount: number;
  isConnected: boolean;
  addNotification: (notification: Omit<RealTimeNotification, 'id' | 'timestamp'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authState } = useAdminAuth();
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const connectWebSocket = async () => {
        try {
          await websocketService.connect(authState.user!.id, authState.user!.role);
          setIsConnected(true);
          console.log('🔔 Notification system initialized');
        } catch (error) {
          console.error('Failed to connect to notification service:', error);
          setIsConnected(false);
        }
      };

      connectWebSocket();

      // Set up event listeners
      websocketService.on('notification', handleNewNotification);
      websocketService.on('document_approved', handleDocumentApproved);
      websocketService.on('document_rejected', handleDocumentRejected);
      websocketService.on('onboarding_status_update', handleOnboardingUpdate);
      websocketService.on('contact_created', handleContactCreated);
      websocketService.on('task_assigned', handleTaskAssigned);

      // Cleanup on unmount or user change
      return () => {
        websocketService.off('notification', handleNewNotification);
        websocketService.off('document_approved', handleDocumentApproved);
        websocketService.off('document_rejected', handleDocumentRejected);
        websocketService.off('onboarding_status_update', handleOnboardingUpdate);
        websocketService.off('contact_created', handleContactCreated);
        websocketService.off('task_assigned', handleTaskAssigned);
        websocketService.disconnect();
        setIsConnected(false);
      };
    }
  }, [authState.isAuthenticated, authState.user]);

  // Event handlers
  const handleNewNotification = (notification: RealTimeNotification) => {
    console.log('📨 New notification received:', notification);
    setNotifications(prev => [notification, ...prev]);

    // Auto-hide notification if specified
    if (notification.autoHide && notification.duration) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  const handleDocumentApproved = (data: any) => {
    console.log('📄✅ Document approved:', data);
    // Additional handling for document approval
  };

  const handleDocumentRejected = (data: any) => {
    console.log('📄❌ Document rejected:', data);
    // Additional handling for document rejection
  };

  const handleOnboardingUpdate = (data: any) => {
    console.log('🚀 Onboarding status updated:', data);
    // Additional handling for onboarding updates
  };

  const handleContactCreated = (data: any) => {
    console.log('👤 Contact created:', data);
    // Additional handling for contact creation
  };

  const handleTaskAssigned = (data: any) => {
    console.log('📋 Task assigned:', data);
    // Additional handling for task assignment
  };

  // Notification management functions
  const addNotification = (notificationData: Omit<RealTimeNotification, 'id' | 'timestamp'>) => {
    const notification: RealTimeNotification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto-hide if specified
    if (notification.autoHide && notification.duration) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using notification context
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Export websocket service for direct access
export { websocketService }; 