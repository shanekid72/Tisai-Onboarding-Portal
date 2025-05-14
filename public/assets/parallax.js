/**
 * Parallax effect for SVG images
 * Adds depth and movement to SVG images on scroll
 */
(function() {
  // Configuration
  const PARALLAX_SENSITIVITY = 0.05; // How much to move elements (lower = subtler effect)
  const TILT_SENSITIVITY = 0.01;    // How much to tilt elements (lower = subtler effect)
  const MOTION_SMOOTHING = 0.1;     // Motion smoothing factor (lower = smoother, but slower)
  
  // State tracking
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  
  // Performance optimization: Use requestAnimationFrame for smooth animation
  let ticking = false;

  // Element cache for performance
  let parallaxElements = [];
  
  // Initialize parallax effect
  function initParallax() {
    // Find all SVG elements with parallax layers
    document.querySelectorAll('svg').forEach(svg => {
      const layers = svg.querySelectorAll('.parallax-layer');
      if (layers.length > 0) {
        svg.classList.add('has-parallax');
        
        // Cache elements and their properties for better performance
        layers.forEach(layer => {
          const depth = parseFloat(layer.getAttribute('data-depth') || 0.5);
          parallaxElements.push({
            element: layer,
            depth: depth,
            parent: svg,
            bounds: svg.getBoundingClientRect()
          });
        });
      }
    });
    
    // Update bounds on window resize
    window.addEventListener('resize', updateElementBounds);
    
    // Set up mouse movement tracking for hover effect
    document.addEventListener('mousemove', onMouseMove);
    
    // Set up scroll tracking
    window.addEventListener('scroll', onScroll);
    
    // Initial update
    updateElementBounds();
    requestAnimationFrame(updateParallax);
  }
  
  // Update cached element bounds
  function updateElementBounds() {
    parallaxElements.forEach(item => {
      item.bounds = item.parent.getBoundingClientRect();
    });
  }
  
  // Handle mouse movement for hover-based parallax
  function onMouseMove(e) {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
    
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  
  // Handle scroll events
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  
  // Update the position of parallax elements
  function updateParallax() {
    // Smooth mouse movement
    mouseX += (targetMouseX - mouseX) * MOTION_SMOOTHING;
    mouseY += (targetMouseY - mouseY) * MOTION_SMOOTHING;
    
    // Process each parallax element
    parallaxElements.forEach(item => {
      // Skip elements that are not in viewport
      if (!isInViewport(item.bounds)) return;
      
      // Calculate mouse position relative to SVG center
      const rect = item.bounds;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = (mouseX - centerX) * PARALLAX_SENSITIVITY * item.depth;
      const distanceY = (mouseY - centerY) * PARALLAX_SENSITIVITY * item.depth;
      
      // Calculate scroll-based offset
      const scrollY = window.scrollY;
      const scrollOffset = (scrollY - rect.top) * PARALLAX_SENSITIVITY * item.depth;
      
      // Apply transform with hardware acceleration
      item.element.style.transform = `translate3d(${distanceX}px, ${distanceY + scrollOffset}px, 0)`;
      
      // Add subtle tilt effect based on mouse position
      if (item.depth > 0.4) { // Only apply to foreground elements
        const tiltX = (mouseY - centerY) * TILT_SENSITIVITY;
        const tiltY = (mouseX - centerX) * TILT_SENSITIVITY;
        item.parent.style.perspective = "1000px";
        item.element.style.transform += ` rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
      }
    });
    
    ticking = false;
  }
  
  // Utility: Check if element is in viewport (plus margin)
  function isInViewport(rect, margin = 100) {
    return (
      rect.bottom + margin > 0 &&
      rect.right + margin > 0 &&
      rect.top - margin < window.innerHeight &&
      rect.left - margin < window.innerWidth
    );
  }
  
  // Wait for DOM to be loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParallax);
  } else {
    initParallax();
  }
})(); 