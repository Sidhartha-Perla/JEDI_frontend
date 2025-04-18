import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import useInterviewStore from '../store/InterviewStore';
import { useState, useEffect } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

const statusColorMap = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800'
};

const ITEMS_PER_PAGE = 10;

export default function InterviewTable() {
  const [, navigate] = useLocation();
  const { initInterviews } = useInterviewStore();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  const filters = useInterviewStore((state) => state.filters);
  const interviews = useInterviewStore((state) => state.interviews);
  const initError = useInterviewStore((state) => state.initError);

  const [hoveredColumn, setHoveredColumn] = useState(null);

  useEffect(() => {
    const load = async () => {
      await initInterviews();
      setLoading(false);
    }
    load();
  }, []);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedInterviews = () => {
    if (!interviews) return [];

    let filteredData = interviews.filter((interview) => {
      if(filters.status && interview.status !== filters.status) return false;
      if (!filters.search) return true;
      const searchTerm = filters.search.toLowerCase();
      return (
        interview.title.toLowerCase().includes(searchTerm)
      );
    });

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

      if (sortConfig.key === 'createdAt') {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortConfig.direction === 'asc' 
          ? dateA - dateB
          : dateB - dateA;
      }

      return 0;
    });
  };

  const sortedInterviews = getSortedInterviews();
  const totalPages = Math.ceil(sortedInterviews.length / ITEMS_PER_PAGE);
  const paginatedInterviews = sortedInterviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleRowClick = (interviewId) => {
    navigate(`/interview/${interviewId}`);
  };

  const handleDeleteClick = (e, interviewId) => {
    e.stopPropagation();
    console.log('Delete clicked for interview:', interviewId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-800">Error loading interviews</p>
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

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="h-4 w-4 opacity-0 group-hover:opacity-50" />;
    }

    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

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
    <div className="bg-white rounded-2xl shadow overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <div className="min-w-full">
          <div className="bg-gray-50 sticky top-0 z-10 px-6 py-4 rounded-t-xl">
            <div className="grid grid-cols-12 gap-4 font-medium text-gray-700">
              <SortableHeader columnKey="title" title="Interview Title" colSpan="5" />
              <SortableHeader columnKey="status" title="Status" colSpan="3" />
              <SortableHeader columnKey="createdAt" title="Created" colSpan="2" />
              <div className="col-span-1">Responses</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
            {paginatedInterviews.map((interview) => (
              <div
                key={interview.uuid}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 border-t border-gray-100 cursor-pointer"
                onClick={() => handleRowClick(interview.uuid)}
              >
                <div className="col-span-5 font-medium truncate">{interview.title ?? ""}</div>
                <div className="col-span-3">
                  <Badge variant="outline" className={statusColorMap[interview.status]}>
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </Badge>
                </div>
                <div className="col-span-2">
                  {new Date(interview.createdAt).toLocaleDateString()}
                </div>
                <div className="col-span-1">{interview.numResponses ?? ''}</div>
                <div className="col-span-1">
                  <div className="flex space-x-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-900"
                      onClick={(e) => handleDeleteClick(e, interview.uuid)}
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

      <div className="border-t border-gray-200 p-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
