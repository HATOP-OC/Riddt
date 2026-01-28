import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { PostCard } from './PostCard';
import { spacing } from '@/theme';
import { useThemeStore } from '@/store';
import type { PostWithVote } from '@/types';

interface PostListProps {
  posts: PostWithVote[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  refetchKey?: string[];
  showSubreddit?: boolean;
  emptyMessage?: string;
  ListHeaderComponent?: React.ReactElement;
}

export function PostList({
  posts,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onEndReached,
  refetchKey,
  showSubreddit = true,
  emptyMessage = 'No posts yet',
  ListHeaderComponent,
}: PostListProps) {
  const { theme } = useThemeStore();
  
  const renderItem = ({ item }: { item: PostWithVote }) => (
    <PostCard 
      post={item} 
      refetchKey={refetchKey} 
      showSubreddit={showSubreddit}
    />
  );
  
  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    
    return (
      <View style={styles.centered}>
        <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  };
  
  const renderFooter = () => {
    if (!onEndReached || posts.length === 0) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };
  
  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={[
        styles.container,
        posts.length === 0 && styles.emptyContainer,
      ]}
      ListEmptyComponent={renderEmpty}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[3],
    paddingTop: spacing[2],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
});
