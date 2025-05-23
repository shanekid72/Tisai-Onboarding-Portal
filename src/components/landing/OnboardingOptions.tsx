import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

const OnboardingOptions: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.onboarding-heading', {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: 'power2.out'
        });
        
        gsap.from('.onboarding-subheading', {
          opacity: 0,
          y: -10,
          duration: 0.6,
          delay: 0.2,
          ease: 'power2.out'
        });
        
        gsap.from('.option-card', {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.2,
          delay: 0.4,
          ease: 'back.out(1.2)'
        });
      }, containerRef);
      
      return () => ctx.revert();
    }
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-16 flex flex-col justify-center items-center">
        <h1 className="onboarding-heading text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-500 mb-4">
          Choose Your Onboarding Path
        </h1>
        <p className="onboarding-subheading text-xl text-gray-300 text-center max-w-2xl mb-16">
          Select how you'd like to set up your WorldAPI integration
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Full Onboarding Option */}
          <div className="option-card bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:border-indigo-500/50">
            <div className="p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto">
                  <span role="img" aria-label="handshake" className="text-3xl">🤝</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white text-center mb-4">Full Onboarding</h2>
              
              <div className="text-gray-300 mb-6">
                <p className="text-center mb-4">
                  Guided, step-by-step conversation with TisAI.
                  Perfect for first-time users or those wanting a
                  complete walkthrough.
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Personalized experience</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Detailed explanations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Use case recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Troubleshooting assistance</span>
                  </li>
                </ul>
              </div>
              
              <Link 
                to="/tisai-onboarding" 
                className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium text-center transition-colors"
              >
                Start Full Onboarding
              </Link>
            </div>
          </div>
          
          {/* Quick Setup Option */}
          <div className="option-card bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:border-indigo-500/50">
            <div className="p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto">
                  <span role="img" aria-label="lightning" className="text-3xl">⚡</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white text-center mb-4">Quick Setup</h2>
              
              <div className="text-gray-300 mb-6">
                <p className="text-center mb-4">
                  Fast-track integration for experienced users.
                  Get up and running with minimal steps and
                  direct access to API credentials.
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Streamlined process</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>API documentation access</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Sample code templates</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Self-service support</span>
                  </li>
                </ul>
              </div>
              
              <Link 
                to="/documentation" 
                className="block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium text-center transition-colors"
              >
                Quick Setup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOptions; 