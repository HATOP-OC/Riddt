import apiClient from './client';
import type { PostWithVote, InsertPost, Post } from '@/types';

// Get all posts with optional filters
export const getPosts = async (subredditName?: string): Promise<PostWithVote[]> => {
  const params = subredditName ? { subreddit: subredditName } : {};
  const response = await apiClient.get<PostWithVote[]>('/api/posts', { params });
  return response.data;
};

// Get single post by ID
export const getPost = async (postId: number): Promise<PostWithVote> => {
  const response = await apiClient.get<PostWithVote>(`/api/posts/${postId}`);
  return response.data;
};

// Create new post
export const createPost = async (postData: InsertPost): Promise<Post> => {
  const response = await apiClient.post<Post>('/api/posts', postData);
  return response.data;
};

// Update post
export const updatePost = async (postId: number, postData: Partial<InsertPost>): Promise<Post> => {
  const response = await apiClient.put<Post>(`/api/posts/${postId}`, postData);
  return response.data;
};

// Delete post
export const deletePost = async (postId: number): Promise<void> => {
  await apiClient.delete(`/api/posts/${postId}`);
};
