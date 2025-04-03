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
  type UserBadge, type InsertUserBadge
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  createSubreddit(subreddit: InsertSubreddit): Promise<Subreddit>;
  
  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getPosts(subredditId?: number): Promise<Post[]>;
  getPostsByUser(userId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  getCommentsByUser(userId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, content: string): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  
  // Vote operations
  getVote(userId: number, postId?: number, commentId?: number): Promise<Vote | undefined>;
  createOrUpdateVote(vote: InsertVote): Promise<Vote>;
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
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  deleteSubscription(userId: number, subredditId: number): Promise<boolean>;
  
  // Badge operations
  getBadgeTypes(): Promise<BadgeType[]>;
  getBadgeType(id: number): Promise<BadgeType | undefined>;
  createBadgeType(badgeType: InsertBadgeType): Promise<BadgeType>;
  
  // UserBadge operations
  getUserBadges(userId: number): Promise<UserBadge[]>;
  createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  
  // Session store
  sessionStore: session.SessionStore;
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
  sessionStore: session.SessionStore;
  
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
      ...subreddit, 
      id, 
      createdAt
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
      ...post, 
      id, 
      createdAt, 
      updatedAt,
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
      ...comment, 
      id, 
      createdAt,
      score: 0
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
      const newVote: Vote = { ...vote, id, createdAt };
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

// Export an instance of the storage
export const storage = new MemStorage();
