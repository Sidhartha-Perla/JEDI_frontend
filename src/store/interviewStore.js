import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const initialDraft = {
  title: 'Sample Title',
  objective: 'Sample objective',
  questions: ['Sample question'],
  isAIMode: true,
};

export const useInterviewStore = create(
  devtools(
    (set) => ({
      // Filters
      filters: {
        search: '',
        status: null,
      },
      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search },
        })),
      setStatusFilter: (status) =>
        set((state) => ({
          filters: { ...state.filters, status },
        })),

      // Interview Draft
      draft: { ...initialDraft },
      setTitle: (title) =>
        set((state) => ({
          draft: { ...state.draft, title },
        })),
      setObjective: (objective) =>
        set((state) => ({
          draft: { ...state.draft, objective },
        })),
      setQuestions: (questions) =>
        set((state) => ({
          draft: { ...state.draft, questions },
        })),
      addQuestion: (question = '') =>
        set((state) => {
          const newQuestions = [...state.draft.questions, question];
          return { draft: { ...state.draft, questions: newQuestions } };
        }),
      removeQuestion: (index) =>
        set((state) => {
          const newQuestions = state.draft.questions.filter((_, i) => i !== index);
          return {
            draft: {
              ...state.draft,
              questions: newQuestions.length ? newQuestions : [''],
            },
          };
        }),
      updateQuestion: (index, text) =>
        set((state) => {
          const newQuestions = [...state.draft.questions];
          newQuestions[index] = text;
          return { draft: { ...state.draft, questions: newQuestions } };
        }),
      setAIMode: (isAIMode) =>
        set((state) => ({
          draft: { ...state.draft, isAIMode },
        })),
      resetDraft: () => set({ draft: { ...initialDraft } }),

      // AI Chat
      messages: ["Hi, what type of Interview would you like to create?"],
      addUserMessage: (content) =>
        set((state) => ({
          messages: [...state.messages, { isUser: true, content }],
        })),
      addAIMessage: (content) =>
        set((state) => ({
          messages: [...state.messages, { isUser: false, content }],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    { name: 'interview-store' }
  )
);
