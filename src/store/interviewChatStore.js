import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useInterviewChatStore = create(
  devtools(
    (set) => ({
      // Unique identifier for this chat session
      uuid: "123e4567-e89b-12d3-a456-426614174000", // Dummy UUID

      // Chat messages
      messages: [],
      
      // Add a user message to the conversation
      addUserMessage: (content) =>
        set((state) => ({
          messages: [...state.messages, { isUser: true, content, timestamp: Date.now() }],
        })),
      
      // Add an AI/system message to the conversation
      addAIMessage: (content) =>
        set((state) => ({
          messages: [...state.messages, { isUser: false, content, timestamp: Date.now() }],
        })),
      
      // Set initial messages (e.g., when loading previous conversation)
      setMessages: (messages) => set({ messages }),
      
      // Clear all messages
      clearMessages: () => set({ messages: [] }),
      
      // Set the UUID for the current chat session
      setUUID: (uuid) => set({ uuid }),
      
      // Current question tracking
      currentQuestionIndex: 0,
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      
      // Interview questions
      questions: [],
      setQuestions: (questions) => set({ questions }),
      
      // Interview metadata
      metadata: {
        title: '',
        objective: ''
      },
      setMetadata: (metadata) => set({ metadata }),
    }),
    { name: 'interview-chat-store' }
  )
);