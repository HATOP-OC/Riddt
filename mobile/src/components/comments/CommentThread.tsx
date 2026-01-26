import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui';
import { createComment } from '@/api';
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore, useAuthStore } from '@/store';
import type { CommentWithVote } from '@/types';

interface CommentThreadProps {
  comments: CommentWithVote[];
  postId: number;
  isLoading?: boolean;
}

export function CommentThread({ comments, postId, isLoading = false }: CommentThreadProps) {
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => 
      createComment(postId, { 
        content, 
        postId,
        parentId: replyingTo || undefined 
      }),
    onSuccess: () => {
      setCommentText('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
  
  const handleSubmit = () => {
    if (!commentText.trim()) return;
    createCommentMutation.mutate(commentText.trim());
  };
  
  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
  };
  
  const cancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };
  
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Comment input */}
      {isAuthenticated && (
        <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
          {replyingTo && (
            <View style={styles.replyingTo}>
              <Text style={[styles.replyingText, { color: theme.colors.mutedForeground }]}>
                Replying to comment
              </Text>
              <Button 
                variant="ghost" 
                size="sm" 
                onPress={cancelReply}
              >
                Cancel
              </Button>
            </View>
          )}
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.colors.muted,
                color: theme.colors.foreground,
              }
            ]}
            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
            placeholderTextColor={theme.colors.mutedForeground}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={10000}
          />
          <Button
            onPress={handleSubmit}
            disabled={!commentText.trim() || createCommentMutation.isPending}
            loading={createCommentMutation.isPending}
            size="sm"
          >
            {replyingTo ? 'Reply' : 'Comment'}
          </Button>
        </View>
      )}
      
      {/* Comments count */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.foreground }]}>
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </Text>
      </View>
      
      {/* Comments list */}
      {comments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
            No comments yet. Be the first to comment!
          </Text>
        </View>
      ) : (
        <View style={styles.commentsList}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={handleReply}
            />
          ))}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    padding: spacing[8],
    alignItems: 'center',
  },
  inputContainer: {
    padding: spacing[3],
    borderTopWidth: 1,
    gap: spacing[2],
  },
  replyingTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replyingText: {
    fontSize: fontSizes.sm,
  },
  input: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    fontSize: fontSizes.base,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  header: {
    padding: spacing[3],
    paddingBottom: spacing[2],
  },
  headerText: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  empty: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSizes.base,
    textAlign: 'center',
  },
  commentsList: {
    padding: spacing[3],
  },
});
