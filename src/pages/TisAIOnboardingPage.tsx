import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { gsap } from 'gsap';
import ChatInterface from '../components/onboarding/ChatInterface';
import { OnboardingProvider } from '../context/OnboardingContext';

const TisAIOnboardingPage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Debug log
    console.log('TisAIOnboardingPage loaded with ChatInterface');
    
    // Page entry animation
    if (pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.page-header', {
          y: -30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
        
        gsap.from('.chat-container', {
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: 0.3,
          ease: 'power2.out'
        });
      }, pageRef);
      
      return () => ctx.revert();
    }
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="page-header text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            TisAi Assistant
          </h1>
          <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
            Full Onboarding
          </p>
        </div>
        
        <div className="chat-container">
          <OnboardingProvider>
            <ChatInterface />
          </OnboardingProvider>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TisAIOnboardingPage; 