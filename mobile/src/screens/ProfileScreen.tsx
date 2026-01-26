import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Header } from '@/components/layout';
import { Avatar, Badge, Card } from '@/components/ui';
import { PostCard } from '@/components/posts';
import { getUserProfile } from '@/api';
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore, useAuthStore } from '@/store';
import { formatRelativeTime, formatKarma, formatFullDate } from '@/utils';
import type { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type TabOption = 'posts' | 'comments';

export function ProfileScreen({ route, navigation }: Props) {
  const { username } = route.params;
  const { theme } = useThemeStore();
  const { user: currentUser, logoutUser } = useAuthStore();
  
  const [activeTab, setActiveTab] = React.useState<TabOption>('posts');
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserProfile(username),
  });
  
  const isOwnProfile = currentUser?.username === username;
  
  const handleLogout = async () => {
    await logoutUser();
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header 
          title={`u/${username}`} 
          showBack 
          showMenu={false}
        />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }
  
  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header 
          title="Profile" 
          showBack 
          showMenu={false}
        />
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: theme.colors.mutedForeground }]}>
            User not found
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title={`u/${username}`} 
        showBack 
        showMenu={false}
        rightAction={
          isOwnProfile ? (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={theme.colors.foreground} />
            </TouchableOpacity>
          ) : undefined
        }
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.banner, { backgroundColor: colors.primary }]} />
          
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Avatar size="xl" name={username} />
            </View>
            
            <Text style={[styles.username, { color: theme.colors.foreground }]}>
              u/{username}
            </Text>
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="star" size={16} color={colors.primary} />
                <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
                  {formatKarma(profile.karma)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>
                  karma
                </Text>
              </View>
              
              <View style={styles.stat}>
                <Ionicons name="calendar" size={16} color={theme.colors.mutedForeground} />
                <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
                  {formatFullDate(profile.createdAt)}
                </Text>
              </View>
            </View>
            
            {/* Badges */}
            {profile.badges && profile.badges.length > 0 && (
              <View style={styles.badgesSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                  Badges
                </Text>
                <View style={styles.badges}>
                  {profile.badges.map((badge) => (
                    <View 
                      key={badge.id} 
                      style={[styles.badge, { backgroundColor: theme.colors.muted }]}
                    >
                      <Text style={styles.badgeIcon}>{badge.badgeType?.icon || '🏆'}</Text>
                      <Text style={[styles.badgeName, { color: theme.colors.foreground }]}>
                        {badge.badgeType?.name || 'Badge'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
        
        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'posts' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('posts')}
          >
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'posts' ? colors.primary : theme.colors.mutedForeground }
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'comments' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('comments')}
          >
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'comments' ? colors.primary : theme.colors.mutedForeground }
              ]}
            >
              Comments
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'posts' ? (
            profile.posts && profile.posts.length > 0 ? (
              profile.posts.map((post: any) => (
                <TouchableOpacity
                  key={post.id}
                  onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                >
                  <Card style={styles.postItem}>
                    <View style={styles.postItemContent}>
                      <Text 
                        style={[styles.postTitle, { color: theme.colors.foreground }]}
                        numberOfLines={2}
                      >
                        {post.title}
                      </Text>
                      <View style={styles.postMeta}>
                        <Text style={[styles.postMetaText, { color: theme.colors.mutedForeground }]}>
                          r/{post.subreddit?.name || 'unknown'}
                        </Text>
                        <Text style={[styles.postMetaText, { color: theme.colors.mutedForeground }]}>
                          • {post.score} points
                        </Text>
                        <Text style={[styles.postMetaText, { color: theme.colors.mutedForeground }]}>
                          • {formatRelativeTime(post.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                  No posts yet
                </Text>
              </View>
            )
          ) : (
            profile.comments && profile.comments.length > 0 ? (
              profile.comments.map((comment: any) => (
                <Card key={comment.id} style={styles.commentItem}>
                  <Text 
                    style={[styles.commentContent, { color: theme.colors.foreground }]}
                    numberOfLines={3}
                  >
                    {comment.content}
                  </Text>
                  <View style={styles.commentMeta}>
                    <Text style={[styles.commentMetaText, { color: theme.colors.mutedForeground }]}>
                      {comment.score} points
                    </Text>
                    <Text style={[styles.commentMetaText, { color: theme.colors.mutedForeground }]}>
                      • {formatRelativeTime(comment.createdAt)}
                    </Text>
                  </View>
                </Card>
              ))
            ) : (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                  No comments yet
                </Text>
              </View>
            )
          )}
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
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: fontSizes.lg,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    borderRadius: borderRadius.lg,
    margin: spacing[3],
    overflow: 'hidden',
  },
  banner: {
    height: 100,
  },
  profileInfo: {
    padding: spacing[4],
    paddingTop: 0,
  },
  avatarContainer: {
    marginTop: -32,
    marginBottom: spacing[3],
  },
  username: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[6],
    marginBottom: spacing[4],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statValue: {
    fontSize: fontSizes.base,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: fontSizes.sm,
  },
  badgesSection: {
    marginTop: spacing[2],
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: spacing[1],
  },
  badgeName: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  tabText: {
    fontSize: fontSizes.base,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[6],
  },
  postItem: {
    marginBottom: spacing[2],
    padding: spacing[3],
  },
  postItemContent: {},
  postTitle: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  postMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  postMetaText: {
    fontSize: fontSizes.xs,
  },
  commentItem: {
    marginBottom: spacing[2],
    padding: spacing[3],
  },
  commentContent: {
    fontSize: fontSizes.base,
    marginBottom: spacing[2],
  },
  commentMeta: {
    flexDirection: 'row',
  },
  commentMetaText: {
    fontSize: fontSizes.xs,
  },
  empty: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSizes.base,
  },
  logoutButton: {
    padding: spacing[2],
  },
});
