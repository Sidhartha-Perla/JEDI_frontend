import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  addInterview as _addInterview,
  getAllInterviews as _getAllInterviews,
  getInterviewByUuid as _getInterviewByUuid,
} from '../service/InterviewService';

const useInterviewStore = create(
  devtools((set, get) => ({
    interviews: [],
    initError: false,
    addInterviewError: false,
    filters: {
        search: '',
        status: null,
    },

    //Getters
    getInterviews: () => get().interviews,
    getInitError: () => get().initError,
    getFilters: () => get().filters,
    getInterviewByUuid: (uuid) => 
      get().interviews.find((interview) => interview.uuid === uuid),
    
    //Actions
    initInterviews: async () => {
        try{
            await get().fetchInterviews();
        }
        catch{
            set({initError : true});
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
    
    addInterview: async () => {
      try{
        const newInterview = await _addInterview();
        console.log("passed");
        set((state) => ({ interviews: [...state.interviews, newInterview] }));
        return newInterview;
      }
      catch{
        console.log("caught");
        set({addInterviewError : true});
      }
    },

    resetAddInterviewError: () => set({addInterviewError : false}),
  }))
);


export default useInterviewStore;