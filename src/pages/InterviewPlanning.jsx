import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { queryClient, apiRequest } from '../lib/queryClient';
import { useInterviewStore } from '../store/interviewStore';
import AIChat from '../components/AIChat';
import QuestionInput from '../components/QuestionInput';

export default function InterviewPlanning() {
  const [, navigate] = useLocation();
  const params = useParams();
  const isEditMode = Boolean(params?.id);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef(null);
  const {
    draft,
    setTitle,
    setObjective,
    setQuestions,
    setAIMode,
    resetDraft,
    clearMessages,
  } = useInterviewStore();

  useEffect(() => {
    const fetchInterview = async () => {
      if (!isEditMode) return;

      try {
        setIsLoading(true);
        console.log("Interview params: ", params);
        const response = await fetch(`/api/interviews/${params.id}`);
        console.log("response: ", response);
        if (!response.ok) {
          throw new Error('Failed to fetch interview');
        }
        const data = await response.json();
        setTitle(data.title);
        setObjective(data.objective);
        setQuestions(data.questions);
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to load interview: ${error.message}`,
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [isEditMode, params?.id]);

  useEffect(() => {
    if (!isEditMode) resetDraft();

    return () => {
      resetDraft();
      clearMessages();
    };
  }, []);

  // Focus input when editing title
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // Handle click outside to cancel editing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isEditingTitle && titleInputRef.current && !titleInputRef.current.contains(event.target)) {
        setIsEditingTitle(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingTitle]);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    }
  };

  const interviewMutation = useMutation({
    mutationFn: async (interviewData) => {
      const method = isEditMode ? 'PATCH' : 'POST';
      const endpoint = isEditMode
        ? `/api/interviews/${params.id}`
        : '/api/interviews';
      const response = await apiRequest(method, endpoint, interviewData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });
      toast({
        title: 'Success',
        description: isEditMode
          ? 'Interview updated successfully'
          : 'Interview created successfully',
        variant: 'default',
      });
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${
          isEditMode ? 'update' : 'create'
        } interview: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!draft.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!draft.objective.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Objective is required',
        variant: 'destructive',
      });
      return;
    }

    const filteredQuestions = draft.questions.map((q) => q.trim());

    if (filteredQuestions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one question is required',
        variant: 'destructive',
      });
      return;
    }

    interviewMutation.mutate({
      title: draft.title,
      objective: draft.objective,
      questions: filteredQuestions,
      status: isEditMode ? undefined : 'draft',
    });
  };

  const updateDraftFromAI = () => {
    if (draft.questions.length === 0) {
      const defaultQuestions = [
        `How satisfied are you with ${draft.title || 'our product'}?`,
        `What features do you use most often?`,
        `How can we improve your experience?`,
      ];

      useInterviewStore.setState((state) => ({
        draft: {
          ...state.draft,
          questions: defaultQuestions,
        },
      }));
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto pt-10 pb-6 px-6 h-screen">
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </main>
    );
  }

  const defaultTitle = isEditMode ? 'Untitled Interview' : 'New Interview';
  const displayTitle = draft.title || defaultTitle;

  return (
    <main className="flex-1 overflow-auto pt-10 pb-6 px-6 h-screen">
      <header className="flex justify-between items-center mb-8">
        {isEditingTitle ? (
          <Input
            ref={titleInputRef}
            value={draft.title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={() => setIsEditingTitle(false)}
            placeholder={defaultTitle}
            className="text-2xl font-semibold text-gray-900 rounded border-gray-300 focus:ring-0 focus:border-gray-400 px-2 max-w-md"
            style={{ boxShadow: 'none', outline: 'none' }}
          />
        ) : (
          <h1 
            className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors"
            onClick={handleTitleClick}
          >
            {displayTitle}
          </h1>
        )}
        
        <div className="flex items-center gap-4">
          {isEditMode && (
            <Button
              variant="outline"
              onClick={() => navigate('/interview/responses')}
            >
              View Responses
            </Button>
          )}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">AI Mode</span>
            <Switch id="ai-mode" checked={draft.isAIMode} onCheckedChange={setAIMode} />
          </div>
        </div>
      </header>

      {draft.isAIMode ? (
        <div className="flex flex-col md:flex-row gap-3 h-[calc(100vh-120px)]">
          <div className="w-full md:w-2/5 bg-white rounded-xl border border-gray-300 p-6 overflow-auto">
            <h2 className="text-xl font-medium text-gray-800 mb-4">Interview Outline</h2>

            <div className="mb-4">
              <Label htmlFor="objective">Objective</Label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[75px]">
                {draft.objective || 'No objective yet'}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Questions</h3>
              {draft.questions.length > 0 ? (
                <ol className="space-y-3 pl-5 list-decimal">
                  {draft.questions.map((question, index) => (
                    <li key={index} className="pl-1">
                      <div className="text-gray-800">{question}</div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-center">
                  No questions added yet
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-3/5 h-full">
            <AIChat onUpdateDraft={updateDraftFromAI} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-300 p-6 h-[calc(100vh-120px)] overflow-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter interview title"
                className="w-full rounded-xl"
              />
            </div>

            <div className="mb-6">
              <Label htmlFor="objective">Objective</Label>
              <Textarea
                id="objective"
                value={draft.objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="What do you want to learn from this interview?"
                className="w-full rounded-xl"
                rows={3}
              />
            </div>

            <div className="mb-6">
              <QuestionInput />
            </div>

            <div className="text-center">
              <Button
                onClick={handleSubmit}
                disabled={interviewMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-xl transition duration-150"
              >
                {interviewMutation.isPending
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditMode
                  ? 'Update Interview'
                  : 'Create Interview'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}