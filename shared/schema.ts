import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema and types
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  karma: integer("karma").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Subreddit schema and types
export const subreddits = pgTable("subreddits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  creatorId: integer("creator_id").notNull(),
  type: text("type").default("public").notNull(), // "public", "restricted", "private"
});

export const insertSubredditSchema = createInsertSchema(subreddits).pick({
  name: true,
  description: true,
  type: true,
});

export type InsertSubreddit = z.infer<typeof insertSubredditSchema> & { creatorId: number };
export type Subreddit = typeof subreddits.$inferSelect;

// Posts schema and types
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: integer("user_id").notNull(),
  subredditId: integer("subreddit_id").notNull(),
  score: integer("score").default(0).notNull(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  content: true,
  imageUrl: true,
  subredditId: true,
});

export type InsertPost = z.infer<typeof insertPostSchema> & { userId: number };
export type Post = typeof posts.$inferSelect;

// Tags schema and types
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
});

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

// Post tags schema (junction table)
export const postTags = pgTable("post_tags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  tagId: integer("tag_id").notNull(),
});

export const insertPostTagSchema = createInsertSchema(postTags).pick({
  postId: true,
  tagId: true,
});

export type InsertPostTag = z.infer<typeof insertPostTagSchema>;
export type PostTag = typeof postTags.$inferSelect;

// Comments schema and types
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id").notNull(),
  parentId: integer("parent_id"), // null for top-level comments
  score: integer("score").default(0).notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  postId: true,
  parentId: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema> & { userId: number };
export type Comment = typeof comments.$inferSelect;

// Votes schema and types (for posts and comments)
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id"),
  commentId: integer("comment_id"),
  voteType: integer("vote_type").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  postId: true,
  commentId: true,
  voteType: true,
});

export type InsertVote = z.infer<typeof insertVoteSchema> & { userId: number };
export type Vote = typeof votes.$inferSelect;

// Subscriptions schema and types
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subredditId: integer("subreddit_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  subredditId: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema> & { userId: number };
export type Subscription = typeof subscriptions.$inferSelect;

// Badges schema and types
export const badgeTypes = pgTable("badge_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirement: text("requirement").notNull(),
  threshold: integer("threshold").notNull(),
});

export const insertBadgeTypeSchema = createInsertSchema(badgeTypes).pick({
  name: true,
  description: true,
  icon: true,
  requirement: true,
  threshold: true,
});

export type InsertBadgeType = z.infer<typeof insertBadgeTypeSchema>;
export type BadgeType = typeof badgeTypes.$inferSelect;

// User badges schema and types
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeTypeId: integer("badge_type_id").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeTypeId: true,
});

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// Extended types for the frontend
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

export type UserWithBadges = User & {
  badges: (UserBadge & { badgeType: BadgeType })[];
};
