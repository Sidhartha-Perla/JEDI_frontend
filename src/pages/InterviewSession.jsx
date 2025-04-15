import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import InterviewChat from '../components/InterviewChat';
import { useInterviewChatStore } from '../store/interviewChatStore';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const { 
    setUUID, 
    setQuestions,
    setMetadata,
    setMessages, 
    addAIMessage, 
    clearMessages 
  } = useInterviewChatStore();
  
  useEffect(() => {
    // Function to load interview data and initialize chat
    const loadInterviewSession = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, you'd make API calls here
        // For now, use mock data and simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set unique session ID
        const sessionUUID = id || "123e4567-e89b-12d3-a456-426614174000";
        setUUID(sessionUUID);
        
        // Mock interview data
        const mockInterviewData = {
          title: 'Product Feedback Survey',
          objective: 'Help us improve our product by sharing your experience and thoughts.',
          questions: [
            'How would you rate your overall satisfaction with our product on a scale of 1-10?',
            'Which features do you use most frequently?',
            'Have you encountered any difficulties while using our product?',
            'What improvements would you like to see in future updates?',
            'Would you recommend our product to colleagues or friends? Why or why not?'
          ]
        };
        
        // Set interview metadata and questions
        setMetadata({
          title: mockInterviewData.title,
          objective: mockInterviewData.objective
        });
        setQuestions(mockInterviewData.questions);
        
        // Load previous messages if any (mock for now)
        const previousMessages = []; // In production, fetch from API
        
        // Clear any existing messages and set initial ones
        clearMessages();
        
        if (previousMessages.length > 0) {
          setMessages(previousMessages);
        } else {
          // Start with first question if no previous messages
          addAIMessage(mockInterviewData.questions[0]);
        }
      } catch (error) {
        console.error("Failed to load interview session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInterviewSession();
    
    // Cleanup function
    return () => {
      clearMessages();
    };
  }, [id]);
  
  const { metadata } = useInterviewChatStore();
  
  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto pt-10 pb-6 px-6 h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </main>
    );
  }
  
  return (
    <main className="flex-1 overflow-auto pt-10 pb-6 px-6 h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">{metadata.title}</h1>
        <p className="text-gray-600 mt-2">{metadata.objective}</p>
      </header>
      
      <div className="max-w-2xl mx-auto h-[calc(100vh-200px)]">
        <InterviewChat />
      </div>
    </main>
  );
}