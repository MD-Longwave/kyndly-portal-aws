import React, { useState, useRef, useEffect } from 'react';
import { AIService, ChatMessage } from '../services/ai.service';
import ChatMessageComponent from '../components/ui/ChatMessage';
import ChatInput from '../components/ui/ChatInput';

// Flag to control whether to use the actual API or simulated responses
// Set to false until backend is ready
const USE_ACTUAL_API = false;

// Simulated AI responses for testing the UI without the backend
const SIMULATED_RESPONSES = [
  "ICHRAs (Individual Coverage Health Reimbursement Arrangements) allow employers to provide tax-free reimbursements to employees for individual health insurance premiums and qualified medical expenses. They were established by federal regulations that took effect on January 1, 2020.",
  
  "An ICHRA offers several advantages over traditional group health plans. These include cost predictability for employers, greater plan choice for employees, and potential tax savings for both. Employers can set defined contribution amounts and employees can choose coverage that best meets their needs.",
  
  "To implement an ICHRA, employers should follow these steps: 1) Set employee classes and contribution amounts, 2) Create plan documents, 3) Establish a reimbursement process, 4) Communicate the benefit to employees, and 5) Provide resources for employees to shop for individual coverage.",
  
  "The key regulatory requirements for ICHRAs include: offering the same terms to all employees within a class, providing a 90-day notice to employees before the start of the plan year, ensuring employees have minimum essential coverage, and verifying that coverage remains in effect.",
  
  "When transitioning from a group plan to an ICHRA, employers should provide clear communication about the change, help employees understand how to shop for individual coverage, consider timing the transition during open enrollment, and ensure compliance with notice requirements."
];

const KnowledgeCenter: React.FC = () => {
  // State for chat conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m the Kyndly Assistant, your ICHRA expert. How can I help you today?'
    }
  ]);
  
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);
  
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  
  // Reference for chat container to auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    try {
      // Clear any previous errors
      setError(null);
      
      // Add user message to chat
      const userMessage: ChatMessage = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      
      // Set loading state
      setIsLoading(true);
      
      let assistantResponse: string;
      
      // Decide whether to use actual API or simulated response
      if (USE_ACTUAL_API) {
        // Convert messages to format expected by API (excluding the welcome message)
        const apiMessages = messages.slice(1).concat(userMessage);
        
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
  
  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m the Kyndly Assistant, your ICHRA expert. How can I help you today?'
      }
    ]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-180px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-secondary-800">ICHRA Knowledge Center</h1>
        
        <button
          onClick={handleClearChat}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Chat
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col flex-grow">
        {/* Chat header */}
        <div className="bg-primary-600 text-white px-4 py-3 flex items-center">
          <div className="rounded-full bg-white w-10 h-10 flex items-center justify-center mr-3">
            <span className="text-primary-600 text-lg font-bold">K</span>
          </div>
          <div>
            <h2 className="font-semibold">Kyndly Assistant</h2>
            <p className="text-xs opacity-80">ICHRA Expert</p>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
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
        
        {/* Chat messages */}
        <div className="flex-grow overflow-y-auto p-4">
          <div className="space-y-2">
            {messages.map((message, index) => (
              <ChatMessageComponent key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-secondary-600 w-6 h-6 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div className="h-2 w-6 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="h-2 w-6 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-6 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Chat input */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
      
      {/* Informational box */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900">About the Knowledge Center</h3>
        <p className="mt-1 text-sm text-gray-600">
          The Kyndly Assistant is powered by AI and specializes in ICHRA regulations, implementation strategies, 
          cost considerations, and employee education. Ask any questions about Individual Coverage Health Reimbursement Arrangements.
        </p>
        {!USE_ACTUAL_API && (
          <p className="mt-2 text-xs text-gray-500 italic">
            Note: This is a preview of the Knowledge Center with simulated responses.
            Full AI functionality will be implemented soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default KnowledgeCenter; 