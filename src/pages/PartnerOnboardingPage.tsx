import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { PartnerOnboardingProvider } from '../context/PartnerOnboardingContext';
import { CRMDataProvider } from '../context/CRMDataContext';
import PartnerOnboardingChat from '../components/onboarding/PartnerOnboardingChat';
import DependencyCheck from '../components/onboarding/DependencyCheck';
import ErrorBoundary from '../components/common/ErrorBoundary';

const PartnerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [debugMode, setDebugMode] = useState(true);
  const [loadComplete, setLoadComplete] = useState(false);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Create GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      // Set initial visibility to ensure elements are visible
      gsap.set('.onboarding-header', { opacity: 1, y: 0 });
      gsap.set('.onboarding-main', { opacity: 1, y: 0 });
      
      // Page entry animation with proper fromTo
      gsap.fromTo('.onboarding-header', 
        { opacity: 0, y: -20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power2.out',
          force3D: false
        }
      );
      
      gsap.fromTo('.onboarding-main', 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          delay: 0.2, 
          ease: 'power2.out',
          force3D: false
        }
      );
    });
    
    // Cleanup function
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white overflow-hidden">
      {/* Custom Header - No Navbar overlap */}
      <div className="onboarding-header relative z-10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border-b border-white/10" style={{ opacity: 1 }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Left Side - Back to Home Button */}
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Home</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                WorldAPI Partner Onboarding
              </h1>
              <p className="text-sm text-white/60 mt-1">
                AI-Guided Partnership Journey
              </p>
            </div>
            
            {/* Right Side - AI Agent Status and Admin Panel */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-white/60">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span>AI Agent Active</span>
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors backdrop-blur-sm border border-white/10"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="onboarding-main h-[calc(100vh-88px)] overflow-hidden" style={{ opacity: 1 }}>
        {/* Debug Mode Toggle */}
        <div className="absolute top-20 right-4 z-50">
          <button 
            onClick={() => setDebugMode(!debugMode)}
            className="bg-gray-800/80 hover:bg-gray-700/80 text-xs text-white/70 px-3 py-1 rounded border border-white/10 backdrop-blur-sm shadow-lg"
          >
            {debugMode ? 'Exit Debug Mode' : 'Debug Mode'}
          </button>
        </div>

        {debugMode ? (
          <div className="h-full overflow-auto p-6">
            <div className="bg-gray-800/90 border border-white/10 rounded-lg p-6 max-w-4xl mx-auto mb-6">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Diagnostic Mode</h2>
              <p className="text-white/70 mb-4">This mode helps identify issues with component loading and rendering.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900/60 p-4 rounded border border-white/5">
                  <h3 className="font-medium text-white/90 mb-2">Component Import Status</h3>
                  <ErrorBoundary fallback={<div className="text-red-400">Failed to check dependencies</div>}>
                    <DependencyCheck />
                  </ErrorBoundary>
                </div>
                <div className="bg-gray-900/60 p-4 rounded border border-white/5">
                  <h3 className="font-medium text-white/90 mb-2">Environment</h3>
                  <dl className="text-sm grid grid-cols-2 gap-2">
                    <dt className="text-white/50">Node Env:</dt>
                    <dd className="text-white/80">{process.env.NODE_ENV || 'undefined'}</dd>
                    <dt className="text-white/50">React Version:</dt>
                    <dd className="text-white/80">{React.version}</dd>
                  </dl>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setDebugMode(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Show Regular View
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-white/50 hover:text-white text-sm transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ErrorBoundary
            fallback={
              <div className="h-full flex items-center justify-center p-8 bg-gray-900/80">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-2xl mx-auto text-center">
                  <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Onboarding Experience</h2>
                  <p className="text-white/70 mb-4">We encountered a problem loading the partner onboarding experience.</p>
                  <p className="text-white/50 mb-4 text-sm">The development team has been notified and is working to resolve this issue.</p>
                  <div className="flex justify-center space-x-4">
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Reload Page
                    </button>
                    <button 
                      onClick={() => setDebugMode(true)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Enable Debug Mode
                    </button>
                  </div>
                </div>
              </div>
            }
          >
            <CRMDataProvider>
              <PartnerOnboardingProvider>
                <PartnerOnboardingChat />
              </PartnerOnboardingProvider>
            </CRMDataProvider>
          </ErrorBoundary>
        )}
      </div>

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
    </div>
  );
};

export default PartnerOnboardingPage; 