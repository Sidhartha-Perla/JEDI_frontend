import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { addUserInterview as _addUserInterview } from '../service/InterviewService';

const useUserInterviewStore = create(
  devtools((set, get) => ({

    // Actions
    addUserInterview: async (interviewUuid, additionalInformation) => {
      const response = await _addUserInterview({ interviewUuid, additionalInformation });
      return response;
    },
  }))
);

export default useUserInterviewStore;