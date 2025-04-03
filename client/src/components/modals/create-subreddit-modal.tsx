import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CreateSubredditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSubredditModal({
  isOpen,
  onClose,
}: CreateSubredditModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("public");

  // Create subreddit mutation
  const createSubredditMutation = useMutation({
    mutationFn: async (subredditData: {
      name: string;
      description: string;
      type: string;
    }) => {
      const res = await apiRequest("POST", "/api/subreddits", subredditData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subreddits"] });
      
      toast({
        title: "Success",
        description: `r/${name} has been created successfully.`,
      });
      
      // Reset form and close modal
      resetForm();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create subreddit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setType("public");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your subreddit",
        variant: "destructive",
      });
      return;
    }
    
    // Validate name format (only letters, numbers, and underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      toast({
        title: "Invalid name format",
        description: "Subreddit names can only contain letters, numbers, and underscores",
        variant: "destructive",
      });
      return;
    }
    
    createSubredditMutation.mutate({
      name,
      description,
      type,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a community</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subreddit-name">Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">r/</span>
              </div>
              <Input
                id="subreddit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-7"
                placeholder="community_name"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Community names including capitalization cannot be changed.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="community-description">Description</Label>
            <Textarea
              id="community-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your community..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This is how users will see your community in search results.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Community type</Label>
            <RadioGroup value={type} onValueChange={setType}>
              <div className="flex items-start space-x-2 py-2">
                <RadioGroupItem value="public" id="community-public" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="community-public" className="font-medium text-sm">
                    Public
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Anyone can view, post, and comment
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2 py-2">
                <RadioGroupItem value="restricted" id="community-restricted" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="community-restricted" className="font-medium text-sm">
                    Restricted
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Anyone can view, but only approved users can post
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2 py-2">
                <RadioGroupItem value="private" id="community-private" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="community-private" className="font-medium text-sm">
                    Private
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Only approved users can view and post
                  </p>
                </div>
              </div>
            </RadioGroup>
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
            disabled={!name.trim() || createSubredditMutation.isPending}
          >
            {createSubredditMutation.isPending ? "Creating..." : "Create Community"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
