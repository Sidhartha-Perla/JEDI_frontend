import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getInterviewPlannerMessages as _getInterviewPlannerMessages,
  sendInterviewPlannerMessage as _sendInterviewPlannerMessage,
  getInterviewByUuid as _getInterviewByUuid,
  updateInterview as _updateInterview,
  addUserInterview as _addUserInterview
} from '../service/InterviewService';

const useInterviewPlannerStore = create(
  devtools((set, get) => ({
    //State
    interviewId: null,
    interviewDetails: null,
    messages: [],
    initError: false,
    updateError: false,

    //Getters
    getInterviewDetails: () => get().interviewDetails,
    getMessages: () => get().messages,
    getInitError: () => get().initError,
    getUpdateError: () => get().updateError,

    //Actions
    initInterviewDetails: async (interviewId) => {
        try{
            const interviewDetails = await _getInterviewByUuid(interviewId);
            set({interviewId, interviewDetails});
            await get().fetchMessages();
        }
        catch{
            set({initError : true});
        }
    },

    resetInitError: () => set({initError : false}),
    resetUpdateError: () => set({updateError : false}),
    
    resetStore: () => set({ messages: [], interviewId: null, initError : false, updateError : false }),
    
    fetchMessages: async () => {
        const interviewId = get().interviewId;
        const messages = await _getInterviewPlannerMessages(interviewId);
        set({ messages });
    },
    
    addHumanMessage: (message) => {
      set((state) => ({
        messages: [...state.messages, { role: "human", message }]
      }));
    },
    
    sendMessage: async (message) => {
        const interviewId = get().interviewId;
        const { conversation } = await _sendInterviewPlannerMessage({
            interviewId,
            message
        });
        set((state) => ({
            messages: [...state.messages, conversation]
        }));
        await get().initInterviewDetails(get().interviewId);
    },

    updateTitle: async (newTitle) => {
        try{
            const response = await _updateInterview(get().interviewId, {title : newTitle});
            set({interviewDetails : response});
        }
        catch{
            set({updateError : true});
        }
    }
  }))
);

export default useInterviewPlannerStore;