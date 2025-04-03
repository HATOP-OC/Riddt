import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { SubredditWithSubscription } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Image, Upload } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubredditName?: string;
}

export function CreatePostModal({
  isOpen,
  onClose,
  defaultSubredditName,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedSubredditId, setSelectedSubredditId] = useState<string>("");
  const [tagsString, setTagsString] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Fetch subreddits
  const { data: subreddits, isLoading: isLoadingSubreddits } = useQuery<SubredditWithSubscription[]>({
    queryKey: ["/api/subreddits"],
    enabled: isOpen && !!user,
  });

  // Set default subreddit when modal opens
  useEffect(() => {
    if (isOpen && defaultSubredditName && subreddits) {
      const subreddit = subreddits.find(
        (sr) => sr.name.toLowerCase() === defaultSubredditName.toLowerCase()
      );
      if (subreddit) {
        setSelectedSubredditId(String(subreddit.id));
      }
    }
  }, [isOpen, defaultSubredditName, subreddits]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      title: string;
      content: string;
      subredditId: number;
      imageUrl?: string;
      tagsString: string;
    }) => {
      const res = await apiRequest("POST", "/api/posts", postData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      if (selectedSubredditId) {
        const subreddit = subreddits?.find(sr => sr.id === parseInt(selectedSubredditId));
        if (subreddit) {
          queryClient.invalidateQueries({ queryKey: [`/api/posts?subreddit=${subreddit.name}`] });
        }
      }
      
      toast({
        title: "Success",
        description: "Your post has been created",
      });
      
      // Reset form and close modal
      resetForm();
      onClose();
      
      // Navigate to the new post
      navigate(`/post/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedSubredditId("");
    setTagsString("");
    setImageUrl("");
    setImageFile(null);
    setPreviewUrl("");
  };
  
  // Handle image file selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear any existing image URL
      setImageUrl("");
    }
  };
  
  // Convert image file to base64 for sending to server
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your post",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedSubredditId) {
      toast({
        title: "Subreddit required",
        description: "Please select a subreddit for your post",
        variant: "destructive",
      });
      return;
    }
    
    // Handle image file if present
    let finalImageUrl = imageUrl;
    if (imageFile) {
      try {
        // Convert to base64 and use as imageUrl
        finalImageUrl = await getBase64(imageFile);
      } catch (error) {
        toast({
          title: "Image processing failed",
          description: "Failed to process image file",
          variant: "destructive",
        });
        return;
      }
    }
    
    createPostMutation.mutate({
      title,
      content,
      subredditId: parseInt(selectedSubredditId),
      imageUrl: finalImageUrl || undefined,
      tagsString,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subreddit">Choose a community</Label>
            <Select 
              value={selectedSubredditId} 
              onValueChange={setSelectedSubredditId}
              disabled={isLoadingSubreddits}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subreddit" />
              </SelectTrigger>
              <SelectContent>
                {subreddits?.map((subreddit) => (
                  <SelectItem key={subreddit.id} value={String(subreddit.id)}>
                    r/{subreddit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="post-tags">Tags (separate with commas)</Label>
            <Input
              id="post-tags"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="e.g., technology, news, discussion"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="post-content">Content</Label>
            <Textarea
              id="post-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Text (optional)"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Add Image</Label>
            <div className="flex flex-col gap-3">
              {/* Image from URL */}
              <div className="flex items-center space-x-2">
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    // Clear any file uploads when using URL
                    if (e.target.value) {
                      setImageFile(null);
                      setPreviewUrl("");
                    }
                  }}
                  placeholder="Image URL (https://example.com/image.jpg)"
                  disabled={!!imageFile}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  className="flex-shrink-0"
                  disabled={!imageUrl}
                  onClick={() => setImageUrl("")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
              
              {/* Image upload */}
              <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">OR</div>
                <div className="flex items-center">
                  <div className="relative">
                    <Input
                      id="image-file"
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 w-full cursor-pointer z-10"
                      onChange={handleImageFileChange}
                      disabled={!!imageUrl}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={!!imageUrl}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                  
                  {imageFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => {
                        setImageFile(null);
                        setPreviewUrl("");
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Image preview */}
              {previewUrl && (
                <div className="mt-2 border rounded-md overflow-hidden relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-40 w-auto mx-auto object-contain"
                  />
                  <p className="text-xs text-center text-gray-500 p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                    Image preview
                  </p>
                </div>
              )}
              {imageUrl && (
                <div className="mt-2 border rounded-md overflow-hidden relative">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-40 w-auto mx-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='150' viewBox='0 0 280 150'%3E%3Crect fill='%23f0f0f0' width='280' height='150'/%3E%3Ctext fill='rgba(0,0,0,0.5)' font-family='sans-serif' font-size='15' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EInvalid image URL%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <p className="text-xs text-center text-gray-500 p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                    Image preview from URL
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!title.trim() || !selectedSubredditId || createPostMutation.isPending}
          >
            {createPostMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
