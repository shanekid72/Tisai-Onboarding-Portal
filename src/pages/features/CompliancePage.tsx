import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Components
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

const CompliancePage = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const complianceRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize GSAP animations
    const ctx = gsap.context(() => {
      // Header animations
      if (headerRef.current) {
        // Create split text animation for page title
        const splitHeading = new SplitText('.page-title', { type: 'chars,words' });
        const chars = splitHeading.chars;
        
        gsap.from(chars, {
          opacity: 0,
          y: 100,
          stagger: 0.03,
          duration: 1,
          ease: 'power4.out',
        });
        
        // Parallax effect for the header
        gsap.to('.parallax-bg', {
          y: -100,
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
      
      // Compliance section animations
      if (complianceRef.current) {
        const complianceItems = document.querySelectorAll('.compliance-item');
        
        // Create main timeline
        ScrollTrigger.batch('.compliance-item', {
          interval: 0.1,
          onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            overwrite: true
          })
        });
        
        complianceItems.forEach((item, index) => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: item as Element,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            }
          });
          
          tl.from(item as Element, {
            opacity: 0,
            y: 50 + (index * 10), // Use index to create staggered offset
            duration: 0.8,
            ease: 'power3.out',
            delay: index * 0.1 // Use index to create staggered delay
          });
          
          // Badge animation
          const badge = item.querySelector('.compliance-badge');
          if (badge) {
            tl.from(badge, {
              scale: 0,
              opacity: 0,
              duration: 0.6,
              ease: 'back.out(1.7)',
            }, "-=0.5");
          }
        });
      }
      
      // Features animations
      if (featuresRef.current) {
        const features = gsap.utils.toArray<HTMLElement>('.feature-card');
        
        features.forEach((feature, i) => {
          gsap.from(feature, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: feature,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            delay: i * 0.1,
          });
        });
      }
    });
    
    return () => ctx.revert(); // Clean up animations
  }, []);
  
  return (
    <div className="compliance-page bg-black text-white min-h-screen">
      <Navigation />
      
      {/* Header section with parallax */}
      <header 
        ref={headerRef} 
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <div className="parallax-bg absolute top-0 left-0 w-full h-full bg-[#111] opacity-50"></div>
          <div className="parallax-bg absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="parallax-bg absolute -bottom-40 -left-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 z-10 text-center">
          <h1 className="page-title text-5xl md:text-7xl font-bold mb-6">
            API <span className="text-secondary">Compliance</span>
          </h1>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl mb-10 text-white/70">
              Our enterprise-grade compliance solutions ensure your API integration
              meets industry standards and regulatory requirements.
            </p>
            <Link
              to="/tisai"
              className="btn-primary btn text-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="text-sm text-white/50 mb-2">Scroll</span>
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>
      
      {/* Compliance standards section */}
      <section className="py-20 bg-dark" ref={complianceRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Compliance <span className="text-secondary">Standards</span></h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Our API integration platform is compliant with major industry standards,
              ensuring your data is handled securely and responsibly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* GDPR Compliance */}
            <div className="compliance-item bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 relative">
              <div className="compliance-badge absolute -top-5 -right-5 w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white font-bold shadow-lg">
                GDPR
              </div>
              <h3 className="text-2xl font-bold mb-4">GDPR Compliance</h3>
              <p className="text-white/70 mb-6">
                Our platform adheres to all General Data Protection Regulation (GDPR)
                requirements, providing tools for data minimization, privacy controls,
                and consent management.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Data subject access rights</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Right to be forgotten</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Data portability</span>
                </li>
              </ul>
            </div>
            
            {/* ISO 27001 */}
            <div className="compliance-item bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 relative">
              <div className="compliance-badge absolute -top-5 -right-5 w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white font-bold shadow-lg text-xs">
                ISO 27001
              </div>
              <h3 className="text-2xl font-bold mb-4">ISO 27001 Certified</h3>
              <p className="text-white/70 mb-6">
                Our system maintains ISO 27001 certification, the international standard
                for information security management, ensuring robust security controls.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Regular security audits</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Incident management</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Risk assessment</span>
                </li>
              </ul>
            </div>
            
            {/* SOC 2 */}
            <div className="compliance-item bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 relative">
              <div className="compliance-badge absolute -top-5 -right-5 w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white font-bold shadow-lg">
                SOC 2
              </div>
              <h3 className="text-2xl font-bold mb-4">SOC 2 Compliant</h3>
              <p className="text-white/70 mb-6">
                We adhere to SOC 2 requirements for security, availability, processing
                integrity, confidentiality, and privacy of customer data.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Third-party validation</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Annual assessments</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Continuous monitoring</span>
                </li>
              </ul>
            </div>
            
            {/* HIPAA */}
            <div className="compliance-item bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 relative">
              <div className="compliance-badge absolute -top-5 -right-5 w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white font-bold shadow-lg">
                HIPAA
              </div>
              <h3 className="text-2xl font-bold mb-4">HIPAA Ready</h3>
              <p className="text-white/70 mb-6">
                For healthcare integrations, our platform provides tools and controls
                to help maintain HIPAA compliance and protect patient data.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>PHI protection</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access controls</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-secondary mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Audit trail</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Compliance features */}
      <section className="py-20 bg-black" ref={featuresRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Compliance <span className="text-secondary">Features</span></h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Our platform includes a variety of features to help you maintain compliance
              with regulatory requirements and industry standards.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card bg-dark/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 h-full hover:border-secondary/50 transition-all duration-300">
              <div className="text-4xl text-secondary mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Data Encryption</h3>
              <p className="text-white/70">
                End-to-end encryption for all data in transit and at rest, ensuring
                your sensitive information remains protected.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card bg-dark/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 h-full hover:border-secondary/50 transition-all duration-300">
              <div className="text-4xl text-secondary mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Access Controls</h3>
              <p className="text-white/70">
                Granular permission settings allow you to control who can access
                which API endpoints and what actions they can perform.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card bg-dark/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 h-full hover:border-secondary/50 transition-all duration-300">
              <div className="text-4xl text-secondary mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Audit Logging</h3>
              <p className="text-white/70">
                Comprehensive audit trails for all API activity, making it easy to
                track and report on usage for compliance purposes.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="feature-card bg-dark/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 h-full hover:border-secondary/50 transition-all duration-300">
              <div className="text-4xl text-secondary mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Compliance Reporting</h3>
              <p className="text-white/70">
                Automated reporting tools to help you demonstrate compliance with
                relevant regulations and standards during audits.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="feature-card bg-dark/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 h-full hover:border-secondary/50 transition-all duration-300">
              <div className="text-4xl text-secondary mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Data Breach Prevention</h3>
              <p className="text-white/70">
                Proactive security measures including anomaly detection, rate limiting,
                and intrusion prevention to protect against data breaches.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="feature-card bg-dark/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 h-full hover:border-secondary/50 transition-all duration-300">
              <div className="text-4xl text-secondary mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Data Residency</h3>
              <p className="text-white/70">
                Configure where your data is stored and processed to comply with
                regional data sovereignty requirements.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-20 bg-gradient-to-b from-dark to-black relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready for <span className="text-secondary">Compliance</span>?</h2>
          <p className="text-xl mb-10 text-white/70 max-w-2xl mx-auto">
            Start your WorldAPI integration with confidence, knowing your data and processes
            are compliant with industry standards and regulatory requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-outline btn text-lg">
              Explore Platform
            </Link>
            <Link to="/tisai" className="btn-primary btn text-lg">
              Launch TisAi
            </Link>
          </div>
        </div>
        
        <div className="absolute inset-0 -z-10">
          <div className="parallax-bg absolute top-20 right-20 w-80 h-80 rounded-full bg-secondary/5 blur-3xl"></div>
          <div className="parallax-bg absolute bottom-20 left-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl"></div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default CompliancePage; 