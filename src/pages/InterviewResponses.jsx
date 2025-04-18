import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
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
import { SentimentTag, SentimentSwitch } from '../components/SentimentTag.jsx';

const ITEMS_PER_PAGE = 10;

function ResponseList({ responses, onSelectResponse }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(responses.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResponses = (responses).slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
              {(response.tags ?? []).map(tag => (
                <SentimentTag 
                  key={tag.name} 
                  name={tag.name} 
                  sentiment={tag.sentiment}
                />
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
            <div className="font-medium mb-4">{response.uuid}</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {(response.tags ?? []).map(tag => (
                <SentimentTag 
                  key={tag.name} 
                  name={tag.name} 
                  sentiment={tag.sentiment}
                />
              ))}
            </div>
            <p className="text-gray-600 mb-4">{response.summary}</p>
        </div>

        <div className="col-span-12 md:col-span-7 h-[calc(105vh-160px)]">
          <div className="h-full flex flex-col">
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
  const [sentimentFilter, setSentimentFilter] = useState(null);

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

  const getDominantSentiment = (tagName) => {
    const tag = (interview.tags ?? []).find(t => t.name === tagName);
    if (!tag) return 'neutral';
    
    const { sentiments } = tag;
    const positiveCount = sentiments.positive || 0;
    const negativeCount = sentiments.negative || 0;
    const neutralCount = sentiments.neutral || 0;
    
    if (positiveCount >= negativeCount && positiveCount >= neutralCount) return 'positive';
    if (negativeCount >= positiveCount && negativeCount >= neutralCount) return 'negative';
    return 'neutral';
  };

  // Reset sentiment filter when tag filter changes
  useEffect(() => {
    if (filters.tag) {
      setSentimentFilter(getDominantSentiment(filters.tag));
    } else {
      setSentimentFilter(null);
    }
  }, [filters.tag]);

  const filteredResponses = interviewResponses.filter(response => {
    // Filter by tag if present
    if (filters.tag) {
      const matchingTag = response.tags.find(tag => tag.name === filters.tag);
      
      // If tag doesn't exist in this response, filter it out
      if (!matchingTag) return false;
      
      // If sentiment filter is active, check if it matches
      if (sentimentFilter) {
        return matchingTag.sentiment === sentimentFilter;
      }
      
      return true;
    }
    
    return true;
  });

  const selectedResponse = interviewResponses.find(r => r.uuid === selectedResponseId);

  const handleSelectResponse = (response) => {
    setSelectedResponseId(response.uuid);
    setMessages(response.uuid);
  }

  const handleOnBack = () => {
    setSelectedResponseId(null);
    resetMessages();
  }

  const handleTagFilter = (tagName) => {
    if (filters.tag === tagName) {
      setTagFilter(null);
      setSentimentFilter(null);
    } else {
      setTagFilter(tagName);
      // Set the default sentiment filter to the dominant sentiment for this tag
      setSentimentFilter(getDominantSentiment(tagName));
    }
  }

  const handleSentimentFilter = (sentiment) => {
    setSentimentFilter(sentiment);
  }

  // Counts for the currently selected tag
  const getSentimentCounts = (tagName) => {
    const tag = interview.tags.find(t => t.name === tagName);
    if (!tag) return { positive: 0, negative: 0, neutral: 0 };
    return {
      positive: tag.sentiments.positive || 0,
      negative: tag.sentiments.negative || 0,
      neutral: tag.sentiments.neutral || 0
    };
  };

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

            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {interview.tags && interview.tags.map(tag => {
                  const sentiment = getDominantSentiment(tag.name);
                  return (
                    <SentimentTag
                      key={tag.name}
                      name={tag.name}
                      sentiment={sentiment}
                      count={Object.values(tag.sentiments).reduce((sum, count) => sum + count, 0)}
                      isSelected={filters.tag === tag.name}
                      onClick={() => handleTagFilter(tag.name)}
                    />
                  );
                })}
              </div>
            </div>

            {filters.tag && (
              <div className="mb-6">
                <SentimentSwitch 
                  activeSentiment={sentimentFilter}
                  onChange={handleSentimentFilter}
                  {...getSentimentCounts(filters.tag)}
                />
              </div>
            )}
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