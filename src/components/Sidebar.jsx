import { Link, useLocation } from 'wouter';
import { cn } from '../lib/utils';
import { UserCircle } from 'lucide-react';

const navItems = [
  { name: 'All interviews', path: '/' }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 border-b border-gray-200 flex items-center justify-between fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center">
            <UserCircle className="h-5 w-5" />
          </div>
          <span className="text-gray-900 font-semibold">UserInterviews</span>
        </div>
        <button className="text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar for desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 h-full hidden md:block">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center">
              <UserCircle className="h-5 w-5" />
            </div>
            <span className="text-gray-900 font-semibold text-lg">UserInterviews</span>
          </div>
        </div>

        <nav className="mt-5">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path} className={cn(
                  "block px-5 py-3 hover:bg-gray-50",
                  location === item.path
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 font-medium"
                    : "text-gray-700"
                )}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
