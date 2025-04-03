import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { PostWithVote } from "@shared/schema";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { CreatePostModal } from "@/components/modals/create-post-modal";
import { CreateSubredditModal } from "@/components/modals/create-subreddit-modal";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Award, Star, TrendingUp, MessageSquare } from "lucide-react";

export default function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [createSubredditModalOpen, setCreateSubredditModalOpen] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/users/${username}`],
    enabled: !!username,
  });

  // Check if this is the current user's profile
  const isOwnProfile = user && user.username === username;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        openCreatePostModal={() => setCreatePostModalOpen(true)}
      />

      <main className="flex-1 lg:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row">
            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
              openCreateSubredditModal={() => setCreateSubredditModalOpen(true)}
            />

            <div className="lg:flex-1 max-w-3xl w-full">
              {isLoading ? (
                <div className="space-y-4">
                  <Card className="animate-pulse">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : profile ? (
                <div className="space-y-6">
                  {/* User Profile Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-xl">
                          {profile.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">u/{profile.username}</CardTitle>
                        <div className="flex items-center mt-1 space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <CalendarClock className="h-4 w-4" />
                          <span>
                            Account created {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 space-x-2 text-sm">
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3" />
                            <span>{profile.karma} karma</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Achievement Badges */}
                  {profile.badges && profile.badges.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Achievement Badges
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {profile.badges.map((badge: any) => (
                            <div key={badge.id} className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                                {badge.badgeType.icon === 'bolt' && <TrendingUp className="h-5 w-5" />}
                                {badge.badgeType.icon === 'chat-bubble-left' && <MessageSquare className="h-5 w-5" />}
                                {badge.badgeType.icon === 'sparkles' && <Star className="h-5 w-5" />}
                                {badge.badgeType.icon === 'shield-check' && <Award className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{badge.badgeType.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {badge.badgeType.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Achievement Badges
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <p>No badges earned yet. Keep participating to earn badges!</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Posts and Comments tabs */}
                  <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
                      <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="posts" className="mt-4 space-y-4">
                      {profile.posts && profile.posts.length > 0 ? (
                        profile.posts.map((post: PostWithVote) => (
                          <PostCard key={post.id} post={post} />
                        ))
                      ) : (
                        <Card className="p-6 text-center">
                          <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {isOwnProfile ? "You haven't created any posts yet." : `u/${profile.username} hasn't created any posts yet.`}
                          </p>
                          {isOwnProfile && (
                            <Button onClick={() => setCreatePostModalOpen(true)}>
                              Create your first post
                            </Button>
                          )}
                        </Card>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="comments" className="mt-4">
                      {profile.comments && profile.comments.length > 0 ? (
                        <Card className="divide-y divide-gray-200 dark:divide-gray-700">
                          {profile.comments.map((comment: any) => (
                            <div key={comment.id} className="p-4">
                              <div className="flex items-center space-x-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>Commented on a post</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                              </div>
                              <p className="text-sm mb-2">{comment.content}</p>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 h-auto"
                                onClick={() => window.location.href = `/post/${comment.postId}`}
                              >
                                View post
                              </Button>
                            </div>
                          ))}
                        </Card>
                      ) : (
                        <Card className="p-6 text-center">
                          <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            {isOwnProfile ? "You haven't made any comments yet." : `u/${profile.username} hasn't made any comments yet.`}
                          </p>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <h2 className="text-lg font-medium mb-2">User not found</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    The user you're looking for doesn't exist.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreatePostModal 
        isOpen={createPostModalOpen} 
        onClose={() => setCreatePostModalOpen(false)} 
      />
      <CreateSubredditModal 
        isOpen={createSubredditModalOpen} 
        onClose={() => setCreateSubredditModalOpen(false)} 
      />
    </div>
  );
}
