import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { createSplitTextAnimation } from '../utils/gsapInit';
import { shouldUseAdvancedAnimations } from '../utils/webglErrorHandler';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, MotionPathPlugin);

const ProductsPage = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);
  const categoryNavigationRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [useAdvancedAnimations, setUseAdvancedAnimations] = useState(shouldUseAdvancedAnimations());
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  
  // Listen for animation complexity reduction events
  useEffect(() => {
    const handleReduceAnimations = () => {
      setUseAdvancedAnimations(false);
    };
    
    window.addEventListener('reduce-animation-complexity', handleReduceAnimations);
    
    return () => {
      window.removeEventListener('reduce-animation-complexity', handleReduceAnimations);
    };
  }, []);
  
  // Add useEffect to load the parallax script
  useEffect(() => {
    // Load the parallax script dynamically
    const script = document.createElement('script');
    script.src = '/assets/parallax.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Clean up script on component unmount
      try {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch (error) {
        console.warn("Error removing parallax script:", error);
      }
    };
  }, []);
  
  // Initialize animations
  useLayoutEffect(() => {
    // Create a context for all animations
    const ctx = gsap.context(() => {
      // Main timeline for initial animations
      const mainTl = gsap.timeline();
      
      // Header animation with SplitText
      if (headerRef.current) {
        try {
          if (useAdvancedAnimations) {
            // Use advanced SplitText animation
            const headerTitle = headerRef.current.querySelector('.main-title');
            if (headerTitle) {
              const titleAnimation = createSplitTextAnimation(headerTitle, {
                animation: {
                  opacity: 0,
                  y: 100,
                  ease: "back",
                  stagger: 0.02,
                  duration: 1
                }
              });
              
              if (titleAnimation) {
                mainTl.add(titleAnimation);
              }
            }
            
            // Add other header animations
            mainTl.from(headerRef.current.querySelector('.subtitle'), {
              opacity: 0,
              y: 30,
              duration: 0.8
            }, "-=0.5");
          } else {
            // Simplified animations for performance
            mainTl.from(headerRef.current.querySelector('.main-title'), {
              opacity: 0,
              y: 30,
              duration: 0.8
            })
            .from(headerRef.current.querySelector('.subtitle'), {
              opacity: 0,
              y: 20,
              duration: 0.6
            }, "-=0.3");
          }
        } catch (error) {
          console.warn("Header animation error:", error);
          // Extra safety fallback
          gsap.from(headerRef.current.querySelector('.main-title'), {
            opacity: 0,
            y: 30,
            duration: 0.8
          });
        }
      }

      // Animate the category navigation
      if (categoryNavigationRef.current) {
        mainTl.from(categoryNavigationRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8
        }, "-=0.4")
        .from(categoryNavigationRef.current.querySelectorAll('.category-button'), {
          scale: 0.8,
          opacity: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "back.out(1.7)"
        }, "-=0.6");
      }
      
      // Create horizontal scroll sections - HelloCopilot style
      if (horizontalRef.current && sectionsRef.current.length) {
        // Create a trigger for the entire horizontal container
        const sections = sectionsRef.current;
        const container = horizontalRef.current;
        
        if (useAdvancedAnimations) {
          // Set the container width based on the number of sections
          gsap.set(container, { 
            width: sections.length * 100 + "vw"
          });
          
          // Pin the container and create horizontal scroll
          const scrollTween = gsap.to(container, {
            x: () => -(container.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: container,
              pin: true,
              start: "top top",
              end: () => "+=" + (container.scrollWidth - window.innerWidth),
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
              snap: {
                snapTo: 1 / (sections.length - 1),
                duration: { min: 0.2, max: 0.5 },
                delay: 0
              },
              onUpdate: (self) => {
                // Calculate which section is active based on scroll progress
                const newActiveSection = Math.round(self.progress * (sections.length - 1));
                if (newActiveSection !== activeCategory) {
                  setActiveCategory(newActiveSection);
                }
              }
            }
          });
          
          // Create animations for each section within the horizontal scroll
          sections.forEach((section) => {
            const title = section.querySelector('.category-title');
            const subtitle = section.querySelector('.category-subtitle');
            const products = section.querySelectorAll('.product-card');
            
            // Create a timeline for each section that's linked to the scroll position
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                containerAnimation: scrollTween,
                start: "left center",
                end: "right center",
                scrub: true,
                toggleActions: "play none none reverse"
              }
            });
            
            // Add section-specific animations
            tl.fromTo(title, 
              { opacity: 0, x: 100 }, 
              { opacity: 1, x: 0, duration: 1 }, 0
            )
            .fromTo(subtitle, 
              { opacity: 0, x: 120 }, 
              { opacity: 1, x: 0, duration: 1 }, 0.1
            )
            .fromTo(products, 
              { y: 100, opacity: 0, scale: 0.9 }, 
              { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.1 }, 0.2
            );
            
            // Add parallax effect to product cards - HelloCopilot signature effect
            products.forEach((product, index) => {
              const direction = index % 2 === 0 ? -1 : 1;
              
              gsap.fromTo(product, 
                { y: 0 },
                { 
                  y: 30 * direction,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    containerAnimation: scrollTween,
                    start: "left right",
                    end: "right left",
                    scrub: true,
                  }
                }
              );
            });
          });
        } else {
          // Simplified version without horizontal scrolling for performance
          gsap.set(container, { 
            width: "100%",
            display: "block"
          });
          
          // Make sections stack vertically
          gsap.set(sections, {
            width: "100%",
            display: "block",
            marginBottom: "6rem"
          });
          
          // Simple fade-in animations
          sections.forEach((section, i) => {
            ScrollTrigger.create({
              trigger: section,
              start: "top 80%",
              onEnter: () => setActiveCategory(i),
              onEnterBack: () => setActiveCategory(i)
            });
            
            // Stagger children animations
            gsap.from(section.children, {
              opacity: 0,
              y: 30,
              stagger: 0.2,
              duration: 0.8,
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse"
              }
            });
          });
        }
      }
      
      // Create globe visualization animation
      if (globeRef.current) {
        // Add scroll-triggered animations to globe section
        const globeTl = gsap.timeline({
          scrollTrigger: {
            trigger: globeRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        });
        
        if (useAdvancedAnimations) {
          globeTl
            .from(globeRef.current.querySelector('h2'), {
              opacity: 0,
              y: 50,
              duration: 0.8
            })
            .from(globeRef.current.querySelector('p'), {
              opacity: 0,
              y: 30,
              duration: 0.8
            }, "-=0.6")
            .from(globeRef.current.querySelector('.globe-container'), {
              opacity: 0,
              scale: 0.5,
              duration: 1,
              ease: "back.out(1.5)"
            }, "-=0.4")
            .from(globeRef.current.querySelectorAll('.connection-point'), {
              scale: 0,
              opacity: 0,
              stagger: 0.05,
              duration: 0.5,
              ease: "back.out(2)"
            }, "-=0.7");
        } else {
          // Simplified animation
          globeTl
            .from(globeRef.current.children, {
              opacity: 0,
              y: 30,
              stagger: 0.2,
              duration: 0.8
            });
        }
      }
      
      // Add parallax to background elements - HelloCopilot style
      if (useAdvancedAnimations) {
        const parallaxElements = document.querySelectorAll('.parallax-bg');
        parallaxElements.forEach((element, i) => {
          const direction = i % 2 === 0 ? 1 : -1;
          const speed = 0.1 + (i * 0.05);
          
          gsap.to(element as Element, {
            y: `${100 * direction * speed}`,
            scrollTrigger: {
              trigger: element.parentElement as Element,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          });
        });
      }
    });
    
    // Cleanup function
    return () => ctx.revert();
  }, [activeCategory, useAdvancedAnimations]);
  
  // Category data
  const categories = [
    {
      id: "take-off",
      title: "Take Off",
      subtitle: "Elevated Activation & Creativity",
      description: "Energizing APIs that boost productivity and inspire innovative solutions.",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-red-900/20 to-orange-800/20",
      products: [
        {
          id: "rapid-integration",
          name: "Rapid Integration API",
          description: "Quick-start your development with seamless integration.",
          effects: "Accelerated Development • Enhanced Productivity • Creative Solutions",
          image: "/assets/rapid-integration.svg"
        },
        {
          id: "data-transformer",
          name: "Data Transformer",
          description: "Transform your data into actionable insights with minimal effort.",
          effects: "Data Enhancement • Real-time Processing • Strategic Analytics",
          image: "/assets/data-transformer.svg"
        },
        {
          id: "developer-boost",
          name: "Developer Boost",
          description: "Supercharge your development workflow with AI-powered assistance.",
          effects: "Code Acceleration • Intelligent Suggestions • Workflow Optimization",
          image: "/assets/developer-boost.svg"
        }
      ]
    },
    {
      id: "touch-down",
      title: "Touch Down",
      subtitle: "Seamless Integration & Stability",
      description: "Calming solutions that provide stability and reliability for your systems.",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-gradient-to-br from-blue-900/20 to-indigo-800/20",
      products: [
        {
          id: "stability-suite",
          name: "Stability Suite",
          description: "Maintain system balance with our comprehensive stability tools.",
          effects: "Error Reduction • Consistent Performance • Peace of Mind",
          image: "/assets/stability-suite.svg"
        },
        {
          id: "secure-connect",
          name: "Secure Connect",
          description: "End-to-end encrypted connections for your most sensitive data.",
          effects: "Enhanced Security • Regulatory Compliance • Data Protection",
          image: "/assets/secure-connect.svg"
        },
        {
          id: "integration-harmony",
          name: "Integration Harmony",
          description: "Smooth integration with existing systems without disruption.",
          effects: "Seamless Compatibility • Minimal Downtime • Legacy Support",
          image: "/assets/integration-harmony.svg"
        }
      ]
    },
    {
      id: "high-point",
      title: "High Point",
      subtitle: "Peak Performance & Intelligence",
      description: "Elevate your systems to new heights with our advanced API solutions.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-900/20 to-emerald-800/20",
      products: [
        {
          id: "ai-accelerator",
          name: "AI Accelerator",
          description: "Implement advanced AI capabilities with minimal development effort.",
          effects: "Intelligent Automation • Predictive Analytics • Cognitive Processing",
          image: "/assets/ai-accelerator.svg"
        },
        {
          id: "global-scale",
          name: "Global Scale",
          description: "Scale your applications globally without performance degradation.",
          effects: "Worldwide Reach • Consistent Experience • Load Balancing",
          image: "/assets/global-scale.svg"
        },
        {
          id: "insight-engine",
          name: "Insight Engine",
          description: "Extract meaningful insights from your data in real-time.",
          effects: "Data Discovery • Pattern Recognition • Business Intelligence",
          image: "/assets/insight-engine.svg"
        }
      ]
    }
  ];
  
  // Helper to assign section refs
  const addSectionRef = (el: HTMLDivElement | null, index: number) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current[index] = el;
    }
  };
  
  // Handle clicking on a category button
  const handleCategoryClick = (index: number) => {
    setActiveCategory(index);
    
    if (useAdvancedAnimations && horizontalRef.current) {
      // Scroll to the horizontal section
      window.scrollTo({
        top: horizontalRef.current.offsetTop,
        behavior: 'smooth'
      });
      
      // After scrolling to container, trigger scroll to the correct section
      setTimeout(() => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.vars.trigger === horizontalRef.current) {
            const progress = index / (categories.length - 1);
            st.scroll(st.start + ((st.end - st.start) * progress));
          }
        });
      }, 500);
    } else {
      // In simplified mode, scroll to the section vertically
      const sectionElement = sectionsRef.current[index];
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  return (
    <div ref={containerRef} className="products-page bg-black min-h-screen text-white">
      <Navbar />
      
      {/* Header section - HelloCopilot style with split text animation */}
      <header 
        ref={headerRef}
        className="py-24 min-h-[60vh] flex items-center relative overflow-hidden"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="main-title text-7xl md:text-9xl font-bold gradient-text mb-8">
            WorldAPI Products
          </h1>
          
          <p className="subtitle text-xl md:text-2xl max-w-3xl mx-auto text-white/70 mb-12">
            Explore our suite of powerful API solutions designed to transform your development experience
          </p>
          
          {/* Category navigation - HelloCopilot style */}
          <div 
            ref={categoryNavigationRef}
            className="category-navigation max-w-3xl mx-auto"
          >
            <div className="category-buttons flex justify-center gap-4 my-8 p-2 rounded-full bg-white/5 border border-white/10">
              {categories.map((category, i) => (
                <button
                  key={i}
                  className={`category-button py-3 px-8 rounded-full transition-all duration-300 
                           ${i === activeCategory 
                             ? `bg-gradient-to-r ${category.color} text-white` 
                             : 'hover:bg-white/10 text-white/70'}`}
                  onClick={() => handleCategoryClick(i)}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Parallax background elements - HelloCopilot style */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="parallax-bg absolute w-[40vw] h-[40vw] rounded-full blur-3xl opacity-20 bg-blue-500 -top-[20vw] -left-[20vw]"></div>
          <div className="parallax-bg absolute w-[30vw] h-[30vw] rounded-full blur-3xl opacity-15 bg-purple-600 top-[30vw] right-[5vw]"></div>
          <div className="parallax-bg absolute w-[15vw] h-[15vw] rounded-full blur-2xl opacity-10 bg-secondary bottom-[10vw] left-[10vw]"></div>
        </div>
      </header>
      
      {/* Categories with product display - HelloCopilot style */}
      <div className="categories-container relative overflow-hidden">
        <div
          ref={horizontalRef}
          className={`flex ${!useAdvancedAnimations ? 'flex-col' : ''} min-h-[100vh] relative`}
        >
          {categories.map((category, index) => (
            <div
              key={category.id}
              ref={(el) => addSectionRef(el as HTMLDivElement, index)}
              className={`category-section min-h-[100vh] ${useAdvancedAnimations ? 'w-screen flex-shrink-0' : ''} 
                        relative ${category.bgColor}`}
              id={category.id}
            >
              <div className="container mx-auto px-4 py-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="category-title text-6xl md:text-8xl font-bold mb-6">
                    <span className={`bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                      {category.title}
                    </span>
                  </h2>
                  
                  <p className="category-subtitle text-2xl text-white/80 mb-4">
                    {category.subtitle}
                  </p>
                  
                  <p className="category-description text-xl text-white/60">
                    {category.description}
                  </p>
                </div>
                
                {/* Product cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.products.map((product) => (
                    <div 
                      key={product.id}
                      className="product-card group bg-white/5 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/10 transition-all duration-500 hover:border-white/30 hover:bg-white/10"
                    >
                      <div className="product-image aspect-[4/3] overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      
                      <div className="product-content p-6">
                        <h3 className="text-xl font-bold mb-2">
                          {product.name}
                        </h3>
                        
                        <p className="text-white/80 mb-4">
                          {product.description}
                        </p>
                        
                        <div className="effects text-sm text-white/60 mb-4">
                          {product.effects}
                        </div>
                        
                        <Link 
                          to={`/products/${product.id}`} 
                          className={`inline-flex items-center gap-2 py-2 px-4 rounded-full bg-gradient-to-r ${category.color} text-white 
                                    transition-all duration-300 hover:shadow-lg hover:shadow-${category.color.split('-')[1]}/20`}
                        >
                          Learn More
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="M12 5l7 7-7 7"></path>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Category-specific background elements */}
              <div className="absolute inset-0 -z-10 pointer-events-none">
                {index === 0 && (
                  // Take Off background
                  <div className="absolute top-1/4 right-1/4 w-[40vw] h-[40vw] bg-red-500/10 rounded-full blur-3xl"></div>
                )}
                
                {index === 1 && (
                  // Touch Down background
                  <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-3xl"></div>
                )}
                
                {index === 2 && (
                  // High Point background
                  <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] bg-green-500/10 rounded-full blur-3xl"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Fixed navigation arrows */}
        {useAdvancedAnimations && (
          <div className="fixed bottom-8 left-0 right-0 z-10 flex justify-center gap-4">
            <div className="bg-black/30 backdrop-blur-md rounded-full p-2 flex">
              {categories.map((category, i) => (
                <button
                  key={i}
                  className={`w-28 py-2 px-4 rounded-full transition-all duration-300
                             ${i === activeCategory 
                               ? `bg-gradient-to-r ${category.color} text-white` 
                               : 'text-white/50 hover:text-white'}`}
                  onClick={() => handleCategoryClick(i)}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Globe visualization with advanced animations */}
      <div 
        ref={globeRef}
        className="py-24 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Global API Connectivity
          </h2>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-12">
            Our WorldAPI provides seamless integration with systems around the globe, 
            ensuring your applications have the worldwide reach they deserve.
          </p>
          
          <div className="globe-container relative mx-auto w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
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
                <div className="text-7xl md:text-8xl animate-float" style={{ animationDuration: '8s' }}>
                  🌎
                </div>
              </div>
            </div>
            
            {/* Pulsing glow effect */}
            <div className="absolute inset-[100px] rounded-full bg-blue-500/5 animate-pulse" style={{ animationDuration: '3s' }}></div>
            
            {/* Connection points with enhanced styling and animations */}
            {useAdvancedAnimations && [...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const radius = 220;
              const x = Math.cos(angle) * radius + 250;
              const y = Math.sin(angle) * radius + 250;
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
            {useAdvancedAnimations && [...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const startRadius = 220;
              const startX = Math.cos(angle) * startRadius + 250;
              const startY = Math.sin(angle) * startRadius + 250;
              
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
          
          {/* Add keyframes for packet animation */}
          <style>
            {`
              @keyframes packetTravel {
                0% {
                  transform: translate(0, 0) scale(1);
                  opacity: 1;
                }
                100% {
                  transform: translate(${-Math.cos(0) * 220}px, ${-Math.sin(0) * 220}px) scale(0.5);
                  opacity: 0;
                }
              }
            `}
          </style>
        </div>
        
        {/* Parallax background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="parallax-bg absolute w-full h-full bg-gradient-radial from-primary/20 to-transparent opacity-50"></div>
          <div className="parallax-bg absolute w-[20vw] h-[20vw] rounded-full blur-2xl opacity-10 bg-accent top-1/4 right-1/4"></div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductsPage; 