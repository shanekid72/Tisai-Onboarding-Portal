import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Steps for connection process with shorter delays for faster demonstration
const connectionSteps = [
  { label: "Western Union", delay: 600 },
  { label: "TerraPay", delay: 1200 },
  { label: "Ria", delay: 1800 },
  { label: "Syncing with Banks...", delay: 2400 },
  { label: "Enabling Stablecoin Settlements...", delay: 3000 },
  { label: "Authenticating access...", delay: 3600 },
];

interface ConnectToWorldAPIProps {
  onConnectionComplete?: () => void;
}

const ConnectToWorldAPI: React.FC<ConnectToWorldAPIProps> = ({ onConnectionComplete }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [connected, setConnected] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const hasCalledComplete = useRef(false);

  // Force completion after absolute maximum time
  useEffect(() => {
    const forceCompleteTimeout = setTimeout(() => {
      console.log('⚠️ EMERGENCY: Force completing connection flow after timeout');
      if (!connected && !hasCalledComplete.current && onConnectionComplete) {
        setCompletedSteps([0, 1, 2, 3, 4, 5]);
        setConnected(true);
        hasCalledComplete.current = true;
        onConnectionComplete();
      }
    }, 15000); // 15 seconds absolute maximum
    
    return () => clearTimeout(forceCompleteTimeout);
  }, [connected, onConnectionComplete]);

  // Log completion state to help debug
  useEffect(() => {
    if (connected && onConnectionComplete && !hasCalledComplete.current) {
      console.log('Connection established, will call completion callback soon');
    }
  }, [connected, onConnectionComplete]);

  // Start connection process on mount
  useEffect(() => {
    console.log('ConnectToWorldAPI mounted, starting connection process');
    
    // Start the connection process
    startConnectionProcess();
    
    return () => {
      // Clean up any timers
      console.log('Cleaning up connection timers:', timeoutsRef.current.length);
      timeoutsRef.current.forEach(id => window.clearTimeout(id));
    };
  }, []);

  const startConnectionProcess = () => {
    let totalDelay = 0;
    
    connectionSteps.forEach((step, index) => {
      totalDelay = step.delay;
      
      const timeout = window.setTimeout(() => {
        console.log(`Completing connection step ${index + 1}/${connectionSteps.length}: ${step.label}`);
        setCompletedSteps(prev => [...prev, index]);
        
        if (index === connectionSteps.length - 1) {
          const finalTimeout = window.setTimeout(() => {
            console.log('All connection steps completed, setting connected state');
            setConnected(true);
            
            if (onConnectionComplete) {
              const completeTimeout = window.setTimeout(() => {
                console.log('Calling connection complete callback');
                hasCalledComplete.current = true;
                onConnectionComplete();
              }, 1500); // Reduced from 2000 to make it faster
              timeoutsRef.current.push(completeTimeout);
            }
          }, 800); // Reduced from 1000 to make it faster
          timeoutsRef.current.push(finalTimeout);
        }
      }, step.delay);
      
      timeoutsRef.current.push(timeout);
    });
    
    // Safety fallback - if something fails, ensure we still complete
    const safetyTimeout = window.setTimeout(() => {
      if (!connected && !hasCalledComplete.current && onConnectionComplete) {
        console.log('Safety fallback triggered - connection process took too long');
        setConnected(true);
        hasCalledComplete.current = true;
        onConnectionComplete();
      }
    }, totalDelay + 5000); // 5 seconds after the last expected step
    
    timeoutsRef.current.push(safetyTimeout);
  };

  return (
    <div className="w-full h-screen bg-black text-cyan-400 flex flex-col items-center justify-center font-mono relative overflow-hidden">
      {/* Static background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 5 + 2 + 'px',
              height: Math.random() * 5 + 2 + 'px',
              backgroundColor: ['#00d8ff', '#6366f1', '#a21caf', '#4f46e5'][Math.floor(Math.random() * 4)],
              boxShadow: `0 0 10px ${['#00d8ff', '#6366f1', '#a21caf', '#4f46e5'][Math.floor(Math.random() * 4)]}`,
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.7 + 0.3,
              animation: `float ${Math.floor(Math.random() * 10 + 10)}s ease-in-out ${Math.random() * 5}s infinite alternate`
            }}
          />
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {isConnecting && !connected && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-black via-purple-950 to-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xl text-cyan-400 mb-6">Connecting to MTOs...</div>
            <div className="space-y-3">
              {connectionSteps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 p-2 rounded-md transition-all duration-300 ${
                    completedSteps.includes(index) ? 'bg-gradient-to-r from-green-400/20 to-blue-500/20' : ''
                  }`}
                >
                  <div className="w-6 h-6 flex-shrink-0">
                    {!completedSteps.includes(index) ? (
                      <div className="w-6 h-6 border-2 border-cyan-400 rounded-full animate-spin border-r-transparent"></div>
                    ) : (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs">✓</div>
                    )}
                  </div>
                  <div className={`${completedSteps.includes(index) ? 'text-green-300 font-medium' : 'text-blue-300'}`}>
                    {step.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Simple glow effect with CSS */}
            <div className="absolute inset-0" style={{ zIndex: -1 }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
          </motion.div>
        )}

        {connected && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            key="connected"
          >
            <motion.h1 
              className="text-4xl text-green-400 mb-6 font-bold"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                duration: 0.7,
                opacity: { duration: 0.5 }
              }}
            >
              &gt;&gt;&gt; CONNECTION ESTABLISHED &lt;&lt;&lt;
            </motion.h1>
            <motion.p 
              className="mt-4 text-xl text-blue-300 font-medium"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Welcome to World API.
            </motion.p>
            
            {/* Simple success animation with CSS */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: -1 }}>
              <div className="w-20 h-20 rounded-full bg-green-500 animate-ping opacity-75"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add keyframes for float animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(15px, -15px); }
            50% { transform: translate(-15px, 15px); }
            75% { transform: translate(15px, 15px); }
          }
        `}
      </style>
    </div>
  );
};

export default ConnectToWorldAPI; 