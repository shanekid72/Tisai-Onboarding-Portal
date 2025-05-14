import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshWobbleMaterial, Torus } from '@react-three/drei';
import * as THREE from 'three';

const FeaturesScene = () => {
  const torusRef = useRef<THREE.Mesh>(null);
  const spheresRef = useRef<THREE.Group>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Create floating elements
  useEffect(() => {
    if (!spheresRef.current) return;
    
    // Track mouse movement for interactive effects
    const onMouseMove = (event: MouseEvent) => {
      // Convert screen coordinates to normalized device coordinates
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Animation loop
  useFrame((state, delta) => {
    // Torus animation
    if (torusRef.current) {
      torusRef.current.rotation.x += 0.01 * delta;
      torusRef.current.rotation.y += 0.02 * delta;
      
      // Mouse interaction
      torusRef.current.rotation.z += (mouseRef.current.x * 0.2 - torusRef.current.rotation.z) * 0.05;
      torusRef.current.position.y += (mouseRef.current.y * 1 - torusRef.current.position.y) * 0.05;
    }
    
    // Group of spheres animation
    if (spheresRef.current) {
      spheresRef.current.rotation.y += 0.1 * delta;
      
      // Each child sphere has its own animation
      spheresRef.current.children.forEach((child, i) => {
        const t = state.clock.elapsedTime;
        
        // Radius depends on index
        const radius = 2.5 + i * 0.5;
        
        // Phase depends on index
        const phase = i * Math.PI * 0.5;
        
        // Position on circle with some oscillation
        child.position.x = radius * Math.sin(t * 0.3 + phase);
        child.position.z = radius * Math.cos(t * 0.3 + phase);
        child.position.y = Math.sin(t * 0.5 + phase) * 0.5;
        
        // Subtle scale pulsing
        const scale = 0.6 + Math.sin(t * 0.7 + phase) * 0.1;
        child.scale.set(scale, scale, scale);
      });
    }
  });

  return (
    <>
      {/* Central torus */}
      <Torus 
        ref={torusRef} 
        args={[3, 0.6, 16, 50]} 
        position={[0, 0, 0]}
      >
        <MeshWobbleMaterial
          color="#3498DB"
          factor={0.4}
          speed={2}
          roughness={0.4}
          metalness={0.8}
          emissive="#3498DB"
          emissiveIntensity={0.2}
        />
      </Torus>
      
      {/* Group of orbiting spheres */}
      <group ref={spheresRef}>
        {[...Array(5)].map((_, i) => (
          <Sphere key={i} args={[0.4, 32, 32]} position={[2.5 + i * 0.5, 0, 0]}>
            <MeshWobbleMaterial
              color={i % 2 === 0 ? "#FF5733" : "#3498DB"}
              factor={0.2}
              speed={1}
              roughness={0.5}
              metalness={0.7}
              emissive={i % 2 === 0 ? "#FF5733" : "#3498DB"}
              emissiveIntensity={0.1}
            />
          </Sphere>
        ))}
      </group>
      
      {/* Enhanced lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 5]} intensity={0.8} color="#FFFFFF" />
      <pointLight position={[5, -2, -5]} intensity={0.5} color="#3498DB" />
      <pointLight position={[-5, 2, 5]} intensity={0.5} color="#FF5733" />
    </>
  );
};

export default FeaturesScene; 