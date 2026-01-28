import apiClient from './client';
import type { Tag } from '@/types';

// Get all tags
export const getTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<Tag[]>('/api/tags');
  return response.data;
};

// Create new tag
export const createTag = async (name: string): Promise<Tag> => {
  const response = await apiClient.post<Tag>('/api/tags', { name });
  return response.data;
};
