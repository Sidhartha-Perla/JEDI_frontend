import { useState, useEffect } from 'react';
import useUserInterviewSessionStore from '../store/UserInterviewSessionStore';
import AIChat from './AIChat';
import { useParams } from 'wouter';

export default function InterviewChat() {
  const { initUserInterview } = useUserInterviewSessionStore();

  useEffect(() => {
    initUserInterview();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <AIChat type = "interview"/>
    </div>
  );
}