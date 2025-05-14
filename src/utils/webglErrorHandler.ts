/**
 * Global WebGL Error Handler
 * 
 * This utility helps handle WebGL context loss events and provides a centralized
 * way to track WebGL errors across the application.
 */

// Track context loss events for the whole app
let globalContextLossCount = 0;
let componentsWithIssues: Record<string, number> = {};

// Flag to control whether WebGL is enabled
let webglEnabled = true; // Set to true by default to enable 3D features

// Flag to control whether advanced animations are enabled
let advancedAnimationsEnabled = true; // Set to true by default

// Check if WebGL is disabled in localStorage
try {
  if (localStorage.getItem('webgl-disabled') === 'true') {
    webglEnabled = false;
  }
  
  if (localStorage.getItem('animations-reduced') === 'true') {
    advancedAnimationsEnabled = false;
  }
} catch (e) {
  console.error('Failed to read WebGL state from localStorage:', e);
}

/**
 * Initialize the WebGL error handler
 * Should be called once at app startup
 */
export const initWebGLErrorHandler = () => {
  console.log('Initializing WebGL error handler');
  
  // Test WebGL support without causing errors
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      console.warn('WebGL not fully supported by browser - some 3D features may not work');
      reduceAnimationComplexity();
    } else {
      webglEnabled = true;
      console.log('WebGL is supported and enabled');
      
      // Check for hardware acceleration 
      try {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          console.log('WebGL renderer:', renderer);
          
          // If software renderer, reduce animation complexity
          if (renderer.toLowerCase().includes('swiftshader') || 
              renderer.toLowerCase().includes('llvmpipe') ||
              renderer.toLowerCase().includes('software')) {
            console.warn('WebGL is using software rendering - reducing animation complexity');
            reduceAnimationComplexity();
          }
        }
      } catch (rendererError) {
        console.warn('Could not detect WebGL renderer details:', rendererError);
      }
    }
  } catch (error) {
    console.warn('Error during WebGL support check:', error);
    reduceAnimationComplexity();
  }
  
  // Listen for WebGL context loss events from any component
  window.addEventListener('webgl-reliability-issues', ((event: CustomEvent) => {
    globalContextLossCount++;
    console.warn(`Global WebGL issue detected (${globalContextLossCount}/3)`);
    
    // Track component-specific issues
    if (event.detail?.component) {
      const component = event.detail.component;
      componentsWithIssues[component] = (componentsWithIssues[component] || 0) + 1;
      console.warn(`Component ${component} has ${componentsWithIssues[component]} WebGL issues`);
    }
    
    // If we've had too many issues, disable WebGL entirely
    if (globalContextLossCount >= 3) {
      disableWebGL();
    } else if (globalContextLossCount >= 1) {
      // Even on first issue, reduce animation complexity
      reduceAnimationComplexity();
    }
  }) as EventListener);
  
  // Add performance observer to detect jank
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Check for long tasks (over 100ms)
          if (entry.duration > 100) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms - reducing animation complexity`);
            reduceAnimationComplexity();
            observer.disconnect();
            break;
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('PerformanceObserver not supported:', e);
    }
  }
};

/**
 * Disable WebGL features across the app
 */
function disableWebGL() {
  webglEnabled = false;
  reduceAnimationComplexity();
  
  // Store this in localStorage to persist across sessions
  try {
    localStorage.setItem('webgl-disabled', 'true');
  } catch (e) {
    console.error('Failed to store WebGL disabled state:', e);
  }
  
  // Dispatch an event that the app can listen for
  window.dispatchEvent(new CustomEvent('disable-all-webgl'));
  
  console.warn('All WebGL features have been disabled');
}

/**
 * Reduce animation complexity to help with performance
 */
function reduceAnimationComplexity() {
  advancedAnimationsEnabled = false;
  
  // Store this in localStorage to persist across sessions
  try {
    localStorage.setItem('animations-reduced', 'true');
  } catch (e) {
    console.error('Failed to store animation state:', e);
  }
  
  // Dispatch an event that the app can listen for
  window.dispatchEvent(new CustomEvent('reduce-animation-complexity'));
  
  console.warn('Animation complexity has been reduced');
}

/**
 * Check if a specific component should use WebGL
 * Components should call this before attempting to render WebGL content
 */
export const shouldUseWebGL = (componentName?: string): boolean => {
  // Check if the specific component has had too many issues
  if (componentName && componentsWithIssues[componentName] >= 2) {
    console.warn(`WebGL disabled for ${componentName} due to repeated issues`);
    return false;
  }
  
  return webglEnabled;
};

/**
 * Check if advanced animations should be used
 */
export const shouldUseAdvancedAnimations = (): boolean => {
  return advancedAnimationsEnabled;
};

/**
 * Report a WebGL issue from a component
 */
export const reportWebGLIssue = (componentName: string) => {
  window.dispatchEvent(new CustomEvent('webgl-reliability-issues', {
    detail: { component: componentName }
  }));
};

/**
 * Reset the WebGL disabled state (for development/testing)
 */
export const resetWebGLState = () => {
  globalContextLossCount = 0;
  componentsWithIssues = {};
  webglEnabled = true;
  advancedAnimationsEnabled = true;
  
  try {
    localStorage.removeItem('webgl-disabled');
    localStorage.removeItem('animations-reduced');
  } catch (e) {
    console.error('Failed to reset WebGL state:', e);
  }
  
  console.log('WebGL and animation state has been reset');
};

export default {
  initWebGLErrorHandler,
  shouldUseWebGL,
  shouldUseAdvancedAnimations,
  reportWebGLIssue,
  resetWebGLState
}; 