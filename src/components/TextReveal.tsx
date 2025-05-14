import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  type?: 'chars' | 'words' | 'lines';
  staggerAmount?: number;
  duration?: number;
  delay?: number;
  triggerPoint?: string; // e.g. 'top 80%'
}

const TextReveal: React.FC<TextRevealProps> = ({
  children,
  className = '',
  type = 'chars',
  staggerAmount = 0.02,
  duration = 1,
  delay = 0,
  triggerPoint = 'top 80%',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);
  
  useEffect(() => {
    if (!textRef.current || hasRun.current) return;
    
    const text = textRef.current;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const content = text.textContent || '';
    
    // Clear the container
    text.innerHTML = '';
    
    // Processing based on type
    if (type === 'chars') {
      // Split into characters with span wrappers
      const chars = Array.from(content);
      
      chars.forEach(char => {
        const span = document.createElement('span');
        span.classList.add('reveal-char');
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(1em)'; // Reduced from 2em
        span.textContent = char === ' ' ? '\u00A0' : char; // Replace space with non-breaking space
        text.appendChild(span);
      });
    } else if (type === 'words') {
      // Split into words
      const words = content.split(/(\s+)/);
      
      words.forEach(word => {
        const span = document.createElement('span');
        span.classList.add('reveal-word');
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(0.5em)'; // Reduced from 1em
        span.textContent = word === ' ' ? '\u00A0' : word;
        text.appendChild(span);
      });
    } else if (type === 'lines') {
      // Simple line by line animation
      const lines = content.split('\n');
      
      lines.forEach(line => {
        const div = document.createElement('div');
        div.classList.add('reveal-line');
        div.style.opacity = '0';
        div.style.transform = 'translateY(0.5em)'; // Reduced from 1em
        div.textContent = line || '\u00A0';
        text.appendChild(div);
      });
    }
    
    // Create animation
    const elements = text.querySelectorAll(
      type === 'chars' ? '.reveal-char' : 
      type === 'words' ? '.reveal-word' : '.reveal-line'
    );
    
    // Optimize for mobile
    const stagger = isMobile ? staggerAmount * 0.4 : staggerAmount * 0.8;
    
    const animate = () => {
      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 15, // Reduced from 30
          rotation: 0, // Removed rotation effect
        },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          stagger: stagger,
          duration: Math.min(duration * 0.6, 0.5), // Cap duration at 0.5s
          delay: delay,
          ease: "power2.out", // Changed from power3 to power2
          overwrite: 'auto',
          onComplete: () => {
            // Force all elements to be visible when complete
            gsap.set(elements, { opacity: 1, y: 0, clearProps: "all" });
          }
        }
      );
      
      hasRun.current = true;
    };
    
    // Check if should run immediately or on scroll
    if (triggerPoint === 'immediate') {
      requestAnimationFrame(() => {
        animate();
      });
    } else {
      // Scroll triggered animation
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 90%", // Trigger earlier
        onEnter: animate,
        once: true,
      });
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === containerRef.current) {
          trigger.kill();
        }
      });
    };
  }, [type, staggerAmount, delay, duration, triggerPoint]);
  
  return (
    <div ref={containerRef} className={`text-reveal-container ${className}`}>
      <div ref={textRef} className="text-reveal-content" style={{ display: 'inline-block' }}>
        {children}
      </div>
    </div>
  );
};

export default TextReveal; 