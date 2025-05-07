import React from 'react';
import { ChatMessage as ChatMessageType } from '../../services/ai.service';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Function to render the content with proper formatting
  const renderContent = (content: string) => {
    // Convert markdown-style lists (- item) to HTML lists
    const processedContent = content.replace(/^- (.+)$/gm, '• $1');
    
    // Split content by newlines to create paragraphs
    return processedContent.split('\n').map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-2' : ''}>
        {paragraph}
      </p>
    ));
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg px-4 py-3 max-w-[85%] shadow-sm ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-white text-secondary-800'
        }`}
      >
        {/* Show avatar or icon for assistant messages */}
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="rounded-full bg-primary-600 w-6 h-6 flex items-center justify-center mr-2">
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <span className="font-semibold text-secondary-800">Kyndly Assistant</span>
          </div>
        )}
        
        <div className={`${isUser ? 'text-white' : 'text-secondary-800'} text-sm`}>
          {renderContent(message.content)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 