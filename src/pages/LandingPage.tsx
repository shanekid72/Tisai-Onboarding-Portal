import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { shouldUseAdvancedAnimations } from '../utils/webglErrorHandler';
import { createSplitTextAnimation } from '../utils/gsapInit';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Define props
type LandingPageProps = {
  has3dFeatures: boolean;
  smoother?: any; // Make smoother optional
}

const LandingPage = ({ has3dFeatures }: LandingPageProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const featureGlobeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [useAdvancedAnimations] = useState(shouldUseAdvancedAnimations());
  
  // Handle animations
  useLayoutEffect(() => {
    // Context for all animations
    const ctx = gsap.context(() => {
      // Main timeline
      const mainTl = gsap.timeline();
      
      // Hero animations
      if (heroRef.current) {
        try {
          if (useAdvancedAnimations) {
            // Title animation with SplitText
            const titleElement = heroRef.current.querySelector('.hero-title');
            if (titleElement) {
              const titleAnimation = createSplitTextAnimation(titleElement, {
                animation: {
                  opacity: 0,
                  y: 100,
                  stagger: 0.02,
                  duration: 1,
                  ease: "back.out(1.7)"
                }
              });
              
              if (titleAnimation) {
                mainTl.add(titleAnimation);
              }
            }
            
            // Subtitle animation
            mainTl.from(heroRef.current.querySelector('.hero-subtitle'), {
              opacity: 0,
              y: 30,
              duration: 0.8
            }, "-=0.5")
            .from(heroRef.current.querySelector('.hero-cta'), {
              opacity: 0,
              y: 20,
              duration: 0.6
            }, "-=0.3");
          } else {
            // Simplified animations
            mainTl.from(heroRef.current.querySelector('.hero-title'), {
              opacity: 0,
              y: 30,
              duration: 0.8
            })
            .from(heroRef.current.querySelector('.hero-subtitle'), {
              opacity: 0,
              y: 20,
              duration: 0.6
            }, "-=0.3")
            .from(heroRef.current.querySelector('.hero-cta'), {
              opacity: 0,
              y: 10,
              duration: 0.4
            }, "-=0.2");
          }
        } catch (error) {
          console.warn("Hero animation error:", error);
        }
      }
      
      // Categories animation
      if (categoriesRef.current) {
        const categoryCards = categoriesRef.current.querySelectorAll('.category-card');
        
        ScrollTrigger.create({
          trigger: categoriesRef.current,
          start: "top 80%",
          animation: gsap.from(categoryCards, {
            y: 100,
            opacity: 0,
            stagger: 0.15,
            duration: 1,
            ease: "power3.out"
          })
        });
        
        // Category hover effects
        categoryCards.forEach((card) => {
          const bg = card.querySelector('.category-bg');
          const content = card.querySelector('.category-content');
          
          if (bg && content && useAdvancedAnimations) {
            const hoverTl = gsap.timeline({ paused: true });
            
            hoverTl.to(bg, {
              opacity: 0.9,
              scale: 1.05,
              duration: 0.4
            })
            .to(content, {
              y: -10,
              duration: 0.4
            }, 0);
            
            card.addEventListener('mouseenter', () => hoverTl.play());
            card.addEventListener('mouseleave', () => hoverTl.reverse());
          }
        });
      }
      
      // Globe animation
      if (featureGlobeRef.current && has3dFeatures) {
        ScrollTrigger.create({
          trigger: featureGlobeRef.current,
          start: "top 70%",
          animation: gsap.from(featureGlobeRef.current, {
            opacity: 0,
            scale: 0.8,
            duration: 1,
            ease: "power2.out"
          })
        });
        
        // Connection points animation
        const connectionPoints = featureGlobeRef.current.querySelectorAll('.connection-point');
        gsap.from(connectionPoints, {
          scale: 0,
          opacity: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: featureGlobeRef.current,
            start: "top 60%"
          }
        });
      }
      
      // CTA animation
      if (ctaRef.current) {
        ScrollTrigger.create({
          trigger: ctaRef.current,
          start: "top 80%",
          animation: gsap.from(ctaRef.current.children, {
            y: 50,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8
          })
        });
      }
      
      // Parallax background elements
      if (useAdvancedAnimations) {
        document.querySelectorAll('.parallax-bg').forEach((el: any, i) => {
          const direction = i % 2 === 0 ? 1 : -1;
          const speed = 0.1 + (i * 0.05);
          
          gsap.to(el, {
            y: `${100 * direction * speed}`,
            scrollTrigger: {
              trigger: el.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          });
        });
      }
    });
    
    // Cleanup
    return () => ctx.revert();
  }, [has3dFeatures, useAdvancedAnimations]);
  
  // Categories data
  const categories = [
    {
      id: "take-off",
      title: "Take Off",
      description: "Boost your productivity and creativity with energizing API solutions",
      color: "from-red-500 to-orange-500",
      bgImage: "/assets/take-off-bg.svg",
      path: "/products?category=take-off"
    },
    {
      id: "touch-down",
      title: "Touch Down",
      description: "Stabilize and secure your systems with reliable integrations",
      color: "from-blue-500 to-indigo-500",
      bgImage: "/assets/touch-down-bg.svg",
      path: "/products?category=touch-down"
    },
    {
      id: "high-point",
      title: "High Point",
      description: "Reach new heights with advanced AI and scaling capabilities",
      color: "from-green-500 to-emerald-500",
      bgImage: "/assets/high-point-bg.svg",
      path: "/products?category=high-point"
    }
  ];
  
  return (
    <div className="landing-page min-h-screen bg-dark text-light">
      <Navbar />
      
      {/* Hero section */}
      <section 
        ref={heroRef}
        className="hero min-h-screen flex items-center relative overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-secondary via-purple-500 to-accent bg-clip-text text-transparent">
                WorldAPI Connect
              </span>
            </h1>
            
            <p className="hero-subtitle text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto">
              Transform your development experience with our powerful API solutions.
              Seamless integration, endless possibilities.
            </p>
            
            <div className="hero-cta flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/products" 
                className="btn btn-primary text-lg py-3 px-8 rounded-full"
              >
                Explore Products
              </Link>
              
              <a 
                href="#categories" 
                className="btn btn-outline text-lg py-3 px-8 rounded-full"
              >
                Choose Your Journey
              </a>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="parallax-bg absolute w-[50vw] h-[50vw] rounded-full blur-3xl opacity-20 bg-secondary -top-[25vw] -right-[25vw]"></div>
          <div className="parallax-bg absolute w-[40vw] h-[40vw] rounded-full blur-3xl opacity-15 bg-accent bottom-[10vw] -left-[20vw]"></div>
          <div className="absolute w-full h-1/2 bottom-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
      </section>
      
      {/* Categories section - HelloCopilot style */}
      <section 
        id="categories"
        ref={categoriesRef}
        className="py-24 relative"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            Choose Your <span className="text-secondary">Experience</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.path}
                className="category-card group h-[500px] relative rounded-3xl overflow-hidden border border-white/10 shadow-lg"
              >
                {/* Background image with colored overlay */}
                <div className="category-bg absolute inset-0 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 z-10"></div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-30 z-20`}></div>
                  <img 
                    src={category.bgImage} 
                    alt={category.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                {/* Content */}
                <div className="category-content absolute inset-0 z-30 flex flex-col justify-end p-8 transition-all duration-500">
                  <h3 className="text-4xl font-bold mb-4">{category.title}</h3>
                  <p className="text-white/80 text-lg mb-8">{category.description}</p>
                  <div className="inline-flex items-center gap-2 text-lg font-medium">
                    Explore
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-full h-full bg-[url('/assets/grid-pattern.svg')] opacity-5"></div>
        </div>
      </section>
      
      {/* Featured visualization - HelloCopilot style */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Global API <span className="text-secondary">Connectivity</span>
              </h2>
              
              <p className="text-xl text-white/70 mb-8">
                Connect with systems worldwide through our robust API network. 
                Enterprise-grade solutions with the simplicity you need.
              </p>
              
              <ul className="space-y-4 mb-8">
                {['Seamless integration across platforms', 'Real-time data synchronization', 'Advanced security protocols', 'Customizable workflows'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 inline-block w-5 h-5 rounded-full bg-gradient-to-r from-secondary to-accent flex-shrink-0"></span>
                    <span className="text-lg text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/how-it-works" className="btn btn-primary inline-flex items-center gap-2">
                Learn How It Works
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
            
            <div 
              ref={featureGlobeRef}
              className="globe-visualization relative mx-auto"
            >
              {has3dFeatures ? (
                <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
                  {/* Enhanced globe visualization with better animations */}
                  <div className="absolute inset-0 rounded-full border border-white/5 animate-spin-slow"></div>
                  <div className="absolute inset-[10px] rounded-full border-2 border-white/10 animate-reverse-spin"></div>
                  <div className="absolute inset-[30px] rounded-full border border-secondary/20 animate-spin-slow" style={{ animationDuration: '25s' }}></div>
                  <div className="absolute inset-[60px] rounded-full border-2 border-accent/30 animate-reverse-spin" style={{ animationDuration: '30s' }}></div>
                  <div className="absolute inset-[90px] rounded-full border border-white/15 animate-spin-slow" style={{ animationDuration: '35s' }}></div>
                  
                  {/* Glowing central globe */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 blur-md"></div>
                      <div className="text-6xl md:text-7xl animate-float" style={{ animationDuration: '8s' }}>
                        🌎
                      </div>
                    </div>
                  </div>
                  
                  {/* Pulsing glow effect */}
                  <div className="absolute inset-[100px] rounded-full bg-blue-500/5 animate-pulse" style={{ animationDuration: '3s' }}></div>
                  
                  {/* Connection points with enhanced styling and animations */}
                  {[...Array(10)].map((_, i) => {
                    const angle = (i / 10) * Math.PI * 2;
                    const radius = 180;
                    const x = Math.cos(angle) * radius + 200;
                    const y = Math.sin(angle) * radius + 200;
                    const delay = i * 0.2;
                    const size = 2 + Math.random() * 3;
                    
                    // Determine color based on position
                    const colorOptions = [
                      'bg-secondary', 'bg-cyan-500', 'bg-blue-500', 
                      'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
                    ];
                    const colorClass = colorOptions[i % colorOptions.length];
                    
                    return (
                      <div 
                        key={i}
                        className={`connection-point absolute ${colorClass} rounded-full animate-pulse z-10`}
                        style={{ 
                          left: x, 
                          top: y,
                          width: `${size}px`,
                          height: `${size}px`,
                          boxShadow: `0 0 10px ${colorClass === 'bg-secondary' ? 'rgba(255, 87, 51, 0.7)' : 'rgba(99, 179, 237, 0.7)'}`,
                          animationDelay: `${delay}s`,
                          animationDuration: `${2 + Math.random() * 2}s`
                        }}
                      >
                        {/* Add connecting lines from dots to center */}
                        <div 
                          className="absolute opacity-30 bg-gradient-to-c from-white/30 to-transparent"
                          style={{
                            width: '1px',
                            height: `${radius}px`,
                            transformOrigin: '0 0',
                            transform: `rotate(${angle + Math.PI}rad)`,
                          }}
                        ></div>
                      </div>
                    );
                  })}
                  
                  {/* Data packets traveling along connections */}
                  {[...Array(5)].map((_, i) => {
                    const angle = (i / 5) * Math.PI * 2;
                    const startRadius = 180;
                    const startX = Math.cos(angle) * startRadius + 200;
                    const startY = Math.sin(angle) * startRadius + 200;
                    
                    return (
                      <div 
                        key={`packet-${i}`}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: startX,
                          top: startY,
                          animation: `packetTravel 2s linear infinite`,
                          animationDelay: `${i * 0.3}s`,
                        }}
                      ></div>
                    );
                  })}
                </div>
              ) : (
                // Fallback non-WebGL visualization
                <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 border border-white/10 flex items-center justify-center">
                  <span className="text-8xl">🌎</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Add keyframes for packet animation */}
        <style>
          {`
            @keyframes packetTravel {
              0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(${-Math.cos(0) * 180}px, ${-Math.sin(0) * 180}px) scale(0.5);
                opacity: 0;
              }
            }
          `}
        </style>
        
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="parallax-bg absolute w-[30vw] h-[30vw] rounded-full blur-3xl opacity-10 bg-accent top-1/4 -right-[15vw]"></div>
        </div>
      </section>
      
      {/* CTA Section - HelloCopilot style */}
      <section 
        ref={ctaRef}
        className="py-24 relative"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-secondary/20 to-accent/20 rounded-3xl p-12 border border-white/10 backdrop-blur-md">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your <span className="text-secondary">Experience</span>?
            </h2>
            
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of developers who have revolutionized their workflow with WorldAPI Connect
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn btn-primary text-lg py-3 px-8 rounded-full">
                Explore Products
              </Link>
              
              <Link to="/tisai" className="btn btn-outline text-lg py-3 px-8 rounded-full">
                Try TisAI Assistant
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="parallax-bg absolute w-[40vw] h-[40vw] rounded-full blur-3xl opacity-10 bg-secondary bottom-0 -left-[20vw]"></div>
          <div className="absolute w-full h-1/2 bottom-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage; 