import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

const TisAiLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Animation for button entry
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      '.launcher-button',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );

    // Pulse animation loop
    gsap.to('.pulse-ring', {
      scale: 1.5,
      opacity: 0,
      duration: 1.5,
      repeat: -1,
      ease: 'power1.out',
    });

    return () => {
      tl.kill();
    };
  }, []);

  // Toggle options menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);

    // Animate options menu
    if (!isOpen) {
      gsap.fromTo(
        '.launcher-option',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.1, ease: 'power1.out' }
      );
    }
  };

  const handleLaunch = (mode: 'full' | 'fast-track') => {
    // Store the selected mode in sessionStorage
    sessionStorage.setItem('onboardingMode', mode);
    
    // Navigate to the TisAi agent page
    navigate('/tisai');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
      {/* Options menu */}
      {isOpen && (
        <div className="bg-dark p-3 rounded-xl shadow-xl flex flex-col gap-3 backdrop-blur-sm bg-opacity-90">
          <button
            onClick={() => handleLaunch('full')}
            className="launcher-option whitespace-nowrap btn-outline btn text-sm px-4 py-2"
          >
            Full Onboarding
          </button>
          <button
            onClick={() => handleLaunch('fast-track')}
            className="launcher-option whitespace-nowrap btn-primary btn text-sm px-4 py-2"
          >
            Fast Track
          </button>
        </div>
      )}
      
      {/* Main button */}
      <div className="relative">
        {/* Pulsing effect */}
        <div className="pulse-ring absolute inset-0 rounded-full border-2 border-secondary opacity-60"></div>
        
        {/* Button */}
        <button
          onClick={toggleMenu}
          className="launcher-button flex items-center gap-2 bg-gradient-to-tr from-secondary to-accent text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 9.05v-1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1"></path>
            <path d="M8 14.95v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1"></path>
            <rect x="7" y="9" width="10" height="6" rx="1"></rect>
          </svg>
          <span className="font-medium">Launch TisAi</span>
        </button>
      </div>
    </div>
  );
};

export default TisAiLauncher; 