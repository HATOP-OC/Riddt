import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, getPost, createPost, updatePost, deletePost } from '@/api';
import type { InsertPost } from '@/types';

export function usePosts(subredditName?: string) {
  return useQuery({
    queryKey: subredditName ? ['posts', subredditName] : ['posts'],
    queryFn: () => getPosts(subredditName),
  });
}

export function usePost(postId: number) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postData: InsertPost) => createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, data }: { postId: number; data: Partial<InsertPost> }) => 
      updatePost(postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
