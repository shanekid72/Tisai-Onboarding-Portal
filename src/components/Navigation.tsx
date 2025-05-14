import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

// Make sure Flip is registered
gsap.registerPlugin(Flip);

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Add subtle fade-in animation for nav elements
  useEffect(() => {
    if (navRef.current) {
      gsap.from(navRef.current.querySelectorAll('.nav-item'), {
        opacity: 0,
        y: -20,
        stagger: 0.05,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.2
      });
    }
  }, []);
  
  // Handle menu animation with GSAP Flip
  useEffect(() => {
    if (!menuRef.current) return;
    
    // Get the initial state before changes
    const state = Flip.getState(menuRef.current.children);
    
    // Update the class that changes layout
    if (isOpen) {
      menuRef.current.classList.add('menu-open');
    } else {
      menuRef.current.classList.remove('menu-open');
    }
    
    // Create the Flip animation
    Flip.from(state, {
      duration: 0.6,
      ease: 'power3.inOut',
      stagger: 0.05, // Stagger the animations for children
      absolute: true, // Makes items position: absolute during the animation
      onEnter: elements => gsap.fromTo(elements, 
        { opacity: 0, scale: 0.8 }, 
        { opacity: 1, scale: 1, duration: 0.4, delay: 0.2 }
      ),
      onLeave: elements => gsap.to(elements, 
        { opacity: 0, scale: 0.8, duration: 0.3 }
      ),
      onComplete: () => {
        // Focus first menu item when menu opens for accessibility
        if (isOpen && menuRef.current) {
          const firstLink = menuRef.current.querySelector('a');
          if (firstLink) {
            (firstLink as HTMLElement).focus();
          }
        }
      }
    });
    
    // Add escape key handler
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);
  
  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  return (
    <>
      {/* Main navigation */}
      <nav 
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-black bg-opacity-80 backdrop-blur py-3 shadow-lg' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold text-white">
            <span className="text-secondary">TisAi</span> WorldAPI
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/products" 
              className={`nav-item text-sm uppercase tracking-wider transition-colors ${
                location.pathname === '/products' ? 'text-secondary' : 'text-white/80 hover:text-white'
              }`}
            >
              Products
            </Link>
            <Link 
              to="/how-it-works" 
              className={`nav-item text-sm uppercase tracking-wider transition-colors ${
                location.pathname === '/how-it-works' ? 'text-secondary' : 'text-white/80 hover:text-white'
              }`}
            >
              How It Works
            </Link>
            <Link 
              to="/compliance" 
              className={`nav-item text-sm uppercase tracking-wider transition-colors ${
                location.pathname === '/compliance' ? 'text-secondary' : 'text-white/80 hover:text-white'
              }`}
            >
              Compliance
            </Link>
            <Link 
              to="/integration" 
              className={`nav-item text-sm uppercase tracking-wider transition-colors ${
                location.pathname === '/integration' ? 'text-secondary' : 'text-white/80 hover:text-white'
              }`}
            >
              Integration
            </Link>
            <Link 
              to="/tisai" 
              className="nav-item btn-primary btn-sm py-2 px-4 rounded text-sm uppercase tracking-wider"
            >
              Launch TisAi
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 relative z-20"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <span 
              className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                isOpen ? 'transform rotate-45 translate-y-1' : 'mb-1'
              }`}
            />
            <span 
              className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                isOpen ? 'opacity-0' : 'mb-1'
              }`}
            />
            <span 
              className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
                isOpen ? 'transform -rotate-45 -translate-y-1' : ''
              }`}
            />
          </button>
        </div>
      </nav>
      
      {/* Mobile menu overlay */}
      <div 
        ref={menuRef}
        className={`fixed inset-0 z-40 bg-black bg-opacity-95 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center space-y-8">
          <Link 
            to="/products" 
            className={`text-2xl font-bold transition-colors ${
              location.pathname === '/products' ? 'text-secondary' : 'text-white'
            }`}
          >
            Products
          </Link>
          <Link 
            to="/how-it-works" 
            className={`text-2xl font-bold transition-colors ${
              location.pathname === '/how-it-works' ? 'text-secondary' : 'text-white'
            }`}
          >
            How It Works
          </Link>
          <Link 
            to="/compliance" 
            className={`text-2xl font-bold transition-colors ${
              location.pathname === '/compliance' ? 'text-secondary' : 'text-white'
            }`}
          >
            Compliance
          </Link>
          <Link 
            to="/integration" 
            className={`text-2xl font-bold transition-colors ${
              location.pathname === '/integration' ? 'text-secondary' : 'text-white'
            }`}
          >
            Integration
          </Link>
          <Link 
            to="/tisai" 
            className="btn-primary py-3 px-8 rounded-lg text-lg mt-4"
          >
            Launch TisAi
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navigation; 