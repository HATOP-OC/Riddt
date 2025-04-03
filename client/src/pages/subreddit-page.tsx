import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { PostWithVote, SubredditWithSubscription } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PostCard } from "@/components/post-card";
import { CreatePostModal } from "@/components/modals/create-post-modal";
import { CreateSubredditModal } from "@/components/modals/create-subreddit-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SubredditPage() {
  const { subredditName } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [createSubredditModalOpen, setCreateSubredditModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("hot");

  // Fetch subreddit information
  const { data: subreddit, isLoading: isLoadingSubreddit } = useQuery<SubredditWithSubscription>({
    queryKey: [`/api/subreddits/${subredditName}`],
    enabled: !!subredditName,
  });

  // Fetch posts for this subreddit
  const { data: posts, isLoading: isLoadingPosts } = useQuery<PostWithVote[]>({
    queryKey: [`/api/posts?subreddit=${subredditName}`],
    enabled: !!subredditName,
  });

  // Subscribe/unsubscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (subscribe: boolean) => {
      if (subscribe) {
        return await apiRequest("POST", "/api/subscriptions", {
          subredditId: subreddit?.id,
        });
      } else {
        return await apiRequest("DELETE", `/api/subscriptions/${subreddit?.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/subreddits/${subredditName}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/subreddits"] });
      
      toast({
        title: subreddit?.isSubscribed ? "Unsubscribed" : "Subscribed",
        description: subreddit?.isSubscribed 
          ? `You've unsubscribed from r/${subredditName}` 
          : `You've subscribed to r/${subredditName}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sort posts based on selected sorting option
  const sortedPosts = posts?.slice().sort((a, b) => {
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

  // Handle subscribe/unsubscribe
  const handleSubscriptionToggle = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to subreddits",
        variant: "destructive",
      });
      return;
    }
    
    subscribeMutation.mutate(!subreddit?.isSubscribed);
  };

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
              {/* Subreddit Header */}
              {isLoadingSubreddit ? (
                <Card className="mb-4 animate-pulse">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </Card>
              ) : subreddit ? (
                <Card className="mb-4 overflow-hidden">
                  <div className="bg-primary h-20 relative">
                    <div className="absolute -bottom-3 left-4 bg-white dark:bg-gray-800 rounded-lg p-1">
                      <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {subreddit.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-5 p-4">
                    <h2 className="text-lg font-medium mb-1">r/{subreddit.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {subreddit.description || "No description available."}
                    </p>
                    <div className="flex items-center text-sm mb-4">
                      <div className="flex items-center mr-4">
                        <Users className="h-5 w-5 mr-1 text-gray-400" />
                        {subreddit.memberCount} members
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-5 w-5 mr-1 text-gray-400" />
                        {subreddit.onlineCount} online
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      variant={subreddit.isSubscribed ? "outline" : "default"}
                      onClick={handleSubscriptionToggle}
                      disabled={subscribeMutation.isPending}
                    >
                      {subscribeMutation.isPending 
                        ? "Processing..." 
                        : subreddit.isSubscribed 
                          ? "Leave"
                          : "Join"}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="mb-4 p-6 text-center">
                  <h2 className="text-lg font-medium mb-2">Subreddit not found</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    The subreddit you're looking for doesn't exist.
                  </p>
                  <Button 
                    onClick={() => setCreateSubredditModalOpen(true)}
                  >
                    Create r/{subredditName}
                  </Button>
                </Card>
              )}

              {/* Sorting */}
              {subreddit && (
                <Card className="mb-4 p-3">
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCreatePostModalOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Post
                    </Button>
                    <Tabs defaultValue={sortBy} onValueChange={(value) => setSortBy(value)}>
                      <TabsList>
                        <TabsTrigger value="hot">Hot</TabsTrigger>
                        <TabsTrigger value="new">New</TabsTrigger>
                        <TabsTrigger value="top">Top</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </Card>
              )}

              {/* Posts List */}
              {subreddit ? (
                <div className="space-y-4">
                  {isLoadingPosts ? (
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
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        refetchKey={`/api/posts?subreddit=${subredditName}`}
                      />
                    ))
                  ) : (
                    <Card className="p-8 text-center">
                      <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Be the first to post in r/{subredditName}
                      </p>
                      <Button onClick={() => setCreatePostModalOpen(true)}>
                        Create the first post
                      </Button>
                    </Card>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Create Post Button */}
      {subreddit && (
        <div className="fixed right-4 bottom-4 md:hidden">
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setCreatePostModalOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreatePostModal 
        isOpen={createPostModalOpen} 
        onClose={() => setCreatePostModalOpen(false)} 
        defaultSubredditName={subredditName}
      />
      <CreateSubredditModal 
        isOpen={createSubredditModalOpen} 
        onClose={() => setCreateSubredditModalOpen(false)} 
      />
    </div>
  );
}
