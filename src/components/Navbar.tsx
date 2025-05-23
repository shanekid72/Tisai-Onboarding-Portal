import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  
  // Throttle scroll events for better performance
  const throttleScroll = (callback: Function, delay: number) => {
    let lastCall = 0;
    return function() {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback();
      }
    };
  };

  useEffect(() => {
    const handleScroll = throttleScroll(() => {
      const offset = window.scrollY;
      lastScrollY.current = offset;
      
      // Only update state if scrolled enough to be noticeable
      if ((offset > 50 && !scrolled) || (offset <= 50 && scrolled)) {
        setScrolled(offset > 50);
      }
      
      // Mark as scrolling
      if (!isScrolling) {
        setIsScrolling(true);
      }
      
      // Reset scrolling state after scrolling stops
      if (scrollTimeout.current !== null) {
        window.clearTimeout(scrollTimeout.current);
      }
      
      scrollTimeout.current = window.setTimeout(() => {
        setIsScrolling(false);
        scrollTimeout.current = null;
      }, 150);
    }, 100); // Throttle to max 10 updates per second

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animate navbar items only once on initial load, not during scrolling
    if (!isScrolling && navRef.current) {
      const navItems = navRef.current.querySelectorAll('.nav-item');
      if (navItems.length > 0) {
        const tl = gsap.timeline({ delay: 0.5 });
        tl.fromTo(
          navItems, 
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }
        );
      }
    }

    // Add event listener for ESC key to close mobile menu
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        toggleMobileMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      if (scrollTimeout.current !== null) {
        window.clearTimeout(scrollTimeout.current);
      }
    };
  }, [scrolled, isScrolling, mobileMenuOpen]);

  // Toggle mobile menu with simplified animation for better performance
  const toggleMobileMenu = () => {
    if (mobileMenuRef.current) {
      if (!mobileMenuOpen) {
        // Simplified open animation - less taxing on performance
        gsap.to(mobileMenuRef.current, {
          height: 'auto',
          opacity: 1,
          duration: 0.2,
          ease: 'power1.out',
        });
      } else {
        // Simplified close animation
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.2,
          ease: 'power1.in',
        });
      }
      setMobileMenuOpen(!mobileMenuOpen);

      // Set focus to the first menu item when opened
      if (!mobileMenuOpen) {
        setTimeout(() => {
          const firstLink = mobileMenuRef.current?.querySelector('a');
          if (firstLink) {
            (firstLink as HTMLElement).focus();
          }
        }, 200);
      }
    }
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        scrolled ? 'bg-dark bg-opacity-90 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'
      }`}
      style={{ willChange: 'transform, opacity' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-bold gradient-text" aria-label="TisAi WorldAPI Home">
          TisAi WorldAPI
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-8 items-center" role="menubar">
          <a href="#how-it-works" className="nav-item text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50" role="menuitem">
            How It Works
          </a>
          <a href="#features" className="nav-item text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50" role="menuitem">
            Features
          </a>
          <Link 
            to="/documentation" 
            className="nav-item text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50" 
            role="menuitem"
          >
            Documentation
          </Link>
          <Link 
            to="/send-money"
            className="nav-item text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
            role="menuitem"
          >
            Send Money
          </Link>
          <Link
            to="/tisai"
            className="nav-item ml-4 btn-primary btn text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
            role="menuitem"
          >
            Launch TisAi
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div 
        id="mobile-menu"
        ref={mobileMenuRef}
        className="mobile-menu md:hidden h-0 opacity-0 overflow-hidden transition-all duration-300"
        role="menu"
        aria-labelledby="mobile-menu-button"
      >
        <div className="container mx-auto px-4 py-2 flex flex-col space-y-4 bg-dark bg-opacity-95">
          <a 
            href="#how-it-works" 
            className="text-white/70 hover:text-white py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50" 
            onClick={toggleMobileMenu}
            role="menuitem"
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            How It Works
          </a>
          <a 
            href="#features" 
            className="text-white/70 hover:text-white py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50" 
            onClick={toggleMobileMenu}
            role="menuitem"
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            Features
          </a>
          <Link 
            to="/documentation" 
            className="text-white/70 hover:text-white py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50" 
            onClick={toggleMobileMenu}
            role="menuitem"
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            Documentation
          </Link>
          <Link
            to="/send-money"
            className="text-white/70 hover:text-white py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
            onClick={toggleMobileMenu}
            role="menuitem"
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            Send Money
          </Link>
          <Link
            to="/tisai"
            className="btn-primary btn text-sm inline-block text-center focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
            onClick={toggleMobileMenu}
            role="menuitem"
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            Launch TisAi
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 