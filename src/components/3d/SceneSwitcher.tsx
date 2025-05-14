import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// CSS-only version of SceneSwitcher with enhanced HelloCopilot-like animations

// Declaration for global scrollTimeout
declare global {
  interface Window {
    scrollTimeout?: number;
  }
}

interface SceneSwitcherProps {
  scrollProgress?: number;
}

const SceneSwitcher: React.FC<SceneSwitcherProps> = ({ scrollProgress = 0 }) => {
  const [activeScene, setActiveScene] = useState('hero');
  const [sceneOpacity, setSceneOpacity] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLDivElement[]>([]);
  
  // Update the active scene based on scroll position
  useEffect(() => {
    // Determine which scene to show based on scroll
    const determineActiveScene = () => {
      if (scrollProgress < 0.3) {
        return 'hero';
      } else if (scrollProgress < 0.7) {
        return 'features';
      } else {
        return 'hero';
      }
    };
    
    const nextScene = determineActiveScene();
    
    // Skip animation for better performance during fast scrolling
    if (nextScene !== activeScene) {
      // Check if scrolling is happening quickly
      const isScrollingQuickly = document.documentElement.classList.contains('scrolling-quickly');
      
      if (isScrollingQuickly) {
        // Immediately switch scene without animation
        setActiveScene(nextScene);
      } else {
        // Use smooth transition for better experience during slow scrolling
        setSceneOpacity(0);
        setTimeout(() => {
          setActiveScene(nextScene);
          setSceneOpacity(1);
        }, 300);
      }
    }
  }, [scrollProgress, activeScene]);

  // Add advanced animations for background elements - similar to HelloCopilot
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    const elements = containerRef.current.querySelectorAll('.bg-element');
    elementsRef.current = Array.from(elements) as HTMLDivElement[];
    
    // Kill any existing animations first
    gsap.killTweensOf(elementsRef.current);
    
    // Create a main timeline
    const mainTimeline = gsap.timeline();
    
    // For each element, create more complex animations
    elementsRef.current.forEach((element, index) => {
      // Calculate base parameters based on element index
      const duration = 15 + index * 5;
      const delay = index * 0.5;
      const amplitude = 30 + index * 10;
      const rotationAmount = (index % 2 ? 15 : -15);
      
      // Complex animation for each element - similar to HelloCopilot
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      
      // Initial animation - appear with scale
      tl.fromTo(element, 
        { 
          scale: 0.8, 
          opacity: 0.5,
          rotation: 0
        }, 
        { 
          scale: 1, 
          opacity: 1,
          rotation: rotationAmount * 0.5,
          duration: duration * 0.1,
          ease: "power2.out"
        }
      );
      
      // Use either MotionPath animation or fallback to simple animation
      try {
        // Check if MotionPathPlugin is available
        if (MotionPathPlugin) {
          // Movement animation - more complex path with MotionPathPlugin
          tl.to(element, {
            motionPath: {
              path: [
                { x: amplitude * Math.sin(index), y: amplitude * 0.5 * Math.cos(index * 0.7) },
                { x: -amplitude * 0.7 * Math.cos(index * 0.5), y: -amplitude * 0.3 * Math.sin(index * 0.9) },
                { x: amplitude * 0.5 * Math.sin(index * 1.2), y: amplitude * Math.cos(index * 0.3) },
                { x: 0, y: 0 }
              ],
              curviness: 2
            },
            rotation: rotationAmount,
            duration: duration,
            ease: "sine.inOut"
          });
        } else {
          throw new Error("MotionPathPlugin not available");
        }
      } catch (error) {
        // Fallback animation if MotionPathPlugin is not available
        console.warn("Using fallback animation without MotionPath", error);
        
        tl.to(element, {
          x: (index % 2 ? 1 : -1) * amplitude * 0.8,
          y: (index % 3 - 1) * amplitude * 0.5,
          rotation: rotationAmount,
          duration: duration * 0.5,
          ease: "sine.inOut"
        })
        .to(element, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: duration * 0.5,
          ease: "sine.inOut"
        });
      }
      
      // End animation - fade slightly and prepare for repeat
      tl.to(element, {
        scale: 0.9,
        opacity: 0.8,
        rotation: 0,
        duration: duration * 0.1,
        ease: "power2.in"
      });
      
      // Add this timeline to main timeline with appropriate delay
      mainTimeline.add(tl, delay);
    });
    
    // Add scroll-linked animations
    if (scrollProgress > 0) {
      gsap.to(elementsRef.current, {
        y: (index) => scrollProgress * 100 * (index % 2 ? -1 : 1),
        opacity: () => 1 - scrollProgress * 0.3,
        overwrite: true,
        duration: 0.5
      });
    }
    
    return () => {
      gsap.killTweensOf(elementsRef.current);
      mainTimeline.kill();
    };
  }, [activeScene, scrollProgress]);
  
  return (
    <div 
      ref={containerRef}
      className="scene-container fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      <div 
        className={`w-full h-full absolute inset-0 transition-opacity duration-500 ${
          activeScene === 'hero' 
            ? 'bg-gradient-to-b from-primary/80 to-dark' 
            : 'bg-gradient-to-b from-accent/20 to-dark'
        }`}
        style={{ opacity: sceneOpacity }}
      >
        {/* Dynamic background elements based on active scene */}
        {activeScene === 'hero' ? (
          <>
            <div className="bg-element absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-secondary/5 blur-3xl"></div>
            <div className="bg-element absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl"></div>
            <div className="bg-element absolute top-2/3 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-primary/10 blur-3xl"></div>
            
            {/* Add more elements for a richer effect - inspired by HelloCopilot */}
            <div className="bg-element absolute top-[15%] right-[35%] w-32 h-32 rounded-full bg-secondary/10 blur-3xl"></div>
            <div className="bg-element absolute bottom-[40%] left-[15%] w-48 h-48 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="bg-element absolute top-[45%] right-[10%] w-56 h-56 rounded-full bg-accent/10 blur-3xl"></div>
          </>
        ) : (
          <>
            <div className="bg-element absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-3xl"></div>
            <div className="bg-element absolute bottom-1/3 left-1/3 w-56 h-56 rounded-full bg-secondary/10 blur-3xl"></div>
            <div className="bg-element absolute top-1/2 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-primary/5 blur-3xl"></div>
            
            {/* Add more elements for a richer effect - inspired by HelloCopilot */}
            <div className="bg-element absolute top-[25%] left-[20%] w-40 h-40 rounded-full bg-accent/5 blur-3xl"></div>
            <div className="bg-element absolute bottom-[20%] right-[30%] w-64 h-64 rounded-full bg-secondary/5 blur-3xl"></div>
            <div className="bg-element absolute top-[60%] left-[40%] w-36 h-36 rounded-full bg-primary/10 blur-3xl"></div>
          </>
        )}
        
        {/* Scene text overlay - with glow effect like HelloCopilot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <h2 className="text-5xl font-bold text-white/10 text-shadow-glow">
            {activeScene === 'hero' ? 'WorldAPI Connect' : 'Explore Features'}
          </h2>
          <p className="text-white/5 text-xl mt-4 text-shadow-sm">
            {activeScene === 'hero' ? 'Seamless Integration' : 'Powerful Capabilities'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Add scroll velocity detection to help with performance optimization
document.addEventListener('scroll', () => {
  document.documentElement.classList.add('scrolling-quickly');
  if (window.scrollTimeout) {
    clearTimeout(window.scrollTimeout);
  }
  window.scrollTimeout = setTimeout(() => {
    document.documentElement.classList.remove('scrolling-quickly');
  }, 100);
}, { passive: true });

export default SceneSwitcher; 