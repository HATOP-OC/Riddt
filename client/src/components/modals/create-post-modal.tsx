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
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    
    createPostMutation.mutate({
      title,
      content,
      subredditId: parseInt(selectedSubredditId),
      imageUrl: imageUrl || undefined,
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
            <Label htmlFor="image-url">Image URL (optional)</Label>
            <div className="flex space-x-2">
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                className="flex-shrink-0"
                disabled={!imageUrl}
                onClick={() => setImageUrl("")}
              >
                <Image className="h-4 w-4" />
              </Button>
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
