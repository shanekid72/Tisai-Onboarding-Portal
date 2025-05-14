import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const HeroScene = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Create enhanced floating particles
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const particleCount = 500; // Increased particle count
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Create more interesting spatial distribution
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position particles in a spherical formation with randomness
      const radius = 10 * (0.3 + Math.random() * 0.7); // Varying radius
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Gradient colors from accent to secondary
      const colorFactor = Math.random();
      colors[i3] = 0.5 + (colorFactor * 0.5); // Red
      colors[i3 + 1] = 0.2 + (colorFactor * 0.3); // Green
      colors[i3 + 2] = 0.5 + (colorFactor * 0.5); // Blue
      
      // Random sizes for depth effect
      sizes[i] = Math.random() * 0.15 + 0.05;
    }
    
    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Custom shader material for more control
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        size: { value: 2.0 },
        time: { value: 0 },
        mousePosition: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform vec2 mousePosition;
        
        void main() {
          vColor = color;
          
          // Add subtle movement
          vec3 pos = position;
          float displacementFactor = sin(time * 0.3 + position.x * 0.05) * 0.1 + 
                                    cos(time * 0.2 + position.y * 0.04) * 0.1;
          
          // Mouse influence
          float dist = distance(vec2(position.x, position.y), mousePosition);
          float influence = smoothstep(5.0, 0.0, dist) * 0.5;
          
          // Apply displacement
          pos.x += displacementFactor;
          pos.y += displacementFactor;
          
          // Add mouse influence
          vec2 direction = normalize(vec2(position.x, position.y) - mousePosition);
          pos.x += direction.x * influence;
          pos.y += direction.y * influence;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (30.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Create a soft circular particle
          float dist = length(gl_PointCoord - vec2(0.5, 0.5)) * 2.0;
          float alpha = smoothstep(1.0, 0.0, dist);
          
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    particlesRef.current.material = particleMaterial;
    
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

  // Enhanced animation loop
  useFrame((state, delta) => {
    // Sphere animations
    if (sphereRef.current) {
      // Adjust distortion based on mouse position for interactive feel
      const material = sphereRef.current.material as THREE.Material & { distort: number, speed: number };
      
      // Rotation based on time
      sphereRef.current.rotation.y += 0.05 * delta;
      
      // Enhanced floating motion with multiple sine waves
      sphereRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2 + 
                                    Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Subtle X-axis movement
      sphereRef.current.position.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
      
      // Dynamic distortion based on audio or interactivity could be added here
      if (material.distort !== undefined) {
        material.distort = 0.4 + Math.sin(state.clock.elapsedTime) * 0.1;
      }
      
      // Mouse interaction
      sphereRef.current.rotation.x += (mouseRef.current.y * 0.05 - sphereRef.current.rotation.x) * 0.1;
      sphereRef.current.rotation.z += (mouseRef.current.x * 0.05 - sphereRef.current.rotation.z) * 0.1;
    }
    
    // Particles animation
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01 * delta;
      
      // Update shader uniforms
      const material = particlesRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.time.value = state.clock.elapsedTime;
        material.uniforms.mousePosition.value = new THREE.Vector2(mouseRef.current.x * 5, mouseRef.current.y * 5);
      }
    }
  });

  return (
    <>
      {/* Main sphere with enhanced distortion effect */}
      <Sphere ref={sphereRef} args={[1.5, 128, 128]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#FF5733"
          attach="material"
          distort={0.4}
          speed={3}
          roughness={0.4}
          metalness={0.8}
          emissive="#FF5733"
          emissiveIntensity={0.1}
        />
      </Sphere>
      
      {/* Enhanced background particles */}
      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial
          size={0.05}
          color="#3498DB"
          sizeAttenuation
          transparent
          opacity={0.8}
          vertexColors
        />
      </points>
      
      {/* Improved lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#FF5733" />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#3498DB" />
      <pointLight position={[0, 0, 3]} intensity={1} color="#FFFFFF" distance={10} />
    </>
  );
};

export default HeroScene; 