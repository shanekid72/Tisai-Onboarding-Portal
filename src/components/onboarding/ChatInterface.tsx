import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { gsap } from 'gsap';
import NDADownload from './NDADownload';
import NDAUpload from './NDAUpload';
import OnboardingProgress, { OnboardingStep } from './OnboardingProgress';
import KYCStep from './KYCStep';

interface Message {
  id: string;
  sender: 'user' | 'tisai';
  text: string;
  timestamp: Date;
}

// Define user data interface
interface UserData {
  name?: string;
  organization?: string;
  email?: string;
}

// Define conversation steps with more explicit typing
type ConversationStep = 
  | 'welcome'
  | 'name'
  | 'organization'
  | 'email'
  | 'api-questions'
  | 'nda-download'
  | 'nda-upload'
  | 'completed'
  | 'kyc';

const ChatInterface: React.FC = () => {
  const { state, downloadNDA, uploadNDA, moveToNextStep } = useOnboarding();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [showNDADownload, setShowNDADownload] = useState(false);
  const [showNDAUpload, setShowNDAUpload] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Audio toggle state
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Load stored user data from localStorage
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem('tisai_user_data');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
        console.log('Loaded user data from localStorage');
      }
    } catch (error) {
      console.error('Error loading stored user data:', error);
    }
  }, []);

  // Initial greeting message when component mounts
  useEffect(() => {
    console.log('Initializing chat with starting step:', state.currentStep);
    
    // Skip directly to current step if we're resuming a conversation
    if (state.currentStep !== 'welcome' && state.currentStep !== 'name') {
      console.log('Resuming conversation at step:', state.currentStep);
      
      // Load stored messages
      try {
        const storedMessages = localStorage.getItem('tisai_messages');
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          setMessages(parsedMessages);
          
          // Show NDA UI components if needed
          if (state.currentStep === 'nda-download') {
            setShowNDADownload(true);
          } else if (state.currentStep === 'nda-upload') {
            setShowNDAUpload(true);
          }
          
          return;
        }
      } catch (error) {
        console.error('Error loading stored messages:', error);
      }
    }
    
    // Default welcome message for new conversations
    const initialMessage = {
      id: '1',
      sender: 'tisai' as const,
      text: '👋 Welcome to TisAi WorldAPI Connect! I\'ll guide you through the complete setup process for integrating with WorldAPI. Let\'s start with some basic information. What\'s your name?',
      timestamp: new Date()
    };
    
    // Add initial message with typing effect
    setIsTyping(true);
    setTimeout(() => {
      setMessages([initialMessage]);
      setIsTyping(false);
      
      // Ensure we're at the name step for new conversations
      if (state.currentStep === 'welcome') {
        moveToNextStep();
      }
    }, 1000);
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Store messages in localStorage when they change
    try {
      localStorage.setItem('tisai_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error storing messages:', error);
    }
  }, [messages]);

  // Animation for message entry
  useEffect(() => {
    if (chatContainerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.message-item:last-child', {
          opacity: 0,
          y: 20,
          duration: 0.3,
          ease: 'power2.out'
        });
      }, chatContainerRef);
      
      return () => ctx.revert();
    }
  }, [messages]);

  // Helper function to update user data
  const updateUserData = (newData: Partial<UserData>) => {
    const updatedData = { ...userData, ...newData };
    setUserData(updatedData);
    
    // Store in localStorage
    try {
      localStorage.setItem('tisai_user_data', JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
    
    console.log('Updated user data:', updatedData);
    return updatedData;
  };
  
  const handleClose = () => {
    // Clear chat state when closing
    localStorage.removeItem('tisai_messages');
    localStorage.removeItem('tisai_user_data');
    navigate('/');
  };

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  // Reset the conversation
  const resetConversation = () => {
    // Clear localStorage
    localStorage.removeItem('tisai_messages');
    localStorage.removeItem('tisai_user_data');
    
    // Reset state
    setUserData({});
    moveToNextStep();
    setShowNDADownload(false);
    setShowNDAUpload(false);
    setMessages([{
      id: '1',
      sender: 'tisai',
      text: '👋 Welcome to TisAi WorldAPI Connect! I\'ll guide you through the complete setup process for integrating with WorldAPI. Let\'s start with some basic information. What\'s your name?',
      timestamp: new Date()
    }]);
    
    console.log('Conversation reset');
  };

  // Handle NDA download completion
  const handleNDADownload = () => {
    // Call the downloadNDA function from context
    downloadNDA();
    
    // Add a message that confirms the download
    const message: Message = {
      id: Date.now().toString(),
      sender: 'tisai',
      text: `Great! The NDA has been downloaded. Once you've reviewed and signed it, please upload the signed copy. Let me know when you're ready to upload.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    moveToNextStep();
  };

  // Handle NDA upload completion
  const handleNDAUpload = (file: File) => {
    // Call the uploadNDA function from context
    uploadNDA(file.name);
    
    // Add a message that confirms the upload
    const message: Message = {
      id: Date.now().toString(),
      sender: 'tisai',
      text: `Perfect! Your signed NDA (${file.name}) has been received. I'll now transfer you to our KYC process to complete the onboarding.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    setShowNDAUpload(false);
    
    // Move to the KYC step directly
    setTimeout(() => {
      console.log('Moving to KYC step in onboarding flow');
      moveToNextStep();
    }, 2000);
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    console.log(`User sent message: "${input}" in step: ${state.currentStep}`);
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simulate assistant thinking
    setIsTyping(true);
    
    // Process the message and determine appropriate response
    setTimeout(() => {
      generateResponse(userMessage);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (userMessage: Message) => {
    console.log(`Generating response for step: ${state.currentStep}, user message: "${userMessage.text}"`);
    
    let response: Message;
    const userText = userMessage.text.toLowerCase().trim();

    // Using explicit conversation steps to avoid message repetition
    switch (state.currentStep) {
      case 'welcome':
      case 'name':
        // Store user's name
        updateUserData({ name: userMessage.text });
        
        response = {
          id: Date.now().toString(),
          sender: 'tisai',
          text: `Great! Nice to meet you, ${userMessage.text}. What organization are you representing?`,
          timestamp: new Date()
        };
        moveToNextStep();
        console.log(`Name provided (${userMessage.text}), moving to step: organization`);
        break;

      case 'organization':
        // Store organization
        updateUserData({ organization: userMessage.text });
        
        response = {
          id: Date.now().toString(),
          sender: 'tisai',
          text: `Thanks for that information. Now, what's your email address so we can associate it with your WorldAPI account?`,
          timestamp: new Date()
        };
        moveToNextStep();
        console.log(`Organization provided (${userMessage.text}), moving to step: email`);
        break;
        
      case 'email':
        // Store email
        updateUserData({ email: userMessage.text });
        
        response = {
          id: Date.now().toString(),
          sender: 'tisai',
          text: `Perfect! I've recorded your email: ${userMessage.text}. Let's proceed with our partner onboarding process. First, we need you to review and sign our Non-Disclosure Agreement (NDA). Would you like to download it now?`,
          timestamp: new Date()
        };
        moveToNextStep();
        console.log(`Email provided (${userMessage.text}), moving to step: nda-download`);
        break;
      
      case 'nda-download':
        if (userText.includes('yes') || userText.includes('yeah') || userText.includes('sure') || userText.includes('ok')) {
          // Show NDA and trigger download UI
          setShowNDADownload(true);
          
          response = {
            id: Date.now().toString(),
            sender: 'tisai',
            text: `Great! I've opened the NDA for you below. Please download it, review, and sign it. When you're ready, you can upload the signed document.`,
            timestamp: new Date()
          };
        } else {
          console.log('User declined NDA download');
          response = {
            id: Date.now().toString(),
            sender: 'tisai',
            text: `No problem. When you're ready, we'll need to handle the NDA before proceeding. Just let me know when you want to download it.`,
            timestamp: new Date()
          };
          // Stay in the same step
        }
        break;
      
      case 'nda-upload':
        if (userText.includes('ready') || userText.includes('upload') || userText.includes('signed')) {
          response = {
            id: Date.now().toString(),
            sender: 'tisai',
            text: `Great! Please upload your signed NDA document using the upload panel below.`,
            timestamp: new Date()
          };
          setShowNDAUpload(true);
        } else {
          response = {
            id: Date.now().toString(),
            sender: 'tisai',
            text: `When you've signed the NDA, please let me know you're ready to upload it.`,
            timestamp: new Date()
          };
        }
        break;
        
      case 'completed':
        // Handle any messages after completion to avoid loops
        response = {
          id: Date.now().toString(),
          sender: 'tisai',
          text: `Your NDA has been processed successfully. You should be automatically redirected to the KYC process momentarily. If not, please refresh the page or contact support.`,
          timestamp: new Date()
        };
        
        // Retry the transition to the next step in case it didn't happen
        setTimeout(() => {
          console.log('Retrying transition to KYC step');
          moveToNextStep();
        }, 1000);
        break;
      
      case 'api-questions':
        // Check if user said no with exact matching to prevent misinterpretation
        const isNo = userText === 'no' || userText === 'nope' || userText === 'nothing' || userText === 'not really';
        
        if (isNo) {
          console.log('User declined API questions, moving to NDA step');
          response = {
            id: Date.now().toString(),
            sender: 'tisai',
            text: `Perfect! Let's proceed with our partner onboarding process. First, we need you to review and sign our Non-Disclosure Agreement (NDA). Would you like to download it now?`,
            timestamp: new Date()
          };
          moveToNextStep();
        } else {
          console.log(`User had API questions about: "${userMessage.text}"`);
          response = {
            id: Date.now().toString(),
            sender: 'tisai',
            text: `I understand you have questions about "${userMessage.text}". Before we dive into specifics, we need to complete the partner onboarding process, which begins with the NDA. Would you like to download the NDA now?`,
            timestamp: new Date()
          };
          moveToNextStep();
        }
        break;
      
      default:
        console.log(`Fallback response for unhandled step: ${state.currentStep}`);
        // Default response
        response = {
          id: Date.now().toString(),
          sender: 'tisai',
          text: `Thank you for your message. To proceed with the partner onboarding, we'll need to complete the NDA and KYC steps. Would you like to start with the NDA now?`,
          timestamp: new Date()
        };
        moveToNextStep();
        break;
    }
    
    console.log(`Sending response: "${response.text}"`);
    
    // Add assistant response
    setMessages(prev => [...prev, response]);
  };

  if (state.currentStep === 'kyc') {
    return <KYCStep />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header with audio controls */}
        <div className="bg-dark p-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">TisAi Assistant</h3>
            <p className="text-sm text-white/60">Full Onboarding</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={resetConversation}
              className="p-2 rounded-full bg-white bg-opacity-5 text-white/60 hover:bg-opacity-10"
              aria-label="Reset conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v6h6"></path>
                <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                <path d="M21 22v-6h-6"></path>
                <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
              </svg>
            </button>
            <button 
              onClick={toggleAudio}
              className={`p-2 rounded-full transition-colors ${audioEnabled ? 'bg-secondary bg-opacity-20 text-secondary' : 'bg-white bg-opacity-5 text-white/60'}`}
              aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
            >
              {audioEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Messages area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-primary to-dark"
        >
          {messages.map(message => (
            <div 
              key={message.id}
              className={`message-item chat-message flex ${message.sender === 'user' ? 'items-start flex-row-reverse' : 'items-start'}`}
            >
              {/* Avatar */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'tisai' ? 'bg-secondary bg-opacity-10 mr-3' : 'bg-accent bg-opacity-10 ml-3'
                }`}
              >
                <span className="text-lg">{message.sender === 'tisai' ? '🤖' : '👤'}</span>
              </div>
              
              {/* Message content */}
              <div 
                className={`max-w-[75%] rounded-2xl p-4 ${
                  message.sender === 'tisai' 
                    ? 'bg-dark text-white rounded-tl-none' 
                    : 'bg-accent bg-opacity-20 text-white rounded-tr-none'
                }`}
              >
                <div className="mb-1">
                  <span className="font-medium">{message.sender === 'tisai' ? 'TisAi' : 'You'}</span>
                  <span className="text-xs text-white/50 ml-2">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{message.text}</div>
              </div>
            </div>
          ))}
          
          {/* NDA Download Component */}
          {showNDADownload && (
            <div className="my-4">
              <NDADownload onDownload={handleNDADownload} />
            </div>
          )}
          
          {/* NDA Upload Component */}
          {showNDAUpload && (
            <div className="my-4">
              <NDAUpload onUpload={handleNDAUpload} />
            </div>
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="chat-message flex items-start">
              <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center mr-3">
                <span className="text-lg">🤖</span>
              </div>
              <div className="flex space-x-1 bg-dark rounded-2xl rounded-tl-none p-4">
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="p-3 bg-dark border-t border-white/10 transition-all">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSendMessage();
                  }
                }
              }}
              disabled={isTyping}
              placeholder="Type your message..."
              rows={1}
              className="w-full bg-white bg-opacity-5 border border-white/10 rounded-lg py-3 px-4 pr-12 resize-none focus:outline-none focus:ring-1 focus:ring-secondary/30 text-white placeholder-white/50 disabled:opacity-50"
              style={{ maxHeight: '150px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping || !input.trim()}
              className={`absolute right-2 bottom-2 rounded-full p-2 transition-colors ${
                isTyping || !input.trim()
                  ? 'bg-white/5 text-white/30'
                  : 'bg-secondary text-white hover:bg-secondary/90'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          
          {/* Quick response suggestions */}
          <div className="flex flex-wrap gap-2 mt-2">
            {state.currentStep === 'nda-download' && (
              <button
                onClick={() => setInput('Yes, I want to download the NDA')}
                disabled={isTyping}
                className="text-xs bg-white bg-opacity-5 hover:bg-opacity-10 text-white/70 py-1 px-3 rounded-full transition-colors disabled:opacity-50"
              >
                Yes, I want to download the NDA
              </button>
            )}
            
            {state.currentStep === 'nda-upload' && (
              <button
                onClick={() => setInput('I\'m ready to upload the signed NDA')}
                disabled={isTyping}
                className="text-xs bg-white bg-opacity-5 hover:bg-opacity-10 text-white/70 py-1 px-3 rounded-full transition-colors disabled:opacity-50"
              >
                I'm ready to upload the signed NDA
              </button>
            )}
            
            <button
              onClick={() => setInput('What features does WorldAPI offer?')}
              disabled={isTyping}
              className="text-xs bg-white bg-opacity-5 hover:bg-opacity-10 text-white/70 py-1 px-3 rounded-full transition-colors disabled:opacity-50"
            >
              What features does WorldAPI offer?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 