/**
 * Utilities to help with GSAP TypeScript issues
 */

import { gsap } from 'gsap';

/**
 * Safely casts an element to a GSAP DOMTarget
 * This helps work around TypeScript issues with the _gsap property
 */
export function asDOMTarget(element: Element | null): gsap.DOMTarget {
  return element as unknown as gsap.DOMTarget;
}

/**
 * Helper to create GSAP ScrollTrigger config with proper TypeScript support
 */
export function createScrollTriggerConfig(config: {
  trigger: Element | null;
  start?: string;
  end?: string;
  [key: string]: any;
}) {
  return {
    ...config,
    trigger: asDOMTarget(config.trigger)
  };
}

/**
 * Helper for GSAP typed batch operations
 */
export function batchElements(
  elements: NodeListOf<Element> | Element[], 
  callback: (elements: Element[]) => void
) {
  // Convert NodeList to array if needed
  const elementsArray = Array.from(elements);
  // Cast to DOMTarget before passing to GSAP functions
  callback(elementsArray.map(el => asDOMTarget(el) as unknown as Element));
}

/**
 * Helper to safely use GSAP utils.toArray with proper typing
 */
export function toTypedArray<T extends Element = Element>(
  selector: string | NodeListOf<Element> | Element[] | Element | null
): T[] {
  return gsap.utils.toArray(selector as any) as T[];
} 