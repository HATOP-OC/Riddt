import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { VoteButtons } from '@/components/ui';
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore, useAuthStore } from '@/store';
import { vote } from '@/api';
import { formatRelativeTime } from '@/utils';
import type { CommentWithVote, RootStackParamList } from '@/types';

interface CommentItemProps {
  comment: CommentWithVote;
  postId: number;
  depth?: number;
  onReply?: (commentId: number) => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MAX_DEPTH = 5;

export function CommentItem({ 
  comment, 
  postId, 
  depth = 0,
  onReply,
}: CommentItemProps) {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  
  const [collapsed, setCollapsed] = useState(false);
  const [localScore, setLocalScore] = useState(comment.score);
  const [localUserVote, setLocalUserVote] = useState(comment.userVote);
  
  const voteMutation = useMutation({
    mutationFn: (voteType: number) => vote({ commentId: comment.id, voteType: voteType as 1 | -1 | 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: () => {
      setLocalScore(comment.score);
      setLocalUserVote(comment.userVote);
    },
  });
  
  const handleVote = (voteType: 1 | -1) => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    
    let scoreDelta = 0;
    let newVote: number | null = voteType;
    
    if (localUserVote === voteType) {
      scoreDelta = -voteType;
      newVote = null;
    } else if (localUserVote === null) {
      scoreDelta = voteType;
    } else {
      scoreDelta = 2 * voteType;
    }
    
    setLocalScore((prev) => prev + scoreDelta);
    setLocalUserVote(newVote);
    voteMutation.mutate(newVote === null ? 0 : voteType);
  };
  
  const handleAuthorPress = () => {
    navigation.navigate('Profile', { username: comment.author.username });
  };
  
  const handleReply = () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    onReply?.(comment.id);
  };
  
  const hasReplies = comment.replies && comment.replies.length > 0;
  const shouldShowReplies = depth < MAX_DEPTH;
  
  return (
    <View style={styles.container}>
      {/* Collapse indicator line */}
      {depth > 0 && (
        <TouchableOpacity 
          style={[
            styles.depthLine, 
            { backgroundColor: theme.colors.border }
          ]}
          onPress={() => setCollapsed(!collapsed)}
        />
      )}
      
      <View style={[styles.commentBody, depth > 0 && styles.nestedComment]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleAuthorPress}>
            <Text style={[styles.author, { color: theme.colors.foreground }]}>
              u/{comment.author.username}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.separator, { color: theme.colors.mutedForeground }]}>
            •
          </Text>
          <Text style={[styles.time, { color: theme.colors.mutedForeground }]}>
            {formatRelativeTime(comment.createdAt)}
          </Text>
          
          {collapsed && (
            <TouchableOpacity 
              onPress={() => setCollapsed(false)}
              style={styles.expandButton}
            >
              <Ionicons 
                name="add-circle-outline" 
                size={16} 
                color={theme.colors.mutedForeground} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        {!collapsed && (
          <>
            {/* Content */}
            <Text style={[styles.content, { color: theme.colors.foreground }]}>
              {comment.content}
            </Text>
            
            {/* Actions */}
            <View style={styles.actions}>
              <VoteButtons
                score={localScore}
                userVote={localUserVote}
                onUpvote={() => handleVote(1)}
                onDownvote={() => handleVote(-1)}
                vertical={false}
                size="sm"
              />
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleReply}
              >
                <Ionicons 
                  name="chatbubble-outline" 
                  size={16} 
                  color={theme.colors.mutedForeground} 
                />
                <Text style={[styles.actionText, { color: theme.colors.mutedForeground }]}>
                  Reply
                </Text>
              </TouchableOpacity>
              
              {hasReplies && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setCollapsed(true)}
                >
                  <Ionicons 
                    name="remove-circle-outline" 
                    size={16} 
                    color={theme.colors.mutedForeground} 
                  />
                  <Text style={[styles.actionText, { color: theme.colors.mutedForeground }]}>
                    Collapse
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Nested replies */}
            {hasReplies && shouldShowReplies && (
              <View style={styles.replies}>
                {comment.replies!.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    depth={depth + 1}
                    onReply={onReply}
                  />
                ))}
              </View>
            )}
            
            {/* Show "Continue thread" if max depth reached */}
            {hasReplies && !shouldShowReplies && (
              <TouchableOpacity style={styles.continueThread}>
                <Text style={[styles.continueText, { color: colors.primary }]}>
                  Continue this thread →
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  depthLine: {
    width: 2,
    marginRight: spacing[2],
    borderRadius: 1,
  },
  commentBody: {
    flex: 1,
    paddingVertical: spacing[2],
  },
  nestedComment: {
    paddingLeft: spacing[1],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  author: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: spacing[1],
    fontSize: fontSizes.xs,
  },
  time: {
    fontSize: fontSizes.xs,
  },
  expandButton: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },
  content: {
    fontSize: fontSizes.base,
    lineHeight: 20,
    marginBottom: spacing[2],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  actionText: {
    fontSize: fontSizes.sm,
    marginLeft: spacing[1],
  },
  replies: {
    marginTop: spacing[2],
  },
  continueThread: {
    marginTop: spacing[2],
    paddingVertical: spacing[2],
  },
  continueText: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
});
