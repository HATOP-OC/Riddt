import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '@/components/layout';
import { Input, Avatar } from '@/components/ui';
import { useSubreddits } from '@/hooks';
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore } from '@/store';
import { formatMemberCount } from '@/utils';
import type { RootStackParamList, SubredditWithSubscription } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export function SearchScreen({ navigation }: Props) {
  const { theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: subreddits, isLoading } = useSubreddits();
  
  const filteredSubreddits = React.useMemo(() => {
    if (!subreddits) return [];
    if (!searchQuery.trim()) return subreddits;
    
    const query = searchQuery.toLowerCase();
    return subreddits.filter(sub => 
      sub.name.toLowerCase().includes(query) ||
      (sub.description && sub.description.toLowerCase().includes(query))
    );
  }, [subreddits, searchQuery]);
  
  const handleSubredditPress = (subredditName: string) => {
    navigation.navigate('Subreddit', { subredditName });
  };
  
  const handleCreateSubreddit = () => {
    navigation.navigate('CreateSubreddit');
  };
  
  const renderSubreddit = ({ item }: { item: SubredditWithSubscription }) => (
    <TouchableOpacity
      style={[styles.subredditItem, { backgroundColor: theme.colors.card }]}
      onPress={() => handleSubredditPress(item.name)}
    >
      <Avatar size="lg" name={item.name} />
      <View style={styles.subredditInfo}>
        <Text style={[styles.subredditName, { color: theme.colors.foreground }]}>
          r/{item.name}
        </Text>
        <Text 
          style={[styles.subredditDesc, { color: theme.colors.mutedForeground }]}
          numberOfLines={1}
        >
          {item.description || 'No description'}
        </Text>
        <Text style={[styles.memberCount, { color: theme.colors.mutedForeground }]}>
          {formatMemberCount(item.memberCount)}
        </Text>
      </View>
      {item.isSubscribed && (
        <View style={[styles.joinedBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.joinedText, { color: colors.primary }]}>
            Joined
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Search" showMenu={false} />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.muted }]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={theme.colors.mutedForeground} 
            style={styles.searchIcon}
          />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
            style={styles.searchInputField}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={theme.colors.mutedForeground} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSubreddits}
          renderItem={renderSubreddit}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.colors.card }]}
              onPress={handleCreateSubreddit}
            >
              <View style={[styles.createIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="add" size={24} color={colors.primaryForeground} />
              </View>
              <Text style={[styles.createText, { color: theme.colors.foreground }]}>
                Create a Community
              </Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                {searchQuery ? 'No communities found' : 'No communities yet'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: spacing[3],
    paddingBottom: 0,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  searchInputField: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing[3],
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
  },
  createIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  createText: {
    fontSize: fontSizes.base,
    fontWeight: '600',
  },
  subredditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[2],
  },
  subredditInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  subredditName: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    marginBottom: spacing[0.5],
  },
  subredditDesc: {
    fontSize: fontSizes.sm,
    marginBottom: spacing[0.5],
  },
  memberCount: {
    fontSize: fontSizes.xs,
  },
  joinedBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  joinedText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  empty: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSizes.base,
  },
});
