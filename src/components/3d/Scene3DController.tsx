import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDetectGPU } from '@react-three/drei';

interface Scene3DControllerProps {
  children: ReactNode;
}

// Feature detection helper
const isWebGLSupported = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

const Scene3DController: React.FC<Scene3DControllerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lowPerformance, setLowPerformance] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const gpu = useDetectGPU();
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Check WebGL support on mount
    setWebGLSupported(isWebGLSupported());
    
    // Add reduced motion media query detection
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detect if we should use lower quality graphics
    if (
      gpu.tier < 2 || 
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      prefersReducedMotion
    ) {
      setLowPerformance(true);
    }

    // Add browser detection for additional optimizations
    const isIE = /*@cc_on!@*/false || !!(document as any).documentMode;
    const isEdgeLegacy = !isIE && !!(window as any).StyleMedia;
    const isOldSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && 
                         navigator.userAgent.indexOf('Version/14') === -1 &&
                         navigator.userAgent.indexOf('Version/15') === -1 &&
                         navigator.userAgent.indexOf('Version/16') === -1;
    
    if (isIE || isEdgeLegacy || isOldSafari) {
      setLowPerformance(true);
    }
  }, [gpu]);

  useEffect(() => {
    // Optimize performance during scroll
    const handleScroll = () => {
      if (!isScrolling) {
        setIsScrolling(true);
      }
      
      // Reset the timeout on every scroll event
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set a timeout to mark scrolling as finished
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        scrollTimeoutRef.current = null;
      }, 150); // Wait 150ms after scroll stops
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isScrolling]);

  // Handle no WebGL support or low performance with a fallback
  if (!webGLSupported) {
    return (
      <div 
        className="fixed inset-0 pointer-events-none z-[-1] bg-gradient-to-b from-dark to-primary"
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
      aria-hidden="true"
      role="presentation"
    >
      {webGLSupported ? (
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ 
            alpha: true, 
            antialias: !lowPerformance,
            powerPreference: 'high-performance',
            // Reduce precision for better performance
            precision: lowPerformance ? 'lowp' : 'mediump',
            failIfMajorPerformanceCaveat: true, // Don't render if performance would be very poor
          }}
          dpr={lowPerformance ? 0.6 : (isScrolling ? 1 : Math.min(window.devicePixelRatio, 2))}
          frameloop={isScrolling || lowPerformance ? 'demand' : 'always'} // Only render when needed
          style={{ background: 'transparent' }}
          performance={{ max: 0.8 }} // Limit CPU usage
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />
          {/* Only render complex elements when not scrolling */}
          {!isScrolling && children}
          {/* Show simplified placeholder during scroll */}
          {isScrolling && (
            <mesh>
              <planeGeometry args={[20, 20]} />
              <meshBasicMaterial color="#000" transparent opacity={0.1} />
            </mesh>
          )}
        </Canvas>
      ) : null}
    </div>
  );
};

export default Scene3DController;
