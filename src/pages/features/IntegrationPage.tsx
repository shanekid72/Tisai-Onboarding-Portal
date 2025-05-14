import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';

// Components
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

const IntegrationPage = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const codeExampleRef = useRef<HTMLDivElement>(null);
  const typingAnimationsRef = useRef<gsap.core.Tween[]>([]);
  
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
        const parallaxElements = document.querySelectorAll('[data-speed]');
        parallaxElements.forEach((element) => {
          const speed = parseFloat(element.getAttribute('data-speed') || '0.5');
          
          gsap.to(element as Element, {
            y: () => (1 - speed) * 50,
            ease: "none",
            scrollTrigger: {
              trigger: element as Element,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8
            }
          });
        });
      }
      
      // Features animation with Flip for enhanced transitions
      if (featuresRef.current) {
        // Initialize Flip state for feature icons
        const featureIcons = featuresRef.current.querySelectorAll('.feature-icon');
        const flipState = Flip.getState(featureIcons);
        
        // Apply some initial styling that will be animated
        featureIcons.forEach(icon => {
          (icon as HTMLElement).style.transform = 'scale(0.8)';
        });
        
        // Animate to the final state with Flip
        Flip.from(flipState, {
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.05,
          onComplete: () => {
            // After Flip animation, continue with regular animations
            animateFeatures();
          }
        });
        
        function animateFeatures() {
          const sectionElements = gsap.utils.toArray<Element>('.section');
          sectionElements.forEach((section) => {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
              }
            });
            
            // Staggered animation for each feature item
            tl.from(section, {
              opacity: 0, 
              y: 50, 
              duration: 0.6,
              ease: 'power3.out',
            });
            
            // Icon animation
            const icon = section.querySelector('.feature-icon');
            if (icon) {
              tl.from(icon, {
                scale: 0,
                opacity: 0,
                duration: 0.4,
                ease: 'back.out(1.7)',
              }, "-=0.4");
            }
          });
        }
        
        // Register a ScrollTrigger for the entire section for better performance
        ScrollTrigger.create({
          trigger: featuresRef.current,
          start: 'top bottom',
          end: 'bottom top',
          markers: false,
          onEnter: () => {
            featuresRef.current?.classList.add('section-visible');
          },
          onLeaveBack: () => {
            featuresRef.current?.classList.remove('section-visible');
          }
        });
      }
      
      // Code example animations
      if (codeExampleRef.current) {
        // Slide in code blocks
        const codeBlocks = gsap.utils.toArray<HTMLElement>('.code-block');
        codeBlocks.forEach((block, index) => {
          gsap.from(block, {
            x: index % 2 === 0 ? -100 : 100,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: block,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          });
        });
        
        // Type writer effect for code
        const codeLines = gsap.utils.toArray<HTMLElement>('.code-line');
        typingAnimationsRef.current = []; // Clear previous animations
        
        codeLines.forEach((line, index) => {
          const text = line.textContent || '';
          line.textContent = '';
          
          let currentStep = 0;
          const totalSteps = text.length;
          
          // Updated typing animation approach
          const obj = { progress: 0 };
          const typing = gsap.to(obj, {
            progress: 1,
            duration: text.length * 0.03,
            ease: 'none',
            onUpdate: function() {
              // Calculate current step based on animation progress
              const newStep = Math.floor(obj.progress * totalSteps);
              if (newStep !== currentStep) {
                currentStep = newStep;
                line.textContent = text.substring(0, currentStep);
              }
            },
            scrollTrigger: {
              trigger: codeExampleRef.current as unknown as Element,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            delay: index * 0.2
          });
          
          // Store the animation for potential future control
          typingAnimationsRef.current.push(typing);
        });
      }
    });
    
    return () => {
      // Clean up animations
      ctx.revert();
      
      // Explicitly kill typing animations
      typingAnimationsRef.current.forEach(tween => tween.kill());
    };
  }, []);
  
  return (
    <div className="bg-black text-white min-h-screen">
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
            Simple <span className="text-secondary">Integration</span>
          </h1>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl mb-10 text-white/70">
              Integrate with WorldAPI in minutes, not days. Our system makes
              complex API integration simple and intuitive.
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
      
      {/* Integration features */}
      <section 
        ref={featuresRef}
        className="py-20 bg-gradient-to-b from-black to-dark"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Integration <span className="text-secondary">Features</span></h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Our platform offers a variety of features to make your WorldAPI integration
              smooth and efficient. Here's what you can expect:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-item bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-500 hover:border-secondary/50 group">
              <div className="feature-icon w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Quick Setup</h3>
              <p className="text-white/70">
                Get up and running in minutes with our streamlined integration process.
                No complex configurations or long setup times.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-item bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-500 hover:border-secondary/50 group">
              <div className="feature-icon w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Built-in Security</h3>
              <p className="text-white/70">
                Industry-standard security practices are integrated into our platform,
                ensuring your data and connections are always protected.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-item bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-500 hover:border-secondary/50 group">
              <div className="feature-icon w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Real-time Analytics</h3>
              <p className="text-white/70">
                Monitor your API integration performance with comprehensive analytics
                and insights. Track usage, errors, and performance metrics.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="feature-item bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-500 hover:border-secondary/50 group">
              <div className="feature-icon w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Seamless Data Flow</h3>
              <p className="text-white/70">
                Establish bi-directional data flow between your systems and WorldAPI 
                with our reliable connectivity protocols and real-time synchronization.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="feature-item bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-500 hover:border-secondary/50 group">
              <div className="feature-icon w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Code Samples</h3>
              <p className="text-white/70">
                Get started quickly with pre-built code samples in multiple programming
                languages, including JavaScript, Python, Ruby, and more.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="feature-item bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-500 hover:border-secondary/50 group">
              <div className="feature-icon w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18a3 3 0 01-3 3H9a3 3 0 01-3-3V9m3-3h6l-3-3-3 3zm0 0H9a3 3 0 00-3 3v6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Custom Plugins</h3>
              <p className="text-white/70">
                Extend functionality with our library of plugins and extensions.
                Customize your integration to meet your specific requirements.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Code Examples */}
      <section className="py-20 bg-dark" ref={codeExampleRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Integration <span className="text-secondary">Examples</span></h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Our API is designed to be easy to work with in any programming language.
              Here are some examples to get you started:
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-10">
            {/* JavaScript Example */}
            <div className="code-block bg-[#1e1e1e] rounded-xl p-6 overflow-hidden shadow-xl">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-white/50 text-sm ml-2">JavaScript</span>
              </div>
              <pre className="text-white/90 font-mono text-sm leading-relaxed">
                <code>
                  <div className="code-line">// Initialize the WorldAPI client</div>
                  <div className="code-line">import {'{'} WorldAPI {'}'} from 'worldapi';</div>
                  <div className="code-line"></div>
                  <div className="code-line">// Create a client instance</div>
                  <div className="code-line">const client = new WorldAPI({'{'}</div>
                  <div className="code-line">  apiKey: 'your_api_key_here',</div>
                  <div className="code-line">  environment: 'production'</div>
                  <div className="code-line">{'}'});</div>
                  <div className="code-line"></div>
                  <div className="code-line">// Connect to the API</div>
                  <div className="code-line">async function connectToWorldAPI() {'{'}</div>
                  <div className="code-line">  try {'{'}</div>
                  <div className="code-line">    const connection = await client.connect();</div>
                  <div className="code-line">    console.log('Connected:', connection.status);</div>
                  <div className="code-line">    </div>
                  <div className="code-line">    // Fetch data</div>
                  <div className="code-line">    const data = await client.getData('users');</div>
                  <div className="code-line">    console.log('Data:', data);</div>
                  <div className="code-line">  {'}'} catch (error) {'{'}</div>
                  <div className="code-line">    console.error('Error:', error.message);</div>
                  <div className="code-line">  {'}'}</div>
                  <div className="code-line">{'}'}</div>
                  <div className="code-line"></div>
                  <div className="code-line">connectToWorldAPI();</div>
                </code>
              </pre>
            </div>
            
            {/* Python Example */}
            <div className="code-block bg-[#1e1e1e] rounded-xl p-6 overflow-hidden shadow-xl">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-white/50 text-sm ml-2">Python</span>
              </div>
              <pre className="text-white/90 font-mono text-sm leading-relaxed">
                <code>
                  <div className="code-line"># Import the WorldAPI client library</div>
                  <div className="code-line">from worldapi import WorldAPI</div>
                  <div className="code-line"></div>
                  <div className="code-line"># Initialize the client</div>
                  <div className="code-line">client = WorldAPI(</div>
                  <div className="code-line">    api_key="your_api_key_here",</div>
                  <div className="code-line">    environment="production"</div>
                  <div className="code-line">)</div>
                  <div className="code-line"></div>
                  <div className="code-line"># Connect to the API</div>
                  <div className="code-line">def connect_to_world_api():</div>
                  <div className="code-line">    try:</div>
                  <div className="code-line">        connection = client.connect()</div>
                  <div className="code-line">        print(f"Connected: {'{'}connection.status{'}'}")</div>
                  <div className="code-line">        </div>
                  <div className="code-line">        # Fetch data</div>
                  <div className="code-line">        data = client.get_data("users")</div>
                  <div className="code-line">        print(f"Data: {'{'}data{'}'}")</div>
                  <div className="code-line">    except Exception as e:</div>
                  <div className="code-line">        print(f"Error: {'{'}str(e){'}'}")</div>
                  <div className="code-line"></div>
                  <div className="code-line">if __name__ == "__main__":</div>
                  <div className="code-line">    connect_to_world_api()</div>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-20 bg-gradient-to-b from-dark to-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to <span className="text-secondary">Connect</span>?</h2>
          <p className="text-xl mb-10 text-white/70 max-w-2xl mx-auto">
            Start integrating with WorldAPI today and experience the power of
            seamless API connectivity. Our platform makes it easy to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/how-it-works" className="btn-outline btn text-lg">
              Learn More
            </Link>
            <Link to="/tisai" className="btn-primary btn text-lg">
              Launch TisAi
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default IntegrationPage; 