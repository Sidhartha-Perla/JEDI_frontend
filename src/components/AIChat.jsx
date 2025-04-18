import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { UserCircle, ArrowUp } from 'lucide-react';
import useInterviewPlannerStore from '../store/InterviewPlannerStore';
import useUserInterviewSessionStore from "../store/UserInterviewSessionStore";
import useInterviewResponsesStore from "../store/InterviewResponsesStore";
import { apiRequest } from '../lib/queryClient';


export default function AIChat({ type }) {
  const readOnly = type === "response";

  const useStore = type === "planning" ? useInterviewPlannerStore : (type === "interview" ? useUserInterviewSessionStore : useInterviewResponsesStore);
  
  const messages = useStore((state) => state.messages);
  const addHumanMessage = type !== "response" ? useStore().addHumanMessage : null;
  const sendMessage = type !== "response" ? useStore().sendMessage : null;

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async() => {
    if (!userInput.trim()) return;
    
    const messageText = userInput.trim();
    addHumanMessage(messageText);
    setIsLoading(true);
    
    console.log("About to send message:", messageText);
    
    setUserInput('');
    try {
      await sendMessage(messageText);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-300 p-6">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 ${message.role === "human" ? 'justify-end' : ''}`}
          >
            {message.role !== "human" && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <UserCircle className="h-5 w-5" />
              </div>
            )}
            <div className={`rounded-xl p-3 max-w-xs md:max-w-md ${
              message.role === "human" ? 'bg-blue-50' : 'bg-gray-100'
            }`}>
              {message.role === "human" ? (
                <p className="text-gray-800">{message.message}</p>
              ) : (
                <div className="text-gray-800 prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.message}
                  </ReactMarkdown>
                </div>
              )}
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
                <div className="h-2 w-2 rounded-full bg-gray-300 animate-blink" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-gray-300 animate-blink" style={{ animationDelay: '100ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-gray-300 animate-blink" style={{ animationDelay: '200ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {!readOnly && (
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