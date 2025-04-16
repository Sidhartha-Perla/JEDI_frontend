import create from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  addInterview as _addInterview,
  getAllInterviews as _getAllInterviews,
  getInterviewByUuid as _getInterviewByUuid,
} from '../service/InterviewService';

export const useInterviewStore = create(
  devtools((set, get) => ({
    interviews: [],
    isInitialized: false,
    initError: false,
    isLoading: true,

    filters: {
        search: '',
        status: null,
    },

    getInterviews: () => get().interviews,
    
    getInterviewByUuid: (uuid) => 
      get().interviews.find((interview) => interview.uuid === uuid),
    
    initInterviews: async () => {
      if (!get().isInitialized) {
        try{
            await get().fetchInterviews();
            set({ isInitialized: true });
        }
        catch{
            set({initError : true});
        }
        finally{
            set({isLoading : false});
        }
      }
    },
    
    fetchInterviews: async () => {
      const interviews = await _getAllInterviews();
      set({ interviews });
    },

    setSearch : (search) =>
        set(state => ({
            filters : {...state.filters, search}
        })),

    setStatusFilter : (status) =>
        set(state => ({
            filters : {...state.filters, status}
        })),
    
    fetchInterviewByUuid: async (uuid) => {
      let interview = get().interviews.find((interview) => interview.uuid === uuid);
      if (interview == null) {
        interview = await _getInterviewByUuid(uuid);
        set((state) => ({ interviews: [...state.interviews, interview] }));
      }
      return interview;
    },
    
    addInterview: async ({ name }) => {
      const newInterview = await _addInterview({ name });
      set((state) => ({ interviews: [...state.interviews, newInterview] }));
      return newInterview;
    },
    
    updateInterview: async ({ id, interview: updatedInterview }) => {
      const interviews = get().interviews;
      const index = interviews.findIndex((interview) => interview.id === id);
      
      if (index !== -1) {
        const updatedInterviews = [...interviews];
        updatedInterviews[index] = updatedInterview;
        set({ interviews: updatedInterviews });
      }
      
      return updatedInterview;
    },
  }))
);

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}

export default useInterviewStore;