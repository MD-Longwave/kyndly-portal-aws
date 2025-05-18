import React, { useState, useRef, useEffect } from 'react';
import { AIService, ChatMessage } from '../services/ai.service';
import ChatMessageComponent from '../components/ui/ChatMessage';

// Flag to control whether to use the actual API or simulated responses
// Set to true now that we have the backend configured
const USE_ACTUAL_API = true;

// Simulated AI responses for testing the UI without the backend
const SIMULATED_RESPONSES = [
  "ICHRAs (Individual Coverage Health Reimbursement Arrangements) allow employers to provide tax-free reimbursements to employees for individual health insurance premiums and qualified medical expenses. They were established by federal regulations that took effect on January 1, 2020.",
  
  "An ICHRA offers several advantages over traditional group health plans. These include cost predictability for employers, greater plan choice for employees, and potential tax savings for both. Employers can set defined contribution amounts and employees can choose coverage that best meets their needs.",
  
  "To implement an ICHRA, employers should follow these steps: 1) Set employee classes and contribution amounts, 2) Create plan documents, 3) Establish a reimbursement process, 4) Communicate the benefit to employees, and 5) Provide resources for employees to shop for individual coverage.",
  
  "The key regulatory requirements for ICHRAs include: offering the same terms to all employees within a class, providing a 90-day notice to employees before the start of the plan year, ensuring employees have minimum essential coverage, and verifying that coverage remains in effect.",
  
  "When transitioning from a group plan to an ICHRA, employers should provide clear communication about the change, help employees understand how to shop for individual coverage, consider timing the transition during open enrollment, and ensure compliance with notice requirements."
];

// Starting prompt cards to help users know what to ask
const PROMPT_CARDS = [
  {
    category: "ICHRA Basics",
    description: "Learn the fundamentals",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    ),
    prompts: [
      "What is an ICHRA and how does it work?",
      "What are the key benefits of an ICHRA for employers?"
    ]
  },
  {
    category: "Implementation",
    description: "Practical guidance",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
    prompts: [
      "What steps should I take to implement an ICHRA?",
      "How should I communicate ICHRA benefits to employees?"
    ]
  },
  {
    category: "Regulations",
    description: "Stay compliant",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
      </svg>
    ),
    prompts: [
      "What are the key regulatory requirements for ICHRAs?",
      "How do ICHRAs comply with ACA requirements?"
    ]
  },
  {
    category: "Cost Analysis",
    description: "Understand savings",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
    prompts: [
      "How can an ICHRA save money for employers?",
      "What factors affect ICHRA allowance amounts?"
    ]
  }
];

const KnowledgeCenter: React.FC = () => {
  // State for chat conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  
  // State for input message
  const [inputMessage, setInputMessage] = useState('');
  
  // State for showing prompt cards
  const [showPrompts, setShowPrompts] = useState(true);
  
  // Reference for chat container to auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Get a simulated response for testing without backend
  const getSimulatedResponse = (userMessage: string) => {
    // Choose a random response from the simulated responses
    const randomIndex = Math.floor(Math.random() * SIMULATED_RESPONSES.length);
    return SIMULATED_RESPONSES[randomIndex];
  };
  
  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    try {
      // Hide prompts once user starts chatting
      setShowPrompts(false);
      
      // Clear any previous errors
      setError(null);
      
      // Add user message to chat
      const userMessage: ChatMessage = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      
      // Clear input
      setInputMessage('');
      
      // Set loading state
      setIsLoading(true);
      
      let assistantResponse: string;
      
      // Decide whether to use actual API or simulated response
      if (USE_ACTUAL_API) {
        // Convert messages to format expected by API (excluding the welcome message)
        const apiMessages = messages.concat(userMessage);
        
        console.log('Sending message to API:', content);
        console.log('With conversation history:', apiMessages);
        
        // Send message to API
        try {
          const response = await AIService.sendMessage(content, apiMessages);
          assistantResponse = response.data.response;
          console.log('Received API response:', response);
        } catch (apiError: any) {
          console.error('API call failed:', apiError);
          throw new Error(`API call failed: ${apiError.message || 'Unknown error'}`);
        }
      } else {
        // Use simulated response and add a delay to mimic API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        assistantResponse = getSimulatedResponse(content);
      }
      
      // Add AI response to chat
      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: assistantResponse
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(`The AI service is currently unavailable: ${err.message || 'Unknown error'}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle prompt card click
  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
    handleSendMessage(prompt);
  };
  
  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setShowPrompts(true);
  };

  // Handle keypress in input field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="bg-brand-gradient dark:bg-dark-gradient rounded-brand p-6 mb-6 text-white shadow-brand dark:shadow-dark">
        <h1 className="text-3xl font-bold mb-2">ICHRA Knowledge Center</h1>
        <p className="text-sky-100">Ask questions about Individual Coverage Health Reimbursement Arrangements</p>
      </div>

      <div className="flex-1 bg-white dark:bg-night-900 rounded-brand shadow-brand dark:shadow-dark overflow-hidden flex flex-col">
        {/* Chat header */}
        <div className="bg-gradient-to-r from-moss to-seafoam dark:from-night-800 dark:to-night-950 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-white dark:bg-night-800 w-10 h-10 flex items-center justify-center mr-3 shadow-sm">
              <span className="text-seafoam dark:text-sky text-lg font-bold">K</span>
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">Kyndly Assistant</h2>
              <p className="text-xs text-white/80">AI ICHRA Expert</p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="text-white hover:text-sky-100 p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Clear chat"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mx-4 my-2">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat messages or prompt cards */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-night-800"
        >
          {/* Show prompt cards if no messages and showPrompts is true */}
          {messages.length === 0 && showPrompts ? (
            <div className="py-6">
              {/* Welcome message */}
              <div className="mb-8 text-center max-w-2xl mx-auto">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-seafoam to-moss dark:from-sky dark:to-seafoam rounded-full flex items-center justify-center mx-auto shadow-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-night dark:text-white mb-3">Welcome to the Kyndly Assistant</h3>
                <p className="text-night-600 dark:text-night-100 text-lg">
                  I'm your ICHRA expert. Ask me anything about Individual Coverage Health Reimbursement Arrangements.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                {PROMPT_CARDS.map((cardGroup, groupIndex) => (
                  <div 
                    key={groupIndex} 
                    className="bg-white dark:bg-night-700 p-5 rounded-brand border border-gray-200 dark:border-night-600 shadow-sm dark:shadow-dark hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-seafoam/10 dark:bg-sky/10 flex items-center justify-center mr-3">
                        <div className="text-seafoam dark:text-sky">
                          {cardGroup.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-seafoam dark:text-sky">{cardGroup.category}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{cardGroup.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {cardGroup.prompts.map((prompt, promptIndex) => (
                        <button
                          key={`${groupIndex}-${promptIndex}`}
                          className="w-full text-left p-3 rounded-md bg-gray-50 dark:bg-night-600 hover:bg-seafoam/10 dark:hover:bg-sky/10 text-sm text-night-800 dark:text-white transition-colors border border-gray-200 dark:border-night-500"
                          onClick={() => handlePromptClick(prompt)}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {!USE_ACTUAL_API && (
                <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 italic">
                  Note: This is a preview with simulated responses. Full AI functionality coming soon.
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {messages.map((message, index) => (
                <ChatMessageComponent key={index} message={message} />
              ))}
              {messages.length > 0 && !USE_ACTUAL_API && (
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 italic py-1">
                  Using simulated responses. Full AI integration coming soon.
                </div>
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-night-700 rounded-lg px-4 py-3 max-w-[80%] shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-full bg-seafoam w-6 h-6 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">K</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-seafoam dark:bg-sky rounded-full animate-pulse"></div>
                        <div className="h-2 w-2 bg-seafoam dark:bg-sky rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 w-2 bg-seafoam dark:bg-sky rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Chat input */}
        <div className="border-t border-gray-200 dark:border-night-700 p-4 bg-white dark:bg-night-900">
          <div className="relative flex items-center bg-gray-50 dark:bg-night-800 rounded-full border border-gray-300 dark:border-night-600 focus-within:border-seafoam dark:focus-within:border-sky focus-within:ring-1 focus-within:ring-seafoam dark:focus-within:ring-sky shadow-sm">
            <textarea
              className="flex-1 resize-none bg-transparent border-0 focus:ring-0 py-3 pl-4 pr-10 min-h-[50px] max-h-32 text-night dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-l-full"
              placeholder="Ask about ICHRA..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              rows={1}
            />
            <button
              className={`absolute right-3 rounded-full p-2 ${
                isLoading || !inputMessage.trim()
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-seafoam dark:text-sky hover:bg-seafoam/10 dark:hover:bg-sky/10'
              }`}
              onClick={() => handleSendMessage(inputMessage)}
              disabled={isLoading || !inputMessage.trim()}
              title="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCenter; 