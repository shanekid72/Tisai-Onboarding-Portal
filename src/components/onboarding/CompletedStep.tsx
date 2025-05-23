import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useOnboarding } from '../../context/OnboardingContext';

const CompletedStep: React.FC = () => {
  const { state } = useOnboarding();
  const componentRef = useRef<HTMLDivElement>(null);

  // Animation effect on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.success-icon', { 
        scale: 0.5, 
        opacity: 0, 
        duration: 0.8, 
        ease: "elastic.out(1, 0.5)" 
      });
      
      gsap.from('.success-content h2, .success-content p', { 
        y: 30, 
        opacity: 0, 
        stagger: 0.2, 
        duration: 0.6,
        delay: 0.6
      });
      
      gsap.from('.actions button, .actions a', { 
        y: 20, 
        opacity: 0, 
        stagger: 0.2, 
        duration: 0.4,
        delay: 1.2
      });
    }, componentRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={componentRef} className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl text-center">
      <div className="success-icon mb-8">
        <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <div className="success-content">
        <h2 className="text-2xl font-bold text-white mb-4">Onboarding Completed Successfully!</h2>
        <p className="text-gray-300 mb-6">
          Thank you for completing the onboarding process. Your NDA has been received and KYC documents have been submitted for review. 
          Our team will verify your information and get back to you shortly.
        </p>
        
        <div className="bg-gray-700/50 rounded-lg p-4 mx-auto max-w-md mb-8">
          <h3 className="text-gray-200 font-medium mb-2">Next Steps</h3>
          <ul className="text-left text-gray-300 space-y-2">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Document verification (1-2 business days)</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Account approval</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>API credentials setup</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Integration kickoff call</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="actions flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button 
          onClick={() => window.location.href = 'mailto:support@worldapi.com'}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Contact Support
        </button>
        <Link 
          to="/documentation" 
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          View API Documentation
        </Link>
      </div>
    </div>
  );
};

export default CompletedStep; 