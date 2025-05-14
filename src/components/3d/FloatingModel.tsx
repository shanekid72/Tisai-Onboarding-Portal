import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float, MeshDistortMaterial, useCursor } from '@react-three/drei';
import * as THREE from 'three';

interface SimpleGeometryProps {
  shape?: 'box' | 'sphere' | 'torus' | 'cone' | 'octahedron' | 'torusKnot' | 'capsule';
  color?: string;
  distort?: boolean;
  wireframe?: boolean;
  emissive?: boolean;
  emissiveIntensity?: number;
}

// Use a simple shape if no model is provided
function SimpleGeometry({ 
  shape = 'sphere', 
  color = '#5733FF', 
  distort = true, 
  wireframe = false,
  emissive = false,
  emissiveIntensity = 0.5
}: SimpleGeometryProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  
  // Performance optimization for color - create color once
  const colorObj = useMemo(() => new THREE.Color(color), [color]);
  
  // Track rotation speed for performance throttling
  const rotationSpeed = useRef({
    x: 0,
    y: 0,
    z: 0
  });
  
  // Also track animation frame to skip frames
  const frameCount = useRef(0);
  
  // Initialize rotation speeds once - better for performance
  useEffect(() => {
    // Different rotation speeds based on shape - simplified for better stability
    switch (shape) {
      case 'box':
        rotationSpeed.current = { x: 0.08, y: 0.05, z: 0 };
        break;
      case 'sphere':
        rotationSpeed.current = { x: 0, y: 0.07, z: 0.03 };
        break;
      case 'torus':
        rotationSpeed.current = { x: -0.05, y: 0, z: 0.04 };
        break;
      case 'cone':
        rotationSpeed.current = { x: 0, y: 0.06, z: -0.02 };
        break;
      case 'octahedron':
        rotationSpeed.current = { x: 0.05, y: -0.06, z: 0 };
        break;
      case 'torusKnot':
        rotationSpeed.current = { x: 0.03, y: 0.04, z: 0 };
        break;
      case 'capsule':
        rotationSpeed.current = { x: 0, y: 0, z: 0.05 };
        break;
      default:
        rotationSpeed.current = { x: 0, y: 0.06, z: 0 };
    }
  }, [shape]);
  
  // Cursor indicator for hover state
  useCursor(hovered);
  
  // Animate based on state - optimized with frame skipping
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Skip frames for less CPU usage
      frameCount.current = (frameCount.current + 1) % 3; // Skip 2 out of 3 frames
      
      // Apply rotation every frame - simple and efficient
      meshRef.current.rotation.x += delta * rotationSpeed.current.x;
      meshRef.current.rotation.y += delta * rotationSpeed.current.y;
      meshRef.current.rotation.z += delta * rotationSpeed.current.z;
      
      // Less frequent updates for visual effects
      if (frameCount.current === 0) {
        // Subtle pulse effect - simplified
        const time = state.clock.getElapsedTime();
        const pulseScale = 1 + Math.sin(time * 0.5) * 0.02; // Slower, more subtle pulse
        
        // Scale when hovered or active
        const baseScale = hovered ? 1.08 : active ? 1.15 : 1; // Reduced scale change
        const targetScale = baseScale * pulseScale;
        
        // Smoother lerp with reduced intensity
        meshRef.current.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale), 
          0.03 // Slower lerp for smoother changes
        );
        
        // Update material properties - less frequently
        if (emissive && meshRef.current.material) {
          const material = meshRef.current.material as THREE.MeshStandardMaterial;
          if (material.emissiveIntensity !== undefined) {
            material.emissiveIntensity = THREE.MathUtils.lerp(
              material.emissiveIntensity, 
              hovered ? 0.6 : emissiveIntensity, // Reduced intensity change
              0.03 // Slower lerp
            );
          }
        }
      }
    }
  });
  
  // Create the appropriate geometry based on shape - memoized with reduced segments
  const geometry = useMemo(() => {
    switch (shape) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[1, 16, 16]} />; // Further reduced segments
      case 'torus':
        return <torusGeometry args={[1, 0.4, 8, 16]} />; // Further reduced segments
      case 'cone':
        return <coneGeometry args={[1, 2, 16]} />; // Further reduced segments
      case 'octahedron':
        return <octahedronGeometry args={[1, 0]} />;
      case 'torusKnot':
        return <torusKnotGeometry args={[0.8, 0.35, 32, 8]} />; // Further reduced segments
      case 'capsule':
        return <capsuleGeometry args={[0.5, 1, 8, 16]} />; // Further reduced segments
      default:
        return <sphereGeometry args={[1, 16, 16]} />; // Further reduced segments
    }
  }, [shape]);
  
  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setActive(!active)}
    >
      {geometry}
      {distort ? (
        <MeshDistortMaterial
          color={colorObj}
          speed={0.6} // Reduced from 1
          distort={0.15} // Reduced from 0.2
          roughness={0.4}
          metalness={0.2}
          wireframe={wireframe}
          emissive={emissive ? colorObj : undefined}
          emissiveIntensity={emissiveIntensity}
        />
      ) : (
        <meshPhysicalMaterial
          color={colorObj}
          roughness={0.4}
          metalness={0.2}
          clearcoat={0.3} // Reduced from 0.5
          clearcoatRoughness={0.2}
          wireframe={wireframe}
          emissive={emissive ? colorObj : undefined}
          emissiveIntensity={emissiveIntensity}
        />
      )}
    </mesh>
  );
}

interface FloatingModelProps {
  modelPath?: string;
  shape?: 'box' | 'sphere' | 'torus' | 'cone' | 'octahedron' | 'torusKnot' | 'capsule';
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  floatIntensity?: number;
  distort?: boolean;
  speed?: number;
  scrollY?: number;
  parallaxFactor?: number;
  wireframe?: boolean;
  emissive?: boolean;
  emissiveIntensity?: number;
  rotationAxis?: 'x' | 'y' | 'z' | 'all';
}

// Main component for floating 3D models
export default function FloatingModel({
  modelPath,
  shape = 'sphere',
  color = '#5733FF',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  floatIntensity = 1,
  distort = true,
  speed = 1,
  scrollY = 0,
  parallaxFactor = 0.1,
  wireframe = false,
  emissive = false,
  emissiveIntensity = 0.5,
  rotationAxis = 'all'
}: FloatingModelProps) {
  // Track component mount state
  const [mounted, setMounted] = useState(false);
  
  // Memoize position and rotation for better performance
  const initialPosition = useMemo(() => new THREE.Vector3(...position), [position[0], position[1], position[2]]);
  const initialRotation = useMemo(() => new THREE.Euler(...rotation), [rotation[0], rotation[1], rotation[2]]);
  
  // Load model if provided
  const { scene } = modelPath ? useGLTF(modelPath) : { scene: null };
  
  // Apply parallax effect based on scroll
  const groupRef = useRef<THREE.Group>(null);
  
  // Track last scroll position to avoid unnecessary updates
  const lastScrollY = useRef(scrollY);
  const frameSkip = useRef(0);
  const targetY = useRef(initialPosition.y);
  
  // Calculate target position once per frame in a useEffect for stability
  useEffect(() => {
    // Only update when scroll changes by a meaningful amount
    if (Math.abs(lastScrollY.current - scrollY) > 10) {
      lastScrollY.current = scrollY;
      targetY.current = initialPosition.y + scrollY * -parallaxFactor * floatIntensity * 0.5; // Reduced factor by half
    }
  }, [scrollY, parallaxFactor, floatIntensity, initialPosition.y]);
  
  // Use useFrame for responsive parallax - with throttling
  useFrame(() => {
    if (groupRef.current && mounted) {
      // Skip frames for better performance
      frameSkip.current = (frameSkip.current + 1) % 3; // Skip 2 out of 3 frames
      if (frameSkip.current !== 0) return;
      
      // Apply parallax effect based on scroll position
      // Very smooth transition to target position with strong damping
      if (groupRef.current.position.y !== targetY.current) {
        groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          targetY.current,
          0.01 // Very slow lerp for maximum stability
        );
      }
      
      // Add subtle rotation based on scroll - minimal updates
      if (rotationAxis === 'x' || rotationAxis === 'all') {
        groupRef.current.rotation.x = initialRotation.x + lastScrollY.current * 0.0001; // Reduced factor by 5x
      }
      if (rotationAxis === 'y' || rotationAxis === 'all') {
        groupRef.current.rotation.y = initialRotation.y + lastScrollY.current * 0.0002; // Reduced factor by 4x
      }
      if (rotationAxis === 'z' || rotationAxis === 'all') {
        groupRef.current.rotation.z = initialRotation.z + lastScrollY.current * 0.00008; // Reduced factor by 4x
      }
    }
  });
  
  // Set mounted state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Set initial position explicitly
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(initialPosition);
    }
  }, [initialPosition]);
  
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <Float 
        floatIntensity={floatIntensity * 0.7} // Reduced intensity by 30%
        speed={speed * 0.6} // Reduced speed by 40%
        rotationIntensity={0.2} // Reduced from 0.3
        floatingRange={[-0.05, 0.05]} // Reduced range by 50%
      >
        {scene ? (
          <primitive 
            object={scene} 
            scale={scale} 
          />
        ) : (
          <SimpleGeometry 
            shape={shape} 
            color={color} 
            distort={distort} 
            wireframe={wireframe}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
          />
        )}
      </Float>
    </group>
  );
} 