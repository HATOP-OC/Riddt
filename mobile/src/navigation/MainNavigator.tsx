import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import {
  HomeScreen,
  SubredditScreen,
  PostDetailScreen,
  CreatePostScreen,
  CreateSubredditScreen,
  ProfileScreen,
  SearchScreen,
} from '@/screens';
import { Avatar, Button } from '@/components/ui';
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore, useAuthStore } from '@/store';
import { useSubreddits } from '@/hooks';
import type { RootStackParamList, TabParamList } from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const Drawer = createDrawerNavigator();

// Custom Drawer Content
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { theme, mode, setMode } = useThemeStore();
  const { user, isAuthenticated, logoutUser } = useAuthStore();
  const { data: subreddits } = useSubreddits();
  const { navigation } = props;
  
  const subscribedSubreddits = subreddits?.filter(s => s.isSubscribed) || [];
  const popularSubreddits = subreddits?.slice(0, 5) || [];
  
  const handleThemeToggle = () => {
    if (mode === 'light') {
      setMode('dark');
    } else if (mode === 'dark') {
      setMode('system');
    } else {
      setMode('light');
    }
  };
  
  const handleLogout = async () => {
    await logoutUser();
    navigation.closeDrawer();
  };
  
  return (
    <DrawerContentScrollView 
      {...props}
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.drawerContent}
    >
      {/* User section */}
      {isAuthenticated && user ? (
        <TouchableOpacity
          style={styles.userSection}
          onPress={() => {
            navigation.navigate('Profile', { username: user.username });
            navigation.closeDrawer();
          }}
        >
          <Avatar size="lg" name={user.username} />
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: theme.colors.foreground }]}>
              u/{user.username}
            </Text>
            <Text style={[styles.karma, { color: theme.colors.mutedForeground }]}>
              {user.karma} karma
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.userSection}>
          <Text style={[styles.guestText, { color: theme.colors.mutedForeground }]}>
            Not logged in
          </Text>
        </View>
      )}
      
      {/* Subscribed Subreddits */}
      {subscribedSubreddits.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}>
            YOUR COMMUNITIES
          </Text>
          {subscribedSubreddits.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={styles.menuItem}
              onPress={() => {
                navigation.navigate('Subreddit', { subredditName: sub.name });
                navigation.closeDrawer();
              }}
            >
              <Avatar size="sm" name={sub.name} />
              <Text style={[styles.menuItemText, { color: theme.colors.foreground }]}>
                r/{sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Popular Subreddits */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}>
          POPULAR COMMUNITIES
        </Text>
        {popularSubreddits.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate('Subreddit', { subredditName: sub.name });
              navigation.closeDrawer();
            }}
          >
            <Avatar size="sm" name={sub.name} />
            <Text style={[styles.menuItemText, { color: theme.colors.foreground }]}>
              r/{sub.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Create Community */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('CreateSubreddit');
            navigation.closeDrawer();
          }}
        >
          <View style={[styles.createIcon, { backgroundColor: theme.colors.muted }]}>
            <Ionicons name="add" size={16} color={theme.colors.foreground} />
          </View>
          <Text style={[styles.menuItemText, { color: theme.colors.foreground }]}>
            Create a community
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Settings section */}
      <View style={[styles.section, styles.bottomSection]}>
        <TouchableOpacity style={styles.menuItem} onPress={handleThemeToggle}>
          <Ionicons 
            name={mode === 'dark' ? 'moon' : mode === 'light' ? 'sunny' : 'phone-portrait'} 
            size={20} 
            color={theme.colors.foreground} 
          />
          <Text style={[styles.menuItemText, { color: theme.colors.foreground }]}>
            Theme: {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Text>
        </TouchableOpacity>
        
        {isAuthenticated && (
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
            <Text style={[styles.menuItemText, { color: colors.destructive }]}>
              Log Out
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </DrawerContentScrollView>
  );
}

// Tab Navigator
function TabNavigator() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreatePostScreen}
        options={{
          tabBarLabel: 'Create',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        initialParams={{ username: user?.username || '' }}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator (inside drawer)
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen name="Subreddit" component={SubredditScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="CreateSubreddit" component={CreateSubredditScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

// Main Navigator with Drawer
export function MainNavigator() {
  const { theme } = useThemeStore();
  
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="MainStack" component={MainStack} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    padding: spacing[3],
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[2],
    marginBottom: spacing[2],
  },
  userInfo: {
    marginLeft: spacing[3],
  },
  username: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  karma: {
    fontSize: fontSizes.sm,
  },
  guestText: {
    fontSize: fontSizes.base,
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing[2],
    paddingHorizontal: spacing[2],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.md,
  },
  menuItemText: {
    fontSize: fontSizes.base,
    marginLeft: spacing[3],
  },
  createIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
