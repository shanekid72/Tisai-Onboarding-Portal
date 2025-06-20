import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationToastContainer } from './components/ui/NotificationToast';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import from our utility instead of directly from gsap
import { ScrollTrigger, initScrollSmoother, killAllAnimations } from './utils/gsapInit';
import { initWebGLErrorHandler } from './utils/webglErrorHandler';

// Pages
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import TisAiAgent from './pages/TisAiAgent';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import HowItWorksPage from './pages/features/HowItWorksPage';
import CompliancePage from './pages/features/CompliancePage';
import IntegrationPage from './pages/features/IntegrationPage';
import SendMoneyPage from './pages/SendMoneyPage';
import DocumentationPageEnhanced from './pages/DocumentationPageEnhanced';
import PartnerOnboardingPage from './pages/PartnerOnboardingPage';
import PricingProposalPage from './pages/PricingProposalPage';
import OnboardingSelectionPage from './pages/OnboardingSelectionPage';
import AdminPanelPage from './pages/AdminPanelPage';
import CRMPage from './pages/CRMPage';

// Style
import './App.css';

const queryClient = new QueryClient();

// Wrapper component to handle route changes and ScrollSmoother cleanup
function AppRoutes() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const smoothWrapperRef = useRef<HTMLDivElement>(null);
  const smoothContentRef = useRef<HTMLDivElement>(null);
  const [has3dFeatures, setHas3dFeatures] = useState(true);
  const [smoother, setSmoother] = useState<any>(null);
  const [enableGlobalSmoothing] = useState(false);
  
  // Pages that need their own ScrollSmoother instances
  const pagesWithSmoother = ['how-it-works'];
  
  // Check if current page should have its own ScrollSmoother
  const isPageWithSmoother = pagesWithSmoother.some(path => 
    location.pathname.includes(path)
  );
  
  // Reset scroll on navigation
  useEffect(() => {
    // On navigation, scroll to top after a short delay to ensure layout and GSAP are done
    if (navigationType !== 'POP') {
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }, 50); // 50ms delay for robustness
    }
    
    // If we're NOT going to a page with its own ScrollSmoother,
    // and global smoothing is enabled, initialize it
    if (!isPageWithSmoother && enableGlobalSmoothing) {
      // Initialize global ScrollSmoother after navigation
      const initTimer = setTimeout(() => {
        initGlobalSmoother();
      }, 200);
      
      return () => {
        clearTimeout(initTimer);
      };
    } else if (isPageWithSmoother) {
      // If navigating to a page with its own ScrollSmoother,
      // kill any global instance
      if (smoother) {
        console.log("Killing global ScrollSmoother for page-specific one");
        smoother.kill();
        setSmoother(null);
      }
      
      // Make sure body scroll is available for page-specific ScrollSmoother
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [location.pathname, navigationType, enableGlobalSmoothing, isPageWithSmoother, smoother]);
  
  // Initialize WebGL and global GSAP settings
  useLayoutEffect(() => {
    // Initialize WebGL error handler
    initWebGLErrorHandler();
    
    // Listen for global WebGL disable events
    const handleDisableAllWebGL = () => {
      console.log('Disabling all 3D features across the app');
      setHas3dFeatures(false);
    };
    
    window.addEventListener('disable-all-webgl', handleDisableAllWebGL);
    
    // Add keyboard shortcut for ScrollSmoother debug mode (Alt+Shift+D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key === 'D') {
        console.log('🔍 ScrollSmoother Debug Info:');
        console.log('- Global smoother enabled:', enableGlobalSmoothing);
        console.log('- Global smoother instance:', smoother);
        console.log('- Page-specific smoother:', window.scrollSmoother);
        console.log('- ScrollTrigger instances:', ScrollTrigger.getAll().length);
        
        // Toggle ScrollTrigger markers for all instances
        const hasMarkers = ScrollTrigger.getAll().some(t => t.vars.markers);
        ScrollTrigger.getAll().forEach(trigger => {
          trigger.vars.markers = !hasMarkers;
          trigger.refresh();
        });
        console.log(`- ScrollTrigger markers: ${!hasMarkers ? 'ENABLED' : 'DISABLED'}`);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Register ScrollTrigger defaults for the entire app
    ScrollTrigger.defaults({
      toggleActions: 'play none none reverse',
      markers: false
    });
    
    return () => {
      window.removeEventListener('disable-all-webgl', handleDisableAllWebGL);
      window.removeEventListener('keydown', handleKeyDown);
      
      // Clean up all GSAP animations
      killAllAnimations(true);
    };
  }, [enableGlobalSmoothing]);
  
  // Initialize global ScrollSmoother only if enabled
  const initGlobalSmoother = () => {
    try {
      if (smoothWrapperRef.current && smoothContentRef.current && enableGlobalSmoothing) {
        console.log("Attempting to initialize global ScrollSmoother");
        
        // Pages that have their own ScrollSmoother instances
        const pagesWithSmoother = [
          'how-it-works',
          // Add other page paths here if they have ScrollSmoother
        ];
        
        // Check if current page should have its own ScrollSmoother
        const currentPath = location.pathname;
        const shouldSkipGlobalSmoother = pagesWithSmoother.some(path => 
          currentPath.includes(path)
        );
        
        if (!shouldSkipGlobalSmoother) {
          // First, kill any existing ScrollSmoother instances
          if (window.scrollSmoother) {
            console.log("Killing existing page ScrollSmoother before creating global one");
            window.scrollSmoother.kill();
            window.scrollSmoother = null;
          }
          
          if (window.appScrollSmoother) {
            console.log("Killing existing global ScrollSmoother before recreating");
            window.appScrollSmoother.kill();
            window.appScrollSmoother = null;
          }
          const smootherInstance = initScrollSmoother(
            smoothWrapperRef.current as Element,
            smoothContentRef.current as Element,
            {
              smooth: 1.0, // Lighter smoothing for global application
              normalizeScroll: true,
              ignoreMobileResize: true
            }
          );
          
          if (smootherInstance) {
            console.log("Global ScrollSmoother initialized successfully");
            setSmoother(smootherInstance);
            
            // Store smoother in window for global access
            window.appScrollSmoother = smootherInstance;
          }
        } else {
          console.log(`Skipping global ScrollSmoother for page with its own smoother: ${currentPath}`);
        }
      }
    } catch (error) {
      console.error("Failed to initialize global ScrollSmoother:", error);
      // App will still work without ScrollSmoother
    }
  };
  
  return (
    <>
      <div 
        ref={smoothWrapperRef} 
        className={enableGlobalSmoothing ? "smooth-wrapper" : ""}
        style={enableGlobalSmoothing ? { overflow: 'hidden', position: 'fixed', height: '100%', width: '100%', top: 0, left: 0 } : undefined}
      >
        <div 
          ref={smoothContentRef} 
          className={enableGlobalSmoothing ? "smooth-content" : ""}
          style={enableGlobalSmoothing ? { minHeight: '100%' } : undefined}
        >
          <main id="main-content">
            <Routes>
              <Route path="/" element={<LandingPage has3dFeatures={has3dFeatures} smoother={smoother} />} />
              <Route path="/tisai" element={
                <div style={{ visibility: 'visible', height: 'auto', overflow: 'visible' }}>
                  <OnboardingSelectionPage />
                </div>
              } />
              <Route path="/tisai-agent" element={
                <div style={{ visibility: 'visible', height: 'auto', overflow: 'visible' }}>
                  <TisAiAgent />
                </div>
              } />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />
              <Route 
                path="/how-it-works" 
                element={
                  <div style={{ visibility: 'visible', height: 'auto', overflow: 'visible' }}>
                    <HowItWorksPage />
                  </div>
                } 
              />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/partner-onboarding" element={<PartnerOnboardingPage />} />
              <Route path="/pricing-proposal" element={<PricingProposalPage />} />
              <Route path="/send-money" element={<SendMoneyPage />} />
              <Route path="/documentation" 
                element={
                  <div style={{ visibility: 'visible', height: 'auto', overflow: 'visible' }}>
                    <DocumentationPageEnhanced />
                  </div>
                } 
              />
              <Route path="/partner-onboarding" 
                element={
                  <div style={{ visibility: 'visible', height: 'auto', overflow: 'visible' }}>
                    <PartnerOnboardingPage />
                  </div>
                } 
              />
              <Route path="/onboarding" 
                element={
                  <div style={{ visibility: 'visible', height: 'auto', overflow: 'visible' }}>
                    <OnboardingSelectionPage />
                  </div>
                } 
              />
              <Route path="/admin" 
                element={
                  <div style={{ visibility: 'visible', height: 'auto', overflow: 'visible' }}>
                    <AdminPanelPage />
                  </div>
                } 
              />
              <Route path="/crm/*" element={<CRMPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
      
      {/* Global notification toast container */}
      <NotificationToastContainer />
    </>
  );
}

function App() {
  // Temporarily disable loading screen for debugging
  const isLoaded = true;
  
  console.log('App render - loading screen disabled for debugging');

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <NotificationProvider>
      <Router>
        <AppRoutes />
      </Router>
        </NotificationProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
