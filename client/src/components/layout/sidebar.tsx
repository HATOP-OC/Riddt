import { useState, useEffect } from 'react';
import { Link, useLocation } from "wouter";
import { useQuery } from '@tanstack/react-query';
import { Home, TrendingUp, Bookmark, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { SubredditWithSubscription } from '@shared/schema';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  openCreateSubredditModal: () => void;
}

export function Sidebar({ isOpen, onClose, openCreateSubredditModal }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile for responsive behavior
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar on mobile when location changes
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
  }, [location, isMobile, isOpen, onClose]);

  // Fetch user's subscribed subreddits
  const { data: subreddits } = useQuery<SubredditWithSubscription[]>({
    queryKey: ['/api/subreddits'],
    enabled: !!user,
  });

  // Filter subscribed subreddits
  const subscribedSubreddits = subreddits?.filter(sr => sr.isSubscribed) || [];

  const mainLinks = [
    { href: '/', icon: <Home className="h-5 w-5 mr-3" />, label: 'Home', active: location === '/' },
    { href: '/r/all', icon: <TrendingUp className="h-5 w-5 mr-3" />, label: 'Popular', active: location === '/r/all' },
    { href: '/saved', icon: <Bookmark className="h-5 w-5 mr-3" />, label: 'Saved', active: location === '/saved' },
  ];

  const sidebarContent = (
    <>
      <div className="lg:hidden p-5 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-primary">Riddit</span>
          </Link>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="p-4">
        <div className="space-y-1">
          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className={cn(
                "flex items-center px-4 py-2 text-sm rounded-lg cursor-pointer",
                link.active
                  ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}>
                {link.icon}
                {link.label}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 space-y-1">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            My Subreddits
          </h3>
          
          {subscribedSubreddits.length > 0 ? (
            subscribedSubreddits.map((subreddit) => (
              <Link key={subreddit.id} href={`/r/${subreddit.name}`}>
                <div className={cn(
                  "flex items-center px-4 py-2 text-sm rounded-lg cursor-pointer",
                  location === `/r/${subreddit.name}`
                    ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}>
                  <div className="h-5 w-5 mr-3 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{subreddit.name.charAt(0).toUpperCase()}</span>
                  </div>
                  r/{subreddit.name}
                </div>
              </Link>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No subscriptions yet
            </div>
          )}
          
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 text-sm text-primary"
            onClick={openCreateSubredditModal}
          >
            <Plus className="h-5 w-5 mr-3" />
            Create Subreddit
          </Button>
        </div>
      </nav>
    </>
  );

  // For mobile: render the sidebar with an overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile menu overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          ></div>
        )}
        
        {/* Mobile sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 z-50 transform lg:hidden overflow-y-auto transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {sidebarContent}
        </div>
      </>
    );
  }

  // For desktop: render the sidebar as a column
  return (
    <div className="hidden lg:block w-56 flex-shrink-0 pr-4">
      <div className="sticky top-20">
        {sidebarContent}
      </div>
    </div>
  );
}
