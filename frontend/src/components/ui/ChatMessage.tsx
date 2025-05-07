import React from 'react';
import { ChatMessage as ChatMessageType } from '../../services/ai.service';
import { SlideIn } from '../animations';
import DOMPurify from 'dompurify'; // Add DOMPurify import for sanitizing HTML
import './ChatMessage.css'; // Import the CSS file

interface ChatMessageProps {
  message: ChatMessageType;
  index?: number;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, index = 0 }) => {
  const isUser = message.role === 'user';

  // Function to render user content with proper formatting
  const renderUserContent = (content: string) => {
    // Convert markdown-style lists (- item) to HTML lists
    const processedContent = content.replace(/^- (.+)$/gm, '• $1');
    
    // Split content by newlines to create paragraphs
    return processedContent.split('\n').map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-2' : ''}>
        {paragraph}
      </p>
    ));
  };

  // Function to process markdown formatting in AI responses
  const processMarkdown = (content: string) => {
    // Convert bold markdown (**text**) to HTML strong tags
    let processed = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert numbered lists with headings (1. **Heading**: text) to structured format
    processed = processed.replace(/(\d+\.\s+)<strong>(.*?)<\/strong>(\s*:|\s*)/g, '<p><strong>$1$2</strong>$3');
    
    // Convert bullet points to proper HTML lists
    processed = processed.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive list items in ul tags
    processed = processed.replace(/(<li>.*<\/li>\n)+/g, (match) => {
      return `<ul>${match}</ul>`;
    });
    
    // Ensure paragraphs are properly formatted
    processed = processed.replace(/\n\n/g, '</p><p>');
    
    return processed;
  };

  // Function to sanitize HTML content for assistant messages
  const sanitizeHtml = (content: string) => {
    // First process any remaining markdown in the content
    const processedContent = processMarkdown(content);
    
    return DOMPurify.sanitize(processedContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
  };

  return (
    <SlideIn 
      direction={isUser ? 'left' : 'right'} 
      delay={0.1 * Math.min(index, 3)} // Cap delay at 0.3s for long conversations
      distance={10} // Smaller distance for subtle effect
    >
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
            {isUser ? (
              // Render user messages normally
              renderUserContent(message.content)
            ) : (
              // Render assistant messages as HTML
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.content) }}
                className="ai-response"
              />
            )}
          </div>
        </div>
      </div>
    </SlideIn>
  );
};

export default ChatMessage; 