import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { UserCircle, ArrowUp } from 'lucide-react';
import { useInterviewStore } from '../store/interviewStore';
import { apiRequest } from '../lib/queryClient';


export default function AIChat({ onUpdateDraft, readOnly = false, messages: initialMessages = [] }) {
  const { messages, addUserMessage, addAIMessage, draft } = useInterviewStore();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Use passed messages if in readOnly mode, otherwise use store messages
  const displayMessages = readOnly ? initialMessages : messages;

  useEffect(() => {
    if (!readOnly && displayMessages.length === 0) {
      addAIMessage("Hello! I will help you create a user interview. What is the goal of your interview?");
    }
  }, [readOnly, displayMessages.length, addAIMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    addUserMessage(userInput);

    if (onUpdateDraft) {
      onUpdateDraft();
    }

    setUserInput('');

    try {
      setIsLoading(true);

      const response = await apiRequest('POST', '/api/ai/chat', {
        message: userInput
      });

      const data = await response.json();

      addAIMessage(data.response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      addAIMessage("I'm sorry, I'm having trouble processing your request right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-300 p-6">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {displayMessages.map((message, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 ${message.isUser ? 'justify-end' : ''}`}
          >
            {!message.isUser && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <UserCircle className="h-5 w-5" />
              </div>
            )}
            <div className={`rounded-xl p-3 max-w-xs md:max-w-md ${
              message.isUser ? 'bg-blue-50' : 'bg-gray-100'
            }`}>
              <p className="text-gray-800">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <UserCircle className="h-5 w-5" />
            </div>
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '100ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '200ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {!readOnly && ( // Conditional rendering of the input area
      <div className="border-t border-gray-200 pt-4 mt-auto">
        <div className="relative">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none pr-14"
            placeholder="Type your message..."
            rows={3}
          />
          <Button 
            className="absolute right-3 bottom-3 bg-blue-500 hover:bg-blue-600 text-white h-10 w-10 rounded-full p-0 flex items-center justify-center"
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isLoading}
            aria-label="Send message"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}