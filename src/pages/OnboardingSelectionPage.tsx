import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OnboardingOptions from '../components/landing/OnboardingOptions';

const OnboardingSelectionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      <OnboardingOptions />
      <Footer />
    </div>
  );
};

export default OnboardingSelectionPage; 