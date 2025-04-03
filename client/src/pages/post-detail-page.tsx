import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { PostWithVote, CommentWithVote } from "@shared/schema";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PostCard } from "@/components/post-card";
import { CommentSection } from "@/components/comment-section";
import { CreatePostModal } from "@/components/modals/create-post-modal";
import { CreateSubredditModal } from "@/components/modals/create-subreddit-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function PostDetailPage() {
  const { postId } = useParams();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [createSubredditModalOpen, setCreateSubredditModalOpen] = useState(false);

  // Parse postId to number
  const postIdNum = parseInt(postId);

  // Fetch post details
  const { data: post, isLoading: isLoadingPost, error: postError } = useQuery<PostWithVote>({
    queryKey: [`/api/posts/${postIdNum}`],
    enabled: !isNaN(postIdNum),
  });

  // Fetch comments
  const { data: comments, isLoading: isLoadingComments } = useQuery<CommentWithVote[]>({
    queryKey: [`/api/posts/${postIdNum}/comments`],
    enabled: !isNaN(postIdNum),
  });

  // Navigate back to home if post not found
  useEffect(() => {
    if (postError) {
      navigate("/");
    }
  }, [postError, navigate]);

  const goBack = () => {
    navigate(-1);
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
              {/* Back button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="mb-4"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              {/* Post Detail */}
              {isLoadingPost ? (
                <Card className="p-4 mb-4 animate-pulse">
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
              ) : post ? (
                <div className="mb-4">
                  <PostCard 
                    post={post} 
                    refetchKey={`/api/posts/${postIdNum}`}
                  />
                </div>
              ) : (
                <Card className="p-6 text-center mb-4">
                  <h2 className="text-lg font-medium mb-2">Post not found</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    The post you're looking for doesn't exist or has been removed.
                  </p>
                </Card>
              )}

              {/* Comments Section */}
              {post && (
                <CommentSection 
                  postId={post.id} 
                  comments={comments || []}
                />
              )}
            </div>
          </div>
        </div>
      </main>

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
