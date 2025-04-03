import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { ThumbsUp, Users, Tag, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Extend the user schema with validation rules
const authSchema = insertUserSchema.extend({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Get redirect path from URL if it exists
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const redirectPath = searchParams.get("redirect") || "/";

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  // Login form
  const loginForm = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (values: z.infer<typeof authSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof authSchema>) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-primary">Riddit</span>
            </div>
            <CardTitle className="text-2xl">Welcome to Riddit</CardTitle>
            <CardDescription>
              Join the community to post, comment, and vote on content.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              defaultValue={authMode}
              onValueChange={(v) => setAuthMode(v as "login" | "register")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
            {authMode === "login" ? (
              <p>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => setAuthMode("register")}
                >
                  Register
                </Button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </Button>
              </p>
            )}
          </CardFooter>
        </Card>

        {/* Hero section */}
        <div className="hidden md:flex md:col-span-1 flex-col justify-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Join the conversation on Riddit
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover communities, share content, and connect with people who share your interests.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="mr-4 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Upvote & Downvote</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Help quality content rise to the top
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Communities</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Join subreddits on topics you care about
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Post Tagging</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add tags to organize and filter content
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Achievement Badges</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Earn badges as you participate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
