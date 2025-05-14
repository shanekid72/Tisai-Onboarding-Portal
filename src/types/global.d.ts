// Global type declarations for the application

// Add animation-related types to HTMLElement 
interface HTMLElement {
  // Properties that can be animated by GSAP
  _gsap?: {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    opacity: number;
    [key: string]: any;
  };
}

// Add safe typing for GSAP data attributes
interface HTMLElement {
  getAttribute(qualifiedName: string): string | null;
  setAttribute(qualifiedName: string, value: string): void;
  dataset: {
    speed?: string;
    delay?: string;
    ease?: string;
    [key: string]: string | undefined;
  };
}

// Additional environment variable typing
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_3D: string;
  readonly VITE_DEBUG_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Custom events
interface WindowEventMap {
  'disable-all-webgl': CustomEvent;
  'reduce-animation-complexity': CustomEvent;
  'webgl-reliability-issues': CustomEvent<{component?: string}>;
} 