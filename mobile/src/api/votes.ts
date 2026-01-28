import apiClient from './client';
import type { Vote, InsertVote } from '@/types';

// Create or update vote
export const vote = async (voteData: InsertVote): Promise<Vote> => {
  const response = await apiClient.post<Vote>('/api/votes', voteData);
  return response.data;
};

// Remove vote (by setting voteType to 0 or sending delete request)
export const removeVote = async (voteData: Omit<InsertVote, 'voteType'>): Promise<void> => {
  await apiClient.delete('/api/votes', { data: voteData });
};
