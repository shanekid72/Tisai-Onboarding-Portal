import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type { ChangeEvent } from 'react';

// Message types
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'tisai';
  timestamp: Date;
}

// Props
interface ChatInterfaceProps {
  mode: 'full' | 'fast-track';
}

// Conversation step type
type ConversationStep = 
  | 'welcome'
  | 'name'
  | 'organization'
  | 'email'
  | 'connection'
  | 'api-questions'
  | 'completed';

// Demo initial messages based on mode
const getInitialMessages = (mode: 'full' | 'fast-track'): Message[] => {
  const baseWelcome = {
    id: '1',
    sender: 'tisai' as const,
    timestamp: new Date(),
  };

  if (mode === 'full') {
    return [
      {
        ...baseWelcome,
        content: `👋 Welcome to TisAi WorldAPI Connect! I'll guide you through the complete setup process for integrating with WorldAPI. Let's start with some basic information. What's your name?`,
      },
    ];
  } else {
    return [
      {
        ...baseWelcome,
        content: `⚡ Welcome to the Fast Track setup! Let's get you connected quickly. I just need a few essential details to configure your WorldAPI connection. First, could you provide your name, organization, and email?`,
      },
    ];
  }
};

// Get the stored conversation state or use default
const getStoredConversationState = (): { 
  step: ConversationStep, 
  messages: Message[] | null,
  userData: {
    name?: string;
    organization?: string;
    email?: string;
  }
} => {
  try {
    const stored = localStorage.getItem('tisai_chat_state');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Loaded stored chat state:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading stored chat state:', error);
  }
  
  return { 
    step: 'welcome', 
    messages: null,
    userData: {}
  };
};

// Store the conversation state
const storeConversationState = (step: ConversationStep, messages: Message[], userData: any) => {
  try {
    localStorage.setItem('tisai_chat_state', JSON.stringify({ step, messages, userData }));
    console.log(`Stored chat state: step=${step}, messages=${messages.length}`);
  } catch (error) {
    console.error('Error storing chat state:', error);
  }
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ mode }) => {
  const storedState = getStoredConversationState();
  const [currentStep, setCurrentStep] = useState<ConversationStep>(storedState.step);
  const [messages, setMessages] = useState<Message[]>(storedState.messages || getInitialMessages(mode));
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState(storedState.userData);

  // Audio toggle state
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Store conversation state when it changes
  useEffect(() => {
    storeConversationState(currentStep, messages, userData);
  }, [currentStep, messages, userData]);

  // Initial animation
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      '.chat-message',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.2 }
    );

    return () => {
      tl.kill();
    };
  }, []);

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Update the current step and manage state transitions
  const updateStep = (step: ConversationStep) => {
    console.log(`Updating conversation step: ${currentStep} -> ${step}`);
    setCurrentStep(step);
  };

  // Extracts information from user input based on current step
  const extractUserData = (text: string, step: ConversationStep) => {
    const newUserData = { ...userData };
    
    switch (step) {
      case 'name':
        newUserData.name = text.trim();
        break;
      case 'organization':
        newUserData.organization = text.trim();
        break;
      case 'email':
        newUserData.email = text.trim();
        break;
    }
    
    console.log('Updated user data:', newUserData);
    setUserData(newUserData);
    return newUserData;
  };

  // Demo response (in a real app, this would call an API)
  const simulateResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const userTextLower = userMessage.toLowerCase().trim();
      
      // Process user response based on the current conversation step
      let responseContent = '';
      let nextStep: ConversationStep = currentStep;
      
      console.log(`Processing response for step: ${currentStep}, user message: "${userMessage}"`);
      
      switch (currentStep) {
        case 'welcome':
          extractUserData(userMessage, 'name');
          responseContent = "Great! Nice to meet you. What organization are you representing?";
          nextStep = 'organization';
          break;
          
        case 'name':
          extractUserData(userMessage, 'name');
          responseContent = "Great! Nice to meet you. What organization are you representing?";
          nextStep = 'organization';
          break;
          
        case 'organization':
          extractUserData(userMessage, 'organization');
          responseContent = "Thanks for that information. Now, what's your email address so we can associate it with your WorldAPI account?";
          nextStep = 'email';
          break;
          
        case 'email':
          extractUserData(userMessage, 'email');
          responseContent = "Perfect! I've recorded your email. Now let's establish a connection to the WorldAPI servers. Would you like me to initiate the connection now?";
          nextStep = 'connection';
          break;
          
        case 'connection':
          if (userTextLower.includes('yes') || userTextLower.includes('ok') || userTextLower.includes('sure')) {
            responseContent = "Great! I'm initiating the connection to WorldAPI servers... Connection established! You can now download your configuration file from the progress panel.";
            nextStep = 'api-questions';
          } else {
            responseContent = "No problem. Let me know when you're ready to establish the connection.";
            // Stay on the same step
          }
          break;
          
        case 'api-questions':
          // Handle "no" response explicitly
          if (userTextLower === 'no' || userTextLower === 'nope' || userTextLower === 'nothing' || userTextLower === 'not really') {
            responseContent = "Perfect! You're all set with the WorldAPI integration basics. If you have questions later, you can always reach out to our support team.";
            nextStep = 'completed';
          } else {
            // Handle specific questions about the API
            responseContent = `Thank you for your question about "${userMessage}". The WorldAPI documentation covers that in detail. You can find comprehensive information in the developer portal. Would you like to see anything else about the API?`;
            // Stay in the same step for follow-up questions
          }
          break;
          
        case 'completed':
          responseContent = "Your WorldAPI integration is complete! Feel free to explore the developer portal for additional resources, or contact our support team if you need assistance.";
          // Stay in completed state
          break;
          
        default:
          // Fallback response - should not normally get here
          responseContent = "I'm sorry, there seems to be an issue with our conversation flow. Let's restart. What's your name?";
          nextStep = 'name';
      }
      
      const newMessage: Message = {
        id: `tisai-${Date.now()}`,
        content: responseContent,
        sender: 'tisai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      updateStep(nextStep);
      setIsTyping(false);
      
      // If audio is enabled, you would trigger text-to-speech here
      if (audioEnabled) {
        // Text-to-speech would go here
        console.log('TTS would speak:', responseContent);
      }
    }, 1500);
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Simulate TisAi response
    simulateResponse(inputValue);
  };

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  // Reset the conversation
  const resetConversation = () => {
    localStorage.removeItem('tisai_chat_state');
    setMessages(getInitialMessages(mode));
    setCurrentStep('welcome');
    setUserData({});
    console.log('Conversation reset');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header with audio controls */}
      <div className="bg-dark p-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium">TisAi Assistant</h3>
          <p className="text-sm text-white/60">{mode === 'full' ? 'Full Onboarding' : 'Fast Track'}</p>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-primary to-dark">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="chat-message flex items-center space-x-2 text-white/60">
            <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <ChatInput
        value={inputValue}
        onChange={handleInputChange}
        onSend={handleSendMessage}
        disabled={isTyping}
      />
    </div>
  );
};

export default ChatInterface; 