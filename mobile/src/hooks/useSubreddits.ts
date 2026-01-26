import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubreddits, getSubreddit, createSubreddit, subscribe, unsubscribe } from '@/api';
import type { InsertSubreddit } from '@/types';

export function useSubreddits() {
  return useQuery({
    queryKey: ['subreddits'],
    queryFn: getSubreddits,
  });
}

export function useSubreddit(name: string) {
  return useQuery({
    queryKey: ['subreddit', name],
    queryFn: () => getSubreddit(name),
    enabled: !!name,
  });
}

export function useCreateSubreddit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (subredditData: InsertSubreddit) => createSubreddit(subredditData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subreddits'] });
    },
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (subredditId: number) => subscribe(subredditId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subreddits'] });
      queryClient.invalidateQueries({ queryKey: ['subreddit'] });
    },
  });
}

export function useUnsubscribe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (subredditId: number) => unsubscribe(subredditId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subreddits'] });
      queryClient.invalidateQueries({ queryKey: ['subreddit'] });
    },
  });
}
