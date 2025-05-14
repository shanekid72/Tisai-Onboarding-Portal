import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/smoothScrollFix.css'

/*
// Font loading handler to handle font loading failures gracefully
document.addEventListener('DOMContentLoaded', () => {
  // Check if fonts are already loaded
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      document.documentElement.classList.add('fonts-loaded');
    }).catch(() => {
      // If font loading fails, add fallback class
      document.documentElement.classList.add('font-fallback');
    });
  } else {
    // Browser doesn't support font loading API, assume fonts are loaded after a delay
    setTimeout(() => {
      document.documentElement.classList.add('fonts-loaded');
    }, 500);
  }
  
  // Handle CSP issues with Google Fonts by adding a fallback class if needed
  const googleFontLink = document.querySelector('link[href*="fonts.googleapis.com"]');
  if (googleFontLink) {
    // Check if the stylesheet loaded successfully
    const isStylesheetLoaded = Array.from(document.styleSheets).some(sheet => {
      try {
        return sheet.href && sheet.href.includes('fonts.googleapis.com');
      } catch (e) {
        // CORS error in Firefox when accessing cross-origin stylesheet
        return false;
      }
    });
    
    if (!isStylesheetLoaded) {
      document.documentElement.classList.add('font-fallback');
    }
  }
});
*/

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
