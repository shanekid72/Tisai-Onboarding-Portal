import { useRef, useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ScrollMagicParallaxProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  imgSrc?: string;
  reverse?: boolean;
}

const ScrollMagicParallax: React.FC<ScrollMagicParallaxProps> = ({
  children,
  title = "WorldAPI Integration",
  subtitle = "Discover a new way to connect",
  imgSrc = "/assets/api-graphic.png",
  reverse = false,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasSetup, setHasSetup] = useState(false);
  
  // Ensure content is visible first, then try to add animations - use useLayoutEffect
  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    
    // Ensure content is visible immediately
    ensureContentVisible();
    
    // Only try animations once
    if (hasSetup) return;
    
    const animations: any[] = [];
    
    try {
      // Set up animations with error handling
      const ctx = gsap.context(() => {
        // Animate title
        if (titleRef.current) {
          const titleAnim = gsap.fromTo(titleRef.current, 
            { opacity: 0, y: 30 }, 
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.8, 
              scrollTrigger: {
                trigger: titleRef.current,
                start: "top bottom-=100",
                toggleActions: "play none none none"
              }
            }
          );
          animations.push(titleAnim);
        }
        
        // Animate subtitle
        if (subtitleRef.current) {
          const subtitleAnim = gsap.fromTo(subtitleRef.current, 
            { opacity: 0, y: 20 }, 
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.8,
              delay: 0.2,
              scrollTrigger: {
                trigger: subtitleRef.current,
                start: "top bottom-=80",
                toggleActions: "play none none none"
              }
            }
          );
          animations.push(subtitleAnim);
        }
        
        // Animate image
        if (imageRef.current) {
          const imageAnim = gsap.fromTo(imageRef.current, 
            { opacity: 0, x: reverse ? -30 : 30 }, 
            { 
              opacity: 1, 
              x: 0, 
              duration: 0.8,
              delay: 0.3,
              scrollTrigger: {
                trigger: imageRef.current,
                start: "top bottom-=50",
                toggleActions: "play none none none"
              }
            }
          );
          animations.push(imageAnim);
          
          // Simple hover effect
          imageRef.current.addEventListener('mouseenter', () => {
            gsap.to(imageRef.current, { scale: 1.03, duration: 0.3 });
          });
          
          imageRef.current.addEventListener('mouseleave', () => {
            gsap.to(imageRef.current, { scale: 1, duration: 0.3 });
          });
        }
        
        // Animate content
        if (contentRef.current) {
          const contentAnim = gsap.fromTo(contentRef.current, 
            { opacity: 0, y: 20 }, 
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.8,
              delay: 0.4,
              scrollTrigger: {
                trigger: contentRef.current,
                start: "top bottom-=50",
                toggleActions: "play none none none"
              }
            }
          );
          animations.push(contentAnim);
        }
      }, sectionRef);
      
      setHasSetup(true);
      
      return () => {
        try {
          ctx.revert();
          animations.forEach(anim => {
            if (anim && typeof anim.kill === 'function') {
              anim.kill();
            }
          });
        } catch (e) {
          console.error("Error cleaning up ScrollMagicParallax animations:", e);
          ensureContentVisible();
        }
      };
    } catch (error) {
      console.error("Error in ScrollMagicParallax animations:", error);
      ensureContentVisible();
    }
  }, [hasSetup, reverse, title, subtitle]);
  
  // Helper function to ensure all content is visible
  const ensureContentVisible = () => {
    if (titleRef.current) {
      titleRef.current.style.opacity = "1";
      titleRef.current.style.transform = "translateY(0)";
    }
    if (subtitleRef.current) {
      subtitleRef.current.style.opacity = "1";
      subtitleRef.current.style.transform = "translateY(0)";
    }
    if (imageRef.current) {
      imageRef.current.style.opacity = "1";
      imageRef.current.style.transform = "translateX(0)";
    }
    if (contentRef.current) {
      contentRef.current.style.opacity = "1";
      contentRef.current.style.transform = "translateY(0)";
    }
  };
  
  return (
    <section 
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10`}>
          {/* Text content */}
          <div className={`w-full md:w-1/2 ${reverse ? 'md:pl-10' : 'md:pr-10'}`}>
            <h2 
              ref={titleRef}
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
              style={{ opacity: 0 }}
            >
              {title}
            </h2>
            
            <p 
              ref={subtitleRef}
              className="text-xl md:text-2xl mb-8 text-white/80"
              style={{ opacity: 0 }}
            >
              {subtitle}
            </p>
            
            <div 
              ref={contentRef} 
              className="space-y-6"
              style={{ opacity: 0 }}
            >
              {children || (
                <>
                  <p className="text-white/70">
                    Connect to WorldAPI with our advanced integration platform that makes 
                    API implementation intuitive and visual.
                  </p>
                  <div className="flex gap-4">
                    <button className="btn-primary btn">Explore</button>
                    <button className="btn-outline btn">Learn More</button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Image */}
          <div className={`w-full md:w-1/2 ${reverse ? 'md:pr-10' : 'md:pl-10'}`}>
            <div 
              ref={imageRef}
              className="rounded-lg overflow-hidden shadow-xl transition-all duration-300 cursor-pointer"
              style={{ opacity: 0 }}
            >
              {imgSrc.endsWith('.mp4') ? (
                <video 
                  className="w-full h-auto rounded-lg"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={imgSrc} type="video/mp4" />
                </video>
              ) : (
                <img 
                  src={imgSrc || "https://via.placeholder.com/600x400?text=WorldAPI"} 
                  alt={title}
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Simpler background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-dark/80 to-dark opacity-80"></div>
        <div className="absolute right-10 top-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute left-10 bottom-10 w-64 h-64 rounded-full bg-secondary/10 blur-3xl"></div>
      </div>
    </section>
  );
};

export default ScrollMagicParallax; 