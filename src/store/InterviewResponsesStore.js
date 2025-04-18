import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
    getInterviewByUuid,
    getAllUserInterviewsByUuid,
    getUserInterviewMessages
} from '../service/InterviewService';

const useInterviewResponsesStore = create(
    devtools((set, get) => ({
        //State

        interview: null,
        interviewResponses: [],
        filters: {tag: null},
        messages: [],
        initError: false,

        //Setters
        initResponseDetails: async (interviewUuid) => {
            if(!get().interview || get().interview.uuid != interviewUuid){
                get().resetStore();
                try{
                    const interview = await getInterviewByUuid(interviewUuid);
                    set({ interview });
                    await get().fetchResponses();
                }
                catch{
                    set({initError: true});
                }
            }
        },

        fetchResponses: async () => {
            const interviewUuid = get().interview.uuid;
            if (!interviewUuid) return;
            
            const interviewResponses = (await getAllUserInterviewsByUuid(interviewUuid));
            
            set({ interviewResponses });
        },

        resetStore: () => set({interview: null, interviewResponses: [], filters: {tag: null}, messages: [], initError: false}),

        setTagFilter: (tag) =>
            set(state => ({
                filters : {...state.filters, tag}
            })),

        setMessages: async (userInterviewUuid) => {
            const currentResponseMessages = await getUserInterviewMessages({
                userInterviewUuid
            });

            set({messages : currentResponseMessages});
        },

        resetMessages: () => set({messages: []}),
        
    }))
)

export default useInterviewResponsesStore;