import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';
import useInterviewResponsesStore from '../store/InterviewResponsesStore';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '../components/ui/pagination';
import AIChat from '../components/AIChat';
import { useEffect } from 'react';

/*
const mockResponses = [
  {
    id: 1,
    user: "john.doe@example.com",
    summary: "Overall positive feedback about the product. User highlighted the ease of use and suggested improvements in documentation.",
    tags: ["Positive", "Documentation", "UX"],
    messages: [
      { content: "How satisfied are you with our product?", isUser: false },
      { content: "I'm very satisfied! The interface is intuitive.", isUser: true },
      { content: "What features do you use most often?", isUser: false },
      { content: "I mainly use the dashboard and reporting features.", isUser: true },
      { content: "How satisfied are you with our product?", isUser: false },
      { content: "I'm very satisfied! The interface is intuitive.", isUser: true },
      { content: "What features do you use most often?", isUser: false },
      { content: "I mainly use the dashboard and reporting features.", isUser: true },
      { content: "How satisfied are you with our product?", isUser: false },
      { content: "I'm very satisfied! The interface is intuitive.", isUser: true },
      { content: "What features do you use most often?", isUser: false },
      { content: "I mainly use the dashboard and reporting features.", isUser: true }
    ]
  },
  {
    id: 2,
    user: "jane.smith@example.com",
    summary: "Mixed feedback focusing on performance issues but praising customer support.",
    tags: ["Performance", "Support", "Mixed"],
    messages: [
      { content: "How satisfied are you with our product?", isUser: false },
      { content: "Mostly satisfied, but there are some performance issues.", isUser: true },
      { content: "Could you elaborate on the performance issues?", isUser: false },
      { content: "The system sometimes lags during peak hours.", isUser: true }
    ]
  },

];
*/

const ITEMS_PER_PAGE = 10;

function ResponseList({ responses, onSelectResponse }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(responses.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResponses = responses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {paginatedResponses.map(response => (
          <Card
            key={response.uuid}
            className="p-4 cursor-pointer hover:border-blue-200 transition-colors"
            onClick={() => onSelectResponse(response)}
          >
            <div className="font-medium mb-2">{response.uuid}</div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {response.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {response.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function ResponseDetails({ response, onBack }) {
  const messages = useInterviewResponsesStore(state => state.currentResponseMessages);

  return (
    <main className="flex-1 overflow-auto pt-10 pb-6 px-6 h-screen">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6"
      >
        <ChevronLeft className="h-4 w-4 -mr-1" />
        Back to Responses
      </Button>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-5">
            <h2 className="text-xl font-semibold mb-4">Response Summary</h2>
            <div className="text-gray-600 mb-4">{response.uuid}</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {response.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-gray-600 mb-4">{response.summary}</p>
        </div>

        <div className="col-span-12 md:col-span-7 h-[calc(105vh-160px)]">
          <div className="border rounded-lg p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Interview Chat</h2>
            <div className="flex-1 overflow-hidden">
              <AIChat type="response"/>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function InterviewResponses() {
  const { uuid } = useParams();
  const [selectedResponseId, setSelectedResponseId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { initResponseDetails, setTagFilter, setMessages, resetMessages } = useInterviewResponsesStore();

  const interview = useInterviewResponsesStore((state) => state.interview);
  const interviewResponses = useInterviewResponsesStore((state) => state.interviewResponses);
  const filters = useInterviewResponsesStore((state) => state.filters);
  const initError = useInterviewResponsesStore(state => state.initError);

  useEffect(() => {
    const init = async () => {
      await initResponseDetails(uuid);
      setIsLoading(false);
    }
    init();
  }, []);

  const filteredResponses = interviewResponses.filter(response => !filters.tag || response.tags.includes(filters.tag));

  const selectedResponse = interviewResponses.find(r => r.uuid === selectedResponseId);

  const handleSelectResponse = (response) => {
    console.log("selected response: ", response);
    setSelectedResponseId(response.uuid);
    setMessages(response.uuid);
  }

  const handleOnBack = () => {
    setSelectedResponseId(null);
    resetMessages();
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-800">Error loading Responses</p>
      </div>
    );
  }

  if (selectedResponse) {
    return (
      <ResponseDetails 
        response={selectedResponse}
        onBack={handleOnBack}
      />
    );
  }

  return (
    <main className="flex-1 overflow-auto pt-10 pb-6 px-6 h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Interview Responses</h1>
          <div className="mt-2 text-gray-600">Total Responses: {interviewResponses.length}</div>

          <div className="mt-8">
            <h2 className="font-medium mb-2">Summary</h2>
            <p className="text-gray-600 mb-6">
              {interview.summary}
            </p>

            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(interviewResponses.flatMap(r => r.tags))).map(tag => (
                  <Badge 
                    key={tag}
                    variant={filters.tag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setTagFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </header>

        <ResponseList 
          responses={filteredResponses}
          onSelectResponse={handleSelectResponse}
        />
      </div>
    </main>
  );
}
