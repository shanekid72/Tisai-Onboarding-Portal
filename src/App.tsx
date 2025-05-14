import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useRef, useLayoutEffect, useEffect } from 'react';

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
            smoothWrapperRef.current,
            smoothContentRef.current,
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
              <Route path="/tisai" element={<TisAiAgent />} />
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
              <Route path="/integration" element={<IntegrationPage />} />
              <Route path="/send-money" element={<SendMoneyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Simulate initial loading with a fallback
  useEffect(() => {
    // Regular loading timer
    const timer = setTimeout(() => {
      setIsLoaded(true);
      console.log('App loaded through normal timer');
    }, 1500);
    
    // Fallback safety timer in case the normal loading gets stuck
    const fallbackTimer = setTimeout(() => {
      if (!isLoaded) {
        console.log('Forcing app to load through fallback timer');
        setIsLoaded(true);
      }
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div 
        className="fixed inset-0 bg-primary flex items-center justify-center"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-label="Loading TisAi WorldAPI Connect"
      >
        <div className="text-center max-w-md px-4">
          <div className="animate-pulse-slow">
            <h1 className="text-3xl font-bold mb-4 gradient-text">TisAi WorldAPI Connect</h1>
          </div>
          <div className="w-64 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden mx-auto">
            <div className="loading-bar h-full bg-gradient-to-r from-secondary to-accent rounded-full" />
          </div>
          <p className="mt-4 text-sm text-white/70">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
