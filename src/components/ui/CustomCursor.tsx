import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorBorderRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorBorder = cursorBorderRef.current;
    if (!cursor || !cursorBorder) return;
    
    // Set initial position off-screen
    gsap.set(cursor, { x: -100, y: -100 });
    gsap.set(cursorBorder, { x: -100, y: -100 });
    
    // Detect device/user preferences to disable custom cursor appropriately
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isWindows = navigator.platform.indexOf('Win') > -1;
    
    // Disable custom cursor in these scenarios
    if (isTouch || prefersReducedMotion || hasCoarsePointer) {
      setIsVisible(false);
      cursor.style.display = 'none';
      cursorBorder.style.display = 'none';
      return;
    }
    
    // Windows users might prefer standard cursor - add a user preference toggle
    const userPrefersNativeCursor = localStorage.getItem('preferNativeCursor') === 'true';
    if (userPrefersNativeCursor) {
      setIsVisible(false);
      cursor.style.display = 'none';
      cursorBorder.style.display = 'none';
      return;
    }
    
    let mouseX = -100;
    let mouseY = -100;
    let borderX = -100;
    let borderY = -100;
    let animationFrameId: number;
    
    const onMouseMove = (e: MouseEvent) => {
      // Prevent calculation when cursor is hidden
      if (!isVisible) return;
      
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Check if cursor is over a clickable element
      const target = e.target as HTMLElement;
      const targetIsFocusable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'LABEL' ||
        target.hasAttribute('role') ||
        target.getAttribute('tabindex') !== null ||
        target.closest('a') !== null || 
        target.closest('button') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(targetIsFocusable);
    };
    
    // Animation ticker for smoother cursor movement using requestAnimationFrame instead of gsap.ticker
    const animate = () => {
      if (!isVisible) return;
      
      // Calculate velocity based on distance for pointer
      const distX = mouseX - borderX;
      const distY = mouseY - borderY;
      
      // More aggressive acceleration on windows devices for better responsiveness
      const acceleration = isWindows ? 0.25 : 0.15;
      
      borderX += distX * (isPointer ? acceleration * 2 : acceleration);
      borderY += distY * (isPointer ? acceleration * 2 : acceleration);
      
      // Apply direct position to cursor dot
      if (cursor) {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      
      // Apply smoothed position to cursor border
      if (cursorBorder) {
        cursorBorder.style.transform = `translate3d(${borderX}px, ${borderY}px, 0)`;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(animate);
    
    // Handle click animation
    const onMouseDown = () => {
      setIsActive(true);
    };
    
    const onMouseUp = () => {
      setIsActive(false);
    };
    
    // Handle cursor leaving window
    const onMouseLeave = () => {
      setIsVisible(false);
      gsap.to(cursor, { opacity: 0, duration: 0.3 });
      gsap.to(cursorBorder, { opacity: 0, duration: 0.3 });
    };
    
    const onMouseEnter = () => {
      setIsVisible(true);
      gsap.to(cursor, { opacity: 1, duration: 0.3 });
      gsap.to(cursorBorder, { opacity: 1, duration: 0.3 });
    };
    
    // Add keyboard focus/blur handlers to improve accessibility
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.tagName === 'INPUT') {
        setIsPointer(true);
        mouseX = target.getBoundingClientRect().left + target.offsetWidth / 2;
        mouseY = target.getBoundingClientRect().top + target.offsetHeight / 2;
      }
    };
    
    const onFocusOut = () => {
      setIsPointer(false);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    
    // Toggle custom cursor with keyboard shortcut (for accessibility)
    const onKeyDown = (e: KeyboardEvent) => {
      // Alt+C to toggle cursor
      if (e.altKey && e.key === 'c') {
        setIsVisible(prev => {
          const newValue = !prev;
          cursor.style.display = newValue ? 'block' : 'none';
          cursorBorder.style.display = newValue ? 'block' : 'none';
          
          // Save preference
          localStorage.setItem('preferNativeCursor', newValue ? 'false' : 'true');
          
          return newValue;
        });
      }
    };
    
    document.addEventListener('keydown', onKeyDown);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('keydown', onKeyDown);
      
      // Cancel animation frame on unmount
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isVisible, isPointer]);
  
  return (
    <>
      <div 
        ref={cursorRef} 
        className={`fixed w-2 h-2 rounded-full bg-secondary pointer-events-none z-50 mix-blend-difference transition-transform duration-100 ${isActive ? 'scale-75' : 'scale-100'}`}
        style={{ willChange: 'transform', transform: 'translate3d(-100px, -100px, 0)' }}
        aria-hidden="true"
      />
      <div 
        ref={cursorBorderRef} 
        className={`fixed w-8 h-8 rounded-full border border-white pointer-events-none z-50 mix-blend-difference transition-transform duration-300 ${isPointer ? 'scale-150' : 'scale-100'} ${isActive ? 'scale-75' : ''}`}
        style={{ willChange: 'transform', marginLeft: '-14px', marginTop: '-14px', transform: 'translate3d(-100px, -100px, 0)' }}
        aria-hidden="true"
      />
      <div className="sr-only">
        Press Alt+C to toggle custom cursor. Custom cursor is currently {isVisible ? 'enabled' : 'disabled'}.
      </div>
    </>
  );
};

export default CustomCursor; 