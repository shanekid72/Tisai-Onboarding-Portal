import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollFloat from '../../components/ScrollFloat';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const stepImages = [
  '/vr-user.png',
  '/api-cloud.png',
  '/dashboard.png',
  '/ai-neural.png',
];

const HowItWorksPage = () => {
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);
  const animationsInitialized = useRef(false);
  
  // Force scroll to top on mount - this is crucial
  useLayoutEffect(() => {
    // Force immediate scroll to top before any rendering
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Set a flag to know this is a fresh mount
    const isMount = !animationsInitialized.current;
    
    // Initial animation and scroll settings
    if (isMount) {
      // Delay any ScrollTrigger initialization to ensure proper initial position
      setTimeout(() => {
        // Force scroll again to counteract any ScrollTrigger movement
        window.scrollTo(0, 0);
      }, 10);
    }
    
    return () => {
      // Clean up any pending timeouts
      const allTimeouts = window.setTimeout(() => {}, 0);
      for (let i = 0; i < allTimeouts; i++) {
        window.clearTimeout(i);
      }
    };
  }, [location.pathname]);
  
  // Step data
  const steps = [
    {
      id: "step1",
      title: "Conversational Onboarding",
      description: "Begin your journey with a natural conversation. Our AI assistant guides you through the setup process, asking only what's needed to get you connected.",
    },
    {
      id: "step2",
      title: "Configure Your Connection",
      description: "Our system automatically generates all the configuration you need based on your responses. No manual JSON editing or complex setup required.",
    },
    {
      id: "step3",
      title: "Test & Validate",
      description: "Instantly test your connection to ensure everything is working properly. Get real-time feedback and troubleshooting if needed.",
    },
    {
      id: "step4",
      title: "Deploy & Monitor",
      description: "Once connected, deploy your integration and monitor its performance through our intuitive dashboard. Scale with confidence.",
    }
  ];

  // Scroll to step function
  const scrollToStep = (index: number) => {
    const stepElement = document.getElementById(steps[index].id);
    if (stepElement) {
      window.scrollTo({
        top: stepElement.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  // Handle all animations and scrolling effects in a single useEffect
  useEffect(() => {
    if (animationsInitialized.current) return;
    
    // Store the context in window for proper cleanup
    const ctx = gsap.context(() => {
      try {
        // Delay the ScrollTrigger initialization to allow initial scroll position to settle
        setTimeout(() => {
          // Header animations don't rely on ScrollTrigger for initial appearance
          const tl = gsap.timeline();
          tl.fromTo(
            '.header-title',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
          )
          .fromTo(
            '.header-subtitle',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
            '-=0.6'
          )
          .fromTo(
            '.nav-button',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out' },
            '-=0.6'
          );

          // Progress bar
          ScrollTrigger.create({
            trigger: '#how-it-works-page',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
              gsap.to('.progress-bar', {
                scaleX: self.progress,
                transformOrigin: 'left center',
                duration: 0.1,
                ease: 'none',
              });
            },
            id: 'progress-bar',
          });

          // Use string selectors for GSAP parallax
          steps.forEach((step, idx) => {
            gsap.fromTo(
              `#${step.id} .parallax-image`,
              { y: 0, scale: 1.08 },
              {
                y: '-12vw',
                scale: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: `#${step.id} .parallax-image`,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1.2,
                  id: `parallax-${step.id}`,
                },
              }
            );
          });

          steps.forEach((step, index) => {
            ScrollTrigger.create({
              trigger: `#${step.id}`,
              start: 'top center',
              end: 'bottom center',
              onEnter: () => setActiveStep(index),
              onEnterBack: () => setActiveStep(index),
              id: `step-tracker-${step.id}`,
            });

            ScrollTrigger.create({
              trigger: `#${step.id}`,
              start: 'top 75%',
              once: true,
              onEnter: () => {
                gsap.to(`#${step.id}`, {
                  opacity: 1,
                  duration: 0.6,
                  ease: 'power2.out',
                });
                gsap.fromTo(
                  `#${step.id} .step-description`,
                  { y: 30, opacity: 0 },
                  { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power2.out' }
                );
                gsap.fromTo(
                  `#${step.id} .step-button`,
                  { y: 20, opacity: 0 },
                  { y: 0, opacity: 1, duration: 0.5, delay: 0.5, ease: 'power2.out' }
                );
              },
              id: `step-reveal-${step.id}`,
            });
          });

          // Animation for CTA section
          ScrollTrigger.create({
            trigger: '.cta-section',
            start: 'top 80%',
            once: true,
            onEnter: () => {
              gsap.fromTo(
                '.cta-content > *',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
              );
            },
            id: 'cta-animation',
          });
          
          // Mark as initialized so we don't reinitialize unnecessarily
          animationsInitialized.current = true;
          
          // Store the animation context for proper cleanup
          window.howItWorksAnimationsContext = ctx;
        }, 100); // Short delay to ensure DOM is ready and scroll position is correct
      } catch (error) {
        console.error('Error setting up GSAP animations:', error);
      }
    });
    
    return () => {
      // Comprehensive cleanup
      if (window.howItWorksAnimationsContext) {
        window.howItWorksAnimationsContext.revert();
        window.howItWorksAnimationsContext = undefined;
      }
      
      // Kill all ScrollTrigger instances manually for extra safety
      ScrollTrigger.getAll().forEach((trigger) => {
        trigger.kill();
      });
      
      // Reset animation initialized flag for potential remount
      animationsInitialized.current = false;
    };
  }, [steps]);

  return (
    <div ref={pageRef} id="how-it-works-page" className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Progress bar */}
      <div className="fixed top-[80px] left-0 right-0 h-1 bg-black/20 z-40">
        <div className="progress-bar h-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 w-full scale-x-0"></div>
      </div>
      
      {/* Header section */}
      <header className="pt-20 pb-20 relative overflow-hidden" style={{ scrollMarginTop: '80px' }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="header-title text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              How It Works
            </span>
          </h1>
          
          <p className="header-subtitle text-xl max-w-3xl mx-auto text-white/70 mb-12">
            Experience the most intuitive API connection process ever created. 
            See how WorldAPI transforms complex integrations into simple conversations.
          </p>
          
          {/* Navigation buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {steps.map((step, index) => (
              <button 
                key={index}
                onClick={() => scrollToStep(index)}
                className={`nav-button px-5 py-2 rounded-full transition-all duration-300 text-sm font-medium
                       border ${index === activeStep 
                         ? 'bg-white/10 border-white/20' 
                         : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                {step.title}
              </button>
            ))}
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-full h-full bg-[url('/assets/grid-pattern.svg')] opacity-5"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-purple-500/10 to-transparent blur-3xl"></div>
        </div>
      </header>
      
      {/* Steps section */}
      <div className="py-16">
        {steps.map((step, index) => (
          <section 
            key={step.id}
            id={step.id}
            className="step-section py-16 mb-16 relative opacity-0"
          >
            <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                {/* Description side */}
                <div className={`w-full md:w-1/2 step-content ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                  <div className="p-6 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    {/* Using ScrollFloat for the title */}
                    <div className={`bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>
                      <ScrollFloat
                        animationDuration={1.2}
                        ease="power3.out"
                        scrollStart="top bottom+=20%"
                        scrollEnd="center center"
                        stagger={0.02}
                        containerClassName="text-3xl md:text-4xl font-bold mb-6"
                        textClassName="!text-left !font-bold !text-[2rem] md:!text-[2.5rem]"
                        id={`float-${step.id}`}
                      >
                        {step.title}
                      </ScrollFloat>
                    </div>
                    
                    <p className="step-description text-lg text-white/80 mb-8">
                      {step.description}
                    </p>
                    
                    {index < steps.length - 1 ? (
                      <button 
                        onClick={() => scrollToStep(index + 1)}
                        className="step-button inline-flex items-center text-lg font-medium text-white/80 hover:text-white transition-colors"
                      >
                        <span>Next Step</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    ) : (
                      <Link 
                        to="/tisai"
                        className="step-button inline-flex items-center gap-2 px-6 py-2 rounded-full text-white"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #a21caf)' }}
                      >
                        Get Started
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
                
                {/* Image side with parallax effect */}
                <div className={`w-full md:w-1/2 flex items-center justify-center step-image ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
                  <div
                    className="parallax-image relative w-full h-[320px] md:h-[420px] rounded-2xl overflow-hidden shadow-2xl bg-black/60 flex items-center justify-center"
                  >
                    <img
                      src={stepImages[index]}
                      alt={step.title}
                      className="w-full h-full object-contain object-center pointer-events-none select-none"
                      style={{ filter: 'drop-shadow(0 0 40px #6366f1aa) brightness(1.1)' }}
                    />
                    {/* Particle overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      {[...Array(18)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            width: `${Math.random() * 8 + 4}px`,
                            height: `${Math.random() * 8 + 4}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            background: 'radial-gradient(circle, #fff 0%, #6366f1 80%, transparent 100%)',
                            opacity: Math.random() * 0.5 + 0.2,
                            filter: 'blur(1.5px)',
                            animation: `float${i % 3} ${Math.random() * 4 + 6}s infinite ease-in-out`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
      
      {/* CTA Section */}
      <section className="cta-section py-24 relative mb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="cta-content bg-black/60 backdrop-blur-md p-8 rounded-lg inline-block max-w-4xl border border-white/10">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Start Your <span className="text-blue-400">Journey</span>?
            </h2>
            
            <p className="text-xl text-white/80 mb-10">
              Begin with our AI assistant and have your WorldAPI integration up and running in minutes
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/tisai" 
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/20 transition-shadow"
              >
                Start with TisAI
              </Link>
              
              <Link 
                to="/products" 
                className="px-8 py-3 bg-white/10 text-white rounded-full border border-white/20 hover:bg-white/20 transition-colors"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-full h-full bg-gradient-radial from-blue-500/5 to-transparent opacity-20"></div>
          <div className="absolute w-[25vw] h-[25vw] rounded-full blur-3xl opacity-10 bg-purple-500 bottom-0 right-0"></div>
        </div>
      </section>
      
      <Footer />
      
      {/* Add animations for floating dots */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float0 {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-15px) translateX(5px); }
          }
          @keyframes float1 {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(15px) translateX(-10px); }
          }
          @keyframes float2 {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-10px) translateX(-5px); }
          }
        `
      }} />
    </div>
  );
};

export default HowItWorksPage; 