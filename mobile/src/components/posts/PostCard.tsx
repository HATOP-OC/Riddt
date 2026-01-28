import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Card, VoteButtons, Badge, Avatar } from '@/components/ui';
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore, useAuthStore } from '@/store';
import { vote } from '@/api';
import { formatRelativeTime, formatCommentCount } from '@/utils';
import type { PostWithVote, RootStackParamList } from '@/types';

interface PostCardProps {
  post: PostWithVote;
  refetchKey?: string[];
  showSubreddit?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function PostCard({ 
  post, 
  refetchKey = ['posts'], 
  showSubreddit = true 
}: PostCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [localScore, setLocalScore] = useState(post.score);
  const [localUserVote, setLocalUserVote] = useState(post.userVote);
  
  const voteMutation = useMutation({
    mutationFn: (voteType: number) => vote({ postId: post.id, voteType: voteType as 1 | -1 | 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: refetchKey });
    },
    onError: () => {
      // Revert optimistic update
      setLocalScore(post.score);
      setLocalUserVote(post.userVote);
    },
  });
  
  const handleVote = (voteType: 1 | -1) => {
    if (!isAuthenticated) {
      // Navigate to auth
      navigation.navigate('Auth');
      return;
    }
    
    // Calculate score change
    let scoreDelta = 0;
    let newVote: number | null = voteType;
    
    if (localUserVote === voteType) {
      // Remove vote
      scoreDelta = -voteType;
      newVote = null;
    } else if (localUserVote === null) {
      // New vote
      scoreDelta = voteType;
    } else {
      // Change vote
      scoreDelta = 2 * voteType;
    }
    
    // Optimistic update
    setLocalScore((prev) => prev + scoreDelta);
    setLocalUserVote(newVote);
    
    // Submit vote
    voteMutation.mutate(newVote === null ? 0 : voteType);
  };
  
  const handlePostPress = () => {
    navigation.navigate('PostDetail', { postId: post.id });
  };
  
  const handleSubredditPress = () => {
    navigation.navigate('Subreddit', { subredditName: post.subreddit.name });
  };
  
  const handleAuthorPress = () => {
    navigation.navigate('Profile', { username: post.author.username });
  };
  
  return (
    <Card style={styles.card}>
      <Pressable onPress={handlePostPress}>
        <View style={styles.container}>
          {/* Vote buttons */}
          <View style={[styles.voteColumn, { backgroundColor: theme.colors.muted }]}>
            <VoteButtons
              score={localScore}
              userVote={localUserVote}
              onUpvote={() => handleVote(1)}
              onDownvote={() => handleVote(-1)}
              vertical
              size="md"
            />
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              {showSubreddit && (
                <>
                  <TouchableOpacity
                    onPress={handleSubredditPress}
                    style={styles.subredditLink}
                  >
                    <Avatar size="sm" name={post.subreddit.name} />
                    <Text style={[styles.subredditName, { color: theme.colors.foreground }]}>
                      r/{post.subreddit.name}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.separator, { color: theme.colors.mutedForeground }]}>
                    •
                  </Text>
                </>
              )}
              <Text style={[styles.meta, { color: theme.colors.mutedForeground }]}>
                Posted by{' '}
              </Text>
              <TouchableOpacity onPress={handleAuthorPress}>
                <Text style={[styles.author, { color: theme.colors.mutedForeground }]}>
                  u/{post.author.username}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.meta, { color: theme.colors.mutedForeground }]}>
                {' '}{formatRelativeTime(post.createdAt)}
              </Text>
            </View>
            
            {/* Title */}
            <Text style={[styles.title, { color: theme.colors.foreground }]}>
              {post.title}
            </Text>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <View style={styles.tags}>
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" style={styles.tag}>
                    #{tag.name}
                  </Badge>
                ))}
              </View>
            )}
            
            {/* Content preview */}
            {post.content && (
              <Text 
                style={[styles.contentText, { color: theme.colors.foreground }]}
                numberOfLines={3}
              >
                {post.content}
              </Text>
            )}
            
            {/* Image */}
            {post.imageUrl && (
              <Image
                source={{ uri: post.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            
            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handlePostPress}
              >
                <Ionicons 
                  name="chatbubble-outline" 
                  size={18} 
                  color={theme.colors.mutedForeground} 
                />
                <Text style={[styles.actionText, { color: theme.colors.mutedForeground }]}>
                  {formatCommentCount(post.commentCount)}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons 
                  name="share-outline" 
                  size={18} 
                  color={theme.colors.mutedForeground} 
                />
                <Text style={[styles.actionText, { color: theme.colors.mutedForeground }]}>
                  Share
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons 
                  name="bookmark-outline" 
                  size={18} 
                  color={theme.colors.mutedForeground} 
                />
                <Text style={[styles.actionText, { color: theme.colors.mutedForeground }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[3],
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
  },
  voteColumn: {
    padding: spacing[2],
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing[4],
  },
  content: {
    flex: 1,
    padding: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing[2],
  },
  subredditLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subredditName: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    marginLeft: spacing[1],
  },
  separator: {
    marginHorizontal: spacing[1],
    fontSize: fontSizes.xs,
  },
  meta: {
    fontSize: fontSizes.xs,
  },
  author: {
    fontSize: fontSizes.xs,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginBottom: spacing[2],
  },
  tag: {
    marginRight: spacing[1],
  },
  contentText: {
    fontSize: fontSizes.base,
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  actionText: {
    fontSize: fontSizes.sm,
    marginLeft: spacing[1],
  },
});
