import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vote } from '@/api';
import type { InsertVote } from '@/types';

export function useVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (voteData: InsertVote) => vote(voteData),
    onSuccess: (_, variables) => {
      if (variables.postId) {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      }
      if (variables.commentId) {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    },
  });
}
