import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { RealTimeNotification } from '../../services/websocketService';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationToastProps {
  notification: RealTimeNotification;
  onClose: (id: string) => void;
  onAction?: (actionUrl: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Auto-hide timer
  useEffect(() => {
    if (notification.autoHide && notification.duration) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (notification.duration! / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [notification.autoHide, notification.duration]);

  // Animation on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.toast-container', 
        { 
          opacity: 0, 
          x: 300, 
          scale: 0.8 
        },
        { 
          opacity: 1, 
          x: 0, 
          scale: 1, 
          duration: 0.4, 
          ease: 'back.out(1.7)' 
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleClose = () => {
    const ctx = gsap.context(() => {
      gsap.to('.toast-container', {
        opacity: 0,
        x: 300,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setIsVisible(false);
          onClose(notification.id);
        }
      });
    });

    return () => ctx.revert();
  };

  const handleAction = () => {
    if (notification.actionUrl && onAction) {
      onAction(notification.actionUrl);
      handleClose();
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return {
          container: 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30',
          progress: 'bg-green-500'
        };
      case 'error':
        return {
          container: 'bg-gradient-to-r from-red-600/20 to-red-500/20 border-red-500/30',
          progress: 'bg-red-500'
        };
      case 'warning':
        return {
          container: 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30',
          progress: 'bg-yellow-500'
        };
      case 'info':
      default:
        return {
          container: 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30',
          progress: 'bg-blue-500'
        };
    }
  };

  const colors = getColorClasses();

  if (!isVisible) return null;

  return (
    <div className={`toast-container relative max-w-sm w-full ${colors.container} border rounded-xl p-4 backdrop-blur-md shadow-lg`}>
      {/* Progress bar for auto-hide */}
      {notification.autoHide && notification.duration && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 rounded-t-xl overflow-hidden">
          <div 
            className={`h-full ${colors.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-white/80 leading-relaxed">
            {notification.message}
          </p>

          {/* Action button */}
          {notification.actionUrl && (
            <button
              onClick={handleAction}
              className="mt-3 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              View Details
            </button>
          )}

          {/* Timestamp */}
          <div className="mt-2 text-xs text-white/50">
            {new Date(notification.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/60 hover:text-white/80 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast container component
export const NotificationToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<RealTimeNotification[]>([]);

  // Show only the latest 5 notifications as toasts
  useEffect(() => {
    const recentNotifications = notifications
      .filter(n => !n.isRead)
      .slice(0, 5);
    setVisibleNotifications(recentNotifications);
  }, [notifications]);

  const handleAction = (actionUrl: string) => {
    // Navigate to the action URL
    window.location.href = actionUrl;
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {visibleNotifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast
            notification={notification}
            onClose={removeNotification}
            onAction={handleAction}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationToast; 