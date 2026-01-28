import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '@/components/layout';
import { PostList } from '@/components/posts';
import { Button } from '@/components/ui';
import { usePosts } from '@/hooks';
import { colors, spacing, borderRadius } from '@/theme';
import { useThemeStore } from '@/store';
import type { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type SortOption = 'hot' | 'new' | 'top';

export function HomeScreen({ navigation }: Props) {
  const { theme } = useThemeStore();
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  
  const { data: posts, isLoading, isRefetching, refetch } = usePosts();
  
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const handleCreatePost = () => {
    navigation.navigate('CreatePost', undefined);
  };
  
  // Sort posts based on selected option
  const sortedPosts = React.useMemo(() => {
    if (!posts) return [];
    
    const sorted = [...posts];
    switch (sortBy) {
      case 'hot':
        // Simple hot algorithm: score / time factor
        return sorted.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          const hoursSinceA = (Date.now() - timeA) / (1000 * 60 * 60);
          const hoursSinceB = (Date.now() - timeB) / (1000 * 60 * 60);
          const hotScoreA = a.score / Math.pow(hoursSinceA + 2, 1.5);
          const hotScoreB = b.score / Math.pow(hoursSinceB + 2, 1.5);
          return hotScoreB - hotScoreA;
        });
      case 'new':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'top':
        return sorted.sort((a, b) => b.score - a.score);
      default:
        return sorted;
    }
  }, [posts, sortBy]);
  
  const SortTab = ({ option, label }: { option: SortOption; label: string }) => (
    <TouchableOpacity
      style={[
        styles.sortTab,
        sortBy === option && { backgroundColor: colors.primary + '20' },
      ]}
      onPress={() => setSortBy(option)}
    >
      <Ionicons
        name={
          option === 'hot' ? 'flame' :
          option === 'new' ? 'time' : 'trending-up'
        }
        size={16}
        color={sortBy === option ? colors.primary : theme.colors.mutedForeground}
      />
      <View style={{ marginLeft: spacing[1] }}>
        <Button
          variant="ghost"
          size="sm"
          style={{ 
            paddingHorizontal: spacing[1],
            paddingVertical: 0,
            minHeight: 0,
          }}
        >
          {label}
        </Button>
      </View>
    </TouchableOpacity>
  );
  
  const ListHeader = (
    <View style={[styles.sortContainer, { backgroundColor: theme.colors.card }]}>
      <SortTab option="hot" label="Hot" />
      <SortTab option="new" label="New" />
      <SortTab option="top" label="Top" />
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Riddt" />
      
      <PostList
        posts={sortedPosts}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
        refetchKey={['posts']}
        ListHeaderComponent={ListHeader}
        emptyMessage="No posts yet. Be the first to post!"
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleCreatePost}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.primaryForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[1],
    marginBottom: spacing[2],
    borderRadius: borderRadius.md,
  },
  sortTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    marginRight: spacing[1],
  },
  fab: {
    position: 'absolute',
    right: spacing[4],
    bottom: spacing[6],
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
