import apiClient from './client';
import type { UserWithBadges, Post, Comment, BadgeType, UserBadge } from '@/types';

// Get user profile by username
export const getUserProfile = async (username: string): Promise<UserWithBadges> => {
  const response = await apiClient.get<UserWithBadges>(`/api/users/${username}`);
  return response.data;
};

// Get user's badges
export const getUserBadges = async (username: string): Promise<UserBadge[]> => {
  const response = await apiClient.get<UserBadge[]>(`/api/users/${username}/badges`);
  return response.data;
};

// Get all badge types
export const getBadgeTypes = async (): Promise<BadgeType[]> => {
  const response = await apiClient.get<BadgeType[]>('/api/badge-types');
  return response.data;
};
