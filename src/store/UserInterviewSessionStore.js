import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getUserInterviewByUuid,
  getUserInterviewMessages,
  sendUserInterviewMessage,
  getInterviewByUuid
} from '../service/InterviewService';

const useUserInterviewSessionStore = create(
  devtools((set, get) => ({
    // State
    userInterview: null,
    interviewDetails: null,
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
            await get().fetchInterviewDetails(userInterview.interviewUuid);
            await get().fetchMessages(userInterview.uuid);
            return true;
        }
        catch{
            return false;
        }
      }
    },

    fetchInterviewDetails: async (interviewUuid) => {
        const interviewDetails = await getInterviewByUuid(interviewUuid);
        set({interviewDetails});
    },

    resetStore : () => set({userInterview : null, messages : [], initError : false}),
    
    fetchMessages: async (userInterviewUuid) => {
      const userInterview = get().userInterview;
      if (!userInterview) return;
      
      const messages = await getUserInterviewMessages({
        userInterviewUuid
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
  }))
);

export default useUserInterviewSessionStore;