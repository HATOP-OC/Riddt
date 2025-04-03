import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { PostWithVote } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PostCard } from "@/components/post-card";
import { CreatePostModal } from "@/components/modals/create-post-modal";
import { CreateSubredditModal } from "@/components/modals/create-subreddit-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [createSubredditModalOpen, setCreateSubredditModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("hot");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Fetch posts
  const { data: posts, isLoading } = useQuery<PostWithVote[]>({
    queryKey: ["/api/posts"],
  });

  // Fetch popular tags
  const { data: tags } = useQuery({
    queryKey: ["/api/tags"],
  });

  // Filter posts by the active tag
  const filteredPosts = activeTag 
    ? posts?.filter(post => 
        post.tags?.some(tag => tag.name.toLowerCase() === activeTag.toLowerCase())
      )
    : posts;

  // Sort posts based on selected sorting option
  const sortedPosts = filteredPosts?.slice().sort((a, b) => {
    if (sortBy === "new") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "top") {
      return b.score - a.score;
    } else {
      // 'hot' sorting: combination of score and recency
      const aScore = a.score / (1 + Math.sqrt((Date.now() - new Date(a.createdAt).getTime()) / 36000000));
      const bScore = b.score / (1 + Math.sqrt((Date.now() - new Date(b.createdAt).getTime()) / 36000000));
      return bScore - aScore;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        openCreatePostModal={() => setCreatePostModalOpen(true)}
      />

      <main className="flex-1 lg:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row">
            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
              openCreateSubredditModal={() => setCreateSubredditModalOpen(true)}
            />

            <div className="lg:flex-1 max-w-3xl w-full">
              {/* Filters and Sorting */}
              <Card className="mb-4 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">r/all</span>
                  </div>
                  <Tabs defaultValue={sortBy} onValueChange={(value) => setSortBy(value)}>
                    <TabsList>
                      <TabsTrigger value="hot">Hot</TabsTrigger>
                      <TabsTrigger value="new">New</TabsTrigger>
                      <TabsTrigger value="top">Top</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </Card>

              {/* Popular Tags Filter */}
              {tags && tags.length > 0 && (
                <Card className="mb-4 p-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium mr-1">Filter by:</span>
                    {activeTag && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTag(null)}
                        className="h-7 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                    {tags.slice(0, 10).map((tag: any) => (
                      <Badge 
                        key={tag.id}
                        variant={activeTag === tag.name ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground"
                        onClick={() => setActiveTag(activeTag === tag.name ? null : tag.name)}
                      >
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Create Post Bar (Mobile) */}
              <div className="md:hidden bg-white dark:bg-gray-800 rounded-lg shadow mb-4 p-3">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-start"
                  onClick={() => setCreatePostModalOpen(true)}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  <span>Create Post</span>
                </Button>
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="p-4 animate-pulse">
                      <div className="flex space-x-4">
                        <div className="w-10 bg-gray-200 dark:bg-gray-700 h-full"></div>
                        <div className="flex-1 space-y-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : sortedPosts && sortedPosts.length > 0 ? (
                  sortedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <h3 className="text-lg font-medium mb-2">No posts found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {activeTag 
                        ? `No posts found with the tag #${activeTag}` 
                        : "No posts available yet"}
                    </p>
                    <Button onClick={() => setCreatePostModalOpen(true)}>
                      Create the first post
                    </Button>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Sidebar (achievements & popular tags) */}
            <div className="hidden xl:block w-80 flex-shrink-0 pl-4">
              <div className="sticky top-20 space-y-4">
                {/* Achievement Badges */}
                {user && (
                  <Card className="overflow-hidden">
                    <div className="px-4 py-3 border-b dark:border-gray-700">
                      <h3 className="font-medium">Achievement Badges</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* We'll show actual badges when implemented */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Prolific Commenter</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Left 50+ comments</p>
                          </div>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="text-xs h-6"
                          onClick={() => {}}
                        >
                          View All
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Popular Tags */}
                <Card className="overflow-hidden">
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <h3 className="font-medium">Popular Tags</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {tags?.slice(0, 10).map((tag: any) => (
                        <Badge 
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground"
                          onClick={() => {
                            setActiveTag(tag.name);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          #{tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Create Post Button */}
      <div className="fixed right-4 bottom-4 md:hidden">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setCreatePostModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Modals */}
      <CreatePostModal 
        isOpen={createPostModalOpen} 
        onClose={() => setCreatePostModalOpen(false)} 
      />
      <CreateSubredditModal 
        isOpen={createSubredditModalOpen} 
        onClose={() => setCreateSubredditModalOpen(false)} 
      />
    </div>
  );
}
