import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Header } from '@/components/layout';
import { VoteButtons, Badge, Avatar } from '@/components/ui';
import { CommentThread } from '@/components/comments';
import { usePost, useComments, useVote } from '@/hooks';
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore, useAuthStore } from '@/store';
import { formatRelativeTime } from '@/utils';
import type { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

export function PostDetailScreen({ route, navigation }: Props) {
  const { postId } = route.params;
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  
  const { data: post, isLoading: isLoadingPost } = usePost(postId);
  const { data: comments, isLoading: isLoadingComments } = useComments(postId);
  const voteMutation = useVote();
  
  const [localScore, setLocalScore] = React.useState(0);
  const [localUserVote, setLocalUserVote] = React.useState<number | null>(null);
  
  React.useEffect(() => {
    if (post) {
      setLocalScore(post.score);
      setLocalUserVote(post.userVote);
    }
  }, [post]);
  
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
    
    voteMutation.mutate({ postId, voteType: newVote === null ? 0 : voteType });
  };
  
  const handleSubredditPress = () => {
    if (post) {
      navigation.navigate('Subreddit', { subredditName: post.subreddit.name });
    }
  };
  
  const handleAuthorPress = () => {
    if (post) {
      navigation.navigate('Profile', { username: post.author.username });
    }
  };
  
  if (isLoadingPost || !post) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Post" showBack showMenu={false} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title={`r/${post.subreddit.name}`} 
        showBack 
        showMenu={false}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Post content */}
        <View style={[styles.postContainer, { backgroundColor: theme.colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.voteColumn}>
              <VoteButtons
                score={localScore}
                userVote={localUserVote}
                onUpvote={() => handleVote(1)}
                onDownvote={() => handleVote(-1)}
                vertical
                size="lg"
              />
            </View>
            
            <View style={styles.postContent}>
              <View style={styles.metaRow}>
                <Avatar size="sm" name={post.subreddit.name} />
                <Text 
                  style={[styles.subredditName, { color: theme.colors.foreground }]}
                  onPress={handleSubredditPress}
                >
                  r/{post.subreddit.name}
                </Text>
                <Text style={[styles.separator, { color: theme.colors.mutedForeground }]}>
                  •
                </Text>
                <Text style={[styles.meta, { color: theme.colors.mutedForeground }]}>
                  Posted by{' '}
                </Text>
                <Text 
                  style={[styles.author, { color: theme.colors.mutedForeground }]}
                  onPress={handleAuthorPress}
                >
                  u/{post.author.username}
                </Text>
                <Text style={[styles.meta, { color: theme.colors.mutedForeground }]}>
                  {' '}{formatRelativeTime(post.createdAt)}
                </Text>
              </View>
              
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
              
              {/* Content */}
              {post.content && (
                <Text style={[styles.content, { color: theme.colors.foreground }]}>
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
            </View>
          </View>
        </View>
        
        {/* Comments */}
        <View style={[styles.commentsContainer, { backgroundColor: theme.colors.card }]}>
          <CommentThread
            comments={comments || []}
            postId={postId}
            isLoading={isLoadingComments}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    margin: spacing[3],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: spacing[3],
  },
  voteColumn: {
    marginRight: spacing[3],
    alignItems: 'center',
  },
  postContent: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing[2],
  },
  subredditName: {
    fontSize: fontSizes.sm,
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
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginBottom: spacing[3],
    lineHeight: 26,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  tag: {
    marginRight: spacing[1],
  },
  content: {
    fontSize: fontSizes.base,
    lineHeight: 22,
    marginBottom: spacing[3],
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
  },
  commentsContainer: {
    margin: spacing[3],
    marginTop: 0,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});
