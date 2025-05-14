import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { createSplitTextAnimation } from '../utils/gsapInit';
import { shouldUseAdvancedAnimations } from '../utils/webglErrorHandler';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// Product categories data
const productCategories = {
  // Take Off category (red/orange theme)
  "rapid-integration": {
    category: "take-off",
    categoryName: "Take Off",
    title: "Rapid Integration API",
    subtitle: "Quick-start your development with seamless integration",
    description: "Get your project off the ground quickly with our Rapid Integration API. This solution accelerates your development cycle by eliminating complex setup procedures and offering pre-built connectors for most popular platforms and services.",
    image: "/assets/rapid-integration.svg",
    effects: ["Accelerated Development", "Enhanced Productivity", "Creative Solutions"],
    specs: [
      { name: "Response Time", value: "50ms" },
      { name: "Requests/sec", value: "10,000" },
      { name: "Endpoints", value: "125+" },
      { name: "Languages", value: "12" }
    ],
    features: [
      "One-click authentication setup",
      "Auto-generated client libraries",
      "Intelligent request caching",
      "Real-time monitoring dashboard",
      "Interactive documentation"
    ],
    color: "from-red-500 to-orange-500",
    bgColor: "bg-gradient-to-br from-red-900/20 to-orange-800/20"
  },
  "data-transformer": {
    category: "take-off",
    categoryName: "Take Off",
    title: "Data Transformer",
    subtitle: "Transform your data into actionable insights with minimal effort",
    description: "Our Data Transformer API processes, cleans, and enriches your raw data in real-time, preparing it for immediate use in your applications. Advanced machine learning algorithms automatically detect patterns and suggest optimizations.",
    image: "/assets/data-transformer.svg",
    effects: ["Data Enhancement", "Real-time Processing", "Strategic Analytics"],
    specs: [
      { name: "Throughput", value: "5GB/min" },
      { name: "Formats", value: "JSON, CSV, XML, AVRO" },
      { name: "ML Models", value: "24" },
      { name: "Retention", value: "30 days" }
    ],
    features: [
      "Schema inference and validation",
      "Custom transformation pipelines",
      "Anomaly detection",
      "Data quality scoring",
      "Automated data cleansing"
    ],
    color: "from-red-500 to-orange-500",
    bgColor: "bg-gradient-to-br from-red-900/20 to-orange-800/20"
  },
  "developer-boost": {
    category: "take-off",
    categoryName: "Take Off",
    title: "Developer Boost",
    subtitle: "Supercharge your development workflow with AI-powered assistance",
    description: "Developer Boost integrates into your IDE and CI/CD pipeline to provide intelligent code suggestions, automated testing, and performance optimization. It learns from your team's coding patterns to deliver increasingly relevant assistance.",
    image: "/assets/developer-boost.svg",
    effects: ["Code Acceleration", "Intelligent Suggestions", "Workflow Optimization"],
    specs: [
      { name: "IDE Support", value: "VS Code, IntelliJ, Eclipse" },
      { name: "Languages", value: "25+" },
      { name: "Accuracy", value: "94%" },
      { name: "Response", value: "<100ms" }
    ],
    features: [
      "Contextual code completion",
      "Automated code review",
      "Performance bottleneck detection",
      "Security vulnerability scanning",
      "Technical debt monitoring"
    ],
    color: "from-red-500 to-orange-500",
    bgColor: "bg-gradient-to-br from-red-900/20 to-orange-800/20"
  },
  
  // Touch Down category (blue theme)
  "stability-suite": {
    category: "touch-down",
    categoryName: "Touch Down",
    title: "Stability Suite",
    subtitle: "Maintain system balance with our comprehensive stability tools",
    description: "Our Stability Suite ensures your systems remain operational under any load conditions. Advanced load balancing, auto-scaling, and self-healing capabilities work together to maintain optimal performance even during traffic spikes.",
    image: "/assets/stability-suite.svg",
    effects: ["Error Reduction", "Consistent Performance", "Peace of Mind"],
    specs: [
      { name: "Uptime", value: "99.99%" },
      { name: "Recovery", value: "<3 seconds" },
      { name: "Monitoring", value: "24/7" },
      { name: "Alerts", value: "Real-time" }
    ],
    features: [
      "Predictive auto-scaling",
      "Circuit breaking patterns",
      "Intelligent request retries",
      "Graceful degradation",
      "Cross-region redundancy"
    ],
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-gradient-to-br from-blue-900/20 to-indigo-800/20"
  },
  "secure-connect": {
    category: "touch-down",
    categoryName: "Touch Down",
    title: "Secure Connect",
    subtitle: "End-to-end encrypted connections for your most sensitive data",
    description: "Secure Connect provides military-grade encryption for all your data transfers, both at rest and in transit. With automated compliance checks and detailed audit logs, you can confidently handle even the most sensitive information.",
    image: "/assets/secure-connect.svg",
    effects: ["Enhanced Security", "Regulatory Compliance", "Data Protection"],
    specs: [
      { name: "Encryption", value: "AES-256" },
      { name: "Certifications", value: "SOC2, HIPAA, GDPR" },
      { name: "Auth Methods", value: "OAuth, SAML, MFA" },
      { name: "Audit Trail", value: "Immutable" }
    ],
    features: [
      "Zero-knowledge authentication",
      "Automatic compliance monitoring",
      "Anomalous access detection",
      "Data loss prevention",
      "Configurable retention policies"
    ],
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-gradient-to-br from-blue-900/20 to-indigo-800/20"
  },
  "integration-harmony": {
    category: "touch-down",
    categoryName: "Touch Down",
    title: "Integration Harmony",
    subtitle: "Smooth integration with existing systems without disruption",
    description: "Integration Harmony creates a bridge between your legacy systems and modern applications. Its adaptive connectors automatically handle data format translations, ensuring smooth communication without requiring changes to your existing infrastructure.",
    image: "/assets/integration-harmony.svg",
    effects: ["Seamless Compatibility", "Minimal Downtime", "Legacy Support"],
    specs: [
      { name: "Legacy Systems", value: "30+ types" },
      { name: "Migration Time", value: "Reduced by 70%" },
      { name: "Data Integrity", value: "100%" },
      { name: "Downtime", value: "Zero" }
    ],
    features: [
      "Bi-directional sync adaptors",
      "Protocol translation",
      "Incremental migration",
      "Schema mapping assistant",
      "Integration health monitoring"
    ],
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-gradient-to-br from-blue-900/20 to-indigo-800/20"
  },
  
  // High Point category (green theme)
  "ai-accelerator": {
    category: "high-point",
    categoryName: "High Point",
    title: "AI Accelerator",
    subtitle: "Implement advanced AI capabilities with minimal development effort",
    description: "AI Accelerator provides pre-trained models and simplified interfaces that make incorporating artificial intelligence into your applications straightforward. From natural language processing to computer vision, deploy powerful AI features in minutes rather than months.",
    image: "/assets/ai-accelerator.svg",
    effects: ["Intelligent Automation", "Predictive Analytics", "Cognitive Processing"],
    specs: [
      { name: "Pre-trained Models", value: "50+" },
      { name: "Custom Training", value: "80% less data" },
      { name: "Inference Speed", value: "15-30ms" },
      { name: "Accuracy", value: "State-of-the-art" }
    ],
    features: [
      "One-line model deployment",
      "Transfer learning optimization",
      "Automated hyperparameter tuning",
      "Model performance monitoring",
      "Explainable AI tools"
    ],
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-gradient-to-br from-green-900/20 to-emerald-800/20"
  },
  "global-scale": {
    category: "high-point",
    categoryName: "High Point",
    title: "Global Scale",
    subtitle: "Scale your applications globally without performance degradation",
    description: "Global Scale distributes your application across our worldwide network of edge servers, ensuring users from any location experience optimal performance. Intelligent routing and caching mechanisms dramatically reduce latency and bandwidth costs.",
    image: "/assets/global-scale.svg",
    effects: ["Worldwide Reach", "Consistent Experience", "Load Balancing"],
    specs: [
      { name: "Edge Locations", value: "250+" },
      { name: "CDN Performance", value: "99.9th percentile" },
      { name: "Cache Hit Ratio", value: "95%+" },
      { name: "Global Latency", value: "<50ms" }
    ],
    features: [
      "Geo-distributed data storage",
      "Intelligent request routing",
      "Adaptive content optimization",
      "Traffic surge protection",
      "Multi-region failover"
    ],
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-gradient-to-br from-green-900/20 to-emerald-800/20"
  },
  "insight-engine": {
    category: "high-point",
    categoryName: "High Point",
    title: "Insight Engine",
    subtitle: "Extract meaningful insights from your data in real-time",
    description: "Insight Engine continuously analyzes your data streams to identify patterns, anomalies, and opportunities. Its powerful visualization tools make complex information immediately understandable, enabling faster and more informed decision-making.",
    image: "/assets/insight-engine.svg",
    effects: ["Data Discovery", "Pattern Recognition", "Business Intelligence"],
    specs: [
      { name: "Data Sources", value: "Unlimited" },
      { name: "Processing", value: "Real-time" },
      { name: "Visualizations", value: "50+ types" },
      { name: "Export Formats", value: "12" }
    ],
    features: [
      "Automated insight generation",
      "Anomaly detection",
      "Trend prediction",
      "Interactive dashboards",
      "Natural language querying"
    ],
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-gradient-to-br from-green-900/20 to-emerald-800/20"
  }
};

// Define types
type ProductID = keyof typeof productCategories;

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const featureListRef = useRef<HTMLUListElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [useAdvancedAnimations] = useState(shouldUseAdvancedAnimations());
  
  // Get product data or redirect if not found
  const productData = productId && productCategories[productId as ProductID];
  
  useEffect(() => {
    if (!productData || !headerRef.current) return;
    
    // Create a context for all animations
    const ctx = gsap.context(() => {
      // Main timeline for animations
      const mainTl = gsap.timeline();
      
      // Header animation
      if (headerRef.current) {
        if (useAdvancedAnimations) {
          // Animate the product title with SplitText
          const titleElement = headerRef.current.querySelector('.product-title');
          if (titleElement) {
            const titleAnimation = createSplitTextAnimation(titleElement, {
              animation: {
                opacity: 0,
                y: 50,
                stagger: 0.02,
                duration: 0.8,
                ease: "back.out(1.7)"
              }
            });
            
            if (titleAnimation) {
              mainTl.add(titleAnimation);
            }
          }
          
          // Animate other header elements
          mainTl.from(headerRef.current.querySelector('.product-subtitle'), {
            opacity: 0,
            y: 30,
            duration: 0.8
          }, "-=0.5")
          .from(headerRef.current.querySelector('.product-image'), {
            opacity: 0,
            scale: 0.9,
            duration: 1,
            ease: "power3.out"
          }, "-=0.6");
        } else {
          // Simplified animations
          mainTl.from(headerRef.current.querySelectorAll('.animate-in'), {
            opacity: 0,
            y: 30,
            stagger: 0.2,
            duration: 0.8
          });
        }
      }
      
      // Content animations
      if (contentRef.current) {
        ScrollTrigger.create({
          trigger: contentRef.current,
          start: "top 80%",
          animation: gsap.from(contentRef.current, {
            opacity: 0,
            y: 50,
            duration: 0.8
          })
        });
      }
      
      // Feature list animations
      if (featureListRef.current) {
        ScrollTrigger.create({
          trigger: featureListRef.current,
          start: "top 80%",
          animation: gsap.from(featureListRef.current.querySelectorAll('li'), {
            opacity: 0,
            x: -30,
            stagger: 0.1,
            duration: 0.6,
            ease: "power2.out"
          })
        });
      }
      
      // Specs animations
      if (specsRef.current) {
        ScrollTrigger.create({
          trigger: specsRef.current,
          start: "top 80%",
          animation: gsap.from(specsRef.current.querySelectorAll('.spec-item'), {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.6
          })
        });
      }
      
      // CTA animations
      if (ctaRef.current) {
        ScrollTrigger.create({
          trigger: ctaRef.current,
          start: "top 80%",
          animation: gsap.from(ctaRef.current, {
            opacity: 0,
            y: 30,
            duration: 0.8
          })
        });
      }
      
      // Background parallax
      if (useAdvancedAnimations) {
        gsap.utils.toArray('.parallax-bg').forEach((el: any) => {
          gsap.to(el, {
            y: () => -100,
            ease: "none",
            scrollTrigger: {
              trigger: "body",
              start: "top top",
              end: "bottom top",
              scrub: true
            }
          });
        });
      }
    });
    
    // Cleanup function
    return () => ctx.revert();
  }, [productData, useAdvancedAnimations]);
  
  if (!productData) {
    return (
      <div className="min-h-screen bg-dark text-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-8">The product you're looking for doesn't exist or has been moved.</p>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`product-detail-page min-h-screen text-light ${productData.bgColor}`}>
      <Navbar />
      
      {/* Hero section with product image and title */}
      <header 
        ref={headerRef}
        className="relative min-h-[70vh] flex items-center overflow-hidden pt-20"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="w-full md:w-1/2 md:order-2">
              <div className="product-image rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                <img 
                  src={productData.image} 
                  alt={productData.title} 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/2 md:order-1 text-center md:text-left">
              <Link 
                to="/products" 
                className={`inline-block mb-4 py-1 px-4 rounded-full text-sm bg-white/10 hover:bg-white/20 
                          transition-all ${productData.category === 'take-off' ? 'text-red-400' : 
                                         productData.category === 'touch-down' ? 'text-blue-400' : 'text-green-400'}`}
              >
                {productData.categoryName}
              </Link>
              
              <h1 className="product-title text-5xl md:text-7xl font-bold mb-6 animate-in">
                <span className={`bg-gradient-to-r ${productData.color} bg-clip-text text-transparent`}>
                  {productData.title}
                </span>
              </h1>
              
              <p className="product-subtitle text-xl md:text-2xl text-white/80 mb-8 animate-in">
                {productData.subtitle}
              </p>
              
              <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
                {productData.effects.map((effect, index) => (
                  <span 
                    key={index} 
                    className="py-1 px-4 rounded-full bg-white/10 text-white/80 text-sm"
                  >
                    {effect}
                  </span>
                ))}
              </div>
              
              <button 
                className={`btn py-3 px-8 rounded-full bg-gradient-to-r ${productData.color} 
                          text-white shadow-lg shadow-${productData.color.split('-')[1]}/20 animate-in`}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className={`parallax-bg absolute w-[50vw] h-[50vw] rounded-full blur-3xl opacity-30 
                       bg-gradient-to-r ${productData.color} ${productData.category === 'take-off' ? '-top-[25vw] right-[10vw]' :
                                                           productData.category === 'touch-down' ? 'top-[10vw] -right-[25vw]' :
                                                           'top-[5vw] -left-[25vw]'}`}></div>
          <div className={`absolute w-full h-1/3 bottom-0 bg-gradient-to-t from-black/30 to-transparent`}></div>
        </div>
      </header>
      
      {/* Product description section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div ref={contentRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 mb-16">
              <h2 className="text-3xl font-bold mb-6">About {productData.title}</h2>
              <p className="text-xl text-white/80 leading-relaxed">
                {productData.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Features list */}
              <div className="features bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6">Key Features</h3>
                <ul ref={featureListRef} className="space-y-4">
                  {productData.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className={`mt-1 inline-block w-5 h-5 rounded-full flex-shrink-0 
                                     bg-gradient-to-r ${productData.color}`}></span>
                      <span className="text-lg text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Specifications */}
              <div ref={specsRef} className="specifications bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6">Specifications</h3>
                <div className="grid grid-cols-1 gap-4">
                  {productData.specs.map((spec, index) => (
                    <div key={index} className="spec-item flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/70">{spec.name}</span>
                      <span className={`font-bold text-lg bg-gradient-to-r ${productData.color} bg-clip-text text-transparent`}>
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative" ref={ctaRef}>
        <div className="container mx-auto px-4 text-center">
          <div className={`max-w-3xl mx-auto bg-gradient-to-r ${productData.color} bg-opacity-10 
                      rounded-3xl p-12 border border-white/10 backdrop-blur-md`}>
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Integrate {productData.title} into your workflow today and experience the difference it makes to your development process.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn py-3 px-8 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all">
                Try it Free
              </button>
              <button className="btn py-3 px-8 bg-black/30 text-white border border-white/20 rounded-full hover:bg-black/50 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className={`parallax-bg absolute w-[30vw] h-[30vw] rounded-full blur-3xl opacity-20 
                       bg-gradient-to-r ${productData.color} ${productData.category === 'take-off' ? 'bottom-[10vw] left-[5vw]' :
                                                           productData.category === 'touch-down' ? 'bottom-[5vw] right-[10vw]' :
                                                           'bottom-[15vw] left-[15vw]'}`}></div>
        </div>
      </section>
      
      {/* Related products section */}
      <section className="py-20 relative bg-black/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">You might also like</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(productCategories)
              .filter(([id, product]) => id !== productId && product.category === productData.category)
              .slice(0, 3)
              .map(([id, product]) => (
                <Link 
                  key={id} 
                  to={`/products/${id}`}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 
                           transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                >
                  <div className="aspect-[5/3] overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                    <p className="text-white/70 mb-4">{product.subtitle}</p>
                    <span className={`inline-flex items-center gap-1 text-sm font-medium 
                                   bg-gradient-to-r ${product.color} bg-clip-text text-transparent`}>
                      Learn more
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ProductDetailPage; 