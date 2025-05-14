// Import necessary GSAP types
import { TweenTarget } from 'gsap/gsap-core';

// Export type declarations
declare global {
  // Additional global types can be added here
  interface GsapContext {
    revert(): void;
  }
}

// Ensure proper module augmentation for GSAP types
declare module 'gsap' {
  export namespace core {
    interface Timeline {
      to(target: TweenTarget, vars: object): this;
      from(target: TweenTarget, vars: object): this;
      fromTo(target: TweenTarget, fromVars: object, toVars: object): this;
    }

    interface Tween {
      kill(): void;
      pause(): void;
      play(): void;
      targets(): any[];
    }
  }

  export interface ScrollTriggerInstance {
    progress: number;
    kill(completely?: boolean): void;
  }

  export interface ScrollTriggerStatic {
    create(vars: object): ScrollTriggerInstance;
    refresh(hard?: boolean): void;
    getAll(): ScrollTriggerInstance[];
    batch(targets: string | Element | Element[], vars: object): void;
  }

  export const ScrollTrigger: ScrollTriggerStatic;

  export interface ScrollSmootherInstance {
    scrollTo(target: string | Element, smooth?: boolean): void;
    kill(): void;
    progress: number;
  }

  export function context(func: () => void): GsapContext;

  export interface GSAPUtils {
    toArray<T extends Element>(selector: string): T[];
    toArray(selector: string): Element[];
  }

  export interface SplitTextInstance {
    chars: Element[];
    words: Element[];
    lines?: Element[];
    revert(): void;
  }

  export interface SplitTextConstructor {
    new (target: string | Element, options?: { type?: string }): SplitTextInstance;
  }

  export interface FlipState {
    targets: Element[];
  }

  export interface FlipStatic {
    getState(targets: Element | Element[] | string): FlipState;
    from(state: FlipState, vars?: object): gsap.core.Timeline;
  }

  export const Flip: FlipStatic;
  export const SplitText: SplitTextConstructor;
  
  export function getProperty(target: TweenTarget, property: string): number | string;
  export function to(target: TweenTarget, vars: object): gsap.core.Tween;
  export function from(target: TweenTarget, vars: object): gsap.core.Tween;
  export function timeline(vars?: object): gsap.core.Timeline;
}

// Export empty object to make this a module
export {}; 