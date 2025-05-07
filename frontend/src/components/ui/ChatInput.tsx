import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim the message and check if it's not empty
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-grow">
          <label htmlFor="message" className="sr-only">
            Type your message
          </label>
          <input
            id="message"
            name="message"
            type="text"
            className="block w-full rounded-md border-0 px-4 py-3 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 text-sm sm:text-base"
            placeholder="Ask about ICHRA..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className={`inline-flex items-center rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
            isLoading || !message.trim()
              ? 'bg-primary-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-500'
          }`}
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg
                className="-ml-0.5 mr-1.5 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              Send
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput; 