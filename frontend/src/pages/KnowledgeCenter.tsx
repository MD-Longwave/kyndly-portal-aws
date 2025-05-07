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
    prompts: [
      "What is an ICHRA and how does it work?",
      "What are the key benefits of an ICHRA for employers?"
    ]
  },
  {
    category: "Implementation",
    description: "Practical guidance",
    prompts: [
      "What steps should I take to implement an ICHRA?",
      "How should I communicate ICHRA benefits to employees?"
    ]
  },
  {
    category: "Regulations",
    description: "Stay compliant",
    prompts: [
      "What are the key regulatory requirements for ICHRAs?",
      "How do ICHRAs comply with ACA requirements?"
    ]
  },
  {
    category: "Cost Analysis",
    description: "Understand savings",
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
        
        // Send message to API
        const response = await AIService.sendMessage(content, apiMessages);
        assistantResponse = response.data.response;
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
      setError('The AI service is currently unavailable. We\'ll be implementing this feature soon!');
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
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-secondary-800">ICHRA Knowledge Center</h1>
        <p className="text-sm text-secondary-500">Ask questions about Individual Coverage Health Reimbursement Arrangements</p>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        {/* Chat header */}
        <div className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-white w-8 h-8 flex items-center justify-center mr-3">
              <span className="text-primary-600 text-lg font-bold">K</span>
            </div>
            <div>
              <h2 className="font-semibold">Kyndly Assistant</h2>
              <p className="text-xs opacity-80">AI ICHRA Expert</p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="text-white hover:text-primary-100 p-1 rounded"
            title="Clear chat"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 my-2">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat messages or prompt cards */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-2 bg-neutral-50"
        >
          {/* Show prompt cards if no messages and showPrompts is true */}
          {messages.length === 0 && showPrompts ? (
            <div className="py-4">
              {/* Welcome message */}
              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-secondary-800 mb-2">Welcome to the Kyndly Assistant</h3>
                <p className="text-secondary-600">
                  I'm your ICHRA expert. Ask me anything about Individual Coverage Health Reimbursement Arrangements.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROMPT_CARDS.map((cardGroup, groupIndex) => (
                  <div 
                    key={groupIndex} 
                    className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm"
                  >
                    <h3 className="font-medium text-primary-700 mb-1">{cardGroup.category}</h3>
                    <p className="text-xs text-neutral-500 mb-3">{cardGroup.description}</p>
                    <div className="space-y-2">
                      {cardGroup.prompts.map((prompt, promptIndex) => (
                        <button
                          key={`${groupIndex}-${promptIndex}`}
                          className="w-full text-left p-2 rounded-md bg-primary-50 hover:bg-primary-100 text-sm text-secondary-700 transition-colors"
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
                <div className="mt-4 text-center text-xs text-neutral-400 italic">
                  Note: This is a preview with simulated responses. Full AI functionality coming soon.
                </div>
              )}
            </div>
          ) : (
            <div className="py-2 space-y-3">
              {messages.map((message, index) => (
                <ChatMessageComponent key={index} message={message} />
              ))}
              {messages.length > 0 && !USE_ACTUAL_API && (
                <div className="text-center text-xs text-neutral-400 italic py-1">
                  Using simulated responses. Full AI integration coming soon.
                </div>
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg px-4 py-3 max-w-[80%] shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-full bg-primary-600 w-6 h-6 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">K</span>
                      </div>
                      <div className="h-2 w-6 bg-primary-200 rounded-full animate-pulse"></div>
                      <div className="h-2 w-6 bg-primary-200 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-6 bg-primary-200 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Chat input */}
        <div className="border-t border-neutral-200 p-3">
          <div className="flex items-center bg-neutral-50 rounded-lg border border-neutral-300 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
            <textarea
              className="flex-1 resize-none bg-transparent border-0 focus:ring-0 p-3 h-12 max-h-32 text-neutral-900 placeholder-neutral-400"
              placeholder="Ask about ICHRA..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              rows={1}
            />
            <button
              className={`mx-2 rounded-md p-2 ${
                isLoading || !inputMessage.trim()
                  ? 'text-neutral-400 cursor-not-allowed'
                  : 'text-primary-600 hover:bg-primary-50'
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
          <div className="mt-1 text-xs text-center text-neutral-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCenter; 