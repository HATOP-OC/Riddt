import apiClient from './client';
import type { SubredditWithSubscription, InsertSubreddit, Subreddit, Subscription } from '@/types';

// Get all subreddits
export const getSubreddits = async (): Promise<SubredditWithSubscription[]> => {
  const response = await apiClient.get<SubredditWithSubscription[]>('/api/subreddits');
  return response.data;
};

// Get subreddit by name
export const getSubreddit = async (name: string): Promise<SubredditWithSubscription> => {
  const response = await apiClient.get<SubredditWithSubscription>(`/api/subreddits/${name}`);
  return response.data;
};

// Create new subreddit
export const createSubreddit = async (subredditData: InsertSubreddit): Promise<Subreddit> => {
  const response = await apiClient.post<Subreddit>('/api/subreddits', subredditData);
  return response.data;
};

// Subscribe to subreddit
export const subscribe = async (subredditId: number): Promise<Subscription> => {
  const response = await apiClient.post<Subscription>('/api/subscriptions', { subredditId });
  return response.data;
};

// Unsubscribe from subreddit
export const unsubscribe = async (subredditId: number): Promise<void> => {
  await apiClient.delete(`/api/subscriptions/${subredditId}`);
};
