import { useEffect, useState, useCallback, useRef } from 'react';
import { gsap } from 'gsap';
import FastOnboarding from './FastOnboarding';

interface OnboardingSelectorProps {
  onModeSelect: (mode: 'full' | 'fast-track') => void;
}

const OnboardingSelector: React.FC<OnboardingSelectorProps> = ({ onModeSelect }) => {
  const [showFastTrack, setShowFastTrack] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const sessionChecked = useRef(false);
  const [contentVisible, setContentVisible] = useState(false);

  // Ensure content is visible after a short delay, regardless of animation state
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Check session and try to load mode preference
  useEffect(() => {
    // Only run once
    if (sessionChecked.current) return;
    sessionChecked.current = true;
    
    // Check if there's a stored mode preference
    const storedMode = sessionStorage.getItem('onboardingMode');
    console.log('OnboardingSelector checking stored mode:', storedMode);
    
    if (storedMode === 'full') {
      onModeSelect('full');
      return;
    } else if (storedMode === 'fast-track') {
      setShowFastTrack(true);
      return;
    }

    // Set content visibility to true regardless of animation state
    setContentVisible(true);
    
    // Simplified animation that runs only once
    try {
      if (!isAnimated) {
        const elements = document.querySelectorAll('.selector-title, .selector-card');
        
        // Simple fade in animation (safer implementation)
        if (elements && elements.length > 0 && typeof gsap !== 'undefined') {
          // Set initial state
          gsap.set(elements, { opacity: 0, y: 20 });
          
          // Animate elements
          gsap.to(elements, { 
            opacity: 1, 
            y: 0, 
            duration: 0.3,
            stagger: 0.1, 
            ease: 'power2.out',
            onComplete: () => setIsAnimated(true)
          });
        } else {
          // If elements not found or GSAP not available, still mark as animated
          console.log('Failed to find elements or GSAP is undefined, skipping animation');
          setIsAnimated(true);
        }
      }
    } catch (err) {
      // If animation fails for any reason, make sure content is still visible
      console.error('Animation error:', err);
      setIsAnimated(true);
      setContentVisible(true);
    }
    
    // Emergency fallback - force animation to complete after a timeout
    const fallbackTimer = setTimeout(() => {
      if (!isAnimated) {
        console.log('Forcing OnboardingSelector animations to complete');
        setIsAnimated(true);
        setContentVisible(true);
      }
    }, 2000);
    
    return () => clearTimeout(fallbackTimer);
  }, [onModeSelect, isAnimated]);

  // At the beginning of the component - perform an immediate check if we should skip to FastOnboarding
  useEffect(() => {
    // Emergency check - if we should be showing FastOnboarding component with specific stage
    const isConnected = sessionStorage.getItem('worldapi_connected') === 'true';
    const configStage = sessionStorage.getItem('fast_onboarding_stage') === 'config';
    const inFastTrack = sessionStorage.getItem('onboardingMode') === 'fast-track';
    
    if (isConnected && configStage && inFastTrack && !showFastTrack) {
      console.log('🚨 EMERGENCY: Forcing FastOnboarding display based on session data');
      setShowFastTrack(true);
    }
  }, [showFastTrack]);

  // Handle fast-track completion with useCallback
  const handleFastTrackComplete = useCallback((userInfo: any) => {
    // Store the information
    console.log('Fast track completed in selector, saving user info');
    
    // Check if we're already connected to avoid state cycling
    const isAlreadyConnected = sessionStorage.getItem('worldapi_connected') === 'true';
    if (isAlreadyConnected) {
      console.log('Already connected - preventing state cycle in selector');
      return;
    }
    
    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
    sessionStorage.setItem('onboardingMode', 'fast-track');
    
    // Notify the parent component
    onModeSelect('fast-track');
  }, [onModeSelect]);

  // Handle mode selection with useCallback
  const handleFullModeSelect = useCallback(() => {
    console.log('Full mode selected');
    sessionStorage.setItem('onboardingMode', 'full');
    onModeSelect('full');
  }, [onModeSelect]);

  const handleFastTrackSelect = useCallback(() => {
    console.log('Fast track selected');
    // Check if we're already in config stage
    const configStage = sessionStorage.getItem('fast_onboarding_stage') === 'config';
    if (configStage) {
      console.log('Fast track already configured, showing with config stage');
    }
    
    // Don't set onboardingMode yet - wait until the form is completed
    setShowFastTrack(true);
  }, []);

  if (showFastTrack) {
    return <FastOnboarding onComplete={handleFastTrackComplete} />;
  }

  // Ensure content is always visible, regardless of animation state
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 bg-gradient-to-b from-primary to-dark">
      <div className="max-w-4xl w-full" style={{ opacity: contentVisible || isAnimated ? 1 : 0 }}>
        <div className="text-center mb-10">
          <h2 className="selector-title text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Choose Your Onboarding Path
          </h2>
          <p className="selector-title text-white/70 max-w-xl mx-auto">
            Select how you'd like to set up your WorldAPI integration with TisAi
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Full Onboarding Card */}
          <div 
            className="selector-card card hover:shadow-lg cursor-pointer transition-all"
            onClick={handleFullModeSelect}
          >
            <div className="mb-4 text-3xl">🤝</div>
            <h3 className="text-xl font-bold mb-2">Full Onboarding</h3>
            <p className="text-white/70 mb-4">
              Guided, step-by-step conversation with TisAi. Perfect for first-time 
              users or those wanting a complete walkthrough.
            </p>
            <ul className="space-y-2 text-sm text-white/70 mb-6">
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                <span>Personalized experience</span>
              </li>
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                <span>Detailed explanations</span>
              </li>
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                <span>Use case recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                <span>Troubleshooting assistance</span>
              </li>
            </ul>
            <button 
              className="btn btn-outline w-full"
              onClick={handleFullModeSelect}
            >
              Start Full Onboarding
            </button>
          </div>

          {/* Fast Track Card */}
          <div 
            className="selector-card card bg-gradient-to-br from-dark to-primary border border-secondary/20 hover:shadow-lg cursor-pointer transition-all"
            onClick={handleFastTrackSelect}
          >
            <div className="mb-4 text-3xl">⚡</div>
            <h3 className="text-xl font-bold mb-2 text-secondary">Fast Track</h3>
            <p className="text-white/70 mb-4">
              Quick setup with minimal questions. Ideal for experienced developers 
              or those in a hurry.
            </p>
            <ul className="space-y-2 text-sm text-white/70 mb-6">
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                <span>Minimal questions</span>
              </li>
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                <span>Rapid configuration</span>
              </li>
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                <span>Streamlined setup</span>
              </li>
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                <span>Quick code samples</span>
              </li>
            </ul>
            <button 
              className="btn btn-primary w-full"
              onClick={handleFastTrackSelect}
            >
              Use Fast Track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSelector; 