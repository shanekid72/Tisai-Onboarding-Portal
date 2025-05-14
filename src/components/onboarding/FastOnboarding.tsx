import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import Folder from '../ui/Folder';
import ConnectToWorldAPI from './ConnectToWorldAPI';

// Define types for form data
type UserInfo = {
  name: string;
  organization: string;
  email: string;
};

type OnboardingStage = 'welcome' | 'questions' | 'connecting' | 'success' | 'config' | 'mcp-config' | 'mcp-options';

interface FastOnboardingProps {
  onComplete?: (userInfo: UserInfo) => void;
}

const FastOnboarding: React.FC<FastOnboardingProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<OnboardingStage>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    organization: '',
    email: '',
  });
  const [inputValue, setInputValue] = useState('');

  // Questions for the form
  const questions = [
    { id: 'name', label: "1️⃣ What's your name?", key: 'name' as keyof UserInfo },
    { id: 'organization', label: "2️⃣ What's your organization name?", key: 'organization' as keyof UserInfo },
    { id: 'email', label: "3️⃣ Where can I reach you or send the confetti? (e.g., your email)", key: 'email' as keyof UserInfo },
  ];

  // Simplified welcome screen animation
  useEffect(() => {
    if (stage === 'welcome') {
      // Using a simpler animation approach
      gsap.set(['.welcome-title', '.welcome-message', '.get-started-btn'], { opacity: 0 });
      
      // Run animations with shorter durations
      gsap.to('.welcome-title', { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to('.welcome-message', { opacity: 1, duration: 0.3, delay: 0.1 });
      gsap.to('.get-started-btn', { opacity: 1, y: 0, duration: 0.3, delay: 0.2 });
    }
  }, [stage]);

  // At the top of the component to retrieve stored stage
  useEffect(() => {
    // Check if we're already connected and should be showing the config page
    const storedStage = sessionStorage.getItem('fast_onboarding_stage');
    if (storedStage === 'config') {
      console.log('Restoring config stage from session storage');
      setStage('config');
    }
  }, []);

  // Add new useEffect at top of component
  useEffect(() => {
    // On mount, immediately check if we're in post-connection state (also check local storage)
    const isConnected = sessionStorage.getItem('worldapi_connected');
    const configStage = sessionStorage.getItem('fast_onboarding_stage');
    
    // If already connected, force the config stage
    if (isConnected === 'true' && configStage === 'config') {
      console.log('🚨 Detected connected state, forcing config stage display immediately');
      // Force immediate display without animation delay
      window.setTimeout(() => {
        setStage('config');
      }, 0);
    }
  }, []);

  // Handle connection completion - called after animation finishes
  const handleConnectionComplete = useCallback(() => {
    console.log('Connection complete, proceeding to config stage...');
    
    // Save stage in session storage to persist through rerenders
    sessionStorage.setItem('fast_onboarding_stage', 'config');
    sessionStorage.setItem('worldapi_connected', 'true');
    
    // Set stage to config
    setStage('config');
    
    // We'll avoid calling the parent callback directly to prevent state cycling
    if (onComplete) {
      try {
        // Store user info
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
        sessionStorage.setItem('onboardingMode', 'fast-track');
        
        console.log('User data saved, config stage set - NOT notifying parent to avoid re-render');
        // Intentionally not calling onComplete to avoid re-renders
      } catch (error) {
        console.error('Error in completion process:', error);
      }
    }
  }, [onComplete, userInfo]);

  // Override for stage changes - persist to session storage
  const setStageWithStorage = (newStage: OnboardingStage) => {
    console.log(`Setting stage to: ${newStage}`);
    sessionStorage.setItem('fast_onboarding_stage', newStage);
    setStage(newStage);
  };

  // Modified handlers
  const handleGetStarted = useCallback(() => {
    setStageWithStorage('questions');
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  // Handle form submission for each question
  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (inputValue.trim() === '') return;
    
    const currentKey = questions[currentQuestion].key;
    setUserInfo(prev => ({ ...prev, [currentKey]: inputValue }));
    setInputValue('');
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStageWithStorage('connecting');
    }
  }, [currentQuestion, inputValue, questions]);

  // Handle connection button click
  const handleConnectButtonClick = useCallback(() => {
    setStageWithStorage('success');
  }, []);

  // Motion variants for animations (optimized)
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatePresence mode="wait">
        {/* Welcome Screen */}
        {stage === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="container mx-auto px-4 py-16 max-w-3xl"
          >
            <div className="text-center">
              <h1 className="welcome-title text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Welcome to World API
              </h1>
              
              <div className="welcome-message space-y-6 mb-12">
                <p className="text-xl">
                  Hi there! I'm <span className="font-bold text-purple-400">TisAI</span> from <span className="font-bold text-blue-400">Digit 9</span>.
                </p>
                <p className="text-lg text-gray-300">
                  <span className="font-bold text-cyan-400">Welcome to World API</span> – the API you can talk to. Let's get you onboarded quickly.
                </p>
              </div>
              
              <button
                onClick={handleGetStarted}
                className="get-started-btn bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}

        {/* Questions Screen */}
        {stage === 'questions' && (
          <motion.div
            key="questions"
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="container mx-auto px-4 py-16 max-w-2xl"
          >
            <div className="bg-gray-900 rounded-xl p-8 shadow-lg border border-purple-900/50">
              <h2 className="text-2xl font-semibold mb-8 text-center">
                I'll need a few basic details to get started.
              </h2>

              <div className="mb-8">
                {/* Display filled questions */}
                {questions.slice(0, currentQuestion).map((q, idx) => (
                  <div key={q.id} className="mb-6">
                    <p className="text-gray-400 mb-1">{q.label}</p>
                    <p className="text-xl font-medium text-purple-400">{userInfo[q.key]}</p>
                  </div>
                ))}

                {/* Current question */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor={questions[currentQuestion].id} className="block mb-2 text-lg">
                      {questions[currentQuestion].label}
                    </label>
                    <input
                      type="text"
                      id={questions[currentQuestion].id}
                      value={inputValue}
                      onChange={handleInputChange}
                      autoFocus
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      placeholder="Type your answer here..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg py-3 font-medium hover:shadow-lg transition-all"
                  >
                    {currentQuestion < questions.length - 1 ? 'Continue' : 'Complete'}
                  </button>
                </form>
              </div>

              {/* Progress indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-10 rounded-full ${
                      idx <= currentQuestion ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Connecting Screen - shows connect button */}
        {stage === 'connecting' && (
          <motion.div
            key="connecting"
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="container mx-auto px-4 py-16 max-w-3xl text-center"
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              🎉 Great, thanks for providing your information!
            </h2>
            
            <p className="text-xl text-gray-300 mb-12">
              You're just <span className="font-bold text-cyan-400">one step away</span> from accessing <span className="font-bold text-purple-400">worldAPI</span>.
            </p>
            
            <div className="flex flex-col items-center justify-center mb-8">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleConnectButtonClick}
                className="bg-purple-700 text-white text-xl px-8 py-4 rounded-2xl shadow-lg shadow-purple-700/30 border-2 border-purple-400"
              >
                CONNECT TO WORLD API
              </motion.button>
              <p className="text-gray-400 mt-4">👇 When you're ready, click the button to initiate the connection process.</p>
            </div>
          </motion.div>
        )}

        {/* Connection Animation */}
        {stage === 'success' && (
          <ConnectToWorldAPI onConnectionComplete={handleConnectionComplete} />
        )}

        {/* Config/Success Screen - after connection is established */}
        {stage === 'config' && (
          <motion.div
            key="config"
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto px-4 py-16 max-w-3xl text-center"
          >
            <div className="bg-gray-900 rounded-xl p-8 shadow-xl border border-cyan-900/30">
              <div className="mb-8">
                <span className="text-4xl mb-4 inline-block">🚀</span>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Success!
                </h2>
                <p className="text-xl text-gray-300">
                  Boom! You're through the boring part and officially in the big leagues. You're now ready to explore WorldAPI.
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400 mr-2">📁</span>
                  <h3 className="text-lg font-medium">Download your WorldAPI config file:</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4 mb-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download MCP.json
                  </button>
                  
                  <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-6 py-3">
                    View Config
                  </button>
                </div>
                
                <p className="text-sm text-gray-400 mt-2">
                  Save that file — it's basically the passport to my API playground.
                </p>
              </div>
              
              <h3 className="text-xl font-medium mb-4">Choose your mode:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg py-4 font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center"
                  onClick={() => {
                    sessionStorage.setItem('clicked_vibe_coding', 'true');
                    setStageWithStorage('mcp-options');
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Vibe Coding
                </button>
                
                <button className="bg-white/10 text-white rounded-lg py-4 font-medium hover:bg-white/15 transition-all flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Old School Mode
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* MCP Config for Cursor Screen */}
        {stage === 'mcp-config' && (
          <motion.div
            key="mcp-config"
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto px-4 py-16 max-w-4xl"
          >
            <div className="bg-gray-900 rounded-xl p-8 shadow-xl border border-cyan-900/30">
              <h2 className="text-3xl font-bold mb-6 text-center text-white">MCP Config for Cursor</h2>
              
              <p className="text-lg text-gray-300 text-center mb-8">
                Follow these steps to configure MCP in Cursor IDE:
              </p>
              
              <ol className="space-y-4 mb-8 text-left">
                <li className="flex items-baseline gap-4">
                  <span className="text-lg font-bold text-white">1.</span>
                  <span className="text-gray-300">Open Cursor Settings → MCP → Add New MCP</span>
                </li>
                <li className="flex items-baseline gap-4">
                  <span className="text-lg font-bold text-white">2.</span>
                  <span className="text-gray-300">Copy the contents of your downloaded MCP.json file into the provided input field.</span>
                </li>
                <li className="flex items-baseline gap-4">
                  <span className="text-lg font-bold text-white">3.</span>
                  <span className="text-gray-300">Alternatively, create a folder named <code className="bg-gray-800 px-2 py-1 rounded">.cursor</code> in your project's root directory (if it doesn't already exist), then copy the MCP.json file into that folder.</span>
                </li>
              </ol>
              
              <h3 className="text-2xl font-bold mb-4 text-center text-white">Cursor Prompts</h3>
              
              <div className="space-y-6 mb-6">
                <div>
                  <p className="text-center text-gray-400 mb-2">Prompt 1:</p>
                  <div className="bg-gray-950 p-4 rounded-lg relative group">
                    <pre className="text-white overflow-x-auto whitespace-pre-wrap">integrate worldapi endpoints to my back end use tool @integrate_worldapi</pre>
                    <button 
                      onClick={() => navigator.clipboard.writeText('integrate worldapi endpoints to my back end use tool @integrate_worldapi')}
                      className="absolute top-2 right-2 p-1 rounded bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                      </svg>
                    </button>
                  </div>
                  <p className="text-center text-gray-500 mt-2">When prompted by the tool, confirm to proceed.</p>
                </div>
                
                <div>
                  <p className="text-center text-gray-400 mb-2">Prompt 2:</p>
                  <div className="bg-gray-950 p-4 rounded-lg relative group">
                    <pre className="text-white overflow-x-auto text-sm whitespace-pre-wrap">Create a new page with name 'Send Money' keeping the same UI theme as home page in my frond end application. The new page should progress in four stages where the first stage is 'create quote' with a field to enter amount(sending_amount) and on clicking create quote, the quote api is called with the entered amount. The sending_currency_code and receiving_currency_code also should be displayed in the initial section. After successful api call, progress moves to 'Create Transaction' stage where quote_id is prepopulated from quote response. In this stage, create transaction api needs to be called and there should be input fields 'Receiver Name', 'Mobile Number', 'Account Number' mapped to parameters first_name, mobile_number and account_number respectively for create transaction API. Then there weill be a button that on click calls the create transaction backend api with values from the above inputfields mapped. On success it moves to next stage which is 'Confirm Transaction'. In this stage 'transaction_ref_number' from previous create transaction is displayed. A message in bold should say 'Cash collected' with a check box. Now there will be a button to proceed and on clicking, it goes to next stage on success. Next Stage is inquire status , where the previous transaction_ref_number is displayed and on clicking next button, the enquire-transaction api is called and on success entire response is displayed.</pre>
                    <button 
                      onClick={() => navigator.clipboard.writeText("Create a new page with name 'Send Money' keeping the same UI theme as home page in my frond end application. The new page should progress in four stages where the first stage is 'create quote' with a field to enter amount(sending_amount) and on clicking create quote, the quote api is called with the entered amount. The sending_currency_code and receiving_currency_code also should be displayed in the initial section. After successful api call, progress moves to 'Create Transaction' stage where quote_id is prepopulated from quote response. In this stage, create transaction api needs to be called and there should be input fields 'Receiver Name', 'Mobile Number', 'Account Number' mapped to parameters first_name, mobile_number and account_number respectively for create transaction API. Then there weill be a button that on click calls the create transaction backend api with values from the above inputfields mapped. On success it moves to next stage which is 'Confirm Transaction'. In this stage 'transaction_ref_number' from previous create transaction is displayed. A message in bold should say 'Cash collected' with a check box. Now there will be a button to proceed and on clicking, it goes to next stage on success. Next Stage is inquire status , where the previous transaction_ref_number is displayed and on clicking next button, the enquire-transaction api is called and on success entire response is displayed.")}
                      className="absolute top-2 right-2 p-1 rounded bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-green-400 text-center my-6">Upon completion, all WorldAPI endpoints will be available in your backend.</p>
              
              <div className="flex justify-center">
                <button 
                  onClick={() => setStageWithStorage('config')}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-6 py-3"
                >
                  Back to options
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* MCP Configuration Options */}
        {stage === 'mcp-options' && (
          <motion.div
            key="mcp-options"
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto px-4 py-16 max-w-3xl"
          >
            <div className="bg-gray-900 rounded-xl p-8 shadow-xl border border-cyan-900/30">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">MCP Configuration Options</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button 
                  onClick={() => setStageWithStorage('mcp-config')}
                  className="bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-6 px-4 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  MCP Config (Cursor)
                </button>
                
                <button className="bg-gray-800 hover:bg-gray-700 text-white rounded-xl py-6 px-4 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  MCP Config (Windsurf)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FastOnboarding; 