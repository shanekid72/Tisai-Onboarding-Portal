import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Observer } from 'gsap/Observer';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// Register all GSAP plugins
gsap.registerPlugin(
  ScrollTrigger,
  ScrollSmoother,
  Flip,
  SplitText,
  MotionPathPlugin,
  Observer,
  ScrambleTextPlugin
);

// Set defaults for better performance and consistency
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
});

// Queue for delaying initialization of scroll-based effects
const scrollEffectsQueue: (() => void)[] = [];

// Safe initialization function to create scroll smoother
export const initScrollSmoother = (wrapper: Element, content: Element, options = {}) => {
  try {
    // Check if wrapper and content exist and are valid
    if (!wrapper || !content) {
      console.error("ScrollSmoother initialization failed: wrapper or content element is missing");
      return null;
    }
    
    // Ensure the wrapper and content have correct styling attributes for visibility
    if (wrapper instanceof HTMLElement) {
      wrapper.style.visibility = 'visible';
      wrapper.style.zIndex = '1';
    }
    
    if (content instanceof HTMLElement) {
      content.style.visibility = 'visible';
      content.style.opacity = '1';
    }
    
    // First, make sure no other ScrollSmoother exists on this element
    try {
      // Try to find existing ScrollSmoother and kill it
      const existingSmoothers = ScrollTrigger.getAll()
        .filter(t => t.vars.scroller === content);
      
      if (existingSmoothers.length > 0) {
        console.warn(`Found ${existingSmoothers.length} existing ScrollTrigger instances on this scroller. Killing them first.`);
        existingSmoothers.forEach(t => t.kill());
      }
    } catch (e) {
      console.warn("Error while checking for existing ScrollTrigger instances:", e);
    }
    
    // Default options
    const defaultOptions = {
      wrapper: wrapper,          // The outer wrapper element
      content: content,          // The element that should scroll
      smooth: 1.5,               // Adjust smoothness (higher = slower)
      effects: true,             // Enables data-speed attributes for parallax
      normalizeScroll: true,     // Normalizes scroll behavior across devices  
      ignoreMobileResize: true,  // Prevents jittery behavior on mobile resize
      preventDefault: false,     // If you want to prevent default scrolling behavior
      scrollProxy: false         // If using with ScrollTrigger
    };
    
    // Merge with user options (user options override defaults)
    const smootherOptions = { ...defaultOptions, ...options };
    
    // Create ScrollSmoother instance with explicit error handling
    let smootherInstance = null;
    try {
      // Create and return the ScrollSmoother instance
      smootherInstance = ScrollSmoother.create(smootherOptions);
      
      if (!smootherInstance) {
        throw new Error("ScrollSmoother.create returned null or undefined");
      }
      
      // Log success
      console.log("ScrollSmoother created successfully");
      
      // Ensure proper setup
      smootherInstance.scrollTop(0);
      
      // Ensure content is visible after initialization
      if (content instanceof HTMLElement) {
        content.style.visibility = 'visible';
        content.style.opacity = '1';
      }
      
      // Make sure ScrollTrigger instances use our content as scroller by default
      ScrollTrigger.defaults({ scroller: content });
      
      // Refresh ScrollTrigger to make sure all instances are aware of the new scroller
      setTimeout(() => {
        ScrollTrigger.refresh(true);
      }, 200);
      
      return smootherInstance;
    } catch (createError) {
      console.error("Error during ScrollSmoother.create:", createError);
      
      // Fallback: try to recover gracefully
      if (wrapper && content) {
        console.log("Setting up fallback scroll behavior");
        if (wrapper instanceof HTMLElement) {
          wrapper.style.overflow = "auto";
          wrapper.style.position = "relative";
          wrapper.style.height = "auto";
        }
        
        if (content instanceof HTMLElement) {
          content.style.position = "relative";
          content.style.visibility = "visible";
          content.style.opacity = "1";
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error("Error initializing ScrollSmoother:", error);
    return null;
  }
};

// Queue a scroll effect to be processed after smoother is initialized
export const queueScrollEffect = (callback: () => void) => {
  scrollEffectsQueue.push(callback);
};

// Process all queued scroll effects
export const processScrollEffectsQueue = () => {
  console.log(`Processing ${scrollEffectsQueue.length} queued scroll effects`);
  scrollEffectsQueue.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error("Error processing scroll effect:", error);
    }
  });
  // Clear the queue
  scrollEffectsQueue.length = 0;
};

// Utility for creating scroll-triggered animations
export const createScrollAnimation = (
  trigger: string | Element, 
  animation: gsap.core.Timeline | gsap.core.Tween,
  options: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
    toggleActions?: string;
    pin?: boolean | string | Element;
    pinSpacing?: boolean;
    scroller?: string | Element;
  } = {}
) => {
  try {
    return ScrollTrigger.create({
      trigger,
      start: options.start || 'top 80%',
      end: options.end || 'bottom 20%',
      scrub: options.scrub || false,
      markers: options.markers || false,
      toggleActions: options.toggleActions || 'play none none reverse',
      pin: options.pin || false,
      pinSpacing: options.pinSpacing !== undefined ? options.pinSpacing : true,
      animation,
      scroller: options.scroller || undefined
    });
  } catch (error) {
    console.error("Error creating scroll animation:", error);
    return null;
  }
};

// Create a parallax effect
export const createParallaxEffect = (
  element: string | Element, 
  speed: number = 0.5, 
  options: {
    scroller?: string | Element;
    container?: string | Element;
    markers?: boolean;
    direction?: 'vertical' | 'horizontal';
  } = {}
) => {
  try {
    const directionProp = options.direction === 'horizontal' ? 'x' : 'y';
    
    return ScrollTrigger.create({
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      markers: options.markers || false,
      scroller: options.scroller || undefined,
      onUpdate: (self) => {
        if (typeof element === 'string') {
          const target = document.querySelector(element);
          if (target) {
            gsap.set(target, { [directionProp]: self.progress * 100 * speed * -1 });
          }
        } else {
          gsap.set(element, { [directionProp]: self.progress * 100 * speed * -1 });
        }
      }
    });
  } catch (error) {
    console.error("Error creating parallax effect:", error);
    return null;
  }
};

// HelloCopilot-inspired scroll reveal animation
export const createScrollReveal = (
  elements: string | Element | Element[], 
  options: {
    start?: string;
    markers?: boolean;
    scroller?: string | Element;
    once?: boolean;
    delay?: number;
    duration?: number;
    stagger?: number;
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
  } = {}
) => {
  try {
    const defaults = {
      start: "top 80%",
      toggleActions: "play none none none",
      once: true,
      delay: 0.2,
      duration: 0.8,
      stagger: 0.1,
      from: { y: 50, opacity: 0 },
      to: { y: 0, opacity: 1, ease: "power2.out" }
    };

    const settings = { ...defaults, ...options };
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: elements,
        start: settings.start,
        toggleActions: settings.toggleActions,
        once: settings.once,
        markers: settings.markers || false,
        scroller: settings.scroller || undefined
      }
    });

    timeline.fromTo(elements, settings.from, {
      ...settings.to,
      delay: settings.delay,
      duration: settings.duration,
      stagger: settings.stagger
    });

    return timeline;
  } catch (error) {
    console.error("Error creating scroll reveal animation:", error);
    return null;
  }
};

// HelloCopilot-style header animation
export const createHeaderAnimation = (container: Element, options = {}) => {
  try {
    const defaults = {
      titleSelector: 'h1',
      subtitleSelector: '.subtitle',
      contentDelay: 0.2,
      staggerLinks: 0.1
    };
    
    const settings = {...defaults, ...options};
    const tl = gsap.timeline();
    
    // Title animation with SplitText
    const titleElement = container.querySelector(settings.titleSelector);
    if (titleElement) {
      const titleAnimation = createSplitTextAnimation(titleElement, {
        type: "chars,words",
        animation: {
          opacity: 0,
          y: 50,
          rotationX: -45,
          stagger: 0.03,
          duration: 1.2,
          ease: "back.out(1.7)"
        }
      });
      
      if (titleAnimation) {
        tl.add(titleAnimation);
      }
    }
    
    // Subtitle fade in
    const subtitleElement = container.querySelector(settings.subtitleSelector);
    if (subtitleElement) {
      tl.fromTo(subtitleElement, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.6"
      );
    }
    
    // Animate navigation links if present
    const navLinks = container.querySelectorAll('a, .btn, button');
    if (navLinks.length) {
      tl.fromTo(navLinks,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: settings.staggerLinks, 
          duration: 0.5,
          ease: "power2.out"
        },
        "-=0.4"
      );
    }
    
    return tl;
  } catch (error) {
    console.warn("Error creating header animation:", error);
    return gsap.timeline(); // Return empty timeline as fallback
  }
};

// Helper function to safely apply SplitText animation
export const createSplitTextAnimation = (element: Element | null, options = {}) => {
  if (!element) return null;
  
  try {
    const defaults = {
      type: "chars,words",
      charsClass: "char",
      animation: {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.02,
        ease: "back.out(1.7)"
      }
    };
    
    const settings = { ...defaults, ...options };
    const splitText = new SplitText(element, { 
      type: settings.type,
      charsClass: settings.charsClass
    });
    
    return gsap.from(splitText.chars, settings.animation);
  } catch (error) {
    console.warn("Error creating SplitText animation:", error);
    // Provide fallback animation
    return gsap.from(element, {
      opacity: 0,
      y: 30,
      duration: 0.8
    });
  }
};

// HelloCopilot-style pinned section animation
export const createPinnedSections = (
  container: Element, 
  sections: Element[], 
  options: {
    scrub?: boolean | number;
    pin?: boolean;
    markers?: boolean;
    anticipatePin?: number;
    start?: string;
    end?: string;
    scroller?: string | Element;
  } = {}
) => {
  try {
    const defaults = {
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      markers: false,
      start: "top top",
      end: `+=${sections.length * 100}vh`
    };
    
    const settings = {...defaults, ...options};
    
    // Main timeline with pin
    const mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: settings.start,
        end: settings.end,
        pin: settings.pin,
        anticipatePin: settings.anticipatePin,
        scrub: settings.scrub,
        markers: settings.markers,
        scroller: settings.scroller || undefined
      }
    });
    
    // Add each section's animations to the timeline
    sections.forEach((section, index) => {
      // Create section timeline
      const sectionTl = gsap.timeline();
      
      // Get section elements
      const heading = section.querySelector('h2, h3');
      const content = section.querySelector('p');
      const image = section.querySelector('img, .image');
      const cta = section.querySelector('a, button, .btn');
      
      // Animate section elements (staggered)
      if (heading) {
        sectionTl.fromTo(heading, 
          { opacity: 0, y: 50 }, 
          { opacity: 1, y: 0, duration: 0.4 },
          0
        );
      }
      
      if (content) {
        sectionTl.fromTo(content,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.4 },
          0.2
        );
      }
      
      if (image) {
        sectionTl.fromTo(image,
          { opacity: 0, scale: 0.8, rotationY: -15 },
          { opacity: 1, scale: 1, rotationY: 0, duration: 0.6 },
          0.1
        );
      }
      
      if (cta) {
        sectionTl.fromTo(cta,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4 },
          0.3
        );
      }
      
      // Add section timeline to main timeline
      // Each section gets an equal portion of the total scrub
      mainTl.add(sectionTl, index);
    });
    
    return mainTl;
  } catch (error) {
    console.error("Error creating pinned sections:", error);
    return null;
  }
};

// Remove all GSAP animations when needed
export const killAllAnimations = (includingSmootherInstance = true) => {
  console.log("Killing all GSAP animations");
  
  // Skip killing animations if we're on the How It Works page and its context exists
  const isHowItWorksPage = window.location.pathname.includes('how-it-works');
  const hasHowItWorksContext = !!window.howItWorksAnimationsContext;
  
  // Kill all ScrollTrigger instances
  const allTriggers = ScrollTrigger.getAll();
  console.log(`Killing ${allTriggers.length} ScrollTrigger instances`);
  
  if (isHowItWorksPage && hasHowItWorksContext) {
    console.log("Preserving How It Works page animations");
    // Don't kill animations if we're on the How It Works page with active context
  } else {
    // Kill all animations
    allTriggers.forEach(trigger => {
      trigger.kill();
    });
    
    // Kill all active GSAP animations
    gsap.killTweensOf("*");
  }
  
  // Kill ScrollSmoother instances if needed
  if (includingSmootherInstance) {
    if (window.scrollSmoother && (!isHowItWorksPage || !hasHowItWorksContext)) {
      console.log("Killing page ScrollSmoother instance");
      window.scrollSmoother.kill();
      window.scrollSmoother = null;
    }
    
    if (window.appScrollSmoother && (!isHowItWorksPage || !hasHowItWorksContext)) {
      console.log("Killing global ScrollSmoother instance");
      window.appScrollSmoother.kill();
      window.appScrollSmoother = null;
    }
  }
  
  // Force ScrollTrigger refresh
  ScrollTrigger.refresh(true);
  
  console.log("All GSAP animations killed");
};

// Handle fatal errors in ScrollTrigger
ScrollTrigger.addEventListener("refreshInit", () => {
  console.log("ScrollTrigger refresh initialized");
});

// Event for when ScrollTrigger encounters issues
ScrollTrigger.addEventListener("refresh", () => {
  console.log("ScrollTrigger refreshed");
});

// TypeScript declaration merging to add scrollSmoother to window
declare global {
  interface Window {
    scrollSmoother?: any;
    appScrollSmoother?: any;
    howItWorksAnimationsContext?: gsap.Context;
  }
}

// Export registered plugins for direct use
export {
  gsap,
  ScrollTrigger,
  ScrollSmoother,
  Flip,
  SplitText,
  MotionPathPlugin,
  Observer,
  ScrambleTextPlugin
}; 