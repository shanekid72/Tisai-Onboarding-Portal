import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

const NotFound = () => {
  useEffect(() => {
    // Animation for the 404 page
    const tl = gsap.timeline();
    
    tl.fromTo(
      '.notfound-text',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 }
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 text-center">
      <h1 className="notfound-text text-9xl font-bold text-secondary mb-4">404</h1>
      <h2 className="notfound-text text-4xl font-bold mb-6 gradient-text">Page Not Found</h2>
      <p className="notfound-text text-xl text-white/70 mb-8 max-w-md">
        The page you are looking for might have been removed, had its
        name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="notfound-text btn btn-primary text-lg inline-block"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound; 