import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Network-like visualization
const HowItWorksScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  // Create network nodes and connections
  const { nodes, connections } = useMemo(() => {
    const nodeCount = 50;
    const nodes = [];
    const connections = [];
    
    // Generate random nodes
    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 5 - 2; // Position slightly behind
      
      nodes.push(new THREE.Vector3(x, y, z));
    }
    
    // Generate connections between nodes (not all nodes will be connected)
    const connectionCount = 80;
    
    for (let i = 0; i < connectionCount; i++) {
      const startIndex = Math.floor(Math.random() * nodeCount);
      let endIndex = Math.floor(Math.random() * nodeCount);
      
      // Avoid self-connections
      while (endIndex === startIndex) {
        endIndex = Math.floor(Math.random() * nodeCount);
      }
      
      connections.push({
        start: nodes[startIndex],
        end: nodes[endIndex],
        speed: Math.random() * 0.02 + 0.005,
        offset: Math.random() * Math.PI * 2,
      });
    }
    
    return { nodes, connections };
  }, []);
  
  // Animation loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Rotate the entire group slowly
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05;
    }
    
    // Pulse the lines
    if (linesRef.current) {
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = (Math.sin(t * 2) * 0.3 + 0.7);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Nodes */}
      {nodes.map((position, i) => (
        <mesh key={`node-${i}`} position={[position.x, position.y, position.z]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} />
        </mesh>
      ))}
      
      {/* Connections */}
      {connections.map((connection, i) => {
        // Create a custom line geometry for each connection
        const points = [connection.start, connection.end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        return (
          <line key={`connection-${i}`}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial
              color={i % 3 === 0 ? "#FF5733" : i % 3 === 1 ? "#3498DB" : "#FFFFFF"}
              transparent
              opacity={0.3}
              linewidth={1}
            />
          </line>
        );
      })}
      
      {/* Backdrop lines */}
      <lineSegments ref={linesRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(10, 10, 0.1)]} />
        <lineBasicMaterial color="#3498DB" transparent opacity={0.2} />
      </lineSegments>
      
      {/* Lighting */}
      <pointLight position={[0, 0, 3]} intensity={0.5} />
    </group>
  );
};

export default HowItWorksScene; 