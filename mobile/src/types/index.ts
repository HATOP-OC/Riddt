// Types based on shared/schema.ts from the web app

// User
export type User = {
  id: number;
  username: string;
  password?: string; // Not exposed in API responses
  createdAt: Date | string;
  karma: number;
};

// Subreddit
export type Subreddit = {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date | string;
  creatorId: number;
  type: 'public' | 'restricted' | 'private';
};

// Post
export type Post = {
  id: number;
  title: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: number;
  subredditId: number;
  score: number;
};

// Comment
export type Comment = {
  id: number;
  content: string;
  createdAt: Date | string;
  userId: number;
  postId: number;
  parentId: number | null;
  score: number;
};

// Vote
export type Vote = {
  id: number;
  userId: number;
  postId: number | null;
  commentId: number | null;
  voteType: 1 | -1;
  createdAt: Date | string;
};

// Tag
export type Tag = {
  id: number;
  name: string;
};

// PostTag (junction table)
export type PostTag = {
  id: number;
  postId: number;
  tagId: number;
};

// Subscription
export type Subscription = {
  id: number;
  userId: number;
  subredditId: number;
  createdAt: Date | string;
};

// Badge Types
export type BadgeType = {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  threshold: number;
};

// User Badge
export type UserBadge = {
  id: number;
  userId: number;
  badgeTypeId: number;
  awardedAt: Date | string;
  badgeType?: BadgeType;
};

// Extended types for frontend

export type PostWithVote = Post & {
  subreddit: { name: string };
  author: { username: string };
  userVote: number | null;
  commentCount: number;
  tags: Tag[];
};

export type SubredditWithSubscription = Subreddit & {
  isSubscribed: boolean;
  memberCount: number;
  onlineCount: number;
};

export type CommentWithVote = Comment & {
  author: { username: string };
  userVote: number | null;
  replies?: CommentWithVote[];
};

export type UserWithBadges = Omit<User, 'password'> & {
  badges: UserBadge[];
  posts?: Post[];
  comments?: Comment[];
};

// API Request types
export type InsertUser = {
  username: string;
  password: string;
};

export type InsertSubreddit = {
  name: string;
  description?: string;
  type?: 'public' | 'restricted' | 'private';
};

export type InsertPost = {
  title: string;
  content?: string;
  imageUrl?: string;
  subredditId: number;
  tagsString?: string;
};

export type InsertComment = {
  content: string;
  postId: number;
  parentId?: number;
};

export type InsertVote = {
  postId?: number;
  commentId?: number;
  voteType: 1 | -1 | 0;
};

export type InsertSubscription = {
  subredditId: number;
};

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Subreddit: { subredditName: string };
  PostDetail: { postId: number };
  CreatePost: { subredditId?: number } | undefined;
  CreateSubreddit: undefined;
  Profile: { username: string };
  Search: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  CreateTab: undefined;
  ProfileTab: undefined;
};
