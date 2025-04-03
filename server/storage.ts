import { 
  type User, type InsertUser,
  type Subreddit, type InsertSubreddit,
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type Vote, type InsertVote,
  type Tag, type InsertTag,
  type PostTag, type InsertPostTag,
  type Subscription, type InsertSubscription,
  type BadgeType, type InsertBadgeType,
  type UserBadge, type InsertUserBadge,
  users, subreddits, posts, comments, votes, tags, postTags, subscriptions, badgeTypes, userBadges
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, and, desc, sql as sqlQuery } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import pg from "pg";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Create a pg pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define the storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserKarma(userId: number, karma: number): Promise<User | undefined>;
  
  // Subreddit operations
  getSubreddit(id: number): Promise<Subreddit | undefined>;
  getSubredditByName(name: string): Promise<Subreddit | undefined>;
  getSubreddits(): Promise<Subreddit[]>;
  createSubreddit(subreddit: InsertSubreddit & { creatorId: number }): Promise<Subreddit>;
  
  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getPosts(subredditId?: number): Promise<Post[]>;
  getPostsByUser(userId: number): Promise<Post[]>;
  createPost(post: InsertPost & { userId: number }): Promise<Post>;
  updatePost(id: number, post: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  getCommentsByUser(userId: number): Promise<Comment[]>;
  createComment(comment: InsertComment & { userId: number }): Promise<Comment>;
  updateComment(id: number, content: string): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  
  // Vote operations
  getVote(userId: number, postId?: number, commentId?: number): Promise<Vote | undefined>;
  createOrUpdateVote(vote: InsertVote & { userId: number }): Promise<Vote>;
  deleteVote(userId: number, postId?: number, commentId?: number): Promise<boolean>;
  
  // Tag operations
  getTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  
  // PostTag operations
  getPostTags(postId: number): Promise<PostTag[]>;
  createPostTag(postTag: InsertPostTag): Promise<PostTag>;
  deletePostTag(postId: number, tagId: number): Promise<boolean>;
  
  // Subscription operations
  getSubscription(userId: number, subredditId: number): Promise<Subscription | undefined>;
  getSubscriptionsByUser(userId: number): Promise<Subscription[]>;
  getSubscriptionsBySubreddit(subredditId: number): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription & { userId: number }): Promise<Subscription>;
  deleteSubscription(userId: number, subredditId: number): Promise<boolean>;
  
  // Badge operations
  getBadgeTypes(): Promise<BadgeType[]>;
  getBadgeType(id: number): Promise<BadgeType | undefined>;
  createBadgeType(badgeType: InsertBadgeType): Promise<BadgeType>;
  
  // UserBadge operations
  getUserBadges(userId: number): Promise<UserBadge[]>;
  createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  
  // Session store
  sessionStore: any; // Fixes the session.SessionStore type error
}

// Implement in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subreddits: Map<number, Subreddit>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private votes: Map<number, Vote>;
  private tags: Map<number, Tag>;
  private postTags: Map<number, PostTag>;
  private subscriptions: Map<number, Subscription>;
  private badgeTypes: Map<number, BadgeType>;
  private userBadges: Map<number, UserBadge>;
  
  // IDs for auto-increment
  private userId: number;
  private subredditId: number;
  private postId: number;
  private commentId: number;
  private voteId: number;
  private tagId: number;
  private postTagId: number;
  private subscriptionId: number;
  private badgeTypeId: number;
  private userBadgeId: number;
  
  // Session store
  sessionStore: any;
  
  constructor() {
    this.users = new Map();
    this.subreddits = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.votes = new Map();
    this.tags = new Map();
    this.postTags = new Map();
    this.subscriptions = new Map();
    this.badgeTypes = new Map();
    this.userBadges = new Map();
    
    // Initialize auto-increment IDs
    this.userId = 1;
    this.subredditId = 1;
    this.postId = 1;
    this.commentId = 1;
    this.voteId = 1;
    this.tagId = 1;
    this.postTagId = 1;
    this.subscriptionId = 1;
    this.badgeTypeId = 1;
    this.userBadgeId = 1;
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize default badge types
    this.initializeBadgeTypes();
  }
  
  private initializeBadgeTypes() {
    const defaultBadgeTypes: InsertBadgeType[] = [
      {
        name: "Prolific Commenter",
        description: "Left 50+ comments",
        icon: "chat-bubble-left",
        requirement: "comments",
        threshold: 50
      },
      {
        name: "Rising Star",
        description: "Got 100+ upvotes on a post",
        icon: "bolt",
        requirement: "post_upvotes",
        threshold: 100
      },
      {
        name: "Trendsetter",
        description: "Created 3+ trending posts",
        icon: "sparkles",
        requirement: "trending_posts",
        threshold: 3
      },
      {
        name: "Verified Contributor",
        description: "Contribute for 30+ days",
        icon: "shield-check",
        requirement: "days_active",
        threshold: 30
      }
    ];
    
    for (const badgeType of defaultBadgeTypes) {
      this.createBadgeType(badgeType);
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt, karma: 0 };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserKarma(userId: number, karma: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, karma };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Subreddit operations
  async getSubreddit(id: number): Promise<Subreddit | undefined> {
    return this.subreddits.get(id);
  }
  
  async getSubredditByName(name: string): Promise<Subreddit | undefined> {
    return Array.from(this.subreddits.values()).find(
      (sr) => sr.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async getSubreddits(): Promise<Subreddit[]> {
    return Array.from(this.subreddits.values());
  }
  
  async createSubreddit(subreddit: InsertSubreddit & { creatorId: number }): Promise<Subreddit> {
    const id = this.subredditId++;
    const createdAt = new Date();
    const newSubreddit: Subreddit = { 
      id, 
      createdAt,
      name: subreddit.name,
      description: subreddit.description ?? null,
      type: subreddit.type ?? "public",
      creatorId: subreddit.creatorId
    };
    this.subreddits.set(id, newSubreddit);
    return newSubreddit;
  }
  
  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPosts(subredditId?: number): Promise<Post[]> {
    let posts = Array.from(this.posts.values());
    if (subredditId) {
      posts = posts.filter(post => post.subredditId === subredditId);
    }
    return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getPostsByUser(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createPost(post: InsertPost & { userId: number }): Promise<Post> {
    const id = this.postId++;
    const createdAt = new Date();
    const updatedAt = createdAt;
    const newPost: Post = { 
      id, 
      title: post.title,
      content: post.content ?? null,
      imageUrl: post.imageUrl ?? null,
      createdAt, 
      updatedAt,
      userId: post.userId,
      subredditId: post.subredditId,
      score: 0
    };
    this.posts.set(id, newPost);
    return newPost;
  }
  
  async updatePost(id: number, postUpdate: Partial<Post>): Promise<Post | undefined> {
    const post = await this.getPost(id);
    if (!post) return undefined;
    
    const updatedPost: Post = { 
      ...post, 
      ...postUpdate,
      updatedAt: new Date()
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
  
  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }
  
  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createComment(comment: InsertComment & { userId: number }): Promise<Comment> {
    const id = this.commentId++;
    const createdAt = new Date();
    const newComment: Comment = { 
      id, 
      content: comment.content,
      createdAt,
      userId: comment.userId,
      score: 0,
      postId: comment.postId,
      parentId: comment.parentId ?? null
    };
    this.comments.set(id, newComment);
    return newComment;
  }
  
  async updateComment(id: number, content: string): Promise<Comment | undefined> {
    const comment = await this.getComment(id);
    if (!comment) return undefined;
    
    const updatedComment: Comment = { ...comment, content };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }
  
  // Vote operations
  async getVote(userId: number, postId?: number, commentId?: number): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      (vote) => vote.userId === userId && 
                (postId ? vote.postId === postId : true) &&
                (commentId ? vote.commentId === commentId : true)
    );
  }
  
  async createOrUpdateVote(vote: InsertVote & { userId: number }): Promise<Vote> {
    // Check if vote already exists
    const existingVote = await this.getVote(
      vote.userId, 
      vote.postId || undefined, 
      vote.commentId || undefined
    );
    
    if (existingVote) {
      // Update existing vote
      const updatedVote: Vote = { ...existingVote, voteType: vote.voteType };
      this.votes.set(existingVote.id, updatedVote);
      return updatedVote;
    } else {
      // Create new vote
      const id = this.voteId++;
      const createdAt = new Date();
      const newVote: Vote = { 
        id, 
        createdAt,
        userId: vote.userId,
        postId: vote.postId ?? null,
        commentId: vote.commentId ?? null,
        voteType: vote.voteType
      };
      this.votes.set(id, newVote);
      return newVote;
    }
  }
  
  async deleteVote(userId: number, postId?: number, commentId?: number): Promise<boolean> {
    const vote = await this.getVote(userId, postId, commentId);
    if (!vote) return false;
    return this.votes.delete(vote.id);
  }
  
  // Tag operations
  async getTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }
  
  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }
  
  async getTagByName(name: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async createTag(tag: InsertTag): Promise<Tag> {
    const id = this.tagId++;
    const newTag: Tag = { ...tag, id };
    this.tags.set(id, newTag);
    return newTag;
  }
  
  // PostTag operations
  async getPostTags(postId: number): Promise<PostTag[]> {
    return Array.from(this.postTags.values()).filter(
      (postTag) => postTag.postId === postId
    );
  }
  
  async createPostTag(postTag: InsertPostTag): Promise<PostTag> {
    const id = this.postTagId++;
    const newPostTag: PostTag = { ...postTag, id };
    this.postTags.set(id, newPostTag);
    return newPostTag;
  }
  
  async deletePostTag(postId: number, tagId: number): Promise<boolean> {
    const postTag = Array.from(this.postTags.values()).find(
      (pt) => pt.postId === postId && pt.tagId === tagId
    );
    if (!postTag) return false;
    return this.postTags.delete(postTag.id);
  }
  
  // Subscription operations
  async getSubscription(userId: number, subredditId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (sub) => sub.userId === userId && sub.subredditId === subredditId
    );
  }
  
  async getSubscriptionsByUser(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.userId === userId
    );
  }
  
  async getSubscriptionsBySubreddit(subredditId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.subredditId === subredditId
    );
  }
  
  async createSubscription(subscription: InsertSubscription & { userId: number }): Promise<Subscription> {
    const id = this.subscriptionId++;
    const createdAt = new Date();
    const newSubscription: Subscription = { ...subscription, id, createdAt };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }
  
  async deleteSubscription(userId: number, subredditId: number): Promise<boolean> {
    const subscription = await this.getSubscription(userId, subredditId);
    if (!subscription) return false;
    return this.subscriptions.delete(subscription.id);
  }
  
  // Badge operations
  async getBadgeTypes(): Promise<BadgeType[]> {
    return Array.from(this.badgeTypes.values());
  }
  
  async getBadgeType(id: number): Promise<BadgeType | undefined> {
    return this.badgeTypes.get(id);
  }
  
  async createBadgeType(badgeType: InsertBadgeType): Promise<BadgeType> {
    const id = this.badgeTypeId++;
    const newBadgeType: BadgeType = { ...badgeType, id };
    this.badgeTypes.set(id, newBadgeType);
    return newBadgeType;
  }
  
  // UserBadge operations
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter(
      (badge) => badge.userId === userId
    );
  }
  
  async createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
    const id = this.userBadgeId++;
    const awardedAt = new Date();
    const newUserBadge: UserBadge = { ...userBadge, id, awardedAt };
    this.userBadges.set(id, newUserBadge);
    return newUserBadge;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Initialize default badge types
    this.initializeBadgeTypes();
  }
  
  private async initializeBadgeTypes() {
    // Check if badge types already exist
    const existingBadges = await this.getBadgeTypes();
    if (existingBadges.length > 0) return;
    
    // Add default badge types if none exist
    const defaultBadgeTypes: InsertBadgeType[] = [
      {
        name: "Prolific Commenter",
        description: "Left 50+ comments",
        icon: "chat-bubble-left",
        requirement: "comments",
        threshold: 50
      },
      {
        name: "Rising Star",
        description: "Got 100+ upvotes on a post",
        icon: "bolt",
        requirement: "post_upvotes",
        threshold: 100
      },
      {
        name: "Trendsetter",
        description: "Created 3+ trending posts",
        icon: "sparkles",
        requirement: "trending_posts",
        threshold: 3
      },
      {
        name: "Verified Contributor",
        description: "Contribute for 30+ days",
        icon: "shield-check",
        requirement: "days_active",
        threshold: 30
      }
    ];
    
    for (const badgeType of defaultBadgeTypes) {
      await this.createBadgeType(badgeType);
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      eq(sqlQuery`LOWER(${users.username})`, username.toLowerCase())
    );
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      createdAt: new Date(),
      karma: 0
    }).returning();
    return user;
  }
  
  async updateUserKarma(userId: number, karma: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ karma })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  // Subreddit operations
  async getSubreddit(id: number): Promise<Subreddit | undefined> {
    const [subreddit] = await db.select().from(subreddits).where(eq(subreddits.id, id));
    return subreddit;
  }
  
  async getSubredditByName(name: string): Promise<Subreddit | undefined> {
    const [subreddit] = await db.select().from(subreddits).where(
      eq(sqlQuery`LOWER(${subreddits.name})`, name.toLowerCase())
    );
    return subreddit;
  }
  
  async getSubreddits(): Promise<Subreddit[]> {
    return await db.select().from(subreddits);
  }
  
  async createSubreddit(subreddit: InsertSubreddit & { creatorId: number }): Promise<Subreddit> {
    const [newSubreddit] = await db.insert(subreddits).values({
      ...subreddit,
      createdAt: new Date()
    }).returning();
    return newSubreddit;
  }
  
  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }
  
  async getPosts(subredditId?: number): Promise<Post[]> {
    if (subredditId) {
      return await db.select()
        .from(posts)
        .where(eq(posts.subredditId, subredditId))
        .orderBy(desc(posts.createdAt));
    }
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }
  
  async getPostsByUser(userId: number): Promise<Post[]> {
    return await db.select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }
  
  async createPost(post: InsertPost & { userId: number }): Promise<Post> {
    const now = new Date();
    const [newPost] = await db.insert(posts).values({
      ...post,
      createdAt: now,
      updatedAt: now,
      score: 0
    }).returning();
    return newPost;
  }
  
  async updatePost(id: number, postUpdate: Partial<Post>): Promise<Post | undefined> {
    const [updatedPost] = await db.update(posts)
      .set({
        ...postUpdate,
        updatedAt: new Date()
      })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return !!result;
  }
  
  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }
  
  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return await db.select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }
  
  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return await db.select()
      .from(comments)
      .where(eq(comments.userId, userId))
      .orderBy(desc(comments.createdAt));
  }
  
  async createComment(comment: InsertComment & { userId: number }): Promise<Comment> {
    const [newComment] = await db.insert(comments).values({
      ...comment,
      createdAt: new Date(),
      score: 0
    }).returning();
    return newComment;
  }
  
  async updateComment(id: number, content: string): Promise<Comment | undefined> {
    const [updatedComment] = await db.update(comments)
      .set({ content })
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return !!result;
  }
  
  // Vote operations
  async getVote(userId: number, postId?: number, commentId?: number): Promise<Vote | undefined> {
    const conditions = [eq(votes.userId, userId)];
    
    if (postId) {
      conditions.push(eq(votes.postId, postId));
    }
    
    if (commentId) {
      conditions.push(eq(votes.commentId, commentId));
    }
    
    const [vote] = await db.select().from(votes).where(and(...conditions));
    return vote;
  }
  
  async createOrUpdateVote(vote: InsertVote & { userId: number }): Promise<Vote> {
    // Check if vote already exists
    const conditions = [eq(votes.userId, vote.userId)];
    
    if (vote.postId) {
      conditions.push(eq(votes.postId, vote.postId));
    }
    
    if (vote.commentId) {
      conditions.push(eq(votes.commentId, vote.commentId));
    }
    
    const [existingVote] = await db.select().from(votes).where(and(...conditions));
    
    if (existingVote) {
      // Update existing vote
      const [updatedVote] = await db.update(votes)
        .set({ voteType: vote.voteType })
        .where(eq(votes.id, existingVote.id))
        .returning();
      return updatedVote;
    } else {
      // Create new vote
      const [newVote] = await db.insert(votes).values({
        ...vote,
        createdAt: new Date()
      }).returning();
      return newVote;
    }
  }
  
  async deleteVote(userId: number, postId?: number, commentId?: number): Promise<boolean> {
    const conditions = [eq(votes.userId, userId)];
    
    if (postId) {
      conditions.push(eq(votes.postId, postId));
    }
    
    if (commentId) {
      conditions.push(eq(votes.commentId, commentId));
    }
    
    const result = await db.delete(votes).where(and(...conditions));
    return !!result;
  }
  
  // Tag operations
  async getTags(): Promise<Tag[]> {
    return await db.select().from(tags);
  }
  
  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }
  
  async getTagByName(name: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(
      eq(sqlQuery`LOWER(${tags.name})`, name.toLowerCase())
    );
    return tag;
  }
  
  async createTag(tag: InsertTag): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }
  
  // PostTag operations
  async getPostTags(postId: number): Promise<PostTag[]> {
    return await db.select()
      .from(postTags)
      .where(eq(postTags.postId, postId));
  }
  
  async createPostTag(postTag: InsertPostTag): Promise<PostTag> {
    const [newPostTag] = await db.insert(postTags)
      .values(postTag)
      .returning();
    return newPostTag;
  }
  
  async deletePostTag(postId: number, tagId: number): Promise<boolean> {
    const result = await db.delete(postTags)
      .where(and(
        eq(postTags.postId, postId),
        eq(postTags.tagId, tagId)
      ));
    return !!result;
  }
  
  // Subscription operations
  async getSubscription(userId: number, subredditId: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.subredditId, subredditId)
      ));
    return subscription;
  }
  
  async getSubscriptionsByUser(userId: number): Promise<Subscription[]> {
    return await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
  }
  
  async getSubscriptionsBySubreddit(subredditId: number): Promise<Subscription[]> {
    return await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.subredditId, subredditId));
  }
  
  async createSubscription(subscription: InsertSubscription & { userId: number }): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions)
      .values({
        ...subscription,
        createdAt: new Date()
      })
      .returning();
    return newSubscription;
  }
  
  async deleteSubscription(userId: number, subredditId: number): Promise<boolean> {
    const result = await db.delete(subscriptions)
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.subredditId, subredditId)
      ));
    return !!result;
  }
  
  // Badge operations
  async getBadgeTypes(): Promise<BadgeType[]> {
    return await db.select().from(badgeTypes);
  }
  
  async getBadgeType(id: number): Promise<BadgeType | undefined> {
    const [badgeType] = await db.select()
      .from(badgeTypes)
      .where(eq(badgeTypes.id, id));
    return badgeType;
  }
  
  async createBadgeType(badgeType: InsertBadgeType): Promise<BadgeType> {
    const [newBadgeType] = await db.insert(badgeTypes)
      .values(badgeType)
      .returning();
    return newBadgeType;
  }
  
  // UserBadge operations
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return await db.select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
  }
  
  async createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
    const [newUserBadge] = await db.insert(userBadges)
      .values({
        ...userBadge,
        awardedAt: new Date()
      })
      .returning();
    return newUserBadge;
  }
}

// Export an instance of the storage
export const storage = new DatabaseStorage();
