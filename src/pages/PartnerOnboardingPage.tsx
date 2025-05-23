import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { OnboardingProvider } from '../context/OnboardingContext';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import { gsap } from 'gsap';

const PartnerOnboardingPage: React.FC = () => {
  useEffect(() => {
    // Page entry animation
    gsap.from('.page-header', {
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });
    
    gsap.from('.onboarding-container', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: 0.3,
      ease: 'power2.out'
    });
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="page-header text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Partner Onboarding
          </h1>
          <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
            Complete the following steps to become a WorldAPI partner. Our team will review your information and get back to you shortly.
          </p>
        </div>
        
        <div className="onboarding-container bg-gray-800/50 rounded-xl shadow-xl backdrop-blur-sm p-6">
          <OnboardingProvider>
            <OnboardingFlow />
          </OnboardingProvider>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PartnerOnboardingPage; 