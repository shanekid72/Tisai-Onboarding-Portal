/**
 * CSP Issue Fix Script
 * 
 * This script helps handle Content Security Policy (CSP) issues that may occur
 * when loading external resources like Google Fonts. It provides fallbacks
 * and suppresses console warnings for known issues.
 */

(function() {
  // Filter console warnings about preloaded resources
  const originalConsoleWarn = console.warn;
  console.warn = function() {
    // Check if the warning is about preloaded resources not being used soon enough
    if (arguments[0] && typeof arguments[0] === 'string' && 
        (arguments[0].includes('preloaded') || 
         arguments[0].includes('CSP') ||
         arguments[0].includes('Content Security Policy'))) {
      // Suppress this warning
      return;
    }
    // Pass through all other warnings
    return originalConsoleWarn.apply(console, arguments);
  };

  // Handle font loading issues
  document.addEventListener('DOMContentLoaded', function() {
    // Add class to trigger fallback fonts if Google Fonts fail to load
    setTimeout(function() {
      // Check if any Google Fonts stylesheets were successfully loaded
      const googleFontsLoaded = Array.from(document.styleSheets).some(function(sheet) {
        try {
          return sheet.href && sheet.href.includes('fonts.googleapis.com');
        } catch (e) {
          return false; // CORS error when accessing cross-origin stylesheets
        }
      });
      
      // If Google Fonts failed to load, add fallback class
      if (!googleFontsLoaded) {
        document.documentElement.classList.add('font-fallback');
      }
    }, 1000);
  });
})(); 