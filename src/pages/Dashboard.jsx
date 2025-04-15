import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { PlusIcon, SearchIcon, MenuIcon } from 'lucide-react';
import InterviewTable from '../components/InterviewTable';
import { useInterviewStore } from '../store/interviewStore';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { filters, setSearch, setStatusFilter } = useInterviewStore();

  const statusFilters = [
    { label: 'Draft', value: 'draft' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  const handleCreateInterview = () => {
    navigate('/create');
  };

  return (
    <main className="flex-1 overflow-auto pt-10 pb-6 px-6 h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">All Interviews</h1>
        <button className="md:hidden">
          <MenuIcon className="h-6 w-6 text-gray-500" />
        </button>
      </header>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Button
          onClick={handleCreateInterview}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center transition duration-150"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Create New Interview
        </Button>

        {/* Search Bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant="outline"
          className={`px-4 py-2 text-sm font-medium rounded-full ${
            filters.status === null
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => setStatusFilter(null)}
        >
          All
        </Button>

        {statusFilters.map((filter) => (
          <Button
            key={filter.value || 'all'}
            variant="outline"
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              filters.status === filter.value
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Interviews Table */}
      <InterviewTable />
    </main>
  );
}
