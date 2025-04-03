import { useState } from "react";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { PostWithVote } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Share2,
  Bookmark,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: PostWithVote;
  refetchKey?: string;
}

export function PostCard({ post, refetchKey = "/api/posts" }: PostCardProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [voteScore, setVoteScore] = useState(post.score);
  const [userVote, setUserVote] = useState(post.userVote);

  // Format date
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (voteType: number) => {
      const res = await apiRequest("POST", "/api/votes", {
        postId: post.id,
        voteType,
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate posts query to refetch
      queryClient.invalidateQueries({ queryKey: [refetchKey] });
    },
    onError: (error: Error) => {
      // Revert optimistic update
      setVoteScore(post.score);
      setUserVote(post.userVote);
      
      toast({
        title: "Vote failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVote = (voteType: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote",
        variant: "destructive",
      });
      return;
    }

    // Calculate score delta
    let scoreDelta = 0;
    
    if (userVote === voteType) {
      // Clicking same vote button again: remove vote
      scoreDelta = -voteType;
      setUserVote(null);
    } else if (userVote === null) {
      // No previous vote: add new vote
      scoreDelta = voteType;
      setUserVote(voteType);
    } else {
      // Changing vote: add 2x vote value
      scoreDelta = 2 * voteType;
      setUserVote(voteType);
    }
    
    // Optimistic update
    setVoteScore(prevScore => prevScore + scoreDelta);
    
    // Submit vote
    voteMutation.mutate(userVote === voteType ? 0 : voteType);
  };

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on a link or button
    if (
      (e.target as HTMLElement).tagName === "A" ||
      (e.target as HTMLElement).tagName === "BUTTON" ||
      (e.target as HTMLElement).closest("button") !== null
    ) {
      return;
    }
    
    navigate(`/post/${post.id}`);
  };

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex" onClick={handlePostClick}>
        {/* Voting */}
        <div className="flex flex-col items-center px-3 py-4 bg-gray-50 dark:bg-gray-800 dark:border-r dark:border-gray-700">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleVote(1);
            }}
            className={`text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ${
              userVote === 1 ? "text-primary" : ""
            }`}
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
          <span className="text-sm font-medium my-1">{voteScore}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleVote(-1);
            }}
            className={`text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ${
              userVote === -1 ? "text-pink-500" : ""
            }`}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Post Header */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            <Link
              href={`/r/${post.subreddit.name}`}
              className="flex items-center font-medium text-black dark:text-white hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-4 w-4 mr-1 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-[8px]">
                  {post.subreddit.name.charAt(0).toUpperCase()}
                </span>
              </div>
              r/{post.subreddit.name}
            </Link>
            <span className="mx-1">•</span>
            <span>
              Posted by{" "}
              <Link
                href={`/user/${post.author.username}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                u/{post.author.username}
              </Link>{" "}
              {formattedDate}
            </span>
          </div>

          {/* Post Title */}
          <h2 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
            {post.title}
          </h2>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Post Content */}
          {post.content && (
            <div className="mb-4 text-gray-800 dark:text-gray-200">
              <p>{post.content}</p>
            </div>
          )}

          {/* Post Image (if available) */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="rounded-lg mb-4 w-full h-auto"
            />
          )}

          {/* Post Actions */}
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center mr-4 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <MessageSquare className="h-5 w-5 mr-1" />
              {post.commentCount} Comments
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center mr-4 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Share2 className="h-5 w-5 mr-1" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center mr-4 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Bookmark className="h-5 w-5 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
