import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import AIChat from '../components/AIChat';
import useUserInterviewSessionStore from '../store/UserInterviewSessionStore';

export default function InterviewSessionPage() {
  const { uuid } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  const { initUserInterview } = useUserInterviewSessionStore();

  const userInterview = useUserInterviewSessionStore(state => state.userInterview);
  
  useEffect(() => {
    const init = async => {
      initUserInterview(uuid);
      setIsLoading(false);
    }
    init();
  }, []);
  
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
        <h1 className="text-2xl font-semibold text-gray-900">{userInterview?.interview.title}</h1>
      </header>
      
      <div className="max-w-2xl mx-auto h-[calc(100vh-200px)]">
      <div className="flex flex-col h-full">
        <AIChat type = "interview"/>
      </div>
      </div>
    </main>
  );
}