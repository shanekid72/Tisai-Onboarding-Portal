import React, { useEffect, useMemo, useRef, ReactNode, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./ScrollFloat.css";

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  id?: string;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  scrollContainerRef,
  containerClassName = "",
  textClassName = "",
  animationDuration = 1,
  ease = "power2.out",
  scrollStart = "top 80%",
  scrollEnd = "bottom top",
  stagger = 0.03,
  id = `scroll-float-${Math.random().toString(36).substring(2, 9)}`
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split("").map((char, index) => (
      <span className="char" key={index}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Give the container a unique ID for GSAP to target
    containerRef.current.id = id;
    const chars = document.querySelectorAll(`#${id} .char`);
    
    // Set initial state
    gsap.set(chars, {
      willChange: "opacity, transform",
      opacity: 0,
      yPercent: 50,
      scaleY: 1.5,
      scaleX: 0.7,
      transformOrigin: "50% 0%"
    });
    
    // Create a timeline for better control
    tl.current = gsap.timeline({ 
      paused: true,
      defaults: { duration: animationDuration, ease: ease } 
    });
    
    // Add the animation to the timeline
    tl.current.to(chars, {
      opacity: 1,
      yPercent: 0,
      scaleY: 1,
      scaleX: 1,
      stagger: stagger,
    });
    
    // Create ScrollTrigger
    const trigger = ScrollTrigger.create({
      trigger: `#${id}`,
      start: scrollStart,
      end: scrollEnd,
      // Use toggle actions instead of scrub for more reliable behavior
      // play, reverse, restart, complete (forward), reverse, restart, reset (backward)
      toggleActions: "play none none reverse",
      id: `trigger-${id}`,
      onEnter: () => {
        if (tl.current) tl.current.play();
      },
      onEnterBack: () => {
        if (tl.current) tl.current.reverse(0); // Ensure we go to beginning before playing
      },
      onLeave: () => {
        if (tl.current) tl.current.pause();
      },
      onLeaveBack: () => {
        if (tl.current) tl.current.pause();
      }
    });

    return () => {
      // Proper cleanup to prevent memory leaks
      if (tl.current) {
        tl.current.kill();
        tl.current = null;
      }
      
      if (trigger) {
        trigger.kill();
      }
      
      // Clean up all ScrollTrigger instances related to this component
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.id === `trigger-${id}` || st.vars.trigger === `#${id}`) {
          st.kill();
        }
      });
    };
  }, [
    id,
    scrollContainerRef,
    animationDuration,
    ease,
    scrollStart,
    scrollEnd,
    stagger
  ]);

  return (
    <h2 ref={containerRef} className={`scroll-float ${containerClassName}`}>
      <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
    </h2>
  );
};

export default ScrollFloat; 