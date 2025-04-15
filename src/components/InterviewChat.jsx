import { useState, useEffect } from 'react';
import { useInterviewChatStore } from '../store/interviewChatStore';
import AIChat from './AIChat';

// Mock API function to simulate getting AI responses
const mockAPIResponse = async (userMessage, questionIndex, questions) => {
  // Simple delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // If we have more questions, return the next one
  const nextIndex = questionIndex + 1;
  if (nextIndex < questions.length) {
    return {
      content: questions[nextIndex],
      nextQuestionIndex: nextIndex
    };
  } else {
    // End of interview
    return {
      content: "Thank you for completing the interview! Your responses have been recorded.",
      nextQuestionIndex: questionIndex
    };
  }
};

// Override the apiRequest function for our interview context
const apiRequestOverride = async (method, url, data) => {
  // We're not actually making API calls, just using our mock
  const response = await mockAPIResponse(
    data.message,
    data.questionIndex,
    data.questions
  );
  
  return {
    json: async () => ({
      response: response.content,
      nextQuestionIndex: response.nextQuestionIndex
    })
  };
};

export default function InterviewChat() {
  const { 
    currentQuestionIndex,
    setCurrentQuestionIndex,
    questions
  } = useInterviewChatStore();
  
  const [isLoading, setIsLoading] = useState(false);

  // Custom handler to update the question index when the AI responds
  const handleUpdateDraft = async (message) => {
    try {
      setIsLoading(true);
      
      // Use our custom API request override
      const response = await apiRequestOverride('POST', '/api/ai/chat', {
        message: message,
        questionIndex: currentQuestionIndex,
        questions: questions
      });
      
      const data = await response.json();
      
      // Update current question index
      setCurrentQuestionIndex(data.nextQuestionIndex);
    } catch (error) {
      console.error('Error processing response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize with the first question if needed
  useEffect(() => {
    if (currentQuestionIndex === -1 && questions.length > 0) {
      setCurrentQuestionIndex(0);
    }
  }, [currentQuestionIndex, questions, setCurrentQuestionIndex]);

  return (
    <div className="flex flex-col h-full">
      <AIChat onUpdateDraft={handleUpdateDraft} />
    </div>
  );
}