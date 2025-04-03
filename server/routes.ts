import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertPostSchema,
  insertCommentSchema,
  insertVoteSchema,
  insertSubredditSchema,
  insertTagSchema,
  insertSubscriptionSchema,
} from "@shared/schema";
import { ZodError } from "zod";

// Helper function to parse tags from a comma-separated string
async function parseAndCreateTags(tagsString?: string) {
  if (!tagsString) return [];
  
  const tagNames = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
  const tags = [];
  
  for (const name of tagNames) {
    let tag = await storage.getTagByName(name);
    if (!tag) {
      tag = await storage.createTag({ name });
    }
    tags.push(tag);
  }
  
  return tags;
}

// Helper to check if user earned any new badges
async function checkAndAwardBadges(userId: number) {
  try {
    // Get user's current badges
    const userBadges = await storage.getUserBadges(userId);
    const badgeTypes = await storage.getBadgeTypes();
    
    // Get user activity
    const comments = await storage.getCommentsByUser(userId);
    const posts = await storage.getPostsByUser(userId);
    
    // Check each badge type
    for (const badgeType of badgeTypes) {
      // Skip if user already has this badge
      if (userBadges.some(ub => ub.badgeTypeId === badgeType.id)) continue;
      
      let meetsRequirement = false;
      
      switch (badgeType.requirement) {
        case 'comments':
          meetsRequirement = comments.length >= badgeType.threshold;
          break;
        case 'post_upvotes':
          meetsRequirement = posts.some(post => post.score >= badgeType.threshold);
          break;
        case 'trending_posts':
          meetsRequirement = posts.filter(post => post.score >= 50).length >= badgeType.threshold;
          break;
        // Other badge requirements would be checked here
      }
      
      if (meetsRequirement) {
        await storage.createUserBadge({
          userId,
          badgeTypeId: badgeType.id
        });
      }
    }
  } catch (error) {
    console.error("Error awarding badges:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Error handling middleware for Zod validation errors
  const handleZodError = (err: Error, req: Request, res: Response, next: Function) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors
      });
    }
    next(err);
  };
  
  app.use(handleZodError);
  
  // Subreddit routes
  app.get("/api/subreddits", async (req, res) => {
    try {
      const subreddits = await storage.getSubreddits();
      
      // Get subscription status if user is authenticated
      if (req.isAuthenticated()) {
        const userId = req.user!.id;
        const subscriptions = await storage.getSubscriptionsByUser(userId);
        const subredditIds = new Set(subscriptions.map(s => s.subredditId));
        
        const subredditsWithSub = await Promise.all(subreddits.map(async (subreddit) => {
          const memberCount = (await storage.getSubscriptionsBySubreddit(subreddit.id)).length;
          return {
            ...subreddit,
            isSubscribed: subredditIds.has(subreddit.id),
            memberCount,
            onlineCount: Math.floor(memberCount * 0.3) // Mock online count
          };
        }));
        
        return res.json(subredditsWithSub);
      }
      
      // Return without subscription status for non-authenticated users
      const subredditsWithCount = await Promise.all(subreddits.map(async (subreddit) => {
        const memberCount = (await storage.getSubscriptionsBySubreddit(subreddit.id)).length;
        return {
          ...subreddit,
          isSubscribed: false,
          memberCount,
          onlineCount: Math.floor(memberCount * 0.3) // Mock online count
        };
      }));
      
      res.json(subredditsWithCount);
    } catch (error) {
      res.status(500).json({ message: "Failed to get subreddits" });
    }
  });
  
  app.get("/api/subreddits/:name", async (req, res) => {
    try {
      const subreddit = await storage.getSubredditByName(req.params.name);
      if (!subreddit) {
        return res.status(404).json({ message: "Subreddit not found" });
      }
      
      const memberCount = (await storage.getSubscriptionsBySubreddit(subreddit.id)).length;
      let isSubscribed = false;
      
      if (req.isAuthenticated()) {
        const subscription = await storage.getSubscription(req.user!.id, subreddit.id);
        isSubscribed = !!subscription;
      }
      
      res.json({
        ...subreddit,
        isSubscribed,
        memberCount,
        onlineCount: Math.floor(memberCount * 0.3) // Mock online count
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get subreddit" });
    }
  });
  
  app.post("/api/subreddits", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const data = insertSubredditSchema.parse(req.body);
      
      // Check if subreddit name already exists
      const existingSubreddit = await storage.getSubredditByName(data.name);
      if (existingSubreddit) {
        return res.status(400).json({ message: "Subreddit name already exists" });
      }
      
      const subreddit = await storage.createSubreddit({
        ...data,
        creatorId: req.user!.id
      });
      
      // Auto-subscribe creator to the subreddit
      await storage.createSubscription({
        subredditId: subreddit.id,
        userId: req.user!.id
      });
      
      res.status(201).json(subreddit);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid subreddit data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create subreddit" });
    }
  });
  
  // Subscription routes
  app.post("/api/subscriptions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const data = insertSubscriptionSchema.parse(req.body);
      
      // Check if already subscribed
      const existingSub = await storage.getSubscription(req.user!.id, data.subredditId);
      if (existingSub) {
        return res.status(400).json({ message: "Already subscribed" });
      }
      
      const subscription = await storage.createSubscription({
        ...data,
        userId: req.user!.id
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid subscription data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });
  
  app.delete("/api/subscriptions/:subredditId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const subredditId = parseInt(req.params.subredditId);
      if (isNaN(subredditId)) {
        return res.status(400).json({ message: "Invalid subreddit ID" });
      }
      
      const success = await storage.deleteSubscription(req.user!.id, subredditId);
      if (!success) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.status(200).json({ message: "Unsubscribed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unsubscribe" });
    }
  });
  
  // Post routes
  app.get("/api/posts", async (req, res) => {
    try {
      let subredditId: number | undefined;
      
      if (req.query.subreddit) {
        const subreddit = await storage.getSubredditByName(req.query.subreddit as string);
        if (!subreddit) {
          return res.status(404).json({ message: "Subreddit not found" });
        }
        subredditId = subreddit.id;
      }
      
      const posts = await storage.getPosts(subredditId);
      
      // Enhance posts with author, subreddit, tags, and comments count
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const author = await storage.getUser(post.userId);
        const subreddit = await storage.getSubreddit(post.subredditId);
        const comments = await storage.getCommentsByPost(post.id);
        const postTagRefs = await storage.getPostTags(post.id);
        
        const tags = await Promise.all(
          postTagRefs.map(async (pt) => await storage.getTag(pt.tagId))
        );
        
        let userVote = null;
        if (req.isAuthenticated()) {
          const vote = await storage.getVote(req.user!.id, post.id);
          userVote = vote ? vote.voteType : null;
        }
        
        return {
          ...post,
          author: author ? { username: author.username } : { username: "deleted" },
          subreddit: subreddit ? { name: subreddit.name } : { name: "unknown" },
          commentCount: comments.length,
          tags: tags.filter(Boolean),
          userVote
        };
      }));
      
      res.json(enhancedPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get posts" });
    }
  });
  
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const author = await storage.getUser(post.userId);
      const subreddit = await storage.getSubreddit(post.subredditId);
      const postTagRefs = await storage.getPostTags(post.id);
      
      const tags = await Promise.all(
        postTagRefs.map(async (pt) => await storage.getTag(pt.tagId))
      );
      
      let userVote = null;
      if (req.isAuthenticated()) {
        const vote = await storage.getVote(req.user!.id, post.id);
        userVote = vote ? vote.voteType : null;
      }
      
      const comments = await storage.getCommentsByPost(post.id);
      
      res.json({
        ...post,
        author: author ? { username: author.username } : { username: "deleted" },
        subreddit: subreddit ? { name: subreddit.name } : { name: "unknown" },
        tags: tags.filter(Boolean),
        userVote,
        commentCount: comments.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get post" });
    }
  });
  
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { tagsString, ...postData } = req.body;
      const validatedData = insertPostSchema.parse(postData);
      
      const post = await storage.createPost({
        ...validatedData,
        userId: req.user!.id
      });
      
      // Process tags
      const tags = await parseAndCreateTags(tagsString);
      
      // Associate tags with post
      for (const tag of tags) {
        await storage.createPostTag({
          postId: post.id,
          tagId: tag.id
        });
      }
      
      res.status(201).json({
        ...post,
        tags
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid post data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  app.put("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to edit this post" });
      }
      
      const { tagsString, ...updateData } = req.body;
      const updatedPost = await storage.updatePost(postId, updateData);
      
      // If tags were updated
      if (tagsString !== undefined) {
        // Remove existing tags
        const existingPostTags = await storage.getPostTags(postId);
        for (const pt of existingPostTags) {
          await storage.deletePostTag(postId, pt.tagId);
        }
        
        // Add new tags
        const tags = await parseAndCreateTags(tagsString);
        for (const tag of tags) {
          await storage.createPostTag({
            postId,
            tagId: tag.id
          });
        }
        
        return res.json({
          ...updatedPost,
          tags
        });
      }
      
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid post data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update post" });
    }
  });
  
  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      const success = await storage.deletePost(postId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete post" });
      }
      
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });
  
  // Comment routes
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const comments = await storage.getCommentsByPost(postId);
      
      // Enhance comments with author and vote info
      const enhancedComments = await Promise.all(comments.map(async (comment) => {
        const author = await storage.getUser(comment.userId);
        
        let userVote = null;
        if (req.isAuthenticated()) {
          const vote = await storage.getVote(req.user!.id, undefined, comment.id);
          userVote = vote ? vote.voteType : null;
        }
        
        return {
          ...comment,
          author: author ? { username: author.username } : { username: "deleted" },
          userVote
        };
      }));
      
      // Build a tree structure for nested comments
      const commentMap = new Map();
      const rootComments = [];
      
      enhancedComments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });
      
      enhancedComments.forEach(comment => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(commentMap.get(comment.id));
          } else {
            rootComments.push(commentMap.get(comment.id));
          }
        } else {
          rootComments.push(commentMap.get(comment.id));
        }
      });
      
      res.json(rootComments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get comments" });
    }
  });
  
  app.post("/api/posts/:postId/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const data = insertCommentSchema.parse({
        ...req.body,
        postId
      });
      
      const comment = await storage.createComment({
        ...data,
        userId: req.user!.id
      });
      
      const author = await storage.getUser(req.user!.id);
      
      // Check if user earned any badges
      await checkAndAwardBadges(req.user!.id);
      
      res.status(201).json({
        ...comment,
        author: { username: author!.username },
        userVote: null,
        replies: []
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid comment data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });
  
  app.put("/api/comments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }
      
      const comment = await storage.getComment(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      if (comment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to edit this comment" });
      }
      
      const updatedComment = await storage.updateComment(commentId, req.body.content);
      
      res.json(updatedComment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update comment" });
    }
  });
  
  app.delete("/api/comments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }
      
      const comment = await storage.getComment(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      if (comment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      
      const success = await storage.deleteComment(commentId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete comment" });
      }
      
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });
  
  // Vote routes
  app.post("/api/votes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const data = insertVoteSchema.parse(req.body);
      
      // Ensure either postId or commentId is provided, but not both
      if ((!data.postId && !data.commentId) || (data.postId && data.commentId)) {
        return res.status(400).json({ 
          message: "Must provide either postId or commentId, but not both" 
        });
      }
      
      // If voting on a post, check if it exists
      if (data.postId) {
        const post = await storage.getPost(data.postId);
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }
        
        // Update the post score
        const existingVote = await storage.getVote(req.user!.id, data.postId);
        const scoreDelta = existingVote 
          ? data.voteType - existingVote.voteType 
          : data.voteType;
        
        await storage.updatePost(data.postId, { 
          score: post.score + scoreDelta 
        });
        
        // Update post author's karma
        const author = await storage.getUser(post.userId);
        if (author) {
          await storage.updateUserKarma(author.id, author.karma + scoreDelta);
          
          // Check if author earned any badges
          await checkAndAwardBadges(author.id);
        }
      }
      
      // If voting on a comment, check if it exists
      if (data.commentId) {
        const comment = await storage.getComment(data.commentId);
        if (!comment) {
          return res.status(404).json({ message: "Comment not found" });
        }
        
        // Update the comment score
        const existingVote = await storage.getVote(req.user!.id, undefined, data.commentId);
        const scoreDelta = existingVote 
          ? data.voteType - existingVote.voteType 
          : data.voteType;
        
        // Mock update since there's no direct method
        const updatedComment = { ...comment, score: comment.score + scoreDelta };
        await storage.updateComment(data.commentId, updatedComment.content);
        
        // Update comment author's karma
        const author = await storage.getUser(comment.userId);
        if (author) {
          await storage.updateUserKarma(author.id, author.karma + scoreDelta);
          
          // Check if author earned any badges
          await checkAndAwardBadges(author.id);
        }
      }
      
      const vote = await storage.createOrUpdateVote({
        ...data,
        userId: req.user!.id
      });
      
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid vote data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to record vote" });
    }
  });
  
  // Tag routes
  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tags" });
    }
  });
  
  app.post("/api/tags", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const data = insertTagSchema.parse(req.body);
      
      // Check if tag already exists
      const existingTag = await storage.getTagByName(data.name);
      if (existingTag) {
        return res.json(existingTag); // Return existing tag instead of error
      }
      
      const tag = await storage.createTag(data);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid tag data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create tag" });
    }
  });
  
  // User profile and badges routes
  app.get("/api/users/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't expose password
      const { password, ...userWithoutPassword } = user;
      
      // Get user's badges
      const userBadges = await storage.getUserBadges(user.id);
      const badgeTypes = await storage.getBadgeTypes();
      
      // Combine badge info
      const badges = await Promise.all(userBadges.map(async (userBadge) => {
        const badgeType = badgeTypes.find(bt => bt.id === userBadge.badgeTypeId);
        return {
          ...userBadge,
          badgeType
        };
      }));
      
      // Get user posts and comments
      const posts = await storage.getPostsByUser(user.id);
      const comments = await storage.getCommentsByUser(user.id);
      
      // Enhanced posts with subreddit names
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const subreddit = await storage.getSubreddit(post.subredditId);
        const postTagRefs = await storage.getPostTags(post.id);
        const tags = await Promise.all(
          postTagRefs.map(async (pt) => await storage.getTag(pt.tagId))
        );
        
        return {
          ...post,
          subreddit: subreddit ? { name: subreddit.name } : { name: "unknown" },
          tags: tags.filter(Boolean)
        };
      }));
      
      res.json({
        ...userWithoutPassword,
        badges,
        posts: enhancedPosts,
        comments
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });
  
  app.get("/api/users/:username/badges", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userBadges = await storage.getUserBadges(user.id);
      const badgeTypes = await storage.getBadgeTypes();
      
      // Combine badge info
      const badges = await Promise.all(userBadges.map(async (userBadge) => {
        const badgeType = badgeTypes.find(bt => bt.id === userBadge.badgeTypeId);
        return {
          ...userBadge,
          badgeType
        };
      }));
      
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user badges" });
    }
  });
  
  // Badge types route (for reference on the frontend)
  app.get("/api/badge-types", async (req, res) => {
    try {
      const badgeTypes = await storage.getBadgeTypes();
      res.json(badgeTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get badge types" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
