import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Stars, Cloud, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import FloatingModel from './FloatingModel';

interface HowItWorks3DSceneProps {
  scrollY?: number;
  activeStep?: number;
  opacity?: number;
  has3dFeatures?: boolean;
}

// Scene lighting component with responsive changes based on activeStep
function SceneLighting({ activeStep = 0 }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const lastActiveStep = useRef(activeStep);
  
  // Colors for each step - memoize to prevent recreation
  const colors = useMemo(() => [
    0x6366f1, // Brighter Blue - Conversational Onboarding
    0xa855f7, // Brighter Purple - Configure Connection
    0x22c55e, // Brighter Green - Test & Validate
    0xf97316  // Brighter Orange - Deploy & Monitor
  ], []);
  
  // Update light color based on active step - throttled with smooth transitions
  useFrame(() => {
    if (lightRef.current) {
      // Use a reference to track changes and smooth transitions
      if (lastActiveStep.current !== activeStep) {
        lastActiveStep.current = activeStep;
      }
      
      const targetColor = colors[lastActiveStep.current] || colors[0];
      
      // Smooth color transition using lerp
      lightRef.current.color.lerp(new THREE.Color(targetColor), 0.03);
      
      // More efficient sine wave using low-frequency oscillation
      const time = Date.now() * 0.0003;
      lightRef.current.intensity = 2.5 + Math.sin(time) * 0.3; // Increased intensity
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.7} /> {/* Increased ambient light */}
      <directionalLight 
        ref={lightRef} 
        position={[10, 10, 10]} 
        intensity={2.5} // Increased intensity
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, -10, -10]} intensity={1.0} color="#ffffff" /> {/* Increased intensity */}
      {/* Add more lights for better visibility */}
      <pointLight position={[10, 0, 10]} intensity={0.8} color="#8866ff" /> {/* Purple accent light */}
      <pointLight position={[-15, 5, -10]} intensity={0.6} color="#22ffbb" /> {/* Teal accent light */}
    </>
  );
}

// Camera controller that subtly follows scrolling with improved stability
function CameraController({ scrollY = 0 }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const targetScrollY = useRef(scrollY);
  const lastRafId = useRef<number | null>(null);
  
  // Use smooth interpolation for camera movement
  useEffect(() => {
    // Update target position in a less frequent way
    const handleScrollUpdate = () => {
      targetScrollY.current = scrollY;
    };
    
    // Debounce the scroll updates for stability
    const debouncedUpdate = () => {
      if (lastRafId.current) cancelAnimationFrame(lastRafId.current);
      lastRafId.current = requestAnimationFrame(handleScrollUpdate);
    };
    
    debouncedUpdate();
    
    return () => {
      if (lastRafId.current) cancelAnimationFrame(lastRafId.current);
    };
  }, [scrollY]);
  
  // Very smooth camera movement with strong damping factor
  useFrame(() => {
    if (cameraRef.current) {
      // Extra smooth camera movement - very stable during fast scrolling
      cameraRef.current.position.y = THREE.MathUtils.lerp(
        cameraRef.current.position.y,
        10 - targetScrollY.current * 0.001,
        0.01
      );
      
      // Minimal rotation to prevent jarring effects
      cameraRef.current.rotation.x = THREE.MathUtils.lerp(
        cameraRef.current.rotation.x,
        -0.1 + targetScrollY.current * 0.00002,
        0.01
      );
    }
  });
  
  return (
    <PerspectiveCamera 
      ref={cameraRef} 
      makeDefault 
      position={[0, 10, 15]} // Moved camera closer
      fov={60} // Wider field of view
    />
  );
}

export default function HowItWorks3DScene({ 
  scrollY = 0, 
  activeStep = 0,
  opacity = 1,
  has3dFeatures = true
}: HowItWorks3DSceneProps) {
  // Fall back to a simpler display if 3D features are disabled
  if (!has3dFeatures) {
    return null;
  }
  
  // Memoize color palette to prevent recreation - brighter colors for better visibility through cards
  const colors = useMemo(() => [
    '#818cf8', // Even brighter Blue - Conversational Onboarding
    '#c084fc', // Even brighter Purple - Configure Connection
    '#4ade80', // Even brighter Green - Test & Validate
    '#fb923c'  // Even brighter Orange - Deploy & Monitor
  ], []);
  
  // Get current color based on active step
  const currentColor = colors[activeStep] || colors[0];
  
  // Performance optimization: memoize the random positions for extra objects
  const extraModelProps = useMemo(() => {
    // Create objects positioned to complement the card layout
    return Array.from({ length: 10 }).map((_, i) => {
      // Calculate positions that work well with the card layout
      // For even index items, position on the left, for odd on the right
      const sideMultiplier = i % 2 === 0 ? -1 : 1;
      // Stagger vertical positions
      const yPos = (i * 5) % 25 - 10;
      
      return {
        shape: i % 7 === 0 ? 'sphere' : 
               i % 7 === 1 ? 'box' : 
               i % 7 === 2 ? 'torus' : 
               i % 7 === 3 ? 'cone' :
               i % 7 === 4 ? 'octahedron' :
               i % 7 === 5 ? 'torusKnot' : 'capsule',
        position: [
          sideMultiplier * (8 + Math.random() * 5), // Position either left or right of cards
          yPos, // Staggered vertical positions
          -10 - Math.random() * 10 // Various depths
        ] as [number, number, number],
        scale: 0.3 + Math.random() * 0.3, // Slightly larger
        floatIntensity: 0.3 + Math.random() * 0.3,
        speed: 0.2 + Math.random() * 0.2,
        parallaxFactor: 0.02 + Math.random() * 0.05,
        wireframe: Math.random() > 0.7,
        emissive: true, // All objects emit light
        emissiveIntensity: 0.4 + Math.random() * 0.3 // Brighter emission
      };
    });
  }, []);
  
  // Smoothed scroll value for better stability
  const smoothScrollY = useMemo(() => {
    return Math.round(scrollY / 30) * 30;
  }, [scrollY]);
  
  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <Canvas shadows gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        {/* Responsive camera with improved stability */}
        <CameraController scrollY={smoothScrollY} />
        
        {/* Environment & Lighting */}
        <SceneLighting activeStep={activeStep} />
        <Environment preset="night" />
        
        {/* Clouds for atmosphere */}
        <Cloud 
          position={[0, 8, -20]}
          opacity={0.8} // Increased opacity
          speed={0.1}
          segments={10}
          color={currentColor}
        />
        
        <Cloud 
          position={[-15, -5, -25]}
          opacity={0.6}
          speed={0.1}
          segments={8}
          color="#ffffff"
        />
        
        {/* Floating 3D models - positioned for each step */}
        {/* Step 1: Conversational Onboarding */}
        <FloatingModel 
          shape="sphere" 
          color={colors[0]} 
          position={[-8, 4, -5]} // Adjusted position to be more visible on left side
          floatIntensity={0.5}
          scrollY={smoothScrollY}
          scale={activeStep === 0 ? 2.5 : 1.0} // Larger sizes overall
          emissive={true}
          emissiveIntensity={activeStep === 0 ? 1.0 : 0.4} // Brighter intensity
          parallaxFactor={0.04}
        />
        
        {/* Step 2: Configure Connection */}
        <FloatingModel 
          shape="torusKnot" 
          color={colors[1]} 
          position={[8, -2, -3]} // Adjusted position to be more visible on right side
          floatIntensity={0.4}
          scrollY={smoothScrollY}
          scale={activeStep === 1 ? 1.8 : 0.7} // Larger sizes overall
          distort={false}
          emissive={true}
          emissiveIntensity={activeStep === 1 ? 1.0 : 0.4} // Brighter intensity
          parallaxFactor={0.03}
          rotationAxis="y"
        />
        
        {/* Step 3: Test & Validate */}
        <FloatingModel 
          shape="octahedron" 
          color={colors[2]} 
          position={[-7, -6, -6]} // Adjusted position to be more visible on left side
          floatIntensity={0.4}
          scrollY={smoothScrollY}
          scale={activeStep === 2 ? 2.0 : 0.9} // Larger sizes overall
          wireframe={activeStep === 2}
          emissive={true}
          emissiveIntensity={activeStep === 2 ? 1.0 : 0.4} // Brighter intensity
          parallaxFactor={0.03}
        />
        
        {/* Step 4: Deploy & Monitor */}
        <FloatingModel 
          shape="cone" 
          color={colors[3]} 
          position={[7, 6, -2]} // Adjusted position to be more visible on right side
          floatIntensity={0.4}
          scrollY={smoothScrollY}
          scale={activeStep === 3 ? 1.9 : 0.7} // Larger sizes overall
          emissive={true}
          emissiveIntensity={activeStep === 3 ? 1.0 : 0.4} // Brighter intensity
          parallaxFactor={0.03}
        />
        
        {/* Background elements - stars */}
        <Stars radius={100} depth={50} count={1000} factor={4} fade speed={0.3} />
        
        {/* Connection lines between active models */}
        {activeStep > 0 && (
          <group>
            <FloatingModel 
              shape="capsule" 
              scale={0.08} 
              position={[-5 + (activeStep >= 1 ? 10 : 0), 0, -4]} // Adjusted to span across the page
              color={colors[0]}
              distort={false}
              wireframe={true}
              floatIntensity={0}
              emissive={true}
              emissiveIntensity={0.8} // Brighter
            />
            
            {activeStep >= 1 && (
              <FloatingModel 
                shape="capsule" 
                scale={0.08} 
                position={[5 + (activeStep >= 2 ? -10 : 0), -2, -4]} // Adjusted to span across the page
                color={colors[1]}
                distort={false}
                wireframe={true}
                floatIntensity={0}
                emissive={true}
                emissiveIntensity={0.8} // Brighter
              />
            )}
            
            {activeStep >= 2 && (
              <FloatingModel 
                shape="capsule" 
                scale={0.08} 
                position={[-5 + (activeStep >= 3 ? 10 : 0), -4, -4]} // Adjusted to span across the page
                color={colors[2]}
                distort={false}
                wireframe={true}
                floatIntensity={0}
                emissive={true}
                emissiveIntensity={0.8} // Brighter
              />
            )}
          </group>
        )}
        
        {/* Extra floating objects - positioned to work with card layout */}
        {extraModelProps.map((props, i) => (
          <FloatingModel
            key={i}
            shape={props.shape as any}
            color={i % 4 === activeStep ? currentColor : '#666'} // Lighter color
            position={props.position}
            scale={props.scale}
            floatIntensity={props.floatIntensity}
            scrollY={smoothScrollY}
            speed={props.speed}
            parallaxFactor={props.parallaxFactor}
            emissive={props.emissive}
            emissiveIntensity={i % 4 === activeStep ? 0.8 : props.emissiveIntensity}
            wireframe={props.wireframe}
          />
        ))}
      </Canvas>
    </div>
  );
} 