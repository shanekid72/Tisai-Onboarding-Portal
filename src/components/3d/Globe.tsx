import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface GlobeProps {
  autoRotate?: boolean;
  fallbackMode?: boolean;
}

// Simplified static component for when WebGL is disabled
const StaticGlobeComponent = () => {
  return (
    <div className="h-full w-full bg-gradient-to-b from-[#0A1929] to-[#111] rounded-lg flex flex-col items-center justify-center p-6">
      <div className="w-32 h-32 rounded-full bg-[#193C5B] border-2 border-[#FF5733]/20 mb-3 relative overflow-hidden shadow-md">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(0deg, transparent 48%, rgba(255,255,255,.03) 49%, rgba(255,255,255,.03) 51%, transparent 52%), linear-gradient(90deg, transparent 48%, rgba(255,255,255,.03) 49%, rgba(255,255,255,.03) 51%, transparent 52%)`,
          backgroundSize: '20px 20px'
        }} />
        <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-[#FF5733]/70 shadow-sm shadow-[#FF5733]/30"></div>
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 rounded-full bg-[#FF5733]/70 shadow-sm shadow-[#FF5733]/30"></div>
      </div>
      <div className="text-secondary text-md font-medium">API Connectivity</div>
      <div className="text-white/40 text-xs text-center mt-1">Static fallback view</div>
    </div>
  );
};

// Fallback component for when textures fail to load or WebGL issues occur
const ExtremelySimpleFallbackGlobe = () => {
  return (
    <mesh>
      <sphereGeometry args={[2, 8, 8]} /> {/* Significantly reduced segments */}
      <meshBasicMaterial color="#224466" wireframe={false} />
    </mesh>
  );
};

// WebGL context recovery handler
const ContextRecovery = ({ children }: { children: React.ReactNode }) => {
  const { gl, scene, camera } = useThree();
  const [contextLost, setContextLost] = useState(false);
  const maxRecoveryAttempts = 2; // Reduced attempts
  const recoveryAttempts = useRef(0);
  const recoveryTimeoutRef = useRef<number | null>(null); // Changed to number for browser setTimeout
  const restoreTimeoutRef = useRef<number | null>(null); // Changed to number for browser setTimeout
  
  useEffect(() => {
    if (!gl || !gl.domElement) return;
    const canvas = gl.domElement;
    
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
      console.warn('WebGL context lost. Attempting recovery...');
      if (recoveryTimeoutRef.current) clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = window.setTimeout(() => { // Explicitly use window.setTimeout
        try {
          if (recoveryAttempts.current < maxRecoveryAttempts) {
            recoveryAttempts.current++;
            console.log(`Recovery attempt ${recoveryAttempts.current}/${maxRecoveryAttempts}`);
            const loseContext = gl.extensions.get('WEBGL_lose_context');
            if (loseContext?.restoreContext) {
              loseContext.restoreContext();
            } else {
              console.warn('WEBGL_lose_context.restoreContext() not available.');
              // If direct restoration isn't possible, we might need to re-initialize or fallback
              window.dispatchEvent(new CustomEvent('webgl-recovery-failed'));
            }
          } else {
            console.error('Max recovery attempts reached. Forcing fallback.');
            window.dispatchEvent(new CustomEvent('webgl-recovery-failed'));
          }
        } catch (err) {
          console.error('Error during WebGL recovery attempt:', err);
          window.dispatchEvent(new CustomEvent('webgl-recovery-failed'));
        }
      }, 1500); // Increased delay for recovery
    };
    
    const handleContextRestored = () => {
      console.log('WebGL context successfully restored.');
      setContextLost(false);
      recoveryAttempts.current = 0; // Reset attempts on successful restoration
      if (restoreTimeoutRef.current) clearTimeout(restoreTimeoutRef.current);
      restoreTimeoutRef.current = window.setTimeout(() => { // Explicitly use window.setTimeout
        try {
          if (gl.render && scene && camera) {
             gl.render(scene, camera); // Re-render the scene
          }
        } catch (e) {
          console.error('Error during render after context restoration:', e);
          window.dispatchEvent(new CustomEvent('webgl-recovery-failed'));
        }
      }, 200); // Increased delay
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    
    try {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // Further reduced pixel ratio
      const context = gl.getContext() as WebGLRenderingContext | WebGL2RenderingContext; // Cast to WebGL context
      if (context) {
        context.getExtension('WEBGL_lose_context');
      }
    } catch (e) {
      console.error('Error setting up WebGL context in ContextRecovery:', e);
    }
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      if (recoveryTimeoutRef.current) clearTimeout(recoveryTimeoutRef.current);
      if (restoreTimeoutRef.current) clearTimeout(restoreTimeoutRef.current);
    };
  }, [gl, scene, camera]);
  
  if (contextLost) {
    return <ExtremelySimpleFallbackGlobe />; // Show the simplest fallback during loss
  }
  return <>{children}</>;
};

const SpinningGlobe = ({ autoRotate = true }: GlobeProps) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  
  useEffect(() => {
    // Using a very simple material that doesn't require external textures for this test
    setTexturesLoaded(true);
  }, []);
  
  useFrame(({ clock }) => {
    if (globeRef.current && autoRotate) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.02; // Slower rotation
    }
  });
  
  if (!texturesLoaded) {
    return <ExtremelySimpleFallbackGlobe />; // Should not hit this if useEffect runs correctly
  }
  
  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[2, 12, 12]} /> {/* Even fewer segments */}
      <meshBasicMaterial color="#336699" wireframe={false} />
      {/* Removed markers and complex materials */}
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />
    </mesh>
  );
};

const Globe = ({ autoRotate = true, fallbackMode = false }: GlobeProps) => {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [webGLFailed, setWebGLFailed] = useState(false);
  
  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (context && typeof (context as WebGLRenderingContext).getExtension === 'function') {
        const loseContextExt = (context as WebGLRenderingContext).getExtension('WEBGL_lose_context');
        if (!loseContextExt) {
          console.warn('WEBGL_lose_context extension not available. WebGL might be less stable.');
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };
  
  useEffect(() => {
    setMounted(true);
    if (!checkWebGLSupport()) {
      console.warn('WebGL not supported or stable, forcing static fallback.');
      setWebGLFailed(true);
      return;
    }
    
    const handleError = (event: Event | ErrorEvent) => {
      let message = '';
      if ('message' in event) message = event.message as string;
      else if (event.type) message = event.type;
      
      if (message.includes('WebGL') || message.includes('THREE') || message.includes('ContextLost') || message.includes('GL_')) {
        console.warn('Globe.tsx: WebGL-related error detected:', message);
        if (!hasError) setHasError(true); // Prevent multiple dispatches if already in error state
        event.preventDefault();
      }
    };
    
    const handleRecoveryFailed = () => {
      console.warn('Globe.tsx: WebGL recovery failed event received, switching to static component.');
      if (!webGLFailed) setWebGLFailed(true);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('webglcontextlost', handleError); // Listen to context lost directly too
    window.addEventListener('webgl-recovery-failed', handleRecoveryFailed);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('webglcontextlost', handleError);
      window.removeEventListener('webgl-recovery-failed', handleRecoveryFailed);
    };
  }, [hasError, webGLFailed]); // Add dependencies to avoid stale closures
  
  if (!mounted || fallbackMode || webGLFailed || hasError) {
    if (!mounted) console.log('Globe: Not mounted yet, showing static.');
    if (fallbackMode) console.log('Globe: fallbackMode=true, showing static.');
    if (webGLFailed) console.log('Globe: webGLFailed=true, showing static.');
    if (hasError) console.log('Globe: hasError=true, showing static.');
    return <StaticGlobeComponent />;
  }
  
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <Suspense fallback={<StaticGlobeComponent />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }} // Slightly closer camera
          gl={{
            powerPreference: 'low-power', // Explicitly request low-power
            antialias: false,
            stencil: false,
            depth: true, // Keep depth for basic 3D
            alpha: true,
            failIfMajorPerformanceCaveat: true, // Important for stability
            preserveDrawingBuffer: false,
          }}
          dpr={0.75} // Force lower DPR
          frameloop="demand" // Only render when needed
          performance={{ min: 0.1, max: 0.5 }} // Stricter performance limits
          onCreated={({ gl: renderer }) => {
             // Add an event listener for context restore directly on the renderer
            renderer.domElement.addEventListener('webglcontextrestored', () => {
                console.log('Canvas onCreated: WebGL Context Restored via direct listener.');
                // Potentially trigger a re-render or state update if needed here
                // This is mostly for logging now, ContextRecovery handles actual restoration
            });
            renderer.domElement.addEventListener('webglcontextlost', (event) => {
                console.log('Canvas onCreated: WebGL Context Lost via direct listener.');
                event.preventDefault(); // Allow recovery
                 // This is mostly for logging now, ContextRecovery handles actual loss detection
            });
          }}
        >
          <ContextRecovery>
            <SpinningGlobe autoRotate={autoRotate} />
            {/* OrbitControls can also be demanding, consider removing if issues persist */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={false} // Disable rotation if autoRotate is on
              autoRotate={false}
              enableDamping={false}
            />
          </ContextRecovery>
        </Canvas>
      </Suspense>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black/90 opacity-90 pointer-events-none" />
    </div>
  );
};

export default Globe; 