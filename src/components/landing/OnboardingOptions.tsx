import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

const OnboardingOptions: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        // Set initial visibility to ensure elements are visible
        gsap.set('.onboarding-heading', { opacity: 1, y: 0 });
        gsap.set('.onboarding-subheading', { opacity: 1, y: 0 });
        gsap.set('.option-card', { opacity: 1, y: 0 });
        
        // Animate from hidden to visible
        gsap.fromTo('.onboarding-heading', 
          { opacity: 0, y: -20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            force3D: false
          }
        );
        
        gsap.fromTo('.onboarding-subheading', 
          { opacity: 0, y: -10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.2,
            ease: 'power2.out',
            force3D: false
          }
        );
        
        gsap.fromTo('.option-card', 
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.4,
            stagger: 0.2,
            ease: 'back.out(1.2)',
            force3D: false
          }
        );
      }, containerRef);
      
      return () => ctx.revert();
    }
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-16 flex flex-col justify-center items-center">
        <h1 className="onboarding-heading text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-500 mb-4">
          WorldAPI Integration
        </h1>
        <p className="onboarding-subheading text-xl text-gray-300 text-center max-w-2xl mb-16">
          Get started with your WorldAPI integration quickly and efficiently
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Quick Setup Option */}
          <div className="option-card bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:border-indigo-500/50" style={{ opacity: 1 }}>
            <div className="p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto">
                  <span role="img" aria-label="lightning" className="text-3xl">⚡</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white text-center mb-4">Fast Track Setup</h2>
              
              <div className="text-gray-300 mb-6">
                <p className="text-center mb-4">
                  Quick setup with minimal questions. Get your
                  WorldAPI integration up and running in minutes.
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Minimal questions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Rapid configuration</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Streamlined setup</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Quick code samples</span>
                  </li>
                </ul>
              </div>
              
              <Link 
                to="/tisai-agent" 
                className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium text-center transition-colors"
              >
                Start Setup
              </Link>
            </div>
          </div>

          {/* Partner Onboarding Option */}
          <div className="option-card bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:border-orange-500/50" style={{ opacity: 1 }}>
            <div className="p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-400/20 rounded-full flex items-center justify-center mx-auto">
                  <span role="img" aria-label="handshake" className="text-3xl">🤝</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white text-center mb-4">Partner Onboarding</h2>
              
              <div className="text-gray-300 mb-6">
                <p className="text-center mb-4">
                  Complete partner onboarding with guided chat agent.
                  Full compliance, documentation, and approval workflow.
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-orange-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>AI-guided chat agent</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-orange-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>7-stage workflow</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-orange-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>KYC compliance</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-orange-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Document management</span>
                  </li>
                </ul>
              </div>
              
              <Link 
                to="/partner-onboarding" 
                className="block w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium text-center transition-colors"
              >
                Start Partner Onboarding
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOptions; 