import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getUserInterviewByUuid,
  getUserInterviewMessages,
  sendUserInterviewMessage,
} from '../service/InterviewService';

const useUserInterviewSessionStore = create(
  devtools((set, get) => ({
    // State
    userInterview: null,
    messages: [],
    initError: false,

    getUserInterviewByUuid: () => get().userInterview,
    getUserInterview: () => get().userInterview,
    getMessages: () => get().messages,
    getInitError: () => get().initError,
    // Actions
    initUserInterview: async (userInterviewUuid) => {
      if(!get().userInterview || get().userInterview.uuid != userInterviewUuid){
        get().resetStore();
        try{
            const userInterview = await getUserInterviewByUuid({ userInterviewUuid });
            set({ userInterview });
            await get().fetchMessages();
        }
        catch{
            set({initError : true});
        }
      }
    },

    resetStore : () => set({userInterview : null, messages : [], initError : false}),
    
    fetchMessages: async () => {
      const userInterview = get().userInterview;
      if (!userInterview) return;
      
      const messages = await getUserInterviewMessages({
        userInterviewUuid: userInterview.uuid,
      });
      
      set({ messages });
    },
    
    addHumanMessage: (message) => {
      set((state) => ({
        messages: [...state.messages, { role: "human", message }]
      }));
    },
    
    sendMessage: async (message) => {
      const userInterview = get().userInterview;
      if (!userInterview) return null;
      
      const { conversation } = await sendUserInterviewMessage({
        userInterviewUuid: userInterview.uuid,
        message,
      });
      
      set((state) => ({
        messages: [...state.messages, conversation]
      }));
      
      return conversation;
    },
  }), { name: 'user-interview-session-store' })
);

export default useUserInterviewSessionStore;