import apiClient from './client';
import type { CommentWithVote, InsertComment, Comment } from '@/types';

// Get comments for a post (nested structure)
export const getComments = async (postId: number): Promise<CommentWithVote[]> => {
  const response = await apiClient.get<CommentWithVote[]>(`/api/posts/${postId}/comments`);
  return response.data;
};

// Create new comment
export const createComment = async (postId: number, commentData: InsertComment): Promise<CommentWithVote> => {
  const response = await apiClient.post<CommentWithVote>(`/api/posts/${postId}/comments`, commentData);
  return response.data;
};

// Update comment
export const updateComment = async (commentId: number, content: string): Promise<Comment> => {
  const response = await apiClient.put<Comment>(`/api/comments/${commentId}`, { content });
  return response.data;
};

// Delete comment
export const deleteComment = async (commentId: number): Promise<void> => {
  await apiClient.delete(`/api/comments/${commentId}`);
};
