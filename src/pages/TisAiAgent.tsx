import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Components
import ChatInterface from '../components/chat/ChatInterface';
import ProgressTracker from '../components/progress/ProgressTracker';
import OnboardingSelector from '../components/onboarding/OnboardingSelector';
import FastOnboarding from '../components/onboarding/FastOnboarding';

// Types
type OnboardingMode = 'full' | 'fast-track' | null;

// User info type for fast track
type UserInfo = {
  name: string;
  organization: string;
  email: string;
};

const TisAiAgent = () => {
  const [loading, setLoading] = useState(true);
  const [onboardingMode, setOnboardingMode] = useState<OnboardingMode>(null);
  const [showFastTrack, setShowFastTrack] = useState(false); 
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const initialLoadDone = useRef(false);
  const navigate = useNavigate();

  // Force rendering content after a maximum time to avoid getting stuck
  useEffect(() => {
    // Primary timer for loading
    const loadingTimer = setTimeout(() => {
      console.log('Normal loading timeout complete');
      setLoading(false);
    }, 2000);

    // Safety fallback timer that will force loading to complete
    const fallbackTimer = setTimeout(() => {
      console.log('Fallback timer forcing loading to complete');
      setLoading(false);
    }, 6000);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Check for session storage on mount - only run once
  useEffect(() => {
    if (initialLoadDone.current) return;
    
    // Try to load stored mode
    const storedMode = sessionStorage.getItem('onboardingMode') as OnboardingMode | null;
    const storedUserInfo = sessionStorage.getItem('userInfo');
    
    console.log('Initializing TisAiAgent with stored state:', { storedMode, hasUserInfo: !!storedUserInfo });
    
    if (storedMode) {
      setOnboardingMode(storedMode);
      if (storedMode === 'fast-track') {
        // If there's user info and we're in fast-track mode,
        // we're past the FastOnboarding component
        if (storedUserInfo) {
          try {
            const parsedInfo = JSON.parse(storedUserInfo);
            setUserInfo(parsedInfo);
            setShowFastTrack(false);
          } catch (e) {
            console.error('Failed to parse stored user info:', e);
            setShowFastTrack(true);
          }
        } else {
          setShowFastTrack(true);
        }
      }
    }

    initialLoadDone.current = true;
  }, []);

  // Handler for mode selection
  const handleModeSelect = useCallback((mode: OnboardingMode) => {
    console.log('Mode selected:', mode);
    
    // Check if we're already in fast track mode with a configured stage
    if (mode === 'fast-track' && sessionStorage.getItem('fast_onboarding_stage') === 'config') {
      console.log('Already in fast-track config stage - not updating mode');
      return;
    }
    
    // Check if we're already connected to avoid unnecessarily updating state
    const alreadyConnected = sessionStorage.getItem('worldapi_connected') === 'true';
    if (alreadyConnected && mode === 'fast-track') {
      console.log('Already connected to WorldAPI - not updating mode');
      return;
    }
    
    setOnboardingMode(mode);
    
    if (mode) {
      sessionStorage.setItem('onboardingMode', mode); // Save immediately
    }
    
    if (mode === 'fast-track') {
      setShowFastTrack(true);
    }
  }, []);

  // Handler for fast track completion
  const handleFastTrackComplete = useCallback((info: UserInfo) => {
    console.log('Fast track completed with info:', info);
    
    // Prevent mode from being re-selected if we're already past the connection stage
    // Check if this is a re-entry from ConnectToWorldAPI
    const wasAlreadyConnected = sessionStorage.getItem('worldapi_connected');
    if (wasAlreadyConnected === 'true') {
      console.log('Already connected to WorldAPI - ignoring completion callback to avoid re-rendering');
      return;
    }
    
    // Store in session before state updates
    sessionStorage.setItem('userInfo', JSON.stringify(info));
    sessionStorage.setItem('onboardingMode', 'fast-track');
    sessionStorage.setItem('worldapi_connected', 'true');
    
    // Update state after storage is set
    setUserInfo(info);
    setShowFastTrack(false);
  }, []);

  // Handler for back button
  const handleBack = useCallback(() => {
    if (showFastTrack) {
      // Clear related session storage
      console.log('Clearing fast-track mode');
      sessionStorage.removeItem('onboardingMode');
      setShowFastTrack(false);
      setOnboardingMode(null);
    } else if (onboardingMode !== null) {
      // Clear related session storage
      console.log('Clearing onboarding mode');
      sessionStorage.removeItem('onboardingMode');
      sessionStorage.removeItem('userInfo');
      setOnboardingMode(null);
    } else {
      navigate('/');
    }
  }, [showFastTrack, onboardingMode, navigate]);

  // Immediately render main content if loading has stayed active for over 10 seconds
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.log('EMERGENCY: Force bypassing loading screen after extended wait');
      setLoading(false);
    }, 10000);
    
    return () => clearTimeout(emergencyTimeout);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary text-light flex flex-col">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-gradient-to-r from-secondary to-accent bg-clip-text">
              TisAi WorldAPI Connect
            </h2>
            <p className="text-xl text-gray-300 mb-8">Loading...</p>
            <div className="w-64 h-2 bg-dark rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-secondary to-accent animate-pulse"></div>
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-secondary to-accent rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-light flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with back button */}
        <header className="bg-dark py-4 px-6 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="text-white/70 hover:text-white flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="mr-2"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            {showFastTrack ? 'Change Mode' : onboardingMode ? 'Change Mode' : 'Back to Home'}
          </button>
          <div className="text-xl font-bold gradient-text">TisAi WorldAPI Connect</div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </header>

        {/* Main Content */}
        {showFastTrack ? (
          // Show the FastOnboarding component fullscreen when in fast-track mode
          <FastOnboarding onComplete={handleFastTrackComplete} />
        ) : (
          <main className="flex-1 flex flex-col lg:flex-row">
            {/* Sidebar with progress tracking */}
            <div className="lg:w-80 bg-dark">
              <ProgressTracker mode={onboardingMode || 'full'} />
            </div>

            {/* Chat or mode selection */}
            <div className="flex-1 flex flex-col">
              {onboardingMode === null ? (
                <OnboardingSelector onModeSelect={handleModeSelect} />
              ) : (
                <ChatInterface mode={onboardingMode} />
              )}
            </div>
          </main>
        )}
      </div>
      
      <style>
        {`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </div>
  );
};

export default TisAiAgent; 