import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnhancedApiDocumentation from '../components/EnhancedApiDocumentation';
import realWorldApiEndpoints from '../data/realWorldApiEndpoints';

const DocumentationPageEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'api'>('api');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-darker">
      <Navbar />
      
      {/* Header Section */}
      <div className="pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              WorldAPI Documentation
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Complete API reference for WorldAPI Payments as a Service platform.
              Build powerful financial applications with our comprehensive APIs.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-dark/50 backdrop-blur-sm rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setActiveTab('api')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'api'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                API Reference
              </button>
              <button
                onClick={() => setActiveTab('pdf')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'pdf'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                PDF Documentation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div ref={contentRef} className="pb-20">
        {activeTab === 'api' ? (
          <EnhancedApiDocumentation endpoints={realWorldApiEndpoints} />
        ) : (
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-lg shadow-xl">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  WorldAPI PDF Documentation
                </h2>
                <p className="text-gray-600 mb-6">
                  Download our comprehensive PDF guide for detailed integration instructions.
                </p>
                <a
                  href="/worldAPI Payments as a Service - For FIs.pdf"
                  download
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Documentation
                </a>
              </div>
              
              {/* PDF Preview */}
              <div className="border-t border-gray-200 p-8">
                <iframe
                  src="/worldAPI Payments as a Service - For FIs.pdf"
                  className="w-full h-96 rounded-lg border border-gray-300"
                  title="WorldAPI PDF Documentation"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DocumentationPageEnhanced;
