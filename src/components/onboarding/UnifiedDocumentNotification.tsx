import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

interface UnifiedDocumentNotificationProps {
  show: boolean;
  documentName: string;
  documentType: string;
  crmDocumentId?: string;
  onClose: () => void;
}

const UnifiedDocumentNotification: React.FC<UnifiedDocumentNotificationProps> = ({
  show,
  documentName,
  documentType,
  crmDocumentId,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Wait for next frame to ensure DOM element exists
      requestAnimationFrame(() => {
        const element = document.querySelector('.unified-notification');
        if (element) {
          // Animate in
          gsap.fromTo('.unified-notification', 
            { y: 50, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
          );
        }
      });

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    // Animate out
    gsap.to('.unified-notification', {
      y: -50,
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setIsVisible(false);
        onClose();
      }
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="unified-notification bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-xl shadow-2xl border border-green-500/30 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">
                🔄 Document Synced to CRM
              </h4>
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-xs text-white/90 mt-1">
              Your <span className="font-medium">{documentType.toUpperCase()}</span> document has been automatically added to the CRM system
            </p>
            
            <div className="mt-2 text-xs text-white/80">
              <div className="truncate">📄 {documentName}</div>
              {crmDocumentId && (
                <div className="mt-1">🆔 {crmDocumentId}</div>
              )}
            </div>
            
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Available in CRM Documents</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-white/20 rounded-full h-1">
          <div 
            className="bg-white h-1 rounded-full"
            style={{ 
              width: '100%', 
              animation: 'shrinkProgress 5s linear forwards',
              transformOrigin: 'left'
            }}
          ></div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shrinkProgress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
      }} />
    </div>
  );
};

export default UnifiedDocumentNotification; 