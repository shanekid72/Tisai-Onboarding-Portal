// Type definitions for Three.js integration with React Three Fiber
import * as THREE from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    sphereGeometry: React.DetailedHTMLFactory<JSX.IntrinsicElements['sphereGeometry'], THREE.SphereGeometry>;
    ringGeometry: React.DetailedHTMLFactory<JSX.IntrinsicElements['ringGeometry'], THREE.RingGeometry>;
    meshStandardMaterial: React.DetailedHTMLFactory<JSX.IntrinsicElements['meshStandardMaterial'], THREE.MeshStandardMaterial>;
    meshBasicMaterial: React.DetailedHTMLFactory<JSX.IntrinsicElements['meshBasicMaterial'], THREE.MeshBasicMaterial>;
    orbitControls: any;
  }
}

// Extend THREE.WebGLRenderer to include the custom methods used in our app
declare module 'three' {
  interface WebGLRenderer {
    extensions: {
      get(extensionName: string): any;
    };
    getContext(): WebGLRenderingContext | WebGL2RenderingContext;
  }
}

// For extensions registration
interface WebGLExtension {
  restoreContext(): void;
}

// Empty export to make this a module
export {}; 