import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Header } from '@/components/layout';
import { PostList } from '@/components/posts';
import { Button, Avatar } from '@/components/ui';
import { useSubreddit, usePosts } from '@/hooks';
import { subscribe, unsubscribe } from '@/api';
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore, useAuthStore } from '@/store';
import { formatMemberCount, formatOnlineCount } from '@/utils';
import type { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Subreddit'>;

export function SubredditScreen({ route, navigation }: Props) {
  const { subredditName } = route.params;
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  
  const { data: subreddit, isLoading: isLoadingSubreddit } = useSubreddit(subredditName);
  const { data: posts, isLoading: isLoadingPosts, isRefetching, refetch } = usePosts(subredditName);
  
  const subscribeMutation = useMutation({
    mutationFn: () => subscribe(subreddit!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subreddit', subredditName] });
      queryClient.invalidateQueries({ queryKey: ['subreddits'] });
    },
  });
  
  const unsubscribeMutation = useMutation({
    mutationFn: () => unsubscribe(subreddit!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subreddit', subredditName] });
      queryClient.invalidateQueries({ queryKey: ['subreddits'] });
    },
  });
  
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    
    if (subreddit?.isSubscribed) {
      unsubscribeMutation.mutate();
    } else {
      subscribeMutation.mutate();
    }
  };
  
  const SubredditHeader = (
    <View style={[styles.subredditHeader, { backgroundColor: theme.colors.card }]}>
      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: colors.primary }]} />
      
      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.avatarContainer}>
          <Avatar size="xl" name={subredditName} />
        </View>
        
        <View style={styles.titleRow}>
          <Text style={[styles.subredditName, { color: theme.colors.foreground }]}>
            r/{subredditName}
          </Text>
          
          <Button
            variant={subreddit?.isSubscribed ? 'outline' : 'default'}
            size="sm"
            onPress={handleSubscribe}
            loading={subscribeMutation.isPending || unsubscribeMutation.isPending}
          >
            {subreddit?.isSubscribed ? 'Joined' : 'Join'}
          </Button>
        </View>
        
        {subreddit?.description && (
          <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
            {subreddit.description}
          </Text>
        )}
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
              {subreddit ? formatMemberCount(subreddit.memberCount).split(' ')[0] : '0'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>
              Members
            </Text>
          </View>
          
          <View style={styles.stat}>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
                {subreddit ? subreddit.onlineCount : '0'}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>
              Online
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title={`r/${subredditName}`} 
        showBack 
        showMenu={false}
      />
      
      <PostList
        posts={posts || []}
        isLoading={isLoadingPosts || isLoadingSubreddit}
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
        refetchKey={['posts', subredditName]}
        showSubreddit={false}
        ListHeaderComponent={SubredditHeader}
        emptyMessage="No posts in this subreddit yet"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subredditHeader: {
    marginBottom: spacing[3],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  banner: {
    height: 100,
  },
  infoContainer: {
    padding: spacing[4],
    paddingTop: 0,
  },
  avatarContainer: {
    marginTop: -32,
    marginBottom: spacing[3],
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  subredditName: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
  },
  description: {
    fontSize: fontSizes.base,
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  stats: {
    flexDirection: 'row',
    gap: spacing[6],
  },
  stat: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSizes.sm,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing[1],
  },
});
