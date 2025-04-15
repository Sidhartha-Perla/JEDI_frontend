
import { useState } from 'react';
import { useParams } from 'wouter';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import AIChat from '../components/AIChat';

// Mock data
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
  }
];

const allTags = Array.from(new Set(mockResponses.flatMap(r => r.tags)));

export default function InterviewResponses() {
  const { id } = useParams();
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);

  const filteredResponses = selectedTags.length > 0
    ? mockResponses.filter(r => r.tags.some(t => selectedTags.includes(t)))
    : mockResponses;

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <main className="flex-1 overflow-auto pt-10 pb-6 px-6 h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Interview Responses</h1>
          <div className="mt-2 text-gray-600">Total Responses: {mockResponses.length}</div>
        </header>

        <div className="mb-6 space-y-2">
          <h2 className="text-lg font-medium">Filter by Tags</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5">
            <div className="space-y-4">
              {filteredResponses.map(response => (
                <Card
                  key={response.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedResponse?.id === response.id ? 'border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedResponse(response)}
                >
                  <div className="font-medium mb-2">{response.user}</div>
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
          </div>

          <div className="col-span-12 md:col-span-7">
            {selectedResponse ? (
              <div className="border rounded-lg p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Response Details</h2>
                  <p className="text-gray-600 mb-4">{selectedResponse.summary}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedResponse.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Interview Chat</h3>
                  <AIChat messages={selectedResponse.messages} readOnly={true} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a response to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
