import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface GlobeProps {
  size?: number;
  color?: string;
  connectionPoints?: number;
  animationSpeed?: number;
}

const Globe: React.FC<GlobeProps> = ({
  size = 300,
  color = '#3498db',
  connectionPoints = 8,
  animationSpeed = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLDivElement[]>([]);
  
  // Track connection point refs
  const addPointRef = (el: HTMLDivElement | null, index: number) => {
    if (el && !pointsRef.current.includes(el)) {
      pointsRef.current[index] = el;
    }
  };
  
  useEffect(() => {
    if (containerRef.current && globeRef.current) {
      // Create a timeline for the globe animations
      const tl = gsap.timeline({ repeat: -1 });
      
      // Globe rotation animation
      tl.to(globeRef.current, {
        rotation: 360,
        duration: 40 / animationSpeed,
        ease: "none",
        transformOrigin: "center center"
      });
      
      // Connection points animations
      pointsRef.current.forEach((point, index) => {
        if (point) {
          // Pulse animation for each point
          gsap.to(point, {
            scale: 1.5,
            opacity: 0.8,
            duration: 1 + (index * 0.2),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
          
          // Also add a slight position animation
          gsap.to(point, {
            y: `-=${5 + (index % 3) * 2}`,
            x: `${index % 2 === 0 ? '+' : '-'}=${3 + (index % 2) * 2}`,
            duration: 3 + (index * 0.5),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
      });
    }
    
    // Cleanup function
    return () => {
      gsap.killTweensOf(globeRef.current);
      pointsRef.current.forEach(point => {
        gsap.killTweensOf(point);
      });
    };
  }, [animationSpeed, connectionPoints]);
  
  // Generate connection points positioned around a circle
  const connectionPointElements = Array.from({ length: connectionPoints }).map((_, i) => {
    const angle = (i / connectionPoints) * Math.PI * 2;
    const radius = size / 2 - 10; // Position just inside the globe
    const x = Math.cos(angle) * radius + size / 2;
    const y = Math.sin(angle) * radius + size / 2;
    
    return (
      <div 
        key={i}
        ref={(el) => addPointRef(el, i)}
        className="connection-point absolute w-2 h-2 rounded-full"
        style={{ 
          left: x, 
          top: y,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}80, 0 0 20px ${color}40`,
          transform: 'translate(-50%, -50%)'
        }}
      />
    );
  });
  
  return (
    <div 
      ref={containerRef}
      className="globe-container relative"
      style={{ 
        width: size, 
        height: size 
      }}
    >
      {/* Globe outer ring */}
      <div 
        ref={globeRef}
        className="globe-ring absolute inset-0 rounded-full border-4 border-opacity-20"
        style={{ borderColor: color }}
      />
      
      {/* Inner rings */}
      <div 
        className="inner-ring-1 absolute rounded-full border-2 border-opacity-15"
        style={{ 
          borderColor: color, 
          top: size * 0.1, 
          left: size * 0.1, 
          right: size * 0.1, 
          bottom: size * 0.1,
          animationDuration: `${30 / animationSpeed}s`,
          animationName: 'spin',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
          animationDirection: 'reverse'
        }}
      />
      
      <div 
        className="inner-ring-2 absolute rounded-full border border-opacity-10"
        style={{ 
          borderColor: color, 
          top: size * 0.2, 
          left: size * 0.2, 
          right: size * 0.2, 
          bottom: size * 0.2 
        }}
      />
      
      {/* Globe center */}
      <div 
        className="globe-center absolute flex items-center justify-center"
        style={{ 
          top: size * 0.3, 
          left: size * 0.3, 
          right: size * 0.3, 
          bottom: size * 0.3,
          backgroundColor: `${color}20`,
          borderRadius: '50%'
        }}
      >
        <span className="text-4xl">🌎</span>
      </div>
      
      {/* Connection points */}
      {connectionPointElements}
      
      {/* Add a keyframes style for the rotation animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Globe; 