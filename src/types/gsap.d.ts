// Declaration file for GSAP and its plugins
import { TweenTarget, TweenVars } from 'gsap/gsap-core';

// Define GSCache interface for _gsap property on DOM elements
interface GSCache {
  id?: number;
  target?: object;
  harness?: object;
  get?: (target: object, key: string) => any;
  set?: (target: object, property: string, value: any) => void;
  lastIndex?: number;
  x?: number;
  y?: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
  [key: string]: any;
}

// Extend Element interface to include _gsap property
declare global {
  interface Element {
    _gsap?: GSCache;
  }
}

declare module 'gsap' {
  // DOM target type that accepts Element with _gsap property
  export type DOMTarget = string | Element | null | ArrayLike<Element | null | string>;
  
  export interface ScrollTriggerInstance {
    kill(completely?: boolean): void;
    progress: number;
    refresh(hard?: boolean): void;
    vars: any;
    scroll(position: number): void;
    start: number;
    end: number;
  }

  export interface ScrollTriggerStatic {
    create(vars: object): ScrollTriggerInstance;
    refresh(hard?: boolean): void;
    update(reset?: boolean): void;
    clearScrollMemory(): void;
    getAll(): ScrollTriggerInstance[];
    defaults(config: object): void;
    addEventListener(type: string, callback: Function): void;
    getById(id: string): ScrollTriggerInstance | undefined;
    batch(targets: DOMTarget, vars: object): void;
  }

  export interface ScrollSmootherInstance {
    scrollTo(target: string | Element, smooth?: boolean): void;
    kill(): void;
    progress: number;
  }

  export interface ScrollSmootherStatic {
    create(vars: object): ScrollSmootherInstance;
  }

  export interface GSAPContext {
    revert(): void;
  }

  export interface GSAPStatic {
    to(targets: TweenTarget, vars: TweenVars): gsap.core.Tween;
    from(targets: TweenTarget, vars: TweenVars): gsap.core.Tween;
    fromTo(targets: TweenTarget, fromVars: TweenVars, toVars: TweenVars): gsap.core.Tween;
    set(targets: TweenTarget, vars: TweenVars): void;
    timeline(vars?: TweenVars): gsap.core.Timeline;
    killTweensOf(targets: TweenTarget): void;
    context(func: Function): GSAPContext;
    getProperty(target: Element | string, property: string): any;
    utils: {
      toArray<T extends Element>(selector: string | Element | NodeList | T[]): T[];
      selector(selector: string | Element): Element | null;
    };
  }

  export interface SplitTextInstance {
    chars: Element[];
    words: Element[];
    lines: Element[];
    revert(): void;
  }

  export interface SplitTextConstructor {
    new(target: string | Element | null, options?: { type?: string, charsClass?: string }): SplitTextInstance;
  }

  export interface FlipInstance {
    from(state: any, options?: object): gsap.core.Tween;
    to(state: any, options?: object): gsap.core.Tween;
    fromTo(fromState: any, toState: any, options?: object): gsap.core.Tween;
  }

  export interface FlipConstructor {
    getState(targets: string | Element | Element[] | NodeList): any;
  }

  // Export GSAP plugins
  export const ScrollTrigger: ScrollTriggerStatic;
  export const ScrollSmoother: ScrollSmootherStatic;
  export const SplitText: SplitTextConstructor;
  export const Flip: FlipConstructor;
  export const MotionPathPlugin: any;
  export const Observer: any;
  export const ScrambleTextPlugin: any;
}

// Extend Window interface to include GSAP-specific properties
declare global {
  interface Window {
    scrollSmoother?: any;
    appScrollSmoother?: any;
    howItWorksAnimationsContext?: gsap.GSAPContext;
  }
} 