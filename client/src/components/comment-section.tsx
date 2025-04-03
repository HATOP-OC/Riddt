import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentWithVote } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronUp,
  ChevronDown,
  Reply,
  Trash2,
  Edit,
  X,
  Check,
  CornerDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CommentSectionProps {
  postId: number;
  comments: CommentWithVote[];
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: number }) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/comments`, data);
      return await res.json();
    },
    onSuccess: () => {
      setNewComment("");
      setReplyingTo(null);
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const res = await apiRequest("PUT", `/api/comments/${id}`, { content });
      return await res.json();
    },
    onSuccess: () => {
      setEditingComment(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("DELETE", `/api/comments/${commentId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ commentId, voteType }: { commentId: number; voteType: number }) => {
      const res = await apiRequest("POST", "/api/votes", {
        commentId,
        voteType,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Vote failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({ content: newComment });
  };

  const handleSubmitReply = (parentId: number) => {
    if (!replyContent.trim()) return;
    
    addCommentMutation.mutate({
      content: replyContent,
      parentId,
    });
  };

  const handleStartEdit = (comment: CommentWithVote) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const handleSubmitEdit = (commentId: number) => {
    if (!editContent.trim()) return;
    
    editCommentMutation.mutate({
      id: commentId,
      content: editContent,
    });
  };

  const handleVote = (commentId: number, userVote: number | null, voteType: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote",
        variant: "destructive",
      });
      return;
    }

    // If clicking the same vote button, remove the vote
    const finalVoteType = userVote === voteType ? 0 : voteType;
    
    voteMutation.mutate({
      commentId,
      voteType: finalVoteType,
    });
  };

  const renderComment = (comment: CommentWithVote, isReply = false) => {
    const isAuthor = user && user.id === comment.userId;
    const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
      addSuffix: true,
    });

    return (
      <div key={comment.id} className={`mb-3 ${isReply ? "ml-5 pl-5 border-l-2 border-gray-200 dark:border-gray-700" : ""}`}>
        <div className="flex items-start space-x-3">
          {/* Vote */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleVote(comment.id, comment.userVote, 1)}
              className={`text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 h-6 w-6 p-0 ${
                comment.userVote === 1 ? "text-primary" : ""
              }`}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium my-1">{comment.score}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleVote(comment.id, comment.userVote, -1)}
              className={`text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 h-6 w-6 p-0 ${
                comment.userVote === -1 ? "text-pink-500" : ""
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Comment Content */}
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <Link href={`/user/${comment.author.username}`} className="font-medium text-sm text-gray-900 dark:text-white hover:underline">
                <div className="flex items-center">
                  <Avatar className="h-5 w-5 mr-1.5">
                    <AvatarFallback>{comment.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  u/{comment.author.username}
                </div>
              </Link>
              {isAuthor && (
                <Badge variant="outline" className="ml-2 py-0 h-5">OP</Badge>
              )}
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{formattedDate}</span>
            </div>
            
            {editingComment === comment.id ? (
              <div className="mb-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="mb-2 min-h-[80px]"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancelEdit}
                    className="flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleSubmitEdit(comment.id)}
                    className="flex items-center"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                <p>{comment.content}</p>
              </div>
            )}
            
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (replyingTo === comment.id) {
                    setReplyingTo(null);
                  } else {
                    setReplyingTo(comment.id);
                    setReplyContent("");
                  }
                }}
                className="h-6 px-2 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              
              {isAuthor && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleStartEdit(comment)}
                    className="h-6 px-2 text-xs ml-2"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                    className="h-6 px-2 text-xs ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-3">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
                <div className="mt-2 flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            )}
            
            {/* Render replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <form onSubmit={handleSubmitComment} className="flex flex-col">
          <Textarea
            placeholder="What are your thoughts?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="mt-2 flex justify-end">
            <Button 
              type="submit" 
              disabled={!newComment.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? "Posting..." : "Comment"}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
}
