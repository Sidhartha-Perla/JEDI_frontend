import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useInterviewStore } from '../store/interviewStore';
import { useState } from 'react';

const statusColorMap = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800'
};

export default function InterviewTable() {
  const [, navigate] = useLocation();
  const { filters } = useInterviewStore();
  
  // Add sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'created_date',
    direction: 'desc'
  });
  
  // Add hover state for column headers
  const [hoveredColumn, setHoveredColumn] = useState(null);
  
  const { data: interviews, isLoading, error } = useQuery({
    queryKey: ['/api/interviews', filters.status],
    queryFn: async ({ queryKey }) => {
      const statusParam = queryKey[1] ? `?status=${queryKey[1]}` : '';
      const response = await fetch(`/api/interviews${statusParam}`);
      if (!response.ok) throw new Error('Failed to fetch interviews');
      return await response.json();
    }
  });

  // Function to handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply filters and sorting to interviews
  const getSortedInterviews = () => {
    if (!interviews) return [];
    
    // First apply search filter
    let filteredData = interviews.filter((interview) => {
      if (!filters.search) return true;
      const searchTerm = filters.search.toLowerCase();
      return (
        interview.title.toLowerCase().includes(searchTerm) ||
        interview.objective.toLowerCase().includes(searchTerm)
      );
    });
    
    // Then apply sorting
    return [...filteredData].sort((a, b) => {
      if (sortConfig.key === 'title') {
        return sortConfig.direction === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      
      if (sortConfig.key === 'status') {
        return sortConfig.direction === 'asc' 
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      
      if (sortConfig.key === 'created_date') {
        const dateA = new Date(a.created_date || 0);
        const dateB = new Date(b.created_date || 0);
        return sortConfig.direction === 'asc' 
          ? dateA - dateB
          : dateB - dateA;
      }
      
      return 0;
    });
  };

  const sortedInterviews = getSortedInterviews();

  const handleRowClick = (interviewId) => {
    navigate(`/edit/${interviewId}`);
  };

  const handleDeleteClick = (e, interviewId) => {
    // Prevent row click event from triggering
    e.stopPropagation();
    // Currently does nothing as per requirements
    console.log('Delete clicked for interview:', interviewId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-800">Error loading interviews: {error.message}</p>
      </div>
    );
  }

  if (!sortedInterviews?.length) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No interviews found.</p>
      </div>
    );
  }

  // Helper to render sort icon
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="h-4 w-4 opacity-0 group-hover:opacity-50" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  // Header component for sortable columns
  const SortableHeader = ({ columnKey, title, colSpan }) => (
    <div 
      className={`col-span-${colSpan} group flex items-center gap-1 cursor-pointer`}
      onClick={() => requestSort(columnKey)}
      onMouseEnter={() => setHoveredColumn(columnKey)}
      onMouseLeave={() => setHoveredColumn(null)}
    >
      <span>{title}</span>
      <span className={hoveredColumn === columnKey || sortConfig.key === columnKey ? 'visible' : 'invisible'}>
        {renderSortIcon(columnKey)}
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="bg-gray-50 sticky top-0 z-10 px-6 py-4 rounded-t-xl">
            <div className="grid grid-cols-12 gap-4 font-medium text-gray-700">
              <SortableHeader columnKey="title" title="Interview Title" colSpan="3" />
              <div className="col-span-3">Objective</div>
              <SortableHeader columnKey="status" title="Status" colSpan="2" />
              <SortableHeader columnKey="created_date" title="Created" colSpan="2" />
              <div className="col-span-1">Responses</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {sortedInterviews.map((interview) => (
              <div
                key={interview.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 border-t border-gray-100 cursor-pointer"
                onClick={() => handleRowClick(interview.id)}
              >
                <div className="col-span-3 font-medium truncate">{interview.title}</div>
                <div className="col-span-3 truncate">{interview.objective}</div>
                <div className="col-span-2">
                  <Badge variant="outline" className={statusColorMap[interview.status]}>
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </Badge>
                </div>
                <div className="col-span-2">
                  {interview.created_date ? new Date(interview.created_date).toLocaleDateString() : 'N/A'}
                </div>
                <div className="col-span-1">{interview.responses}</div>
                <div className="col-span-1">
                  <div className="flex space-x-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-900"
                      onClick={(e) => handleDeleteClick(e, interview.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}