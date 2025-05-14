import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

// Simple CSS-based animation that doesn't use WebGL

interface ScrollAnimation3DProps {
  scrollProgress: number;
}

const ScrollAnimation3D: React.FC<ScrollAnimation3DProps> = ({ scrollProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use GSAP to animate elements based on scroll position
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Update elements based on scroll progress
    const elements = containerRef.current.querySelectorAll('.animated-element');
    
    elements.forEach((element, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const offset = (index + 1) * 20;
      
      // Calculate positions based on scroll
      const xPos = direction * scrollProgress * offset;
      const yPos = (index % 3 - 1) * scrollProgress * offset * 0.5;
      const scale = 1 + scrollProgress * 0.1 * (index % 3);
      const opacity = 0.1 + scrollProgress * 0.3;
      
      gsap.set(element, {
        x: xPos,
        y: yPos,
        scale: scale,
        opacity: opacity,
        rotation: direction * scrollProgress * 10,
      });
    });
    
    // Text element
    const textElement = containerRef.current.querySelector('.text-element');
    if (textElement) {
      gsap.set(textElement, {
        y: -50 + scrollProgress * 150,
        opacity: 0.1 + scrollProgress * 0.9,
      });
    }
  }, [scrollProgress]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-5 pointer-events-none overflow-hidden"
      style={{ opacity: 0.6 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/20"></div>
      
      {/* Elements that will be animated via GSAP */}
      <div className="animated-element absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-secondary/10 blur-3xl"></div>
      <div className="animated-element absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl"></div>
      <div className="animated-element absolute top-2/3 left-1/2 transform -translate-x-1/2 w-64 h-64 rounded-full bg-primary/20 blur-3xl"></div>
      
      {/* Multiple layers for depth */}
      <div className="animated-element absolute top-[20%] left-[15%] w-20 h-20 rounded-full bg-secondary/5 blur-xl"></div>
      <div className="animated-element absolute top-[60%] left-[65%] w-16 h-16 rounded-full bg-accent/5 blur-xl"></div>
      <div className="animated-element absolute top-[30%] left-[45%] w-12 h-12 rounded-full bg-secondary/5 blur-xl"></div>
      
      {/* Center text */}
      <div className="text-element absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h2 className="text-4xl font-bold text-white/10">TisAi</h2>
        <p className="text-white/5 text-sm mt-2">WorldAPI Connect</p>
      </div>
    </div>
  );
};

export default ScrollAnimation3D; 