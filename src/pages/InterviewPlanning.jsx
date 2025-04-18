import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '../hooks/use-toast';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { queryClient, apiRequest } from '../lib/queryClient';
import useInterviewPlannerStore from '../store/InterviewPlannerStore';
import useUserInterviewStore from '../store/UserInterviewStore';
import AIChat from '../components/AIChat';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

export default function InterviewPlanning() {
  const [, navigate] = useLocation();
  const { uuid } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [userInterviewLink, setUserInterviewLink] = useState('');

  const {
    initInterviewDetails,
    updateTitle,
    resetInitError,
    resetUpdateError
  } = useInterviewPlannerStore();

  const interviewDetails = useInterviewPlannerStore(state => state.interviewDetails);
  const initError = useInterviewPlannerStore(state => state.initError);
  const updateError = useInterviewPlannerStore(state => state.updateError);


  const { addUserInterview } = useUserInterviewStore();

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await initInterviewDetails(uuid);
      if(initError){
        toast({
          title: 'Error',
          description: `Failed to load interview`,
          variant: 'destructive',
        });
        resetInitError();
        navigate('/');
      }
      setTitle(interviewDetails?.title ?? '');
      setIsLoading(false);
    };
    init();
  }, []);

  // Handle click outside to cancel editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }

    const handleClickOutside = (event) => {
      if (isEditingTitle && titleInputRef.current && !titleInputRef.current.contains(event.target)) {
        setIsEditingTitle(false);
      }
    };
    setTitle(interviewDetails?.title ?? '');
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingTitle]);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      await updateTitle(title);
      setIsEditingTitle(false);
      setTitle(title);
      if(updateError){
        toast({
          title: 'Error',
          description: `Failed to update Interview title`,
          variant: 'destructive',
        });
        setTitle(interviewDetails?.title ?? '');
        resetUpdateError();
      }
    }
  };

  const handleCreateUserInterview = async () => {
    try {
      setCreateLoading(true);
      const response = await addUserInterview(interviewDetails.uuid);
      setUserInterviewLink(`${import.meta.env.VITE_DOMAIN_URL}/user-interview/${response.uuid}`);
      setShowLinkDialog(true);
      toast({
        title: 'Success',
        description: 'User interview created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create user interview',
        variant: 'destructive',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(userInterviewLink);
    toast({
      title: 'Copied!',
      description: 'Link copied to clipboard',
    });
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

  return (
    <main className="flex-1 overflow-auto pt-10 pb-6 px-6 h-screen">
      <header className="flex justify-between items-center mb-8">
        {isEditingTitle ? (
          <Input
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={() => setIsEditingTitle(false)}
            className="text-2xl font-semibold text-gray-900 rounded border-gray-300 focus:ring-0 focus:border-gray-400 px-2 max-w-md"
            style={{ boxShadow: 'none', outline: 'none' }}
          />
        ) : (
          <h1 
            className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors"
            onClick={handleTitleClick}
          >
            {interviewDetails?.title ?? ''}
          </h1>
        )}
        
        <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/interview/${uuid}/responses`)}
            >
              View Responses
            </Button>
            <Button
              variant="default"
              onClick={handleCreateUserInterview}
              disabled={createLoading}
            >
              {createLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Creating...
                </>
              ) : (
                'Create User Interview'
              )}
            </Button>
          
        </div>
      </header>
        <div className="flex flex-col md:flex-row gap-3 h-[calc(100vh-120px)]">
          <div className="w-full md:w-2/5 bg-white rounded-xl border border-gray-300 p-6 overflow-auto">
            <h2 className="text-xl font-medium text-gray-800 mb-4">Interview Outline</h2>

            <div className="mb-4 prose prose-sm max-w-none">
              <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
              >
                {interviewDetails?.outline ?? ''}
              </ReactMarkdown>
            </div>
          </div>

          <div className="w-full md:w-3/5 h-full">
            <AIChat type = "planning"/>
          </div>
        </div>

      {/* Dialog for copying link */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Interview Created</DialogTitle>
            <DialogDescription>
              Copy the link below to share with the interviewee.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <Input
              value={userInterviewLink}
              readOnly
              className="flex-1"
            />
            <Button onClick={handleCopyLink} type="button">
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}